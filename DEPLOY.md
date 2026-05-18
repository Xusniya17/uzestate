# UzEstate — Deployment Yo'riqnomasi

## Variant A: Ngrok (Tez demo, 5 daqiqa)

### 1. Ngrok o'rnatish
https://ngrok.com/download → Windows yuklab oling → ZIP ochib, `ngrok.exe` ni C:\Windows\ ga qo'ying

### 2. Ngrok token olish
https://dashboard.ngrok.com/signup → Bepul hisob → Auth token nusxa oling

### 3. Token sozlash
```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### 4. Backend va Frontend ishga tushiring (odatdagidek)
```powershell
# 1-oyna
cd C:\Users\user\house-price-uz\backend
python -m uvicorn app.main:app --reload --port 8000

# 2-oyna
cd C:\Users\user\house-price-uz\frontend
npm run dev
```

### 5. Ngrok tunnel ochish (3-oyna)
```powershell
# Backend uchun
ngrok http 8000
# Chiqgan https://xxxx.ngrok.io linkni nusxa oling
```

```powershell
# Frontend uchun (4-oyna)
ngrok http 3000
# Bu link boshqalarga bering
```

### Natija
- Frontend: `https://xxxx.ngrok.io` — boshqalarga bu linkni bering
- Backend: `https://yyyy.ngrok.io` — frontend .env.local da o'zgartiring

---

## Variant B: Render + Vercel (Doimiy, bepul)

### 1-QADAM: GitHub ga yuklash

```powershell
cd C:\Users\user\house-price-uz
git init
git add .
git commit -m "UzEstate - diploma project"
```

GitHub.com da yangi repo yarating → keyin:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/uzestate.git
git push -u origin main
```

---

### 2-QADAM: Backend — Render.com

1. **render.com** ga boring → "Get Started for Free"
2. GitHub bilan kiring
3. "New +" → "Web Service"
4. GitHub repo ni tanlang
5. **Root Directory**: `backend`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
8. **Plan**: Free

**Environment Variables qo'shing** (Settings → Environment):
```
SECRET_KEY = uzestate-production-secret-key-very-long-random-string-here
APP_ENV = production
DEBUG = false
```

**PostgreSQL qo'shish**:
- "New +" → "PostgreSQL"
- Ismi: `uzestate-db`
- Plan: Free
- Yaratib bo'lgach, **Internal Database URL** ni nusxa oling

Backend Environment ga qo'shing:
```
DATABASE_URL = postgresql://... (nusxa olgan URL)
FRONTEND_URL = https://uzestate.vercel.app
```

**Deploy tugmasini bosing** → 5-10 daqiqa kutish

Backend URL: `https://uzestate-api.onrender.com`

---

### 3-QADAM: Frontend — Vercel.com

1. **vercel.com** ga boring → "Start Deploying"
2. GitHub bilan kiring
3. Repo ni tanlang
4. **Root Directory**: `frontend`
5. **Framework**: Next.js (avtomatik aniqlanadi)

**Environment Variables qo'shing**:
```
NEXT_PUBLIC_API_URL = https://uzestate-api.onrender.com/v1
```

6. "Deploy" tugmasini bosing

Frontend URL: `https://uzestate.vercel.app`

---

### 4-QADAM: Backend CORS ni yangilash

Backend Render dashboard → Environment Variables:
```
FRONTEND_URL = https://uzestate.vercel.app
```

Keyin backend `app/main.py` da CORS ga Vercel URL qo'shilgan (allaqachon FRONTEND_URL dan oladi).

---

## Bepul plan cheklovlari

| Xizmat | Cheklov |
|--------|---------|
| Render Web Service | 750 soat/oy (yetarli) |
| Render PostgreSQL | 90 kun bepul |
| Vercel | Cheksiz (Next.js uchun) |

### Muhim: Render free plan 15 daqiqa faolsizlikdan keyin uxlaydi.
Birinchi so'rov 30-60 soniya kutishi mumkin.

---

## Muammolar

**Backend ishlamasa:**
- Render dashboard → Logs ni tekshiring
- `DATABASE_URL` to'g'ri kiritilganmi?

**Frontend API ga ulanmasa:**
- `NEXT_PUBLIC_API_URL` to'g'ri kiritilganmi?
- Backend CORS da frontend URL bormi?

**CORS xatosi:**
- `app/main.py` da `allow_origins` ga Vercel URL qo'shing
