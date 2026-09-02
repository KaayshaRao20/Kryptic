import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Float, JSON
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class TwinTopology(Base):
    __tablename__ = "twin_topologies"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    version = Column(String(50), default="1.0.0")
    description = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    payment_system = relationship("PaymentSystem", back_populates="topologies")
    nodes = relationship("TwinNode", back_populates="topology", cascade="all, delete-orphan")
    edges = relationship("TwinEdge", back_populates="topology", cascade="all, delete-orphan")


class TwinNode(Base):
    __tablename__ = "twin_nodes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    topology_id = Column(String(36), ForeignKey("twin_topologies.id", ondelete="CASCADE"), nullable=False)
    node_key = Column(String(100), nullable=False, index=True)  # e.g., 'entry_point', 'auth_engine', 'risk_engine'
    name = Column(String(255), nullable=False)
    layer = Column(String(100), nullable=False)  # ENTRY, AUTHENTICATION, RISK_ENGINE, ROUTER, PROCESSOR, AUTHORIZATION, SETTLEMENT
    node_type = Column(String(100), default="service")  # service, gateway, database, queue, third_party
    status = Column(String(50), default="healthy")  # healthy, degraded, anomalous, compromised, offline
    tps = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    latency_ms = Column(Float, default=15.0)
    risk_level = Column(String(50), default="LOW")  # LOW, MEDIUM, HIGH, CRITICAL
    position_x = Column(Float, default=0.0)
    position_y = Column(Float, default=0.0)
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    topology = relationship("TwinTopology", back_populates="nodes")
    outgoing_edges = relationship("TwinEdge", foreign_keys="TwinEdge.source_node_id", back_populates="source_node", cascade="all, delete-orphan")
    incoming_edges = relationship("TwinEdge", foreign_keys="TwinEdge.target_node_id", back_populates="target_node", cascade="all, delete-orphan")


class TwinEdge(Base):
    __tablename__ = "twin_edges"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    topology_id = Column(String(36), ForeignKey("twin_topologies.id", ondelete="CASCADE"), nullable=False)
    source_node_id = Column(String(36), ForeignKey("twin_nodes.id", ondelete="CASCADE"), nullable=False)
    target_node_id = Column(String(36), ForeignKey("twin_nodes.id", ondelete="CASCADE"), nullable=False)
    edge_type = Column(String(50), default="data_flow")  # data_flow, fallback, auth_verification, settlement_rail
    latency_ms = Column(Float, default=5.0)
    weight = Column(Float, default=1.0)
    status = Column(String(50), default="active")  # active, throttled, blocked
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    topology = relationship("TwinTopology", back_populates="edges")
    source_node = relationship("TwinNode", foreign_keys=[source_node_id], back_populates="outgoing_edges")
    target_node = relationship("TwinNode", foreign_keys=[target_node_id], back_populates="incoming_edges")
