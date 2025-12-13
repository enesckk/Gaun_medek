# Deployment Seçenekleri

## Seçenek 1: Monorepo (Tek Deploy) - ŞU ANKİ DURUM

**Yapı:**
- `vercel.json` ile tek Vercel projesi
- Frontend ve backend aynı domain'de
- `api/` klasörü backend için gerekli

**Domain:**
- `https://your-app.vercel.app` - Frontend
- `https://your-app.vercel.app/api/*` - Backend API

**Avantajları:**
- ✅ Tek deploy
- ✅ CORS sorunu yok
- ✅ Basit yapılandırma
- ✅ Tek environment variable set'i

**Dezavantajları:**
- ⚠️ `api/` klasörü gerekli (backend'i kopyalamalı)
- ⚠️ Backend ve frontend aynı projede

---

## Seçenek 2: Ayrı Deploy (Backend ve Frontend Ayrı)

**Yapı:**
- Backend: Ayrı Vercel projesi
- Frontend: Ayrı Vercel projesi
- `api/` klasörü GEREKMEZ
- `vercel.json` sadece frontend için

**Domain:**
- `https://your-frontend.vercel.app` - Frontend
- `https://your-backend.vercel.app` - Backend API

**Avantajları:**
- ✅ Bağımsız deploy
- ✅ Ayrı scaling
- ✅ `api/` klasörü gerekmez
- ✅ Daha temiz yapı

**Dezavantajları:**
- ⚠️ CORS yapılandırması gerekli
- ⚠️ İki ayrı Vercel projesi
- ⚠️ İki ayrı environment variable set'i
- ⚠️ Frontend'de backend URL'ini environment variable olarak tanımlamalı

---

## Hangisini Seçmeliyim?

### Monorepo (Seçenek 1) seçin eğer:
- Tek deploy istiyorsanız
- CORS ile uğraşmak istemiyorsanız
- Basit bir yapı istiyorsanız

### Ayrı Deploy (Seçenek 2) seçin eğer:
- Backend ve frontend'i bağımsız deploy etmek istiyorsanız
- Farklı scaling gereksinimleri varsa
- `api/` klasörü istemiyorsanız

