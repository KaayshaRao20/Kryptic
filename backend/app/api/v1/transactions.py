from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.transaction import (
    TransactionCreate,
    TransactionResponse,
    TransactionStats,
    TransactionGenerateRequest
)
from app.services.transaction_service import transaction_service
from app.services.websocket_manager import ws_manager
from app.api.deps import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("", response_model=List[TransactionResponse])
def get_transactions(
    system_id: Optional[str] = Query(None),
    entity_id: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """Retrieves paginated list of transactions with optional filtering."""
    txs, _ = transaction_service.list_transactions(
        db, system_id=system_id, entity_id=entity_id, status=status, limit=limit, offset=offset
    )
    return [TransactionResponse.model_validate(tx) for tx in txs]


@router.post("", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db)
):
    """Ingests a new payment transaction into the engine."""
    tx = transaction_service.create_transaction(db, tx_in)
    await ws_manager.broadcast_event("TRANSACTION_CREATED", {
        "transaction_id": tx.transaction_id,
        "amount": tx.amount,
        "entity_id": tx.entity_id,
        "status": tx.status
    })
    return TransactionResponse.model_validate(tx)


@router.get("/stats/overview", response_model=TransactionStats)
def get_transaction_statistics(
    system_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Computes aggregated transaction metrics, volumes, and fraud percentages."""
    return transaction_service.get_statistics(db, system_id=system_id)


@router.get("/{transaction_id}", response_model=TransactionResponse)
def get_transaction_by_id(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves specific transaction details."""
    tx = transaction_service.get_transaction(db, transaction_id)
    if not tx:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Transaction {transaction_id} not found")
    return TransactionResponse.model_validate(tx)


@router.post("/generate", response_model=List[TransactionResponse])
def generate_synthetic_transactions(
    req: TransactionGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generates realistic synthetic transaction stream for testing."""
    txs = transaction_service.generate_dummy_transactions(
        db, count=req.count, system_id=req.system_id, fraud_ratio=req.fraud_ratio
    )
    return [TransactionResponse.model_validate(tx) for tx in txs]
