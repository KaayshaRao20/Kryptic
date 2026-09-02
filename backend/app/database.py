import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.config import settings

logger = logging.getLogger(__name__)

# Determine if URL is sqlite or postgresql for connect_args
connect_args = {}
engine_kwargs = {"echo": settings.DB_ECHO}

db_url = settings.DATABASE_URL
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    engine_kwargs["pool_size"] = settings.DB_POOL_SIZE
    engine_kwargs["max_overflow"] = settings.DB_MAX_OVERFLOW
    engine_kwargs["pool_pre_ping"] = True

try:
    engine = create_engine(db_url, connect_args=connect_args, **engine_kwargs)
    # Test connection
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
    logger.info(f"Connected to primary database: {db_url.split('@')[-1] if '@' in db_url else db_url}")
except Exception as e:
    logger.warning(f"Could not connect to configured DB ({db_url}): {e}. Using resilient local database fallback (sqlite:///./kryptic_local.db).")
    fallback_url = "sqlite:///./kryptic_local.db"
    engine = create_engine(fallback_url, connect_args={"check_same_thread": False}, echo=settings.DB_ECHO)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """FastAPI Dependency for database session management."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_db_health() -> dict:
    """Verifies database connectivity and returns status."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return {
            "status": "healthy",
            "dialect": engine.dialect.name,
            "connected": True
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "connected": False
        }


def init_db():
    """Initializes database schema and tables."""
    # Import all models to ensure metadata registration
    import app.models  # noqa: F401
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables initialized successfully.")
