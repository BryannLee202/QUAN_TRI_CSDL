@echo off
chcp 65001 > nul
title MushroomCloud - Trinh Khoi Chay Sieu Nhe
cls

echo ========================================================================
echo    MUSHROOMCLOUD - TRÌNH KHỞI CHẠY SIÊU NHẸ (MINIMIZED BACKGROUND)
echo    Khởi chạy nền êm ái cho máy yếu / Demo gọn gàng không mở nhiều cửa sổ
echo ========================================================================
echo.

echo [1/3] Giai phong cac cong mang 3000, 5000...
node scripts/free-ports.js > nul 2>&1

echo [2/3] Bat Backend va Frontend trong che do cua so thu nho (minimized)...
start /min "MC_Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"
start /min "MC_Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Cho he thong san sang va mo trinh duyet...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    DA KHOI DONG THANH CONG!
echo    - Cổng Khách Hàng: http://localhost:3000
echo    - Điều Hành Kỹ Thuật: http://localhost:3000/operator
echo ========================================================================
echo.
timeout /t 3 > nul
exit
