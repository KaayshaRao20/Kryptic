import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import random
from datetime import datetime, timezone, timedelta
from app.database import SessionLocal, init_db
from app.models.user import Organization, User
from app.models.payment_system import PaymentSystem, SystemConnection
from app.models.twin import TwinTopology, TwinNode, TwinEdge
from app.models.transaction import Transaction, EntityProfile
from app.models.risk import Prediction, RiskEvent, Explanation
from app.services.auth_service import auth_service


def seed():
    print("Initializing database tables...")
    init_db()
    db = SessionLocal()

    try:
        # 1. Seed Demo Organization
        org = db.query(Organization).filter(Organization.slug == "apex-merchants").first()
        if not org:
            print("Seeding Demo Organization: Apex Global Merchants...")
            org = Organization(
                name="Apex Global Merchants",
                slug="apex-merchants",
                tier="enterprise",
                config_json={
                    "risk_threshold": 0.50,
                    "default_currency": "USD",
                    "region": "GLOBAL"
                }
            )
            db.add(org)
            db.commit()
            db.refresh(org)

        # 2. Seed Default Users
        admin_user = db.query(User).filter(User.email == "admin@kryptic.io").first()
        if not admin_user:
            print("Seeding Users: admin@kryptic.io, analyst@kryptic.io...")
            admin_user = User(
                organization_id=org.id,
                email="admin@kryptic.io",
                hashed_password=auth_service.get_password_hash("kryptic2026!"),
                full_name="Chief Risk Officer",
                role="admin",
                is_active=True
            )
            analyst_user = User(
                organization_id=org.id,
                email="analyst@kryptic.io",
                hashed_password=auth_service.get_password_hash("kryptic2026!"),
                full_name="Lead Fraud Analyst",
                role="analyst",
                is_active=True
            )
            db.add_all([admin_user, analyst_user])
            db.commit()

        # 3. Seed Multiple Payment Systems (Ring)
        sys1 = db.query(PaymentSystem).filter(PaymentSystem.code == "card-checkout-primary").first()
        if not sys1:
            print("Seeding Payment Systems: Card Primary, ACH Gateway, Crypto Rail...")
            sys1 = PaymentSystem(
                organization_id=org.id,
                name="Card Checkout Primary",
                code="card-checkout-primary",
                system_type="card_gateway",
                status="active",
                description="Core credit and debit card acquiring and authorization pipeline."
            )
            sys2 = PaymentSystem(
                organization_id=org.id,
                name="Instant ACH Gateway",
                code="instant-ach-gateway",
                system_type="ach_processor",
                status="active",
                description="Direct bank account automated clearing house settlement rail."
            )
            sys3 = PaymentSystem(
                organization_id=org.id,
                name="Crypto Liquidity Rail",
                code="crypto-liquidity-rail",
                system_type="crypto_rail",
                status="active",
                description="Instant stablecoin on-ramp and off-ramp liquidity pipeline."
            )
            db.add_all([sys1, sys2, sys3])
            db.commit()
            db.refresh(sys1)
            db.refresh(sys2)
            db.refresh(sys3)

            # Seed System Connections
            conn1 = SystemConnection(
                source_system_id=sys1.id,
                target_system_id=sys2.id,
                connection_type="fallback_routing",
                latency_ms=18,
                bandwidth_tps=600,
                status="healthy"
            )
            conn2 = SystemConnection(
                source_system_id=sys1.id,
                target_system_id=sys3.id,
                connection_type="cross_rail_bridge",
                latency_ms=45,
                bandwidth_tps=300,
                status="healthy"
            )
            db.add_all([conn1, conn2])
            db.commit()

        # 4. Seed Digital Twin Topologies
        topo = db.query(TwinTopology).filter(TwinTopology.system_id == sys1.id).first()
        if not topo:
            print("Seeding Digital Twin Topology for Card Checkout Primary...")
            topo = TwinTopology(
                system_id=sys1.id,
                name="Primary Card Flow Topology",
                version="1.0.0",
                description="Enterprise merchant 7-stage digital twin graph."
            )
            db.add(topo)
            db.commit()
            db.refresh(topo)

            nodes_spec = [
                ("entry_gateway", "API Entry Gateway", "ENTRY", "gateway", 100.0, 200.0, 15.0, 5.0),
                ("auth_service", "Auth & Tokenization", "AUTHENTICATION", "service", 300.0, 200.0, 15.0, 12.0),
                ("risk_engine", "KRYPTIC Risk Engine", "RISK_ENGINE", "service", 500.0, 200.0, 15.0, 18.0),
                ("smart_router", "Smart Payment Router", "ROUTER", "service", 700.0, 200.0, 15.0, 8.0),
                ("card_processor", "Acquiring Processor", "PROCESSOR", "service", 900.0, 200.0, 15.0, 45.0),
                ("issuer_auth", "Card Scheme & Issuer", "AUTHORIZATION", "third_party", 1100.0, 200.0, 15.0, 60.0),
                ("settlement_ledger", "Settlement & Clearing", "SETTLEMENT", "database", 1300.0, 200.0, 15.0, 25.0),
            ]

            node_map = {}
            for k, n, l, t, x, y, tps, lat in nodes_spec:
                node = TwinNode(
                    topology_id=topo.id,
                    node_key=k,
                    name=n,
                    layer=l,
                    node_type=t,
                    status="healthy",
                    tps=tps,
                    error_rate=0.005,
                    latency_ms=lat,
                    risk_level="LOW",
                    position_x=x,
                    position_y=y
                )
                db.add(node)
                db.flush()
                node_map[k] = node

            edge_pairs = [
                ("entry_gateway", "auth_service"),
                ("auth_service", "risk_engine"),
                ("risk_engine", "smart_router"),
                ("smart_router", "card_processor"),
                ("card_processor", "issuer_auth"),
                ("issuer_auth", "settlement_ledger"),
            ]

            for s, tgt in edge_pairs:
                edge = TwinEdge(
                    topology_id=topo.id,
                    source_node_id=node_map[s].id,
                    target_node_id=node_map[tgt].id,
                    edge_type="data_flow",
                    latency_ms=5.0,
                    weight=1.0,
                    status="active"
                )
                db.add(edge)
            db.commit()

        # 5. Seed Historical Realistic Transactions & Predictions
        tx_count = db.query(Transaction).count()
        if tx_count < 10:
            print("Seeding realistic sample transactions, predictions, explanations, and risk events...")
            entities = ["ent_us_901", "ent_us_902", "ent_us_903", "ent_fraud_999"]
            
            for i in range(15):
                is_fraud = (i % 4 == 0)
                ent = entities[3] if is_fraud else entities[i % 3]
                tx_id = f"TX_HIST_{1000 + i}"
                amount = round(random.uniform(2800, 8500) if is_fraud else random.uniform(25, 350), 2)
                status = "FLAGGED" if is_fraud else "PROCESSED"

                tx = Transaction(
                    transaction_id=tx_id,
                    system_id=sys1.id,
                    entity_id=ent,
                    amount=amount,
                    currency="USD",
                    transaction_type="WITHDRAWAL" if is_fraud else "PAYMENT",
                    device_id=f"dev_hist_{i}",
                    ip_address="185.220.101.5" if is_fraud else "64.233.160.1",
                    status=status,
                    is_fraud_ground_truth=1 if is_fraud else 0,
                    metadata_json={"is_injected_fraud": is_fraud, "velocity_1h": 8 if is_fraud else 1},
                    created_at=datetime.now(timezone.utc) - timedelta(minutes=random.randint(10, 500))
                )
                db.add(tx)
                db.flush()

                # Add Prediction
                prob = round(random.uniform(0.78, 0.96) if is_fraud else random.uniform(0.02, 0.15), 4)
                level = "HIGH" if prob > 0.6 else "LOW"
                pred = Prediction(
                    transaction_id=tx_id,
                    fraud_probability=prob,
                    risk_level=level,
                    model_version="v1.0.0-dummy-predictor",
                    inference_time_ms=random.uniform(1.1, 2.5),
                    risk_signals=[
                        {"name": "VELOCITY_SPIKE", "weight": 0.45, "description": "High request burst"}
                    ] if is_fraud else []
                )
                db.add(pred)
                db.flush()

                # Add Explanation
                exp = Explanation(
                    prediction_id=pred.id,
                    base_value=0.035,
                    model_version="v1.0.0-dummy-predictor",
                    feature_contributions=[
                        {"feature": "transaction_amount", "display_name": "Amount ($USD)", "value": f"${amount}", "contribution": 0.25 if is_fraud else -0.02, "impact_direction": "INCREASES_RISK" if is_fraud else "REDUCES_RISK", "description": "Amount impact"},
                        {"feature": "velocity_1h", "display_name": "Hourly Velocity", "value": "Burst" if is_fraud else "Normal", "contribution": 0.30 if is_fraud else -0.01, "impact_direction": "INCREASES_RISK" if is_fraud else "REDUCES_RISK", "description": "Hourly request rate"}
                    ],
                    risk_factors=[{"factor": "Burst Velocity", "impact": "HIGH", "detail": "Anomalous velocity detected"}] if is_fraud else [],
                    mitigation_actions=["Trigger Step-Up Multi-Factor Auth"] if is_fraud else ["Permit STP execution"]
                )
                db.add(exp)

                if is_fraud:
                    re = RiskEvent(
                        prediction_id=pred.id,
                        system_id=sys1.id,
                        affected_node_key="risk_engine",
                        event_type="FRAUD_ANOMALY",
                        severity="HIGH",
                        description=f"Transaction {tx_id} flagged with {round(prob*100, 1)}% risk score.",
                        status="ACTIVE"
                    )
                    db.add(re)

            db.commit()

        print("Database seeding completed successfully!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed()
