@echo off
title MushroomCloud - Tat He Thong
cls

echo ========================================================================
echo    DANG DUNG TOAN BO HE THONG MUSHROOMCLOUD...
echo ========================================================================
echo.

node "%~dp0scripts/free-ports.js"

echo.
echo ========================================================================
echo    DA TAT TOAN BO TIEN TRINH CHAY NGAM (PORT 3000 VA 5000) THANH CONG!
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit
