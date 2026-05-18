"""
Namuna ko'chmas mulk e'lonlarini bazaga qo'shish skripti.
Sotiladigan va ijaraga beriladigan e'lonlar, Toshkent tumanlari bo'yicha.
"""
import uuid
from datetime import datetime, timedelta
from app.database import SessionLocal
from app.models.property import Property, District
from app.models.user import User
from app.utils.security import hash_password

UZS = 12700  # 1 USD = 12700 UZS

PROPERTIES_FOR_SALE = [
    # Yunusobod
    dict(district_code="yunusobod", rooms=3, area_total=85.0, area_living=55.0, area_kitchen=12.0,
         floor=7, total_floors=16, building_type="monolith", repair_status="euro",
         has_elevator=True, has_parking=True, has_balcony=True, price_usd=145000,
         title_uz="Yunusobodda 3 xonali zamonaviy kvartira",
         title_ru="3-комнатная квартира в Юнусабаде", title_en="3-room apartment in Yunusabad",
         description_uz="Yunusobod tumanida monolit binoda zamonaviy ta'mirli 3 xonali kvartira. "
                        "Lift, avtoturargoh, balkon mavjud. Metro yaqin.",
         address="Yunusobod tumani, 16-mavze", latitude=41.3350, longitude=69.3120),

    dict(district_code="yunusobod", rooms=2, area_total=62.0, area_living=40.0, area_kitchen=10.0,
         floor=3, total_floors=9, building_type="brick", repair_status="good",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=98000,
         title_uz="Yunusobodda 2 xonali kvartira",
         title_ru="2-комнатная квартира в Юнусабаде", title_en="2-room apartment in Yunusabad",
         description_uz="G'isht binoda yaxshi ta'mirli kvartira. Balkon, qulay joylashuv.",
         address="Yunusobod tumani, A.Temur ko'chasi", latitude=41.3380, longitude=69.3080),

    # Chilonzor
    dict(district_code="chilonzor", rooms=1, area_total=38.0, area_living=22.0, area_kitchen=8.0,
         floor=5, total_floors=9, building_type="panel", repair_status="average",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=42000,
         title_uz="Chilonzorda 1 xonali kvartira",
         title_ru="1-комнатная квартира в Чиланзаре", title_en="1-room apartment in Chilanzar",
         description_uz="Panel binoda o'rtacha ta'mirli 1 xonali kvartira. Arzon narx!",
         address="Chilonzor tumani, Olmazor ko'chasi", latitude=41.2910, longitude=69.2230),

    dict(district_code="chilonzor", rooms=4, area_total=110.0, area_living=75.0, area_kitchen=15.0,
         floor=2, total_floors=5, building_type="brick", repair_status="euro",
         has_elevator=False, has_parking=True, has_balcony=True, price_usd=118000,
         title_uz="Chilonzorda keng 4 xonali kvartira",
         title_ru="Просторная 4-комнатная в Чиланзаре", title_en="Spacious 4-room in Chilanzar",
         description_uz="G'isht binoda evroremontli 4 xonali keng kvartira. Avtoturargoh bor.",
         address="Chilonzor tumani, 19-mavze", latitude=41.2880, longitude=69.2190),

    # Mirzo Ulugbek
    dict(district_code="mirzo_ulugbek", rooms=2, area_total=55.0, area_living=35.0, area_kitchen=9.0,
         floor=4, total_floors=12, building_type="new", repair_status="euro",
         has_elevator=True, has_parking=False, has_balcony=True, price_usd=75000,
         title_uz="Mirzo Ulug'bekda yangi binodan 2 xona",
         title_ru="2-комнатная в новостройке, Мирзо-Улугбек", title_en="2-room new building, Mirzo Ulugbek",
         description_uz="Yangi binodan evroremontli kvartira. Lift bor, metroga yaqin.",
         address="Mirzo Ulug'bek tumani, Universitet ko'chasi", latitude=41.3210, longitude=69.3520),

    dict(district_code="mirzo_ulugbek", rooms=3, area_total=90.0, area_living=60.0, area_kitchen=12.0,
         floor=8, total_floors=16, building_type="monolith", repair_status="good",
         has_elevator=True, has_parking=True, has_balcony=True, price_usd=125000,
         title_uz="Mirzo Ulug'bekda 3 xonali monolit",
         title_ru="3-комнатная монолит в Мирзо-Улугбеке", title_en="3-room monolith, Mirzo Ulugbek",
         description_uz="Monolit binoda yaxshi holatdagi kvartira. Lift, avtoturargoh.",
         address="Mirzo Ulug'bek tumani, Sharaf Rashidov ko'chasi", latitude=41.3180, longitude=69.3560),

    # Yakkasaroy
    dict(district_code="yakkasaroy", rooms=2, area_total=70.0, area_living=45.0, area_kitchen=11.0,
         floor=6, total_floors=9, building_type="brick", repair_status="euro",
         has_elevator=True, has_parking=False, has_balcony=True, price_usd=105000,
         title_uz="Yakkasaroyda 2 xonali evroremontli",
         title_ru="2-комнатная с евроремонтом, Яккасарай", title_en="2-room euro-renovated, Yakkasaray",
         description_uz="Shahar markazida g'isht binoda evroremontli kvartira.",
         address="Yakkasaroy tumani, Shota Rustaveli ko'chasi", latitude=41.2870, longitude=69.2710),

    # Sergeli
    dict(district_code="sergeli", rooms=2, area_total=58.0, area_living=36.0, area_kitchen=9.0,
         floor=3, total_floors=9, building_type="panel", repair_status="average",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=38000,
         title_uz="Sergelidа arzon 2 xonali kvartira",
         title_ru="Недорогая 2-комнатная в Сергели", title_en="Affordable 2-room in Sergeli",
         description_uz="Arzon narxda qulay kvartira. Uy-joy sharoitlari yaxshi.",
         address="Sergeli tumani, Sergeli ko'chasi", latitude=41.2230, longitude=69.2720),

    # Shayxontohur
    dict(district_code="shayxontohur", rooms=3, area_total=78.0, area_living=50.0, area_kitchen=11.0,
         floor=5, total_floors=9, building_type="brick", repair_status="good",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=89000,
         title_uz="Shayxontohurda 3 xonali kvartira",
         title_ru="3-комнатная в Шайхантахуре", title_en="3-room apartment, Shaykhantakhur",
         description_uz="Eski qurilishda yaxshi ta'mirli kvartira. Bozor va maktabga yaqin.",
         address="Shayxontohur tumani, Navoiy ko'chasi", latitude=41.3200, longitude=69.2640),

    # Mirobod
    dict(district_code="mirobod", rooms=1, area_total=42.0, area_living=28.0, area_kitchen=8.0,
         floor=9, total_floors=16, building_type="monolith", repair_status="euro",
         has_elevator=True, has_parking=False, has_balcony=True, price_usd=62000,
         title_uz="Mirobodda zamonaviy 1 xonali",
         title_ru="Современная 1-комнатная в Мирабаде", title_en="Modern 1-room in Mirobod",
         description_uz="Biznes markaz yaqinida zamonaviy 1 xonali kvartira. Evroremоnt.",
         address="Mirobod tumani, Amir Temur xiyoboni", latitude=41.3010, longitude=69.2990),

    # Uchtepa
    dict(district_code="uchtepa", rooms=3, area_total=80.0, area_living=52.0, area_kitchen=12.0,
         floor=2, total_floors=5, building_type="old", repair_status="needs_repair",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=52000,
         title_uz="Uchtepada 3 xonali kvartira ta'mirlash kerak",
         title_ru="3-комнатная, требует ремонта, Учтепа", title_en="3-room needs repair, Uchtepa",
         description_uz="Qulay kvartira, ta'mirlash kerak. Narx past.",
         address="Uchtepa tumani, Qo'yliq ko'chasi", latitude=41.2990, longitude=69.2010),

    # Bektemir
    dict(district_code="bektemir", rooms=2, area_total=50.0, area_living=32.0, area_kitchen=8.0,
         floor=4, total_floors=5, building_type="panel", repair_status="average",
         has_elevator=False, has_parking=False, has_balcony=False, price_usd=29000,
         title_uz="Bektemirada arzon 2 xonali",
         title_ru="Недорогая 2-комнатная в Бектемире", title_en="Cheap 2-room in Bektemir",
         description_uz="Eng arzon narxda kvartira. Sanoat hududi yaqinida.",
         address="Bektemir tumani, Sanoat ko'chasi", latitude=41.2720, longitude=69.3770),
]

