import json
import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.risk import RiskPredictRequest, RiskPredictResponse, RiskEventResponse
from app.services.risk_service import risk_service
from app.services.prediction.base import ModelRegistry

router = APIRouter(prefix="/risk", tags=["Risk Detection"])

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "models"))


@router.get("/model-card")
def get_active_model_card():
    """
    Returns production proof for the active fraud detector: artifact readiness,
    holdout metrics, confusion matrix, and operational false-positive cost.
    """
    metrics_path = os.path.join(MODELS_DIR, "training_metrics.json")
    artifact_names = [
        "xgb_fraud_model.json",
        "preprocessing_pipeline.joblib",
        "isolation_forest_anomaly.joblib",
        "kmeans_clustering.joblib",
        "feature_schema.json",
        "training_metrics.json",
    ]
    artifacts = {
        name: os.path.exists(os.path.join(MODELS_DIR, name))
        for name in artifact_names
    }

    metrics = {}
    if os.path.exists(metrics_path):
        with open(metrics_path, "r", encoding="utf-8") as fp:
            metrics = json.load(fp)

    holdout = metrics.get("holdout_test_metrics", {})
    false_positive_review_cost_inr = 65
    confusion = holdout.get("confusion_matrix", {})
    false_positives = int(confusion.get("false_positives", 0))

    return {
        "status": "operational" if all(artifacts.values()) else "degraded",
        "active_model_version": ModelRegistry.get_active_version() or "v2.0.0-xgb-paysim",
        "loss_class": "payment_fraud_spike_detection",
        "dataset": metrics.get("dataset", "PaySim Financial Benchmark"),
        "train_samples": metrics.get("train_samples"),
        "test_samples": metrics.get("test_samples"),
        "features_count": metrics.get("features_count"),
        "artifacts": artifacts,
        "holdout_metrics": holdout,
        "operational_cost": {
            "false_positive_review_cost_inr": false_positive_review_cost_inr,
            "holdout_false_positive_cost_inr": false_positives * false_positive_review_cost_inr,
            "decision_policy": "APPROVE below 25%, REVIEW 25-49%, CHALLENGE_2FA 50-74%, DECLINE 75%+",
        },
    }


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
