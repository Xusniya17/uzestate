# TEXNIK TOPSHIRIQ (TZ)
## Loyiha: House Price Estimation Model for the Real Estate Market in Uzbekistan
### Toshkent shahri ko'chmas mulk narxini baholash tizimi

---

## 1. UMUMIY MA'LUMOT

| Maydon | Qiymat |
|--------|--------|
| **Loyiha nomi** | UzEstate — Ko'chmas mulk narxini baholash tizimi |
| **Diplom ishi mavzusi** | House Price Estimation Model for the Real Estate Market in Uzbekistan |
| **Muallif** | [Talaba ismi] |
| **Versiya** | 1.0.0 |
| **Sana** | 2026 yil |
| **Maqsadli hudud** | Toshkent shahri (12 ta tuman) |
| **Platformalar** | Web (brauzер) + Mobile (iOS & Android) |
| **Backend tili** | Python (FastAPI) |
| **Frontend** | Next.js (Web), React Native/Expo (Mobile) |
| **Ma'lumotlar bazasi** | PostgreSQL |
| **ML Framework** | scikit-learn, XGBoost |

---

## 2. LOYIHA MAQSADI VA VAZIFALARI

### 2.1 Maqsad
Toshkent shahridagi ko'chmas mulk (kvartiра va uy-joy) bozori uchun sun'iy intellekt asosida narx baholash tizimini yaratish. Foydalanuvchilar mulk parametrlarini kiritib, bozordagi real narxga yaqin bahoni avtomatik olishlari mumkin bo'ladi.

### 2.2 Asosiy vazifalar
1. **ML model** — Ko'chmas mulk narxini bashorat qiluvchi machine learning modeli yaratish
2. **Web dastur** — 3 tilda ishlaydigan, foydalanuvchilarga qulay veb-sayt
3. **Mobil dastur** — iOS va Android uchun mobil ilova
4. **Autentifikatsiya** — Xavfsiz ro'yxatdan o'tish/kirish tizimi
5. **Bildirishnomalar** — Email va SMS orqali xabarnomalar
6. **Xarita** — Toshkent tumanlari bo'yicha vizualizatsiya
7. **Real ma'lumotlar** — Toshkent shahri bo'yicha real bozor ma'lumotlari

### 2.3 Maqsadli foydalanuvchilar
- Kvartira sotib olmoqchi bo'lgan xaridorlar
- Ko'chmas mulkini sotmoqchi bo'lgan egalar
- Rieltorlar va agentliklar
- Investorlar
- Tadqiqotchilar va tahlilchilar

---

## 3. FUNKSIONAL TALABLAR

### 3.1 Autentifikatsiya va Avtorizatsiya

#### 3.1.1 Ro'yxatdan o'tish
- Ism, familiya, email, telefon raqami, parol majburiy
- Email orqali tasdiqlash kodi yuborish (OTP — 6 raqam, 10 daqiqa amal qiladi)
- SMS orqali telefon raqamini tasdiqlash (Eskiz.uz API)
- Parol talablari: kamida 8 ta belgi, katta/kichik harf, raqam
- Takroriy email va telefon raqamini tekshirish

