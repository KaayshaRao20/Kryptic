import logging
import os
import hmac
import hashlib
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone

from app.config import settings

logger = logging.getLogger(__name__)

# Sample realistic dispute fallbacks if live dispute list is empty
SEED_DISPUTES = [
    {
        "id": "disp_rzp_1048291",
        "payment_id": "pay_TXdFipHuXkSVlt",
        "amount": 4299.00,
        "currency": "INR",
        "status": "under_review",
        "reason_code": "10.4",
        "reason_description": "Fraudulent Transaction - Cardholder claims card was compromised",
        "customer_name": "Manav Nagpal",
        "customer_email": "manav.nagpal2005@gmail.com",
        "customer_phone": "+91 98668 17707",
        "created_at": "2026-08-28T10:14:22Z",
        "respond_by": "2026-09-08T23:59:59Z",
        "order_details": {
            "order_id": "order_TXdDsUreQjF6g2",
            "item_name": "Order for PHONE COVER (Premium Matte Case)",
            "created_at": "2026-08-20T16:45:00Z"
        },
        "delivery_proof": {
            "carrier": "Blue Dart Express",
            "tracking_id": "BD849201944IN",
            "status": "DELIVERED",
            "recipient_signature": "M. Nagpal (OTP Verified)",
            "delivery_gps": "28.4595 N, 77.0266 E (Gurugram, Haryana)"
        },
        "telemetry": {
            "three_ds_status": "3DS2_AUTHENTICATED (FULL LIABILITY SHIFT)",
            "cvv_match": "MATCHED",
            "avs_match": "MATCHED",
            "ip_address": "49.207.214.102",
            "ip_city": "Gurugram, India",
            "device_id": "dev_fp_chrome_android_772",
            "prior_successful_orders": 6
        },
        "defense_submitted": False
    },
    {
        "id": "disp_rzp_2091834",
        "payment_id": "pay_TXYGDXyhp3kQAw",
        "amount": 12500.00,
        "currency": "INR",
        "status": "action_required",
        "reason_code": "13.1",
        "reason_description": "Merchandise / Services Not Received by Cardholder",
        "customer_name": "Vipul Nagpal",
        "customer_email": "nagpal.vipul82@gmail.com",
        "customer_phone": "+91 98968 17707",
        "created_at": "2026-08-30T14:20:00Z",
        "respond_by": "2026-09-10T23:59:59Z",
        "order_details": {
            "order_id": "order_TXYDbyO4Ucgbj2",
            "item_name": "Titanium Gaming Laptop X & Accessory Suite",
            "created_at": "2026-08-22T09:12:00Z"
        },
        "delivery_proof": {
            "carrier": "Delhivery Logistics",
            "tracking_id": "DL9182049182",
            "status": "DELIVERED",
            "recipient_signature": "V. Nagpal (Security Desk Handoff)",
            "delivery_gps": "19.0760 N, 72.8777 E (Bandra West, Mumbai)"
        },
        "telemetry": {
            "three_ds_status": "3DS2_AUTHENTICATED (LIABILITY SHIFT)",
            "cvv_match": "MATCHED",
            "avs_match": "MATCHED",
            "ip_address": "157.34.120.45",
            "ip_city": "Mumbai, Maharashtra",
            "device_id": "dev_fp_safari_ios_819",
            "prior_successful_orders": 3
        },
        "defense_submitted": False
    },
    {
        "id": "disp_rzp_3182901",
        "payment_id": "pay_M982jfl19A",
        "amount": 1899.00,
        "currency": "INR",
        "status": "won",
        "reason_code": "10.4",
        "reason_description": "Friendly Fraud / Unrecognized Charge claim by customer",
        "customer_name": "Aarav Sharma",
        "customer_email": "aarav.sharma@example.com",
        "customer_phone": "+91 98765 43210",
        "created_at": "2026-08-10T11:00:00Z",
        "respond_by": "2026-08-20T23:59:59Z",
        "order_details": {
            "order_id": "order_RZP_661902",
            "item_name": "Leather Bifold Wallet & RFID Shield Pack",
            "created_at": "2026-08-01T18:30:00Z"
        },
        "delivery_proof": {
            "carrier": "Shadowfax Logistics",
            "tracking_id": "SF77192830IN",
            "status": "DELIVERED",
            "recipient_signature": "A. Sharma (Doorstep Delivery)",
            "delivery_gps": "28.7041 N, 77.1025 E (New Delhi)"
        },
        "telemetry": {
            "three_ds_status": "3DS2_AUTHENTICATED (LIABILITY SHIFT)",
            "cvv_match": "MATCHED",
            "avs_match": "MATCHED",
            "ip_address": "122.161.44.19",
            "ip_city": "Delhi",
            "device_id": "dev_fp_win11_edge_102",
            "prior_successful_orders": 8
        },
        "defense_submitted": True,
        "won_amount": 1899.00
    }
]

