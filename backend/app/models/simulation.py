import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    organization_id = Column(String(36), ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="CASCADE"), nullable=True)
    scenario_type = Column(String(100), nullable=False)  # FRAUD_SPIKE, HIGH_VELOCITY, COORDINATED_ATTACK, BEHAVIORAL_ANOMALY, CUSTOM
    status = Column(String(50), default="IDLE")  # IDLE, PREPARING, RUNNING, PAUSED, COMPLETED, FAILED
    total_events = Column(Integer, default=50)
    current_step = Column(Integer, default=0)
    tps = Column(Float, default=5.0)
    fraud_injection_rate = Column(Float, default=0.3)
    config_json = Column(JSON, default=dict)
    error_message = Column(String(500), nullable=True)
    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    organization = relationship("Organization", back_populates="simulations")
    events = relationship("SimulationEvent", back_populates="simulation", cascade="all, delete-orphan")
    evaluation = relationship("EvaluationResult", back_populates="simulation", uselist=False, cascade="all, delete-orphan")


class SimulationEvent(Base):
    __tablename__ = "simulation_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, index=True)
    step = Column(Integer, nullable=False)
    event_type = Column(String(100), nullable=False)  # TRANSACTION, RISK_SIGNAL, ATTACK_WAVE, NODE_DEGRADATION
    transaction_id = Column(String(100), nullable=True)
    is_injected_fraud = Column(Boolean, default=False)
    is_detected = Column(Boolean, default=False)
    predicted_risk_level = Column(String(50), nullable=True)
    fraud_probability = Column(Float, default=0.0)
    latency_ms = Column(Float, default=10.0)
    payload_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    simulation = relationship("Simulation", back_populates="events")


class EvaluationResult(Base):
    __tablename__ = "evaluation_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    simulation_id = Column(String(36), ForeignKey("simulations.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    scenario_type = Column(String(100), nullable=False)
    injected_events = Column(Integer, default=0)
    detected_events = Column(Integer, default=0)
    missed_events = Column(Integer, default=0)
    false_positives = Column(Integer, default=0)
    true_negatives = Column(Integer, default=0)
    precision = Column(Float, default=0.0)
    recall = Column(Float, default=0.0)
    f1 = Column(Float, default=0.0)
    false_positive_rate = Column(Float, default=0.0)
    avg_detection_latency_ms = Column(Float, default=0.0)
    metrics_summary_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    simulation = relationship("Simulation", back_populates="evaluation")
