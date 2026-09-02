# KRYPTIC — Machine Learning Requirement Specification

**Document Version:** 1.0.0  
**Phase:** Phase 0 & Phase 1 Specification  
**System Name:** KRYPTIC Payment Risk Intelligence Platform  

---

## 1. Executive Summary & Purpose

KRYPTIC is an AI-native payment risk intelligence platform providing multi-system fraud detection, behavioral anomaly monitoring, Digital Twin simulations, explainable AI, and real-time alert-response orchestration.

This specification maps every functional capability in KRYPTIC to its rigorous machine learning formulation, identifying required historical data, feature inputs, task taxonomy, expected model outputs, and presentation layers in the UI.

---

## 2. Feature-by-Feature ML Specification

### Feature 1: Transaction Fraud Prediction
- **Functional Description:** Evaluates an incoming single transaction in real time to predict the likelihood that it is an unauthorized or fraudulent event.
- **Required Prediction:** Binary classification probability ($P(\text{Fraud}) \in [0.0, 1.0]$) and binary prediction label ($y \in \{0, 1\}$).
- **Required Historical Data:** Historical transaction records with verified ground-truth chargeback/fraud outcomes, transaction amounts, timestamps, payment methods, sender/receiver account identifiers, balances, and terminal indicators.
- **Required Features / Columns:** `amount`, `transaction_type`, `step`/timestamp, `oldbalanceOrg`, `newbalanceOrig`, `oldbalanceDest`, `newbalanceDest`, `balance_delta_orig`, `balance_delta_dest`, `amount_to_balance_ratio`, `is_zero_balance_sweep`.
- **ML Task Taxonomy:** Supervised Binary Tabular Classification.
- **Primary Algorithm:** XGBoost Classifier (`binary:logistic`) with hyperparameter tuning and scale weight balancing for severe class skew.
- **Model Output Schema:**
  - `fraud_probability`: `float` (e.g. `0.8742`)
  - `fraud_prediction`: `int` (`0` or `1`)
  - `risk_score`: `int` (`0` to `100`)
- **UI Display Location:** `FraudDetection.tsx` (Risk Gauge & Score Card), `CrossSystemTable.tsx` (Risk score badge), `Dashboard.tsx` (Critical transactions ticker).

---

### Feature 2: Transaction Risk Band Scoring
- **Functional Description:** Translates continuous fraud probability and behavioral anomaly signals into operational risk tiers (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) with associated defensive policy recommendations (`APPROVE`, `REVIEW`, `CHALLENGE_2FA`, `DECLINE`).
- **Required Prediction:** Multi-tier calibrated risk assessment without arbitrary hardcoded heuristics.
- **Required Historical Data:** Labeled risk outcomes, historical false positive rates, and transaction severity distributions.
- **Required Features / Columns:** Calibrated model probability $P(\text{Fraud})$, anomaly z-score, entity historical risk baseline.
- **ML Task Taxonomy:** Probability Calibration (Isotonic Regression / Platt Scaling) & Multi-class Decision Mapping.
- **Model Output Schema:**
  - `risk_level`: `"LOW" | "MEDIUM" | "HIGH" | "CRITICAL"`
  - `action_recommended`: `"APPROVE" | "REVIEW" | "CHALLENGE_2FA" | "DECLINE"`
- **UI Display Location:** `FraudDetection.tsx`, `AlertsEmergency.tsx`, `Sidebar.tsx`.

---

