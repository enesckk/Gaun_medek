# 📝 EHAB Bölümü Test Verisi Oluşturma Rehberi

## 🎯 Bölüm: EHAB (Elektronik Haberleşme Teknolojisi)

---

## 1️⃣ Bölümü Oluştur/Seed Et

### Yöntem A: Seed Endpoint (Önerilen)
Backend'de seed endpoint'i varsa:
- Backend API: `POST /api/departments/seed`
- Veya frontend'den "Bölümler" sayfasında seed butonu varsa kullan

### Yöntem B: Manuel Oluştur
Frontend'de "Bölümler" sayfasından:
- **Bölüm Kodu**: `EHAB`
- **Bölüm Adı**: `Elektronik Haberleşme Teknolojisi`

---

## 2️⃣ Program Çıktıları (PÇ) Oluştur

Frontend'de: **Program Çıktıları** sayfasına git → EHAB bölümünü seç

Aşağıdaki 5 PÇ'yi ekle:

### PÇ1
- **Kod**: `PÇ1`
- **Açıklama**: `Matematik, fen bilimleri ve elektronik haberleşme teknolojisi alanındaki temel bilgileri kullanabilme`

### PÇ2
- **Kod**: `PÇ2`
- **Açıklama**: `Elektronik haberleşme sistemlerinde deney tasarlama, yapma, veri toplama, analiz etme ve yorumlama becerisi`

### PÇ3
- **Kod**: `PÇ3`
- **Açıklama**: `Modern elektronik haberleşme araçlarını ve tekniklerini kullanabilme`

### PÇ4
- **Kod**: `PÇ4`
- **Açıklama**: `Elektronik haberleşme sistemlerinde etik sorumluluk bilinci`

### PÇ5
- **Kod**: `PÇ5`
- **Açıklama**: `Elektronik haberleşme problemlerini tanımlama, formüle etme ve çözme becerisi`

---

## 3️⃣ Ders Oluştur

Frontend'de: **Derslerim** → **Yeni Ders Ekle**

### Ders Bilgileri:
- **Ders Adı**: `Dijital Haberleşme Sistemleri`
- **Ders Kodu**: `EHAB101`
- **Bölüm**: `Elektronik Haberleşme Teknolojisi` (EHAB)
- **Dönem**: `2024-2025 Güz` (veya istediğiniz)

### Sınav Ayarları:

**Vize Sınavı:**
- **Sınav Kodu**: `EHAB101-V`
- **Soru Sayısı**: `10`
- **Soru Başına Max Puan**: `10`

**Final Sınavı:**
- **Sınav Kodu**: `EHAB101-F`
- **Soru Sayısı**: `10`
- **Soru Başına Max Puan**: `10`

### Öğrenciler (En az 3-5 öğrenci):
```
Öğrenci 1:
- Öğrenci No: 2024001
- Ad Soyad: Ali Yılmaz

Öğrenci 2:
- Öğrenci No: 2024002
- Ad Soyad: Ayşe Demir

Öğrenci 3:
- Öğrenci No: 2024003
- Ad Soyad: Mehmet Kaya
```

### Öğrenme Çıktıları (ÖÇ) - 6 tane:

**ÖÇ1:**
- **Kod**: `ÖÇ1`
- **Açıklama**: `Dijital haberleşme sistemlerinin temel kavramlarını açıklayabilme`

**ÖÇ2:**
- **Kod**: `ÖÇ2`
- **Açıklama**: `Modülasyon tekniklerini karşılaştırabilme ve uygulayabilme`

**ÖÇ3:**
- **Kod**: `ÖÇ3`
- **Açıklama**: `Dijital sinyal işleme yöntemlerini analiz edebilme`

**ÖÇ4:**
- **Kod**: `ÖÇ4`
- **Açıklama**: `Haberleşme sistemlerinde hata düzeltme tekniklerini kullanabilme`

**ÖÇ5:**
- **Kod**: `ÖÇ5`
- **Açıklama**: `Kanal kodlama ve kod çözme işlemlerini gerçekleştirebilme`

**ÖÇ6:**
- **Kod**: `ÖÇ6`
- **Açıklama**: `Dijital haberleşme sistemlerinin performans analizini yapabilme`

