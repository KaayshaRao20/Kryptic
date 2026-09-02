from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.risk import Prediction, RiskEvent
from app.models.transaction import Transaction
from app.models.twin import TwinNode, TwinTopology
from app.schemas.risk import RiskPredictRequest, RiskPredictResponse
from app.services.prediction.base import ModelRegistry
from app.services.websocket_manager import ws_manager


class RiskService:
    @classmethod
    async def evaluate_transaction(
        cls,
        db: Session,
        req: RiskPredictRequest,
        trigger_twin_update: bool = True
    ) -> RiskPredictResponse:
        # Get active prediction service
        predictor = ModelRegistry.get_service()
        tx_dict = req.model_dump() if hasattr(req, "model_dump") else req.dict()

        # Run prediction
        prediction_result = predictor.predict(tx_dict)

        # Store or update prediction in database
        existing_pred = db.query(Prediction).filter(Prediction.transaction_id == req.transaction_id).first()
        signals_list = [s.model_dump() if hasattr(s, "model_dump") else s.dict() for s in prediction_result.risk_signals]

        if existing_pred:
            existing_pred.fraud_probability = prediction_result.fraud_probability
            existing_pred.risk_level = prediction_result.risk_level
            existing_pred.model_version = prediction_result.model_version
            existing_pred.inference_time_ms = prediction_result.inference_time_ms
            existing_pred.risk_signals = signals_list
            db_prediction = existing_pred
        else:
            db_prediction = Prediction(
                transaction_id=req.transaction_id,
                fraud_probability=prediction_result.fraud_probability,
                risk_level=prediction_result.risk_level,
                model_version=prediction_result.model_version,
                inference_time_ms=prediction_result.inference_time_ms,
                risk_signals=signals_list,
                metadata_json=req.metadata_json or {}
            )
            db.add(db_prediction)

        # Create RiskEvent if risk is elevated
        if prediction_result.risk_level in ["HIGH", "CRITICAL"]:
            risk_event = RiskEvent(
                prediction_id=db_prediction.id,
                system_id=req.system_id,
                affected_node_key="risk_engine",
                event_type="FRAUD_ANOMALY" if prediction_result.fraud_probability < 0.85 else "CRITICAL_FRAUD_PATTERN",
                severity=prediction_result.risk_level,
                description=f"Transaction {req.transaction_id} flagged with {round(prediction_result.fraud_probability * 100, 1)}% fraud probability. Signals: {', '.join([s.name for s in prediction_result.risk_signals])}",
                status="ACTIVE",
                metadata_json={"action_recommended": prediction_result.action_recommended}
            )
            db.add(risk_event)

        db.commit()
        db.refresh(db_prediction)

        # Broadcast WebSocket event
        await ws_manager.broadcast_event("RISK_DETECTED", {
            "transaction_id": req.transaction_id,
            "system_id": req.system_id,
            "fraud_probability": prediction_result.fraud_probability,
            "risk_level": prediction_result.risk_level,
            "action_recommended": prediction_result.action_recommended,
            "signals_count": len(prediction_result.risk_signals),
            "inference_time_ms": prediction_result.inference_time_ms
        })

        return prediction_result

    @staticmethod
    def list_risk_events(
        db: Session,
        system_id: Optional[str] = None,
        severity: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> Tuple[List[RiskEvent], int]:
        query = db.query(RiskEvent)
        if system_id:
            query = query.filter(RiskEvent.system_id == system_id)
        if severity:
            query = query.filter(RiskEvent.severity == severity)

        total = query.count()
        events = query.order_by(desc(RiskEvent.created_at)).offset(offset).limit(limit).all()
        return events, total

    @staticmethod
    def get_risk_event(db: Session, event_id: str) -> Optional[RiskEvent]:
        return db.query(RiskEvent).filter(RiskEvent.id == event_id).first()


risk_service = RiskService()
