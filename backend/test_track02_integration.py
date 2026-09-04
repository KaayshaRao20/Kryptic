import os
import sys
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def run_tests():
    print("=" * 70)
    print("  KRYPTIC — TRACK 02: AI RISK MANAGER END-TO-END VERIFICATION")
    print("=" * 70)

    # 1. Test Razorpay Status & Key Configuration
    print("\n[TEST 1] Testing Razorpay Status & Key Configuration...")
    res = client.get("/api/v1/razorpay/status")
    assert res.status_code == 200
    data = res.json()
    print(f"-> Razorpay Status: {data.get('mode')} | {data.get('message')}")

    # 2. Test Settings Keys Endpoint
    print("\n[TEST 2] Testing Settings API...")
    res = client.get("/api/v1/settings/keys")
    assert res.status_code == 200
    keys_data = res.json()
    print(f"-> Active Razorpay Key: {keys_data.get('razorpay_key_id_masked')}")
    print(f"-> Gemini Configured: {keys_data.get('gemini_configured')}")

    # 3. Test Chargebacks List
    print("\n[TEST 3] Fetching Razorpay Chargebacks & Disputes...")
    res = client.get("/api/v1/chargebacks")
    assert res.status_code == 200
    disputes = res.json()
    assert len(disputes) >= 2
    print(f"-> Retrieved {len(disputes)} Active Disputes:")
    for d in disputes:
        print(f"   * [{d['id']}] {d['currency']} {d['amount']} | Code: {d['reason_code']} | Status: {d['status']}")
    target_dispute = disputes[0]

    # 4. Test Gemini AI Chargeback Evidence Auto-Responder
    print("\n[TEST 4] Generating Gemini AI Chargeback Defense Packet...")
    t0 = time.time()
    res = client.post("/api/v1/chargebacks/generate-evidence", json={
        "dispute_id": target_dispute["id"],
        "custom_instructions": "Merchant confirmed OTP match and GPS geofence match."
    })
    assert res.status_code == 200
    ev_data = res.json()
    defense = ev_data["defense_pack"]
    gen_time = round((time.time() - t0) * 1000, 2)
    print(f"-> Evidence Generated in {gen_time} ms | Engine: {defense.get('source')}")
    print(f"-> Predicted Win Probability: {defense.get('win_probability_pct')}%")
    print(f"-> Executive Thesis: {defense.get('executive_summary')}")
    print(f"-> Representation Letter Preview:\n{defense.get('representation_letter')[:280]}...")

    # 5. Test Defense Submission to Razorpay
    print("\n[TEST 5] Submitting Representation Packet to Razorpay...")
    res = client.post(f"/api/v1/chargebacks/{target_dispute['id']}/submit", json={
        "dispute_id": target_dispute["id"],
        "representation_letter": defense["representation_letter"],
        "evidence_checklist": defense["evidence_checklist"]
    })
    assert res.status_code == 200
    sub_data = res.json()
    print(f"-> Submission Status: {sub_data.get('status')} | Message: {sub_data.get('message')}")

    # 6. Test Return & RTO Risk Scorer
    print("\n[TEST 6] Evaluating High-Risk COD E-Commerce Order for RTO Risk...")
    order_payload = {
        "order_id": "ORD_TEST_9988",
        "customer_name": "Rohan Deshmukh",
        "phone": "+91 98201 44821",
        "email": "rohan.d@gmail.com",
        "pin_code": "400050",
        "city": "Mumbai",
        "state": "Maharashtra",
        "product_category": "Apparel & Fast Fashion",
        "order_value": 4999.00,
        "payment_method": "COD",
        "historical_return_rate": 0.70,
        "account_age_days": 10
    }
    res = client.post("/api/v1/returns/score", json=order_payload)
    assert res.status_code == 200
    rto_data = res.json()
    print(f"-> Order: {rto_data['order_id']} | Risk Tier: {rto_data['risk_tier']} | Score: {rto_data['risk_score']}/100")
    print(f"-> Recommended Action: {rto_data['recommended_action']} ({rto_data['action_description']})")
    print(f"-> Estimated RTO Loss Prevented: INR {rto_data['expected_rto_cost_inr']}")

    # 7. Test Return Metrics
    print("\n[TEST 7] Fetching Return & RTO Loss Metrics...")
    res = client.get("/api/v1/returns/metrics")
    assert res.status_code == 200
    m_data = res.json()
    print(f"-> Total Evaluated: {m_data['total_orders_evaluated']} | High Risk: {m_data['high_risk_rto_count']}")
    print(f"-> Losses Prevented: INR {m_data['estimated_rto_losses_prevented_inr']:,.2f}")

    # 8. Test Live XGBoost Payment Fraud Predictor
    print("\n[TEST 8] Scoring Live Payment Transaction via XGBoost ML Engine...")
    tx_payload = {
        "transaction_id": "TX_TEST_RZP_01",
        "entity_id": "cust_rzp_99",
        "amount": 8900.00,
        "currency": "USD",
        "transaction_type": "WITHDRAWAL",
        "device_id": "dev_suspicious_44",
        "ip_address": "185.220.101.5",
        "metadata_json": {
            "velocity_1h": 15,
            "vpn_detected": True
        }
    }
    res = client.post("/api/v1/risk/predict", json=tx_payload)
    assert res.status_code == 200
    pred = res.json()
    print(f"-> Transaction Flagged: Fraud Prob = {pred['fraud_probability']*100:.1f}% | Risk Level = {pred['risk_level']}")
    print(f"-> Model Engine: {pred['model_version']} | Recommended Action: {pred['action_recommended']}")
    print(f"-> Active Signals: {[s['name'] for s in pred['risk_signals']]}")

    print("\n" + "=" * 70)
    print("  ALL 8 TRACK 02 INTEGRATION TESTS PASSED WITH 100% SUCCESS!")
    print("=" * 70)

if __name__ == "__main__":
    run_tests()
