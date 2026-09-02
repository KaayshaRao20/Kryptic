# KRYPTIC — Feature Coverage Report

**Generated:** September 2, 2026  
**Auditor:** Antigravity ML Pipeline  
**Methodology:** Direct inspection of collected raw benchmarks against KRYPTIC requirements. Zero data fabrication.

---

## 1. Feature Coverage Matrix

| KRYPTIC Feature | Required Telemetry / Data | Benchmark Dataset | Source Columns | Direct / Derived | Coverage Status | Notes & Limitations |
|---|---|---|---|---|---|---|
| **A. Transaction Fraud Prediction** | Transaction volume, timing, balances, fraud label | PaySim & European CC | `amount`, `type`, `oldbalanceOrg`, `newbalanceOrig`, `oldbalanceDest`, `newbalanceDest`, `isFraud` / `Class` | **Direct & Derived** | **SUFFICIENT** | Ground-truth labels present in both datasets. |
| **B. Transaction Risk Prediction** | Multi-tier calibrated risk probability | PaySim & European CC | Calibrated model outputs $P(\text{Fraud} \mid X)$ | **Derived** | **SUFFICIENT** | Model learns risk probability from training distributions; calibrated into operational tiers. |
| **C. Transaction Spike / Volume Anomaly** | Transactions over time, hourly rate, volume burst | PaySim (`step`) & European CC (`Time`) | `step`, `Time`, `amount` | **Derived** (Rolling hourly aggregates, Z-score) | **SUFFICIENT** | Rolling transaction counts per time step provide baseline distribution. |
| **D. Velocity Anomaly** | Transactions per hour, inter-arrival time, velocity acceleration | PaySim | `step`, `nameOrig`, `nameDest` | **Derived** (Entity rolling count per step window) | **SUFFICIENT** | Hourly step groupings allow deriving entity velocity and destination fanout. |
| **E. Entity / Account Behavior** | Historical spending habits, balance drainage, account deviations | PaySim | `nameOrig`, `nameDest`, `oldbalanceOrg`, `amount` | **Derived** (Entity historical averages & balance drainage ratio) | **SUFFICIENT** | `oldbalanceOrg - amount == newbalanceOrig` provides clean balance delta indicators. |
| **F. Clustering / Coordinated Activity** | Multi-party fanout, destination mule rings, similar micro-amounts | PaySim | `nameDest`, `amount`, `type`, `step` | **Derived** (Receiver fanout density & amount clustering) | **SUFFICIENT** | Detects recipient accounts receiving multiple transfers within identical time steps. |
| **G. Payment Channel / Method Behavior** | Risk concentration by transfer rail / category | PaySim | `type` (`PAYMENT`, `TRANSFER`, `CASH_OUT`, `DEBIT`, `CASH_IN`) | **Direct** | **SUFFICIENT** | PaySim provides clear separation of financial rails; fraud concentrates in `TRANSFER` and `CASH_OUT`. |
| **H. OTP / Authentication Risk** | Authentication retries, failed attempts, OTP latency | *None available in public datasets* | *None* | *None* | **INSUFFICIENT (NOT TRAINABLE)** | **AUDIT FINDING:** Neither PaySim nor European Credit Card contains OTP/2FA challenge logs. Under the zero-fabrication directive, this cannot currently be trained supervised from available historical data. |
| **I. Device / Location Behavior** | IP address, geolocation coordinates, device OS | European CC (PCA) / PaySim (Account prefix) | `V1-V28` (European CC) / `nameDest` (`M` vs `C`) | **Derived (Obfuscated)** | **PARTIALLY SUFFICIENT** | PCA features capture terminal variance, but cleartext IP/Geo strings are absent in public privacy-preserved datasets. |
| **J. Payment-System Layer Prediction** | Microservice pipeline layer (Entry $\to$ Auth $\to$ Risk $\to$ Router $\to$ Proc $\to$ Authz $\to$ Settlement) | *None available in public datasets* | *None* | *None* | **INSUFFICIENT (SUPERVISED)** | **AUDIT FINDING:** Public financial datasets record end-user financial transactions, not internal microservice distributed traces. Supervised training of 7-layer internal routing is not possible from raw transaction logs without distributed tracing data. |
| **K. Model Explainability** | Mathematical feature contributions explaining predictions | PaySim & European CC | TreeSHAP values over all input features | **Derived** | **SUFFICIENT** | TreeSHAP mathematically calculates feature impacts ($\phi_i$) for every inference. |
| **L. Fraud Injection Lab** | Production inference interface consuming transactions | All trained models | Model inference API | **Direct** | **SUFFICIENT** | Model exposes unified REST/Python scoring pipeline. |

---

## 2. Summary of Gaps & Limitations

1. **OTP / 2FA Data (Feature H):**
   - **Status:** **INSUFFICIENT DATA**
   - **Reason:** Public financial benchmark datasets exclude sensitive user authentication logs to prevent security risks. OTP risk should be evaluated via operational rate-limiting and policy engines until private authentication telemetry is integrated.

2. **Microservice Layer Prediction (Feature J):**
   - **Status:** **CANNOT CURRENTLY BE TRAINED SUPERVISED FROM AVAILABLE HISTORICAL DATA**
   - **Reason:** Financial datasets record monetary movements between accounts, not internal API hops between microservices. In KRYPTIC, layer mapping will operate via architectural domain mapping (e.g. Velocity $\to$ Risk Engine, Token anomalies $\to$ Auth Service, Settlement rail anomalies $\to$ Settlement Service) rather than fabricated classification labels.

3. **Trainable Scope for ML Modeling:**
   - **Primary Model 1:** Supervised Fraud & Risk Prediction (XGBoost on PaySim & European Credit Card).
   - **Primary Model 2:** Volume Spike & Velocity Anomaly Detection (Isolation Forest & Statistical Z-Scoring).
   - **Primary Model 3:** Coordinated Account Clustering (K-Means on Entity Transaction Fanout).
