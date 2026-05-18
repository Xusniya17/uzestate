from app.models.user import User, RefreshToken, OTPCode
from app.models.property import District, Property, PropertyImage, Favorite, PriceHistory
from app.models.prediction import Prediction

__all__ = [
    "User", "RefreshToken", "OTPCode",
    "District", "Property", "PropertyImage", "Favorite", "PriceHistory",
    "Prediction",
]
