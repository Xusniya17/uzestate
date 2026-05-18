from pydantic import BaseModel, field_validator
from typing import Optional
from datetime import datetime


class PredictionRequest(BaseModel):
    district_id: int
    area_total: float
    rooms: int
    floor: int
    total_floors: int
    building_type: str
    repair_status: str
    has_elevator: bool = False
    has_parking: bool = False
    has_balcony: bool = False

    @field_validator("area_total")
    @classmethod
    def validate_area(cls, v):
        if v < 15 or v > 1000:
            raise ValueError("Maydon 15 dan 1000 m² oralig'ida bo'lishi kerak")
        return v

    @field_validator("rooms")
    @classmethod
    def validate_rooms(cls, v):
        if v < 1 or v > 10:
            raise ValueError("Xonalar soni 1 dan 10 gacha bo'lishi kerak")
        return v

    @field_validator("floor")
    @classmethod
    def validate_floor(cls, v):
        if v < 1 or v > 40:
            raise ValueError("Qavat 1 dan 40 gacha bo'lishi kerak")
        return v

    @field_validator("total_floors")
    @classmethod
    def validate_total_floors(cls, v):
        if v < 1 or v > 40:
            raise ValueError("Umumiy qavatlar soni 1 dan 40 gacha bo'lishi kerak")
        return v


class PredictionResponse(BaseModel):
    id: str
    district_id: int
    predicted_price_usd: float
    predicted_price_uzs: float
    price_min_usd: float
    price_max_usd: float
    price_per_sqm_usd: float
    confidence_score: float
    model_version_str: str
    created_at: datetime

    model_config = {"protected_namespaces": (), "from_attributes": True}


class PredictionHistoryItem(BaseModel):
    id: str
    district_id: int
    predicted_price_usd: float
    confidence_score: float
    created_at: datetime

    class Config:
        from_attributes = True