---

## 4️⃣ ÖÇ-PÇ Eşleştirmesi (MÜDEK Matrisi)

Ders detay sayfasında: **MÜDEK Matrisi** sekmesine git

Her ÖÇ'yi PÇ'lere eşleştir:

### ÖÇ1 → PÇ1, PÇ2
- ÖÇ1: "Dijital haberleşme sistemlerinin temel kavramlarını açıklayabilme"
- Eşlenecek PÇ'ler: **PÇ1**, **PÇ2**

### ÖÇ2 → PÇ1, PÇ3
- ÖÇ2: "Modülasyon tekniklerini karşılaştırabilme ve uygulayabilme"
- Eşlenecek PÇ'ler: **PÇ1**, **PÇ3**

### ÖÇ3 → PÇ1, PÇ5
- ÖÇ3: "Dijital sinyal işleme yöntemlerini analiz edebilme"
- Eşlenecek PÇ'ler: **PÇ1**, **PÇ5**

### ÖÇ4 → PÇ2, PÇ3
- ÖÇ4: "Haberleşme sistemlerinde hata düzeltme tekniklerini kullanabilme"
- Eşlenecek PÇ'ler: **PÇ2**, **PÇ3**

### ÖÇ5 → PÇ2, PÇ5
- ÖÇ5: "Kanal kodlama ve kod çözme işlemlerini gerçekleştirebilme"
- Eşlenecek PÇ'ler: **PÇ2**, **PÇ5**

### ÖÇ6 → PÇ3, PÇ4
- ÖÇ6: "Dijital haberleşme sistemlerinin performans analizini yapabilme"
- Eşlenecek PÇ'ler: **PÇ3**, **PÇ4**

**Özet Eşleştirme:**
- PÇ1: ÖÇ1, ÖÇ2, ÖÇ3 (3 ÖÇ)
- PÇ2: ÖÇ1, ÖÇ4, ÖÇ5 (3 ÖÇ)
- PÇ3: ÖÇ2, ÖÇ4, ÖÇ6 (3 ÖÇ)
- PÇ4: ÖÇ6 (1 ÖÇ)
- PÇ5: ÖÇ3, ÖÇ5 (2 ÖÇ)

---

## 5️⃣ Test İçin Sınav Oluştur

Frontend'de: **Sınavlar** → **Yeni Sınav Ekle**

### Vize Sınavı:
- **Ders**: EHAB101 - Dijital Haberleşme Sistemleri
- **Sınav Tipi**: Vize
- **Sınav Kodu**: `EHAB101-V`
- **Soru Sayısı**: `10`
- **Soru Başına Max Puan**: `10`

**Soruları ÖÇ'lere Eşleştir:**
- Soru 1 → ÖÇ1
- Soru 2 → ÖÇ1
- Soru 3 → ÖÇ2
- Soru 4 → ÖÇ2
- Soru 5 → ÖÇ3
- Soru 6 → ÖÇ4
- Soru 7 → ÖÇ4
- Soru 8 → ÖÇ5
- Soru 9 → ÖÇ6
- Soru 10 → ÖÇ6

---

## 6️⃣ Test Sonuçları Kontrol Et

1. **Raporlar** sayfasında EHAB101 dersine tıkla
2. Kontrol et:
   - ✅ Toplam ÖÇ sayısı: 6
   - ✅ Toplam PÇ sayısı: 5 (0 değil!)
   - ✅ ÖÇ başarı yüzdeleri görünüyor mu?
   - ✅ PÇ başarı yüzdeleri görünüyor mu? (0 değil!)

---

## 📌 Önemli Notlar

1. **PÇ Eşleştirmesi Zorunlu**: ÖÇ'lerin PÇ'lere eşlenmesi gerekiyor, yoksa raporlarda PÇ sayısı 0 gözükür
2. **MÜDEK Matrisi**: Ders detay sayfasında "MÜDEK Matrisi" sekmesinden ÖÇ-PÇ eşleştirmesini yapın
3. **Sınav Puanları**: Test için en az bir öğrenciye sınav puanı girin (tek PDF yükleme veya toplu puan girişi)

