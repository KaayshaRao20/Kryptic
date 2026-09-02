from typing import Dict, Any
from datetime import datetime
from pydantic import BaseModel


class ServiceStatus(BaseModel):
    database: Dict[str, Any]
    redis: Dict[str, Any]
    simulation_engine: Dict[str, Any]
    risk_engine: Dict[str, Any]


class HealthCheckResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: datetime
    services: ServiceStatus
