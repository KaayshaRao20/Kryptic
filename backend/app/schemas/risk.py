from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class RiskSignal(BaseModel):
    name: str
    weight: float
    description: str
    severity: str = "MEDIUM"  # LOW, MEDIUM, HIGH, CRITICAL


class RiskPredictRequest(BaseModel):
    transaction_id: str
    system_id: Optional[str] = None
    entity_id: str
    amount: float
    currency: str = "USD"
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    transaction_type: str = "PAYMENT"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class RiskPredictResponse(BaseModel):
    transaction_id: str
    fraud_probability: float
    risk_level: str  # LOW, MEDIUM, HIGH, CRITICAL
    model_version: str
    inference_time_ms: float
    timestamp: datetime
    risk_signals: List[RiskSignal]
    action_recommended: str  # APPROVE, REVIEW, CHALLENGE_2FA, DECLINE


class RiskEventResponse(BaseModel):
    id: str
    prediction_id: Optional[str]
    system_id: Optional[str]
    affected_node_key: Optional[str]
    event_type: str
    severity: str
    description: str
    status: str
    metadata_json: Dict[str, Any]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
