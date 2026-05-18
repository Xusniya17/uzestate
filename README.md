# UzEstate — Ko'chmas Mulk Narxini Baholash Tizimi

**Diplom ishi:** House Price Estimation Model for the Real Estate Market in Uzbekistan  
**Hudud:** Toshkent shahri (12 ta tuman)  
**Tillar:** O'zbek 🇺🇿 | Русский 🇷🇺 | English 🇬🇧

---

## Loyiha tuzilmasi

```
house-price-uz/
├── docs/           # TZ va hujjatlar
├── backend/        # Python FastAPI backend + ML model
├── frontend/       # Next.js web ilova
├── mobile/         # React Native mobil ilova
├── nginx/          # Nginx konfiguratsiya
└── docker-compose.yml
```

---

## Texnologiyalar

| Qism | Texnologiya |
|------|-------------|
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| ML Model | XGBoost, Random Forest, scikit-learn |
| Database | PostgreSQL 15 |
| Cache | Redis |
| Web Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Mobile | React Native (Expo) |
| Auth | JWT (access + refresh tokens) |
| Email | SMTP / aiosmtplib |
| SMS | Eskiz.uz API |
| Deploy | Docker Compose, Nginx |

---

## Ishga tushirish

### 1. Backend (lokal)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # .env ni to'ldiring

# ML modelni o'qitish
python -m app.ml.train

# Serverni ishga tushirish
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Web Frontend (lokal)

```bash
cd frontend
npm install
# .env.local fayl yarating:
# NEXT_PUBLIC_API_URL=http://localhost:8000/v1
npm run dev
```

Veb: http://localhost:3000

### 3. Mobil ilova

```bash
cd mobile
npm install
npx expo start
```

QR kodni Expo Go ilovasi orqali skanerlang.

### 4. Docker Compose (to'liq)

```bash
# .env faylini sozlang
cp backend/.env.example backend/.env

# Barcha xizmatlarni ishga tushirish
docker-compose up -d

# Log ko'rish
docker-compose logs -f api
```

Veb: http://localhost  
API: http://localhost/v1  
Docs: http://localhost/docs

---

## API Endpointlar

```
POST /v1/auth/register          — Ro'yxatdan o'tish
POST /v1/auth/verify-email      — Email tasdiqlash (OTP)
POST /v1/auth/login             — Kirish
POST /v1/auth/refresh           — Token yangilash
POST /v1/auth/logout            — Chiqish
POST /v1/auth/forgot-password   — Parolni tiklash
POST /v1/auth/send-sms-otp      — SMS kod yuborish
POST /v1/auth/verify-phone      — Telefon tasdiqlash

GET  /v1/users/me               — Profilni olish
PUT  /v1/users/me               — Profilni yangilash

GET  /v1/properties             — E'lonlar ro'yxati
POST /v1/properties             — E'lon yaratish
GET  /v1/properties/{id}        — E'lon ma'lumoti
GET  /v1/properties/districts   — Tumanlar ro'yxati

POST /v1/predictions/estimate   — Narx baholash (ML)
GET  /v1/predictions/history    — Baholash tarixi

GET  /v1/analytics/market-overview  — Bozor statistikasi
GET  /v1/analytics/price-trends     — Narx dinamikasi
```

---

## ML Model

- **Algoritm:** Ensemble (XGBoost 50% + Random Forest 30% + Gradient Boosting 20%)
- **Dataset:** 8,000 ta sintetik lekin realistik Toshkent ma'lumotlari
- **Maqsadli R²:** ≥ 0.85
- **12 ta xususiyat:** tuman, maydon, xonalar, qavat, bino turi, ta'mirlash, lift, avtoturargoh, balkon

### Toshkent tumanlari o'rtacha narxlari (2024):

| Tuman | 1 m² narxi (USD) |
|-------|-----------------|
| Yunusobod | $1,600 |
| Yakkasaroy | $1,400 |
| Mirobod | $1,300 |
| Mirzo Ulugbek | $1,150 |
| Shayxontohur | $1,050 |
| Chilonzor | $950 |
| Almazar | $900 |
| Olmazor | $850 |
| Uchtepa | $780 |
| Yashnobod | $750 |
| Sergeli | $680 |
| Bektemir | $580 |

---

## Muallif

**Diplom ishi** — O'zbekiston ko'chmas mulk bozori uchun uy narxini baholash modeli  
**Universitetlar:** [Universitetingiz nomi]  
**Yil:** 2026
