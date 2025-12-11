# MÜDEK Uyumlu ÖÇ-PÇ Sistemi Planı

## 🎯 Sistem Amacı
MÜDEK (Mühendislik Eğitim Programları Değerlendirme ve Akreditasyon Derneği) uyumlu sınav yönetimi ve değerlendirme sistemi. Öğrenme Çıktıları (ÖÇ) ve Program Çıktıları (PÇ) bazlı değerlendirme yapılacak.

## 📊 Sistem Mimarisi

### 1. Hiyerarşi ve İlişkiler
```
Bölüm (Department)
  └── Program Çıktıları (PÇ) - Bölüm seviyesinde tanımlı
  └── Dersler (Courses)
      └── Öğrenme Çıktıları (ÖÇ) - Ders seviyesinde tanımlı
          └── ÖÇ → PÇ Eşlemesi (Her ÖÇ bir veya daha fazla PÇ'ye katkıda bulunur)
      └── Sınavlar (Exams)
          └── Sorular (Questions)
              └── Soru → ÖÇ Eşlemesi (Her soru bir veya daha fazla ÖÇ'ye eşlenir)
          └── Puanlar (Scores)
              └── Öğrenci → Soru → Puan
```

### 2. Veri Akışı
```
1. Puan Girişi (Score Entry)
   Öğrenci + Sınav + Soru → Puan

2. ÖÇ Başarısı Hesaplama (LO Achievement)
   Soru Puanları → ÖÇ Başarısı
   - Her ÖÇ için: İlgili soruların ortalaması
   - Başarı yüzdesi: (Alınan Puan / Maksimum Puan) × 100

3. PÇ Başarısı Hesaplama (PO Achievement)
   ÖÇ Başarıları → PÇ Başarısı
   - Her PÇ için: O PÇ'ye katkıda bulunan ÖÇ'lerin ağırlıklı ortalaması
   - Ağırlık: ÖÇ'nin PÇ'ye katkı oranı

4. MÜDEK Raporları
   - ÖÇ başarı raporları
   - PÇ başarı raporları
   - Öğrenci bazlı analiz
   - Ders bazlı analiz
```

## 🔄 İş Akışı (Workflow)

### A. Ders Hazırlığı
1. **Bölüm Seçimi**
   - Bölüm oluştur/düzenle
   - Bölüme ait PÇ'leri tanımla (PÇ1, PÇ2, ...)

2. **Ders Oluşturma**
   - Ders bilgileri (kod, isim, bölüm)
   - Ders için ÖÇ'leri tanımla (ÖÇ1, ÖÇ2, ...)
   - Her ÖÇ'yi ilgili PÇ'lere eşle (ÖÇ → PÇ mapping)

### B. Sınav Hazırlığı
1. **Sınav Oluşturma**
   - Sınav tipi (Vize/Final)
   - Sınav kodu
   - Soru sayısı ve puanlama

2. **Soru Eşleme**
   - Her soruyu ilgili ÖÇ'lere eşle
   - Bir soru birden fazla ÖÇ'ye eşlenebilir
   - Soru → ÖÇ mapping

### C. Puan Girişi
1. **Manuel Puan Girişi**
   - Öğrenci seçimi
   - Sınav seçimi
   - Soru bazlı puan girişi

2. **AI Destekli Puan Girişi**
   - PDF/Resim yükleme
   - Otomatik öğrenci tespiti
   - Otomatik soru tespiti ve puanlama
   - Önizleme ve onay

### D. Değerlendirme ve Raporlama
1. **Otomatik Hesaplama**
   - Soru puanlarından ÖÇ başarısı
   - ÖÇ başarısından PÇ başarısı
   - Başarı yüzdeleri

2. **Raporlar**
   - ÖÇ başarı raporu (ders bazlı)
   - PÇ başarı raporu (ders bazlı)
   - Öğrenci bazlı ÖÇ/PÇ başarı analizi
   - MÜDEK uyumlu rapor formatı

## 📋 Gerekli Özellikler

### 1. ÖÇ-PÇ Yönetimi ✅ (Mevcut)
- [x] Bölüm bazında PÇ tanımlama
- [x] Ders bazında ÖÇ tanımlama
- [x] ÖÇ → PÇ eşleme
- [ ] ÖÇ → PÇ ağırlık/katkı oranı belirleme (İYİLEŞTİRME)

### 2. Sınav Yönetimi ✅ (Mevcut)
- [x] Sınav oluşturma (Vize/Final)
- [x] Soru oluşturma
- [x] Soru → ÖÇ eşleme
- [ ] Soru → ÖÇ ağırlık belirleme (İYİLEŞTİRME)

