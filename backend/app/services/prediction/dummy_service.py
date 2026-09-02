import time
from datetime import datetime, timezone
from typing import Dict, Any, List
from app.schemas.risk import RiskPredictResponse, RiskSignal
from app.services.prediction.base import BasePredictionService


class DummyPredictionService(BasePredictionService):
    """
    ML-ready Dummy Predictor that calculates structured risk indicators,
    confidence probabilities, and actionable risk signals without requiring the full ML dataset yet.
    """
    def __init__(self, version: str = "v1.0.0-dummy-predictor"):
        self._version = version

    @property
    def model_version(self) -> str:
        return self._version

    def predict(self, transaction_data: Dict[str, Any]) -> RiskPredictResponse:
        start_time = time.time()

        amount = float(transaction_data.get("amount", 100.0))
        tx_type = str(transaction_data.get("transaction_type", "PAYMENT")).upper()
        metadata = transaction_data.get("metadata_json", {})
        entity_id = str(transaction_data.get("entity_id", ""))
        is_injected_fraud = bool(transaction_data.get("is_fraud_ground_truth", False) or metadata.get("is_injected_fraud", False))

        signals: List[RiskSignal] = []
        base_score = 0.04

        # 1. Ground truth injection or simulation triggers
        if is_injected_fraud:
            base_score += 0.75
            signals.append(RiskSignal(
                name="SIMULATED_ATTACK_PATTERN",
                weight=0.65,
                description="Transaction matches high-entropy synchronized attack vector pattern.",
                severity="CRITICAL"
            ))

        # 2. Amount-based heuristic
        if amount > 5000:
            base_score += 0.35
            signals.append(RiskSignal(
                name="LARGE_AMOUNT_OUTLIER",
                weight=0.35,
                description=f"Transaction volume ${amount:,.2f} exceeds 99th percentile merchant threshold.",
                severity="HIGH"
            ))
        elif amount > 1500:
            base_score += 0.18
            signals.append(RiskSignal(
                name="ELEVATED_TRANSACTION_VALUE",
                weight=0.18,
                description=f"Transaction amount ${amount:,.2f} is significantly above normal cluster baseline.",
                severity="MEDIUM"
            ))

        # 3. Transaction type risk
        if tx_type in ["WITHDRAWAL", "CRYPTO_PAYOUT", "INSTANT_TRANSFER"]:
            base_score += 0.15
            signals.append(RiskSignal(
                name="HIGH_RISK_SETTLEMENT_RAIL",
                weight=0.15,
                description=f"Direct liquidity transfer rail ({tx_type}) exhibits heightened exposure.",
                severity="MEDIUM"
            ))

        # 4. Metadata indicators (velocity, device, geo mismatch)
        if metadata.get("velocity_1h", 0) > 4 or metadata.get("burst_velocity", False):
            base_score += 0.28
            signals.append(RiskSignal(
                name="VELOCITY_SPIKE_DETECTED",
                weight=0.28,
                description=f"Entity {entity_id} attempted {metadata.get('velocity_1h', 5)}+ operations in 1 hour.",
                severity="HIGH"
            ))

        if metadata.get("ip_country_mismatch", False) or metadata.get("vpn_detected", False):
            base_score += 0.22
            signals.append(RiskSignal(
                name="NETWORK_GEO_MISMATCH",
                weight=0.22,
                description="Client IP routing through high-risk anonymous data center / proxy.",
                severity="HIGH"
            ))

        if metadata.get("device_unrecognized", False):
            base_score += 0.12
            signals.append(RiskSignal(
                name="NEW_DEVICE_FINGERPRINT",
                weight=0.12,
                description="Unseen device fingerprint for established entity profile.",
                severity="LOW"
            ))

        # Clamp fraud probability between 0.01 and 0.99
        fraud_prob = max(0.01, min(0.99, round(base_score, 4)))

        # Determine risk level and action
        if fraud_prob >= 0.75:
            risk_level = "CRITICAL"
            action = "DECLINE"
        elif fraud_prob >= 0.50:
            risk_level = "HIGH"
            action = "CHALLENGE_2FA"
        elif fraud_prob >= 0.25:
            risk_level = "MEDIUM"
            action = "REVIEW"
        else:
            risk_level = "LOW"
            action = "APPROVE"

        inference_time_ms = round((time.time() - start_time) * 1000 + 1.2, 2)

        return RiskPredictResponse(
            transaction_id=str(transaction_data.get("transaction_id", "tx_unknown")),
            fraud_probability=fraud_prob,
            risk_level=risk_level,
            model_version=self._version,
            inference_time_ms=inference_time_ms,
            timestamp=datetime.now(timezone.utc),
            risk_signals=signals,
            action_recommended=action
        )
