@echo off
title MushroomCloud - Trinh Khoi Chay Sieu Nhe
cls

echo ========================================================================
echo    MUSHROOMCLOUD - TRINH KHOI CHAY SIEU NHE (LOAD NGAY 0 GIAY)
echo ========================================================================
echo.

echo [1/3] Giai phong cac cong mang 3000, 5000...
node "%~dp0scripts/free-ports.js" > nul 2>&1

echo [2/3] Bat Backend va Frontend trong che do cua so thu nho...
start /min "MC_Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"
start /min "MC_Frontend" cmd /c "cd /d "%~dp0frontend" && npm run start"

echo [3/3] Cho he thong san sang va mo trinh duyet...
ping 127.0.0.1 -n 3 > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    DA KHOI DONG THANH CONG!
echo    - Cong Khach Hang:       http://localhost:3000
echo    - Dieu Hanh Ky Thuat:    http://localhost:3000/operator
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit /b 0
