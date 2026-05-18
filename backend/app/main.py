from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.config import settings
from app.database import engine, Base
from app.routes import auth, users, properties, predictions, analytics

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="UzEstate API",
    description="Ko'chmas mulk narxini baholash tizimi — Toshkent shahri",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:19006",
    settings.FRONTEND_URL,
    "https://uzestate.vercel.app",
    "https://*.vercel.app",
    "https://*.ngrok.io",
    "https://*.ngrok-free.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/v1")
app.include_router(users.router, prefix="/v1")
app.include_router(properties.router, prefix="/v1")
app.include_router(predictions.router, prefix="/v1")
app.include_router(analytics.router, prefix="/v1")


@app.get("/")
async def root():
    return {
        "app": "UzEstate API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.on_event("startup")
async def startup_event():
    from app.ml.model import load_model
    try:
        load_model()
        print("ML model loaded successfully")
    except Exception as e:
        print(f"ML model load warning: {e}")

    await seed_districts()


async def seed_districts():
    from app.database import SessionLocal
    from app.models.property import District
    db = SessionLocal()
    try:
        if db.query(District).count() == 0:
            districts = [
                District(name_uz="Yunusobod tumani", name_ru="Юнусабадский район", name_en="Yunusabad District",
                         code="yunusobod", avg_price_usd=185000, avg_price_per_sqm=1600,
                         center_lat=41.3370, center_lng=69.3100, population=350000, area_km2=31),
                District(name_uz="Mirzo Ulug'bek tumani", name_ru="Мирзо-Улугбекский район", name_en="Mirzo Ulugbek District",
                         code="mirzo_ulugbek", avg_price_usd=130000, avg_price_per_sqm=1150,
                         center_lat=41.3217, center_lng=69.3533, population=290000, area_km2=97),
                District(name_uz="Yakkasaroy tumani", name_ru="Яккасарайский район", name_en="Yakkasaray District",
                         code="yakkasaroy", avg_price_usd=155000, avg_price_per_sqm=1400,
                         center_lat=41.2859, center_lng=69.2698, population=195000, area_km2=12),
                District(name_uz="Mirobod tumani", name_ru="Мирабадский район", name_en="Mirobod District",
                         code="mirobod", avg_price_usd=145000, avg_price_per_sqm=1300,
                         center_lat=41.3004, center_lng=69.3002, population=230000, area_km2=14),
                District(name_uz="Shayxontohur tumani", name_ru="Шайхантахурский район", name_en="Shaykhantakhur District",
                         code="shayxontohur", avg_price_usd=120000, avg_price_per_sqm=1050,
                         center_lat=41.3196, center_lng=69.2638, population=310000, area_km2=26),
                District(name_uz="Chilonzor tumani", name_ru="Чиланзарский район", name_en="Chilanzar District",
                         code="chilonzor", avg_price_usd=108000, avg_price_per_sqm=950,
                         center_lat=41.2900, center_lng=69.2218, population=380000, area_km2=29),
                District(name_uz="Almazar tumani", name_ru="Алмазарский район", name_en="Almazar District",
                         code="almazar", avg_price_usd=100000, avg_price_per_sqm=900,
                         center_lat=41.3412, center_lng=69.2508, population=270000, area_km2=44),
                District(name_uz="Olmazor tumani", name_ru="Алмазарский район", name_en="Olmazor District",
                         code="olmazor", avg_price_usd=94000, avg_price_per_sqm=850,
                         center_lat=41.3600, center_lng=69.2900, population=240000, area_km2=36),
                District(name_uz="Uchtepa tumani", name_ru="Учтепинский район", name_en="Uchtepa District",
                         code="uchtepa", avg_price_usd=86000, avg_price_per_sqm=780,
                         center_lat=41.2982, center_lng=69.1997, population=300000, area_km2=48),
                District(name_uz="Yashnobod tumani", name_ru="Яшнободский район", name_en="Yashnobod District",
                         code="yashnobod", avg_price_usd=82000, avg_price_per_sqm=750,
                         center_lat=41.2687, center_lng=69.3185, population=265000, area_km2=43),
                District(name_uz="Sergeli tumani", name_ru="Сергелийский район", name_en="Sergeli District",
                         code="sergeli", avg_price_usd=74000, avg_price_per_sqm=680,
                         center_lat=41.2232, center_lng=69.2700, population=285000, area_km2=175),
                District(name_uz="Bektemir tumani", name_ru="Бектемирский район", name_en="Bektemir District",
                         code="bektemir", avg_price_usd=62000, avg_price_per_sqm=580,
                         center_lat=41.2718, center_lng=69.3768, population=105000, area_km2=29),
            ]
            for d in districts:
                db.add(d)
            db.commit()
            print("Districts seeded successfully")
    except Exception as e:
        print(f"Seed error: {e}")
    finally:
        db.close()
