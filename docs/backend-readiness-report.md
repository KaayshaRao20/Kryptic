# KRYPTIC — Phase 0: Backend Readiness Report

**Date:** September 1, 2026  
**Status:** **READY & FULLY VERIFIED (100% Passing)**  
**Version:** `1.0.0`  
**Phase:** Phase 0 (Complete Backend Foundation & Simulation Engine)

---

## 1. Executive Summary

Phase 0 of **KRYPTIC** establishes a modular, resilient, and ML-ready backend architecture for real-time payment flow digital twin monitoring, adaptive fraud intelligence, cascading risk propagation, and empirical scenario stress testing.

All business logic is completely decoupled from FastAPI routing layers and frontend clients. The backend operates natively using Python, FastAPI, SQLAlchemy, PostgreSQL, and Redis (with automatic in-memory fallbacks for resilient standalone execution). Large raw datasets are kept out of relational tables, and ML prediction interfaces are strictly abstracted to support zero-downtime drop-in integration of IEEE-CIS models in Phase 1.

---

## 2. System Architecture

```
                                 +-----------------------+
                                 |  Frontend / API Client |
                                 +-----------+-----------+
                                             |
                                 (HTTP REST / WebSockets)
                                             |
                                             v
                      +---------------------------------------------+
                      |         FastAPI REST & WebSocket Layer       |
                      |   (/health, /api/v1/auth, /api/v1/twin...)  |
                      +----------------------+----------------------+
                                             |
                                             v
+-----------------------------------------------------------------------------------------+
|                                    KRYPTIC Services Layer                                |
|                                                                                         |
|  +----------------+  +-----------------+  +-------------------+  +-------------------+  |
|  |  AuthService   |  |   TwinService   |  |   RiskService     |  | SimulationService |  |
|  |  (JWT/Bcrypt)  |  |  (Graph Engine) |  | (ML/ModelRegistry)|  | (5 Stress Vectors)|  |
|  +----------------+  +-----------------+  +-------------------+  +-------------------+  |
|                                                                                         |
|  +--------------------+  +----------------------+  +------------------+  +-----------+  |
|  | ExplanationService |  | RiskPropagationServ. |  |  MetricsService  |  | WSManager |  |
|  |  (SHAP-ready Demo) |  |   (Graph Traversal)  |  | (Empirical Math) |  | (Live Hub)|  |
|  +--------------------+  +----------------------+  +------------------+  +-----------+  |
+--------------------------------------------+--------------------------------------------+
                                             |
                                             v
                      +---------------------------------------------+
                      |      Data Layer & In-Memory State Cache     |
                      |  PostgreSQL (Truth) + Redis / Fallback State|
                      +---------------------------------------------+
```

---

## 3. Database Schema (PostgreSQL ORM)

| Table Name | Entity Description | Key Attributes |
|---|---|---|
| `organizations` | Merchant Organizations | `id`, `name`, `slug`, `tier`, `config_json`, `is_active` |
| `users` | System Analysts & Operators | `id`, `organization_id`, `email`, `hashed_password`, `role`, `is_active` |
| `payment_systems` | Multi-System Payment Rails | `id`, `organization_id`, `name`, `code`, `system_type`, `status` |
| `system_connections` | Inter-System Topology Links | `id`, `source_system_id`, `target_system_id`, `latency_ms`, `bandwidth_tps` |
| `twin_topologies` | Flow Topologies As Data | `id`, `system_id`, `name`, `version`, `is_active`, `metadata_json` |
| `twin_nodes` | Digital Twin Components | `id`, `topology_id`, `node_key`, `name`, `layer`, `status`, `tps`, `error_rate`, `latency_ms`, `risk_level` |
| `twin_edges` | Component Dependencies | `id`, `topology_id`, `source_node_id`, `target_node_id`, `edge_type`, `latency_ms` |
| `transactions` | Normalized Payments | `id`, `transaction_id`, `system_id`, `entity_id`, `amount`, `currency`, `status`, `is_fraud_ground_truth` |
| `entity_profiles` | Entity Risk Profiles | `id`, `entity_id`, `risk_score`, `velocity_1h`, `total_spent`, `fraud_count` |
| `predictions` | ML Model Inference Records | `id`, `transaction_id`, `fraud_probability`, `risk_level`, `model_version`, `risk_signals` |
| `risk_events` | Triggered Risk Anomalies | `id`, `prediction_id`, `system_id`, `affected_node_key`, `event_type`, `severity`, `description` |
| `explanations` | Model Explainability / SHAP | `id`, `prediction_id`, `base_value`, `feature_contributions`, `risk_factors`, `mitigation_actions` |
| `simulations` | Stress Testing Executions | `id`, `organization_id`, `system_id`, `scenario_type`, `status`, `total_events`, `current_step`, `tps` |
| `simulation_events` | Step-by-Step Simulation Logs | `id`, `simulation_id`, `step`, `is_injected_fraud`, `is_detected`, `fraud_probability`, `latency_ms` |
| `evaluation_results`| Ground-Truth Metrics | `id`, `simulation_id`, `precision`, `recall`, `f1`, `false_positive_rate`, `avg_detection_latency_ms` |

