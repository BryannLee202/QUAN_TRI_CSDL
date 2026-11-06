@echo off
title MushroomCloud - Ban Dieu Khien He Thong
cls

echo ========================================================================
echo    HE THONG NONG TRAI NAM THONG MINH - MUSHROOMCLOUD (FARM-AS-A-SERVICE)
echo    Do An Mon Hoc: Quan Tri Co So Du Lieu Nang Cao (MS SQL Server)
echo    Kien truc su CSDL / Truong nhom: Le Minh Tai (BryannLee202)
echo ========================================================================
echo.
echo Vui long chon che do khoi chay:
echo   [1] Khoi chay Live Reload (Mac dinh: Sua code chi can F5 la cap nhat)
echo   [2] Khoi chay Sieu Toc Production (next start da build san)
echo   [3] Khoi chay bang Docker Compose (SQL Server, Backend, Frontend)
echo   [4] Chay bo kiem thu tu dong toan dien (18/18 Tests SQL + Builds)
echo   [5] Giai phong va don dep cong mang (Port 3000, 5000)
echo   [6] Thoat
echo.
set "choice=1"
set /p "choice=Nhap lua chon [1-6] (Mac dinh nhan Enter chon [1]): "

if "%choice:~0,1%"=="6" exit /b 0
if "%choice:~0,1%"=="2" goto PROD_MODE
if "%choice:~0,1%"=="3" goto DOCKER_MODE
if "%choice:~0,1%"=="4" goto RUN_TESTS
if "%choice:~0,1%"=="5" goto CLEAN_PORTS
goto DEV_MODE

:DEV_MODE
cls
echo ========================================================================
echo    KHOI CHAY LIVE RELOAD DEV (SUA CODE LA CAP NHAT NGAY - CHI CAN F5)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [2/3] Khoi dong Backend (Watch mode) va Frontend (Next.js Fast Refresh)...
start "MushroomCloud Backend (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [3/3] Cho he thong san sang va mo trinh duyet...
ping 127.0.0.1 -n 5 > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    KHOI CHAY THANH CONG CHE DO LIVE RELOAD!
echo    - Ban cu giu nguyen cua so nay hoac thu nho xuong taskbar.
echo    - Bat ky khi nao sua code, chi can nhan F5 tren trinh duyet la cap nhat!
echo    - Cong Khach Hang:        http://localhost:3000
echo    - Ban Dieu Hanh Ky Thuat: http://localhost:3000/operator
echo    - Swagger API Docs:       http://localhost:5000/api-docs
echo ========================================================================
echo.
pause
exit /b 0

:PROD_MODE
cls
echo ========================================================================
echo    KHOI CHAY SIEU TOC PRODUCTION (NEXT START)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [2/3] Khoi dong Backend va Frontend Production...
start "MushroomCloud Backend (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run start"

echo.
echo [3/3] Cho 2 giay va mo trinh duyet...
ping 127.0.0.1 -n 3 > nul
start http://localhost:3000
pause
exit /b 0

:DOCKER_MODE
cls
echo ========================================================================
echo    KHOI CHAY DOCKER COMPOSE
echo ========================================================================
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] May tinh chua cai dat Docker!
    echo Chuyen huong ve che do Live Reload...
    ping 127.0.0.1 -n 4 > nul
    goto DEV_MODE
)
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Docker daemon dang tat (Chua bat Docker Desktop).
    echo Chuyen huong ve che do Live Reload...
    ping 127.0.0.1 -n 4 > nul
    goto DEV_MODE
)
docker-compose up --build
pause
exit /b 0

:RUN_TESTS
cls
echo ========================================================================
echo    CHAY BO KIEM THU TU DONG TOAN DIEN
echo ========================================================================
echo.
call "%~dp0run-automated-tests.bat"
pause
exit /b 0

:CLEAN_PORTS
cls
echo ========================================================================
echo    GIAI PHONG CONG MANG 3000 VA 5000
echo ========================================================================
echo.
node "%~dp0scripts/free-ports.js"
echo.
echo Da giai phong cong mang hoan tat.
pause
exit /b 0
