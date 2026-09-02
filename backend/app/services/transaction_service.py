import random
import string
import uuid
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.models.transaction import Transaction, EntityProfile
from app.schemas.transaction import TransactionCreate, TransactionStats


class TransactionService:
    @staticmethod
    def generate_tx_id(prefix: str = "TX") -> str:
        rand_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        return f"{prefix}_{rand_str}"

    @classmethod
    def create_transaction(cls, db: Session, tx_in: TransactionCreate) -> Transaction:
        tx_id = tx_in.transaction_id or cls.generate_tx_id()
        db_tx = Transaction(
            transaction_id=tx_id,
            system_id=tx_in.system_id,
            entity_id=tx_in.entity_id,
            amount=tx_in.amount,
            currency=tx_in.currency,
            transaction_type=tx_in.transaction_type,
            device_id=tx_in.device_id,
            ip_address=tx_in.ip_address,
            card_bin=tx_in.card_bin,
            status=tx_in.status,
            is_fraud_ground_truth=tx_in.is_fraud_ground_truth,
            metadata_json=tx_in.metadata_json or {}
        )
        db.add(db_tx)
        
        # Update or create entity profile
        entity = db.query(EntityProfile).filter(EntityProfile.entity_id == tx_in.entity_id).first()
        if not entity:
            entity = EntityProfile(
                entity_id=tx_in.entity_id,
                total_transactions=1,
                total_amount=tx_in.amount,
                last_device_id=tx_in.device_id,
                last_ip_address=tx_in.ip_address,
                velocity_1h=1,
                velocity_24h=1
            )
            db.add(entity)
        else:
            entity.total_transactions += 1
            entity.total_amount += tx_in.amount
            entity.velocity_1h += 1
            entity.velocity_24h += 1
            entity.last_device_id = tx_in.device_id or entity.last_device_id
            entity.last_ip_address = tx_in.ip_address or entity.last_ip_address
            entity.last_seen_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(db_tx)
        return db_tx

    @staticmethod
    def get_transaction(db: Session, transaction_id: str) -> Optional[Transaction]:
        return db.query(Transaction).filter(
            (Transaction.transaction_id == transaction_id) | (Transaction.id == transaction_id)
        ).first()

    @staticmethod
    def list_transactions(
        db: Session,
        system_id: Optional[str] = None,
        entity_id: Optional[str] = None,
        status: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[Transaction], int]:
        query = db.query(Transaction)
        if system_id:
            query = query.filter(Transaction.system_id == system_id)
        if entity_id:
            query = query.filter(Transaction.entity_id == entity_id)
        if status:
            query = query.filter(Transaction.status == status)

        total = query.count()
        results = query.order_by(desc(Transaction.created_at)).offset(offset).limit(limit).all()
        return results, total

    @staticmethod
    def get_statistics(db: Session, system_id: Optional[str] = None) -> TransactionStats:
        query = db.query(Transaction)
        if system_id:
            query = query.filter(Transaction.system_id == system_id)

        total_tx = query.count()
        if total_tx == 0:
            return TransactionStats(
                total_transactions=0,
                total_volume=0.0,
                avg_transaction_amount=0.0,
                fraud_flagged_count=0,
                fraud_rate_pct=0.0,
                volume_by_currency={"USD": 0.0},
                recent_velocity_tps=0.0
            )

        total_vol = db.query(func.sum(Transaction.amount)).filter(
            Transaction.system_id == system_id if system_id else True
        ).scalar() or 0.0

        fraud_count = query.filter(
            (Transaction.status.in_(["FLAGGED", "BLOCKED", "DECLINED"])) | (Transaction.is_fraud_ground_truth == 1)
        ).count()

        avg_amount = round(total_vol / total_tx, 2)
        fraud_rate = round((fraud_count / total_tx) * 100.0, 2)

        return TransactionStats(
            total_transactions=total_tx,
            total_volume=round(total_vol, 2),
            avg_transaction_amount=avg_amount,
            fraud_flagged_count=fraud_count,
            fraud_rate_pct=fraud_rate,
            volume_by_currency={"USD": round(total_vol, 2)},
            recent_velocity_tps=round(min(50.0, max(1.0, total_tx / 60.0)), 2)
        )

    @classmethod
    def generate_dummy_transactions(
        cls,
        db: Session,
        count: int = 10,
        system_id: Optional[str] = None,
        fraud_ratio: float = 0.2
    ) -> List[Transaction]:
        """Generates realistic synthetic transactions with configurable fraud patterns."""
        created_txs = []
        currencies = ["USD", "EUR", "GBP"]
        tx_types = ["PAYMENT", "PAYMENT", "PAYMENT", "TRANSFER", "WITHDRAWAL"]
        device_pool = [f"dev_{uuid.uuid4().hex[:8]}" for _ in range(8)]
        entity_pool = [f"ent_user_{1000 + i}" for i in range(12)]

        for i in range(count):
            is_fraud = random.random() < fraud_ratio
            entity_id = random.choice(entity_pool)
            device_id = random.choice(device_pool)
            tx_type = "WITHDRAWAL" if is_fraud and random.random() < 0.5 else random.choice(tx_types)
            
            if is_fraud:
                # Suspicious indicators
                amount = round(random.choice([random.uniform(1500, 9500), random.uniform(99.99, 499.99)]), 2)
                ip_addr = f"185.220.{random.randint(100, 255)}.{random.randint(1, 254)}"  # TOR/VPN subnet simulation
                meta = {
                    "is_injected_fraud": True,
                    "vpn_detected": True,
                    "velocity_1h": random.randint(5, 15),
                    "ip_country_mismatch": True,
                    "risk_vector": "credential_stuffing_burst"
                }
                status = "FLAGGED"
                ground_truth = 1
            else:
                amount = round(random.uniform(12.50, 480.00), 2)
                ip_addr = f"192.0.{random.randint(1, 10)}.{random.randint(1, 254)}"
                meta = {
                    "is_injected_fraud": False,
                    "device_trust_score": 0.95,
                    "velocity_1h": random.randint(1, 2)
                }
                status = "PROCESSED"
                ground_truth = 0

            tx_in = TransactionCreate(
                transaction_id=cls.generate_tx_id("TX_SYNTH"),
                system_id=system_id,
                entity_id=entity_id,
                amount=amount,
                currency=random.choice(currencies),
                transaction_type=tx_type,
                device_id=device_id,
                ip_address=ip_addr,
                card_bin=f"4{random.randint(10000, 99999)}",
                status=status,
                is_fraud_ground_truth=ground_truth,
                metadata_json=meta
            )
            created_txs.append(cls.create_transaction(db, tx_in))

        return created_txs


transaction_service = TransactionService()
