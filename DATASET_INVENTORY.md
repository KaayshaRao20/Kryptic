# KRYPTIC — Dataset Inventory

**Generated:** September 2, 2026  
**Storage Root:** `datasets/raw/`  
**Policy:** Isolated raw datasets. No merged monolithic files. No data fabrication.  

---

## 1. Dataset 1: PaySim Mobile Money Financial Benchmark

- **Dataset Identifier:** `dataset_1_paysim`
- **File Path:** `datasets/raw/dataset_1_paysim/paysim_transactions.csv`
- **Primary Source:** Public academic benchmark derived from aggregated production logs of a live African mobile money service (Lopez-Rojas et al., [Kaggle](https://www.kaggle.com/datasets/ealaxi/paysim1) / [Hugging Face](https://huggingface.co/datasets/vitaliy-sharandin/synthetic-fraud-detection)).
- **License / Usage:** Open Academic & Research Benchmark (CC BY-SA 4.0).
- **Type:** Synthetic financial simulation calibrated on real-world mobile money logs.
- **File Size:** ~23.5 MB
- **Total Rows:** 301,000
- **Total Columns:** 11
- **Available Fields:**
  1. `step`: Integer unit of time (1 step = 1 hour).
  2. `type`: Transaction rail / channel (`PAYMENT`, `TRANSFER`, `CASH_OUT`, `DEBIT`, `CASH_IN`).
  3. `amount`: Monetary value of the transaction.
  4. `nameOrig`: Customer / entity account originating the transaction (`C` prefix).
  5. `oldbalanceOrg`: Initial sender account balance prior to transaction.
  6. `newbalanceOrig`: Sender account balance after transaction.
  7. `nameDest`: Recipient account or merchant terminal identifier (`C` customer / `M` merchant prefix).
  8. `oldbalanceDest`: Initial recipient account balance prior to transaction.
  9. `newbalanceDest`: Recipient account balance after transaction.
  10. `isFraud`: Ground-truth binary fraud label (`1` = unauthorized fraudulent transaction, `0` = legitimate).
  11. `isFlaggedFraud`: Static legacy rule-flag (attempts to transfer > 200,000 in a single step).
- **Fraud Distribution:**
  - Class `0` (Legitimate): 299,819 (99.61%)
  - Class `1` (Fraudulent): 1,181 (0.39%)
- **Timestamps:** Relative hourly sequence steps (`step` 1 to 100+).
- **Transaction Information:** Amount, transfer type, balance deltas for both originating and receiving parties.
- **Entity Information:** Sender entity ID (`nameOrig`) and recipient entity ID (`nameDest`).
- **Channel Information:** Direct representation of settlement rails (`PAYMENT`, `TRANSFER`, `CASH_OUT`, `DEBIT`, `CASH_IN`).
- **Authentication Information:** Not present in raw records (no OTP / password retry telemetry).
- **Device Information:** Not present in raw records (anonymized sender/receiver account handles only).
- **Location Information:** Not present in raw records.
- **Event / Layer Information:** Implicit channel classification (Cash-out vs. Direct Transfer), but no internal microservice trace headers.
- **Supported KRYPTIC Features:**
  - Feature A: Transaction Fraud Prediction
  - Feature B: Transaction Risk Band Scoring
  - Feature C: Transaction Volume & Spike Anomaly Detection
  - Feature D: Velocity Anomaly Detection (Entity & Destination velocity)
  - Feature E: Entity & Account Historical Behavior
  - Feature F: Clustering & Coordinated Multi-Entity Activity (Fanout transfers)
  - Feature G: Payment Channel / Method Behavior
  - Feature K: Explainability (SHAP Feature Contributions)
  - Feature L: Fraud Injection Lab Inference Contract

---

## 2. Dataset 2: European Credit Card Fraud Detection Benchmark

- **Dataset Identifier:** `dataset_2_european_cc`
- **File Path:** `datasets/raw/dataset_2_european_cc/creditcard_transactions.csv`
- **Primary Source:** Real card transactions made by European cardholders in September 2013 (Machine Learning Group - ULB, Dal Pozzolo et al.).
- **License / Usage:** Open Database License (ODbL) / Academic Research.
- **Type:** 100% Real-world card transactions, anonymized via Principal Component Analysis (PCA) to preserve cardholder privacy.
- **File Size:** ~143.8 MB
- **Total Rows:** 284,807
- **Total Columns:** 31
- **Available Fields:**
  1. `Time`: Elapsed seconds between this transaction and the first transaction in the dataset.
  2. `V1` through `V28`: 28 numerical features obtained via PCA transformation (sensitive behavioral and terminal factors).
  3. `Amount`: Transaction purchase amount.
  4. `Class`: Ground-truth binary label (`1` = fraud, `0` = legitimate).
- **Fraud Distribution:**
  - Class `0` (Legitimate): 284,315 (99.83%)
  - Class `1` (Fraudulent): 492 (0.17%)
- **Timestamps:** Continuous elapsed seconds across 48 hours (captures real diurnal cycle).
- **Transaction Information:** Exact transaction dollar amounts and PCA features representing behavioral deviations.
- **Entity Information:** Obfuscated within PCA components to protect customer identity.
- **Channel Information:** POS / Card payment rails.
- **Authentication Information:** Not present in cleartext (subsumed in PCA features).
- **Device Information:** Subsumed in PCA features.
- **Location Information:** Subsumed in PCA features.
- **Event / Layer Information:** Card payment rail.
- **Supported KRYPTIC Features:**
  - Feature A: Transaction Fraud Prediction
  - Feature B: Transaction Risk Prediction
  - Feature C: Volume & Time-Series Anomaly Detection (Diurnal cycle modeling)
  - Feature K: Explainability (Feature contribution analysis)
  - Feature L: Fraud Injection Lab Inference Contract

---

## 3. Dataset Summary Matrix

| Dataset | Type | Rows | Fraud Count | Key Strengths | Missing / Unsupported Fields |
|---|---|---|---|---|---|
| **PaySim (`dataset_1_paysim`)** | Calibrated Synthetic Financial Log | 301,000 | 1,181 | Interpretable features, balance tracking, channels, sender/receiver entities | No OTP retries, no cleartext device IPs |
| **European CC (`dataset_2_european_cc`)** | Real-world Anonymized Benchmark | 284,807 | 492 | 100% real human card fraud, continuous timestamps | Cleartext entity names, OTP logs |
