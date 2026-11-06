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
echo   [1] Khoi chay Live Reload (Sua code F5 cap nhat tuc thi - Pre-warm san)
echo   [2] Khoi chay Sieu Toc Production (next start da build san)
echo   [3] Khoi chay bang Docker Compose (SQL Server, Backend, Frontend)
echo   [4] Chay bo kiem thu tu dong toan dien (18/18 Tests SQL + Builds)
echo   [5] Tat he thong (Giai phong cong mang 3000 va 5000)
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
echo    KHOI CHAY LIVE RELOAD SIEU TOC (F5 LA CAP NHAT TUC THI)
echo ========================================================================
echo.
echo [1/4] Giai phong va diet sach tien trinh cu tren cong 3000, 5000...
node "%~dp0scripts/free-ports.js" > nul 2>&1

echo [2/4] Khoi dong Backend va Frontend voi 100%% CPU priority...
start /min "MC_Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"
start /min "MC_Frontend" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo [3/4] Dang pre-compile san trang giao dien de ban khong phai cho...
:DEV_WAIT_LOOP
ping 127.0.0.1 -n 2 > nul
curl.exe -s -o nul -I http://127.0.0.1:3000
if %errorlevel% neq 0 (
    goto DEV_WAIT_LOOP
)

echo [4/4] Da san sang! Dang mo trinh duyet...
start http://localhost:3000

echo.
echo ========================================================================
echo    KHOI CHAY THANH CONG!
echo    - Cua so cmd nay se tu dong dong sau 3 giay.
echo    - Moi khi sua code, chi can nhan F5 tren trinh duyet la cap nhat!
echo    - Khi muon tat he thong, nhap dup vao Tat_He_Thong.bat.
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit /b 0

:PROD_MODE
cls
echo ========================================================================
echo    KHOI CHAY PRODUCTION SERVER (NEXT START)
echo ========================================================================
echo.
echo [1/3] Giai phong cong mang 3000 va 5000...
node "%~dp0scripts/free-ports.js"

echo.
echo [2/3] Khoi dong Backend va Frontend Production...
start "MC_Backend" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MC_Frontend" cmd /c "cd /d "%~dp0frontend" && npm run start"

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
echo    DANG TAT HE THONG VA GIAI PHONG CONG MANG
echo ========================================================================
echo.
node "%~dp0scripts/free-ports.js"
echo.
echo Da tat toan bo he thong thanh cong!
ping 127.0.0.1 -n 3 > nul
exit /b 0
