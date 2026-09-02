import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Tuple, Dict, Any, List
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder


class PreprocessingPipeline:
    """
    Leakage-safe, reproducible preprocessing pipeline for KRYPTIC transaction risk models.
    All scalers and encoders are fitted strictly on the training partition.
    """
    def __init__(self):
        self.encoder_type = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
        self.scaler = StandardScaler()
        self.feature_columns: List[str] = []
        self.categorical_columns = ["type"]
        self.numerical_columns = [
            "amount",
            "oldbalanceOrg",
            "newbalanceOrig",
            "oldbalanceDest",
            "newbalanceDest",
            "balance_delta_orig",
            "balance_delta_dest",
            "orig_drain_ratio",
            "is_zero_balance_sweep",
            "step_hour",
            "orig_velocity_1h",
            "dest_fanout"
        ]

    @staticmethod
    def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
        """Derives clean, leak-free domain financial features from raw transaction logs."""
        df_out = df.copy()

        # 1. Clean missing/infinite values
        df_out = df_out.dropna(subset=["amount", "type", "isFraud"])
        
        # 2. Balance delta features
        df_out["balance_delta_orig"] = df_out["oldbalanceOrg"] - df_out["newbalanceOrig"]
        df_out["balance_delta_dest"] = df_out["newbalanceDest"] - df_out["oldbalanceDest"]
        
        # 3. Account drainage indicators
        df_out["orig_drain_ratio"] = np.clip(df_out["amount"] / (df_out["oldbalanceOrg"] + 1.0), 0.0, 100.0)
        df_out["is_zero_balance_sweep"] = ((df_out["oldbalanceOrg"] > 0) & (df_out["newbalanceOrig"] == 0)).astype(float)
        
        # 4. Temporal hour of day
        df_out["step_hour"] = (df_out["step"] % 24).astype(float)

        # 5. Velocity and entity fanout approximations
        orig_counts = df_out["nameOrig"].value_counts()
        dest_counts = df_out["nameDest"].value_counts()
        df_out["orig_velocity_1h"] = df_out["nameOrig"].map(orig_counts).fillna(1).astype(float)
        df_out["dest_fanout"] = df_out["nameDest"].map(dest_counts).fillna(1).astype(float)

        return df_out

    def fit_transform(self, X_train: pd.DataFrame) -> np.ndarray:
        """Fits encoders and scalers on training data only, returning feature matrix."""
        # 1. Encode categorical
        cat_encoded = self.encoder_type.fit_transform(X_train[self.categorical_columns])
        cat_feature_names = self.encoder_type.get_feature_names_out(self.categorical_columns).tolist()

        # 2. Scale numerical
        num_scaled = self.scaler.fit_transform(X_train[self.numerical_columns])

        # Combine
        self.feature_columns = cat_feature_names + self.numerical_columns
        X_processed = np.hstack([cat_encoded, num_scaled])
        return X_processed

    def transform(self, X_test: pd.DataFrame) -> np.ndarray:
        """Transforms unseen test/inference data using training-fitted encoders/scalers."""
        cat_encoded = self.encoder_type.transform(X_test[self.categorical_columns])
        num_scaled = self.scaler.transform(X_test[self.numerical_columns])
        return np.hstack([cat_encoded, num_scaled])

    def save(self, filepath: str):
        """Persists fitted preprocessing artifacts."""
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        joblib.dump({
            "encoder_type": self.encoder_type,
            "scaler": self.scaler,
            "feature_columns": self.feature_columns,
            "numerical_columns": self.numerical_columns,
            "categorical_columns": self.categorical_columns
        }, filepath)

    @classmethod
    def load(cls, filepath: str) -> "PreprocessingPipeline":
        """Loads fitted preprocessing artifacts."""
        data = joblib.load(filepath)
        pipe = cls()
        pipe.encoder_type = data["encoder_type"]
        pipe.scaler = data["scaler"]
        pipe.feature_columns = data["feature_columns"]
        pipe.numerical_columns = data["numerical_columns"]
        pipe.categorical_columns = data["categorical_columns"]
        return pipe
