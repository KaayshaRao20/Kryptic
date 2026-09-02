def test_get_digital_twin_state(client):
    res = client.get("/api/v1/twin/state")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    assert len(data["nodes"]) >= 5
    assert "edges" in data
    assert "overall_health" in data


def test_update_twin_node_status(client):
    update_payload = {
        "node_key": "risk_engine",
        "status": "degraded",
        "risk_level": "HIGH",
        "error_rate": 0.15,
        "tps": 45.0
    }
    res = client.post("/api/v1/twin/nodes/risk_engine/status", json=update_payload)
    assert res.status_code == 200
    node = res.json()
    assert node["node_key"] == "risk_engine"
    assert node["status"] == "degraded"
    assert node["risk_level"] == "HIGH"
