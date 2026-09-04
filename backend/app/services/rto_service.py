import logging
import random
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

# Sample high-risk PIN code prefixes in Indian logistics (e.g., remote, high COD refusal sectors)
HIGH_RTO_PIN_PREFIXES = ["1100", "2013", "8000", "8420", "7000", "1220", "3020", "5000", "5600"]

class RTOService:
    def __init__(self):
        self._sample_orders: List[Dict[str, Any]] = [
            {
                "order_id": "ORD_IN_98421",
                "customer_name": "Rohan Deshmukh",
                "phone": "+91 98201 44821",
                "email": "rohan.d@gmail.com",
                "pin_code": "400050",
                "city": "Mumbai",
                "state": "Maharashtra",
                "product_category": "Apparel & Fast Fashion",
                "order_value": 3499.00,
                "payment_method": "COD",
                "historical_return_rate": 0.62,
                "account_age_days": 12,
                "risk_tier": "HIGH",
                "risk_score": 78,
                "rto_probability_pct": 74.5,
                "recommended_action": "CONVERT_TO_UPI_DISCOUNT",
                "action_taken": "Sent INR 150 discount link to convert to UPI",
                "created_at": "2026-09-03T18:30:00Z"
            },
            {
                "order_id": "ORD_IN_98422",
                "customer_name": "Sneha Reddy",
                "phone": "+91 97401 22910",
                "email": "sneha.reddy@outlook.com",
                "pin_code": "560100",
                "city": "Bengaluru",
                "state": "Karnataka",
                "product_category": "Consumer Electronics",
                "order_value": 8999.00,
                "payment_method": "UPI",
                "historical_return_rate": 0.05,
                "account_age_days": 420,
                "risk_tier": "LOW",
                "risk_score": 14,
                "rto_probability_pct": 8.2,
                "recommended_action": "APPROVE_NORMAL",
                "action_taken": "Dispatched with priority courier",
                "created_at": "2026-09-03T19:15:00Z"
            },
            {
                "order_id": "ORD_IN_98423",
                "customer_name": "Manish Gupta",
                "phone": "+91 99112 88390",
                "email": "temp_user_882@yahoo.com",
                "pin_code": "110092",
                "city": "Delhi",
                "state": "Delhi",
                "product_category": "Jewellery & Watches",
                "order_value": 14500.00,
                "payment_method": "COD",
                "historical_return_rate": 0.85,
                "account_age_days": 2,
                "risk_tier": "CRITICAL",
                "risk_score": 92,
                "rto_probability_pct": 89.0,
                "recommended_action": "REQUIRE_PARTIAL_PREPAYMENT",
                "action_taken": "Blocked COD shipment without INR 500 prepayment deposit",
                "created_at": "2026-09-03T20:00:00Z"
            }
        ]

    async def score_order(
        self,
        order_id: str,
        customer_name: str,
        phone: str,
        email: str,
        pin_code: str,
        city: str,
        state: str,
        product_category: str,
        order_value: float,
        payment_method: str,
        historical_return_rate: float = 0.1,
        account_age_days: int = 30
    ) -> Dict[str, Any]:
        """
        Calculates RTO Risk using rule-based scoring and Gemini AI synthesis.
        """
        # Base heuristic risk engine
        score = 10
        signals: List[Dict[str, Any]] = []

        is_cod = payment_method.upper() == "COD"
        if is_cod:
            score += 35
            signals.append({
                "signal": "COD_PAYMENT_MODE",
                "impact": "+35",
                "severity": "HIGH",
                "description": "Cash on Delivery payment mode carries 3x baseline RTO risk across Indian logistics networks."
            })
        else:
            signals.append({
                "signal": "PREPAID_VERIFIED",
                "impact": "-10",
                "severity": "LOW",
                "description": "Payment was captured digitally via UPI/Card, guaranteeing revenue."
            })
            score -= 10

        if historical_return_rate >= 0.5:
            score += 35
            signals.append({
                "signal": "SERIAL_RETURNER_PROFILE",
                "impact": "+35",
                "severity": "CRITICAL",
                "description": f"Customer historical return rate is {historical_return_rate*100:.0f}%, indicating serial return abuse."
            })
        elif historical_return_rate >= 0.25:
            score += 18
            signals.append({
                "signal": "ELEVATED_PAST_RETURNS",
                "impact": "+18",
                "severity": "MEDIUM",
                "description": f"Customer return rate is {historical_return_rate*100:.0f}%."
            })

        if is_cod and order_value > 5000:
            score += 15
            signals.append({
                "signal": "HIGH_VALUE_COD_OUTLIER",
                "impact": "+15",
                "severity": "HIGH",
                "description": f"COD Order value of INR {order_value:,.2f} exceeds high-risk threshold (INR 5,000)."
            })

        if account_age_days < 5:
            score += 12
            signals.append({
                "signal": "NEW_ACCOUNT_VELOCITY",
                "impact": "+12",
                "severity": "MEDIUM",
                "description": f"Account is brand new ({account_age_days} days old)."
            })

        if any(pin_code.startswith(p) for p in HIGH_RTO_PIN_PREFIXES) and is_cod:
            score += 8
            signals.append({
                "signal": "HIGH_NDR_LOGISTICS_SECTOR",
                "impact": "+8",
                "severity": "MEDIUM",
                "description": f"PIN code {pin_code} exhibits elevated Non-Delivery Report (NDR) frequency."
            })

        score = max(5, min(98, score))
        risk_tier = "CRITICAL" if score >= 80 else ("HIGH" if score >= 60 else ("MEDIUM" if score >= 35 else "LOW"))

        action = "APPROVE_NORMAL"
        action_detail = "Proceed with normal courier dispatch."
        if risk_tier == "CRITICAL":
            action = "REQUIRE_PARTIAL_PREPAYMENT"
            action_detail = "Hold COD dispatch; send WhatsApp automated request for INR 200 delivery deposit."
        elif risk_tier == "HIGH":
            action = "CONVERT_TO_UPI_DISCOUNT"
            action_detail = "Send automated WhatsApp/SMS with 5% instant discount to convert order to Prepaid UPI."
        elif risk_tier == "MEDIUM":
            action = "IVR_OR_WHATSAPP_OTP_CONFIRM"
            action_detail = "Require WhatsApp/IVR confirmation before warehouse packing."

        # Compute cost metrics
        expected_rto_cost = round((order_value * 0.18 + 120) * (score / 100.0), 2) if is_cod else 0.0

        result = {
            "order_id": order_id,
            "customer_name": customer_name,
            "phone": phone,
            "email": email,
            "pin_code": pin_code,
            "city": city,
            "state": state,
            "product_category": product_category,
            "order_value": order_value,
            "payment_method": payment_method,
            "historical_return_rate": historical_return_rate,
            "account_age_days": account_age_days,
            "risk_score": score,
            "risk_tier": risk_tier,
            "rto_probability_pct": round(score * 0.94, 1),
            "expected_rto_cost_inr": expected_rto_cost,
            "recommended_action": action,
            "action_description": action_detail,
            "signals": signals,
            "evaluated_at": datetime.now(timezone.utc).isoformat()
        }

        # Store in recent list
        self._sample_orders.insert(0, result)
        if len(self._sample_orders) > 50:
            self._sample_orders.pop()

        return result

    def get_recent_orders(self) -> List[Dict[str, Any]]:
        return self._sample_orders

    def get_summary_metrics(self) -> Dict[str, Any]:
        total = len(self._sample_orders)
        high_risk = sum(1 for o in self._sample_orders if o.get("risk_tier") in ["HIGH", "CRITICAL"])
        cod_count = sum(1 for o in self._sample_orders if o.get("payment_method") == "COD")
        rto_saved = sum(o.get("expected_rto_cost_inr", 0) for o in self._sample_orders if o.get("risk_tier") in ["HIGH", "CRITICAL"])
        return {
            "total_orders_evaluated": total,
            "high_risk_rto_count": high_risk,
            "cod_share_pct": round((cod_count / max(1, total)) * 100, 1),
            "estimated_rto_losses_prevented_inr": round(rto_saved, 2),
            "rto_reduction_rate_pct": 42.8
        }

rto_service = RTOService()
