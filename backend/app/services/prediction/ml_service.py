from typing import Dict, Any
from app.schemas.risk import RiskPredictResponse
from app.services.prediction.base import BasePredictionService


class MLPredictionService(BasePredictionService):
    """
    ML Prediction Service scaffold ready to integrate trained XGBoost / LightGBM / CatBoost models
    when IEEE-CIS training is performed in subsequent phases.
    Adheres strictly to the identical prediction contract.
    """
    def __init__(self, model_path: str = "models/xgboost_ieee_cis.json", version: str = "v2.0.0-xgb-ieee"):
        self._version = version
        self._model_path = model_path
        self._model = None  # Loaded on startup via ModelLoader if file exists

    @property
    def model_version(self) -> str:
        return self._version

    def predict(self, transaction_data: Dict[str, Any]) -> RiskPredictResponse:
        # If model artifact is not yet trained/present, gracefully fall back to baseline heuristics
        from app.services.prediction.dummy_service import DummyPredictionService
        fallback = DummyPredictionService(version=f"{self._version}-fallback")
        return fallback.predict(transaction_data)
