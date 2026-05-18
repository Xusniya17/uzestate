"""
ML model loading and prediction service.
"""
import os
import numpy as np
import pandas as pd
import joblib
from typing import Optional

MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")
MODEL_PATH = os.path.join(MODEL_DIR, "price_model.joblib")
ENCODERS_PATH = os.path.join(MODEL_DIR, "encoders.joblib")

_model = None
_encoders = None

BUILDING_TYPE_MAP = {
    "new": "new", "yangi": "new", "новый": "new",
    "old": "old", "eski": "old", "старый": "old",
    "panel": "panel", "панель": "panel",
    "brick": "brick", "g'isht": "brick", "кирпич": "brick",
    "monolith": "monolith", "monolit": "monolith", "монолит": "monolith",
}

REPAIR_MAP = {
    "euro": "euro", "evro": "euro", "евро": "euro",
    "good": "good", "yaxshi": "good", "хороший": "good",
    "average": "average", "o'rtacha": "average", "средний": "average",
    "needs_repair": "needs_repair", "ta'mirlash kerak": "needs_repair",
    "without_repair": "without_repair", "ta'mirsiz": "without_repair",
}


def load_model():
    global _model, _encoders
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            from app.ml.train import train_model
            _model, _encoders, _ = train_model()
        else:
            _model = joblib.load(MODEL_PATH)
            _encoders = joblib.load(ENCODERS_PATH)
    return _model, _encoders


def predict_price(
    district_id: int,
    area_total: float,
    rooms: int,
    floor: int,
    total_floors: int,
    building_type: str,
    repair_status: str,
    has_elevator: bool = False,
    has_parking: bool = False,
    has_balcony: bool = False,
) -> dict:
    model, encoders = load_model()

    building_type = BUILDING_TYPE_MAP.get(building_type.lower(), building_type)
    repair_status = REPAIR_MAP.get(repair_status.lower(), repair_status)

    floor_ratio = floor / total_floors
    is_top_floor = int(floor == total_floors)
    is_ground_floor = int(floor == 1)
    area_per_room = area_total / rooms

    row = pd.DataFrame([{
        "district_id": district_id,
        "area_total": area_total,
        "area_per_room": area_per_room,
        "rooms": rooms,
        "floor": floor,
        "total_floors": total_floors,
        "floor_ratio": floor_ratio,
        "is_top_floor": is_top_floor,
        "is_ground_floor": is_ground_floor,
        "has_elevator": int(has_elevator),
        "has_parking": int(has_parking),
        "has_balcony": int(has_balcony),
        "building_type": building_type,
        "repair_status": repair_status,
    }])

    row["building_type_encoded"] = encoders["building_type"].transform(row["building_type"])
    row["repair_status_encoded"] = encoders["repair_status"].transform(row["repair_status"])

    feature_cols = [
        "district_id", "area_total", "area_per_room", "rooms",
        "floor", "total_floors", "floor_ratio", "is_top_floor",
        "is_ground_floor", "has_elevator", "has_parking", "has_balcony",
        "building_type_encoded", "repair_status_encoded",
    ]

    predicted_price = float(model.predict(row[feature_cols])[0])
    predicted_price = max(5000, round(predicted_price / 500) * 500)

    margin = predicted_price * 0.12
    price_min = round((predicted_price - margin) / 500) * 500
    price_max = round((predicted_price + margin) / 500) * 500

    confidence = min(95, max(70, 88 - abs(area_total - 60) * 0.1))

    uzs_rate = 12700
    price_per_sqm = predicted_price / area_total

    return {
        "predicted_price_usd": predicted_price,
        "predicted_price_uzs": round(predicted_price * uzs_rate),
        "price_min_usd": price_min,
        "price_max_usd": price_max,
        "price_per_sqm_usd": round(price_per_sqm, 2),
        "confidence_score": round(confidence, 1),
        "model_version": "1.0.0",
    }
