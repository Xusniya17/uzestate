"""
ML modelini o'qitish skripti.
XGBoost + Random Forest ensemble model.
"""
import numpy as np
import pandas as pd
import joblib
import os
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, VotingRegressor
from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import xgboost as xgb
from app.ml.data_generator import generate_dataset

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.joblib")
ENCODERS_PATH = os.path.join(MODEL_DIR, "encoders.joblib")


def prepare_features(df: pd.DataFrame, encoders: dict = None, fit: bool = False):
    categorical_cols = ["building_type", "repair_status"]

    if fit:
        encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            df[f"{col}_encoded"] = le.fit_transform(df[col])
            encoders[col] = le
    else:
        for col in categorical_cols:
            df[f"{col}_encoded"] = encoders[col].transform(df[col])

    feature_cols = [
        "district_id",
        "area_total",
        "area_per_room",
        "rooms",
        "floor",
        "total_floors",
        "floor_ratio",
        "is_top_floor",
        "is_ground_floor",
        "has_elevator",
        "has_parking",
        "has_balcony",
        "building_type_encoded",
        "repair_status_encoded",
    ]

    return df[feature_cols], encoders


def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    print("Generating dataset...")
    df = generate_dataset(n_samples=8000)

    X, encoders = prepare_features(df.copy(), fit=True)
    y = df["price_usd"]

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    xgb_model = xgb.XGBRegressor(
        n_estimators=500,
        max_depth=6,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbosity=0,
    )

    rf_model = RandomForestRegressor(
        n_estimators=200,
        max_depth=10,
        random_state=42,
        n_jobs=-1,
    )

    gb_model = GradientBoostingRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.08,
        random_state=42,
    )

    ensemble = VotingRegressor(
        estimators=[
            ("xgb", xgb_model),
            ("rf", rf_model),
            ("gb", gb_model),
        ],
        weights=[0.5, 0.3, 0.2],
    )

    print("Training ensemble model...")
    ensemble.fit(X_train, y_train)

    y_pred = ensemble.predict(X_test)
    rmse = np.sqrt(mean_squared_error(y_test, y_pred))
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    mape = np.mean(np.abs((y_test - y_pred) / y_test)) * 100

    print(f"\nModel Performance:")
    print(f"  R² Score:  {r2:.4f}")
    print(f"  RMSE:      ${rmse:,.0f}")
    print(f"  MAE:       ${mae:,.0f}")
    print(f"  MAPE:      {mape:.2f}%")

    kf = KFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(ensemble, X, y, cv=kf, scoring="r2")
    print(f"  CV R²:     {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

    joblib.dump(ensemble, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")

    return ensemble, encoders, {"r2": r2, "rmse": rmse, "mae": mae, "mape": mape}


if __name__ == "__main__":
    train_model()