### Feature 3: Transaction Volume & Spike Anomaly Detection
- **Functional Description:** Detects sudden bursts in transaction counts or gross volume amounts across rolling time windows compared against calculated historical baselines.
- **Required Prediction:** Anomaly score ($\in [-1.0, 1.0]$) and binary spike indicator ($\text{is\_spike} \in \{0, 1\}$).
- **Required Historical Data:** Continuous time-series of transaction counts and volume amounts grouped by hourly/daily intervals.
- **Required Features / Columns:** `tx_count_1h`, `tx_volume_1h`, `rolling_mean_24h`, `rolling_std_24h`, `z_score_volume`, `time_of_day_cyclical`.
- **ML Task Taxonomy:** Unsupervised Time-Series / Tabular Anomaly Detection.
- **Primary Algorithm:** Isolation Forest & Rolling Statistical Z-Score Detection.
- **Model Output Schema:**
  - `anomaly_score`: `float`
  - `is_spike`: `bool`
  - `deviation_sigma`: `float`
- **UI Display Location:** `Dashboard.tsx` (Threat Radar / Spike Chart), `AlertsEmergency.tsx` (System volume anomalies).

---

### Feature 4: Velocity Anomaly Detection
- **Functional Description:** Identifies rapid-fire transaction initiation by an entity or account that violates normal human velocity baselines (e.g. credential stuffing, automated script execution, rapid card testing).
- **Required Prediction:** Velocity anomaly classification indicating automated/bot behavior.
- **Required Historical Data:** Historical inter-transaction arrival times ($\Delta t$) and entity-level operation logs.
- **Required Features / Columns:** `velocity_1h`, `velocity_24h`, `inter_arrival_time_sec`, `velocity_acceleration_ratio`.
- **ML Task Taxonomy:** Unsupervised Anomaly Detection / Feature-based Classification.
- **Primary Algorithm:** Isolation Forest / Statistical Outlier Modeling.
- **Model Output Schema:**
  - `velocity_risk_score`: `float`
  - `velocity_burst_flag`: `bool`
- **UI Display Location:** `CrossSystemRisk.tsx` (Signal drawer: "High Velocity Burst"), `AlertsEmergency.tsx` (Alert: "Velocity Burst Detected").

---

### Feature 5: Entity & Account Historical Behavior
- **Functional Description:** Analyzes an individual entity's historical trajectory (spending habits, destination diversity, time-of-day preferences) to flag abrupt deviation from established patterns.
- **Required Prediction:** Behavioral divergence score relative to entity baseline.
- **Required Historical Data:** Longitudinal entity-level transaction logs over extended horizons.
- **Required Features / Columns:** `entity_id`, `avg_amount_30d`, `amount_std_30d`, `destination_account_count`, `entity_age_days`, `historical_fraud_count`.
- **ML Task Taxonomy:** Entity Profiling & Behavioral Deviation Scoring.
- **Primary Algorithm:** Entity Baseline Feature Store + XGBoost Context Features.
- **Model Output Schema:**
  - `entity_risk_score`: `int`
  - `behavioral_entropy`: `float`
- **UI Display Location:** `CrossSystemRisk.tsx` (Entity cards & Entity Timeline Modal).

---

### Feature 6: Clustering & Coordinated Multi-Entity Activity
- **Functional Description:** Groups transactions and accounts exhibiting synchronized or shared behavioral signatures (e.g. mule rings, organized fraud syndicates, identical micro-amount patterns).
- **Required Prediction:** Cluster ID assignment ($C_k$) and cluster risk density.
- **Required Historical Data:** Graph or tabular transactional linkages sharing common attributes (destination accounts, timing synchrony, token overlap).
- **Required Features / Columns:** `amount`, `inter_event_time`, `dest_fanout_ratio`, `token_shared_degree`.
- **ML Task Taxonomy:** Unsupervised Clustering.
- **Primary Algorithm:** K-Means / DBSCAN (Density-Based Spatial Clustering).
- **Model Output Schema:**
  - `cluster_id`: `int`
  - `is_coordinated_group`: `bool`
- **UI Display Location:** `CrossSystemNetwork.tsx` (SVG Network visualization nodes & edges), `Connectors.tsx`.

---

