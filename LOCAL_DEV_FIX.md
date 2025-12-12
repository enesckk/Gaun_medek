# Lokal Geliştirme Sorunları - Çözüm Rehberi

## 🔴 Sorun 1: ERR_CONNECTION_REFUSED

**Hata:** `GET http://localhost:5000/api/departments net::ERR_CONNECTION_REFUSED`

**Neden:** Backend çalışmıyor veya yanlış portta çalışıyor.

### Çözüm:

1. **Backend'i başlatın:**
   ```bash
   cd backend
   npm run dev
   ```
   
   Şu mesajı görmelisiniz:
   ```
   ✅ MongoDB bağlantısı kuruldu
   📊 Veritabanı: mudek
   Backend running at http://localhost:5000
   ```

2. **Backend'in çalıştığını test edin:**
   - Browser'da: `http://localhost:5000/api/health`
   - Şu response'u görmelisiniz: `{ status: "OK" }`

3. **MongoDB bağlantısını kontrol edin:**
   - Backend klasöründe `.env` dosyası var mı?
   - `MONGODB_URI` tanımlı mı?
   - MongoDB çalışıyor mu? (Atlas veya local)

### Hızlı Test:

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

---

## 🔴 Sorun 2: Next.js Webpack Cache Hatası

**Hata:** `RangeError: Array buffer allocation failed`

**Neden:** Next.js webpack cache'i bozulmuş veya disk alanı yetersiz.

### Çözüm:

1. **Next.js cache'ini temizleyin:**
   ```bash
   cd frontend
   rm -rf .next
   rm -rf node_modules/.cache
   ```

   Windows'ta:
   ```powershell
   cd frontend
   Remove-Item -Recurse -Force .next
   Remove-Item -Recurse -Force node_modules\.cache
   ```

2. **Node modules'ü yeniden yükleyin (opsiyonel):**
   ```bash
   cd frontend
   rm -rf node_modules
   npm install
   ```

3. **Frontend'i yeniden başlatın:**
   ```bash
   cd frontend
   npm run dev
   ```

### Kalıcı Çözüm:

`next.config.js` dosyası güncellendi, webpack cache ayarları optimize edildi.

---

## ✅ Doğru Çalıştırma Sırası

### Yöntem 1: Ayrı Terminal'ler (Önerilen)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Yöntem 2: Tek Komut (Root'tan)

```bash
# Root klasöründen
npm run dev
```

Bu komut hem backend hem frontend'i başlatır (concurrently ile).

---

## 🔍 Sorun Giderme Checklist

- [ ] Backend çalışıyor mu? (`http://localhost:5000/api/health`)
- [ ] Frontend çalışıyor mu? (`http://localhost:3000`)
- [ ] MongoDB bağlantısı var mı? (Backend loglarında "✅ MongoDB bağlantısı kuruldu")
- [ ] `.env` dosyası backend klasöründe var mı?
- [ ] `MONGODB_URI` tanımlı mı?
- [ ] Next.js cache temizlendi mi? (`.next` klasörü silindi mi?)

---

## 🚨 Hâlâ Çalışmıyorsa

1. **Backend loglarını kontrol edin:**
   - MongoDB bağlantı hatası var mı?
   - Port 5000 kullanımda mı?

2. **Port çakışması:**
   ```bash
   # Windows'ta port kullanımını kontrol et
   netstat -ano | findstr :5000
   ```

3. **Environment variables:**
   - Backend klasöründe `.env` dosyası var mı?
   - `MONGODB_URI`, `GEMINI_API_KEY` tanımlı mı?

4. **Node.js versiyonu:**
   ```bash
   node --version  # 18.x veya üzeri olmalı
   ```

