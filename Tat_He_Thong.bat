@echo off
title MushroomCloud - Tat He Thong
cls

echo ========================================================================
echo    DANG DUNG TOAN BO HE THONG MUSHROOMCLOUD...
echo ========================================================================
echo.

node "%~dp0scripts/free-ports.js"

:: Dong cac cua so MC neu con sot lai
taskkill /FI "WINDOWTITLE eq MC_Backend*" /F /T > nul 2>&1
taskkill /FI "WINDOWTITLE eq MC_Frontend*" /F /T > nul 2>&1

echo.
echo ========================================================================
echo    DA TAT TOAN BO TIEN TRINH CHAY NGAM (PORT 3000 VA 5000) THANH CONG!
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit
