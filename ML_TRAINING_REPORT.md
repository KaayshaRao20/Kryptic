# KRYPTIC — Machine Learning Training Report

**Model Version:** `v2.0.0-xgb-paysim`  
**Date of Training:** September 2, 2026  
**Primary Algorithm:** XGBoost Classifier (`XGBClassifier`)  
**Secondary Algorithms:** Isolation Forest (Volume/Velocity Outliers) & K-Means (Coordinated Entity Clustering)  

---

## 1. Training Environment & Methodology

- **Frameworks:** XGBoost 2.1+, Scikit-Learn 1.4+, Pandas 2.2+, NumPy 1.26+
- **Data Source:** PaySim Public Financial Benchmark (`datasets/raw/dataset_1_paysim/paysim_transactions.csv`)
- **Total Records:** 301,000 authentic financial transaction records
- **Data Partitioning:**
  - **Training Set (80%):** 240,800 records (239,855 legitimate, 945 confirmed fraud)
  - **Holdout Test Set (20%):** 60,200 records (59,964 legitimate, 236 confirmed fraud)
  - **Sampling Strategy:** Stratified train/test split preserving the natural 0.39% ground-truth fraud class ratio.
  - **Leakage Prevention:** All scalers (`StandardScaler`) and categorical encoders (`OneHotEncoder`) were fitted exclusively on the 80% training set and then transformed onto the test set.

---

## 2. Feature Schema & Engineering

The model trains across **17 engineered domain features**:

| # | Feature Name | Type | Description |
|---|---|---|---|
| 1 | `type_CASH_IN` | Categorical (OHE) | Inbound account cash deposit rail |
| 2 | `type_CASH_OUT` | Categorical (OHE) | Liquidity cash-out transfer rail |
| 3 | `type_DEBIT` | Categorical (OHE) | Direct debit charge rail |
| 4 | `type_PAYMENT` | Categorical (OHE) | Standard retail merchant payment rail |
| 5 | `type_TRANSFER` | Categorical (OHE) | Person-to-person or account-to-account transfer rail |
| 6 | `amount` | Numerical (Scaled) | Monetary amount of the transaction |
| 7 | `oldbalanceOrg` | Numerical (Scaled) | Sender balance prior to transaction |
| 8 | `newbalanceOrig` | Numerical (Scaled) | Sender balance after transaction |
| 9 | `oldbalanceDest` | Numerical (Scaled) | Receiver balance prior to transaction |
| 10 | `newbalanceDest` | Numerical (Scaled) | Receiver balance after transaction |
| 11 | `balance_delta_orig` | Numerical (Scaled) | Explicit balance delta: `oldbalanceOrg - newbalanceOrig` |
| 12 | `balance_delta_dest` | Numerical (Scaled) | Explicit balance delta: `newbalanceDest - oldbalanceDest` |
| 13 | `orig_drain_ratio` | Numerical (Scaled) | Account drainage percentage: `amount / (oldbalanceOrg + 1.0)` |
| 14 | `is_zero_balance_sweep` | Numerical (Binary) | Indicator if transaction completely drains account to zero |
| 15 | `step_hour` | Numerical (Cyclical) | Diurnal hour of day (`step % 24`) |
| 16 | `orig_velocity_1h` | Numerical (Scaled) | Sender entity rolling transaction frequency counter |
| 17 | `dest_fanout` | Numerical (Scaled) | Recipient entity fanout degree (number of distinct payers) |

---

## 3. XGBoost Hyperparameter Configuration

```python
xgb_classifier = xgb.XGBClassifier(
    n_estimators=250,
    max_depth=6,
    learning_rate=0.08,
    subsample=0.85,
    colsample_bytree=0.85,
    scale_pos_weight=15.93, # sqrt(negative / positive) balancing
    eval_metric="logloss",
    tree_method="hist",
    random_state=42
)
```

- **Training Execution Time:** 2.21 seconds.
- **Resource Footprint:** 17 features $\times$ 240,800 rows; peak RAM usage during training: ~185 MB.

---

## 4. Anomaly Detection & Clustering Sub-Models

1. **Isolation Forest (`isolation_forest_anomaly.joblib`):**
   - **Estimators:** 100 decision trees.
   - **Contamination Rate:** 1% ($0.01$).
   - **Role:** Identifies sudden transaction volume spikes and velocity surges without arbitrary static thresholds.
2. **K-Means Clustering (`kmeans_clustering.joblib`):**
   - **Clusters ($k$):** 5 behavioral clusters.
   - **Features:** Entity velocity, destination fanout, balance delta, and drain ratio.
   - **Role:** Groups entities into coordinated activity rings for cross-system network intelligence.

---

## 5. Artifact Directory Inventory

```
models/
├── xgb_fraud_model.json             <-- Trained primary XGBoost classifier
├── preprocessing_pipeline.joblib    <-- Encoders, scalers, and feature list
├── isolation_forest_anomaly.joblib  <-- Volume & velocity anomaly detector
├── kmeans_clustering.joblib         <-- Entity behavioral clustering model
├── feature_schema.json              <-- Schema contract & feature definitions
└── training_metrics.json            <-- Machine-readable benchmark results
```
