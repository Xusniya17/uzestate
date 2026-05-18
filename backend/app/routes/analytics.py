from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.database import get_db
from app.models.property import District, Property, PriceHistory

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/market-overview")
async def market_overview(db: Session = Depends(get_db)):
    total_listings = db.query(Property).filter(Property.status == "active").count()
    avg_price = db.query(func.avg(Property.price_usd)).filter(
        Property.status == "active"
    ).scalar() or 0
    avg_price_per_sqm = db.query(
        func.avg(Property.price_usd / Property.area_total)
    ).filter(Property.status == "active").scalar() or 0

    district_stats = (
        db.query(
            District.name_uz,
            District.name_ru,
            District.name_en,
            District.code,
            func.avg(Property.price_usd / Property.area_total).label("avg_per_sqm"),
            func.count(Property.id).label("count"),
        )
        .join(Property, Property.district_id == District.id)
        .filter(Property.status == "active")
        .group_by(District.id, District.name_uz, District.name_ru, District.name_en, District.code)
        .order_by(desc("avg_per_sqm"))
        .all()
    )

    return {
        "total_listings": total_listings,
        "avg_price_usd": round(float(avg_price), 0),
        "avg_price_per_sqm": round(float(avg_price_per_sqm), 0),
        "district_stats": [
            {
                "name_uz": row.name_uz,
                "name_ru": row.name_ru,
                "name_en": row.name_en,
                "code": row.code,
                "avg_price_per_sqm": round(float(row.avg_per_sqm or 0), 0),
                "listings_count": row.count,
            }
            for row in district_stats
        ],
    }


@router.get("/price-trends")
async def price_trends(db: Session = Depends(get_db)):
    history = (
        db.query(PriceHistory)
        .order_by(PriceHistory.month.desc())
        .limit(72)
        .all()
    )

    return [
        {
            "district_id": h.district_id,
            "avg_price_usd": float(h.avg_price_usd),
            "avg_price_per_sqm": float(h.avg_price_per_sqm),
            "total_listings": h.total_listings,
            "month": h.month.strftime("%Y-%m"),
        }
        for h in history
    ]


@router.get("/districts/{district_id}/stats")
async def district_stats(district_id: int, db: Session = Depends(get_db)):
    district = db.query(District).filter(District.id == district_id).first()
    if not district:
        return {"error": "Tuman topilmadi"}

    stats = db.query(
        func.avg(Property.price_usd).label("avg_price"),
        func.min(Property.price_usd).label("min_price"),
        func.max(Property.price_usd).label("max_price"),
        func.avg(Property.price_usd / Property.area_total).label("avg_per_sqm"),
        func.count(Property.id).label("count"),
    ).filter(
        Property.district_id == district_id,
        Property.status == "active",
    ).first()

    rooms_dist = (
        db.query(Property.rooms, func.count(Property.id).label("count"))
        .filter(Property.district_id == district_id, Property.status == "active")
        .group_by(Property.rooms)
        .all()
    )

    return {
        "district": {
            "id": district.id,
            "name_uz": district.name_uz,
            "name_ru": district.name_ru,
            "name_en": district.name_en,
        },
        "avg_price_usd": round(float(stats.avg_price or 0), 0),
        "min_price_usd": round(float(stats.min_price or 0), 0),
        "max_price_usd": round(float(stats.max_price or 0), 0),
        "avg_price_per_sqm": round(float(stats.avg_per_sqm or 0), 0),
        "total_listings": stats.count,
        "rooms_distribution": [
            {"rooms": r.rooms, "count": r.count}
            for r in rooms_dist
        ],
    }
