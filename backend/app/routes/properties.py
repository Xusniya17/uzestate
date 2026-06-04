import uuid
import math
from fastapi import APIRouter, Depends, HTTPException, Query, Header
from sqlalchemy.orm import Session
from sqlalchemy import desc, asc, and_
from typing import Optional, List
from pydantic import BaseModel

class PhotoUploadData(BaseModel):
    photos: List[str]
from app.database import get_db
from app.models.property import Property, District, Favorite, PropertyImage
from app.models.user import User
from app.schemas.property import (
    PropertyCreate, PropertyUpdate, PropertyResponse,
    PropertyListResponse, DistrictResponse
)
from app.utils.security import verify_token

router = APIRouter(prefix="/properties", tags=["Properties"])

UZS_RATE = 12700


def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
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
    db: Session = Depends(get_db)
) -> User:
    user = get_current_user_optional(authorization, db)
    if not user:
        raise HTTPException(status_code=401, detail="Kirish talab etiladi")
    return user


@router.get("/districts", response_model=List[DistrictResponse])
async def get_districts(db: Session = Depends(get_db)):
    return db.query(District).all()


@router.get("/districts/{district_id}", response_model=DistrictResponse)
async def get_district(district_id: int, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="Tuman topilmadi")
    return district


@router.get("", response_model=PropertyListResponse)
async def list_properties(
    district_id: Optional[int] = Query(None),
    property_type: Optional[str] = Query(None),
    deal_type: Optional[str] = Query("sale"),
    min_price: Optional[float] = Query(None),
    max_price: Optional[float] = Query(None),
    min_area: Optional[float] = Query(None),
    max_area: Optional[float] = Query(None),
    rooms: Optional[int] = Query(None),
    repair_status: Optional[str] = Query(None),
    building_type: Optional[str] = Query(None),
    has_elevator: Optional[bool] = Query(None),
    has_parking: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(12, ge=1, le=50),
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    db: Session = Depends(get_db),
):
    query = db.query(Property).filter(Property.status == "active")

    if district_id:
        query = query.filter(Property.district_id == district_id)
    if property_type:
        query = query.filter(Property.property_type == property_type)
    if deal_type:
        query = query.filter(Property.deal_type == deal_type)
    if min_price:
        query = query.filter(Property.price_usd >= min_price)
    if max_price:
        query = query.filter(Property.price_usd <= max_price)
    if min_area:
        query = query.filter(Property.area_total >= min_area)
    if max_area:
        query = query.filter(Property.area_total <= max_area)
    if rooms:
        query = query.filter(Property.rooms == rooms)
    if repair_status:
        query = query.filter(Property.repair_status == repair_status)
    if building_type:
        query = query.filter(Property.building_type == building_type)
    if has_elevator is not None:
        query = query.filter(Property.has_elevator == has_elevator)
    if has_parking is not None:
        query = query.filter(Property.has_parking == has_parking)

    total = query.count()
    pages = math.ceil(total / per_page)

    sort_column = getattr(Property, sort_by, Property.created_at)
    if sort_order == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    items = query.offset((page - 1) * per_page).limit(per_page).all()

    return PropertyListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        pages=pages,
    )


