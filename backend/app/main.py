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


@app.get("/ping")
async def ping():
    return {"pong": True}


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

    await migrate_photo_url_to_text()
    await seed_districts()
    await seed_properties_data()
    await seed_real_listings()
    await seed_real_rentals()
    await fix_seller_roles()


async def migrate_photo_url_to_text():
    """property_images.url ustunini TEXT ga o'zgartirish"""
    from app.database import engine
    try:
        with engine.connect() as conn:
            # PostgreSQL uchun
            conn.execute(__import__('sqlalchemy').text(
                "ALTER TABLE property_images ALTER COLUMN url TYPE TEXT"
            ))
            conn.commit()
            print("property_images.url -> TEXT migration OK")
    except Exception as e:
        print(f"migrate_photo_url_to_text: {e} (already TEXT or SQLite)")


async def fix_seller_roles():
    """seller.uzestate@gmail.com va boshqa seller userlarni agent role ga o'tkazish"""
    from app.database import SessionLocal
    from app.models.user import User
    db = SessionLocal()
    try:
        seller = db.query(User).filter(User.email == "seller.uzestate@gmail.com").first()
        if seller and seller.role == "user":
            seller.role = "agent"
            db.commit()
            print("seller.uzestate@gmail.com -> agent role yangilandi")
    except Exception as e:
        print(f"fix_seller_roles error: {e}")
    finally:
        db.close()


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


