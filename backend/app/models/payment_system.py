import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class PaymentSystem(Base):
    __tablename__ = "payment_systems"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(100), nullable=False, index=True)
    system_type = Column(String(100), default="card_gateway")  # card_gateway, ach_processor, instant_payout, crypto_rail
    status = Column(String(50), default="active")  # active, degraded, under_attack, maintenance
    description = Column(String(500), nullable=True)
    config_json = Column(JSON, default=dict)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="payment_systems")
    topologies = relationship("TwinTopology", back_populates="payment_system", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="payment_system")
    outgoing_connections = relationship(
        "SystemConnection",
        foreign_keys="SystemConnection.source_system_id",
        back_populates="source_system",
        cascade="all, delete-orphan"
    )
    incoming_connections = relationship(
        "SystemConnection",
        foreign_keys="SystemConnection.target_system_id",
        back_populates="target_system",
        cascade="all, delete-orphan"
    )


class SystemConnection(Base):
    __tablename__ = "system_connections"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="CASCADE"), nullable=False)
    target_system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="CASCADE"), nullable=False)
    connection_type = Column(String(50), default="sync_api")  # sync_api, async_queue, event_stream, batch
    latency_ms = Column(Integer, default=25)
    bandwidth_tps = Column(Integer, default=500)
    status = Column(String(50), default="healthy")  # healthy, degraded, severed
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    source_system = relationship("PaymentSystem", foreign_keys=[source_system_id], back_populates="outgoing_connections")
    target_system = relationship("PaymentSystem", foreign_keys=[target_system_id], back_populates="incoming_connections")
