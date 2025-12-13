# Ayrı Deploy Yapılandırması

## 📋 Genel Bakış

- **Frontend**: Vercel'de deploy edilir
- **Backend**: Render'da deploy edilir

## 🚀 Frontend Deployment (Vercel)

### 1. Vercel Projesi Oluştur

1. Vercel Dashboard'a git
2. "New Project" butonuna tıkla
3. GitHub repo'yu seç
4. **Root Directory**: `frontend` olarak ayarla
5. Framework Preset: Next.js

### 2. Environment Variables (Vercel)

Vercel Dashboard → Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
```

**Önemli:** `NEXT_PUBLIC_` prefix'i gerekli (Next.js client-side'da kullanılacak)

### 3. Deploy

Vercel otomatik deploy edecek. `vercel.json` sadece frontend için yapılandırıldı.

---

## 🔧 Backend Deployment (Render)

### 1. Render Projesi Oluştur

1. Render Dashboard'a git
2. "New +" → "Web Service"
3. GitHub repo'yu bağla
4. Ayarlar:
   - **Name**: `gaun-mudek-backend`
   - **Environment**: Node
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

### 2. Environment Variables (Render)

Render Dashboard → Environment:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
MONGODB_DB=mudek
GEMINI_API_KEY=your-api-key
FRONTEND_URL=https://your-frontend.vercel.app
```

### 3. Deploy

Render otomatik deploy edecek.

---

## 🔗 CORS Yapılandırması

Backend'de CORS yapılandırması `backend/server.js` içinde yapıldı:

- Vercel frontend URL'i otomatik allow ediliyor
- `FRONTEND_URL` environment variable ile kontrol ediliyor
- Local development için `localhost:3000` ve `localhost:3001` allow edildi

---

## 📝 Environment Variables Özeti

### Frontend (Vercel)
```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
```

### Backend (Render)
```
NODE_ENV=production
MONGODB_URI=mongodb+srv://...
MONGODB_DB=mudek
GEMINI_API_KEY=your-api-key
FRONTEND_URL=https://your-frontend.vercel.app
```

---

## ✅ Dosya Yapısı

```
Gaun_mudek-/
├── frontend/           # Vercel'de deploy edilir
│   ├── package.json
│   └── ...
├── backend/            # Render'da deploy edilir
│   ├── server.js
│   ├── package.json
│   └── ...
├── render.yaml         # Render yapılandırması
├── vercel.json         # Sadece frontend için
└── ...
```

---

## 🐛 Sorun Giderme

### Frontend Backend'e Bağlanamıyor

1. `NEXT_PUBLIC_API_BASE_URL` doğru mu kontrol et
2. Backend Render'da çalışıyor mu kontrol et
3. CORS hatası alıyorsan, `FRONTEND_URL` backend environment variable'ında doğru mu kontrol et

### Backend MongoDB'ye Bağlanamıyor

1. `MONGODB_URI` doğru mu kontrol et
2. MongoDB Atlas Network Access'te Render IP'leri allow edildi mi kontrol et

