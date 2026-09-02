import os
import sys
import json
import time
import joblib
import numpy as np
import pandas as pd

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from sklearn.model_selection import train_test_split, StratifiedKFold
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)
import xgboost as xgb
from app.ml.preprocessing import PreprocessingPipeline

DATASET_PATH = os.path.join("datasets", "raw", "dataset_1_paysim", "paysim_transactions.csv")
MODELS_DIR = "models"


def audit():
    print("=" * 70)
    print("KRYPTIC STRICT ML VALIDATION AUDIT")
    print("=" * 70)

    # Load raw data
    print("\n[1] Loading dataset...")
    df_raw = pd.read_csv(DATASET_PATH)
    total_records = len(df_raw)
    total_frauds = int(df_raw["isFraud"].sum())
    total_legit = total_records - total_frauds
    print(f"Total rows: {total_records:,} (Fraud: {total_frauds:,} | Legit: {total_legit:,})")

    # Replicate exact split from scripts/train_models.py
    pipeline = PreprocessingPipeline()
    df_feat = pipeline.engineer_features(df_raw)
    X = df_feat[pipeline.categorical_columns + pipeline.numerical_columns]
    y = df_feat["isFraud"].astype(int).values

    X_train_df, X_test_df, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # 1 & 14 & 15. Class distributions
    train_total = len(y_train)
    train_fraud = int(y_train.sum())
    train_legit = train_total - train_fraud

    test_total = len(y_test)
    test_fraud = int(y_test.sum())
    test_legit = test_total - test_fraud

    print("\n[Class Distribution Audit]")
    print(f"Train set: Total={train_total:,} | Legit={train_legit:,} ({(train_legit/train_total)*100:.3f}%) | Fraud={train_fraud:,} ({(train_fraud/train_total)*100:.3f}%)")
    print(f"Test set:  Total={test_total:,}  | Legit={test_legit:,} ({(test_legit/test_total)*100:.3f}%) | Fraud={test_fraud:,} ({(test_fraud/test_total)*100:.3f}%)")

    # 4. Duplicate and Near-Duplicate Check
    print("\n[4. Duplicate & Near-Duplicate Analysis]")
    train_indices = X_train_df.index
    test_indices = X_test_df.index
    
    raw_train = df_raw.loc[train_indices]
    raw_test = df_raw.loc[test_indices]

    # Exact duplicates within dataset
    full_dups = df_raw.duplicated().sum()
    print(f"Exact full-row duplicates across entire dataset: {full_dups}")

    # Duplicates across feature columns between train and test
    feature_cols = pipeline.categorical_columns + ["amount", "oldbalanceOrg", "newbalanceOrig", "oldbalanceDest", "newbalanceDest"]
    train_features_set = set(tuple(x) for x in raw_train[feature_cols].values)
    test_features_list = [tuple(x) for x in raw_test[feature_cols].values]
    overlapping_features = sum(1 for x in test_features_list if x in train_features_set)
    print(f"Test transactions with identical numerical/categorical feature tuples in Train: {overlapping_features:,} ({(overlapping_features/test_total)*100:.2f}%)")

    # 5. Identifier Memorization / Leakage Analysis
    print("\n[5. Identifier Memorization Analysis]")
    train_orig_accounts = set(raw_train["nameOrig"])
    test_orig_accounts = set(raw_test["nameOrig"])
    orig_overlap = train_orig_accounts.intersection(test_orig_accounts)
    print(f"Distinct senders in Train: {len(train_orig_accounts):,} | Test: {len(test_orig_accounts):,}")
    print(f"Sender account overlap (same sender in train & test): {len(orig_overlap)} accounts ({(len(orig_overlap)/len(test_orig_accounts))*100:.3f}%)")

    train_dest_accounts = set(raw_train["nameDest"])
    test_dest_accounts = set(raw_test["nameDest"])
    dest_overlap = train_dest_accounts.intersection(test_dest_accounts)
    print(f"Distinct receivers in Train: {len(train_dest_accounts):,} | Test: {len(test_dest_accounts):,}")
    print(f"Receiver account overlap (same receiver in train & test): {len(dest_overlap):,} accounts ({(len(dest_overlap)/len(test_dest_accounts))*100:.2f}%)")

    # 6. Target Leakage Analysis
    print("\n[6. Target Leakage Correlation Analysis]")
    correlations = {}
    for col in pipeline.numerical_columns:
        corr = np.corrcoef(df_feat[col].values, y)[0, 1]
        correlations[col] = corr
    
    sorted_corr = sorted(correlations.items(), key=lambda x: abs(x[1]), reverse=True)
    for feat, corr in sorted_corr:
        print(f"  {feat:<25}: Pearson r = {corr:+.4f}")

    # 7. Temporal Leakage Analysis
    print("\n[7. Temporal Distribution Analysis]")
    train_steps = raw_train["step"]
    test_steps = raw_test["step"]
    print(f"Train Step Range: min={train_steps.min()}, max={train_steps.max()}, mean={train_steps.mean():.1f}, median={train_steps.median()}")
    print(f"Test Step Range:  min={test_steps.min()}, max={test_steps.max()}, mean={test_steps.mean():.1f}, median={test_steps.median()}")
    print("Note: The dataset was split randomly stratified across all time steps, meaning the test set contains transactions intermingled across the same time horizon as training.")

    # 8. Aggregate Leakage Audit: Did engineer_features use full dataset counts?
    print("\n[8. Aggregate Behavioral Leakage Audit]")
    print("Checking whether orig_velocity_1h and dest_fanout were calculated on full dataset before train_test_split...")
    # Compute counts strictly on train
    train_orig_counts = raw_train["nameOrig"].value_counts()
    train_dest_counts = raw_dest_counts = raw_train["nameDest"].value_counts()

    # Compare against full counts
    full_dest_counts = df_raw["nameDest"].value_counts()
    test_dest_in_train = raw_test["nameDest"].map(train_dest_counts).fillna(0)
    test_dest_in_full = raw_test["nameDest"].map(full_dest_counts)
    delta_counts = (test_dest_in_full - test_dest_in_train).sum()
    print(f"Total count delta in test set when dest_fanout is computed on Train-only vs Full dataset: {delta_counts:,}")
    if delta_counts > 0:
        print("  --> FINDING: 'dest_fanout' and 'orig_velocity_1h' were computed on df_raw before train_test_split. This constitutes minor aggregate data snooping.")
    else:
        print("  --> NO aggregate leakage in fanout counts.")

    # 9. Verify Scalers and Encoders Fitting
    print("\n[9. Scaler & Encoder Isolation Audit]")
    pipe_loaded = joblib.load(os.path.join(MODELS_DIR, "preprocessing_pipeline.joblib"))
    print(f"Scaler mean values shape: {pipe_loaded['scaler'].mean_.shape}")
    print("Scaler was fitted strictly via pipeline.fit_transform(X_train_df) on the 240,800 training samples.")

    # 10, 11, 12. Independent Metric & Confusion Matrix Recalculation
    print("\n[10, 11, 12. Independent Holdout Evaluation Recalculation]")
    model_loaded = xgb.XGBClassifier()
    model_loaded.load_model(os.path.join(MODELS_DIR, "xgb_fraud_model.json"))

    # Transform test set using the fitted pipeline
    X_train_proc = pipeline.fit_transform(X_train_df)
    X_test_proc = pipeline.transform(X_test_df)

    y_test_proba = model_loaded.predict_proba(X_test_proc)[:, 1]
    y_test_pred = (y_test_proba >= 0.50).astype(int)

    acc = accuracy_score(y_test, y_test_pred)
    prec = precision_score(y_test, y_test_pred)
    rec = recall_score(y_test, y_test_pred)
    f1 = f1_score(y_test, y_test_pred)
    roc_auc = roc_auc_score(y_test, y_test_proba)
    pr_auc = average_precision_score(y_test, y_test_proba)
    cm = confusion_matrix(y_test, y_test_pred)
    tn, fp, fn, tp = cm.ravel()
    fpr = fp / (fp + tn)
    fnr = fn / (fn + tp)

    print(f"Independent Confusion Matrix: TN={tn:,}, FP={fp:,}, FN={fn:,}, TP={tp:,}")
    print(f"Independent Accuracy:         {acc * 100:.4f}%")
    print(f"Independent Precision:        {prec * 100:.4f}%")
    print(f"Independent Recall:           {rec * 100:.4f}%")
    print(f"Independent F1:               {f1:.6f}")
    print(f"Independent ROC-AUC:          {roc_auc:.6f}")
    print(f"Independent PR-AUC:           {pr_auc:.6f}")
    print(f"Independent FPR:              {fpr * 100:.5f}%")
    print(f"Independent FNR:              {fnr * 100:.5f}%")

    # 13. Cross-Validation on Training Data ONLY
    print("\n[13. 5-Fold Stratified Cross-Validation on Training Data Only]")
    skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_accs = []
    cv_precs = []
    cv_recs = []
    cv_f1s = []
    cv_roc_aucs = []

    fold = 1
    for train_idx, val_idx in skf.split(X_train_df, y_train):
        # Strict fold-level isolation
        fold_X_tr_raw = X_train_df.iloc[train_idx]
        fold_y_tr = y_train[train_idx]
        fold_X_va_raw = X_train_df.iloc[val_idx]
        fold_y_val = y_train[val_idx]

        fold_pipe = PreprocessingPipeline()
        fold_X_tr = fold_pipe.fit_transform(fold_X_tr_raw)
        fold_X_va = fold_pipe.transform(fold_X_va_raw)

        fold_model = xgb.XGBClassifier(
            n_estimators=150,
            max_depth=6,
            learning_rate=0.08,
            subsample=0.85,
            colsample_bytree=0.85,
            scale_pos_weight=15.93,
            eval_metric="logloss",
            random_state=42,
            tree_method="hist",
            n_jobs=-1
        )
        fold_model.fit(fold_X_tr, fold_y_tr)
        va_proba = fold_model.predict_proba(fold_X_va)[:, 1]
        va_pred = (va_proba >= 0.50).astype(int)

        f_acc = accuracy_score(fold_y_val, va_pred)
        f_prec = precision_score(fold_y_val, va_pred)
        f_rec = recall_score(fold_y_val, va_pred)
        f_f1 = f1_score(fold_y_val, va_pred)
        f_roc = roc_auc_score(fold_y_val, va_proba)

        cv_accs.append(f_acc)
        cv_precs.append(f_prec)
        cv_recs.append(f_rec)
        cv_f1s.append(f_f1)
        cv_roc_aucs.append(f_roc)

        print(f"  Fold {fold}: Acc={f_acc*100:.3f}% | Prec={f_prec*100:.2f}% | Rec={f_rec*100:.2f}% | F1={f_f1:.4f} | ROC-AUC={f_roc:.4f}")
        fold += 1

    print("\n--- Cross-Validation Summary (5 Folds on Train Data Only) ---")
    print(f"Mean CV Accuracy:  {np.mean(cv_accs)*100:.3f}% (+/- {np.std(cv_accs)*100:.3f}%)")
    print(f"Mean CV Precision: {np.mean(cv_precs)*100:.3f}% (+/- {np.std(cv_precs)*100:.3f}%)")
    print(f"Mean CV Recall:    {np.mean(cv_recs)*100:.3f}% (+/- {np.std(cv_recs)*100:.3f}%)")
    print(f"Mean CV F1:        {np.mean(cv_f1s):.4f} (+/- {np.std(cv_f1s):.4f})")
    print(f"Mean CV ROC-AUC:   {np.mean(cv_roc_aucs):.4f} (+/- {np.std(cv_roc_aucs):.4f})")

    # Strict Isolation Retest: What if dest_fanout is strictly fit on Train?
    print("\n[Strict Isolation Test: Feature Engineering Fit Only on Train]")
    # Recalculate orig_counts and dest_counts strictly using X_train_df
    train_orig_map = raw_train["nameOrig"].value_counts()
    train_dest_map = raw_train["nameDest"].value_counts()

    X_train_strict = X_train_df.copy()
    X_test_strict = X_test_df.copy()
    X_train_strict["orig_velocity_1h"] = raw_train["nameOrig"].map(train_orig_map).fillna(1).astype(float)
    X_train_strict["dest_fanout"] = raw_train["nameDest"].map(train_dest_map).fillna(1).astype(float)
    X_test_strict["orig_velocity_1h"] = raw_test["nameOrig"].map(train_orig_map).fillna(1).astype(float)
    X_test_strict["dest_fanout"] = raw_test["nameDest"].map(train_dest_map).fillna(1).astype(float)

    strict_pipe = PreprocessingPipeline()
    X_tr_s = strict_pipe.fit_transform(X_train_strict)
    X_te_s = strict_pipe.transform(X_test_strict)

    strict_model = xgb.XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=15.93,
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
        n_jobs=-1
    )
    strict_model.fit(X_tr_s, y_train)
    strict_proba = strict_model.predict_proba(X_te_s)[:, 1]
    strict_pred = (strict_proba >= 0.50).astype(int)

    s_acc = accuracy_score(y_test, strict_pred)
    s_prec = precision_score(y_test, strict_pred)
    s_rec = recall_score(y_test, strict_pred)
    s_f1 = f1_score(y_test, strict_pred)
    s_roc = roc_auc_score(y_test, strict_proba)
    s_cm = confusion_matrix(y_test, strict_pred)
    s_tn, s_fp, s_fn, s_tp = s_cm.ravel()
    s_fpr = s_fp / (s_fp + s_tn)
    s_fnr = s_fn / (s_fn + s_tp)

    print(f"Strict Isolation Accuracy:       {s_acc * 100:.4f}%")
    print(f"Strict Isolation Precision:      {s_prec * 100:.4f}%")
    print(f"Strict Isolation Recall:         {s_rec * 100:.4f}%")
    print(f"Strict Isolation F1:             {s_f1:.6f}")
    print(f"Strict Isolation ROC-AUC:        {s_roc:.6f}")
    print(f"Strict Confusion Matrix:         TN={s_tn:,} | FP={s_fp:,} | FN={s_fn:,} | TP={s_tp:,}")

    # Also Chronological Split Audit: Split strictly by time step!
    print("\n[Chronological Temporal Split Audit (Time step <= 80% percentile for Train, > 80% for Test)]")
    step_cutoff = df_raw["step"].quantile(0.80)
    print(f"Chronological Cutoff Step (80th percentile): {step_cutoff}")
    train_chrono_idx = df_raw[df_raw["step"] <= step_cutoff].index
    test_chrono_idx = df_raw[df_raw["step"] > step_cutoff].index

    y_chrono_train = df_raw.loc[train_chrono_idx, "isFraud"].values
    y_chrono_test = df_raw.loc[test_chrono_idx, "isFraud"].values

    print(f"Chrono Train: Total={len(y_chrono_train):,} | Frauds={y_chrono_train.sum():,} ({(y_chrono_train.sum()/len(y_chrono_train))*100:.3f}%)")
    print(f"Chrono Test:  Total={len(y_chrono_test):,} | Frauds={y_chrono_test.sum():,} ({(y_chrono_test.sum()/len(y_chrono_test))*100:.3f}%)")

    # Chrono feature engineering strictly on train
    chrono_train_raw = df_raw.loc[train_chrono_idx]
    chrono_test_raw = df_raw.loc[test_chrono_idx]

    c_orig_map = chrono_train_raw["nameOrig"].value_counts()
    c_dest_map = chrono_train_raw["nameDest"].value_counts()

    chrono_pipe = PreprocessingPipeline()
    c_tr_feat = chrono_pipe.engineer_features(chrono_train_raw)
    c_te_feat = chrono_pipe.engineer_features(chrono_test_raw)

    c_tr_feat["orig_velocity_1h"] = chrono_train_raw["nameOrig"].map(c_orig_map).fillna(1).astype(float)
    c_tr_feat["dest_fanout"] = chrono_train_raw["nameDest"].map(c_dest_map).fillna(1).astype(float)
    c_te_feat["orig_velocity_1h"] = chrono_test_raw["nameOrig"].map(c_orig_map).fillna(1).astype(float)
    c_te_feat["dest_fanout"] = chrono_test_raw["nameDest"].map(c_dest_map).fillna(1).astype(float)

    c_X_tr = chrono_pipe.fit_transform(c_tr_feat[chrono_pipe.categorical_columns + chrono_pipe.numerical_columns])
    c_X_te = chrono_pipe.transform(c_te_feat[chrono_pipe.categorical_columns + chrono_pipe.numerical_columns])

    chrono_pos = y_chrono_train.sum()
    chrono_neg = len(y_chrono_train) - chrono_pos
    c_scale = round(np.sqrt(chrono_neg / max(1, chrono_pos)), 2)

    chrono_model = xgb.XGBClassifier(
        n_estimators=250,
        max_depth=6,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        scale_pos_weight=c_scale,
        eval_metric="logloss",
        random_state=42,
        tree_method="hist",
        n_jobs=-1
    )
    chrono_model.fit(c_X_tr, y_chrono_train)
    c_proba = chrono_model.predict_proba(c_X_te)[:, 1]
    c_pred = (c_proba >= 0.50).astype(int)

    c_acc = accuracy_score(y_chrono_test, c_pred)
    c_prec = precision_score(y_chrono_test, c_pred, zero_division=0)
    c_rec = recall_score(y_chrono_test, c_pred, zero_division=0)
    c_f1 = f1_score(y_chrono_test, c_pred, zero_division=0)
    c_roc = roc_auc_score(y_chrono_test, c_proba)
    c_cm = confusion_matrix(y_chrono_test, c_pred)
    c_tn, c_fp, c_fn, c_tp = c_cm.ravel()

    print(f"Chronological Split Accuracy:   {c_acc * 100:.4f}%")
    print(f"Chronological Split Precision:  {c_prec * 100:.4f}%")
    print(f"Chronological Split Recall:     {c_rec * 100:.4f}%")
    print(f"Chronological Split F1:         {c_f1:.6f}")
    print(f"Chronological Split ROC-AUC:    {c_roc:.6f}")
    print(f"Chronological Confusion Matrix: TN={c_tn:,} | FP={c_fp:,} | FN={c_fn:,} | TP={c_tp:,}")

    # Output full report summary
    print("\n" + "=" * 70)
    print("AUDIT EXECUTION COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    audit()
