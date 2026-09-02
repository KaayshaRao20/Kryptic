import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Integer, JSON, Index
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(100), unique=True, nullable=False, index=True)
    system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="SET NULL"), nullable=True, index=True)
    entity_id = Column(String(100), nullable=False, index=True)  # user/cardholder/merchant entity
    amount = Column(Float, nullable=False)
    currency = Column(String(10), default="USD")
    transaction_type = Column(String(50), default="PAYMENT")  # PAYMENT, TRANSFER, WITHDRAWAL, REFUND, CHARGEBACK
    device_id = Column(String(100), nullable=True, index=True)
    ip_address = Column(String(100), nullable=True)
    card_bin = Column(String(10), nullable=True)
    status = Column(String(50), default="PROCESSED")  # PROCESSED, FLAGGED, BLOCKED, APPROVED, REJECTED
    is_fraud_ground_truth = Column(Integer, default=0)  # 0 or 1 for simulation & validation
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    payment_system = relationship("PaymentSystem", back_populates="transactions")
    prediction = relationship("Prediction", back_populates="transaction", uselist=False, cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_transactions_entity_created", "entity_id", "created_at"),
        Index("ix_transactions_system_created", "system_id", "created_at"),
    )


class EntityProfile(Base):
    __tablename__ = "entity_profiles"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    entity_id = Column(String(100), unique=True, nullable=False, index=True)
    risk_score = Column(Float, default=0.05)
    total_transactions = Column(Integer, default=0)
    total_amount = Column(Float, default=0.0)
    fraud_count = Column(Integer, default=0)
    velocity_1h = Column(Integer, default=0)
    velocity_24h = Column(Integer, default=0)
    last_device_id = Column(String(100), nullable=True)
    last_ip_address = Column(String(100), nullable=True)
    last_seen_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
