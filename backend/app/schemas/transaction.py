from typing import Optional, Dict, Any, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TransactionBase(BaseModel):
    transaction_id: Optional[str] = None
    system_id: Optional[str] = None
    entity_id: str
    amount: float = Field(..., gt=0)
    currency: str = "USD"
    transaction_type: str = "PAYMENT"
    device_id: Optional[str] = None
    ip_address: Optional[str] = None
    card_bin: Optional[str] = None
    status: str = "PROCESSED"
    is_fraud_ground_truth: int = 0
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TransactionStats(BaseModel):
    total_transactions: int
    total_volume: float
    avg_transaction_amount: float
    fraud_flagged_count: int
    fraud_rate_pct: float
    volume_by_currency: Dict[str, float]
    recent_velocity_tps: float


class TransactionGenerateRequest(BaseModel):
    count: int = Field(default=10, ge=1, le=100)
    system_id: Optional[str] = None
    fraud_ratio: float = Field(default=0.2, ge=0.0, le=1.0)
    scenario: Optional[str] = "mixed"  # mixed, fraud_spike, velocity_burst
