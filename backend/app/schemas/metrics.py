from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EvaluationMetrics(BaseModel):
    injected_events: int
    detected_events: int
    missed_events: int
    false_positives: int
    true_negatives: int
    precision: float
    recall: float
    f1: float
    false_positive_rate: float
    avg_detection_latency_ms: float
    accuracy: float
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)


class MetricsResponse(BaseModel):
    system_id: Optional[str] = None
    time_window: str = "simulation"
    metrics: EvaluationMetrics
    confusion_matrix: Dict[str, int]
    breakdown_by_signal: Dict[str, int] = Field(default_factory=dict)
    recommendations: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
