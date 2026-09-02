from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.risk import RiskPredictRequest, RiskPredictResponse, RiskEventResponse
from app.services.risk_service import risk_service

router = APIRouter(prefix="/risk", tags=["Risk Detection"])


@router.post("/predict", response_model=RiskPredictResponse)
async def predict_transaction_risk(
    req: RiskPredictRequest,
    db: Session = Depends(get_db)
):
    """
    Evaluates transaction fraud risk using active model service.
    Returns probability, risk band (LOW/MED/HIGH/CRITICAL), signals, and operational action.
    """
    return await risk_service.evaluate_transaction(db, req)


@router.get("/events", response_model=List[RiskEventResponse])
def get_risk_events(
    system_id: Optional[str] = Query(None),
    severity: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves list of triggered risk anomaly events across merchant systems."""
    events, _ = risk_service.list_risk_events(
        db, system_id=system_id, severity=severity, limit=limit, offset=offset
    )
    return [RiskEventResponse.model_validate(ev) for ev in events]


@router.get("/events/{event_id}", response_model=RiskEventResponse)
def get_risk_event_by_id(
    event_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves specific risk event details."""
    event = risk_service.get_risk_event(db, event_id)
    if not event:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Risk event {event_id} not found")
    return RiskEventResponse.model_validate(event)
