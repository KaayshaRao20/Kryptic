import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter, Request, Header, HTTPException, status
from pydantic import BaseModel

from app.services.razorpay_service import razorpay_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/razorpay", tags=["Razorpay Gateway"])

class SyncRequest(BaseModel):
    limit: Optional[int] = 50

@router.get("/status", response_model=Dict[str, Any])
def get_razorpay_status():
    """Checks the health and authentication state of Razorpay API connection."""
    return razorpay_service.test_connection()

@router.get("/payments", response_model=Dict[str, Any])
def get_razorpay_payments(limit: int = 20):
    """Fetches real live payments from the configured Razorpay merchant account."""
    payments = razorpay_service.fetch_payments(limit=limit)
    return {
        "status": "success",
        "count": len(payments),
        "payments": payments
    }

@router.post("/sync", response_model=Dict[str, Any])
def sync_razorpay_disputes(req: SyncRequest):
    """Triggers an on-demand sync of disputes from Razorpay API."""
    disputes = razorpay_service.fetch_disputes()
    return {
        "status": "synced",
        "count": len(disputes),
        "disputes": disputes
    }

@router.post("/webhook", response_model=Dict[str, Any])
async def handle_razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Receives incoming Razorpay webhook events (e.g. dispute.created, dispute.won, payment.failed, payment.captured)
    and processes them into the AI risk pipeline.
    """
    body_bytes = await request.body()
    is_valid = razorpay_service.verify_webhook_signature(body_bytes, x_razorpay_signature or "")

    try:
        import json
        payload = json.loads(body_bytes.decode('utf-8'))
        event_name = payload.get("event", "unknown")
        logger.info(f"Received Razorpay Webhook Event: {event_name} (Signature Valid: {is_valid})")

        # Handle specific events
        if event_name.startswith("dispute."):
            disp_data = payload.get("payload", {}).get("dispute", {}).get("entity", {})
            logger.info(f"Dispute webhook processed: {disp_data.get('id')}")

        return {
            "received": True,
            "event": event_name,
            "signature_valid": is_valid
        }
    except Exception as e:
        logger.error(f"Error parsing Razorpay webhook: {e}")
        return {"received": True, "error": str(e)}
