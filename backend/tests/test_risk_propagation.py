def test_risk_propagation_endpoint(client):
    res = client.post("/api/v1/twin/propagate-risk", params={
        "origin_node_key": "risk_engine",
        "risk_level": "HIGH"
    })
    assert res.status_code == 200
    data = res.json()
    assert "impacts" in data
    impacts = data["impacts"]
    assert len(impacts) >= 2
    # Verify primary origin node is included
    assert impacts[0]["node_key"] == "risk_engine"
    assert impacts[0]["propagation_type"] == "PRIMARY_SOURCE"
    # Verify downstream cascading hop exists
    assert "DOWNSTREAM" in impacts[1]["propagation_type"]
