import os
import sys
import json
import time

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db
from backend.seeds.seed_data import seed

client = TestClient(app)


def print_step(step_num: int, title: str):
    print(f"\n{'='*70}")
    print(f"STEP {step_num:02d}: {title}")
    print(f"{'='*70}")


def run_full_acceptance_test():
    print("\n" + "#"*70)
    print("  KRYPTIC PHASE 0 — COMPLETE 13-STEP END-TO-END ACCEPTANCE TEST")
    print("#"*70)

    # Pre-seed DB
    print("\n[INIT] Initializing & Seeding DB...")
    seed()

    # STEP 1: LOGIN
    print_step(1, "LOGIN & JWT AUTHENTICATION")
    login_res = client.post("/api/v1/auth/login", json={
        "email": "admin@kryptic.io",
        "password": "kryptic2026!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    auth_data = login_res.json()
    token = auth_data["access_token"]
    user_info = auth_data["user"]
    print(f"-> Authenticated User: {user_info['full_name']} ({user_info['email']})")
    print(f"-> Role: {user_info['role']} | Token: {token[:25]}... (valid)")
    headers = {"Authorization": f"Bearer {token}"}

    # STEP 2: GET MERCHANT
    print_step(2, "GET MERCHANT / ORGANIZATION")
    org_res = client.get("/api/v1/organizations/apex-merchants", headers=headers)
    assert org_res.status_code == 200, f"Failed to get org: {org_res.text}"
    org_data = org_res.json()
    print(f"-> Merchant Name: {org_data['name']}")
    print(f"-> Organization Slug: {org_data['slug']} | Tier: {org_data['tier']}")

    # STEP 3: GET PAYMENT SYSTEMS
    print_step(3, "GET PAYMENT SYSTEMS & MULTI-SYSTEM RING")
    systems_res = client.get(f"/api/v1/payment-systems?org_id={org_data['id']}", headers=headers)
    assert systems_res.status_code == 200, f"Failed to get systems: {systems_res.text}"
    systems = systems_res.json()
    assert len(systems) >= 3, "Expected at least 3 payment systems"
    print(f"-> Retrieved {len(systems)} Payment Systems:")
    for s in systems:
        print(f"   * [{s['code']}] {s['name']} (Type: {s['system_type']}, Status: {s['status']})")
    primary_system = systems[0]

    # Ring verification
    ring_res = client.get("/api/v1/systems/ring?org_slug=apex-merchants", headers=headers)
    assert ring_res.status_code == 200, f"Failed to get ring: {ring_res.text}"
    ring_data = ring_res.json()
    print(f"-> Multi-System Ring Health: {ring_data['ring_health']} | Active Connections: {len(ring_data['connections'])}")

    # STEP 4: GET PAYMENT FLOW TWIN
    print_step(4, "GET PAYMENT FLOW DIGITAL TWIN TOPOLOGY & STATE")
    twin_res = client.get(f"/api/v1/twin/state?system_id={primary_system['id']}", headers=headers)
    assert twin_res.status_code == 200, f"Failed to get twin: {twin_res.text}"
    twin_state = twin_res.json()
    print(f"-> Twin Graph System: {twin_state['system_name']} (Topology ID: {twin_state['topology_id'][:8]}...)")
    print(f"-> Overall Health: {twin_state['overall_health']} | Active Risk Level: {twin_state['active_risk_level']}")
    print(f"-> Nodes Count: {len(twin_state['nodes'])} | Edges Count: {len(twin_state['edges'])}")
    for node in twin_state["nodes"]:
        print(f"   - Node [{node['layer']}]: {node['name']} ({node['node_key']}) | Status: {node['status']} | TPS: {node['tps']}")

    # STEP 5: GENERATE TRANSACTION
    print_step(5, "GENERATE & INGEST REALISTIC TRANSACTION")
    tx_payload = {
        "transaction_id": f"TX_E2E_{int(time.time())}",
        "system_id": primary_system["id"],
        "entity_id": "ent_attacker_99",
        "amount": 7850.00,
        "currency": "USD",
        "transaction_type": "WITHDRAWAL",
        "device_id": "dev_spoofed_88",
        "ip_address": "185.220.101.42",
        "metadata_json": {
            "is_injected_fraud": True,
            "velocity_1h": 14,
            "vpn_detected": True,
            "ip_country_mismatch": True
        }
    }
    create_tx_res = client.post("/api/v1/transactions", json=tx_payload, headers=headers)
    assert create_tx_res.status_code == 201, f"Failed to create transaction: {create_tx_res.text}"
    created_tx = create_tx_res.json()
    print(f"-> Created Transaction: {created_tx['transaction_id']}")
    print(f"-> Entity: {created_tx['entity_id']} | Amount: ${created_tx['amount']:,.2f} | Type: {created_tx['transaction_type']}")

    # STEP 6: RISK PREDICTION
    print_step(6, "RISK ENGINE PREDICTION & SIGNAL EVALUATION")
    pred_req = {
        "transaction_id": created_tx["transaction_id"],
        "system_id": primary_system["id"],
        "entity_id": created_tx["entity_id"],
        "amount": created_tx["amount"],
        "currency": created_tx["currency"],
        "device_id": created_tx["device_id"],
        "ip_address": created_tx["ip_address"],
        "transaction_type": created_tx["transaction_type"],
        "metadata_json": created_tx["metadata_json"]
    }
    pred_res = client.post("/api/v1/risk/predict", json=pred_req, headers=headers)
    assert pred_res.status_code == 200, f"Failed prediction: {pred_res.text}"
    pred_data = pred_res.json()
    print(f"-> Model Version: {pred_data['model_version']}")
    print(f"-> Fraud Probability: {pred_data['fraud_probability']:.4f} ({pred_data['fraud_probability']*100:.1f}%)")
    print(f"-> Risk Level: {pred_data['risk_level']} | Recommended Action: {pred_data['action_recommended']}")
    print(f"-> Inference Latency: {pred_data['inference_time_ms']} ms")
    print(f"-> Extracted Risk Signals ({len(pred_data['risk_signals'])}):")
    for sig in pred_data["risk_signals"]:
        print(f"   * [{sig['severity']}] {sig['name']}: {sig['description']}")

    # STEP 7: CREATE / VERIFY RISK EVENT
    print_step(7, "CREATE / RETRIEVE RISK EVENT DISPATCH")
    events_res = client.get(f"/api/v1/risk/events?system_id={primary_system['id']}", headers=headers)
    assert events_res.status_code == 200, f"Failed to get risk events: {events_res.text}"
    risk_events = events_res.json()
    assert len(risk_events) > 0, "Expected at least one risk event"
    latest_event = risk_events[0]
    print(f"-> Triggered Risk Event ID: {latest_event['id']}")
    print(f"-> Affected Node: {latest_event['affected_node_key']} | Severity: {latest_event['severity']}")
    print(f"-> Event Type: {latest_event['event_type']} | Status: {latest_event['status']}")
    print(f"-> Description: {latest_event['description']}")

    # STEP 8: UPDATE TWIN
    print_step(8, "UPDATE DIGITAL TWIN COMPONENT STATE")
    update_res = client.post("/api/v1/twin/nodes/risk_engine/status", json={
        "node_key": "risk_engine",
        "status": "anomalous",
        "risk_level": "HIGH",
        "error_rate": 0.22,
        "tps": 48.0
    }, headers=headers)
    assert update_res.status_code == 200, f"Failed to update twin node: {update_res.text}"
    updated_node = update_res.json()
    print(f"-> Updated Node: {updated_node['name']} ({updated_node['node_key']})")
    print(f"-> New Status: {updated_node['status']} | Risk: {updated_node['risk_level']} | Error Rate: {updated_node['error_rate']}")

    # STEP 9 & 10: START SIMULATION & LIVE WEBSOCKET EVENTS
    print_step(9, "START SIMULATION & VALIDATE PROGRESSION")
    sim_req = {
        "scenario_type": "COORDINATED_ATTACK",
        "organization_slug": "apex-merchants",
        "system_id": primary_system["id"],
        "total_events": 12,
        "tps": 20.0,
        "fraud_injection_rate": 0.5,
        "custom_parameters": {"test_e2e": True}
    }
    sim_res = client.post("/api/v1/simulation/run?sync_mode=true", json=sim_req, headers=headers)
    assert sim_res.status_code == 202, f"Failed to run simulation: {sim_res.text}"
    sim_data = sim_res.json()
    print(f"-> Simulation ID: {sim_data['id']}")
    print(f"-> Scenario: {sim_data['scenario_type']} | Status: {sim_data['status']}")
    print(f"-> Processed Steps: {sim_data['current_step']} / {sim_data['total_events']}")

    # STEP 10: LIVE WEBSOCKET CONNECTION
    print_step(10, "LIVE WEBSOCKET STREAMING VERIFICATION")
    with client.websocket_connect("/api/v1/ws") as ws:
        ws.send_text("ping")
        resp = ws.receive_text()
        print(f"-> WebSocket Connection Active & Responsive: {resp}")

    # STEP 11: RISK PROPAGATION
    print_step(11, "GRAPH-BASED RISK PROPAGATION")
    prop_res = client.post(f"/api/v1/twin/propagate-risk?origin_node_key=risk_engine&risk_level=HIGH&system_id={primary_system['id']}", headers=headers)
    assert prop_res.status_code == 200, f"Failed risk propagation: {prop_res.text}"
    prop_data = prop_res.json()
    print(f"-> Cascading Risk Propagation from '{prop_data['origin_node_key']}':")
    for impact in prop_data["impacts"]:
        print(f"   * [{impact['propagation_type']}] Node: {impact['name']} ({impact['node_key']}) | Status: {impact['status']} | Risk: {impact['risk_level']}")

    # STEP 12: SIMULATION COMPLETED & METRICS CALCULATION
    print_step(12, "SIMULATION COMPLETED & GROUND TRUTH METRICS")
    metrics_res = client.get(f"/api/v1/metrics/simulation/{sim_data['id']}", headers=headers)
    assert metrics_res.status_code == 200, f"Failed to get metrics: {metrics_res.text}"
    metrics_data = metrics_res.json()
    m = metrics_data["metrics"]
    cm = metrics_data["confusion_matrix"]
    print(f"-> Ground Truth vs Prediction Evaluation:")
    print(f"   * Injected Fraud Events : {m['injected_events']}")
    print(f"   * Detected Fraud Events : {m['detected_events']}")
    print(f"   * Missed Fraud Events   : {m['missed_events']}")
    print(f"   * False Positives       : {m['false_positives']}")
    print(f"   * True Negatives        : {m['true_negatives']}")
    print(f"   * Precision             : {m['precision']:.4f} ({m['precision']*100:.1f}%)")
    print(f"   * Recall                : {m['recall']:.4f} ({m['recall']*100:.1f}%)")
    print(f"   * F1-Score              : {m['f1']:.4f}")
    print(f"   * False Positive Rate   : {m['false_positive_rate']:.4f}")
    print(f"   * Avg Detection Latency : {m['avg_detection_latency_ms']} ms")
    print(f"   * Confusion Matrix      : TP={cm['true_positives']}, FP={cm['false_positives']}, FN={cm['false_negatives']}, TN={cm['true_negatives']}")

    # STEP 13: GET EXPLANATION
    print_step(13, "EXPLAINABLE AI & SHAP FEATURE CONTRIBUTIONS")
    exp_res = client.get(f"/api/v1/explain/{created_tx['transaction_id']}", headers=headers)
    assert exp_res.status_code == 200, f"Failed to get explanation: {exp_res.text}"
    exp_data = exp_res.json()
    print(f"-> Explainability Target: {exp_data['transaction_id']} (Risk Score: {exp_data['fraud_probability']*100:.1f}%)")
    print(f"-> Base Population Value: {exp_data['base_value']} | Model: {exp_data['model_version']}")
    print(f"-> Demo Data Flag: {exp_data['is_demo_data']} (Transparently labeled)")
    print(f"-> Feature Contributions (SHAP-compatible):")
    for feat in exp_data["feature_contributions"]:
        print(f"   * {feat['display_name']} = {feat['value']}: {feat['contribution']:+.4f} ({feat['impact_direction']})")
    print(f"-> Recommended Mitigation Actions:")
    for act in exp_data["mitigation_actions"]:
        print(f"   - {act}")

    print("\n" + "#"*70)
    print("  ALL 13 ACCEPTANCE STEPS SUCCESSFULLY VALIDATED AND VERIFIED!")
    print("#"*70 + "\n")


if __name__ == "__main__":
    run_full_acceptance_test()
