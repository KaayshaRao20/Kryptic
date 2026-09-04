def test_model_card_exposes_holdout_metrics(client):
    res = client.get("/api/v1/risk/model-card")

    assert res.status_code == 200
    data = res.json()

    assert data["active_model_version"] == "v2.0.0-xgb-paysim"
    assert data["loss_class"] == "payment_fraud_spike_detection"
    assert data["test_samples"] == 60200
    assert data["features_count"] == 17

    holdout = data["holdout_metrics"]
    assert holdout["precision"] >= 0.98
    assert holdout["recall"] >= 0.98
    assert holdout["confusion_matrix"]["false_positives"] == 4

    cost = data["operational_cost"]
    assert cost["false_positive_review_cost_inr"] > 0
    assert cost["holdout_false_positive_cost_inr"] == 260