---

## 4. REST & WebSocket API Endpoints

### System & Health
- `GET /health` — Service health check (Database, Redis, ML Registry, Simulation engine).
- `GET /` — Service metadata and documentation links.

### Authentication (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Issues HS256 JWT access tokens with user metadata.
- `POST /api/v1/auth/register` — Analyst/Operator registration with secure bcrypt password hashing.
- `GET /api/v1/auth/me` — Retrieves authenticated user profile from token.

### Transactions (`/api/v1/transactions`)
- `GET /api/v1/transactions` — Paginated transactions list with system, entity, and status filtering.
- `POST /api/v1/transactions` — Ingests a new transaction and broadcasts `TRANSACTION_CREATED`.
- `GET /api/v1/transactions/{transaction_id}` — Detailed transaction payload.
- `GET /api/v1/transactions/stats/overview` — Real-time aggregated volumes, fraud counts, and throughput.
- `POST /api/v1/transactions/generate` — Synthetic stream generator for test traffic.

### Risk Detection & Prediction (`/api/v1/risk`)
- `POST /api/v1/risk/predict` — Evaluates transaction risk, returns probability, risk level (`LOW`/`MED`/`HIGH`/`CRITICAL`), signals, and actions (`APPROVE`, `REVIEW`, `CHALLENGE_2FA`, `DECLINE`).
- `GET /api/v1/risk/events` — Lists triggered risk anomaly events across payment nodes.
- `GET /api/v1/risk/events/{id}` — Specific anomaly event details.

### Explainable AI (`/api/v1/explain`)
- `GET /api/v1/explain/{prediction_id}` — Returns SHAP-compatible feature contributions, base value, driving risk factors, and recommended mitigation actions (transparently flagged as `is_demo_data: true`).

### Digital Twin (`/api/v1/twin`)
- `GET /api/v1/twin/state` — Live graph state (nodes, edges, layers, TPS, error rates, overall health).
- `GET /api/v1/twin/config` — Current active topology configuration.
- `POST /api/v1/twin/config` — Registers custom, merchant-specific payment flow topologies as data.
- `POST /api/v1/twin/nodes/{node_key}/status` — Updates node status and broadcasts `NODE_STATUS_CHANGED`.
- `POST /api/v1/twin/propagate-risk` — Computes cascading risk across graph dependencies.

### Organizations & Multi-System Ring (`/api/v1/organizations`, `/api/v1/payment-systems`, `/api/v1/systems/ring`)
- `GET /api/v1/organizations` — Lists registered merchant organizations.
- `GET /api/v1/payment-systems` — Lists payment systems per merchant.
- `GET /api/v1/systems/ring` — Retrieves cross-system ring topology, inter-rail connections, and correlated entities.

### Simulation Engine (`/api/v1/simulation`)
- `GET /api/v1/simulation/scenarios` — Lists 5 supported scenarios (`FRAUD_SPIKE`, `HIGH_VELOCITY`, `COORDINATED_ATTACK`, `BEHAVIORAL_ANOMALY`, `CUSTOM`).
- `POST /api/v1/simulation/run` — Executes backend simulation asynchronously or synchronously.
- `GET /api/v1/simulation/{id}` — Live step progress and status (`IDLE`, `PREPARING`, `RUNNING`, `PAUSED`, `COMPLETED`, `FAILED`).
- `GET /api/v1/simulation/{id}/events` — Step-by-step transaction evaluation logs.
- `POST /api/v1/simulation/{id}/stop` — Pauses/terminates active simulation run.

### Metrics & Evaluation (`/api/v1/metrics`)
- `GET /api/v1/metrics` — Latest empirical metrics calculated from simulations.
- `GET /api/v1/metrics/simulation/{id}` — Ground-truth confusion matrix, Precision, Recall, F1, FPR, and Latency for a specific simulation.

### WebSockets (`/api/v1/ws`)
- `WebSocket /api/v1/ws` — Real-time live event channel streaming:
  - `TRANSACTION_CREATED`
  - `RISK_DETECTED`
  - `NODE_STATUS_CHANGED`
  - `RISK_PROPAGATED`
  - `SIMULATION_STARTED`
  - `SIMULATION_PROGRESS`
  - `SIMULATION_COMPLETED`

