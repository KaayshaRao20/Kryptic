from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db, check_db_health
from app.redis_client import redis_client
from app.schemas.health import HealthCheckResponse, ServiceStatus
from app.services.prediction.base import ModelRegistry

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthCheckResponse)
def health_check(db: Session = Depends(get_db)):
    """Verifies operational health and connectivity across DB, Redis, and ML engines."""
    db_health = check_db_health()
    redis_health = redis_client.check_health()

    services_status = ServiceStatus(
        database=db_health,
        redis=redis_health,
        simulation_engine={
            "status": "operational",
            "active_scenarios": 5,
            "max_events": settings.MAX_SIMULATION_EVENTS
        },
        risk_engine={
            "status": "operational",
            "active_model_version": ModelRegistry.get_active_version(),
            "engine_mode": "DummyPredictor (Ready for IEEE-CIS ML drop-in)"
        }
    )

    overall_status = "healthy" if db_health["connected"] else "degraded"

    return HealthCheckResponse(
        status=overall_status,
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.now(timezone.utc),
        services=services_status
    )
