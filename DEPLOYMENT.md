# Vercel Deployment Guide

## 🎯 Önerilen Yöntem: Ayrı Deploy

Backend ve Frontend'i **ayrı Vercel projeleri** olarak deploy edin.

---

## 📦 Backend Deployment

### 1. Vercel'de Yeni Proje Oluştur

1. Vercel Dashboard → **New Project**
2. Repository'yi seçin
3. **Project Settings:**
   - **Framework Preset:** Other
   - **Root Directory:** `backend`
   - **Build Command:** (boş bırakın veya `npm install`)
   - **Output Directory:** (boş bırakın)
   - **Install Command:** `npm install`

### 2. Environment Variables (Backend)

Vercel Dashboard → Settings → Environment Variables:

```env
MONGODB_URI=mongodb+srv://[username]:[password]@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB=mudek
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

### 3. Backend URL'ini Not Edin

Deploy sonrası backend URL'iniz: `https://your-backend.vercel.app`

---

## 🎨 Frontend Deployment

### 1. Vercel'de Yeni Proje Oluştur

1. Vercel Dashboard → **New Project**
2. Aynı repository'yi seçin
3. **Project Settings:**
   - **Framework Preset:** Next.js
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build` (otomatik)
   - **Output Directory:** `.next` (otomatik)
   - **Install Command:** `npm install` (otomatik)

### 2. Environment Variables (Frontend)

Vercel Dashboard → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.vercel.app/api
```

**ÖNEMLİ:** `NEXT_PUBLIC_` prefix'i olmalı (Next.js client-side env variable'ları için)

### 3. Deploy

Frontend otomatik olarak deploy edilecek.

---

## 🔄 Monorepo Deploy (Alternatif)

Eğer tek proje olarak deploy etmek isterseniz:

### 1. Root'ta Deploy

- **Root Directory:** `.` (root)
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/.next`

### 2. Environment Variables (Hepsi Aynı Yerde)

```env
# Backend
MONGODB_URI=mongodb+srv://...
MONGODB_DB=mudek
GEMINI_API_KEY=...
PORT=5000

# Frontend
NEXT_PUBLIC_API_BASE_URL=https://your-app.vercel.app/api
```

### 3. vercel.json

Root'ta `vercel.json` dosyası olmalı (zaten var).

---

## ✅ Test

### Backend Test
```bash
curl https://your-backend.vercel.app/api/health
# Beklenen: {"status":"OK"}
```

### Frontend Test
- Tarayıcıda `https://your-frontend.vercel.app` açın
- Network tab'ında API çağrılarını kontrol edin

---

## 🚨 Sorun Giderme

### 404 Hatası
- Backend URL'i doğru mu? (`NEXT_PUBLIC_API_BASE_URL`)
- CORS ayarları kontrol edin (backend'de)

### Environment Variable Hatası
- `NEXT_PUBLIC_` prefix'i var mı? (frontend için)
- Vercel'de env variable'lar deploy edildi mi?
- Redeploy gerekebilir

### MongoDB Bağlantı Hatası
- `MONGODB_URI` doğru mu?
- MongoDB Atlas Network Access'te IP whitelist var mı?
- `MONGODB_DB` doğru mu?

