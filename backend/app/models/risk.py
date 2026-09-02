import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Float, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid() -> str:
    return str(uuid.uuid4())


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    transaction_id = Column(String(100), ForeignKey("transactions.transaction_id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    fraud_probability = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False, index=True)  # LOW, MEDIUM, HIGH, CRITICAL
    model_version = Column(String(100), default="v1.0.0-dummy-predictor")
    inference_time_ms = Column(Float, default=1.2)
    risk_signals = Column(JSON, default=list)  # List of signal descriptions / weights
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    transaction = relationship("Transaction", back_populates="prediction")
    explanation = relationship("Explanation", back_populates="prediction", uselist=False, cascade="all, delete-orphan")
    risk_events = relationship("RiskEvent", back_populates="prediction", cascade="all, delete-orphan")


class RiskEvent(Base):
    __tablename__ = "risk_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="SET NULL"), nullable=True)
    system_id = Column(String(36), ForeignKey("payment_systems.id", ondelete="SET NULL"), nullable=True, index=True)
    affected_node_key = Column(String(100), nullable=True)  # e.g., 'risk_engine', 'auth_gateway'
    event_type = Column(String(100), nullable=False)  # FRAUD_ANOMALY, VELOCITY_SPIKE, COORDINATED_ATTACK, IMPERSONATION
    severity = Column(String(50), default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    status = Column(String(50), default="ACTIVE")  # ACTIVE, MITIGATED, INVESTIGATING, RESOLVED
    metadata_json = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True)

    # Relationships
    prediction = relationship("Prediction", back_populates="risk_events")


class Explanation(Base):
    __tablename__ = "explanations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    prediction_id = Column(String(36), ForeignKey("predictions.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    base_value = Column(Float, default=0.035)  # Expected base risk in population
    model_version = Column(String(100), default="v1.0.0-dummy-predictor")
    feature_contributions = Column(JSON, default=list)  # List of {feature, value, contribution, impact_direction}
    risk_factors = Column(JSON, default=list)  # Top driving factors
    mitigation_actions = Column(JSON, default=list)  # Recommended operational interventions
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    # Relationships
    prediction = relationship("Prediction", back_populates="explanation")
