from app.services.prediction.base import BasePredictionService, ModelRegistry, ModelLoader
from app.services.prediction.dummy_service import DummyPredictionService
from app.services.prediction.ml_service import MLPredictionService

# Register default dummy predictor in registry
dummy_service_instance = DummyPredictionService()
ModelRegistry.register("v1.0.0-dummy-predictor", dummy_service_instance, set_active=True)

__all__ = [
    "BasePredictionService",
    "ModelRegistry",
    "ModelLoader",
    "DummyPredictionService",
    "MLPredictionService",
]
