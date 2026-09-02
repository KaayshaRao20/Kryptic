import logging
from typing import List, Dict, Any, Set
from sqlalchemy.orm import Session

from app.models.twin import TwinTopology, TwinNode, TwinEdge
from app.redis_client import redis_client
from app.services.websocket_manager import ws_manager

logger = logging.getLogger(__name__)


class RiskPropagationService:
    """
    Simulates graph-based cascading risk and backpressure propagation across payment flow twin nodes.
    When a core node (e.g. Risk Engine or Auth) suffers an attack/anomaly, dependent downstream and upstream
    services experience secondary degradation, queue build-up, and elevated risk status.
    """

    @classmethod
    async def propagate_risk(
        cls,
        db: Session,
        topology_id: str,
        origin_node_key: str,
        initial_risk_level: str = "HIGH",
        propagation_depth: int = 2,
        attenuation_factor: float = 0.7
    ) -> List[Dict[str, Any]]:
        nodes = db.query(TwinNode).filter(TwinNode.topology_id == topology_id).all()
        edges = db.query(TwinEdge).filter(TwinEdge.topology_id == topology_id).all()

        node_by_id = {n.id: n for n in nodes}
        node_by_key = {n.node_key: n for n in nodes}

        if origin_node_key not in node_by_key:
            logger.warning(f"Origin node {origin_node_key} not found in topology {topology_id}")
            return []

        origin_node = node_by_key[origin_node_key]
        propagated_impacts: List[Dict[str, Any]] = []

        # Update origin node
        origin_node.status = "anomalous" if initial_risk_level in ["HIGH", "CRITICAL"] else "degraded"
        origin_node.risk_level = initial_risk_level
        origin_node.error_rate = min(0.45, origin_node.error_rate + 0.20)
        origin_node.latency_ms = origin_node.latency_ms * 2.2

        redis_client.set_json(f"twin_node:{origin_node.node_key}", {
            "status": origin_node.status,
            "risk_level": origin_node.risk_level,
            "error_rate": origin_node.error_rate,
            "latency_ms": origin_node.latency_ms,
            "tps": origin_node.tps
        }, expire_seconds=3600)

        impact_entry = {
            "node_key": origin_node.node_key,
            "name": origin_node.name,
            "layer": origin_node.layer,
            "hop_distance": 0,
            "status": origin_node.status,
            "risk_level": origin_node.risk_level,
            "error_rate": origin_node.error_rate,
            "latency_ms": origin_node.latency_ms,
            "propagation_type": "PRIMARY_SOURCE"
        }
        propagated_impacts.append(impact_entry)

        # Build adjacency graph (downstream and upstream)
        downstream_adj: Dict[str, List[str]] = {n.id: [] for n in nodes}
        for e in edges:
            downstream_adj[e.source_node_id].append(e.target_node_id)

        # Breadth-first propagation
        visited: Set[str] = {origin_node.id}
        current_level_nodes = [origin_node.id]
        current_risk_multiplier = 1.0

        for depth in range(1, propagation_depth + 1):
            next_level_nodes = []
            current_risk_multiplier *= attenuation_factor

            for parent_id in current_level_nodes:
                for child_id in downstream_adj.get(parent_id, []):
                    if child_id not in visited:
                        visited.add(child_id)
                        next_level_nodes.append(child_id)
                        child_node = node_by_id[child_id]

                        # Calculate cascading impact
                        cascading_risk = "MEDIUM" if initial_risk_level == "HIGH" else "HIGH" if initial_risk_level == "CRITICAL" else "LOW"
                        child_node.status = "degraded"
                        child_node.risk_level = cascading_risk
                        child_node.error_rate = min(0.30, child_node.error_rate + (0.10 * current_risk_multiplier))
                        child_node.latency_ms = child_node.latency_ms * (1.0 + (0.8 * current_risk_multiplier))

                        redis_client.set_json(f"twin_node:{child_node.node_key}", {
                            "status": child_node.status,
                            "risk_level": child_node.risk_level,
                            "error_rate": child_node.error_rate,
                            "latency_ms": child_node.latency_ms,
                            "tps": child_node.tps
                        }, expire_seconds=3600)

                        sub_impact = {
                            "node_key": child_node.node_key,
                            "name": child_node.name,
                            "layer": child_node.layer,
                            "hop_distance": depth,
                            "status": child_node.status,
                            "risk_level": child_node.risk_level,
                            "error_rate": round(child_node.error_rate, 4),
                            "latency_ms": round(child_node.latency_ms, 2),
                            "propagation_type": f"DOWNSTREAM_CASCADING_HOP_{depth}"
                        }
                        propagated_impacts.append(sub_impact)

            current_level_nodes = next_level_nodes

        db.commit()

        # Emit WebSocket event
        await ws_manager.broadcast_event("RISK_PROPAGATED", {
            "topology_id": topology_id,
            "origin_node_key": origin_node_key,
            "initial_risk_level": initial_risk_level,
            "affected_nodes_count": len(propagated_impacts),
            "impacts": propagated_impacts
        })

        return propagated_impacts


risk_propagation_service = RiskPropagationService()