@router.post("", response_model=PropertyResponse, status_code=201)
async def create_property(
    data: PropertyCreate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    district = db.query(District).filter(District.id == data.district_id).first()
    if not district:
        raise HTTPException(status_code=404, detail="Tuman topilmadi")

    prop = Property(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        district_id=data.district_id,
        property_type=data.property_type,
        deal_type=data.deal_type,
        building_type=data.building_type,
        title_uz=data.title_uz,
        title_ru=data.title_ru,
        title_en=data.title_en,
        description_uz=data.description_uz,
        description_ru=data.description_ru,
        description_en=data.description_en,
        area_total=data.area_total,
        area_living=data.area_living,
        area_kitchen=data.area_kitchen,
        rooms=data.rooms,
        floor=data.floor,
        total_floors=data.total_floors,
        repair_status=data.repair_status,
        furniture=data.furniture or "none",
        heating=data.heating or "central",
        has_elevator=data.has_elevator,
        has_parking=data.has_parking,
        has_balcony=data.has_balcony,
        has_internet=data.has_internet,
        price_usd=data.price_usd,
        price_uzs=data.price_usd * UZS_RATE,
        is_negotiable=data.is_negotiable,
        address=data.address,
        latitude=data.latitude,
        longitude=data.longitude,
        contact_phone=data.contact_phone or current_user.phone,
        status="active",
    )
    db.add(prop)
    db.commit()
    db.refresh(prop)
    return prop


@router.post("/{property_id}/photos", response_model=dict)
async def upload_photos(
    property_id: str,
    data: PhotoUploadData,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    """Rasmlarni base64 formatda yuklash."""
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")
    if str(prop.user_id) != str(current_user.id) and current_user.role != "admin" and current_user.role != "agent":
        raise HTTPException(status_code=403, detail="E'lon sizniki emas, ruxsat yo'q")

    photos = data.photos
    if not photos:
        raise HTTPException(status_code=400, detail="Rasm yuklanmadi")

    # Avvalgi rasmlarni o'chirish
    db.query(PropertyImage).filter(PropertyImage.property_id == property_id).delete()

    for i, photo_data in enumerate(photos[:10]):  # max 10 rasm
        img = PropertyImage(
            property_id=property_id,
            url=photo_data,
            is_main=(i == 0),
            order_num=i,
        )
        db.add(img)

    db.commit()
    return {"message": f"{len(photos)} ta rasm yuklandi", "count": len(photos)}


@router.get("/my", response_model=List[PropertyResponse])
async def get_my_properties(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    return db.query(Property).filter(
        Property.user_id == current_user.id,
        Property.status != "inactive"
    ).order_by(Property.created_at.desc()).all()


@router.get("/favorites", response_model=List[PropertyResponse])
async def get_favorites(
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user.id).all()
    property_ids = [f.property_id for f in favorites]
    return db.query(Property).filter(Property.id.in_(property_ids)).all()


@router.get("/{property_id}", response_model=PropertyResponse)
async def get_property(property_id: str, db: Session = Depends(get_db)):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")
    prop.views_count += 1
    db.commit()
    return prop


@router.put("/{property_id}", response_model=PropertyResponse)
async def update_property(
    property_id: str,
    data: PropertyUpdate,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")
    if str(prop.user_id) != str(current_user.id) and current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="E'lon sizniki emas, ruxsat yo'q")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(prop, field, value)

    if data.price_usd:
        prop.price_uzs = data.price_usd * UZS_RATE

    db.commit()
    db.refresh(prop)
    return prop


@router.delete("/{property_id}", response_model=dict)
async def delete_property(
    property_id: str,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    prop = db.query(Property).filter(Property.id == property_id).first()
    if not prop:
        raise HTTPException(status_code=404, detail="E'lon topilmadi")
    if str(prop.user_id) != str(current_user.id) and current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="E'lon sizniki emas, ruxsat yo'q")
    prop.status = PropertyStatus.inactive
    db.commit()
    return {"message": "E'lon o'chirildi"}


@router.post("/{property_id}/favorite", response_model=dict)
async def add_favorite(
    property_id: str,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    existing = db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id,
    ).first()
    if existing:
        return {"message": "Allaqachon sevimlilarda"}

    favorite = Favorite(user_id=current_user.id, property_id=property_id)
    db.add(favorite)
    db.commit()
    return {"message": "Sevimlilarga qo'shildi"}


@router.delete("/{property_id}/favorite", response_model=dict)
async def remove_favorite(
    property_id: str,
    current_user: User = Depends(require_user),
    db: Session = Depends(get_db),
):
    db.query(Favorite).filter(
        Favorite.user_id == current_user.id,
        Favorite.property_id == property_id,
    ).delete()
    db.commit()
    return {"message": "Sevimlilardan o'chirildi"}
