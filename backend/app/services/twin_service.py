from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session

from app.models.twin import TwinTopology, TwinNode, TwinEdge
from app.models.payment_system import PaymentSystem
from app.schemas.twin import TwinTopologyConfig, TwinNodeSchema, TwinEdgeSchema, TwinStateResponse, NodeStatusUpdate
from app.redis_client import redis_client


class TwinService:
    @classmethod
    def get_or_create_default_topology(cls, db: Session, system_id: str) -> TwinTopology:
        topology = db.query(TwinTopology).filter(
            TwinTopology.system_id == system_id,
            TwinTopology.is_active == True
        ).first()

        if topology:
            return topology

        # Create standard initial topology for this payment system
        sys = db.query(PaymentSystem).filter(PaymentSystem.id == system_id).first()
        sys_name = sys.name if sys else "Default System"

        topology = TwinTopology(
            system_id=system_id,
            name=f"{sys_name} Payment Flow Topology",
            version="1.0.0",
            description="Dynamic Digital Twin Graph representing complete transaction lifecycle."
        )
        db.add(topology)
        db.commit()
        db.refresh(topology)

        # Standard 7-stage topology nodes
        nodes_def = [
            {"key": "entry_gateway", "name": "API Entry Gateway", "layer": "ENTRY", "type": "gateway", "x": 100, "y": 200, "latency": 5.0},
            {"key": "auth_service", "name": "Auth & Tokenization", "layer": "AUTHENTICATION", "type": "service", "x": 300, "y": 200, "latency": 12.0},
            {"key": "risk_engine", "name": "KRYPTIC Risk Engine", "layer": "RISK_ENGINE", "type": "service", "x": 500, "y": 200, "latency": 18.0},
            {"key": "smart_router", "name": "Smart Payment Router", "layer": "ROUTER", "type": "service", "x": 700, "y": 200, "latency": 8.0},
            {"key": "card_processor", "name": "Acquiring Processor", "layer": "PROCESSOR", "type": "service", "x": 900, "y": 200, "latency": 45.0},
            {"key": "issuer_auth", "name": "Card Scheme & Issuer", "layer": "AUTHORIZATION", "type": "third_party", "x": 1100, "y": 200, "latency": 60.0},
            {"key": "settlement_ledger", "name": "Settlement & Clearing", "layer": "SETTLEMENT", "type": "database", "x": 1300, "y": 200, "latency": 25.0},
        ]

        node_map = {}
        for n in nodes_def:
            node = TwinNode(
                topology_id=topology.id,
                node_key=n["key"],
                name=n["name"],
                layer=n["layer"],
                node_type=n["type"],
                status="healthy",
                tps=12.5,
                error_rate=0.01,
                latency_ms=n["latency"],
                risk_level="LOW",
                position_x=n["x"],
                position_y=n["y"]
            )
            db.add(node)
            db.flush()
            node_map[n["key"]] = node

        # Sequential Flow Edges
        edge_pairs = [
            ("entry_gateway", "auth_service"),
            ("auth_service", "risk_engine"),
            ("risk_engine", "smart_router"),
            ("smart_router", "card_processor"),
            ("card_processor", "issuer_auth"),
            ("issuer_auth", "settlement_ledger"),
        ]

        for src, tgt in edge_pairs:
            edge = TwinEdge(
                topology_id=topology.id,
                source_node_id=node_map[src].id,
                target_node_id=node_map[tgt].id,
                edge_type="data_flow",
                latency_ms=5.0,
                weight=1.0,
                status="active"
            )
            db.add(edge)

        db.commit()
        db.refresh(topology)
        return topology

    @classmethod
    def get_twin_state(cls, db: Session, system_id: Optional[str] = None) -> TwinStateResponse:
        if not system_id:
            first_sys = db.query(PaymentSystem).filter(PaymentSystem.is_active == True).first()
            if not first_sys:
                raise ValueError("No active payment system found. Please seed the database first.")
            system_id = first_sys.id

        topology = cls.get_or_create_default_topology(db, system_id)
        sys = db.query(PaymentSystem).filter(PaymentSystem.id == system_id).first()
        sys_name = sys.name if sys else "Primary Payment System"

        nodes = db.query(TwinNode).filter(TwinNode.topology_id == topology.id).all()
        edges = db.query(TwinEdge).filter(TwinEdge.topology_id == topology.id).all()

        node_id_to_key = {n.id: n.node_key for n in nodes}

        # Check Redis for live overrides if any
        node_schemas: List[TwinNodeSchema] = []
        total_tps = 0.0
        total_latency = 0.0
        max_risk = "LOW"
        has_anomalous = False

        for n in nodes:
            cached_state = redis_client.get_json(f"twin_node:{n.node_key}")
            status = cached_state.get("status", n.status) if cached_state else n.status
            risk_level = cached_state.get("risk_level", n.risk_level) if cached_state else n.risk_level
            tps = cached_state.get("tps", n.tps) if cached_state else n.tps
            latency = cached_state.get("latency_ms", n.latency_ms) if cached_state else n.latency_ms
            err_rate = cached_state.get("error_rate", n.error_rate) if cached_state else n.error_rate

            total_tps += tps
            total_latency += latency
            if risk_level in ["CRITICAL", "HIGH"]:
                max_risk = risk_level
                has_anomalous = True
            elif risk_level == "MEDIUM" and max_risk != "CRITICAL":
                max_risk = "MEDIUM"

            node_schemas.append(TwinNodeSchema(
                id=n.id,
                node_key=n.node_key,
                name=n.name,
                layer=n.layer,
                node_type=n.node_type,
                status=status,
                tps=round(tps, 2),
                error_rate=round(err_rate, 4),
                latency_ms=round(latency, 2),
                risk_level=risk_level,
                position_x=n.position_x,
                position_y=n.position_y,
                metadata_json=n.metadata_json or {}
            ))

        edge_schemas: List[TwinEdgeSchema] = []
        for e in edges:
            src_key = node_id_to_key.get(e.source_node_id, "unknown")
            tgt_key = node_id_to_key.get(e.target_node_id, "unknown")
            edge_schemas.append(TwinEdgeSchema(
                id=e.id,
                source_node_key=src_key,
                target_node_key=tgt_key,
                edge_type=e.edge_type,
                latency_ms=e.latency_ms,
                weight=e.weight,
                status=e.status,
                metadata_json=e.metadata_json or {}
            ))

        overall_health = "CRITICAL" if max_risk == "CRITICAL" else ("DEGRADED" if has_anomalous else "HEALTHY")

        return TwinStateResponse(
            topology_id=topology.id,
            system_id=system_id,
            system_name=sys_name,
            version=topology.version,
            overall_health=overall_health,
            active_risk_level=max_risk,
            total_tps=round(total_tps, 2),
            avg_latency_ms=round(total_latency / max(1, len(nodes)), 2),
            nodes=node_schemas,
            edges=edge_schemas,
            timestamp=datetime.now(timezone.utc)
        )

    @classmethod
    def save_topology_config(cls, db: Session, config: TwinTopologyConfig) -> TwinTopology:
        """Stores custom, merchant-specific payment flow topologies as data."""
        # Archive previous active topologies for system
        db.query(TwinTopology).filter(TwinTopology.system_id == config.system_id).update({"is_active": False})

        new_topo = TwinTopology(
            system_id=config.system_id,
            name=config.name,
            version=config.version,
            description=config.description,
            is_active=True,
            metadata_json=config.metadata_json or {}
        )
        db.add(new_topo)
        db.flush()

        node_map = {}
        for n in config.nodes:
            node = TwinNode(
                topology_id=new_topo.id,
                node_key=n.node_key,
                name=n.name,
                layer=n.layer,
                node_type=n.node_type,
                status=n.status,
                tps=n.tps,
                error_rate=n.error_rate,
                latency_ms=n.latency_ms,
                risk_level=n.risk_level,
                position_x=n.position_x,
                position_y=n.position_y,
                metadata_json=n.metadata_json
            )
            db.add(node)
            db.flush()
            node_map[n.node_key] = node

        for e in config.edges:
            src_node = node_map.get(e.source_node_key)
            tgt_node = node_map.get(e.target_node_key)
            if src_node and tgt_node:
                edge = TwinEdge(
                    topology_id=new_topo.id,
                    source_node_id=src_node.id,
                    target_node_id=tgt_node.id,
                    edge_type=e.edge_type,
                    latency_ms=e.latency_ms,
                    weight=e.weight,
                    status=e.status,
                    metadata_json=e.metadata_json
                )
                db.add(edge)

        db.commit()
        db.refresh(new_topo)
        return new_topo

    @classmethod
    def update_node_status(cls, db: Session, update: NodeStatusUpdate) -> Optional[TwinNode]:
        node = db.query(TwinNode).filter(TwinNode.node_key == update.node_key).first()
        if not node:
            return None

        node.status = update.status
        if update.risk_level:
            node.risk_level = update.risk_level
        if update.error_rate is not None:
            node.error_rate = update.error_rate
        if update.tps is not None:
            node.tps = update.tps

        # Cache in Redis
        redis_client.set_json(f"twin_node:{node.node_key}", {
            "status": node.status,
            "risk_level": node.risk_level,
            "error_rate": node.error_rate,
            "tps": node.tps,
            "latency_ms": node.latency_ms
        }, expire_seconds=3600)

        db.commit()
        db.refresh(node)
        return node


twin_service = TwinService()
