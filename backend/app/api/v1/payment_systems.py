from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.organization import PaymentSystemResponse, MultiSystemRingResponse
from app.services.multi_system_service import multi_system_service

router = APIRouter(tags=["Multi-System / Ring"])


@router.get("/payment-systems", response_model=List[PaymentSystemResponse])
def get_payment_systems(
    org_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves payment systems associated with an organization."""
    systems = multi_system_service.list_payment_systems(db, org_id=org_id)
    return [PaymentSystemResponse.model_validate(s) for s in systems]


@router.get("/systems/ring", response_model=MultiSystemRingResponse)
def get_systems_ring(
    org_slug: str = Query("apex-merchants"),
    db: Session = Depends(get_db)
):
    """
    Returns the multi-system topology ring connecting distinct merchant payment systems,
    their latency connections, and cross-system entity correlations.
    """
    return multi_system_service.get_organization_ring(db, organization_slug=org_slug)
