# UzEstate — Real Estate Price Estimation System

**Independent Project:** House Price Estimation Model for the Real Estate Market in Uzbekistan
**Coverage:** Uzbekistan's real estate market (current data covers districts of Tashkent city)
**Languages:** Uzbek 🇺🇿 | Russian 🇷🇺 | English 🇬🇧

---

## Project Structure

```
house-price-uz/
├── docs/           # Specifications and documentation
├── backend/        # Python FastAPI backend + ML model
├── frontend/       # Next.js web application
├── mobile/         # React Native mobile application
├── nginx/          # Nginx configuration
└── docker-compose.yml
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Python 3.11, FastAPI, SQLAlchemy |
| ML Model | XGBoost, Random Forest, Gradient Boosting (scikit-learn) |
| Database | PostgreSQL (prod) / SQLite (dev) |
| Web Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query |
| Mobile | React Native (Expo) |
| Auth | JWT (access + refresh tokens) |
| Email / SMS | SMTP (aiosmtplib) / Eskiz.uz API |
| Deploy | Vercel (web), Render (API + model), Docker Compose |

---

## Getting Started

### 1. Backend (local)

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # fill in .env

# Train the ML model
python -m app.ml.train

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Web Frontend (local)

```bash
cd frontend
npm install
# Create a .env.local file:
# NEXT_PUBLIC_API_URL=http://localhost:8000/v1
npm run dev
```

Web: http://localhost:3000

### 3. Mobile App

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with the Expo Go app.

### 4. Docker Compose (full stack)

```bash
# Configure the .env file
cp backend/.env.example backend/.env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
```

Web: http://localhost
API: http://localhost/v1
Docs: http://localhost/docs

---

## Live Deployment

- **Website:** https://uzestate.vercel.app
- **API:** https://uzestate-api.onrender.com/v1
- **API docs:** https://uzestate-api.onrender.com/docs

---

## API Endpoints

```
POST /v1/auth/register          — Register
POST /v1/auth/verify-email      — Verify email (OTP)
POST /v1/auth/login             — Log in
POST /v1/auth/refresh           — Refresh token
POST /v1/auth/logout            — Log out
POST /v1/auth/forgot-password   — Reset password
POST /v1/auth/send-sms-otp      — Send SMS code
POST /v1/auth/verify-phone      — Verify phone

GET  /v1/users/me               — Get profile
PUT  /v1/users/me               — Update profile

GET  /v1/properties             — List of listings
POST /v1/properties             — Create a listing
GET  /v1/properties/{id}        — Listing details
GET  /v1/properties/districts   — List of districts

POST /v1/predictions/estimate   — Price estimation (ML)
GET  /v1/predictions/history    — Estimation history

GET  /v1/analytics/market-overview  — Market statistics
GET  /v1/analytics/price-trends     — Price dynamics
```

---

## Database

- **Type:** relational (SQL)
- **Production:** PostgreSQL
- **Development:** SQLite
- **ORM:** SQLAlchemy
- **Migrations:** Alembic

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Users (with roles) |
| `refresh_tokens` | JWT refresh tokens |
| `otp_codes` | Email/SMS verification codes |
| `districts` | Tashkent districts (reference data) |
| `properties` | Real estate listings (sale/rent) |
| `property_images` | Listing images |
| `favorites` | User's saved listings |
| `price_history` | Price change history |
| `predictions` | ML estimation request results |

---

## ML Model

- **Algorithm:** Ensemble — XGBoost (50%) + Random Forest (30%) + Gradient Boosting (20%), `VotingRegressor`
- **Target variable:** trained on `log(1 + price)` (to stabilise the wide price range)
- **Dataset:** 2,200 raw listings collected → **1,542** records after cleaning and validation
- **Split:** 80% train / 20% test, with 5-fold cross-validation on the training set
- **14 features:** `district_id`, `area_total`, `area_per_room`, `rooms`, `floor`, `total_floors`, `floor_ratio`, `is_top_floor`, `is_ground_floor`, `has_elevator`, `has_parking`, `has_balcony`, `building_type_encoded`, `repair_status_encoded`

### Results (on the test set)

| Metric | Value |
|--------|-------|
| R² | 0.80 |
| RMSE | $25,062 |
| MAE | $15,072 |
| MAPE | 17.82% |
| Cross-val R² | 0.80 ± 0.03 |

> **Note:** the mean error is ~18% (MAPE) — the model provides a guiding estimate of price, not a formal appraisal.

### Average prices by district (per m², USD — current platform data)

| District | Price per m² (USD) |
|----------|--------------------|
| Shaykhantakhur | $2,726 |
| Mirobod | $1,666 |
| Yakkasaray | $1,256 |
| Yashnobod | $1,104 |
| Mirzo Ulugbek | $1,008 |
| Chilanzar | $979 |
| Yunusabad | $899 |
| Bektemir | $648 |
| Sergeli | $580 |
| Almazar | $544 |

---

## Limitations

- The dataset is modest (1,542 records) and skewed toward Tashkent districts.
- Rental prices are estimated from sale prices using a yield assumption — not directly collected rental data.
- Listing photos are illustrative stock images, not photos of the specific apartments.
- There is no time dimension — the model captures a snapshot, not market trends.

---

## Author

**Independent Project** — House Price Estimation Model for the Real Estate Market in Uzbekistan
**Student:** Xusniya Turdiqulova
**University:** PDP University — Faculty of Software Development and Programming
**Year:** 2026
