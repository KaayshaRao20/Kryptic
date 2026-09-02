from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.explanation import ExplanationResponse
from app.services.explanation_service import explanation_service

router = APIRouter(prefix="/explain", tags=["Explainable AI"])


@router.get("/{prediction_id}", response_model=ExplanationResponse)
def get_prediction_explanation(
    prediction_id: str,
    db: Session = Depends(get_db)
):
    """
    Returns structured model explainability and SHAP-compatible feature contributions
    for a given prediction or transaction ID.
    """
    explanation = explanation_service.get_or_generate_explanation(db, prediction_id)
    if not explanation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction found for identifier '{prediction_id}'"
        )
    return explanation