---

## 5. Automated Test Suite Results

The backend includes a comprehensive automated test suite in `backend/tests/` running on `pytest` and `pytest-asyncio`.

**Test Command:**
```bash
python -m pytest backend/tests -v
```

**Results:**
```
============================= test session starts =============================
platform win32 -- Python 3.13.6, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\Kaaysha Rao\OneDrive\Desktop\Kryptic Fnal
collected 19 items

backend/tests/test_auth.py::test_login_success PASSED                    [  5%]
backend/tests/test_auth.py::test_login_invalid_password PASSED           [ 10%]
backend/tests/test_auth.py::test_get_current_user_profile PASSED         [ 15%]
backend/tests/test_auth.py::test_register_new_user PASSED                [ 21%]
backend/tests/test_database.py::test_database_organization_and_system_relationships PASSED [ 26%]
backend/tests/test_explanation.py::test_explain_prediction PASSED        [ 31%]
backend/tests/test_metrics.py::test_metrics_calculation_accuracy PASSED  [ 36%]
backend/tests/test_risk_prediction.py::test_risk_prediction_normal_transaction PASSED [ 42%]
backend/tests/test_risk_prediction.py::test_risk_prediction_fraud_outlier PASSED [ 47%]
backend/tests/test_risk_prediction.py::test_get_risk_events PASSED       [ 52%]
backend/tests/test_risk_propagation.py::test_risk_propagation_endpoint PASSED [ 57%]
backend/tests/test_simulation.py::test_list_scenarios PASSED             [ 63%]
backend/tests/test_simulation.py::test_run_synchronous_simulation PASSED [ 68%]
backend/tests/test_transactions.py::test_create_and_get_transaction PASSED [ 73%]
backend/tests/test_transactions.py::test_get_transaction_stats PASSED    [ 78%]
backend/tests/test_transactions.py::test_generate_synthetic_transactions PASSED [ 84%]
backend/tests/test_twin.py::test_get_digital_twin_state PASSED           [ 89%]
backend/tests/test_twin.py::test_update_twin_node_status PASSED          [ 94%]
backend/tests/test_websockets.py::test_websocket_connection_and_ping PASSED [100%]

============================= 19 passed in 4.74s ==============================
```

---

## 6. End-to-End Acceptance Test Verification

**Command:**
```bash
python backend/acceptance_test.py
```

**Flow Execution Summary:**
1. `LOGIN`: Validated JWT token issue for `admin@kryptic.io`.
2. `GET MERCHANT`: Successfully retrieved `Apex Global Merchants`.
3. `GET PAYMENT SYSTEMS`: Retrieved 3 systems (`card-checkout-primary`, `instant-ach-gateway`, `crypto-liquidity-rail`) and multi-system ring health (`OPTIMAL`).
4. `GET PAYMENT FLOW TWIN`: Retrieved 7-stage digital twin topology (`entry_gateway` -> `auth_service` -> `risk_engine` -> `smart_router` -> `card_processor` -> `issuer_auth` -> `settlement_ledger`).
5. `GENERATE TRANSACTION`: Ingested high-value suspicious transaction `TX_E2E_1788256549` ($7,850.00).
6. `RISK PREDICTION`: `DummyPredictionService` evaluated risk at 99.0% probability (`CRITICAL`), recommending `DECLINE` with 5 risk signals in 1.23 ms.
7. `CREATE RISK EVENT`: Emitted active risk event for component `risk_engine`.
8. `UPDATE TWIN`: Updated `risk_engine` component state to `anomalous` (Risk: `HIGH`, Error Rate: 0.22).
9. `START SIMULATION`: Executed 12-step `COORDINATED_ATTACK` scenario.
10. `LIVE WEBSOCKET EVENTS`: Verified real-time WebSocket connectivity and event broadcasts.
11. `RISK PROPAGATION`: Cascaded risk from `risk_engine` to downstream components `smart_router` and `card_processor`.
12. `SIMULATION COMPLETED & METRICS`: Calculated ground-truth empirical metrics: `Precision: 100%`, `Recall: 100%`, `F1: 1.0000`, `FPR: 0.0000`, `Avg Latency: 21.32 ms`.
13. `GET EXPLANATION`: Retrieved transparent SHAP-compatible feature contributions, risk drivers, and operational mitigation steps.

---

## 7. Next Phase Readiness

The backend foundation is complete, verified, and ready for:
- **Phase 1**: IEEE-CIS Dataset preprocessing, Feature Engineering pipeline, and XGBoost/LightGBM model training with real SHAP TreeExplainer integration into `MLPredictionService`.
- **Phase 2**: Frontend UI integration with React, TailwindCSS, and WebSocket streaming.
