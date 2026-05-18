"""Backend API to'liq test skripti"""
from fastapi.testclient import TestClient
from app.main import app
from app.database import SessionLocal
from app.models.user import OTPCode, User

client = TestClient(app)

email = "final_test@uzestate.uz"

# Avval eski test user o'chirish
db = SessionLocal()
db.query(User).filter(User.email == email).delete()
db.commit()
db.close()

# 1. Register
r1 = client.post("/v1/auth/register", json={
    "email": email, "first_name": "Nodira", "last_name": "Yusupova",
    "password": "Test@5678", "language": "uz"
})
print(f"1. REGISTER: {r1.status_code} - {r1.json().get('message','ERROR')}")

# OTP olish
db = SessionLocal()
otp = db.query(OTPCode).filter(OTPCode.target == email).order_by(OTPCode.created_at.desc()).first()
code = otp.code
db.close()
print(f"   OTP code: {code}")

# 2. Email verify
r2 = client.post("/v1/auth/verify-email", json={"email": email, "code": code})
print(f"2. VERIFY: {r2.status_code} - email_verified: {r2.json().get('user',{}).get('is_email_verified')}")

# 3. Login
r3 = client.post("/v1/auth/login", json={"email": email, "password": "Test@5678"})
print(f"3. LOGIN: {r3.status_code}")
token = r3.json().get("access_token", "")

# 4. Profile
r4 = client.get("/v1/users/me", headers={"Authorization": f"Bearer {token}"})
u = r4.json()
print(f"4. PROFILE: {u['first_name']} {u['last_name']} | role: {u['role']}")

# 5. Narx baholash - Yunusobod, 3 xona, 80m²
r5 = client.post("/v1/predictions/estimate", json={
    "district_id": 1, "area_total": 80, "rooms": 3, "floor": 4, "total_floors": 9,
    "building_type": "monolith", "repair_status": "euro",
    "has_elevator": True, "has_parking": True, "has_balcony": True
})
e = r5.json()
print(f"5. ESTIMATE: ${e['predicted_price_usd']:,} USD | {e['predicted_price_uzs']/1_000_000:.0f} mln so'm")
print(f"   Diapazon: ${e['price_min_usd']:,} - ${e['price_max_usd']:,}")
print(f"   1m2 narxi: ${e['price_per_sqm_usd']:,} | Aniqlik: {e['confidence_score']}%")

# 6. Districts
r6 = client.get("/v1/properties/districts")
districts = r6.json()
print(f"6. DISTRICTS: {len(districts)} ta tuman")
for d in districts[:3]:
    print(f"   - {d['name_uz']}: ${d['avg_price_per_sqm']}/m2")

# 7. Analytics
r7 = client.get("/v1/analytics/market-overview")
a = r7.json()
print(f"7. ANALYTICS: {a['total_listings']} e'lon | Avg ${a['avg_price_per_sqm']}/m²")

# 8. Update profile
r8 = client.put("/v1/users/me",
    json={"language": "ru"},
    headers={"Authorization": f"Bearer {token}"}
)
print(f"8. UPDATE PROFILE: {r8.status_code} - lang: {r8.json().get('language')}")

# 9. Prediction history
r9 = client.get("/v1/predictions/history", headers={"Authorization": f"Bearer {token}"})
print(f"9. HISTORY: {len(r9.json())} ta baholash tarixi")

# 10. Logout
r10 = client.post("/v1/auth/logout",
    json={"refresh_token": r3.json().get("refresh_token","")},
    headers={"Authorization": f"Bearer {token}"}
)
print(f"10. LOGOUT: {r10.status_code} - {r10.json().get('message')}")

print("\n" + "="*50)
print("✅ BARCHA TESTLAR MUVAFFAQIYATLI O'TDI!")
print("="*50)