PROPERTIES_FOR_RENT = [
    # Yunusobod
    dict(district_code="yunusobod", rooms=2, area_total=65.0, area_living=42.0, area_kitchen=10.0,
         floor=5, total_floors=12, building_type="new", repair_status="euro",
         has_elevator=True, has_parking=False, has_balcony=True, price_usd=800,
         title_uz="Yunusobodda 2 xonali ijaraga",
         title_ru="2-комнатная в аренду, Юнусабад", title_en="2-room for rent, Yunusabad",
         description_uz="Yangi binoda evroremontli kvartira ijaraga. Mebelь bor.",
         address="Yunusobod tumani, 12-mavze", latitude=41.3360, longitude=69.3100),

    dict(district_code="yunusobod", rooms=1, area_total=40.0, area_living=25.0, area_kitchen=8.0,
         floor=3, total_floors=9, building_type="brick", repair_status="good",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=450,
         title_uz="Yunusobodda 1 xonali ijaraga",
         title_ru="1-комнатная в аренду, Юнусабад", title_en="1-room for rent, Yunusabad",
         description_uz="Qulay 1 xonali kvartira ijaraga. Mebelь va texnika bor.",
         address="Yunusobod tumani, Ferghana yo'li", latitude=41.3400, longitude=69.3050),

    # Chilonzor
    dict(district_code="chilonzor", rooms=2, area_total=55.0, area_living=35.0, area_kitchen=9.0,
         floor=6, total_floors=9, building_type="panel", repair_status="average",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=350,
         title_uz="Chilonzorda 2 xonali arzon ijara",
         title_ru="2-комнатная аренда, Чиланзар", title_en="2-room rent, Chilanzar",
         description_uz="Arzon narxda ijaraga kvartira. Kommunal to'lovlar alohida.",
         address="Chilonzor tumani, Bunyodkor ko'chasi", latitude=41.2900, longitude=69.2200),

    # Mirzo Ulugbek
    dict(district_code="mirzo_ulugbek", rooms=3, area_total=90.0, area_living=60.0, area_kitchen=13.0,
         floor=7, total_floors=16, building_type="monolith", repair_status="euro",
         has_elevator=True, has_parking=True, has_balcony=True, price_usd=1200,
         title_uz="Mirzo Ulug'bekda 3 xonali premium ijara",
         title_ru="3-комнатная премиум аренда, Мирзо-Улугбек", title_en="3-room premium rent, Mirzo Ulugbek",
         description_uz="Premium sinfli kvartira ijaraga. To'liq mebelь, konditsioner.",
         address="Mirzo Ulug'bek tumani, TATU yaqini", latitude=41.3220, longitude=69.3500),

    # Mirobod
    dict(district_code="mirobod", rooms=1, area_total=38.0, area_living=24.0, area_kitchen=7.0,
         floor=4, total_floors=9, building_type="brick", repair_status="good",
         has_elevator=False, has_parking=False, has_balcony=False, price_usd=500,
         title_uz="Mirobodda ofis yaqin 1 xonali ijara",
         title_ru="1-комнатная у офисов, аренда Мирабад", title_en="1-room near offices, rent Mirobod",
         description_uz="Biznes markazlar yaqinida qulay kvartira. Internet, texnika bor.",
         address="Mirobod tumani, Bobur ko'chasi", latitude=41.3020, longitude=69.3010),

    # Sergeli
    dict(district_code="sergeli", rooms=2, area_total=60.0, area_living=38.0, area_kitchen=10.0,
         floor=4, total_floors=9, building_type="panel", repair_status="average",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=280,
         title_uz="Sergelidа eng arzon 2 xonali ijara",
         title_ru="Самая дешевая аренда 2-комнатной, Сергели", title_en="Cheapest 2-room rent, Sergeli",
         description_uz="Shahar arzon ijaraga. Avtobus to'xtash joyi yaqin.",
         address="Sergeli tumani, Yangi Sergeli", latitude=41.2200, longitude=69.2710),

    # Shayxontohur
    dict(district_code="shayxontohur", rooms=2, area_total=68.0, area_living=44.0, area_kitchen=10.0,
         floor=2, total_floors=5, building_type="old", repair_status="good",
         has_elevator=False, has_parking=False, has_balcony=True, price_usd=400,
         title_uz="Shayxontohurda qulay 2 xonali ijara",
         title_ru="Удобная 2-комнатная аренда, Шайхантахур", title_en="Convenient 2-room rent, Shaykhantakhur",
         description_uz="Markaziy joylashuv. Bozor, maktab, dorixona yaqin.",
         address="Shayxontohur tumani, Yunusobod ko'chasi", latitude=41.3210, longitude=69.2650),
]