async def seed_properties_data():
    from app.database import SessionLocal
    from app.models.property import Property, District
    from app.models.user import User
    from app.utils.security import hash_password
    import uuid
    from datetime import datetime, timedelta

    db = SessionLocal()
    try:
        if db.query(Property).count() > 0:
            return

        admin = db.query(User).filter(User.email == "admin@uzestate.uz").first()
        if not admin:
            admin = User(
                id=str(uuid.uuid4()),
                email="admin@uzestate.uz",
                first_name="Admin",
                last_name="UzEstate",
                password_hash=hash_password("Admin@12345"),
                role="admin",
                is_active=True,
                is_email_verified=True,
                language="uz",
            )
            db.add(admin)
            db.commit()

        districts = {d.code: d for d in db.query(District).all()}
        if not districts:
            return

        UZS = 12700
        props = [
            dict(code="yunusobod", rooms=3, area=85, floor=7, total=16, btype="monolith", repair="euro",
                 elevator=True, parking=True, balcony=True, price=145000, deal="sale",
                 title_uz="Yunusobodda 3 xonali zamonaviy kvartira",
                 title_ru="3-комнатная квартира в Юнусабаде", title_en="3-room apartment in Yunusabad",
                 desc_uz="Yunusobod tumanida monolit binoda zamonaviy ta'mirli kvartira. Metro yaqin.",
                 lat=41.3350, lng=69.3120, address="Yunusobod tumani, 16-mavze"),
            dict(code="yunusobod", rooms=2, area=62, floor=3, total=9, btype="brick", repair="good",
                 elevator=False, parking=False, balcony=True, price=98000, deal="sale",
                 title_uz="Yunusobodda 2 xonali kvartira",
                 title_ru="2-комнатная квартира в Юнусабаде", title_en="2-room apartment in Yunusabad",
                 desc_uz="G'isht binoda yaxshi ta'mirli kvartira.",
                 lat=41.3380, lng=69.3080, address="Yunusobod tumani, A.Temur ko'chasi"),
            dict(code="chilonzor", rooms=1, area=38, floor=5, total=9, btype="panel", repair="average",
                 elevator=False, parking=False, balcony=True, price=42000, deal="sale",
                 title_uz="Chilonzorda 1 xonali kvartira",
                 title_ru="1-комнатная квартира в Чиланзаре", title_en="1-room apartment in Chilanzar",
                 desc_uz="Panel binoda o'rtacha ta'mirli kvartira. Arzon narx!",
                 lat=41.2910, lng=69.2230, address="Chilonzor tumani, Olmazor ko'chasi"),
            dict(code="chilonzor", rooms=4, area=110, floor=2, total=5, btype="brick", repair="euro",
                 elevator=False, parking=True, balcony=True, price=118000, deal="sale",
                 title_uz="Chilonzorda keng 4 xonali kvartira",
                 title_ru="Просторная 4-комнатная в Чиланзаре", title_en="Spacious 4-room in Chilanzar",
                 desc_uz="G'isht binoda evroremontli 4 xonali kvartira.",
                 lat=41.2880, lng=69.2190, address="Chilonzor tumani, 19-mavze"),
            dict(code="mirzo_ulugbek", rooms=2, area=55, floor=4, total=12, btype="new", repair="euro",
                 elevator=True, parking=False, balcony=True, price=75000, deal="sale",
                 title_uz="Mirzo Ulug'bekda yangi binodan 2 xona",
                 title_ru="2-комнатная в новостройке Мирзо-Улугбек", title_en="2-room new building Mirzo Ulugbek",
                 desc_uz="Yangi binodan evroremontli kvartira. Metroga yaqin.",
                 lat=41.3210, lng=69.3520, address="Mirzo Ulug'bek tumani, Universitet ko'chasi"),
            dict(code="mirzo_ulugbek", rooms=3, area=90, floor=8, total=16, btype="monolith", repair="good",
                 elevator=True, parking=True, balcony=True, price=125000, deal="sale",
                 title_uz="Mirzo Ulug'bekda 3 xonali monolit",
                 title_ru="3-комнатная монолит Мирзо-Улугбек", title_en="3-room monolith Mirzo Ulugbek",
                 desc_uz="Monolit binoda yaxshi holatdagi kvartira.",
                 lat=41.3180, lng=69.3560, address="Mirzo Ulug'bek tumani, Sharaf Rashidov ko'chasi"),
            dict(code="yakkasaroy", rooms=2, area=70, floor=6, total=9, btype="brick", repair="euro",
                 elevator=True, parking=False, balcony=True, price=105000, deal="sale",
                 title_uz="Yakkasaroyda 2 xonali evroremontli",
                 title_ru="2-комнатная с евроремонтом Яккасарай", title_en="2-room euro-renovated Yakkasaray",
                 desc_uz="Shahar markazida g'isht binoda evroremontli kvartira.",
                 lat=41.2870, lng=69.2710, address="Yakkasaroy tumani, Shota Rustaveli ko'chasi"),
            dict(code="sergeli", rooms=2, area=58, floor=3, total=9, btype="panel", repair="average",
                 elevator=False, parking=False, balcony=True, price=38000, deal="sale",
                 title_uz="Sergelidа arzon 2 xonali kvartira",
                 title_ru="Недорогая 2-комнатная в Сергели", title_en="Affordable 2-room in Sergeli",
                 desc_uz="Arzon narxda qulay kvartira.",
                 lat=41.2230, lng=69.2720, address="Sergeli tumani"),
            dict(code="shayxontohur", rooms=3, area=78, floor=5, total=9, btype="brick", repair="good",
                 elevator=False, parking=False, balcony=True, price=89000, deal="sale",
                 title_uz="Shayxontohurda 3 xonali kvartira",
                 title_ru="3-комнатная в Шайхантахуре", title_en="3-room Shaykhantakhur",
                 desc_uz="Eski qurilishda yaxshi ta'mirli kvartira.",
                 lat=41.3200, lng=69.2640, address="Shayxontohur tumani, Navoiy ko'chasi"),
            dict(code="mirobod", rooms=1, area=42, floor=9, total=16, btype="monolith", repair="euro",
                 elevator=True, parking=False, balcony=True, price=62000, deal="sale",
                 title_uz="Mirobodda zamonaviy 1 xonali",
                 title_ru="Современная 1-комнатная в Мирабаде", title_en="Modern 1-room Mirobod",
                 desc_uz="Biznes markaz yaqinida zamonaviy kvartira.",
                 lat=41.3010, lng=69.2990, address="Mirobod tumani, Amir Temur xiyoboni"),
            dict(code="yunusobod", rooms=2, area=65, floor=5, total=12, btype="new", repair="euro",
                 elevator=True, parking=False, balcony=True, price=800, deal="rent",
                 title_uz="Yunusobodda 2 xonali ijaraga",
                 title_ru="2-комнатная в аренду Юнусабад", title_en="2-room for rent Yunusabad",
                 desc_uz="Yangi binoda evroremontli kvartira ijaraga. Mebelь bor.",
                 lat=41.3360, lng=69.3100, address="Yunusobod tumani, 12-mavze"),
            dict(code="yunusobod", rooms=1, area=40, floor=3, total=9, btype="brick", repair="good",
                 elevator=False, parking=False, balcony=True, price=450, deal="rent",
                 title_uz="Yunusobodda 1 xonali ijaraga",
                 title_ru="1-комнатная в аренду Юнусабад", title_en="1-room for rent Yunusabad",
                 desc_uz="Qulay 1 xonali kvartira ijaraga. Mebelь va texnika bor.",
                 lat=41.3400, lng=69.3050, address="Yunusobod tumani, Ferghana yo'li"),
            dict(code="chilonzor", rooms=2, area=55, floor=6, total=9, btype="panel", repair="average",
                 elevator=False, parking=False, balcony=True, price=350, deal="rent",
                 title_uz="Chilonzorda 2 xonali arzon ijara",
                 title_ru="2-комнатная аренда Чиланзар", title_en="2-room rent Chilanzar",
                 desc_uz="Arzon narxda ijaraga kvartira.",
                 lat=41.2900, lng=69.2200, address="Chilonzor tumani, Bunyodkor ko'chasi"),
            dict(code="mirzo_ulugbek", rooms=3, area=90, floor=7, total=16, btype="monolith", repair="euro",
                 elevator=True, parking=True, balcony=True, price=1200, deal="rent",
                 title_uz="Mirzo Ulug'bekda 3 xonali premium ijara",
                 title_ru="3-комнатная премиум аренда Мирзо-Улугбек", title_en="3-room premium rent Mirzo Ulugbek",
                 desc_uz="Premium sinfli kvartira ijaraga. To'liq mebelь.",
                 lat=41.3220, lng=69.3500, address="Mirzo Ulug'bek tumani, TATU yaqini"),
            dict(code="mirobod", rooms=1, area=38, floor=4, total=9, btype="brick", repair="good",
                 elevator=False, parking=False, balcony=False, price=500, deal="rent",
                 title_uz="Mirobodda 1 xonali ijara",
                 title_ru="1-комнатная аренда Мирабад", title_en="1-room rent Mirobod",
                 desc_uz="Biznes markazlar yaqinida qulay kvartira.",
                 lat=41.3020, lng=69.3010, address="Mirobod tumani, Bobur ko'chasi"),
            dict(code="shayxontohur", rooms=2, area=68, floor=2, total=5, btype="old", repair="good",
                 elevator=False, parking=False, balcony=True, price=400, deal="rent",
                 title_uz="Shayxontohurda qulay 2 xonali ijara",
                 title_ru="2-комнатная аренда Шайхантахур", title_en="2-room rent Shaykhantakhur",
                 desc_uz="Markaziy joylashuv. Bozor, maktab yaqin.",
                 lat=41.3210, lng=69.2650, address="Shayxontohur tumani"),
        ]

        for i, p in enumerate(props):
            district = districts.get(p["code"])
            if not district:
                continue
            prop = Property(
                id=str(uuid.uuid4()),
                user_id=admin.id,
                district_id=district.id,
                deal_type=p["deal"],
                property_type="apartment",
                building_type=p["btype"],
                repair_status=p["repair"],
                title_uz=p["title_uz"],
                title_ru=p["title_ru"],
                title_en=p["title_en"],
                description_uz=p["desc_uz"],
                area_total=p["area"],
                rooms=p["rooms"],
                floor=p["floor"],
                total_floors=p["total"],
                has_elevator=p["elevator"],
                has_parking=p["parking"],
                has_balcony=p["balcony"],
                has_internet=True,
                price_usd=p["price"],
                price_uzs=p["price"] * UZS,
                is_negotiable=True,
                furniture="partial",
                heating="central",
                address=p["address"],
                latitude=p["lat"],
                longitude=p["lng"],
                status="active",
                views_count=0,
                contact_phone="+998712000000",
                created_at=datetime.utcnow() - timedelta(days=i),
            )
            db.add(prop)

        db.commit()
        print(f"Properties seeded: {len(props)} ta e'lon qo'shildi")
    except Exception as e:
        print(f"Property seed error: {e}")
        db.rollback()
    finally:
        db.close()


