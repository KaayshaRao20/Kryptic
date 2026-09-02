from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.transactions import router as transactions_router
from app.api.v1.risk import router as risk_router
from app.api.v1.explain import router as explain_router
from app.api.v1.twin import router as twin_router
from app.api.v1.organizations import router as organizations_router
from app.api.v1.payment_systems import router as payment_systems_router
from app.api.v1.simulation import router as simulation_router
from app.api.v1.metrics import router as metrics_router
from app.api.v1.ws import router as ws_router

api_v1_router = APIRouter()

api_v1_router.include_router(auth_router)
api_v1_router.include_router(transactions_router)
api_v1_router.include_router(risk_router)
api_v1_router.include_router(explain_router)
api_v1_router.include_router(twin_router)
api_v1_router.include_router(organizations_router)
api_v1_router.include_router(payment_systems_router)
api_v1_router.include_router(simulation_router)
api_v1_router.include_router(metrics_router)
api_v1_router.include_router(ws_router)
