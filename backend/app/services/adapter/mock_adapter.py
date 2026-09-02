import uuid
from typing import Dict, Any
from app.services.adapter.base_adapter import BaseProviderAdapter


class MockProviderAdapter(BaseProviderAdapter):
    """
    Mock adapter demonstrating transformation of raw external gateway payloads
    (e.g., Razorpay Payments, UPI Webhooks, or custom gateways) into normalized KRYPTIC events.
    """
    def normalize_event(self, raw_payload: Dict[str, Any]) -> Dict[str, Any]:
        provider = raw_payload.get("provider", "razorpay").lower()

        if provider == "razorpay":
            # Razorpay amounts are in the smallest currency unit (e.g. paise / cents)
            raw_amount = float(raw_payload.get("amount", 0))
            # If amount is > 1000 and typical of paise, convert from paise to main currency unit
            amount = raw_amount / 100.0 if raw_amount >= 100 else raw_amount

            entity_id = (
                raw_payload.get("customer_id")
                or raw_payload.get("email")
                or raw_payload.get("contact")
                or f"cust_{uuid.uuid4().hex[:8]}"
            )

            status_raw = raw_payload.get("status", "captured").lower()
            status = "PROCESSED" if status_raw in ["captured", "authorized", "paid"] else "FAILED"

            method = raw_payload.get("method", "card")  # card, upi, netbanking, wallet
            tx_type = "TRANSFER" if method == "upi" else "PAYMENT"

            notes = raw_payload.get("notes", {}) or {}

            return {
                "transaction_id": raw_payload.get("id", f"pay_{uuid.uuid4().hex[:14]}"),
                "entity_id": entity_id,
                "amount": amount,
                "currency": raw_payload.get("currency", "INR").upper(),
                "transaction_type": tx_type,
                "device_id": notes.get("device_id") or raw_payload.get("device_id"),
                "ip_address": raw_payload.get("ip") or raw_payload.get("client_ip"),
                "status": status,
                "metadata_json": {
                    "source_provider": "razorpay",
                    "payment_method": method,
                    "order_id": raw_payload.get("order_id"),
                    "vpa": raw_payload.get("vpa"),
                    "bank": raw_payload.get("bank"),
                    "wallet": raw_payload.get("wallet"),
                    "raw_risk_score": raw_payload.get("risk_score", 0)
                }
            }
        else:
            # Standard generic gateway normalization
            return {
                "transaction_id": raw_payload.get("tx_id", f"tx_{uuid.uuid4().hex[:10]}"),
                "entity_id": raw_payload.get("entity_id", raw_payload.get("user_id", "ent_generic")),
                "amount": float(raw_payload.get("amount", 100.0)),
                "currency": raw_payload.get("currency", "INR").upper(),
                "transaction_type": raw_payload.get("type", "PAYMENT").upper(),
                "device_id": raw_payload.get("device_id"),
                "ip_address": raw_payload.get("ip_address"),
                "status": raw_payload.get("status", "PROCESSED"),
                "metadata_json": raw_payload.get("metadata", {})
            }
