import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, JSON, Integer
from sqlalchemy.orm import relationship
from app.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    district_id = Column(Integer, ForeignKey("districts.id"), nullable=False)
    input_params = Column(JSON, nullable=False)
    predicted_price_usd = Column(Numeric(12, 2), nullable=False)
    price_min_usd = Column(Numeric(12, 2), nullable=False)
    price_max_usd = Column(Numeric(12, 2), nullable=False)
    confidence_score = Column(Numeric(5, 2), nullable=False)
    model_version_str = Column(String(20), nullable=False, default="1.0.0")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="predictions")
    district = relationship("District", back_populates="predictions")
