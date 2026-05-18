import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Numeric, Text, JSON
from sqlalchemy.orm import relationship
from app.database import Base


class District(Base):
    __tablename__ = "districts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name_uz = Column(String(100), nullable=False)
    name_ru = Column(String(100), nullable=False)
    name_en = Column(String(100), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    avg_price_usd = Column(Numeric(12, 2), nullable=True)
    avg_price_per_sqm = Column(Numeric(10, 2), nullable=True)
    polygon_coords = Column(JSON, nullable=True)
    center_lat = Column(Numeric(10, 7), nullable=True)
    center_lng = Column(Numeric(10, 7), nullable=True)
    population = Column(Integer, nullable=True)
    area_km2 = Column(Numeric(8, 2), nullable=True)

    properties = relationship("Property", back_populates="district")
    predictions = relationship("Prediction", back_populates="district")
    price_history = relationship("PriceHistory", back_populates="district")


class Property(Base):
    __tablename__ = "properties"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)

    property_type = Column(String(20), nullable=False, default="apartment")
    deal_type = Column(String(10), nullable=False, default="sale")
    building_type = Column(String(20), nullable=False, default="new")

    title_uz = Column(String(300), nullable=True)
    title_ru = Column(String(300), nullable=True)
    title_en = Column(String(300), nullable=True)
    description_uz = Column(Text, nullable=True)
    description_ru = Column(Text, nullable=True)
    description_en = Column(Text, nullable=True)

    area_total = Column(Numeric(8, 2), nullable=False)
    area_living = Column(Numeric(8, 2), nullable=True)
    area_kitchen = Column(Numeric(8, 2), nullable=True)
    rooms = Column(Integer, nullable=False)
    floor = Column(Integer, nullable=False)
    total_floors = Column(Integer, nullable=False)

    repair_status = Column(String(20), nullable=False, default="average")
    furniture = Column(String(10), default="none")
    heating = Column(String(10), default="central")
    has_elevator = Column(Boolean, default=False)
    has_parking = Column(Boolean, default=False)
    has_balcony = Column(Boolean, default=False)
    has_internet = Column(Boolean, default=True)

    price_usd = Column(Numeric(12, 2), nullable=False)
    price_uzs = Column(Numeric(18, 2), nullable=True)
    is_negotiable = Column(Boolean, default=True)

    address = Column(String(500), nullable=True)
    latitude = Column(Numeric(10, 7), nullable=True)
    longitude = Column(Numeric(10, 7), nullable=True)

    status = Column(String(20), default="moderation")
    views_count = Column(Integer, default=0)
    contact_phone = Column(String(20), nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="properties")
    district = relationship("District", back_populates="properties")
    images = relationship("PropertyImage", back_populates="property", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="property", cascade="all, delete-orphan")


class PropertyImage(Base):
    __tablename__ = "property_images"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), nullable=False)
    url = Column(String(500), nullable=False)
    is_main = Column(Boolean, default=False)
    order_num = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    property = relationship("Property", back_populates="images")


class Favorite(Base):
    __tablename__ = "favorites"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    property_id = Column(String(36), ForeignKey("properties.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="favorites")
    property = relationship("Property", back_populates="favorites")


class PriceHistory(Base):
    __tablename__ = "price_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    avg_price_usd = Column(Numeric(12, 2), nullable=False)
    avg_price_per_sqm = Column(Numeric(10, 2), nullable=False)
    total_listings = Column(Integer, nullable=False)
    month = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    district = relationship("District", back_populates="price_history")
