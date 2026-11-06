@echo off
chcp 65001 > nul
title MushroomCloud - Bàn Điều Khiển & Khởi Chạy Hệ Thống Nông Trại Nấm
cls

echo ========================================================================
echo    HỆ THỐNG NÔNG TRẠI NẤM THÔNG MINH - MUSHROOMCLOUD (FARM-AS-A-SERVICE)
echo    Đồ Án Môn Học: Quản Trị Cơ Sở Dữ Liệu Nâng Cao (MS SQL Server)
echo    Trưởng nhóm / Kiến trúc sư CSDL: Lê Minh Tài (BryannLee202)
echo ========================================================================
echo.
echo Vui lòng chọn chế độ khởi chạy:
echo   [1] Khởi chạy Local Dev (Backend Port 5000 + Frontend Port 3000) - Mặc định
echo   [2] Khởi chạy Docker Compose (Chuỗi Healthcheck SQL Server, API, Web)
echo   [3] Chạy bộ kiểm thử tự động toàn diện (Test CSDL & Backend)
echo   [4] Dọn dẹp tiến trình và giải phóng cổng mạng (Port 3000, 5000)
echo   [5] Thoát
echo.
set /p choice="Nhập lựa chọn của bạn [1-5] (Nhấn Enter chọn [1]): "
if "%choice%"=="" set choice=1

if "%choice%"=="1" goto LOCAL_DEV
if "%choice%"=="2" goto DOCKER_MODE
if "%choice%"=="3" goto RUN_TESTS
if "%choice%"=="4" goto CLEAN_PORTS
if "%choice%"=="5" exit /b 0
goto LOCAL_DEV

:LOCAL_DEV
cls
echo ========================================================================
echo    KHỞI CHẠY MÔI TRƯỜNG LOCAL DEV (BACKEND + FRONTEND)
echo ========================================================================
echo.
echo [1/4] Kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Chưa phát hiện Node.js trên máy tính!
    echo Vui lòng cài đặt Node.js LTS từ https://nodejs.org trước khi khởi chạy.
    pause
    exit /b 1
)
echo       -> Node.js đã sẵn sàng.

echo.
echo [2/4] Dọn dẹp và giải phóng cổng mạng (Port 3000, 5000)...
node scripts/free-ports.js

echo.
echo [3/4] Đang khởi động Backend API và Frontend Web...
start "MushroomCloud Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"
start "MushroomCloud Frontend Web (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [4/4] Đang chờ hệ thống sẵn sàng và mở trình duyệt...
timeout /t 5 /nobreak > nul
start http://localhost:3000

echo.
echo ========================================================================
echo    KHỞI CHẠY HỆ THỐNG MUSHROOMCLOUD THÀNH CÔNG!
echo ========================================================================
echo    1. Cổng Khách Hàng:       http://localhost:3000
echo    2. Trung Tâm Điều Hành:   http://localhost:3000/operator
echo    3. Swagger API Docs:      http://localhost:5000/api-docs
echo    4. Health Check API:      http://localhost:5000/api/health
echo ========================================================================
echo Nhấn phím bất kỳ để quay lại menu...
pause > nul
goto MENU_RELOAD

:DOCKER_MODE
cls
echo ========================================================================
echo    KHỞI CHẠY BẰNG DOCKER COMPOSE
echo ========================================================================
echo.
where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Không tìm thấy Docker CLI trên máy!
    echo Tự động chuyển hướng về chế độ Local Dev...
    timeout /t 3 /nobreak > nul
    goto LOCAL_DEV
)
docker info >nul 2>nul
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Docker daemon chưa được bật (Docker Desktop đang tắt).
    echo Tự động chuyển hướng về chế độ Local Dev...
    timeout /t 3 /nobreak > nul
    goto LOCAL_DEV
)
echo Đang kích hoạt docker-compose up --build...
docker-compose up --build
pause
goto MENU_RELOAD

:RUN_TESTS
cls
echo ========================================================================
echo    CHẠY BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN (SQL SERVER + BACKEND)
echo ========================================================================
echo.
node scripts/test-runner.js
echo.
echo Nhấn phím bất kỳ để quay lại menu...
pause > nul
goto MENU_RELOAD

:CLEAN_PORTS
cls
echo ========================================================================
echo    GIẢI PHÓNG CỔNG MẠNG BỊ CHIẾM DỤNG
echo ========================================================================
echo.
node scripts/free-ports.js
echo.
echo Đã giải phóng hoàn tất. Nhấn phím bất kỳ để quay lại menu...
pause > nul
goto MENU_RELOAD

:MENU_RELOAD
cmd /c "%~f0"