#### 3.1.2 Kirish (Login)
- Email + Parol orqali kirish
- "Meni eslab qol" funksiyasi (30 kun)
- Noto'g'ri urinish hisoblagichi (5 urinishdan so'ng 15 daqiqa blok)
- JWT access token (30 daqiqa) + refresh token (30 kun)

#### 3.1.3 Parolni tiklash
- Email orqali tiklash havolasi yuborish
- Xavfsiz token (1 soat amal qiladi, bir marta ishlatiladi)
- SMS orqali OTP kodi yuborish imkoni

#### 3.1.4 Profil boshqaruvi
- Shaxsiy ma'lumotlarni tahrirlash
- Parol o'zgartirish
- Avatar yuklash
- Bildirishnoma sozlamalari

### 3.2 Narx Baholash (ML Model)

#### 3.2.1 Kirish parametrlari
| Parametr | Tur | Majburiy |
|----------|-----|---------|
| Tuman (District) | Select | Ha |
| Ko'cha/Mahalla | Text | Yo'q |
| Uy turi | Select (yangi/eski) | Ha |
| Umumiy maydon (m²) | Number | Ha |
| Xonalar soni | Number | Ha |
| Qavat | Number | Ha |
| Umumiy qavatlar | Number | Ha |
| Ta'mirlash holati | Select | Ha |
| Bino turi | Select | Ha |
| Mebel holati | Select | Yo'q |
| Isinish turi | Select | Yo'q |
| Lift mavjudligi | Boolean | Yo'q |
| Yer usti avtoturargoh | Boolean | Yo'q |

#### 3.2.2 Chiqish
- Taxminiy narx (USD va UZS)
- Narx diapazoni (min — max)
- 1 m² narxi
- Ishonchlilik darajasi (%)
- Shu tumandagi o'rtacha narx taqqoslamasi
- Narx trendi (oxirgi 6 oy)
- O'xshash mulklar ro'yxati

#### 3.2.3 ML Model spetsifikatsiyasi
- **Algoritm**: Ensemble (XGBoost + Random Forest + Gradient Boosting)
- **Train/Test**: 80/20 nisbat
- **Cross-validation**: K-Fold (k=5)
- **Metrikalar**: RMSE, MAE, R² score
- **Maqsadli R²**: ≥ 0.85
- **Feature engineering**: Location encoding, polynomial features, interaction terms

### 3.3 Ko'chmas Mulk Katalogu

#### 3.3.1 E'lon berish
- Fotosuratlar yuklash (maks 20 ta, har biri maks 5 MB)
- Mulk tavsifi (3 tilda)
- Asosiy parametrlarni kiritish
- ML model yordamida narxni tekshirish
- Xarita ustida joylashuvni belgilash

#### 3.3.2 Qidirish va Filtrlash
- Tuman bo'yicha filter
- Narx diapazoni
- Maydon diapazoni
- Xonalar soni
- Mulk turi (kvartira/uy)
- Ta'mirlash holati
- Saralash: narx (o'sish/kamayish), maydon, yangilik
- Xarita ko'rinishida qidirish

#### 3.3.3 E'lon ko'rish
- To'liq mulk tavsifi
- Fotogalereya
- Xaritada joylashuv
- Infratuzilma masofasi (metro, maktab, shifoxona, do'kon)
- Bog'lanish ma'lumotlari
- Tegishli e'lonlar
- Ko'rishlar soni, saqlangan soni

#### 3.3.4 Sevimlilar (Wishlist)
- E'lonlarni saqlash
- Saqlangan e'lonlar ro'yxati
- Narx o'zgarishi bildirishnomasi

### 3.4 Xarita (Interactive Map)
- Yandex Maps yoki Google Maps integratsiyasi
- Toshkent 12 ta tumani ko'rsatiladi
- Heat map (narx zichligi)
- Mulk markerлари
- Tuman bo'yicha o'rtacha narx
- Metro stansiyalari, maktablar, shifoxonalar
- Klaster guruhlash (zoom darajasiga qarab)

### 3.5 Statistika va Tahlil
- Toshkent tumanlari bo'yicha o'rtacha narxlar
- Narx dinamikasi grafigi (6 oy, 1 yil)
- Mulk turi bo'yicha taqsimot
- Eng ko'p so'ralgan tumanlar
- Narx/maydon korrelyatsiyasi

### 3.6 Admin Panel
- Foydalanuvchilarni boshqarish
- E'lonlarni moderatsiya qilish
- ML model qayta o'qitish
- Statistika ko'rsatkichlari
- Email/SMS kampaniyalar

---

## 4. TEXNIK TALABLAR

### 4.1 Backend (Python/FastAPI)

```
Texnologiyalar:
- Python 3.11+
- FastAPI 0.110+
- SQLAlchemy 2.0 (ORM)
- Alembic (migratsiyalar)
- PostgreSQL 15+
- Redis (kesh, sessiyalar)
- Celery (asinxron vazifalar)
- JWT (PyJWT)
- Pydantic v2 (validatsiya)
- scikit-learn, XGBoost (ML)
- pandas, numpy (ma'lumotlar)
- Pillow (rasm qayta ishlash)
- boto3 (AWS S3 — fayllar)
- smtplib / aiosmtplib (email)
- httpx (HTTP so'rovlar)
```

#### API Arxitekturasi (RESTful)
```
Base URL: https://api.uzestate.uz/v1

Endpointlar:
POST   /auth/register
POST   /auth/verify-email
POST   /auth/login
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
POST   /auth/send-sms-otp
POST   /auth/verify-phone

GET    /users/me
PUT    /users/me
DELETE /users/me
POST   /users/me/avatar

GET    /properties
POST   /properties
GET    /properties/{id}
PUT    /properties/{id}
DELETE /properties/{id}
POST   /properties/{id}/images
GET    /properties/favorites
POST   /properties/{id}/favorite
DELETE /properties/{id}/favorite

POST   /predictions/estimate
GET    /predictions/history
GET    /predictions/{id}

GET    /districts
GET    /districts/{id}/stats
GET    /analytics/price-trends
GET    /analytics/market-overview
```

### 4.2 Frontend (Next.js 14)

```
Texnologiyalar:
- Next.js 14 (App Router)
- TypeScript 5+
- Tailwind CSS 3
- next-i18next (ko'p tillilik)
- React Query (API holati)
- Zustand (global holat)
- React Hook Form + Zod (formlar)
- Chart.js / Recharts (grafiklar)
- Yandex Maps API / Leaflet (xarita)
- Axios (HTTP)
- next-auth (autentifikatsiya)
- React Toastify (bildirishnomalar)
- Swiper (fotogalereya)
```

#### Sahifalar
```
/               — Bosh sahifa
/login          — Kirish
/register       — Ro'yxatdan o'tish
/verify-email   — Email tasdiqlash
/forgot-password— Parol tiklash
/estimate       — Narx baholash (asosiy)
/properties     — E'lonlar katalogi
/properties/[id]— E'lon sahifasi
/properties/new — E'lon berish
/map            — Interaktiv xarita
/analytics      — Statistika
/profile        — Profil
/profile/favorites — Sevimlilar
/admin          — Admin panel
```

### 4.3 Mobile App (React Native/Expo)

```
Texnologiyalar:
- Expo SDK 51+
- React Native 0.74+
- TypeScript
- Expo Router (navigatsiya)
- React Native Paper (UI kit)
- i18next (ko'p tillilik)
- React Query
- Zustand
- Expo Notifications (push bildirish)
- React Native Maps
- Expo Image Picker (rasm yuklash)
- Expo SecureStore (tokenlar)
- Expo Location (joylashuv)
```

#### Ekranlar
```
(Auth Stack)
  LoginScreen
  RegisterScreen
  VerifyEmailScreen
  ForgotPasswordScreen

(Main Tab Navigator)
  HomeScreen
  EstimateScreen
  PropertiesScreen
  MapScreen
  ProfileScreen

(Modal/Stack)
  PropertyDetailScreen
  PropertyCreateScreen
  AnalyticsScreen
  SettingsScreen
  LanguageScreen
```

### 4.4 Ma'lumotlar Bazasi

#### Asosiy jadvallar

```sql
-- Foydalanuvchilar
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  phone VARCHAR UNIQUE,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  password_hash VARCHAR NOT NULL,
  avatar_url VARCHAR,
  role ENUM('user', 'admin', 'agent') DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  is_email_verified BOOLEAN DEFAULT false,
  is_phone_verified BOOLEAN DEFAULT false,
  language ENUM('uz', 'ru', 'en') DEFAULT 'uz',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Tokenlar
refresh_tokens (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Tumanlar
districts (
  id SERIAL PRIMARY KEY,
  name_uz VARCHAR NOT NULL,
  name_ru VARCHAR NOT NULL,
  name_en VARCHAR NOT NULL,
  code VARCHAR UNIQUE NOT NULL,
  avg_price_usd DECIMAL,
  avg_price_per_sqm DECIMAL,
  polygon_coords JSONB,
  center_lat DECIMAL,
  center_lng DECIMAL,
  population INTEGER,
  area_km2 DECIMAL
)

-- Ko'chmas mulklar
properties (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  district_id INTEGER REFERENCES districts(id),
  property_type ENUM('apartment', 'house', 'commercial') NOT NULL,
  deal_type ENUM('sale', 'rent') NOT NULL,
  building_type ENUM('new', 'old', 'panel', 'brick', 'monolith') NOT NULL,
  title_uz VARCHAR,
  title_ru VARCHAR,
  title_en VARCHAR,
  description_uz TEXT,
  description_ru TEXT,
  description_en TEXT,
  area_total DECIMAL NOT NULL,
  area_living DECIMAL,
  area_kitchen DECIMAL,
  rooms INTEGER NOT NULL,
  floor INTEGER NOT NULL,
  total_floors INTEGER NOT NULL,
  repair_status ENUM('euro', 'good', 'average', 'needs_repair', 'without_repair') NOT NULL,
  furniture ENUM('full', 'partial', 'none') DEFAULT 'none',
  heating ENUM('central', 'gas', 'electric', 'none') DEFAULT 'central',
  has_elevator BOOLEAN DEFAULT false,
  has_parking BOOLEAN DEFAULT false,
  has_balcony BOOLEAN DEFAULT false,
  has_internet BOOLEAN DEFAULT true,
  price_usd DECIMAL NOT NULL,
  price_uzs DECIMAL NOT NULL,
  is_negotiable BOOLEAN DEFAULT true,
  address VARCHAR,
  latitude DECIMAL,
  longitude DECIMAL,
  status ENUM('active', 'sold', 'rented', 'inactive', 'moderation') DEFAULT 'moderation',
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
)

-- Mulk rasmlari
property_images (
  id UUID PRIMARY KEY,
  property_id UUID REFERENCES properties(id),
  url VARCHAR NOT NULL,
  is_main BOOLEAN DEFAULT false,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Narx bashoratlar
predictions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  district_id INTEGER REFERENCES districts(id),
  input_params JSONB NOT NULL,
  predicted_price_usd DECIMAL NOT NULL,
  price_min_usd DECIMAL NOT NULL,
  price_max_usd DECIMAL NOT NULL,
  confidence_score DECIMAL NOT NULL,
  model_version VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- Sevimlilar
favorites (
  user_id UUID REFERENCES users(id),
  property_id UUID REFERENCES properties(id),
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, property_id)
)

-- Narx tarixi
price_history (
  id SERIAL PRIMARY KEY,
  district_id INTEGER REFERENCES districts(id),
  avg_price_usd DECIMAL NOT NULL,
  avg_price_per_sqm DECIMAL NOT NULL,
  total_listings INTEGER NOT NULL,
  month DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
)

-- OTP kodlar
otp_codes (
  id UUID PRIMARY KEY,
  target VARCHAR NOT NULL,
  code VARCHAR(6) NOT NULL,
  type ENUM('email', 'sms') NOT NULL,
  purpose ENUM('verify', 'reset') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  is_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
)
```

---

## 5. KO'P TILLILIK (i18n)

### 5.1 Qo'llab-quvvatlanadigan tillar

| Kod | Til | Yo'nalish |
|-----|-----|----------|
| `uz` | O'zbek tili | LTR |
| `ru` | Rus tili | LTR |
| `en` | Ingliz tili | LTR |

### 5.2 Amalga oshirish
- Til tanlash: Header dropdown / Profil sozlamalari / Ilovada sozlamalar ekrani
- Standart til: O'zbek (`uz`)
- Brauzer tili aniqlanadi va taklif qilinadi
- Til sozlamalari localStorage va foydalanuvchi profilida saqlanadi
- Barcha matnlar JSON fayllarida (locales/)
- Raqam va valyuta formati: `Intl.NumberFormat` orqali
- Sana formati: har til uchun mos format

---

## 6. BILDIRISHNOMALAR (Notifications)

### 6.1 Email bildirishnomalar (SMTP/SendGrid)
| Hodisa | Email |
|--------|-------|
| Ro'yxatdan o'tish | Xush kelibsiz + email tasdiqlash |
| Email tasdiqlash | OTP kod |
| Parolni tiklash | Tiklash havolasi |
| Yangi e'lon qabul qilindi | Tasdiq |
| E'lon tasdiqlandi | Xabarnoma |
| Sevimli e'londa narx o'zgardi | Narx bildirishnomasi |
| Kirish yangi qurilmadan | Xavfsizlik ogohlantirishi |

### 6.2 SMS bildirishnomalar (Eskiz.uz API)
| Hodisa | SMS |
|--------|-----|
| Ro'yxatdan o'tish | Telefon tasdiqlash OTP |
| Parolni tiklash | OTP kod |
| Kirish (ixtiyoriy) | Tasdiqlash kodi |

### 6.3 Push bildirishnomalar (Mobile)
- Expo Notifications
- FCM (Firebase Cloud Messaging)
- Yangi mos e'lonlar
- Narx o'zgarishlari
- Admin xabarlari

---

## 7. XAVFSIZLIK TALABLARI

- **HTTPS** — Barcha aloqa shifrlangan
- **JWT** — Access token (30 daqiqa) + Refresh token (30 kun)
- **Password hashing** — bcrypt (cost factor 12)
- **Rate limiting** — IP asosida cheklash (Nginx/FastAPI)
- **CORS** — Faqat ruxsat etilgan domenlar
- **SQL Injection** — SQLAlchemy ORM + parameterized queries
- **XSS** — Content Security Policy, input sanitization
- **File upload** — Tur tekshirish, antivirus skan, AWS S3
- **Brute force** — Login urinishlar cheklovi
- **Audit log** — Muhim harakatlar jurnali
- **Env variables** — Sirlar .env faylida, never in code
- **OWASP Top 10** — Barcha zaifliklar hisobga olinadi

---

## 8. ML MODEL TAVSIFI

### 8.1 Ma'lumotlar (Toshkent shahri)

**Manba tumanlar** (12 ta):
1. Yunusobod — elita hudud, $1,200-2,500/m²
2. Mirzo Ulugbek — o'rta-yuqori, $900-1,600/m²
3. Yakkasaroy — shahar markazi, $1,000-2,000/m²
4. Mirobod — biznes hudud, $1,000-1,800/m²
5. Shayxontohur — markaziy, $800-1,400/m²
6. Chilonzor — keng, $700-1,300/m²
7. Almazar — aralash, $700-1,200/m²
8. Olmazor — o'rta, $650-1,100/m²
9. Uchtepa — o'rta, $600-1,000/m²
10. Yashnobod — o'rta-past, $600-950/m²
11. Sergeli — chegara, $500-900/m²
12. Bektemir — sanoat, $450-800/m²

**Features (belgilar)**:
- district_encoded (Location label encoding)
- area_total (umumiy maydon m²)
- area_per_room (maydon/xonalar)
- rooms (xonalar soni)
- floor (qavat)
- floor_ratio (qavat/umumiy_qavat)
- is_top_floor (tepa qavat)
- is_ground_floor (birinchi qavat)
- building_type_encoded
- repair_encoded
- has_elevator
- has_parking
- total_floors
- age_factor (yangi bino/eski)

**Maqsad o'zgaruvchi**: price_usd

### 8.2 Model Arxitekturasi
```
Ensemble Method:
1. XGBoost Regressor (weight: 0.5)
2. Random Forest Regressor (weight: 0.3)
3. Gradient Boosting Regressor (weight: 0.2)

Final prediction: weighted average

Hyperparameters (XGBoost):
- n_estimators: 500
- max_depth: 6
- learning_rate: 0.05
- subsample: 0.8
- colsample_bytree: 0.8

Cross-validation: K-Fold (k=5)
Maqsadli metriklar:
- R² ≥ 0.85
- MAPE ≤ 15%
- RMSE ≤ 15,000 USD
```

---

## 9. UI/UX TALABLAR

### 9.1 Dizayn tizimi
- **Rang palitri**: Ko'k (#1E40AF) — birlamchi, Yashil (#059669) — muvaffaqiyat
- **Shrift**: Inter (web), System font (mobile)
- **Ikonlar**: Lucide React (web), Expo Icons (mobile)
- **Responsiv**: Mobile-first, Tailwind breakpoints
- **Dark mode**: Ixtiyoriy (v2)

### 9.2 Asosiy sahifalar maketi
```
Bosh sahifa:
  [Hero — Toshkent ko'rinishi + Qidirish qutisi]
  [Tez narx baholash formasi]
  [So'nggi e'lonlar (6 ta)]
  [Tumanlar bo'yicha narxlar xaritasi]
  [Statistika: 10,000+ e'lon, 12 tuman, 95% aniqlik]
  [Qanday ishlaydi (3 qadam)]
  [Foydalanuvchi sharhlari]
  [Footer]

Narx baholash sahifasi:
  [2-ustunli form]
  [Chap: parametrlar kiritish]
  [O'ng: real-time natija ko'rsatish]
  [Natija: narx, diapazon, grafiklar]
  [O'xshash mulklar]

E'lonlar sahifasi:
  [Chap: filterlar paneli]
  [O'ng: karta/ro'yxat ko'rinish toggle]
  [Pagination]
```

---

## 10. ISHLASH TALABLARI (Performance)

| Ko'rsatkich | Maqsad |
|-------------|--------|
| Sahifa yuklash vaqti | < 2 sekund |
| ML bashorat javob vaqti | < 500ms |
| API javob vaqti | < 200ms (95-percentile) |
| Availability (uptime) | > 99.5% |
| Bir vaqtda foydalanuvchilar | 500+ |
| Ma'lumotlar bazasi query | < 100ms |
| Mobil app ishga tushish | < 3 sekund |

---

## 11. DEPLOY ARXITEKTURASI

```
Internet
    │
    ▼
[Cloudflare CDN]
    │
    ▼
[Nginx (Reverse Proxy + SSL)]
    │
    ├── /api      → FastAPI (Uvicorn, 4 workers)
    ├── /         → Next.js (SSR)
    └── /static   → Static files
    
[PostgreSQL 15]  ←→  [Redis 7]
    
[Celery Workers]  ←→  [Redis (Broker)]
    
[AWS S3]  (rasmlar)
[SendGrid]  (email)
[Eskiz.uz]  (SMS)
[Firebase]  (push notifications)

Mobile:
  [Expo EAS Build]
  [App Store / Google Play]
```

### Docker Compose xizmatlari
```yaml
services:
  - api (FastAPI)
  - worker (Celery)
  - db (PostgreSQL)
  - redis (Redis)
  - nginx (Nginx)
  - frontend (Next.js)
```

---

## 12. LOYIHA BOSQICHLARI (Timeline)

| Bosqich | Vazifalar | Muddat |
|---------|-----------|--------|
| **Bosqich 1** | TZ, Arxitektura, DB dizayn | 1 hafta |
| **Bosqich 2** | Backend: Auth, Users, API | 2 hafta |
| **Bosqich 3** | ML model yaratish va o'qitish | 1 hafta |
| **Bosqich 4** | Web frontend: UI, i18n | 2 hafta |
| **Bosqich 5** | Mobile app | 2 hafta |
| **Bosqich 6** | Email/SMS integratsiya | 3 kun |
| **Bosqich 7** | Test, Bug fix, Deploy | 1 hafta |
| **Jami** | | **~10 hafta** |

---

## 13. TEST TALABLARI

### 13.1 Unit testlar (pytest)
- Auth service: login, register, token refresh
- ML model: prediction accuracy, edge cases
- API endpoints: barcha route lar

### 13.2 Integration testlar
- Email/SMS yuborish
- Ma'lumotlar bazasi operatsiyalari
- ML model → API pipeline

### 13.3 E2E testlar (Playwright)
- Ro'yxatdan o'tish oqimi
- Narx baholash oqimi
- E'lon berish oqimi

### 13.4 Load testing (Locust)
- 500 concurrent user
- 1000 request/minute

---

## 14. QABUL MEZONLARI (Acceptance Criteria)

✅ Foydalanuvchi 3 tilda ro'yxatdan o'ta oladi  
✅ Email tasdiqlash ishlaydi  
✅ SMS OTP Toshkent raqamlariga yetib boradi  
✅ ML model R² ≥ 0.85 ko'rsatkichga ega  
✅ Narx baholash < 500ms da ishlaydi  
✅ Barcha 12 Toshkent tumani qo'llab-quvvatlanadi  
✅ Web sahifa mobil qurilmalarda ishlaydi  
✅ Mobil app iOS va Android da ishlaydi  
✅ 3 til to'liq ishlaydi (uz/ru/en)  
✅ JWT autentifikatsiya xavfsiz ishlaydi  
✅ Admin panel foydalanuvchilarni boshqarishi mumkin  

---

*Hujjat: UzEstate TZ v1.0 | 2026 yil*
