import asyncio
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.simulation import (
    SimulationCreateRequest,
    SimulationResponse,
    SimulationEventSchema
)
from app.models.simulation import Simulation, SimulationEvent
from app.services.simulation_service import simulation_service
from app.redis_client import redis_client

router = APIRouter(prefix="/simulation", tags=["Simulation Engine"])


@router.get("/scenarios", response_model=List[Dict[str, Any]])
def get_supported_scenarios():
    """Lists available attack and stress simulation scenarios."""
    return simulation_service.get_supported_scenarios()


@router.post("/run", response_model=SimulationResponse, status_code=status.HTTP_202_ACCEPTED)
async def run_simulation(
    req: SimulationCreateRequest,
    background_tasks: BackgroundTasks,
    sync_mode: bool = Query(False, description="Run synchronously for tests / deterministic checks"),
    db: Session = Depends(get_db)
):
    """
    Launches a real backend simulation execution.
    Generates synthetic attack transactions, passes through ML risk engine,
    updates Digital Twin nodes, triggers risk propagation, and streams live WebSocket events.
    """
    sim = simulation_service.create_simulation(db, req)

    if sync_mode:
        # Run synchronously using the current active db session
        await simulation_service.run_simulation_async(sim.id, db=db)
        db.refresh(sim)
    else:
        # Run in background task
        background_tasks.add_task(simulation_service.run_simulation_async, sim.id)

    return SimulationResponse.model_validate(sim)


@router.get("/{simulation_id}", response_model=SimulationResponse)
def get_simulation_status(
    simulation_id: str,
    db: Session = Depends(get_db)
):
    """Retrieves live status, step progress, and state of a simulation run."""
    sim = simulation_service.get_simulation(db, simulation_id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Simulation '{simulation_id}' not found.")
    return SimulationResponse.model_validate(sim)


@router.get("/{simulation_id}/events", response_model=List[SimulationEventSchema])
def get_simulation_events(
    simulation_id: str,
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    """Retrieves individual step evaluation events for a given simulation run."""
    events = db.query(SimulationEvent).filter(
        SimulationEvent.simulation_id == simulation_id
    ).order_by(SimulationEvent.step.asc()).limit(limit).all()
    return [SimulationEventSchema.model_validate(e) for e in events]


@router.post("/{simulation_id}/stop")
def stop_simulation(
    simulation_id: str,
    db: Session = Depends(get_db)
):
    """Signals a running simulation to stop/pause."""
    sim = simulation_service.get_simulation(db, simulation_id)
    if not sim:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Simulation '{simulation_id}' not found.")

    redis_client.set_json(f"sim_stop:{simulation_id}", {"stopped_at": "now"}, expire_seconds=300)
    sim.status = "PAUSED"
    db.commit()
    return {"status": "stopping_requested", "simulation_id": simulation_id}
