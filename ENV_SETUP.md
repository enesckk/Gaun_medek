# Environment Variables Setup

## 📁 Dosya Yapısı

### 1. Local Development (`backend/.env`)
**Bu dosya local development için kullanılır ve Git'e push edilmez.**

```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/mudekdb
MONGODB_DB=mudek
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Production (Vercel Environment Variables)
**Bu değerler Vercel Dashboard > Settings > Environment Variables'dan ayarlanır.**

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=mudek
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
```

---

## 🔧 Local Development Setup

### Adım 1: .env Dosyası Oluştur

`backend/` klasöründe `.env` dosyası oluşturun:

```bash
cd backend
# .env.example dosyasını kopyalayın
copy .env.example .env
# veya manuel olarak oluşturun
```

### Adım 2: Değerleri Doldurun

```env
# Local MongoDB (lokalinizde MongoDB çalışıyorsa)
MONGODB_URI=mongodb://localhost:27017/mudekdb

# Veya MongoDB Atlas kullanmak isterseniz (local'de de)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/

MONGODB_DB=mudek
PORT=5000
GEMINI_API_KEY=your_actual_gemini_api_key
```

### Adım 3: MongoDB Seçenekleri

#### Seçenek A: Local MongoDB
```env
MONGODB_URI=mongodb://localhost:27017/mudekdb
```
- MongoDB'nin lokal bilgisayarınızda çalışması gerekir
- MongoDB Community Server kurulu olmalı

#### Seçenek B: MongoDB Atlas (Her İkisinde de)
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
```
- Local development'ta da MongoDB Atlas kullanabilirsiniz
- İnternet bağlantısı gerektirir

---

## 🚀 Vercel Production Setup

### Vercel Dashboard'da Environment Variables

1. Vercel Dashboard > Projeniz > Settings > Environment Variables
2. Şu değişkenleri ekleyin:

| Name | Value | Environment |
|------|-------|-------------|
| `MONGODB_URI` | `mongodb+srv://username:password@cluster.mongodb.net/` | Production, Preview |
| `MONGODB_DB` | `mudek` | Production, Preview |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Production, Preview |
| `PORT` | `5000` | Production, Preview |
| `NODE_ENV` | `production` | Production |

**Önemli:** 
- Vercel'de `MONGODB_URI` MongoDB Atlas olmalı (local MongoDB'ye erişemez)
- Connection string'de database adı olmadan (sadece cluster URL)

---

## 📊 Karşılaştırma

| Özellik | Local (.env) | Vercel (Environment Variables) |
|---------|--------------|-------------------------------|
| **MongoDB URI** | `mongodb://localhost:27017/mudekdb` (local) veya Atlas | `mongodb+srv://...@cluster.mongodb.net/` (Atlas) |
| **Database Name** | `mudek` | `mudek` |
| **Port** | `5000` | `5000` (genellikle kullanılmaz) |
| **API Key** | `.env` dosyasında | Vercel Dashboard'da |
| **Git'e Push** | ❌ Hayır (`.gitignore`) | ✅ Otomatik (Vercel'de saklanır) |

---

## ⚠️ Önemli Notlar

1. **`.env` dosyası Git'e push edilmez** (`.gitignore`'da)
2. **Local development için `.env` dosyası zorunludur**
3. **Vercel'de environment variables manuel olarak ayarlanmalıdır**
4. **Local'de MongoDB Atlas kullanabilirsiniz** (her iki tarafta da aynı veritabanı)
5. **Production'da mutlaka MongoDB Atlas kullanılmalıdır** (local MongoDB'ye erişilemez)

---

## 🐛 Sorun Giderme

### Local MongoDB bağlantı hatası:
```bash
# MongoDB servisinin çalıştığını kontrol edin
# Windows: services.msc > MongoDB Server
# Linux/Mac: sudo systemctl status mongod
```

### MongoDB Atlas bağlantı hatası:
- Network Access'te IP whitelist kontrol edin (0.0.0.0/0 ekleyin)
- Connection string'deki username/password doğru mu?
- Özel karakterler URL-encoded olmalı

### Environment variable yüklenmiyor:
- `.env` dosyası `backend/` klasöründe mi?
- Dosya adı tam olarak `.env` mi? (`.env.local` değil)
- Backend'i yeniden başlattınız mı?

