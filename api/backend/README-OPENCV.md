# OpenCV Kurulum Rehberi

## Gereksinimler

1. **Visual Studio Build Tools 2022** (C++ workload ile)
2. **Python 3.11** (PATH'te olmalı)
3. **CMake** (PATH'te olmalı)

## Kurulum Adımları

### 1. Visual Studio Build Tools C++ Workload Kurulumu

1. Visual Studio Installer'ı açın
2. "Build Tools 2022" için **Modify** (Değiştir) tıklayın
3. **"Desktop development with C++"** işaretleyin
4. **Modify** ile kurulumu tamamlayın

### 2. OpenCV Kurulumu

#### Yöntem 1: Otomatik Script (Önerilen)

```bash
cd backend
install-opencv.bat
```

#### Yöntem 2: Visual Studio Developer Command Prompt

1. Başlat menüsünden **"Developer Command Prompt for VS 2022"** açın
2. Backend klasörüne gidin:
   ```bash
   cd "C:\Users\Dell\Documents\PROJECT\Gaun Mudek\Gaun_mudek-\backend"
   ```
3. OpenCV'yi kurun:
   ```bash
   npm install opencv4nodejs@npm:@u4/opencv4nodejs --save-optional
   ```

#### Yöntem 3: Manuel Ortam Değişkenleri

PowerShell'de (yönetici olarak):

```powershell
# Visual Studio yolunu bul
$vsPath = & "C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe" -latest -products * -property installationPath

# Developer Command Prompt ortam değişkenlerini yükle
& "$vsPath\VC\Auxiliary\Build\vcvars64.bat"

# Python yolunu ayarla
$env:PYTHON = "C:\Users\Dell\AppData\Local\Programs\Python\Python311\python.exe"

# OpenCV kur
npm install opencv4nodejs@npm:@u4/opencv4nodejs --save-optional
```

## Kurulum Kontrolü

Kurulum başarılı olduysa:

```bash
node -e "try { const cv = require('opencv4nodejs'); console.log('OpenCV OK:', !!cv); } catch(e) { console.error('HATA:', e.message); }"
```

Çıktı: `OpenCV OK: true` olmalı.

## Sorun Giderme

### "Visual Studio bulunamadı" hatası
- Visual Studio Installer ile C++ workload'unun kurulu olduğundan emin olun
- `install-opencv.bat` script'ini yönetici olarak çalıştırın

### "Python bulunamadı" hatası
- Python'un PATH'te olduğunu kontrol edin: `python --version`
- Python 3.11 kurulu olduğundan emin olun

### Derleme hatası
- Visual Studio Build Tools'un tam kurulu olduğundan emin olun
- Developer Command Prompt'tan kurulumu deneyin

