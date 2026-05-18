from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class DistrictResponse(BaseModel):
    id: int
    name_uz: str
    name_ru: str
    name_en: str
    code: str
    avg_price_usd: Optional[float]
    avg_price_per_sqm: Optional[float]
    center_lat: Optional[float]
    center_lng: Optional[float]

    class Config:
        from_attributes = True


class PropertyImageResponse(BaseModel):
    id: str
    url: str
    is_main: bool
    order_num: int

    class Config:
        from_attributes = True


class PropertyCreate(BaseModel):
    district_id: int
    property_type: str
    deal_type: str = "sale"
    building_type: str
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    area_total: float
    area_living: Optional[float] = None
    area_kitchen: Optional[float] = None
    rooms: int
    floor: int
    total_floors: int
    repair_status: str
    furniture: Optional[str] = "none"
    heating: Optional[str] = "central"
    has_elevator: bool = False
    has_parking: bool = False
    has_balcony: bool = False
    has_internet: bool = True
    price_usd: float
    is_negotiable: bool = True
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    contact_phone: Optional[str] = None


class PropertyUpdate(BaseModel):
    title_uz: Optional[str] = None
    title_ru: Optional[str] = None
    title_en: Optional[str] = None
    description_uz: Optional[str] = None
    description_ru: Optional[str] = None
    description_en: Optional[str] = None
    price_usd: Optional[float] = None
    is_negotiable: Optional[bool] = None
    repair_status: Optional[str] = None
    furniture: Optional[str] = None
    status: Optional[str] = None
    contact_phone: Optional[str] = None


class PropertyResponse(BaseModel):
    id: str
    district: DistrictResponse
    property_type: str
    deal_type: str
    building_type: str
    title_uz: Optional[str]
    title_ru: Optional[str]
    title_en: Optional[str]
    description_uz: Optional[str]
    description_ru: Optional[str]
    description_en: Optional[str]
    area_total: float
    area_living: Optional[float]
    area_kitchen: Optional[float]
    rooms: int
    floor: int
    total_floors: int
    repair_status: str
    furniture: str
    heating: str
    has_elevator: bool
    has_parking: bool
    has_balcony: bool
    has_internet: bool
    price_usd: float
    price_uzs: Optional[float]
    is_negotiable: bool
    address: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    status: str
    views_count: int
    contact_phone: Optional[str]
    images: List[PropertyImageResponse] = []
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class PropertyListResponse(BaseModel):
    items: List[PropertyResponse]
    total: int
    page: int
    per_page: int
    pages: int


class PropertyFilter(BaseModel):
    district_id: Optional[int] = None
    property_type: Optional[str] = None
    deal_type: Optional[str] = "sale"
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    min_area: Optional[float] = None
    max_area: Optional[float] = None
    rooms: Optional[int] = None
    repair_status: Optional[str] = None
    building_type: Optional[str] = None
    has_elevator: Optional[bool] = None
    has_parking: Optional[bool] = None
    page: int = 1
    per_page: int = 12
    sort_by: str = "created_at"
    sort_order: str = "desc"
