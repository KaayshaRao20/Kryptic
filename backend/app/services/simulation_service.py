import asyncio
import logging
import random
import time
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.simulation import Simulation, SimulationEvent
from app.models.payment_system import PaymentSystem
from app.models.user import Organization
from app.models.twin import TwinTopology
from app.schemas.simulation import SimulationCreateRequest, SimulationResponse, ScenarioConfig
from app.schemas.transaction import TransactionCreate
from app.schemas.risk import RiskPredictRequest
from app.services.transaction_service import transaction_service
from app.services.risk_service import risk_service
from app.services.twin_service import twin_service
from app.services.risk_propagation_service import risk_propagation_service
from app.services.metrics_service import metrics_service
from app.services.websocket_manager import ws_manager
from app.redis_client import redis_client

logger = logging.getLogger(__name__)


class SimulationService:
    @classmethod
    def create_simulation(cls, db: Session, req: SimulationCreateRequest) -> Simulation:
        org = db.query(Organization).filter(Organization.slug == req.organization_slug).first()
        if not org:
            org = db.query(Organization).first()

        system_id = req.system_id
        if not system_id and org:
            first_sys = db.query(PaymentSystem).filter(PaymentSystem.organization_id == org.id).first()
            if first_sys:
                system_id = first_sys.id

        sim = Simulation(
            organization_id=org.id if org else "org_default",
            system_id=system_id,
            scenario_type=req.scenario_type.upper(),
            status="IDLE",
            total_events=req.total_events,
            current_step=0,
            tps=req.tps,
            fraud_injection_rate=req.fraud_injection_rate,
            config_json=req.custom_parameters or {}
        )
        db.add(sim)
        db.commit()
        db.refresh(sim)
        return sim

    @classmethod
    async def run_simulation_async(cls, simulation_id: str, db: Optional[Session] = None):
        """Asynchronous execution loop for the simulation run."""
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
            if not sim:
                logger.error(f"Simulation {simulation_id} not found.")
                return

            sim.status = "PREPARING"
            db.commit()

            # Ensure twin topology exists
            topo = twin_service.get_or_create_default_topology(db, sim.system_id)

            sim.status = "RUNNING"
            sim.started_at = datetime.now(timezone.utc)
            db.commit()

            # Broadcast start
            await ws_manager.broadcast_event("SIMULATION_STARTED", {
                "simulation_id": sim.id,
                "scenario_type": sim.scenario_type,
                "total_events": sim.total_events,
                "tps": sim.tps,
                "system_id": sim.system_id
            })

            delay_per_step = max(0.001, 1.0 / max(1.0, sim.tps))
            scenario = sim.scenario_type

            for step in range(1, sim.total_events + 1):
                # Check cancellation in redis
                stop_signal = redis_client.get_json(f"sim_stop:{sim.id}")
                if stop_signal:
                    sim.status = "PAUSED"
                    db.commit()
                    break

                # 1. Determine fraud injection logic for this step based on scenario
                is_fraud = False
                if scenario == "FRAUD_SPIKE":
                    is_fraud = (step % 3 == 0) or (random.random() < sim.fraud_injection_rate)
                elif scenario == "HIGH_VELOCITY":
                    is_fraud = (random.random() < 0.2)
                elif scenario == "COORDINATED_ATTACK":
                    is_fraud = step > (sim.total_events // 2) or (random.random() < 0.5)
                elif scenario == "BEHAVIORAL_ANOMALY":
                    is_fraud = random.random() < sim.fraud_injection_rate
                else:
                    is_fraud = random.random() < sim.fraud_injection_rate

                # 2. Generate and store transaction
                entity_id = f"sim_user_{step % 5 if scenario in ['HIGH_VELOCITY', 'COORDINATED_ATTACK'] else step}"
                amount = round(random.uniform(2500, 9900) if is_fraud else random.uniform(15, 300), 2)
                tx_in = TransactionCreate(
                    transaction_id=f"TX_SIM_{sim.id[:6]}_{step:04d}",
                    system_id=sim.system_id,
                    entity_id=entity_id,
                    amount=amount,
                    currency="USD",
                    transaction_type="WITHDRAWAL" if (is_fraud and random.random() < 0.5) else "PAYMENT",
                    device_id=f"dev_sim_{random.randint(1, 4)}",
                    ip_address=f"198.51.100.{random.randint(1, 254)}",
                    status="FLAGGED" if is_fraud else "PROCESSED",
                    is_fraud_ground_truth=1 if is_fraud else 0,
                    metadata_json={
                        "simulation_id": sim.id,
                        "step": step,
                        "scenario": scenario,
                        "is_injected_fraud": is_fraud,
                        "velocity_1h": 12 if scenario == "HIGH_VELOCITY" else (8 if is_fraud else 1),
                        "vpn_detected": is_fraud
                    }
                )
                tx = transaction_service.create_transaction(db, tx_in)

                await ws_manager.broadcast_event("TRANSACTION_CREATED", {
                    "transaction_id": tx.transaction_id,
                    "amount": tx.amount,
                    "entity_id": tx.entity_id,
                    "is_injected_fraud": is_fraud,
                    "step": step,
                    "total_events": sim.total_events
                })

                # 3. Evaluate Risk via ML/Dummy Predictor
                start_eval = time.time()
                pred_req = RiskPredictRequest(
                    transaction_id=tx.transaction_id,
                    system_id=sim.system_id,
                    entity_id=tx.entity_id,
                    amount=tx.amount,
                    currency=tx.currency,
                    device_id=tx.device_id,
                    ip_address=tx.ip_address,
                    transaction_type=tx.transaction_type,
                    metadata_json=tx.metadata_json
                )
                pred = await risk_service.evaluate_transaction(db, pred_req)
                latency_ms = round((time.time() - start_eval) * 1000 + 5.0, 2)

                is_detected = pred.risk_level in ["HIGH", "CRITICAL"]

                # 4. Create simulation event record
                sim_ev = SimulationEvent(
                    simulation_id=sim.id,
                    step=step,
                    event_type="TRANSACTION_EVALUATION",
                    transaction_id=tx.transaction_id,
                    is_injected_fraud=is_fraud,
                    is_detected=is_detected,
                    predicted_risk_level=pred.risk_level,
                    fraud_probability=pred.fraud_probability,
                    latency_ms=latency_ms,
                    payload_json={
                        "signals": [s.name for s in pred.risk_signals],
                        "action": pred.action_recommended
                    }
                )
                db.add(sim_ev)

                # 5. If high risk, trigger risk propagation on Digital Twin
                if is_detected and (step % 2 == 0 or scenario == "COORDINATED_ATTACK"):
                    affected = await risk_propagation_service.propagate_risk(
                        db=db,
                        topology_id=topo.id,
                        origin_node_key="risk_engine",
                        initial_risk_level=pred.risk_level,
                        propagation_depth=2
                    )

                sim.current_step = step
                db.commit()

                # 6. Broadcast progress
                await ws_manager.broadcast_event("SIMULATION_PROGRESS", {
                    "simulation_id": sim.id,
                    "current_step": step,
                    "total_events": sim.total_events,
                    "progress_pct": round((step / sim.total_events) * 100.0, 1),
                    "last_transaction_id": tx.transaction_id,
                    "last_risk_level": pred.risk_level,
                    "fraud_probability": pred.fraud_probability
                })

                if delay_per_step > 0.01:
                    await asyncio.sleep(delay_per_step)

            # Simulation Completed
            sim.status = "COMPLETED"
            sim.completed_at = datetime.now(timezone.utc)
            db.commit()

            # Calculate and save metrics
            eval_metrics = metrics_service.calculate_simulation_metrics(db, sim.id)

            await ws_manager.broadcast_event("SIMULATION_COMPLETED", {
                "simulation_id": sim.id,
                "status": "COMPLETED",
                "completed_at": str(sim.completed_at),
                "metrics": eval_metrics.model_dump() if hasattr(eval_metrics, "model_dump") else eval_metrics.dict()
            })
            logger.info(f"Simulation {sim.id} completed successfully.")

        except Exception as e:
            logger.exception(f"Simulation {simulation_id} failed: {e}")
            sim = db.query(Simulation).filter(Simulation.id == simulation_id).first()
            if sim:
                sim.status = "FAILED"
                sim.error_message = str(e)
                db.commit()
        finally:
            if close_session:
                db.close()

    @classmethod
    def get_simulation(cls, db: Session, simulation_id: str) -> Optional[Simulation]:
        return db.query(Simulation).filter(Simulation.id == simulation_id).first()

    @classmethod
    def get_supported_scenarios(cls) -> List[Dict[str, Any]]:
        return [
            {
                "id": "FRAUD_SPIKE",
                "name": "Fraud Spike Attack",
                "description": "Sudden burst of stolen credential operations mixed with high-value transactions.",
                "default_tps": 10.0,
                "default_events": 30,
                "target_node": "risk_engine"
            },
            {
                "id": "HIGH_VELOCITY",
                "name": "High Velocity / Carding Attack",
                "description": "Rapid automated micro-transactions probing card validity at extreme frequency.",
                "default_tps": 25.0,
                "default_events": 50,
                "target_node": "auth_service"
            },
            {
                "id": "COORDINATED_ATTACK",
                "name": "Coordinated Multi-Vector Attack",
                "description": "Distributed syndicate targeting multiple nodes simultaneously with cascading stress.",
                "default_tps": 15.0,
                "default_events": 40,
                "target_node": "entry_gateway"
            },
            {
                "id": "BEHAVIORAL_ANOMALY",
                "name": "Stealth Behavioral Divergence",
                "description": "Subtle geographic and device biometrics shifts designed to evade simple rule engines.",
                "default_tps": 5.0,
                "default_events": 25,
                "target_node": "smart_router"
            },
            {
                "id": "CUSTOM",
                "name": "Custom Dynamic Scenario",
                "description": "User-configured load profile, injection rate, and target twin component.",
                "default_tps": 5.0,
                "default_events": 20,
                "target_node": "risk_engine"
            }
        ]


simulation_service = SimulationService()
