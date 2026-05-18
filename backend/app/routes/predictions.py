import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional, List
from app.database import get_db
from app.models.prediction import Prediction
from app.models.user import User
from app.schemas.prediction import PredictionRequest, PredictionResponse, PredictionHistoryItem
from app.ml.model import predict_price
from app.utils.security import verify_token
from datetime import datetime

router = APIRouter(prefix="/predictions", tags=["Predictions"])


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> Optional[User]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    payload = verify_token(token)
    if not payload:
        return None
    return db.query(User).filter(User.id == payload.get("sub")).first()


def require_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db),
) -> User:
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Kirish talab etiladi")
    return user


@router.post("/estimate", response_model=dict)
async def estimate_price(
    data: PredictionRequest,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: Session = Depends(get_db),
):
    if data.floor > data.total_floors:
        raise HTTPException(status_code=400, detail="Qavat umumiy qavatlar sonidan oshmasligi kerak")

    result = predict_price(
        district_id=data.district_id,
        area_total=data.area_total,
        rooms=data.rooms,
        floor=data.floor,
        total_floors=data.total_floors,
        building_type=data.building_type,
        repair_status=data.repair_status,
        has_elevator=data.has_elevator,
        has_parking=data.has_parking,
        has_balcony=data.has_balcony,
    )

    prediction_id = str(uuid.uuid4())
    prediction = Prediction(
        id=prediction_id,
        user_id=current_user.id if current_user else None,
        district_id=data.district_id,
        input_params=data.model_dump(),
        predicted_price_usd=result["predicted_price_usd"],
        price_min_usd=result["price_min_usd"],
        price_max_usd=result["price_max_usd"],
        confidence_score=result["confidence_score"],
        model_version_str=result["model_version"],
        created_at=datetime.utcnow(),
    )
    db.add(prediction)
    db.commit()

    return {
        "id": str(prediction_id),
        "district_id": data.district_id,
        **result,
        "input_params": data.model_dump(),
        "created_at": datetime.utcnow().isoformat(),
    }


@router.get("/history", response_model=List[PredictionHistoryItem])
async def get_prediction_history(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    predictions = (
        db.query(Prediction)
        .filter(Prediction.user_id == current_user.id)
        .order_by(Prediction.created_at.desc())
        .limit(50)
        .all()
    )
    return predictions
