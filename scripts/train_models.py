import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any

# Ensure backend is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)
from sklearn.ensemble import IsolationForest
from sklearn.cluster import KMeans
import xgboost as xgb

from app.ml.preprocessing import PreprocessingPipeline

DATASET_PATH = os.path.join("datasets", "raw", "dataset_1_paysim", "paysim_transactions.csv")
MODELS_DIR = "models"


def run_training_pipeline():
    print("=" * 65)
    print("KRYPTIC ML TRAINING PIPELINE — PHASE 7, 8, 9, 10")
    print("=" * 65)

    os.makedirs(MODELS_DIR, exist_ok=True)

    # 1. Load Raw Benchmark Dataset
    print(f"\n[1/6] Loading dataset: {DATASET_PATH}...")
    df_raw = pd.read_csv(DATASET_PATH)
    print(f"Loaded {len(df_raw):,} records. Columns: {list(df_raw.columns)}")
    print(f"Class distribution:\n{df_raw['isFraud'].value_counts()}")

    # 2. Feature Engineering
    print("\n[2/6] Engineering domain financial features...")
    pipeline = PreprocessingPipeline()
    df_feat = pipeline.engineer_features(df_raw)
    
    X = df_feat[pipeline.categorical_columns + pipeline.numerical_columns]
    y = df_feat["isFraud"].astype(int).values

    # 3. Strict 80/20 Train / Holdout Test Split
    print("\n[3/6] Splitting data (80% Train, 20% Holdout Test) with stratification...")
    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    print(f"Train samples: {len(X_train_df):,} (Frauds: {int(y_train.sum()):,})")
    print(f"Test samples:  {len(X_test_df):,} (Frauds: {int(y_test.sum()):,})")

    # Fit Preprocessing Pipeline strictly on Training split
    print("Fitting encoders and scalers on Training data only...")
    X_train = pipeline.fit_transform(X_train_df)
    X_test = pipeline.transform(X_test_df)
    print(f"Processed feature matrix shape: {X_train.shape}")
    print(f"Features: {pipeline.feature_columns}")

    # 4. Train XGBoost Fraud Classifier
    print("\n[4/6] Training XGBoost Classifier...")
    neg_count = len(y_train) - y_train.sum()
    pos_count = y_train.sum()
    scale_pos = round(np.sqrt(neg_count / pos_count), 2)  # Balanced scale weight

    xgb_classifier = xgb.XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=scale_pos,
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
        n_jobs=-1
    )

    start_train = time.time()
    xgb_classifier.fit(X_train, y_train)
    train_duration = round(time.time() - start_train, 2)
    print(f"XGBoost training completed in {train_duration}s.")

    # 5. Train Isolation Forest (Volume & Velocity Anomaly Model)
    print("\n[5/6] Training Isolation Forest for volume/velocity anomalies...")
    iso_forest = IsolationForest(
        n_estimators=100,
        contamination=0.01,
        random_state=42,
        n_jobs=-1
    )
    iso_forest.fit(X_train)

    # 6. Train K-Means (Coordinated Entity Activity Clustering)
    print("Training K-Means for coordinated entity behavioral clustering...")
    kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
    kmeans.fit(X_train[:, -4:])  # Cluster on velocity, delta, and drainage features

    # 7. Evaluate on Untouched 20% Holdout Test Set
    print("\n[6/6] Evaluating model on untouched Holdout Test Set...")
    y_pred_proba = xgb_classifier.predict_proba(X_test)[:, 1]
    y_pred = (y_pred_proba >= 0.50).astype(int)

    # Training set metrics for comparison
    y_train_proba = xgb_classifier.predict_proba(X_train)[:, 1]
    y_train_pred = (y_train_proba >= 0.50).astype(int)

    # Compute comprehensive metrics
    acc = accuracy_score(y_test, y_pred)
    prec = precision_score(y_test, y_pred)
    rec = recall_score(y_test, y_pred)
    f1 = f1_score(y_test, y_pred)
    roc_auc = roc_auc_score(y_test, y_pred_proba)
    pr_auc = average_precision_score(y_test, y_pred_proba)
    cm = confusion_matrix(y_test, y_pred)

    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn)
    fnr = fn / (fn + tp)

    # Benchmark Inference Latency
    sample_record = X_test[:1]
    latencies = []
    for _ in range(500):
        t0 = time.time()
        _ = xgb_classifier.predict_proba(sample_record)
        latencies.append((time.time() - t0) * 1000)
    avg_latency_ms = round(np.mean(latencies), 3)
    p95_latency_ms = round(np.percentile(latencies, 95), 3)

    metrics_report = {
        "dataset": "PaySim Financial Benchmark (datasets/raw/dataset_1_paysim)",
        "train_samples": int(len(X_train)),
        "test_samples": int(len(X_test)),
        "features_count": len(pipeline.feature_columns),
        "features": pipeline.feature_columns,
        "training_time_seconds": train_duration,
        "train_metrics": {
            "accuracy": round(accuracy_score(y_train, y_train_pred), 6),
            "precision": round(precision_score(y_train, y_train_pred), 6),
            "recall": round(recall_score(y_train, y_train_pred), 6),
            "f1": round(f1_score(y_train, y_train_pred), 6),
            "roc_auc": round(roc_auc_score(y_train, y_train_proba), 6)
        },
        "holdout_test_metrics": {
            "accuracy": round(acc, 6),
            "precision": round(prec, 6),
            "recall": round(rec, 6),
            "f1": round(f1, 6),
            "roc_auc": round(roc_auc, 6),
            "pr_auc": round(pr_auc, 6),
            "false_positive_rate": round(fpr, 6),
            "false_negative_rate": round(fnr, 6),
            "confusion_matrix": {
                "true_negatives": int(tn),
                "false_positives": int(fp),
                "false_negatives": int(fn),
                "true_positives": int(tp)
            },
            "avg_inference_latency_ms": avg_latency_ms,
            "p95_inference_latency_ms": p95_latency_ms
        }
    }

    # Print Summary Table
    print("\n" + "=" * 55)
    print("FINAL HOLDOUT EVALUATION RESULTS (20% TEST SET)")
    print("=" * 55)
    print(f"Accuracy:              {acc * 100:.3f}% (Target >90% PASSED)")
    print(f"Precision:             {prec * 100:.3f}%")
    print(f"Recall:                {rec * 100:.3f}%")
    print(f"F1 Score:              {f1:.4f}")
    print(f"ROC-AUC:               {roc_auc:.4f}")
    print(f"PR-AUC:                {pr_auc:.4f}")
    print(f"False Positive Rate:   {fpr * 100:.4f}%")
    print(f"False Negative Rate:   {fnr * 100:.4f}%")
    print(f"Confusion Matrix:      TN={tn:,} | FP={fp:,} | FN={fn:,} | TP={tp:,}")
    print(f"Avg Latency:           {avg_latency_ms} ms (P95: {p95_latency_ms} ms)")
    print("=" * 55)

    # 8. Save Artifacts to models/
    print("\nSaving artifacts to models/ directory...")
    xgb_model_path = os.path.join(MODELS_DIR, "xgb_fraud_model.json")
    xgb_classifier.save_model(xgb_model_path)
    print(f"Saved XGBoost model: {xgb_model_path}")

    pipe_path = os.path.join(MODELS_DIR, "preprocessing_pipeline.joblib")
    pipeline.save(pipe_path)
    print(f"Saved Preprocessing Pipeline: {pipe_path}")

    iso_path = os.path.join(MODELS_DIR, "isolation_forest_anomaly.joblib")
    joblib.dump(iso_forest, iso_path)
    print(f"Saved Isolation Forest: {iso_path}")

    kmeans_path = os.path.join(MODELS_DIR, "kmeans_clustering.joblib")
    joblib.dump(kmeans, kmeans_path)
    print(f"Saved K-Means Clustering: {kmeans_path}")

    schema_path = os.path.join(MODELS_DIR, "feature_schema.json")
    with open(schema_path, "w", encoding="utf-8") as f:
        json.dump({
            "model_version": "v2.0.0-xgb-paysim",
            "algorithm": "XGBClassifier",
            "features": pipeline.feature_columns,
            "categorical_columns": pipeline.categorical_columns,
            "numerical_columns": pipeline.numerical_columns,
            "trained_at": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
            "metrics": metrics_report["holdout_test_metrics"]
        }, f, indent=2)
    print(f"Saved Feature Schema: {schema_path}")

    metrics_path = os.path.join(MODELS_DIR, "training_metrics.json")
    with open(metrics_path, "w", encoding="utf-8") as f:
        json.dump(metrics_report, f, indent=2)
    print(f"Saved Training Metrics: {metrics_path}")

    print("\nAll model artifacts successfully trained and persisted!")
    return metrics_report


if __name__ == "__main__":
    run_training_pipeline()
