from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import Organization
from app.schemas.organization import OrganizationResponse

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.get("", response_model=List[OrganizationResponse])
def get_organizations(db: Session = Depends(get_db)):
    """Lists registered organizations / merchants."""
    orgs = db.query(Organization).filter(Organization.is_active == True).all()
    return [OrganizationResponse.model_validate(o) for o in orgs]


@router.get("/{slug}", response_model=OrganizationResponse)
def get_organization_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieves specific organization by its URL slug."""
    org = db.query(Organization).filter(Organization.slug == slug).first()
    if not org:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Organization '{slug}' not found.")
    return OrganizationResponse.model_validate(org)