### Feature 7: Payment Channel & Method Behavior
- **Functional Description:** Identifies risk concentration across payment rails (e.g. Card, UPI, ACH, Instant Transfer).
- **Required Prediction:** Channel-specific risk differential and expected channel fraud rate.
- **Required Historical Data:** Labeled payment channel/method categorical data.
- **Required Features / Columns:** `channel_type` (`TRANSFER`, `CASH_OUT`, `PAYMENT`, `DEBIT`), `channel_velocity`, `channel_amount_distribution`.
- **ML Task Taxonomy:** Multi-channel Risk Factor Modeling / Stratified XGBoost Evaluation.
- **Model Output Schema:**
  - `channel_risk_multiplier`: `float`
  - `channel_anomaly_detected`: `bool`
- **UI Display Location:** `Payment.tsx` (Method breakdown), `CrossSystemTable.tsx` (Channel badge).

---

### Feature 8: OTP / Authentication Risk
- **Audit Finding:** Requires historical authentication telemetry (`failed_attempts`, `otp_latency_sec`, `resend_count`). If the selected public datasets lack genuine OTP retry logs, this feature will be documented as unsupported by available supervised data, rather than inventing fabricated authentication rows.
- **ML Task Taxonomy:** Supervised / Anomaly Classification on Authentication Attempts.
- **UI Display Location:** `FraudDetection.tsx` (Authentication signal), `AlertsEmergency.tsx`.

---

### Feature 9: Device & Location Behavior
- **Audit Finding:** Requires device fingerprints (`device_id`, `os`, `browser_version`) and geographic signals (`ip_country`, `geo_distance_km`). Used where dataset contains real or derived device tokens.
- **ML Task Taxonomy:** Geographic Velocity & Device Novelty Anomaly Detection.
- **UI Display Location:** `ConnectionDetailDrawer.tsx` (Device/IP token details), `CrossSystemRisk.tsx`.

---

### Feature 10: Payment-System Layer Prediction
- **Functional Description:** Predicts which payment pipeline layer (Entry Gateway, Auth Service, Risk Engine, Payment Router, Processing, Authorization, Settlement) is experiencing anomalous stress or failure propagation.
- **Audit Finding:** Public transaction datasets record business financial transactions, not internal microservice distributed traces. Supervised training of 7-layer internal microservice routing is **not** present in raw transaction CSVs. Layer localization will be driven by telemetry service mapping (e.g., token errors $\to$ Auth; velocity $\to$ Risk Engine; gateway declines $\to$ Settlement), and reported transparently.
- **UI Display Location:** `TwinCanvas.tsx` (Digital Twin 7-layer node states), `AlertsEmergency.tsx` (Payment Layer badge).

---

### Feature 11: Model Explainability (SHAP Contributions)
- **Functional Description:** Computes exact, mathematically grounded feature contributions explaining *why* a transaction was assigned its risk score, replacing all hardcoded explanations.
- **Required Output:** SHAP (SHapley Additive exPlanations) values for every feature: $\phi_i \in \mathbb{R}$, base expected value $E[f(x)]$, and positive/negative impact directions.
- **Primary Algorithm:** TreeSHAP on trained XGBoost model artifacts.
- **Model Output Schema:**
  - `base_value`: `float`
  - `feature_contributions`: `List[{feature, display_name, value, contribution, impact_direction}]`
  - `top_risk_factors`: `List[str]`
- **UI Display Location:** `ExplainableAI.tsx` (Interactive horizontal SHAP waterfall chart & driving risk factor list).

---

### Feature 12: Fraud Injection Lab
- **Functional Description:** Interactive test bench allowing risk operators to inject stress scenarios (`FRAUD_SPIKE`, `HIGH_VELOCITY`, `COORDINATED_ATTACK`) and observe real-time model inferences and Digital Twin cascade effects.
- **ML Interface Requirement:** Unified production inference contract consuming normalized transaction payloads and returning live probabilities, SHAP factors, and latency metrics.
- **UI Display Location:** `TwinLab.tsx` (Simulation controls, live event log, empirical evaluation cards).
