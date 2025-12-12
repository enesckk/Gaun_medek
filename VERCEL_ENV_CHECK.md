# Vercel Environment Variables Kontrol Listesi

500 hatası alıyorsanız, Vercel Dashboard'da şu environment variables'ların olduğundan emin olun:

## ✅ Gerekli Environment Variables

Vercel Dashboard → Settings → Environment Variables → **Production, Preview, Development** için ekleyin:

1. **MONGODB_URI**
   - MongoDB Atlas connection string
   - Format: `mongodb+srv://username:password@cluster.mongodb.net/`
   - ⚠️ Sonunda `/` olmalı ve database adı OLMAMALI

2. **MONGODB_DB**
   - Database adı: `mudek`
   - Bu ayrı bir variable olmalı

3. **GEMINI_API_KEY**
   - Google Gemini API key'iniz

4. **NODE_ENV**
   - `production`

## 🔍 Kontrol Adımları

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Her variable'ın **Production**, **Preview**, ve **Development** için işaretli olduğundan emin olun
3. Değişiklik yaptıktan sonra **yeniden deploy** yapın (Redeploy)

## 🧪 Test

Deploy sonrası şu endpoint'leri test edin:
- `https://your-app.vercel.app/api/health` (varsa)
- `https://your-app.vercel.app/api/departments`
- `https://your-app.vercel.app/api/courses`

## ⚠️ MongoDB Atlas Network Access

MongoDB Atlas → Network Access → **0.0.0.0/0** (tüm IP'ler) eklendiğinden emin olun.

## 🔧 Vercel Logs Kontrol

1. Vercel Dashboard → Deployments → Son deployment'a tıklayın
2. **Functions** sekmesine gidin
3. `api/index` function'ına tıklayın
4. **Logs** sekmesinde MongoDB bağlantı hatalarını kontrol edin

Eğer `MONGODB_URI environment variable is not set` hatası görüyorsanız, environment variables düzgün ayarlanmamış demektir.

