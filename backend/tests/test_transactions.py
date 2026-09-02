import uuid


def test_create_and_get_transaction(client):
    unique_tx_id = f"TX_UNIT_{uuid.uuid4().hex[:8]}"
    tx_payload = {
        "transaction_id": unique_tx_id,
        "entity_id": "ent_unit_test",
        "amount": 289.50,
        "currency": "USD",
        "transaction_type": "PAYMENT",
        "device_id": "dev_test_abc",
        "ip_address": "192.168.1.1",
        "status": "PROCESSED",
        "metadata_json": {"test_flag": True}
    }

    create_res = client.post("/api/v1/transactions", json=tx_payload)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["transaction_id"] == unique_tx_id
    assert created["amount"] == 289.50

    # Retrieve by ID
    get_res = client.get(f"/api/v1/transactions/{unique_tx_id}")
    assert get_res.status_code == 200
    assert get_res.json()["transaction_id"] == unique_tx_id


def test_get_transaction_stats(client):
    res = client.get("/api/v1/transactions/stats/overview")
    assert res.status_code == 200
    stats = res.json()
    assert "total_transactions" in stats
    assert "total_volume" in stats
    assert "fraud_rate_pct" in stats


def test_generate_synthetic_transactions(client):
    res = client.post("/api/v1/transactions/generate", json={
        "count": 5,
        "fraud_ratio": 0.4
    })
    assert res.status_code == 200
    txs = res.json()
    assert len(txs) == 5
