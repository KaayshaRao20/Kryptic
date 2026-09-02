def test_explain_prediction(client):
    # First predict a transaction to generate a prediction record
    pred_res = client.post("/api/v1/risk/predict", json={
        "transaction_id": "TX_EXP_TEST_01",
        "entity_id": "ent_exp_user",
        "amount": 7500.00,
        "currency": "USD",
        "metadata_json": {"velocity_1h": 10, "vpn_detected": True}
    })
    assert pred_res.status_code == 200

    # Retrieve explainability data
    exp_res = client.get("/api/v1/explain/TX_EXP_TEST_01")
    assert exp_res.status_code == 200
    data = exp_res.json()
    assert data["transaction_id"] == "TX_EXP_TEST_01"
    assert data["is_demo_data"] is True
    assert "feature_contributions" in data
    assert len(data["feature_contributions"]) >= 3
    assert "risk_factors" in data
    assert "mitigation_actions" in data
