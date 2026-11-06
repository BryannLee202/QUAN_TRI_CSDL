@echo off
title MushroomCloud - Trinh Chay Kiem Thu Tu Dong Toan Dien
cls

echo ========================================================================
echo    BO KIEM THU TU DONG TOAN DIEN MUSHROOMCLOUD (1-CLICK TEST RUNNER)
echo    Do An: He Quan Tri Co So Du Lieu Nang Cao - DH SPKT TP.HCM (HCMUTE)
echo    Tac gia va Kien truc su CSDL: Le Minh Tai (BryannLee202)
echo ========================================================================
echo.

echo [1/4] Kiem tra moi truong Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Node.js chua duoc cai dat tren he thong!
    pause
    exit /b 1
)
echo       [OK] Node.js OK.

echo.
echo [2/4] Thuc thi bo kiem thu dong thoi CSDL va Backend API...
node "%~dp0scripts/test-runner.js"
if %errorlevel% neq 0 (
    echo.
    echo [THAT BAI] Bo kiem thu CSDL va Backend phat hien loi!
    pause
    exit /b 1
)

echo.
echo [3/4] Kiem tra tinh toan ven va bien dich TypeScript Backend...
cd /d "%~dp0backend"
call npm run build
if %errorlevel% neq 0 (
    echo [THAT BAI] Bien dich TypeScript Backend khong thanh cong!
    pause
    exit /b 1
)
echo       [OK] Backend TypeScript build: PASS (0 errors).

echo.
echo [4/4] Kiem tra tinh toan ven va bien dich Production Next.js Frontend...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [THAT BAI] Bien dich Frontend Next.js khong thanh cong!
    pause
    exit /b 1
)
echo       [OK] Frontend Next.js build: PASS (0 errors).

echo.
echo ========================================================================
echo    TAT CA 4/4 GIAI DOAN KIEM THU DEU DAT CHUAN 100%% (ALL GREEN)!
echo    He thong san sang bao ve do an truoc Hoi Dong Cham.
echo ========================================================================
echo.
pause
exit /b 0
