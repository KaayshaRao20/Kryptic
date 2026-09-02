from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class ScenarioConfig(BaseModel):
    scenario_type: str  # FRAUD_SPIKE, HIGH_VELOCITY, COORDINATED_ATTACK, BEHAVIORAL_ANOMALY, CUSTOM
    total_events: int = Field(default=30, ge=5, le=500)
    tps: float = Field(default=5.0, ge=0.5, le=50.0)
    fraud_injection_rate: float = Field(default=0.35, ge=0.0, le=1.0)
    target_node_key: Optional[str] = "risk_engine"
    system_id: Optional[str] = None
    custom_parameters: Dict[str, Any] = Field(default_factory=dict)


class SimulationCreateRequest(BaseModel):
    scenario_type: str
    organization_slug: Optional[str] = "apex-merchants"
    system_id: Optional[str] = None
    total_events: int = Field(default=30, ge=5, le=500)
    tps: float = Field(default=5.0, ge=0.5, le=50.0)
    fraud_injection_rate: float = Field(default=0.35, ge=0.0, le=1.0)
    custom_parameters: Dict[str, Any] = Field(default_factory=dict)


class SimulationEventSchema(BaseModel):
    id: str
    simulation_id: str
    step: int
    event_type: str
    transaction_id: Optional[str]
    is_injected_fraud: bool
    is_detected: bool
    predicted_risk_level: Optional[str]
    fraud_probability: float
    latency_ms: float
    payload_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SimulationResponse(BaseModel):
    id: str
    organization_id: str
    system_id: Optional[str]
    scenario_type: str
    status: str  # IDLE, PREPARING, RUNNING, PAUSED, COMPLETED, FAILED
    total_events: int
    current_step: int
    tps: float
    fraud_injection_rate: float
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    created_at: datetime
    error_message: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