# Real OLX.uz listings imported into the site so they appear on the "E'lonlar" page.
# Rows are marked with this phone so the importer is idempotent across restarts.
REAL_LISTING_PHONE = "+998700000000"
# How many real listings to show on the site (sampled evenly across the dataset).
REAL_LISTING_LIMIT = 100

# Rental listings derived from the same real dataset. The CSV holds sale prices,
# so a realistic monthly rent is estimated from the sale price using a typical
# Tashkent gross rental yield (~7%/year => ~0.6%/month). Marked with a distinct
# phone so the sale and rent importers stay independent and idempotent.
REAL_RENT_PHONE = "+998700000001"
REAL_RENT_LIMIT = 50

# Pool of real apartment photos (Unsplash). Each listing gets a few of these so the
# cards/detail pages are not empty. Rendered with a plain <img>, so no domain
# whitelist is needed. Photos are picked deterministically by listing index.
REAL_LISTING_IMAGES = [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=900&q=70",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=900&q=70",
]


def _attach_listing_images(db, prop, index):
    """Attach 3 deterministic apartment photos to a listing (first = main)."""
    from app.models.property import PropertyImage
    n = len(REAL_LISTING_IMAGES)
    for k in range(3):
        url = REAL_LISTING_IMAGES[(index + k * 4) % n]
        db.add(PropertyImage(
            property_id=prop.id,
            url=url,
            is_main=(k == 0),
            order_num=k,
        ))


