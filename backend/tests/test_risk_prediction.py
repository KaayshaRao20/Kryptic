def test_risk_prediction_normal_transaction(client):
    req = {
        "transaction_id": "TX_PRED_NORMAL_01",
        "entity_id": "ent_good_customer",
        "amount": 45.00,
        "currency": "USD",
        "device_id": "dev_trusted",
        "ip_address": "74.125.20.1",
        "metadata_json": {"velocity_1h": 1}
    }
    res = client.post("/api/v1/risk/predict", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["transaction_id"] == "TX_PRED_NORMAL_01"
    assert data["fraud_probability"] < 0.35
    assert data["risk_level"] in ["LOW", "MEDIUM"]
    assert data["action_recommended"] in ["APPROVE", "REVIEW"]


def test_risk_prediction_fraud_outlier(client):
    req = {
        "transaction_id": "TX_PRED_FRAUD_01",
        "entity_id": "ent_attacker_01",
        "amount": 9500.00,
        "currency": "USD",
        "transaction_type": "WITHDRAWAL",
        "metadata_json": {
            "is_injected_fraud": True,
            "velocity_1h": 15,
            "vpn_detected": True
        }
    }
    res = client.post("/api/v1/risk/predict", json=req)
    assert res.status_code == 200
    data = res.json()
    assert data["transaction_id"] == "TX_PRED_FRAUD_01"
    assert data["fraud_probability"] >= 0.50
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(data["risk_signals"]) > 0


def test_get_risk_events(client):
    res = client.get("/api/v1/risk/events")
    assert res.status_code == 200
    assert isinstance(res.json(), list)
