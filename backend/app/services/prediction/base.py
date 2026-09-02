from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from app.schemas.risk import RiskPredictResponse


class BasePredictionService(ABC):
    """Abstract base class for all risk prediction engines in KRYPTIC."""

    @abstractmethod
    def predict(self, transaction_data: Dict[str, Any]) -> RiskPredictResponse:
        """Evaluates a normalized transaction and returns risk score, level, and signals."""
        pass

    @property
    @abstractmethod
    def model_version(self) -> str:
        """Returns current model identifier."""
        pass


class ModelLoader:
    """Utility class to safely load trained model artifacts."""
    @staticmethod
    def load_model(artifact_path: str):
        # Scaffold for future joblib / pickle / booster loaders
        return None


class ModelRegistry:
    """Manages active prediction service instances and versions."""
    _services: Dict[str, BasePredictionService] = {}
    _active_version: str = "v1.0.0-dummy-predictor"

    @classmethod
    def register(cls, version: str, service: BasePredictionService, set_active: bool = False):
        cls._services[version] = service
        if set_active or len(cls._services) == 1:
            cls._active_version = version

    @classmethod
    def get_service(cls, version: Optional[str] = None) -> BasePredictionService:
        ver = version or cls._active_version
        if ver not in cls._services:
            # Fallback to any registered service
            if cls._services:
                return next(iter(cls._services.values()))
            raise KeyError(f"No prediction service registered for version: {ver}")
        return cls._services[ver]

    @classmethod
    def get_active_version(cls) -> str:
        return cls._active_version
