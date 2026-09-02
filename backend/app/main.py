import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.api.health import router as health_router
from app.api.v1 import api_v1_router
from app.services.prediction.base import ModelRegistry
from app.services.prediction.dummy_service import DummyPredictionService
from app.services.prediction.ml_service import MLPredictionService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("kryptic")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Database & Registries
    logger.info("Initializing KRYPTIC Engine database tables...")
    init_db()
    
    # Register trained XGBoost ML Prediction Service as active engine
    ml_service = MLPredictionService()
    ModelRegistry.register("v2.0.0-xgb-paysim", ml_service, set_active=True)
    ModelRegistry.register("v1.0.0-dummy-predictor", DummyPredictionService(), set_active=False)
    logger.info(f"KRYPTIC Engine started successfully. Active ML Model: {ModelRegistry.get_active_version()}")

    yield

    # Shutdown
    logger.info("KRYPTIC Engine shutting down.")


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Real-Time Payment Flow Digital Twin & Adaptive Risk Intelligence Backend",
    lifespan=lifespan
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS if isinstance(settings.CORS_ORIGINS, list) else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routes
app.include_router(health_router)
app.include_router(api_v1_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
