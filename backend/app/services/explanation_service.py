from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session

from app.models.risk import Prediction, Explanation
from app.models.transaction import Transaction
from app.schemas.explanation import ExplanationResponse, FeatureContribution, RiskFactor


class ExplanationService:
    @classmethod
    def get_or_generate_explanation(cls, db: Session, prediction_id: str) -> Optional[ExplanationResponse]:
        # Locate prediction
        prediction = db.query(Prediction).filter(
            (Prediction.id == prediction_id) | (Prediction.transaction_id == prediction_id)
        ).first()

        if not prediction:
            return None

        # Check existing cached explanation in DB
        db_explanation = db.query(Explanation).filter(Explanation.prediction_id == prediction.id).first()
        if db_explanation:
            return cls._map_to_schema(prediction, db_explanation)

        # Generate structured explainability breakdown
        tx = db.query(Transaction).filter(Transaction.transaction_id == prediction.transaction_id).first()
        explanation = cls._compute_explanation(prediction, tx)

        # Persist explanation
        db_exp = Explanation(
            prediction_id=prediction.id,
            base_value=explanation.base_value,
            model_version=prediction.model_version,
            feature_contributions=[c.model_dump() if hasattr(c, "model_dump") else c.dict() for c in explanation.feature_contributions],
            risk_factors=[f.model_dump() if hasattr(f, "model_dump") else f.dict() for f in explanation.risk_factors],
            mitigation_actions=explanation.mitigation_actions
        )
        db.add(db_exp)
        db.commit()

        return explanation

    @classmethod
    def _compute_explanation(cls, prediction: Prediction, tx: Optional[Transaction]) -> ExplanationResponse:
        amount = tx.amount if tx else 150.0
        prob = prediction.fraud_probability
        base_val = 0.035

        contributions: List[FeatureContribution] = []
        risk_factors: List[RiskFactor] = []
        mitigations: List[str] = []

        # 1. Transaction Amount Impact
        amount_contrib = round((amount / 5000.0) * 0.25, 4) if amount > 500 else round(-0.02, 4)
        contributions.append(FeatureContribution(
            feature="transaction_amount",
            display_name="Transaction Amount ($USD)",
            value=f"${amount:,.2f}",
            contribution=amount_contrib,
            impact_direction="INCREASES_RISK" if amount_contrib > 0 else "REDUCES_RISK",
            description="Deviation from the entity's rolling 30-day baseline average amount."
        ))

        # 2. Velocity Impact
        signals = prediction.risk_signals or []
        has_velocity = any("VELOCITY" in str(s) for s in signals)
        vel_contrib = 0.32 if has_velocity else -0.015
        contributions.append(FeatureContribution(
            feature="velocity_1h",
            display_name="Hourly Request Velocity",
            value="High (Burst)" if has_velocity else "Normal (1-2 req/hr)",
            contribution=vel_contrib,
            impact_direction="INCREASES_RISK" if vel_contrib > 0 else "REDUCES_RISK",
            description="Number of settlement and authorization requests initiated within 60 minutes."
        ))

        # 3. Device & IP Reputational Score
        has_network_mismatch = any("NETWORK" in str(s) or "GEO" in str(s) for s in signals)
        net_contrib = 0.28 if has_network_mismatch else -0.01
        contributions.append(FeatureContribution(
            feature="ip_anonymity_score",
            display_name="IP Routing & ASN Risk",
            value="Commercial VPN / Tor Exit" if has_network_mismatch else "Residential ISP",
            contribution=net_contrib,
            impact_direction="INCREASES_RISK" if net_contrib > 0 else "REDUCES_RISK",
            description="IP address reputation score and proxy/datacenter detection flags."
        ))

        # 4. Behavioral Pattern Consistency
        beh_contrib = 0.15 if prob > 0.5 else -0.03
        contributions.append(FeatureContribution(
            feature="behavioral_entropy",
            display_name="Behavioral Biometrics / Flow Entropy",
            value=round(prob * 0.88, 3),
            contribution=beh_contrib,
            impact_direction="INCREASES_RISK" if beh_contrib > 0 else "REDUCES_RISK",
            description="Timing divergence and navigation trajectory variance compared to historical entity habits."
        ))

        # Build risk factors & mitigations
        if prob >= 0.5:
            risk_factors.append(RiskFactor(
                factor="Anomalous Request Velocity",
                impact="HIGH",
                detail="High frequency of transactions in a compressed window indicating automated scripting."
            ))
            risk_factors.append(RiskFactor(
                factor="High Risk Network Origin",
                impact="MEDIUM",
                detail="Connection routed through known proxy network masking geographic identity."
            ))
            mitigations.extend([
                "Trigger Step-Up Multi-Factor Authentication (WebAuthn/FIDO2).",
                "Apply dynamic rate limit to IP subnet and device fingerprint.",
                "Place pending settlement into operational fraud review queue."
            ])
        else:
            risk_factors.append(RiskFactor(
                factor="Normal Baseline Alignment",
                impact="LOW",
                detail="Transaction fits historical amount, device, and geolocation patterns."
            ))
            mitigations.append("Permit instant straight-through processing (STP).")

        return ExplanationResponse(
            prediction_id=prediction.id,
            transaction_id=prediction.transaction_id,
            fraud_probability=prob,
            risk_level=prediction.risk_level,
            base_value=base_val,
            model_version=prediction.model_version,
            is_demo_data=True,
            feature_contributions=contributions,
            risk_factors=risk_factors,
            mitigation_actions=mitigations,
            created_at=datetime.now(timezone.utc)
        )

    @classmethod
    def _map_to_schema(cls, prediction: Prediction, explanation: Explanation) -> ExplanationResponse:
        contributions = [FeatureContribution(**c) for c in (explanation.feature_contributions or [])]
        factors = [RiskFactor(**f) for f in (explanation.risk_factors or [])]
        return ExplanationResponse(
            prediction_id=prediction.id,
            transaction_id=prediction.transaction_id,
            fraud_probability=prediction.fraud_probability,
            risk_level=prediction.risk_level,
            base_value=explanation.base_value,
            model_version=explanation.model_version,
            is_demo_data=True,
            feature_contributions=contributions,
            risk_factors=factors,
            mitigation_actions=explanation.mitigation_actions or [],
            created_at=explanation.created_at
        )


explanation_service = ExplanationService()
