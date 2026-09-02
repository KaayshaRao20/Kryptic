def test_metrics_calculation_accuracy(client):
    # Run a quick simulation first
    req = {
        "scenario_type": "COORDINATED_ATTACK",
        "organization_slug": "apex-merchants",
        "total_events": 10,
        "tps": 25.0,
        "fraud_injection_rate": 0.5,
        "custom_parameters": {}
    }
    sim_res = client.post("/api/v1/simulation/run?sync_mode=true", json=req)
    assert sim_res.status_code == 202
    sim_id = sim_res.json()["id"]

    # Calculate metrics for simulation
    metrics_res = client.get(f"/api/v1/metrics/simulation/{sim_id}")
    assert metrics_res.status_code == 200
    metrics_data = metrics_res.json()
    metrics = metrics_data["metrics"]

    # Verify calculation properties
    assert "injected_events" in metrics
    assert "detected_events" in metrics
    assert "precision" in metrics
    assert "recall" in metrics
    assert "f1" in metrics
    assert "false_positive_rate" in metrics
    assert 0.0 <= metrics["precision"] <= 1.0
    assert 0.0 <= metrics["recall"] <= 1.0
    assert 0.0 <= metrics["f1"] <= 1.0
    assert "confusion_matrix" in metrics_data
