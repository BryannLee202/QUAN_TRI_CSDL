@echo off
title MushroomCloud - Trinh Khoi Chay Sieu Nhe (Live Reload)
cls

echo ========================================================================
echo    MUSHROOMCLOUD - TRINH KHOI CHAY LIVE RELOAD (SUA LA CAP NHAT NGAY)
echo    Chay 1 lan duy nhat: Moi khi sua code chi can F5 trinh duyet la cap nhat!
echo ========================================================================
echo.

echo [1/3] Giai phong cac cong mang 3000, 5000...
node "%~dp0scripts/free-ports.js" > nul 2>&1

echo [2/3] Bat Backend va Frontend trong che do Live Watch (tu dong nhan code moi)...
start /min "MC_Backend_Watch" cmd /c "cd /d "%~dp0backend" && npm run dev"
start /min "MC_Frontend_Watch" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo [3/3] Cho he thong san sang va mo trinh duyet...
ping 127.0.0.1 -n 5 > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    DA KHOI DONG THANH CONG CHE DO LIVE RELOAD!
echo    - Ban khong can tat bat lai file .bat nay nua.
echo    - Moi khi sua code Frontend hoac Backend, chi can nhan F5 la cap nhat!
echo    - Cong Khach Hang:       http://localhost:3000
echo    - Dieu Hanh Ky Thuat:    http://localhost:3000/operator
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit /b 0
