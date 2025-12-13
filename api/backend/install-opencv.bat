@echo off
echo OpenCV kurulumu icin gerekli ortam degiskenlerini ayarliyoruz...

REM Visual Studio Build Tools yolunu bul
for /f "tokens=*" %%i in ('powershell -NoProfile -Command "& 'C:\Program Files (x86)\Microsoft Visual Studio\Installer\vswhere.exe' -latest -products * -property installationPath"') do set VSINSTALLDIR=%%i

if "%VSINSTALLDIR%"=="" (
    echo HATA: Visual Studio Build Tools bulunamadi!
    echo Lutfen Visual Studio Installer ile "Desktop development with C++" workload'unu kurun.
    pause
    exit /b 1
)

echo Visual Studio bulundu: %VSINSTALLDIR%

REM Visual Studio Developer Command Prompt ortam degiskenlerini ayarla
if exist "%VSINSTALLDIR%\VC\Auxiliary\Build\vcvars64.bat" (
    call "%VSINSTALLDIR%\VC\Auxiliary\Build\vcvars64.bat"
) else if exist "%VSINSTALLDIR%\Common7\Tools\VsDevCmd.bat" (
    call "%VSINSTALLDIR%\Common7\Tools\VsDevCmd.bat" -arch=x64
) else (
    echo UYARI: Visual Studio Developer Command Prompt bulunamadi, devam ediliyor...
)

REM Python yolunu ayarla
set PYTHON=C:\Users\Dell\AppData\Local\Programs\Python\Python311\python.exe

REM Node-gyp icin Visual Studio versiyonunu belirt
set GYP_MSVS_VERSION=2022

REM OpenCV kurulumunu dene
echo.
echo OpenCV kurulumu baslatiliyor...
npm install opencv4nodejs@npm:@u4/opencv4nodejs --save-optional

pause

