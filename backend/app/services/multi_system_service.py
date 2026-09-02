from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.user import Organization
from app.models.payment_system import PaymentSystem, SystemConnection
from app.models.transaction import Transaction
from app.schemas.organization import (
    OrganizationResponse,
    PaymentSystemResponse,
    SystemConnectionResponse,
    MultiSystemRingResponse
)


class MultiSystemService:
    @classmethod
    def get_organization_ring(cls, db: Session, organization_slug: str = "apex-merchants") -> MultiSystemRingResponse:
        org = db.query(Organization).filter(Organization.slug == organization_slug).first()
        if not org:
            # Fallback to first organization
            org = db.query(Organization).first()
            if not org:
                raise ValueError(f"Organization '{organization_slug}' not found.")

        systems = db.query(PaymentSystem).filter(PaymentSystem.organization_id == org.id).all()
        system_ids = [s.id for s in systems]

        connections = db.query(SystemConnection).filter(
            SystemConnection.source_system_id.in_(system_ids),
            SystemConnection.target_system_id.in_(system_ids)
        ).all()

        sys_map = {s.id: s.name for s in systems}

        # Calculate cross-system entity correlation count
        correlated_count = db.query(Transaction.entity_id).filter(
            Transaction.system_id.in_(system_ids)
        ).group_by(Transaction.entity_id).having(func.count(func.distinct(Transaction.system_id)) > 1).count()

        sys_responses = [PaymentSystemResponse.from_orm(s) for s in systems]
        conn_responses = []
        for c in connections:
            conn_responses.append(SystemConnectionResponse(
                id=c.id,
                source_system_id=c.source_system_id,
                target_system_id=c.target_system_id,
                source_system_name=sys_map.get(c.source_system_id),
                target_system_name=sys_map.get(c.target_system_id),
                connection_type=c.connection_type,
                latency_ms=c.latency_ms,
                bandwidth_tps=c.bandwidth_tps,
                status=c.status,
                metadata_json=c.metadata_json or {}
            ))

        has_degraded = any(s.status != "active" for s in systems) or any(c.status != "healthy" for c in connections)
        ring_health = "DEGRADED" if has_degraded else "OPTIMAL"

        return MultiSystemRingResponse(
            organization_id=org.id,
            organization_name=org.name,
            systems=sys_responses,
            connections=conn_responses,
            correlated_entities_count=correlated_count,
            ring_health=ring_health
        )

    @staticmethod
    def list_payment_systems(db: Session, org_id: Optional[str] = None) -> List[PaymentSystem]:
        query = db.query(PaymentSystem).filter(PaymentSystem.is_active == True)
        if org_id:
            query = query.filter(PaymentSystem.organization_id == org_id)
        return query.all()


multi_system_service = MultiSystemService()
