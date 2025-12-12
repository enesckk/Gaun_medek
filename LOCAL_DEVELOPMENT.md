# Local Development Setup

## 🔧 Sorun: 404 Hatası

Local development'ta API endpoint'leri 404 veriyor çünkü:
1. **Backend çalışmıyor** veya
2. **Frontend yanlış URL'e istek atıyor**

## ✅ Çözüm

### 1. Backend .env Dosyası

`backend/.env` dosyası oluşturun veya kontrol edin:

```env
MONGODB_URI=mongodb://localhost:27017/mudek
# veya MongoDB Atlas için:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=mudek
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

**Önemli:** Local development için MongoDB URI gereklidir!

### 2. Frontend .env.local Dosyası (Opsiyonel)

`frontend/.env.local` dosyası oluşturun:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Veya `apiClient.ts` otomatik olarak local'de `http://localhost:5000/api` kullanacak.

### 3. Backend'i Başlatın

Terminal 1 (Backend):
```bash
cd backend
npm install
npm run dev
```

Backend `http://localhost:5000` adresinde çalışmalı.

### 4. Frontend'i Başlatın

Terminal 2 (Frontend):
```bash
cd frontend
npm install
npm run dev
```

Frontend `http://localhost:3000` adresinde çalışacak.

### 5. Test

- Backend health: http://localhost:5000/api/health
- Frontend: http://localhost:3000

## 🎯 API URL Yapılandırması

### Local Development:
- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:3000`
- **API URL**: `http://localhost:5000/api`

### Production (Vercel):
- **Frontend + Backend**: Aynı domain'de
- **API URL**: `/api` (relative path)

`apiClient.ts` otomatik olarak environment'a göre doğru URL'i kullanır:
- `NODE_ENV === 'production'` → `/api`
- `NODE_ENV === 'development'` → `http://localhost:5000/api`

## ⚠️ Önemli Notlar

1. **Local'de backend mutlaka çalışmalı**
2. **MongoDB URI `.env` dosyasında olmalı**
3. **Backend port 5000'de çalışmalı**
4. **Frontend otomatik olarak `http://localhost:5000/api` kullanacak**

## 🐛 Sorun Giderme

### Backend çalışmıyor:
```bash
cd backend
npm install
npm run dev
```

### MongoDB bağlantı hatası:
- `.env` dosyasında `MONGODB_URI` kontrol edin
- MongoDB servisinin çalıştığından emin olun
- MongoDB Atlas kullanıyorsanız, IP whitelist kontrol edin

### 404 hatası:
- Backend'in çalıştığını kontrol edin: `http://localhost:5000/api/health`
- Browser console'da network tab'ını kontrol edin
- API URL'in doğru olduğunu kontrol edin


