# Teknoloji Analizi ve Yapı Değerlendirmesi

## 📦 Kullandığımız Teknolojiler

### Frontend (Next.js)
- **Framework**: Next.js 14.2.5 (App Router)
- **UI Framework**: React 18.3.1
- **Language**: TypeScript 5.5.4
- **Styling**: Tailwind CSS 3.4.7
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **Form Handling**: React Hook Form 7.53.0 + Zod 3.23.8
- **HTTP Client**: Axios 1.7.7
- **State Management**: Zustand 4.5.5
- **Charts**: Recharts 3.5.1
- **Icons**: Lucide React 0.427.0
- **Notifications**: Sonner 1.5.0

### Backend (Express)
- **Runtime**: Node.js
- **Framework**: Express 4.18.2
- **Database**: MongoDB (Mongoose 7.5.0)
- **File Upload**: Multer 1.4.5
- **Image Processing**: Sharp 0.34.5
- **PDF Processing**: pdf-poppler 0.2.1
- **Computer Vision**: OpenCV.js 1.2.1 (marker detection)
- **AI/OCR**: @google/generative-ai 0.24.1 (Gemini Vision API)
- **Environment**: dotenv 16.3.1

### Backend API Routes (10 adet)
1. `/api/courses` - Ders yönetimi
2. `/api/departments` - Bölüm yönetimi
3. `/api/program-outcomes` - Program çıktıları (PÇ)
4. `/api/exams` - Sınav yönetimi
5. `/api/questions` - Soru yönetimi
6. `/api/learning-outcomes` - Öğrenme çıktıları (ÖÇ)
7. `/api/students` - Öğrenci yönetimi
8. `/api/scores` - Puan yönetimi
9. `/api/ai` - AI işlemleri
10. `/api/assessments` - Değerlendirme/raporlama

---

## 🏗️ Mevcut Yapı (Şu Anki Durum)

### Yapı:
```
Gaun_mudek-/
├── frontend/          # Next.js App Router
│   ├── app/          # Pages ve routes
│   ├── components/   # React components
│   └── lib/          # API client, utilities
├── backend/          # Express server
│   ├── controllers/  # Business logic
│   ├── routes/       # Express routes
│   ├── models/       # Mongoose models
│   └── utils/        # Utilities (PDF, OCR, etc.)
└── api/              # Vercel serverless wrapper
    └── index.js      # Express app'i Vercel'e adapte eder
```

### Şu Anki Deployment Yapısı:

**✅ TEK DEPLOY, TEK DOMAIN:**
- `vercel.json` ile monorepo yapılandırması
- `/api/*` istekleri → `api/index.js` (Express backend)
- Diğer istekler → `frontend/` (Next.js app)
- **Aynı domain'de çalışıyor**: `https://your-app.vercel.app/api/*`

**Nasıl Çalışıyor:**
1. Vercel `api/index.js`'i serverless function olarak çalıştırıyor
2. `api/index.js` Express app'i import ediyor
3. Express routes `/api/*` altında çalışıyor
4. Frontend Next.js app olarak deploy ediliyor

**Avantajları:**
- ✅ Tek deploy, tek domain
- ✅ Mevcut Express yapısı korunuyor
- ✅ Backend ayrı klasörde organize
- ✅ Vercel serverless function olarak çalışıyor

**Dezavantajları:**
- ⚠️ `vercel.json` yapılandırması gerekli
- ⚠️ Express'i serverless function'a adapte etmek gerekiyor
- ⚠️ İki ayrı `package.json` (frontend + backend)
- ⚠️ İki ayrı dependency yönetimi

---

## 🔄 Önerilen Yapı: Next.js API Routes

### Yeni Yapı:
```
Gaun_mudek-/
├── app/
│   ├── api/              # Next.js API Routes
│   │   ├── courses/
│   │   │   └── route.ts
│   │   ├── exams/
│   │   │   └── route.ts
│   │   └── ...
│   ├── dashboard/        # Frontend pages
│   └── ...
├── lib/
│   ├── api/              # Shared API logic
│   └── db/               # MongoDB connection
└── controllers/          # Business logic (shared)
```

### Next.js API Routes'a Geçiş:

**Avantajları:**
- ✅ **Daha basit yapılandırma**: `vercel.json` gerekmez
- ✅ **Tek `package.json`**: Tüm dependencies tek yerde
- ✅ **Next.js built-in**: Vercel'de otomatik çalışır
- ✅ **Type-safe**: TypeScript ile route handlers
- ✅ **Daha iyi DX**: Hot reload, unified dev server
- ✅ **Daha az karmaşıklık**: Express wrapper gerekmez

**Dezavantajları:**
- ⚠️ **Migration gerekli**: 10 route'u taşımak gerekir
- ⚠️ **Express middleware**: Multer, CORS gibi middleware'leri adapte etmek gerekir
- ⚠️ **File upload**: Next.js'de farklı yaklaşım gerekir

---

## 📊 Karşılaştırma

| Özellik | Mevcut (Express) | Next.js API Routes |
|---------|------------------|-------------------|
| **Deploy** | ✅ Tek deploy | ✅ Tek deploy |
| **Domain** | ✅ Tek domain | ✅ Tek domain |
| **Yapılandırma** | ⚠️ `vercel.json` gerekli | ✅ Otomatik |
| **Dependencies** | ⚠️ 2 ayrı `package.json` | ✅ Tek `package.json` |
| **Type Safety** | ⚠️ JSDoc/manuel | ✅ TypeScript built-in |
| **File Upload** | ✅ Multer (kolay) | ⚠️ FormData API |
| **Middleware** | ✅ Express middleware | ⚠️ Next.js middleware |
| **Migration** | ✅ Mevcut | ⚠️ Refactor gerekli |

---

## 💡 Öneri

### Senaryo 1: Mevcut Yapıyı Koru (Önerilen - Kısa Vadede)
**Neden:**
- ✅ Zaten tek deploy için yapılandırılmış
- ✅ Çalışıyor, stabil
- ✅ Migration riski yok
- ✅ Express middleware'leri (Multer, CORS) kolay kullanım

**Ne zaman değiştirmeli:**
- Yeni özellikler eklerken
- Büyük refactoring yaparken
- Type safety'i artırmak istediğinizde

### Senaryo 2: Next.js API Routes'a Geç (Uzun Vadede)
**Neden:**
- ✅ Daha modern, Next.js best practices
- ✅ Daha basit yapılandırma
- ✅ Tek dependency yönetimi
- ✅ Daha iyi TypeScript desteği

**Migration Planı:**
1. Yeni route'ları Next.js API Routes olarak ekle
2. Eski route'ları yavaş yavaş migrate et
3. Express backend'i kaldır
4. `vercel.json`'u sadeleştir

---

## 🎯 Sonuç

**Mevcut yapı zaten tek deploy için optimize edilmiş!** 

- ✅ Tek domain: `https://your-app.vercel.app`
- ✅ Tek deploy: Frontend + Backend birlikte
- ✅ Tek env: Environment variables Vercel'de

**Next.js API Routes'a geçiş:**
- ✅ **Yapılabilir** ve daha modern olur
- ⚠️ **Migration gerekli** (10 route + middleware)
- ⚠️ **File upload** logic'i değişmeli
- ✅ **Uzun vadede** daha iyi olur

**Öneri:** Şimdilik mevcut yapıyı koruyun, yeni özellikler eklerken Next.js API Routes kullanın, zamanla migrate edin.




