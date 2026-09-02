from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class PaymentSystemResponse(BaseModel):
    id: str
    organization_id: str
    name: str
    code: str
    system_type: str
    status: str
    description: Optional[str]
    config_json: Dict[str, Any]
    is_active: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SystemConnectionResponse(BaseModel):
    id: str
    source_system_id: str
    target_system_id: str
    source_system_name: Optional[str] = None
    target_system_name: Optional[str] = None
    connection_type: str
    latency_ms: int
    bandwidth_tps: int
    status: str
    metadata_json: Dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class OrganizationResponse(BaseModel):
    id: str
    name: str
    slug: str
    tier: str
    config_json: Dict[str, Any]
    is_active: bool
    created_at: datetime
    payment_systems: List[PaymentSystemResponse] = []

    model_config = ConfigDict(from_attributes=True)


class MultiSystemRingResponse(BaseModel):
    organization_id: str
    organization_name: str
    systems: List[PaymentSystemResponse]
    connections: List[SystemConnectionResponse]
    correlated_entities_count: int
    ring_health: str  # OPTIMAL, DEGRADED, CRITICAL
