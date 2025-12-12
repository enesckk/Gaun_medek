# Vercel Deployment Guide - Tek Proje

Bu proje Vercel'de **tek proje** olarak deploy edilir. Frontend ve backend aynı domain'de çalışır.

## 🚀 Deployment Adımları

### 1. Vercel'de Proje Oluşturma

1. [Vercel Dashboard](https://vercel.com/dashboard) → **Add New Project**
2. GitHub repository'nizi seçin
3. **Root Directory**: (boş bırakın veya `.`)
4. **Framework Preset**: Next.js (otomatik algılanacak)

### 2. Build Settings

Vercel otomatik olarak algılayacak, ama manuel ayarlamak isterseniz:

- **Build Command**: `cd frontend && npm install && npm run build`
- **Output Directory**: `frontend/.next`
- **Install Command**: `npm install && cd backend && npm install && cd ../frontend && npm install`

### 3. Environment Variables

Vercel Dashboard → Settings → Environment Variables → **Add**:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=mudek
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
NODE_ENV=production
```

**Önemli**: 
- `MONGODB_URI` MongoDB Atlas connection string (database adı olmadan)
- `MONGODB_DB` ayrı bir variable olarak `mudek` değeri
- `GEMINI_API_KEY` Gemini API key'iniz

### 4. Deploy

1. **Deploy** butonuna tıklayın
2. Build loglarını kontrol edin
3. Deploy tamamlandığında URL'yi test edin

## 📋 Test Endpoints

Deploy sonrası şu URL'leri test edin:

- Frontend: `https://your-app.vercel.app`
- API Health: `https://your-app.vercel.app/api/health`
- API Courses: `https://your-app.vercel.app/api/courses`

## 🔧 Yapılandırma Detayları

### `vercel.json`

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

### API Routing

- Tüm `/api/*` istekleri → `api/index.js` (Express backend)
- Diğer tüm istekler → `frontend/` (Next.js app)

### Frontend API Client

Frontend otomatik olarak aynı domain'deki `/api` endpoint'ini kullanır:
- Production: `/api` (relative path)
- Development: `http://localhost:5000/api`

## ⚠️ Önemli Notlar

1. **MongoDB Atlas**: 
   - Network Access'te `0.0.0.0/0` (tüm IP'ler) ekleyin
   - Database User'ın read/write yetkisi olduğundan emin olun

2. **File Uploads**: 
   - Vercel serverless functions'da geçici dosyalar `/tmp` klasörüne yazılır
   - Backend'deki `temp/` klasörü Vercel'de `/tmp` olarak çalışır

3. **Environment Variables**:
   - `.env` dosyası Git'e push edilmez (`.gitignore`'da)
   - Tüm environment variables Vercel Dashboard'dan eklenmelidir

4. **Build Timeout**:
   - İlk deploy biraz uzun sürebilir (backend dependencies)
   - Timeout hatası alırsanız Vercel Pro plan'a geçin

## 🐛 Sorun Giderme

### 404 NOT_FOUND Hatası

1. `vercel.json` dosyasının root'ta olduğundan emin olun
2. `api/index.js` dosyasının mevcut olduğundan emin olun
3. Vercel Dashboard → Deployments → Build Logs'u kontrol edin

### MongoDB Connection Error

1. `MONGODB_URI` environment variable'ının doğru olduğundan emin olun
2. MongoDB Atlas Network Access'te IP whitelist kontrol edin
3. Connection string'de özel karakterler URL-encoded olmalı

### API Endpoints Çalışmıyor

1. Vercel Dashboard → Functions sekmesinde `api/index.js` görünüyor mu?
2. Browser console'da network errors var mı?
3. `/api/health` endpoint'ini test edin

## 📚 Daha Fazla Bilgi

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Next.js Deployment](https://nextjs.org/docs/deployment)




