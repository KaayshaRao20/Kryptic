import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status, Body

from app.services.razorpay_service import razorpay_service
from app.services.gemini_service import gemini_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chargebacks", tags=["Chargeback Auto-Responder"])

class GenerateEvidenceRequest(BaseModel):
    dispute_id: str
    custom_instructions: Optional[str] = None
    override_delivery_carrier: Optional[str] = None
    override_tracking_id: Optional[str] = None

class SubmitEvidenceRequest(BaseModel):
    dispute_id: str
    representation_letter: str
    evidence_checklist: List[Dict[str, Any]]
    submission_notes: Optional[str] = None

@router.get("", response_model=List[Dict[str, Any]])
def list_disputes():
    """Fetches all active and historical chargebacks/disputes from Razorpay."""
    return razorpay_service.fetch_disputes()

@router.get("/{dispute_id}", response_model=Dict[str, Any])
def get_dispute_detail(dispute_id: str):
    """Retrieves detailed record and telemetry for a specific dispute."""
    dispute = razorpay_service.get_dispute(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail=f"Dispute '{dispute_id}' not found.")
    return dispute

@router.post("/generate-evidence", response_model=Dict[str, Any])
async def generate_defense_evidence(req: GenerateEvidenceRequest):
    """
    Leverages Gemini AI to analyze the dispute, parse transaction records, 
    verify 3DS liability shift, courier proof of delivery, and output a high-win-rate representation packet.
    """
    dispute = razorpay_service.get_dispute(req.dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail=f"Dispute '{req.dispute_id}' not found.")

    delivery_proof = dict(dispute.get("delivery_proof", {}))
    if req.override_delivery_carrier:
        delivery_proof["carrier"] = req.override_delivery_carrier
    if req.override_tracking_id:
        delivery_proof["tracking_id"] = req.override_tracking_id

    defense_pack = await gemini_service.generate_chargeback_defense(
        dispute_id=dispute["id"],
        transaction_id=dispute["payment_id"],
        amount=dispute["amount"],
        currency=dispute["currency"],
        reason_code=dispute["reason_code"],
        reason_description=dispute["reason_description"],
        customer_name=dispute["customer_name"],
        customer_email=dispute["customer_email"],
        customer_phone=dispute["customer_phone"],
        order_details=dispute.get("order_details", {}),
        delivery_proof=delivery_proof,
        telemetry=dispute.get("telemetry", {}),
        custom_instructions=req.custom_instructions
    )

    return {
        "dispute_id": req.dispute_id,
        "dispute": dispute,
        "defense_pack": defense_pack
    }

@router.post("/{dispute_id}/submit", response_model=Dict[str, Any])
def submit_dispute_defense(dispute_id: str, req: SubmitEvidenceRequest):
    """
    Submits the finalized representation packet directly to the Razorpay Dispute Console and bank arbitration network.
    """
    dispute = razorpay_service.get_dispute(dispute_id)
    if not dispute:
        raise HTTPException(status_code=404, detail=f"Dispute '{dispute_id}' not found.")

    updated = razorpay_service.mark_defense_submitted(dispute_id, req.model_dump())
    return {
        "status": "submitted_to_razorpay",
        "dispute_id": dispute_id,
        "timestamp": "now",
        "message": f"Representation defense packet for dispute {dispute_id} successfully submitted to Razorpay / Bank arbitration."
    }
