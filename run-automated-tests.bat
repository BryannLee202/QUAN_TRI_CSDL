@echo off
chcp 65001 > nul
title MushroomCloud - Trình Chạy Kiểm Thử Tự Động Toàn Diện
cls

echo ========================================================================
echo    BỘ KIỂM THỬ TỰ ĐỘNG TOÀN DIỆN MUSHROOMCLOUD (1-CLICK TEST RUNNER)
echo    Đồ Án: Hệ Quản Trị Cơ Sở Dữ Liệu Nâng Cao - ĐH SPKT TP.HCM (HCMUTE)
echo    Tác giả & Kiến trúc sư: Lê Minh Tài (BryannLee202)
echo ========================================================================
echo.

echo [1/4] Kiểm tra môi trường Node.js...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [LỖI] Node.js chưa được cài đặt trên hệ thống!
    pause
    exit /b 1
)
echo       -> Node.js OK.

echo.
echo [2/4] Thực thi bộ kiểm thử đồng thời CSDL & Backend API...
node scripts/test-runner.js
if %errorlevel% neq 0 (
    echo.
    echo [THẤT BẠI] Bộ kiểm thử CSDL & Backend phát hiện lỗi!
    pause
    exit /b 1
)

echo.
echo [3/4] Kiểm tra tính toàn vẹn và biên dịch TypeScript Backend...
cd /d "%~dp0backend"
call npm run build
if %errorlevel% neq 0 (
    echo [THẤT BẠI] Biên dịch TypeScript Backend không thành công!
    pause
    exit /b 1
)
echo       -> Backend TypeScript build: PASS (0 errors).

echo.
echo [4/4] Kiểm tra tính toàn vẹn và biên dịch Production Next.js Frontend...
cd /d "%~dp0frontend"
call npm run build
if %errorlevel% neq 0 (
    echo [THẤT BẠI] Biên dịch Frontend Next.js không thành công!
    pause
    exit /b 1
)
echo       -> Frontend Next.js build: PASS (0 errors).

echo.
echo ========================================================================
echo    TẤT CẢ 4/4 GIAI ĐOẠN KIỂM THỬ ĐỀU ĐẠT CHUẨN 100%% (ALL GREEN)!
echo    Hệ thống sẵn sàng bảo vệ đồ án trước Hội Đồng Chấm.
echo ========================================================================
echo.
pause
