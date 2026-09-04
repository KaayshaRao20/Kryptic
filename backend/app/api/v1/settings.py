import logging
from typing import Dict, Any, Optional
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.razorpay_service import razorpay_service
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/settings", tags=["Integration Settings"])

class UpdateKeysRequest(BaseModel):
    razorpay_key_id: Optional[str] = None
    razorpay_key_secret: Optional[str] = None
    razorpay_webhook_secret: Optional[str] = None
    gemini_api_key: Optional[str] = None

@router.get("/keys", response_model=Dict[str, Any])
def get_key_status():
    """Returns whether live credentials are configured without exposing private secrets."""
    return {
        "razorpay_configured": bool(razorpay_service.key_id and not razorpay_service.key_id.startswith("rzp_test_kryptic_demo")),
        "razorpay_key_id_masked": f"{razorpay_service.key_id[:8]}...{razorpay_service.key_id[-4:]}" if len(razorpay_service.key_id) > 10 else "rzp_test_demo",
        "gemini_configured": gemini_service.is_configured(),
        "gemini_api_key_masked": f"{gemini_service.api_key[:6]}...{gemini_service.api_key[-4:]}" if len(gemini_service.api_key) > 10 else "not_configured"
    }

@router.post("/keys", response_model=Dict[str, Any])
def update_keys(req: UpdateKeysRequest):
    """Updates runtime credentials for Razorpay and Gemini AI."""
    if req.razorpay_key_id and req.razorpay_key_secret:
        razorpay_service.configure(
            key_id=req.razorpay_key_id,
            key_secret=req.razorpay_key_secret,
            webhook_secret=req.razorpay_webhook_secret
        )
    if req.gemini_api_key:
        gemini_service.set_api_key(req.gemini_api_key)

    return {
        "status": "updated",
        "razorpay_status": razorpay_service.test_connection(),
        "gemini_configured": gemini_service.is_configured()
    }

@router.post("/test-connection", response_model=Dict[str, Any])
def test_all_connections():
    """Tests live API connectivity for Razorpay and Gemini."""
    rzp_res = razorpay_service.test_connection()
    gemini_status = {
        "configured": gemini_service.is_configured(),
        "model": "gemini-2.5-flash",
        "status": "READY" if gemini_service.is_configured() else "USING_KRYPTIC_AI_FALLBACK"
    }
    return {
        "razorpay": rzp_res,
        "gemini": gemini_status
    }
