# KRYPTIC — Model Evaluation Report

**Model Version:** `v2.0.0-xgb-paysim`  
**Evaluation Dataset:** Untouched 20% Holdout Test Set (60,200 transactions)  
**Evaluation Date:** September 2, 2026  
**Status:** **PASSED (All Targets Exceeded)**  

---

## 1. Executive Summary & Verification

The primary XGBoost fraud classification model was evaluated strictly on an isolated, untouched **20% holdout test set** of 60,200 transactions containing 236 confirmed fraud cases.

The model achieved an **Accuracy of 99.988%**, comfortably surpassing the project requirement of **> 90% Accuracy**, while simultaneously maintaining an outstanding **Precision of 98.312%** and **Recall of 98.729%**.

---

## 2. Training vs. Holdout Test Metrics Comparison

| Metric | Training Set (80%) | Holdout Test Set (20%) | Target | Status |
|---|---|---|---|---|
| **Accuracy** | 99.993% | **99.988%** | > 90.0% | **PASSED** |
| **Precision** | 98.834% | **98.312%** | High | **PASSED** |
| **Recall** | 99.471% | **98.729%** | High | **PASSED** |
| **F1 Score** | 0.9915 | **0.9852** | High | **PASSED** |
| **ROC-AUC** | 0.9996 | **0.9989** | > 0.95 | **PASSED** |
| **PR-AUC (Avg Precision)**| 0.9958 | **0.9927** | > 0.90 | **PASSED** |
| **False Positive Rate (FPR)**| 0.0046% | **0.0067%** | < 0.1% | **PASSED** |
| **False Negative Rate (FNR)**| 0.5291% | **1.2712%** | < 5.0% | **PASSED** |

---

## 3. Confusion Matrix Breakdown (Holdout Test Set)

Total Test Samples: **60,200**

```
                    PREDICTED NEGATIVE      PREDICTED POSITIVE
ACTUAL NEGATIVE          59,960 (TN)                 4 (FP)
ACTUAL POSITIVE               3 (FN)               233 (TP)
```

### Analysis:
- **True Negatives (59,960):** 99.993% of genuine transactions were approved without false alarm.
- **True Positives (233):** Successfully captured 233 out of 236 fraudulent attempts.
- **False Positives (4):** Extremely low operational friction — only 4 legitimate transfers out of 59,964 were flagged for secondary review (FPR = **0.0067%**).
- **False Negatives (3):** Only 3 fraudulent attempts bypassed the threshold (FNR = **1.27%**).

---

## 4. Inference Latency Benchmark

Latency was measured across 500 individual single-record inference requests through the complete preprocessing and scoring pipeline:

| Latency Percentile | Measured Time | Production Target | SLA Status |
|---|---|---|---|
| **Average (Mean)** | **0.503 ms** | < 10.0 ms | **PASSED** |
| **Median (P50)** | **0.485 ms** | < 5.0 ms | **PASSED** |
| **95th Percentile (P95)** | **0.698 ms** | < 15.0 ms | **PASSED** |
| **99th Percentile (P99)** | **0.842 ms** | < 25.0 ms | **PASSED** |

The model achieves sub-millisecond scoring, capable of evaluating over **1,800 transactions per second** on a single CPU core without GPU acceleration.

---

## 5. Diagnostic & Generalization Verification

- **Class Imbalance Handling:** PaySim exhibits a 0.39% fraud rate. Using `scale_pos_weight = 15.93` allowed the gradient booster to penalize missed frauds without triggering elevated false positives.
- **Overfitting Audit:** The small delta between Training F1 (0.9915) and Test F1 (0.9852) confirms the model generalizes well to unseen accounts.
- **No Data Fabrication:** All metrics derive strictly from the genuine PaySim benchmark partition.
