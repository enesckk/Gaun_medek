# Vercel Framework Settings - Doğru Yapılandırma

## ⚠️ Mevcut Durum (Yanlış)

Görüntüdeki ayarlar:
- **Framework Preset**: "Other" ❌ (Yanlış!)
- **Build Command**: Default ❌
- **Output Directory**: Default ❌
- **Root Directory**: Boş ✅ (Doğru)

## ✅ Doğru Vercel Ayarları

### Framework Settings

1. **Framework Preset**: 
   - ❌ "Other" değil
   - ✅ **"Next.js"** seçin (veya boş bırakın, otomatik algılansın)

2. **Build Command** (Override: ON):
   ```
   cd frontend && npm install && npm run build
   ```
   Veya:
   ```
   npm install && cd backend && npm install && cd ../frontend && npm install && npm run build
   ```

3. **Output Directory** (Override: ON):
   ```
   frontend/.next
   ```

4. **Install Command** (Override: ON):
   ```
   npm install && cd backend && npm install && cd ../frontend && npm install
   ```

5. **Development Command** (Override: OFF):
   - Boş bırakın veya:
   ```
   cd frontend && npm run dev
   ```

6. **Root Directory**: 
   - ✅ Boş bırakın (proje root'u)

---

## 🎯 Alternatif: vercel.json Kullan (Önerilen)

Vercel UI'da manuel ayar yapmak yerine, `vercel.json` dosyası zaten mevcut ve doğru yapılandırılmış. 

**Vercel UI'da:**
- Framework Preset: "Other" olarak kalabilir (vercel.json öncelikli)
- Build Command: Override OFF (vercel.json kullanılacak)
- Output Directory: Override OFF (vercel.json kullanılacak)
- Install Command: Override ON (vercel.json'daki installCommand kullanılacak)

**Veya tüm override'ları OFF yapın**, `vercel.json` otomatik kullanılacak.

---

## 📋 Özet: İki Seçenek

### Seçenek 1: vercel.json Kullan (Önerilen) ✅

Vercel UI'da:
- Framework Preset: "Other" (veya Next.js)
- Tüm Override'lar: **OFF**
- Root Directory: Boş

`vercel.json` dosyası tüm ayarları yönetir.

### Seçenek 2: Vercel UI'da Manuel Ayarla

Vercel UI'da:
- Framework Preset: **Next.js**
- Build Command (Override ON): `cd frontend && npm run build`
- Output Directory (Override ON): `frontend/.next`
- Install Command (Override ON): `npm install && cd backend && npm install && cd ../frontend && npm install`
- Root Directory: Boş

---

## ⚠️ Önemli Not

**vercel.json varsa, Vercel UI ayarları öncelikli değildir!**

`vercel.json` dosyanız zaten mevcut ve doğru yapılandırılmış. Vercel UI'da override'ları **OFF** yapın, `vercel.json` kullanılsın.