### 3. Puan Yönetimi ✅ (Mevcut)
- [x] Manuel puan girişi
- [x] AI destekli puan girişi
- [x] Puan düzenleme
- [ ] Toplu puan girişi (Excel import) (İYİLEŞTİRME)

### 4. Değerlendirme Hesaplamaları ⚠️ (Kısmen Mevcut)
- [x] Soru bazlı puan hesaplama
- [x] ÖÇ başarı hesaplama
- [x] PÇ başarı hesaplama
- [ ] Ağırlıklı hesaplama (İYİLEŞTİRME)
- [ ] Başarı eşikleri (threshold) tanımlama (YENİ)

### 5. Raporlama ⚠️ (Kısmen Mevcut)
- [x] ÖÇ başarı raporu
- [x] PÇ başarı raporu
- [x] Öğrenci bazlı analiz
- [ ] MÜDEK standart rapor formatı (YENİ)
- [ ] PDF export (YENİ)
- [ ] Grafik ve görselleştirmeler (İYİLEŞTİRME)

## 🎨 Kullanıcı Arayüzü İyileştirmeleri

### 1. Ana Akış Sayfaları
- **Dashboard**: Genel istatistikler ve hızlı erişim
- **Dersler**: Ders listesi ve yönetimi
- **Sınavlar**: Sınav listesi ve yönetimi
- **Puanlar**: Puan girişi ve yönetimi
- **Raporlar**: MÜDEK raporları

### 2. ÖÇ-PÇ Görselleştirme
- **Eşleme Matrisi**: ÖÇ × PÇ matris görünümü
- **Katkı Oranları**: Her ÖÇ'nin PÇ'lere katkı yüzdesi
- **Başarı Haritası**: Görsel başarı gösterimi

### 3. Sınav Yönetimi
- **Sınav Oluşturma Sihirbazı**: Adım adım sınav oluşturma
- **Soru Eşleme Arayüzü**: Drag-drop veya checkbox ile ÖÇ eşleme
- **Sınav Özeti**: Soru-ÖÇ-PÇ zinciri görünümü

## 🔧 Teknik İyileştirmeler

### 1. Backend
- [ ] Ağırlıklı hesaplama algoritması
- [ ] Başarı eşikleri (threshold) yönetimi
- [ ] MÜDEK rapor formatı API
- [ ] Toplu işlemler (batch operations)
- [ ] Veri doğrulama ve tutarlılık kontrolleri

### 2. Frontend
- [ ] ÖÇ-PÇ eşleme matrisi komponenti
- [ ] Gelişmiş grafik ve görselleştirmeler
- [ ] PDF export özelliği
- [ ] Excel import/export
- [ ] Responsive tasarım iyileştirmeleri

### 3. AI/ML
- [ ] Gelişmiş OCR ve puanlama
- [ ] Öğrenci numarası tespiti iyileştirme
- [ ] Soru bölgesi tespiti iyileştirme

## 📈 Öncelik Sırası

### Faz 1: Temel İyileştirmeler (Hemen)
1. ÖÇ-PÇ eşleme arayüzü iyileştirme
2. Sınav oluşturma akışı iyileştirme
3. Puan girişi arayüzü iyileştirme
4. Temel raporların görselleştirilmesi

### Faz 2: Gelişmiş Özellikler (Kısa Vadede)
1. Ağırlıklı hesaplama sistemi
2. Başarı eşikleri yönetimi
3. MÜDEK standart rapor formatı
4. PDF export

### Faz 3: İleri Seviye (Orta Vadede)
1. Excel import/export
2. Gelişmiş analitik ve görselleştirmeler
3. Toplu işlemler
4. AI iyileştirmeleri

## 🎯 Başarı Kriterleri

1. ✅ Her ders için ÖÇ'ler tanımlanabilmeli
2. ✅ Her ÖÇ, ilgili PÇ'lere eşlenebilmeli
3. ✅ Her sınav sorusu, ilgili ÖÇ'lere eşlenebilmeli
4. ✅ Öğrenci puanları girilebilmeli (manuel veya AI)
5. ✅ ÖÇ başarısı otomatik hesaplanabilmeli
6. ✅ PÇ başarısı otomatik hesaplanabilmeli
7. ✅ MÜDEK uyumlu raporlar oluşturulabilmeli
8. ✅ Raporlar PDF olarak export edilebilmeli

## 📝 Notlar

- MÜDEK standartlarına uygunluk kritik
- Veri tutarlılığı ve doğrulama önemli
- Kullanıcı dostu arayüz öncelikli
- Performans ve ölçeklenebilirlik dikkate alınmalı

