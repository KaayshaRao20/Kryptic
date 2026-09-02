import os
import sys
import uuid

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db
from app.models.user import User, Organization
from app.models.payment_system import PaymentSystem
from app.services.auth_service import auth_service
from app.services.twin_service import twin_service

# Clean in-memory or dedicated test database
TEST_DB_URL = "sqlite:///./kryptic_test.db"
test_engine = create_engine(TEST_DB_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    db = TestingSessionLocal()
    
    # Create test org
    org = Organization(name="Apex Global Merchants", slug="apex-merchants", tier="enterprise")
    db.add(org)
    db.commit()
    db.refresh(org)

    # Create test user
    test_user = User(
        organization_id=org.id,
        email="test@kryptic.io",
        hashed_password=auth_service.get_password_hash("testpassword123"),
        full_name="Test Risk Engineer",
        role="admin",
        is_active=True
    )
    db.add(test_user)

    # Create test payment system & twin
    sys1 = PaymentSystem(
        organization_id=org.id,
        name="Card Primary",
        code="card-primary",
        system_type="card_gateway",
        status="active"
    )
    db.add(sys1)
    db.commit()
    db.refresh(sys1)

    twin_service.get_or_create_default_topology(db, sys1.id)

    db.close()
    yield
    # Cleanup after session
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@kryptic.io",
        "password": "testpassword123"
    })
    token = response.json().get("access_token")
    return {"Authorization": f"Bearer {token}"}
