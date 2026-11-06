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
echo   [1] Khoi chay Local Dev (Backend Port 5000 + Frontend Port 3000)
echo   [2] Khoi chay bang Docker Compose (SQL Server, Backend, Frontend)
echo   [3] Chay bo kiem thu tu dong toan dien (18/18 Tests SQL + Builds)
echo   [4] Giai phong va don dep cong mang (Port 3000, 5000)
echo   [5] Thoat
echo.
set "choice=1"
set /p "choice=Nhap lua chon [1-5] (Mac dinh nhan Enter chon [1]): "

if "%choice:~0,1%"=="5" exit /b 0
if "%choice:~0,1%"=="2" goto DOCKER_MODE
if "%choice:~0,1%"=="3" goto RUN_TESTS
if "%choice:~0,1%"=="4" goto CLEAN_PORTS
goto LOCAL_DEV

:LOCAL_DEV
cls
echo ========================================================================
echo    KHOI CHAY MOI TRUONG LOCAL DEV (BACKEND + FRONTEND)
echo ========================================================================
echo.
echo [1/4] Kiem tra Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LOI] Chua cai dat Node.js tren may tinh!
    pause
    exit /b 1
)
echo       [OK] Node.js da san sang.

echo.
echo [2/4] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [3/4] Khoi dong Backend API va Frontend Web...
start "MushroomCloud Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend Web (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [4/4] Cho he thong san sang va mo trinh duyet...
ping 127.0.0.1 -n 6 > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    KHOI CHAY HE THONG THANH CONG!
echo    - Cong Khach Hang:        http://localhost:3000
echo    - Ban Dieu Hanh Ky Thuat: http://localhost:3000/operator
echo    - Swagger API Docs:       http://localhost:5000/api-docs
echo    - Health Check API:       http://localhost:5000/api/health
echo ========================================================================
echo.
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
    echo Chuyen huong ve che do Local Dev...
    ping 127.0.0.1 -n 4 > nul
    goto LOCAL_DEV
)
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Docker daemon dang tat (Chua bat Docker Desktop).
    echo Chuyen huong ve che do Local Dev...
    ping 127.0.0.1 -n 4 > nul
    goto LOCAL_DEV
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
