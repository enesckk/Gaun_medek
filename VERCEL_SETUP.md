# Vercel Deployment Setup

## ⚠️ ÖNEMLİ: Backend'i api/backend/ içine kopyalayın

Vercel deployment için backend klasörünün `api/backend/` içinde olması gerekiyor.

### Manuel Kopyalama (Önerilen)

**Windows:**
```powershell
xcopy /E /I /Y backend api\backend
```

**Linux/Mac:**
```bash
cp -r backend api/backend
```

### Otomatik Kopyalama Script'i

Alternatif olarak, `api/copy-backend.js` script'ini çalıştırabilirsiniz (eğer oluşturulduysa).

## Dosya Yapısı

Deployment sonrası yapı şöyle olmalı:

```
api/
  ├── index.js          ✅ (Vercel serverless function wrapper)
  ├── package.json      ✅ (Dependencies)
  └── backend/          ✅ (Backend klasörü - KOPYALANMALI)
      ├── server.js
      ├── routes/
      ├── controllers/
      ├── models/
      └── ...
```

## Vercel Environment Variables

Vercel Dashboard'da şu environment variables'ları ekleyin:

- `MONGODB_URI` - MongoDB connection string
- `MONGODB_DB` - Database name (opsiyonel, default: "mudek")
- `GEMINI_API_KEY` - Gemini API key
- `VERCEL=1` - Otomatik set edilir

## Deployment

1. Backend'i `api/backend/` içine kopyalayın
2. Commit ve push yapın
3. Vercel otomatik deploy edecek

## Notlar

- Root'taki `backend/` klasörü lokal development için kalır
- Vercel sadece `api/` klasöründeki dosyaları deploy eder
- `api/backend/` klasörü Git'e commit edilebilir (veya `.gitignore`'a eklenebilir)


