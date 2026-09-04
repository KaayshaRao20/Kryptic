# KRYPTIC

**AI Risk Manager for Modern Payments**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Frontend](https://img.shields.io/badge/Frontend-React%20%7C%20TypeScript%20%7C%20Vite-61dafb.svg)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688.svg)](backend/)
[![ML Model](https://img.shields.io/badge/ML%20Engine-XGBoost%20v2.0.0-orange.svg)](models/)
[![Live Deployment](https://img.shields.io/badge/Live%20Demo-Vercel-black.svg)](https://kryptic-razor-pay.vercel.app)

KRYPTIC is an AI-powered payment risk intelligence platform built for merchants who need to go beyond a single "risky / not risky" score. It brings together fraud detection, return/RTO risk, dispute and chargeback workflows, customer-level investigation, payment-flow intelligence, explainable AI, risk simulation, alerting, and audit-grade reporting into a single operating surface — connected to Razorpay for live payment data and Gemini for AI-assisted investigation.

KRYPTIC is not a fraud-detection dashboard. It is a risk *intelligence layer*: an investigation and decision-support system that sits alongside your payment stack and helps a human operator understand, localize, explain, and act on risk — then keeps a record of what happened.

> **Note**: KRYPTIC does not replace Razorpay's production risk systems. It is an AI Risk Manager and intelligence layer designed to sit on top of payment data and help investigators reason about risk faster.

---

## Table of Contents

1. [The Problem](#the-problem)
2. [The KRYPTIC Approach](#the-kryptic-approach)
3. [System Architecture](#system-architecture)
4. [Technology Stack](#technology-stack)
5. [Core Modules](#core-modules)
6. [Customer Investigation](#customer-investigation)
7. [Payment Flow Digital Twin](#payment-flow-digital-twin)
8. [Risk Localization](#risk-localization)
9. [Explainable AI](#explainable-ai)
10. [ML Architecture](#ml-architecture)
11. [Model Evaluation](#model-evaluation)
12. [Datasets](#datasets)
13. [Fraud Injection Lab](#fraud-injection-lab)
14. [Cross-System / Entity Intelligence](#cross-system--entity-intelligence)
15. [Razorpay Integration](#razorpay-integration)
16. [Gemini Integration](#gemini-integration)
17. [API Reference](#api-reference)
18. [Frontend Routes](#frontend-routes)
19. [Reporting & Audit](#reporting--audit)
20. [Security](#security)
21. [Project Structure](#project-structure)
22. [Local Development](#local-development)
23. [Environment Variables](#environment-variables)
24. [Testing](#testing)
25. [Demo Flow](#demo-flow)
26. [What Makes KRYPTIC Different](#what-makes-kryptic-different)
27. [Current Status & Limitations](#current-status--limitations)
28. [Roadmap](#roadmap)
29. [License](#license)

---

## The Problem

Traditional risk systems are good at producing a verdict:

> *"This transaction is risky."*

That verdict is rarely where the work ends for an investigator. The real questions are:

- **Why** is it risky?
- **Which customer** is involved, and what else have they done?
- **What other activity** is connected to this event?
- **Where** in the payment flow is the risk appearing?
- **What evidence** supports the decision?
- **What action** should be taken?
- **What happened** after the action was taken?

Most dashboards stop at the score. KRYPTIC is built around the rest of that chain.

---

## The KRYPTIC Approach

KRYPTIC is organized around one operating loop:

```mermaid
flowchart LR
    A[Detect] --> B[Investigate]
    B --> C[Localize]
    C --> D[Explain]
    D --> E[Respond]
    E --> F[Audit]

    style A fill:#1f2937,color:#fff
    style B fill:#1f2937,color:#fff
    style C fill:#1f2937,color:#fff
    style D fill:#1f2937,color:#fff
    style E fill:#1f2937,color:#fff
    style F fill:#1f2937,color:#fff
```

| Stage | What happens |
|---|---|
| **Detect** | Identify suspicious payment activity as it occurs. |
| **Investigate** | Move from the raw risk event into customer and transaction context. |
| **Localize** | Use the Payment Flow Digital Twin to identify the affected layer of the payment stack. |
| **Explain** | Surface the factors and evidence behind the risk decision. |
| **Respond** | Trigger the appropriate mitigation, dispute, or return action. |
| **Audit** | Record the decision, the evidence, and the resulting state. |

This loop — not any single screen — is the product.

---

## System Architecture

KRYPTIC is a React + FastAPI application with a dedicated risk-intelligence service layer, an ML/AI layer, and two external integrations (Razorpay and Gemini).

```mermaid
flowchart TB
    U["Merchant / Investigator"] --> FE["React Frontend<br/>React 19 · TypeScript · Vite"]
    FE <-->|"REST + WebSocket"| API["FastAPI API Layer<br/>Pydantic · SQLAlchemy · Uvicorn"]

    API --> SVC["KRYPTIC Risk Intelligence Services<br/>Fraud Engine · Digital Twin · Explainability<br/>Disputes · Returns · Simulation · Audit"]

    SVC --> ML["ML / AI Layer<br/>XGBoost · Scikit-learn · SHAP"]
    SVC --> DATA["Database + Redis<br/>PostgreSQL / SQLite · Cache & Live State"]

    SVC --> EXT["External Systems"]
    EXT --> RZP["Razorpay<br/>Payments · Webhooks"]
    EXT --> GEM["Gemini AI<br/>Reasoning · Narrative Assistance"]

    style U fill:#0f172a,color:#fff
    style FE fill:#1e3a8a,color:#fff
    style API fill:#1e40af,color:#fff
    style SVC fill:#065f46,color:#fff
    style ML fill:#7c2d12,color:#fff
    style DATA fill:#374151,color:#fff
    style EXT fill:#4c1d95,color:#fff
```

* **Frontend** — A React 19 + TypeScript single-page application built with Vite, styled with Tailwind CSS, routed with React Router, and using Recharts for analytics visualization, React Flow for the Digital Twin and process diagrams, and Framer Motion for interaction detail.
* **API Layer** — FastAPI serves REST endpoints and a WebSocket channel for live updates. Pydantic handles request/response validation, SQLAlchemy is the ORM, and Uvicorn runs the ASGI server.
* **Risk Intelligence Services** — The core of KRYPTIC: the fraud/risk engine, customer and transaction context assembly, the Payment Flow Digital Twin, explainability generation, risk simulation, the dispute/chargeback engine, RTO/return risk, reporting/audit, and risk propagation across the twin.
* **ML / AI Layer** — XGBoost is the primary fraud classifier, with Scikit-learn used for supporting preprocessing and evaluation utilities. Gemini is used as a separate AI-assistance layer (see [Gemini Integration](#gemini-integration)).
* **Database + Redis** — PostgreSQL is the primary datastore, with SQLite available as a local-development fallback. Redis backs live Digital Twin state and other fast-changing data.
* **External Systems** — Razorpay supplies payment and dispute data through its API and webhooks; Gemini provides AI-assisted reasoning and narrative generation on top of KRYPTIC's own risk output.

### Product Architecture

Beneath the system architecture is a logical decision path that every risk event travels:

```mermaid
flowchart LR
    T["Transaction / Event"] --> RI["Risk Intelligence"]
    RI --> CC["Customer Context"]
    CC --> DT["Digital Twin"]
    DT --> EX["Explanation"]
    EX --> RS["Response"]
    RS --> AU["Audit"]

    style T fill:#111827,color:#fff
    style RI fill:#1e40af,color:#fff
    style CC fill:#065f46,color:#fff
    style DT fill:#7c2d12,color:#fff
    style EX fill:#4c1d95,color:#fff
    style RS fill:#92400e,color:#fff
    style AU fill:#374151,color:#fff
```

The Digital Twin is one stage in this path, not the whole product — it is the infrastructure-aware layer that tells an investigator *where* in the payment stack a risk event is occurring.

---

## Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, React Router, Recharts, React Flow, Framer Motion |
| **Backend** | FastAPI, Pydantic, SQLAlchemy, Uvicorn, WebSockets |
| **Intelligence Services** | Fraud/Risk Engine, Customer & Transaction Context, Payment Flow Digital Twin, Explainability, Risk Simulation, Dispute/Chargeback Engine, RTO/Return Risk, Reports/Audit, Risk Propagation, Cross-System Intelligence |
| **ML / AI** | XGBoost, Scikit-learn, Gemini |
| **Infrastructure** | PostgreSQL (SQLite fallback), Redis |
| **External Integrations** | Razorpay APIs & Webhooks, Gemini AI service |

---

## Core Modules

### Risk Overview (`/admin/dashboard`)

The central risk-monitoring dashboard. Gives a merchant visibility into evaluated payment volume, high-risk activity, open disputes, return/RTO risk, risk trends over time, live transaction activity, and active alerts — a single starting point before drilling into any specific investigation.

### Fraud Detection (`/intelligence/detection`)

Fraud prediction on individual transactions, transaction-level risk probability, contributing risk factors, model performance metrics, holdout evaluation results, recommended actions, and a fraud simulation/injection lab for testing detection behavior.

### Order & Return Risk (`/returns`)

Order telemetry, RTO/return probability scoring, return-risk assessment, mitigation recommendations, and recent return-risk activity.

### Disputes & Chargebacks (`/chargebacks`)

A dispute queue, per-dispute investigation, AI-assisted evidence generation, defense-packet generation, formal merchant representation letters, the submission workflow, and current dispute state tracking.

### Payment Intelligence (`/payments`)

Payment analytics, transaction analysis, payment/channel distribution, filtering, and transaction-level investigation, including activity clustering where implemented.

### Alerts (`/admin/alerts` & `/alerts`)

Critical alerts surfaced with severity, relevant customer and transaction context, a path into investigation, available mitigation actions, and a link into the audit trail.

### Risk Simulation Lab (`/twin` & `/infrastructure/lab`)

A controlled environment for testing how KRYPTIC responds to abnormal activity. Supported scenarios:

- **Fraud Spike**
- **High Velocity**
- **Coordinated Activity**
- **Behavioral Anomaly**

Simulation scenarios are testing/demo mechanisms — they generate synthetic events to exercise the detection and response pipeline and do **not** represent real customer fraud.

### Reports (`/admin/reports`)

Overview reporting, model evaluation reports, transaction reports, customer reports, fraud/risk reports, gateway reports, and audit reports.

---

## Customer Investigation

KRYPTIC does not stop at a transaction-level prediction. An investigator can move outward from a single flagged event into the full context around it:

```mermaid
flowchart LR
    A["Critical Alert"] --> B["Customer"]
    B --> C["Customer Activity"]
    C --> D["Transactions"]
    D --> E["Risk Signals"]
    E --> F["Payment Flow"]
    F --> G["Action"]
    G --> H["Audit"]

    style A fill:#7f1d1d,color:#fff
    style B fill:#1e3a8a,color:#fff
    style C fill:#1e3a8a,color:#fff
    style D fill:#065f46,color:#fff
    style E fill:#065f46,color:#fff
    style F fill:#7c2d12,color:#fff
    style G fill:#92400e,color:#fff
    style H fill:#374151,color:#fff
```

**Customer Mode** assembles, where implemented:

- Customer identity and context
- Current risk score / risk state
- Transaction history
- Payment activity
- Related alerts
- Relevant gateway / payment-flow information
- Related activity and entities

The goal is to reduce context switching — an investigator should not need to open five separate tools to understand one customer.

---

## Payment Flow Digital Twin

KRYPTIC maintains a live representation of the payment-processing topology so that a risk event can be associated with the infrastructure context it occurred in, not just a transaction ID.

The default topology models seven stages:

```mermaid
flowchart LR
    N1["1. API Entry Gateway"] --> N2["2. Auth & Tokenization"]
    N2 --> N3["3. KRYPTIC Risk Engine"]
    N3 --> N4["4. Smart Payment Router"]
    N4 --> N5["5. Acquiring Processor"]
    N5 --> N6["6. Card Scheme & Issuer"]
    N6 --> N7["7. Settlement & Clearing"]

    style N1 fill:#1e3a8a,color:#fff
    style N2 fill:#1e3a8a,color:#fff
    style N3 fill:#7c2d12,color:#fff
    style N4 fill:#065f46,color:#fff
    style N5 fill:#065f46,color:#fff
    style N6 fill:#4c1d95,color:#fff
    style N7 fill:#374151,color:#fff
```

Each **node** carries operational and risk state: status, risk level, TPS, error rate, latency, and topology/position metadata. Each **edge** represents payment/data flow between stages. Live state is backed by Redis so the twin reflects near-real-time conditions.

The Digital Twin exposes:

- Overall system health
- Active risk level
- Total TPS
- Average latency
- Per-node state
- Per-edge state
- Risk propagation across the topology

---

## Risk Localization

The distinguishing question KRYPTIC asks is not only *"is this risky?"* but *"where is this risk coming from?"*

```mermaid
flowchart LR
    A["Risk Event"] --> B["Customer / Transaction"]
    B --> C["Digital Twin"]
    C --> D["Affected Node"]
    D --> E["Risk Propagation"]
    E --> F["Investigator Action"]

    style A fill:#7f1d1d,color:#fff
    style B fill:#1e3a8a,color:#fff
    style C fill:#7c2d12,color:#fff
    style D fill:#7c2d12,color:#fff
    style E fill:#92400e,color:#fff
    style F fill:#065f46,color:#fff
```

An affected layer is represented by a Digital Twin node — the risk engine, the router, the acquiring processor, and so on — depending on the actual event and system state at the time. This connects a risk decision to a specific point in the payment stack rather than leaving it as an isolated transaction label. Not every event resolves to a single definitive root cause; localization reflects the state and propagation data available at the time of the event.

---

## Explainable AI

```mermaid
flowchart LR
    A["Prediction"] --> B["Risk Factors"]
    B --> C["Explanation"]
    C --> D["Investigation"]

    style A fill:#1e3a8a,color:#fff
    style B fill:#065f46,color:#fff
    style C fill:#7c2d12,color:#fff
    style D fill:#374151,color:#fff
```

Every fraud prediction is paired with an explanation designed to help an investigator understand *why* the model reached its decision, not just *what* the decision was. Where the underlying explanation is derived from model SHAP output, it is documented as such; where an explanation is generated or structured separately from a true SHAP computation, it is treated and labeled as a distinct, assistive explanation rather than a raw model attribution. No SHAP values or percentages are asserted beyond what the implementation actually computes.

---

## ML Architecture

```mermaid
flowchart LR
    A["Raw Data"] --> B["Preprocessing"]
    B --> C["Feature Engineering"]
    C --> D["Model"]
    D --> E["Probability / Risk Score"]
    E --> F["Decision"]
    F --> G["Explanation"]
    G --> H["Alert / Investigation"]

    style A fill:#374151,color:#fff
    style B fill:#1e3a8a,color:#fff
    style C fill:#1e3a8a,color:#fff
    style D fill:#7c2d12,color:#fff
    style E fill:#7c2d12,color:#fff
    style F fill:#92400e,color:#fff
    style G fill:#4c1d95,color:#fff
    style H fill:#065f46,color:#fff
```

**Primary fraud prediction path:** XGBoost, trained on engineered features from transaction and behavioral data, with Scikit-learn utilities used for preprocessing and evaluation.

**Supporting components (where implemented):** K-Means clustering for activity grouping and Isolation Forest for anomaly detection are used to support investigation and simulation workflows. These are supporting components, not part of the primary fraud-classification path unless explicitly used as such in a given workflow.

Model artifacts are persisted and loaded by the backend at serving time, alongside the preprocessing pipeline used during training.

---

## Model Evaluation

Benchmark: **PaySim**

| Split | Samples |
|---|---|
| Training | 240,800 |
| Holdout | 60,200 |
| Features | 17 |

**Holdout metrics**

| Metric | Value |
|---|---|
| Accuracy | 0.999884 |
| Precision | 0.983122 |
| Recall | 0.987288 |
| F1 Score | 0.985201 |
| ROC-AUC | 0.998922 |
| PR-AUC | 0.992663 |
| False Positive Rate | 0.000067 |
| False Negative Rate | 0.012712 |

**Confusion matrix (holdout set)**

| | Predicted Legit | Predicted Fraud |
|---|---|---|
| **Actual Legit** | TN = 59,960 | FP = 4 |
| **Actual Fraud** | FN = 3 | TP = 233 |

**Latency**

| Metric | Value |
|---|---|
| Average | 0.503 ms |
| P95 | 0.698 ms |

*These are recorded PaySim holdout benchmark measurements. They are not guarantees of production performance and should not be interpreted as applying automatically to live Razorpay transactions.*

---

## Datasets

### PaySim

- 301,000 rows
- 11 raw columns
- 1,181 fraudulent transactions
- **Type:** Synthetic financial simulation calibrated using real-world mobile-money transaction patterns.

### European Credit Card Fraud Detection Benchmark

- 284,807 rows
- 31 columns
- 492 fraudulent transactions
- **Type:** Real-world anonymized European card transaction dataset.

*PaySim is synthetic data and is not presented as real-world data. The two datasets are kept in separate pipelines and are not merged; the active benchmark used for the metrics above is explicitly PaySim.*

---

## Fraud Injection Lab

The Fraud Injection Lab generates synthetic risk scenarios to evaluate how the rest of the system — detection, alerting, the Digital Twin, and response workflows — behaves under abnormal conditions.

**Supported scenarios:**
- Fraud Spike
- High Velocity
- Coordinated Activity
- Behavioral Anomaly

Where reported by the application, simulation runs surface: injected events, detected events, missed events, detection rate, false positive rate, latency, risk score, affected component, and an event timeline. These are simulation metrics generated from synthetic scenarios — not production customer data.

---

## Cross-System / Entity Intelligence

KRYPTIC surfaces relationships that are not visible from a single transaction in isolation, including cross-system relationships, entity connections, related transactions, an entity timeline, connection details, and risk relationships between entities. This is intended to help an investigator see the wider activity around a customer or transaction rather than evaluating each event independently.

---

## Razorpay Integration

| Route | Description |
|---|---|
| `GET /api/v1/razorpay/status` | Connection status |
| `GET /api/v1/razorpay/payments` | Payment retrieval |
| `POST /api/v1/razorpay/sync` | Synchronize payment data |
| `POST /api/v1/razorpay/webhook` | Webhook receiver |

Capabilities include connection status reporting, payment retrieval, synchronization, webhook handling, and payment/dispute connectivity, with credentials configured through environment variables. Razorpay secrets stay backend-side and are never exposed to the frontend. This integration is not presented as certified or authorized for production payment processing.

---

## Gemini Integration

Gemini is used as an AI-assistance layer on top of KRYPTIC's own risk output — for reasoning assistance, narrative generation, evidence and defense-packet assistance, and recommendations where implemented.

**Gemini is not the primary fraud classifier.** Primary risk prediction is performed by the XGBoost model documented in [ML Architecture](#ml-architecture) and [Model Evaluation](#model-evaluation); Gemini operates downstream of that prediction to help communicate and act on it.

---

## API Reference

### Authentication

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/auth/login` | User login & JWT issuance |
| POST | `/api/v1/auth/register` | Merchant registration |
| GET | `/api/v1/auth/me` | Current authenticated session |

### Organizations

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/organizations` | List organizations |
| GET | `/api/v1/organizations/{slug}` | Get organization profile |

### Risk

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/risk/model-card` | Live model weights & metadata |
| POST | `/api/v1/risk/predict` | Real-time risk probability scoring |
| GET | `/api/v1/risk/events` | List recorded risk events |
| GET | `/api/v1/risk/events/{event_id}` | Detailed risk dossier |

### Explainability

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/explain/{prediction_id}` | Feature attributions & explanations |

### Transactions

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/transactions` | Query and filter transactions |
| POST | `/api/v1/transactions` | Ingest transaction record |
| GET | `/api/v1/transactions/stats/overview` | Transaction metrics & KPI overview |
| GET | `/api/v1/transactions/{transaction_id}` | Single transaction detail |
| POST | `/api/v1/transactions/generate` | Ingest test transaction batch |

### Returns

| Method | Route | Description |
|---|---|---|
| POST | `/api/v1/returns/score` | Evaluate order return & RTO risk |
| GET | `/api/v1/returns/recent` | Recent scored return orders |
| GET | `/api/v1/returns/metrics` | RTO reduction & financial analytics |

### Chargebacks

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/chargebacks` | Active dispute list |
| GET | `/api/v1/chargebacks/{dispute_id}` | Single dispute dossier |
| POST | `/api/v1/chargebacks/generate-evidence` | AI defense packet compilation |
| POST | `/api/v1/chargebacks/{dispute_id}/submit` | Submit dispute defense |

### Digital Twin

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/twin/state` | Current topology node/edge health |
| GET | `/api/v1/twin/config` | Read twin simulation parameters |
| POST | `/api/v1/twin/config` | Update twin topology parameters |
| POST | `/api/v1/twin/nodes/{node_key}/status` | Override single node state |
| POST | `/api/v1/twin/propagate-risk` | Simulate risk cascade |

### Payment Systems

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/payment-systems` | List connected payment systems |
| GET | `/api/v1/systems/ring` | Cross-system entity risk ring |

### Simulation

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/simulation/scenarios` | List supported attack templates |
| POST | `/api/v1/simulation/run` | Execute attack simulation |
| GET | `/api/v1/simulation/{simulation_id}` | Single simulation status |
| GET | `/api/v1/simulation/{simulation_id}/events` | Injected telemetry event log |
| POST | `/api/v1/simulation/{simulation_id}/stop` | Terminate running scenario |

### Metrics

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/metrics` | Global system & ML metrics |
| GET | `/api/v1/metrics/simulation/{simulation_id}` | Evaluation metrics for scenario |

### Razorpay

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/razorpay/status` | Credential & connection status |
| GET | `/api/v1/razorpay/payments` | Fetch live Razorpay transactions |
| POST | `/api/v1/razorpay/sync` | Trigger manual sync |
| POST | `/api/v1/razorpay/webhook` | Verified webhook ingestion |

### Settings

| Method | Route | Description |
|---|---|---|
| GET | `/api/v1/settings/keys` | Integration credentials status |
| POST | `/api/v1/settings/keys` | Update API keys runtime configuration |
| POST | `/api/v1/settings/test-connection` | Verify connectivity |

### Health

| Method | Route | Description |
|---|---|---|
| GET | `/health` | System health check |
| GET | `/` | API status |

### WebSocket

| Protocol | Route | Description |
|---|---|---|
| WS | `/api/v1/ws` | Live event stream (risk events, twin updates, alerts) |

---

## Frontend Routes

| Route | Area | Description |
|---|---|---|
| `/` | Landing Page | Modern AI-native marketing and overview landing page |
| `/admin/dashboard` | Risk Overview | Live risk telemetry, KPIs, and merchant overview |
| `/test-payment` | Live Payment Test Store | Razorpay Standard Checkout store & telemetry injector |
| `/intelligence/detection` | Fraud Detection | Real-time fraud scoring, factors, and model diagnostics |
| `/returns` | Order & Return Risk | RTO risk scoring and COD order screening |
| `/chargebacks` | Disputes & Chargebacks | Automated evidence packets and arbitration letters |
| `/payments` | Payment Intelligence | Multi-filtered transaction volume and channel analytics |
| `/alerts` | Emergency Console | Critical alert resolution console |
| `/admin/alerts` | Alerts Queue | High-density SOC alerts command center |
| `/admin/reports` | Reports & Audits | Model cards, holdout evaluations, and exportable logs |
| `/system/evaluation` | Model Evaluation | Interactive decision threshold slider and holdout evaluator |
| `/twin` | Digital Twin Lab | 3D Risk Heatmap and 7-stage topology simulation |
| `/connectors` | Connectors & Settings | Razorpay API key configuration and status verification |

*Customer investigation is implemented as a dynamic route/context launched from a customer or alert entity, rather than a single fixed path.*

---

## Reporting & Audit

Reports provide a persistent, queryable view of model evaluation, transaction risk, customer risk, fraud/risk events, gateway and payment intelligence, and audit activity. Reports are positioned as an intelligence and evidence repository — a record of what was decided and why — rather than another live dashboard.

---

## Security

KRYPTIC applies security-conscious practices where implemented:

- JWT-based authentication
- Environment-variable-based configuration
- Backend-only credential handling (Razorpay and Gemini secrets never reach the frontend)
- Pydantic request/response validation
- CORS configuration
- Database access abstraction via SQLAlchemy
- Webhook handling with HMAC signature validation for Razorpay events
- Protected API access on authenticated routes

*KRYPTIC is a prototype implementation with a security-conscious architecture. It does **not** claim PCI-DSS certification, SOC 2 compliance, ISO certification, or any production security certification.*

---

## Project Structure

```
kryptic/
├── backend/
│   ├── app/
│   │   ├── main.py              # Application entrypoint
│   │   ├── api/                 # Route definitions (v1 endpoints)
│   │   ├── models/               # Database models
│   │   ├── schemas/              # Pydantic schemas
│   │   ├── services/             # Risk intelligence services
│   │   └── ml/                   # ML models, pipelines, artifacts
│   ├── test_track02_integration.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/           # Shared UI components
│   │   ├── context/               # App-level context providers
│   │   ├── features/              # Feature modules (detection, twin, chargebacks, etc.)
│   │   ├── pages/                 # Route-level pages
│   │   ├── services/               # API/WebSocket clients
│   │   └── main.tsx               # Frontend entrypoint
│   └── package.json
├── models/                       # Persisted trained model artifacts
├── datasets/                     # PaySim / European Credit Card benchmarks
├── scripts/                      # Utility and setup scripts
├── docs/                         # Additional documentation
├── tests/                        # Test suites
└── README.md
```

---

## Local Development

### Backend

```bash
# Navigate to backend
cd backend

# Create and activate a virtual environment
python -m venv venv

# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

*Interactive API documentation is available at `http://127.0.0.1:8000/docs` once the backend is running.*

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

*The frontend will run at `http://localhost:5173`.*

---

## Environment Variables

| Category | Variable(s) |
|---|---|
| Database | `DATABASE_URL` |
| Redis | `REDIS_URL` |
| Security | `JWT_SECRET_KEY` |
| CORS | `CORS_ORIGINS` |
| Razorpay | `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` |
| Gemini | `GEMINI_API_KEY` |

Example `.env` file (placeholders only — never commit real credentials):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/kryptic
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=replace-with-a-secure-secret
CORS_ORIGINS=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
GEMINI_API_KEY=your_gemini_api_key
```

---

## Testing

Test coverage spans:

- Authentication & JWT issuance
- Database models and migrations
- SHAP / Explainable AI attribution pipelines
- Global system & ML metrics endpoints
- Model card introspection
- Real-time XGBoost risk predictions
- Topology risk propagation across the Digital Twin
- Fraud injection scenarios
- Transaction ingestion & filtering
- Real-time WebSocket event broadcasts

Integration test suite:
```bash
pytest backend/test_track02_integration.py
```

---

## Demo Flow

A single walkthrough that shows the full KRYPTIC loop:

```mermaid
flowchart LR
    A["Risk Overview"] --> B["Critical Alert"]
    B --> C["Customer Investigation"]
    C --> D["Transaction Context"]
    D --> E["Digital Twin"]
    E --> F["Affected Payment Layer"]
    F --> G["Explainability"]
    G --> H["Mitigation"]
    H --> I["Audit / Report"]

    style A fill:#374151,color:#fff
    style B fill:#7f1d1d,color:#fff
    style C fill:#1e3a8a,color:#fff
    style D fill:#1e3a8a,color:#fff
    style E fill:#7c2d12,color:#fff
    style F fill:#7c2d12,color:#fff
    style G fill:#4c1d95,color:#fff
    style H fill:#92400e,color:#fff
    style I fill:#065f46,color:#fff
```

1. **Risk Overview** — start from the dashboard and observe elevated risk activity.
2. **Critical Alert** — open a flagged alert in the Alerts Queue.
3. **Customer Investigation** — move into the customer risk dossier behind the alert.
4. **Transaction Context** — review the specific transactions driving the risk.
5. **Digital Twin** — bring up the live payment-flow topology.
6. **Affected Payment Layer** — identify which node the risk is localized to.
7. **Explainability** — inspect the SHAP factor contributions behind the model's decision.
8. **Mitigation** — take the appropriate action (dispute defense, COD hold, 2FA step-up, etc.).
9. **Audit / Report** — confirm the action, evidence, and state transition are recorded in the compliance log.

*The point of the demo is not the risk score by itself — it's the full path from score to context, infrastructure, explanation, action, and audit.*

---

## What Makes KRYPTIC Different

1. **Customer-aware investigation** — risk is investigated in the context of a customer, not just a single transaction.
2. **Payment-flow Digital Twin** — a live topology model connects risk to actual infrastructure.
3. **Risk localization** — risk events are associated with the payment-flow layer they occurred in.
4. **Explainable decisions** — predictions are paired with the exact factors behind them.
5. **Unified fraud + RTO + chargeback intelligence** — one system instead of three disconnected tools.
6. **Simulation and testing** — a built-in lab to exercise detection and response under synthetic attack scenarios.
7. **Response and audit workflow** — actions and their outcomes are recorded, not just decisions.

*KRYPTIC is not positioned as superior to Razorpay's own systems or other commercial risk platforms — it is a complementary intelligence and investigation layer.*

---

## Current Status & Limitations

- The primary benchmark (PaySim) is synthetic financial simulation data, not live transaction data.
- A real-world anonymized benchmark (European Credit Card Fraud Detection dataset) exists as a separate, unmerged pipeline.
- External integrations (Razorpay, Gemini) require valid credentials to be configured before they are functional.
- Some workflows currently operate under sandbox/demo conditions.
- Recorded model benchmark performance does not guarantee equivalent production performance on live traffic.
- KRYPTIC is a prototype risk-management platform, not a certified production payment gateway.

---

## Roadmap

Future work under consideration:

- Broader real-world validation beyond synthetic benchmarks
- Stronger temporal risk intelligence
- Deeper entity/network intelligence
- Richer payment-flow telemetry
- Improved model monitoring
- Deeper gateway integrations
- Stronger automated dispute evidence generation
- Production infrastructure hardening

---

## License

This project is licensed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<p align="center">Built for the Razorpay AI Buildathon.</p>
