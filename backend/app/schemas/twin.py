from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


class TwinNodeSchema(BaseModel):
    id: Optional[str] = None
    node_key: str
    name: str
    layer: str  # ENTRY, AUTHENTICATION, RISK_ENGINE, ROUTER, PROCESSOR, AUTHORIZATION, SETTLEMENT, etc.
    node_type: str = "service"
    status: str = "healthy"  # healthy, degraded, anomalous, compromised, offline
    tps: float = 0.0
    error_rate: float = 0.0
    latency_ms: float = 15.0
    risk_level: str = "LOW"
    position_x: float = 0.0
    position_y: float = 0.0
    metadata_json: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class TwinEdgeSchema(BaseModel):
    id: Optional[str] = None
    source_node_key: str
    target_node_key: str
    edge_type: str = "data_flow"
    latency_ms: float = 5.0
    weight: float = 1.0
    status: str = "active"
    metadata_json: Dict[str, Any] = Field(default_factory=dict)

    model_config = ConfigDict(from_attributes=True)


class TwinTopologyConfig(BaseModel):
    id: Optional[str] = None
    system_id: str
    name: str
    version: str = "1.0.0"
    description: Optional[str] = None
    nodes: List[TwinNodeSchema]
    edges: List[TwinEdgeSchema]
    metadata_json: Dict[str, Any] = Field(default_factory=dict)


class TwinStateResponse(BaseModel):
    topology_id: str
    system_id: str
    system_name: str
    version: str
    overall_health: str  # HEALTHY, DEGRADED, CRITICAL
    active_risk_level: str
    total_tps: float
    avg_latency_ms: float
    nodes: List[TwinNodeSchema]
    edges: List[TwinEdgeSchema]
    timestamp: datetime


class NodeStatusUpdate(BaseModel):
    node_key: str
    status: str
    risk_level: Optional[str] = None
    error_rate: Optional[float] = None
    tps: Optional[float] = None
    reason: Optional[str] = None