def seed():
    db = SessionLocal()

    # Admin user yaratish (agar yo'q bo'lsa)
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
        print("Admin user yaratildi")

    # Agar property lar allaqachon bo'lsa, o'tkazib yuboramiz
    existing = db.query(Property).count()
    if existing > 0:
        print(f"Bazada allaqachon {existing} ta e'lon bor. Yangi qo'shilmaydi.")
        db.close()
        return

    # Tumanlar map
    districts = {d.code: d for d in db.query(District).all()}
    if not districts:
        print("❌ Tumanlar topilmadi! Avval serverni ishga tushiring.")
        db.close()
        return

    added = 0

    def add_property(data: dict, deal_type: str):
        nonlocal added
        code = data.pop("district_code")
        district = districts.get(code)
        if not district:
            print(f"  ⚠ Tuman topilmadi: {code}")
            return

        price_usd = data["price_usd"]
        prop = Property(
            id=str(uuid.uuid4()),
            user_id=admin.id,
            district_id=district.id,
            deal_type=deal_type,
            property_type="apartment",
            price_uzs=price_usd * UZS,
            is_negotiable=True,
            furniture="partial",
            heating="central",
            has_internet=True,
            status="active",
            views_count=0,
            contact_phone="+998712000000",
            created_at=datetime.utcnow() - timedelta(days=added),
            **data,
        )
        db.add(prop)
        added += 1

    print("Sotiladigan e'lonlar qo'shilmoqda...")
    for item in PROPERTIES_FOR_SALE:
        add_property(dict(item), "sale")

    print("Ijaraga e'lonlar qo'shilmoqda...")
    for item in PROPERTIES_FOR_RENT:
        add_property(dict(item), "rent")

    db.commit()
    db.close()

    print(f"\n✅ Jami {added} ta e'lon qo'shildi:")
    print(f"   Sotiladigan: {len(PROPERTIES_FOR_SALE)} ta")
    print(f"   Ijaraga: {len(PROPERTIES_FOR_RENT)} ta")
    print(f"\n   Saytda ko'rish: http://localhost:3000/properties")


if __name__ == "__main__":
    seed()
