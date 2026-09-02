from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FeatureContribution(BaseModel):
    feature: str
    display_name: str
    value: Any
    contribution: float  # SHAP value / log-odds contribution
    impact_direction: str  # INCREASES_RISK, REDUCES_RISK, NEUTRAL
    description: str


class RiskFactor(BaseModel):
    factor: str
    impact: str  # HIGH, MEDIUM, LOW
    detail: str


class ExplanationResponse(BaseModel):
    prediction_id: str
    transaction_id: str
    fraud_probability: float
    risk_level: str
    base_value: float
    model_version: str
    is_demo_data: bool = True
    feature_contributions: List[FeatureContribution]
    risk_factors: List[RiskFactor]
    mitigation_actions: List[str]
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
