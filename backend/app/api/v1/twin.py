from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.twin import (
    TwinTopologyConfig,
    TwinStateResponse,
    NodeStatusUpdate,
    TwinNodeSchema
)
from app.services.twin_service import twin_service
from app.services.risk_propagation_service import risk_propagation_service
from app.services.websocket_manager import ws_manager

router = APIRouter(prefix="/twin", tags=["Payment Flow Digital Twin"])


@router.get("/state", response_model=TwinStateResponse)
def get_digital_twin_state(
    system_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Returns the live graph topology, node health, TPS, error rates, and risk state of the digital twin."""
    try:
        return twin_service.get_twin_state(db, system_id=system_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/config", response_model=TwinStateResponse)
def get_digital_twin_config(
    system_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Retrieves current topology configuration for the payment flow."""
    return twin_service.get_twin_state(db, system_id=system_id)


@router.post("/config", response_model=TwinStateResponse)
def save_digital_twin_config(
    config: TwinTopologyConfig,
    db: Session = Depends(get_db)
):
    """Allows merchants to register or customize their payment flow graph topology dynamically."""
    topo = twin_service.save_topology_config(db, config)
    return twin_service.get_twin_state(db, system_id=topo.system_id)


@router.post("/nodes/{node_key}/status", response_model=TwinNodeSchema)
async def update_node_status(
    node_key: str,
    update: NodeStatusUpdate,
    db: Session = Depends(get_db)
):
    """Manually or programmatically updates a twin component's operational status and risk level."""
    update.node_key = node_key
    node = twin_service.update_node_status(db, update)
    if not node:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Node '{node_key}' not found.")

    await ws_manager.broadcast_event("NODE_STATUS_CHANGED", {
        "node_key": node.node_key,
        "status": node.status,
        "risk_level": node.risk_level,
        "error_rate": node.error_rate,
        "tps": node.tps
    })

    return TwinNodeSchema.model_validate(node)


@router.post("/propagate-risk")
async def trigger_risk_propagation(
    origin_node_key: str = Query("risk_engine"),
    risk_level: str = Query("HIGH"),
    system_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Calculates and applies cascading graph risk propagation from an origin component."""
    state = twin_service.get_twin_state(db, system_id=system_id)
    impacts = await risk_propagation_service.propagate_risk(
        db=db,
        topology_id=state.topology_id,
        origin_node_key=origin_node_key,
        initial_risk_level=risk_level
    )
    return {
        "topology_id": state.topology_id,
        "origin_node_key": origin_node_key,
        "impacts": impacts
    }
