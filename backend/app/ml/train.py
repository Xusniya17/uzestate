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


# Full category vocabulary the website can send — encoders must cover all of
# these even if the real scraped data does not contain every value.
CATEGORY_VOCAB = {
    "building_type": ["new", "old", "panel", "brick", "monolith"],
    "repair_status": ["euro", "good", "average", "needs_repair", "without_repair"],
}


def prepare_features(df: pd.DataFrame, encoders: dict = None, fit: bool = False):
    categorical_cols = ["building_type", "repair_status"]

    if fit:
        encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            # Fit on the full known vocabulary, not just observed values, so the
            # model never crashes on a valid category missing from the dataset.
            le.fit(CATEGORY_VOCAB[col])
            df[f"{col}_encoded"] = le.transform(df[col])
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


REAL_DATA_PATH = os.path.join(os.path.dirname(__file__), "tashkent_real_estate_data.csv")


def load_dataset() -> pd.DataFrame:
    """Prefer REAL scraped OLX.uz data when available, else synthetic data.

    Real listings are scraped via scrape_olx.py. When fewer than a few hundred
    real rows are present we top up with synthetic rows so the model still has
    enough data to train on.
    """
    if os.path.exists(REAL_DATA_PATH):
        real = pd.read_csv(REAL_DATA_PATH)
        print(f"Loaded {len(real)} REAL listings from {os.path.basename(REAL_DATA_PATH)}")
        # Outlier removal: trim extreme price-per-m2 (luxury / data errors)
        before = len(real)
        lo, hi = real["price_per_sqm"].quantile([0.02, 0.98])
        real = real[(real["price_per_sqm"] >= lo) & (real["price_per_sqm"] <= hi)]
        real = real[(real["price_usd"] >= 15000) & (real["price_usd"] <= 300000)]
        print(f"Outlier removal: {before} -> {len(real)} rows (price/m2 in [{lo:.0f},{hi:.0f}])")
        if len(real) >= 1000:
            return real
        # blend real + synthetic so training is stable
        synth = generate_dataset(n_samples=max(2000, 4000 - len(real)))
        cols = [c for c in synth.columns if c in real.columns]
        blended = pd.concat([real[cols], synth[cols]], ignore_index=True)
        print(f"Blended dataset: {len(real)} real + {len(synth)} synthetic = {len(blended)}")
        return blended
    print("No real data found — generating synthetic dataset...")
    return generate_dataset(n_samples=8000)


def train_model():
    os.makedirs(MODEL_DIR, exist_ok=True)
    df = load_dataset()

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

    base_ensemble = VotingRegressor(
        estimators=[
            ("xgb", xgb_model),
            ("rf", rf_model),
            ("gb", gb_model),
        ],
        weights=[0.5, 0.3, 0.2],
    )

    # Log-transform the price target: real prices are right-skewed, so learning
    # on log(price) reduces percentage error (MAPE). Predictions are mapped back
    # to dollars automatically, so model.py needs no change.
    from sklearn.compose import TransformedTargetRegressor
    ensemble = TransformedTargetRegressor(
        regressor=base_ensemble, func=np.log1p, inverse_func=np.expm1
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