async def seed_real_listings():
    """Import a sample of the real scraped OLX.uz listings (CSV) into properties.

    The CSV is produced by scrape_olx.py and uses ML district_id (0-11). The DB
    District rows are seeded in the same order, so DB district = ordered[ml_id].
    Listings are inserted with status="active" so they show on the public site.
    Only REAL_LISTING_LIMIT rows are kept, sampled evenly for district/price variety.
    Idempotent: re-runs only adjust the count to match REAL_LISTING_LIMIT.
    """
    import os
    import uuid
    import csv as _csv
    from datetime import datetime, timedelta
    from app.database import SessionLocal
    from app.models.property import Property, District
    from app.models.user import User

    csv_path = os.path.join(os.path.dirname(__file__), "ml", "tashkent_real_estate_data.csv")
    if not os.path.exists(csv_path):
        print("seed_real_listings: CSV not found, skipping")
        return

    db = SessionLocal()
    try:
        from app.models.property import PropertyImage
        existing_props = db.query(Property).filter(Property.contact_phone == REAL_LISTING_PHONE).all()
        existing = len(existing_props)
        # Already at the desired count — just make sure each one has photos.
        if existing == REAL_LISTING_LIMIT:
            backfilled = 0
            for idx, prop in enumerate(existing_props):
                has_img = db.query(PropertyImage).filter(PropertyImage.property_id == prop.id).count()
                if has_img == 0:
                    _attach_listing_images(db, prop, idx)
                    backfilled += 1
            if backfilled:
                db.commit()
                print(f"seed_real_listings: {backfilled} listing uchun rasm qo'shildi")
            return
        # Wrong count (e.g. an earlier full import of 2,200) — clear and re-import
        if existing > 0:
            db.query(Property).filter(Property.contact_phone == REAL_LISTING_PHONE).delete()
            db.commit()
            print(f"seed_real_listings: cleared {existing} old real listings")

        admin = db.query(User).filter(User.email == "admin@uzestate.uz").first()
        if not admin:
            print("seed_real_listings: admin user missing, skipping")
            return

        # DB district ordered by id => index == ML district_id
        districts_ordered = db.query(District).order_by(District.id).all()
        if not districts_ordered:
            print("seed_real_listings: districts missing, skipping")
            return

        ROOM_WORD_UZ = {1: "1 xonali", 2: "2 xonali", 3: "3 xonali", 4: "4 xonali",
                        5: "5 xonali", 6: "6 xonali", 7: "7 xonali"}
        REPAIR_UZ = {"euro": "evroremont", "good": "yaxshi ta'mir", "average": "o'rtacha ta'mir",
                     "needs_repair": "ta'mir talab", "without_repair": "ta'mirsiz"}
        REPAIR_RU = {"euro": "евроремонт", "good": "хороший ремонт", "average": "средний ремонт",
                     "needs_repair": "требует ремонта", "without_repair": "без ремонта"}
        REPAIR_EN = {"euro": "euro renovation", "good": "good condition", "average": "average condition",
                     "needs_repair": "needs repair", "without_repair": "without repair"}

        UZS = 12700
        added = 0
        with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
            all_rows = list(_csv.DictReader(f))
        # Sample evenly across the full dataset for district/price variety
        if len(all_rows) > REAL_LISTING_LIMIT:
            step = len(all_rows) / REAL_LISTING_LIMIT
            rows = [all_rows[int(k * step)] for k in range(REAL_LISTING_LIMIT)]
        else:
            rows = all_rows

        for i, row in enumerate(rows):
                try:
                    ml_id = int(float(row["district_id"]))
                    if ml_id < 0 or ml_id >= len(districts_ordered):
                        continue
                    district = districts_ordered[ml_id]
                    rooms = int(float(row["rooms"]))
                    area = float(row["area_total"])
                    floor = int(float(row["floor"]))
                    total = int(float(row["total_floors"]))
                    price = int(float(row["price_usd"]))
                    btype = row["building_type"]
                    repair = row["repair_status"]
                except (ValueError, KeyError):
                    continue

                rw = ROOM_WORD_UZ.get(rooms, f"{rooms} xonali")
                dname_uz = district.name_uz
                title_uz = f"{dname_uz}da {rw} kvartira"
                title_ru = f"{rooms}-комнатная квартира, {district.name_ru}"
                title_en = f"{rooms}-room apartment in {district.name_en}"
                desc_uz = (f"{dname_uz}da {rw}, {area:.0f} m², {floor}/{total}-qavat. "
                           f"{REPAIR_UZ.get(repair, repair)}. OLX.uz dan olingan real e'lon.")
                desc_ru = (f"{rooms}-комнатная, {area:.0f} m², {floor}/{total} этаж. "
                           f"{REPAIR_RU.get(repair, repair)}.")
                desc_en = (f"{rooms}-room, {area:.0f} m², floor {floor}/{total}. "
                           f"{REPAIR_EN.get(repair, repair)}.")

                prop = Property(
                    id=str(uuid.uuid4()),
                    user_id=admin.id,
                    district_id=district.id,
                    deal_type="sale",
                    property_type="apartment",
                    building_type=btype,
                    repair_status=repair,
                    title_uz=title_uz,
                    title_ru=title_ru,
                    title_en=title_en,
                    description_uz=desc_uz,
                    description_ru=desc_ru,
                    description_en=desc_en,
                    area_total=area,
                    rooms=rooms,
                    floor=floor,
                    total_floors=total,
                    has_elevator=str(row.get("has_elevator", "0")).strip() in ("1", "1.0", "True"),
                    has_parking=str(row.get("has_parking", "0")).strip() in ("1", "1.0", "True"),
                    has_balcony=str(row.get("has_balcony", "0")).strip() in ("1", "1.0", "True"),
                    has_internet=True,
                    price_usd=price,
                    price_uzs=price * UZS,
                    is_negotiable=True,
                    furniture="partial",
                    heating="central",
                    address=district.name_uz,
                    latitude=district.center_lat,
                    longitude=district.center_lng,
                    status="active",
                    views_count=0,
                    contact_phone=REAL_LISTING_PHONE,
                    created_at=datetime.utcnow() - timedelta(minutes=i),
                )
                db.add(prop)
                _attach_listing_images(db, prop, i)
                added += 1
                if added % 500 == 0:
                    db.commit()

        db.commit()
        print(f"seed_real_listings: {added} real OLX.uz e'lon import qilindi")
    except Exception as e:
        print(f"seed_real_listings error: {e}")
        db.rollback()
    finally:
        db.close()


