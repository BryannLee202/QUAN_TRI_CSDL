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
echo   [1] Khoi chay Sieu Toc Demo (Khuyen dung: Load ngay tuc thi 0 giay)
echo   [2] Khoi chay Local Dev (Che do lap trinh: Tu dong reload khi sua code)
echo   [3] Khoi chay bang Docker Compose (SQL Server, Backend, Frontend)
echo   [4] Chay bo kiem thu tu dong toan dien (18/18 Tests SQL + Builds)
echo   [5] Giai phong va don dep cong mang (Port 3000, 5000)
echo   [6] Thoat
echo.
set "choice=1"
set /p "choice=Nhap lua chon [1-6] (Mac dinh nhan Enter chon [1]): "

if "%choice:~0,1%"=="6" exit /b 0
if "%choice:~0,1%"=="2" goto DEV_MODE
if "%choice:~0,1%"=="3" goto DOCKER_MODE
if "%choice:~0,1%"=="4" goto RUN_TESTS
if "%choice:~0,1%"=="5" goto CLEAN_PORTS
goto FAST_DEMO

:FAST_DEMO
cls
echo ========================================================================
echo    KHOI CHAY SIEU TOC DEMO (PRODUCTION MODE - LOAD NGAY 0 GIAY)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [2/3] Khoi dong Backend API va Frontend Sieu Toc...
start "MushroomCloud Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend Web (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run start"

echo.
echo [3/3] Cho 2 giay va mo trinh duyet...
ping 127.0.0.1 -n 3 > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    KHOI CHAY HE THONG THANH CONG!
echo    - Cong Khach Hang:        http://localhost:3000
echo    - Ban Dieu Hanh Ky Thuat: http://localhost:3000/operator
echo    - Swagger API Docs:       http://localhost:5000/api-docs
echo ========================================================================
echo.
pause
exit /b 0

:DEV_MODE
cls
echo ========================================================================
echo    KHOI CHAY CHE DO LOCAL DEV (TU DONG BIEN DICH KHI SUA CODE)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [2/3] Khoi dong Backend va Frontend Dev...
start "MushroomCloud Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend Web (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [3/3] Cho he thong bien dich va mo trinh duyet...
ping 127.0.0.1 -n 6 > nul
start http://localhost:3000

echo.
echo Luu y: O lan dau tien mo trinh duyet, Next.js se bien dich cac module.
echo Cac lan tai trang tiep theo se phan hoi tuc thi.
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
    echo Chuyen huong ve che do Sieu Toc Demo...
    ping 127.0.0.1 -n 4 > nul
    goto FAST_DEMO
)
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Docker daemon dang tat (Chua bat Docker Desktop).
    echo Chuyen huong ve che do Sieu Toc Demo...
    ping 127.0.0.1 -n 4 > nul
    goto FAST_DEMO
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
