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
echo   [1] Khoi chay An Danh (Tu dong mo web va dong sach tat ca cua so cmd)
echo   [2] Khoi chay bang Docker Compose (SQL Server, Backend, Frontend)
echo   [3] Chay bo kiem thu tu dong toan dien (18/18 Tests SQL + Builds)
echo   [4] Tat toan bo he thong (Giai phong cong mang 3000 va 5000)
echo   [5] Thoat
echo.
set "choice=1"
set /p "choice=Nhap lua chon [1-5] (Mac dinh nhan Enter chon [1]): "

if "%choice:~0,1%"=="5" exit /b 0
if "%choice:~0,1%"=="2" goto DOCKER_MODE
if "%choice:~0,1%"=="3" goto RUN_TESTS
if "%choice:~0,1%"=="4" goto CLEAN_PORTS
goto SILENT_START

:SILENT_START
cls
echo ========================================================================
echo    DANG KHOI CHAY AN DANH (TU DONG DONG CUA SO CMD TREN TASKBAR)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js" > nul 2>&1

echo [2/3] Bat Backend va Frontend chay ngam khong tao cua so taskbar...
powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c cd /d \""%~dp0backend\"" && npm run dev' -WindowStyle Hidden"
powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c cd /d \""%~dp0frontend\"" && npm run dev' -WindowStyle Hidden"

echo [3/3] Cho he thong san sang va mo trinh duyet...
ping 127.0.0.1 -n 5 > nul
start http://localhost:3000

echo.
echo Da mo trinh duyet thanh cong! Tu dong thoat cua so cmd sau 2 giay...
ping 127.0.0.1 -n 3 > nul
exit

:DOCKER_MODE
cls
echo ========================================================================
echo    KHOI CHAY DOCKER COMPOSE
echo ========================================================================
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] May tinh chua cai dat Docker!
    echo Chuyen huong ve che do An Danh...
    ping 127.0.0.1 -n 4 > nul
    goto SILENT_START
)
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [CANH BAO] Docker daemon dang tat (Chua bat Docker Desktop).
    echo Chuyen huong ve che do An Danh...
    ping 127.0.0.1 -n 4 > nul
    goto SILENT_START
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
echo    DANG TAT HE THONG VA GIAI PHONG CONG MANG
echo ========================================================================
echo.
node "%~dp0scripts/free-ports.js"
echo.
echo Da tat toan bo he thong thanh cong!
ping 127.0.0.1 -n 3 > nul
exit /b 0
