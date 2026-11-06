@echo off
chcp 65001 > nul
title MushroomCloud - Hệ Thống Nông Trại Nấm Thông Minh (1-Click Launcher)
cls

echo ========================================================================
echo    HỆ THỐNG NÔNG TRẠI NẤM THÔNG MINH - MUSHROOMCLOUD (FARM-AS-A-SERVICE)
echo    Đồ Án Môn Học: Hệ Quản Trị Cơ Sở Dữ Liệu (MS SQL Server / T-SQL)
echo    Trưởng nhóm / Kiến trúc sư: Lê Minh Tài
echo ========================================================================
echo.

echo [1/4] Kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Chưa phát hiện Node.js trên máy tính!
    echo Vui lòng cài đặt Node.js LTS từ https://nodejs.org trước khi khởi chạy.
    echo.
    pause
    exit /b 1
)
echo       -> Node.js đã sẵn sàng.

echo.
echo [2/4] Dọn dẹp và giải phóng cổng mạng (Port 3000, 5000)...
node scripts/free-ports.js
if %errorlevel% neq 0 (
    echo [CẢNH BÁO] Không thể giải phóng cổng, tiếp tục khởi động...
)

echo.
echo [3/4] Đang khởi động Backend API và Frontend Web...
echo       -> Bật Backend API (Node.js/Express + Socket.io trên cổng 5000)...
start "MushroomCloud Backend API (Port 5000)" cmd /c "cd /d "%~dp0backend" && npm run dev"

echo       -> Bật Frontend Web (Next.js 14 trên cổng 3000)...
start "MushroomCloud Frontend Web (Port 3000)" cmd /c "cd /d "%~dp0frontend" && npm run dev"

echo.
echo [4/4] Đang chờ hệ thống sẵn sàng và mở trình duyệt...
timeout /t 5 /nobreak > nul

start http://localhost:3000

echo.
echo ========================================================================
echo    KHỞI CHẠY HỆ THỐNG MUSHROOMCLOUD THÀNH CÔNG!
echo ========================================================================
echo    1. Cổng Khách Hàng (Customer Portal):  http://localhost:3000
echo    2. Trung Tâm Điều Hành (Operator):    http://localhost:3000/operator
echo    3. Tài Liệu API (Swagger OpenAPI):    http://localhost:5000/api-docs
echo ========================================================================
echo    * Lưu ý: Giữ nguyên hai cửa sổ lệnh Backend và Frontend đang chạy.
echo    * Để dừng hệ thống: Đóng 2 cửa sổ hoặc chạy lại file này để tự dọn dẹp.
echo ========================================================================
echo.
pause
