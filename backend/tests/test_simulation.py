def test_list_scenarios(client):
    res = client.get("/api/v1/simulation/scenarios")
    assert res.status_code == 200
    scenarios = res.json()
    assert len(scenarios) == 5
    scenario_ids = [s["id"] for s in scenarios]
    assert "FRAUD_SPIKE" in scenario_ids
    assert "HIGH_VELOCITY" in scenario_ids
    assert "COORDINATED_ATTACK" in scenario_ids
    assert "BEHAVIORAL_ANOMALY" in scenario_ids
    assert "CUSTOM" in scenario_ids


def test_run_synchronous_simulation(client):
    req = {
        "scenario_type": "FRAUD_SPIKE",
        "organization_slug": "apex-merchants",
        "total_events": 8,
        "tps": 20.0,
        "fraud_injection_rate": 0.4,
        "custom_parameters": {}
    }
    res = client.post("/api/v1/simulation/run?sync_mode=true", json=req)
    assert res.status_code == 202
    sim_data = res.json()
    assert sim_data["status"] == "COMPLETED"
    assert sim_data["scenario_type"] == "FRAUD_SPIKE"
    assert sim_data["current_step"] == 8

    # Query simulation events
    events_res = client.get(f"/api/v1/simulation/{sim_data['id']}/events")
    assert events_res.status_code == 200
    events = events_res.json()
    assert len(events) == 8
