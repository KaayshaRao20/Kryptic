from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.metrics import MetricsResponse
from app.services.metrics_service import metrics_service

router = APIRouter(prefix="/metrics", tags=["Metrics & Evaluation"])


@router.get("", response_model=MetricsResponse)
def get_metrics_summary(
    system_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Returns latest empirical detection metrics calculated from underlying simulations
    including Injected/Detected/Missed events, Precision, Recall, F1, FPR, and Latency.
    """
    return metrics_service.get_latest_or_system_metrics(db, system_id=system_id)


@router.get("/simulation/{simulation_id}", response_model=MetricsResponse)
def get_simulation_metrics(
    simulation_id: str,
    db: Session = Depends(get_db)
):
    """Computes and returns detailed evaluation metrics for a specific simulation run."""
    try:
        return metrics_service.calculate_simulation_metrics(db, simulation_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