def _estimate_monthly_rent(sale_price_usd: int) -> int:
    """Estimate a realistic monthly rent (USD) from a sale price.

    Uses a ~7%/year gross yield (~0.58%/month), clamped to a sensible band and
    rounded to the nearest $25 so prices look like real listings.
    """
    rent = sale_price_usd * 0.0058
    rent = max(180, min(3000, rent))
    return int(round(rent / 25.0) * 25)


async def seed_real_rentals():
    """Import a sample of real listings as RENTAL offers (deal_type="rent").

    Reuses the same scraped dataset but converts the sale price into a realistic
    monthly rent. A different sampling offset is used so the rent set is not a
    duplicate of the sale set. Idempotent via REAL_RENT_PHONE; photos attached.
    """
    import os
    import uuid
    import csv as _csv
    from datetime import datetime, timedelta
    from app.database import SessionLocal
    from app.models.property import Property, District, PropertyImage
    from app.models.user import User

    csv_path = os.path.join(os.path.dirname(__file__), "ml", "tashkent_real_estate_data.csv")
    if not os.path.exists(csv_path):
        print("seed_real_rentals: CSV not found, skipping")
        return

    db = SessionLocal()
    try:
        existing_props = db.query(Property).filter(Property.contact_phone == REAL_RENT_PHONE).all()
        existing = len(existing_props)
        # Already at desired count — just ensure photos exist.
        if existing == REAL_RENT_LIMIT:
            backfilled = 0
            for idx, prop in enumerate(existing_props):
                if db.query(PropertyImage).filter(PropertyImage.property_id == prop.id).count() == 0:
                    _attach_listing_images(db, prop, idx + 7)
                    backfilled += 1
            if backfilled:
                db.commit()
                print(f"seed_real_rentals: {backfilled} ijara e'loniga rasm qo'shildi")
            return
        if existing > 0:
            db.query(Property).filter(Property.contact_phone == REAL_RENT_PHONE).delete()
            db.commit()
            print(f"seed_real_rentals: cleared {existing} old rent listings")

        admin = db.query(User).filter(User.email == "admin@uzestate.uz").first()
        if not admin:
            print("seed_real_rentals: admin user missing, skipping")
            return

        districts_ordered = db.query(District).order_by(District.id).all()
        if not districts_ordered:
            print("seed_real_rentals: districts missing, skipping")
            return

        ROOM_WORD_UZ = {1: "1 xonali", 2: "2 xonali", 3: "3 xonali", 4: "4 xonali",
                        5: "5 xonali", 6: "6 xonali", 7: "7 xonali"}
        REPAIR_UZ = {"euro": "evroremont", "good": "yaxshi ta'mir", "average": "o'rtacha ta'mir",
                     "needs_repair": "ta'mir talab", "without_repair": "ta'mirsiz"}
        REPAIR_RU = {"euro": "евроремонт", "good": "хороший ремонт", "average": "средний ремонт",
                     "needs_repair": "требует ремонта", "without_repair": "без ремонта"}
        REPAIR_EN = {"euro": "euro renovation", "good": "good condition", "average": "average condition",
                     "needs_repair": "needs repair", "without_repair": "without repair"}

        UZS = 12700
        added = 0
        with open(csv_path, "r", encoding="utf-8-sig", newline="") as f:
            all_rows = list(_csv.DictReader(f))
        # Sample evenly but with a half-step offset so rentals differ from sales.
        if len(all_rows) > REAL_RENT_LIMIT:
            step = len(all_rows) / REAL_RENT_LIMIT
            rows = [all_rows[int((k + 0.5) * step) % len(all_rows)] for k in range(REAL_RENT_LIMIT)]
        else:
            rows = all_rows

        for i, row in enumerate(rows):
            try:
                ml_id = int(float(row["district_id"]))
                if ml_id < 0 or ml_id >= len(districts_ordered):
                    continue
                district = districts_ordered[ml_id]
                rooms = int(float(row["rooms"]))
                area = float(row["area_total"])
                floor = int(float(row["floor"]))
                total = int(float(row["total_floors"]))
                sale_price = int(float(row["price_usd"]))
                btype = row["building_type"]
                repair = row["repair_status"]
            except (ValueError, KeyError):
                continue

            rent = _estimate_monthly_rent(sale_price)
            rw = ROOM_WORD_UZ.get(rooms, f"{rooms} xonali")
            dname_uz = district.name_uz
            title_uz = f"{dname_uz}da {rw} kvartira ijaraga"
            title_ru = f"{rooms}-комнатная квартира в аренду, {district.name_ru}"
            title_en = f"{rooms}-room apartment for rent in {district.name_en}"
            desc_uz = (f"{dname_uz}da {rw}, {area:.0f} m², {floor}/{total}-qavat. "
                       f"{REPAIR_UZ.get(repair, repair)}. Oylik ijara. OLX.uz dan olingan real e'lon.")
            desc_ru = (f"{rooms}-комнатная, {area:.0f} m², {floor}/{total} этаж. "
                       f"{REPAIR_RU.get(repair, repair)}. Помесячная аренда.")
            desc_en = (f"{rooms}-room, {area:.0f} m², floor {floor}/{total}. "
                       f"{REPAIR_EN.get(repair, repair)}. Monthly rent.")

            prop = Property(
                id=str(uuid.uuid4()),
                user_id=admin.id,
                district_id=district.id,
                deal_type="rent",
                property_type="apartment",
                building_type=btype,
                repair_status=repair,
                title_uz=title_uz,
                title_ru=title_ru,
                title_en=title_en,
                description_uz=desc_uz,
                description_ru=desc_ru,
                description_en=desc_en,
                area_total=area,
                rooms=rooms,
                floor=floor,
                total_floors=total,
                has_elevator=str(row.get("has_elevator", "0")).strip() in ("1", "1.0", "True"),
                has_parking=str(row.get("has_parking", "0")).strip() in ("1", "1.0", "True"),
                has_balcony=str(row.get("has_balcony", "0")).strip() in ("1", "1.0", "True"),
                has_internet=True,
                price_usd=rent,
                price_uzs=rent * UZS,
                is_negotiable=True,
                furniture="partial",
                heating="central",
                address=district.name_uz,
                latitude=district.center_lat,
                longitude=district.center_lng,
                status="active",
                views_count=0,
                contact_phone=REAL_RENT_PHONE,
                created_at=datetime.utcnow() - timedelta(minutes=i),
            )
            db.add(prop)
            _attach_listing_images(db, prop, i + 7)
            added += 1

        db.commit()
        print(f"seed_real_rentals: {added} ijara e'loni import qilindi")
    except Exception as e:
        print(f"seed_real_rentals error: {e}")
        db.rollback()
    finally:
        db.close()