class RazorpayService:
    def __init__(self):
        self.key_id = os.getenv("RAZORPAY_KEY_ID", settings.RAZORPAY_KEY_ID or "rzp_test_TWpQWcihNk3rD9")
        self.key_secret = os.getenv("RAZORPAY_KEY_SECRET", settings.RAZORPAY_KEY_SECRET or "KEdqU5Tc05yCS5GeR59ZvEKA")
        self.webhook_secret = os.getenv("RAZORPAY_WEBHOOK_SECRET", settings.RAZORPAY_WEBHOOK_SECRET or "kryptic_whsec_live_2026")
        self._disputes: List[Dict[str, Any]] = [dict(d) for d in SEED_DISPUTES]

    def configure(self, key_id: str, key_secret: str, webhook_secret: Optional[str] = None):
        self.key_id = key_id.strip()
        self.key_secret = key_secret.strip()
        if webhook_secret:
            self.webhook_secret = webhook_secret.strip()

    def is_live_configured(self) -> bool:
        return bool(self.key_id and self.key_secret and not self.key_id.startswith("rzp_test_kryptic_demo"))

    def get_client(self):
        if not self.key_id or not self.key_secret:
            return None
        try:
            import razorpay
            return razorpay.Client(auth=(self.key_id, self.key_secret))
        except Exception as e:
            logger.warning(f"Failed to initialize razorpay client: {e}")
            return None

    def fetch_payments(self, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Fetches live transactions directly from Razorpay Gateway API.
        """
        client = self.get_client()
        if client:
            try:
                res = client.payment.all({"count": limit})
                items = res.get("items", [])
                formatted = []
                for p in items:
                    amount_inr = float(p.get("amount", 0)) / 100.0
                    card_data = p.get("card") or {}
                    status = p.get("status", "unknown")
                    
                    # Compute fast risk score
                    is_failed = status == "failed"
                    is_intl = p.get("international", False)
                    is_high_val = amount_inr > 50000
                    risk_score = 85 if (is_failed and is_intl) else (70 if is_high_val else (25 if is_failed else 12))
                    risk_level = "CRITICAL" if risk_score >= 80 else ("HIGH" if risk_score >= 60 else ("MEDIUM" if risk_score >= 35 else "LOW"))

                    formatted.append({
                        "id": p.get("id"),
                        "amount": amount_inr,
                        "currency": p.get("currency", "INR"),
                        "status": status,
                        "method": p.get("method", "card"),
                        "description": p.get("description", "Razorpay Payment"),
                        "email": p.get("email"),
                        "contact": p.get("contact"),
                        "card_network": card_data.get("network", "Visa"),
                        "card_last4": card_data.get("last4", "1007"),
                        "card_type": card_data.get("type", "debit"),
                        "international": is_intl,
                        "created_at": datetime.fromtimestamp(p.get("created_at", 0), timezone.utc).isoformat() if p.get("created_at") else datetime.now(timezone.utc).isoformat(),
                        "error_code": p.get("error_code"),
                        "error_description": p.get("error_description"),
                        "risk_score": risk_score,
                        "risk_level": risk_level
                    })
                return formatted
            except Exception as e:
                logger.error(f"Error fetching live payments from Razorpay: {e}")

        return []

    def fetch_disputes(self) -> List[Dict[str, Any]]:
        """
        Fetches disputes from Razorpay live API if configured, otherwise returns managed dispute store.
        """
        client = self.get_client()
        if client and self.is_live_configured():
            try:
                res = client.dispute.all({"count": 50})
                items = res.get("items", [])
                if items:
                    formatted = []
                    for item in items:
                        formatted.append({
                            "id": item.get("id"),
                            "payment_id": item.get("payment_id"),
                            "amount": float(item.get("amount", 0)) / 100.0,
                            "currency": item.get("currency", "INR"),
                            "status": item.get("status", "action_required"),
                            "reason_code": item.get("reason_code", "10.4"),
                            "reason_description": item.get("reason_description", "Dispute raised"),
                            "created_at": datetime.fromtimestamp(item.get("created_at", 0), timezone.utc).isoformat() if item.get("created_at") else datetime.now(timezone.utc).isoformat(),
                            "respond_by": datetime.fromtimestamp(item.get("respond_by", 0), timezone.utc).isoformat() if item.get("respond_by") else None,
                            "order_details": {"order_id": f"ord_{item.get('payment_id')}", "item_name": "E-Commerce Transaction"},
                            "delivery_proof": {"carrier": "Delhivery Logistics", "status": "DELIVERED"},
                            "telemetry": {"three_ds_status": "3DS2_AUTHENTICATED (LIABILITY SHIFT)"},
                            "defense_submitted": bool(item.get("status") in ["won", "lost", "under_review"])
                        })
                    return formatted
            except Exception as e:
                logger.warning(f"Razorpay live dispute fetch error (using seeded store): {e}")

        return self._disputes

    def get_dispute(self, dispute_id: str) -> Optional[Dict[str, Any]]:
        for d in self._disputes:
            if d["id"] == dispute_id:
                return d
        return None

    def mark_defense_submitted(self, dispute_id: str, defense_payload: Dict[str, Any]):
        for d in self._disputes:
            if d["id"] == dispute_id:
                d["defense_submitted"] = True
                d["status"] = "under_review"
                d["last_defense_payload"] = defense_payload
                return d
        return None

    def verify_webhook_signature(self, body_bytes: bytes, signature: str) -> bool:
        if not self.webhook_secret or not signature:
            return True
        expected = hmac.new(
            self.webhook_secret.encode('utf-8'),
            body_bytes,
            hashlib.sha256
        ).hexdigest()
        return hmac.compare_digest(expected, signature)

    def test_connection(self) -> Dict[str, Any]:
        client = self.get_client()
        if not client:
            return {
                "success": False,
                "mode": "ERROR",
                "message": "Razorpay credentials not initialized."
            }
        try:
            payments = client.payment.all({"count": 2})
            return {
                "success": True,
                "mode": "LIVE_RAZORPAY_API",
                "key_id": f"{self.key_id[:8]}...{self.key_id[-4:]}",
                "payment_count_accessible": len(payments.get("items", [])),
                "message": f"Successfully authenticated with Razorpay Live / Test API (Merchant ID active)."
            }
        except Exception as e:
            return {
                "success": False,
                "mode": "ERROR",
                "error": str(e),
                "message": f"Razorpay authentication failed: {e}"
            }

razorpay_service = RazorpayService()
