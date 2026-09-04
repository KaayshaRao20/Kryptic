import logging
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, status

from app.services.rto_service import rto_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/returns", tags=["Return & RTO Risk Scorer"])

class OrderScoreRequest(BaseModel):
    order_id: str = Field(..., json_schema_extra={"example": "ORD_IN_9901"})
    customer_name: str = Field(..., json_schema_extra={"example": "Rohan Deshmukh"})
    phone: str = Field(..., json_schema_extra={"example": "+91 98201 44821"})
    email: str = Field(..., json_schema_extra={"example": "rohan.d@gmail.com"})
    pin_code: str = Field(..., json_schema_extra={"example": "400050"})
    city: str = Field("Mumbai", json_schema_extra={"example": "Mumbai"})
    state: str = Field("Maharashtra", json_schema_extra={"example": "Maharashtra"})
    product_category: str = Field("Apparel & Fast Fashion", json_schema_extra={"example": "Apparel & Fast Fashion"})
    order_value: float = Field(..., json_schema_extra={"example": 3499.00})
    payment_method: str = Field("COD", json_schema_extra={"example": "COD"})
    historical_return_rate: float = Field(0.15, json_schema_extra={"example": 0.15})
    account_age_days: int = Field(30, json_schema_extra={"example": 30})

@router.post("/score", response_model=Dict[str, Any])
async def score_ecommerce_order(req: OrderScoreRequest):
    """
    Evaluates an incoming e-commerce order for Return-to-Origin (RTO) and return abuse risk.
    """
    result = await rto_service.score_order(
        order_id=req.order_id,
        customer_name=req.customer_name,
        phone=req.phone,
        email=req.email,
        pin_code=req.pin_code,
        city=req.city,
        state=req.state,
        product_category=req.product_category,
        order_value=req.order_value,
        payment_method=req.payment_method,
        historical_return_rate=req.historical_return_rate,
        account_age_days=req.account_age_days
    )
    return result

@router.get("/recent", response_model=List[Dict[str, Any]])
def get_recent_order_evaluations():
    """Returns recent evaluated orders with their risk classifications."""
    return rto_service.get_recent_orders()

@router.get("/metrics", response_model=Dict[str, Any])
def get_rto_metrics():
    """Returns aggregated Return & RTO loss metrics for the merchant."""
    return rto_service.get_summary_metrics()
