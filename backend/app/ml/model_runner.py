import os
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import joblib
import numpy as np

from app.core.config import settings
from app.ml.extractor import (
    FEATURE_NAMES,
    extract_features,
    features_to_vector
)

CLASS_NAMES = [
    "Benign",
    "SQL_Injection",
    "XSS",
    "Path_Traversal",
    "Command_Injection",
    "Brute_Force"
]

class MLClassifierSubsystem:
    def __init__(self):
        self.rf_model = None
        self.iso_model = None
        self.is_loaded = False
        self.version = "v1.2 (23 Features)"
        self.load_models()

    def load_models(self):
        model_path = Path(settings.ML_MODEL_PATH)
        iso_path = Path(settings.ISO_MODEL_PATH)

        if model_path.exists():
            try:
                self.rf_model = joblib.load(model_path)
                self.is_loaded = True
            except Exception as e:
                print(f"[ML] Warning: Failed to load RF model: {e}")

        if iso_path.exists():
            try:
                self.iso_model = joblib.load(iso_path)
            except Exception:
                pass

    def predict(
        self,
        method: str,
        path: str,
        query_string: str = "",
        body: str = "",
        headers: Dict[str, str] = None
    ) -> Dict[str, Any]:
        """
        Evaluate HTTP request using 23-feature Random Forest classifier as secondary fallback.
        Returns: {
            "prediction": str,
            "confidence": float,
            "is_anomaly": bool,
            "top_features": List[Dict[str, Any]],
            "features": Dict[str, float]
        }
        """
        feat_dict, obf_detected, obf_tech, norm_text = extract_features(
            method=method,
            path=path,
            query_string=query_string,
            body=body,
            headers=headers or {}
        )

        vector = np.array(features_to_vector(feat_dict), dtype=float).reshape(1, -1)

        if not self.is_loaded or self.rf_model is None:
            # Fallback heuristic if weights missing
            has_attack = any(feat_dict.get(k, 0) > 0 for k in [
                "sql_keyword_indicator", "sql_operator_indicator",
                "xss_tag_indicator", "path_traversal_indicator"
            ])
            return {
                "prediction": "SQL_Injection" if has_attack else "Benign",
                "confidence": 0.85 if has_attack else 0.99,
                "is_anomaly": has_attack,
                "top_features": [{"feature": "heuristics", "value": 1.0}],
                "model_version": "v1.0-fallback"
            }

        # RF Inference
        probas = self.rf_model.predict_proba(vector)[0]
        class_idx = int(np.argmax(probas))
        confidence = float(probas[class_idx])
        pred_label = CLASS_NAMES[class_idx] if class_idx < len(CLASS_NAMES) else "Unknown"

        # Isolation Forest Anomaly probe
        is_anomaly = False
        if self.iso_model:
            try:
                iso_score = self.iso_model.predict(vector)[0]
                is_anomaly = (iso_score == -1)
            except Exception:
                pass

        # Calculate Top 3 Contributing Features
        # By multiplying feature value with model feature importance
        importances = getattr(self.rf_model, "feature_importances_", np.ones(len(FEATURE_NAMES)))
        contributions = []
        vec_values = vector[0]

        for i, name in enumerate(FEATURE_NAMES):
            val = vec_values[i]
            if val > 0:
                imp = importances[i] if i < len(importances) else 1.0
                contributions.append({
                    "feature": name,
                    "value": round(float(val), 3),
                    "impact": round(float(val * imp), 4)
                })

        contributions.sort(key=lambda x: x["impact"], reverse=True)
        top_3 = contributions[:3]

        return {
            "prediction": pred_label,
            "confidence": round(confidence, 4),
            "is_anomaly": is_anomaly,
            "obfuscation_detected": obf_detected,
            "obfuscation_techniques": obf_tech,
            "top_features": top_3,
            "model_version": self.version
        }

ml_subsystem = MLClassifierSubsystem()
