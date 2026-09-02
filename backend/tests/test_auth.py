import uuid


def test_login_success(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@kryptic.io",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "test@kryptic.io"


def test_login_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "test@kryptic.io",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_get_current_user_profile(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@kryptic.io"
    assert data["full_name"] == "Test Risk Engineer"


def test_register_new_user(client):
    rand_hex = uuid.uuid4().hex[:6]
    unique_email = f"new_analyst_{rand_hex}@kryptic.io"
    response = client.post("/api/v1/auth/register", json={
        "email": unique_email,
        "password": "strongPassword123!",
        "full_name": "New Fraud Specialist",
        "role": "analyst",
        "organization_slug": "apex-merchants"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == unique_email
    assert data["role"] == "analyst"
