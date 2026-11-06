@echo off
title MushroomCloud - Trinh Khoi Chay Sieu Toc
cls

echo ========================================================================
echo    MUSHROOMCLOUD - TRINH KHOI CHAY LIVE RELOAD SIEU TOC
echo    Tu dong toi uu CPU, pre-warm cache, F5 la cap nhat tuc thi!
echo ========================================================================
echo.

echo [1/4] Giai phong va diet sach tien trinh cu tren cong 3000, 5000...
node "%~dp0scripts/free-ports.js" > nul 2>&1

echo [2/4] Khoi dong Backend va Frontend voi 100%% CPU priority (Khong hien taskbar)...
powershell -NoProfile -Command "$b = Start-Process cmd -ArgumentList '/c cd /d ""%~dp0backend"" && npm run dev' -WindowStyle Hidden -PassThru; $f = Start-Process cmd -ArgumentList '/c cd /d ""%~dp0frontend"" && npm run dev' -WindowStyle Hidden -PassThru; try { $b.PriorityClass = 'AboveNormal'; $f.PriorityClass = 'AboveNormal' } catch {}"

echo [3/4] Dang pre-compile san trang giao dien de ban khong phai cho...
:WAIT_LOOP
ping 127.0.0.1 -n 2 > nul
curl.exe -s -o nul -I http://127.0.0.1:3000
if %errorlevel% neq 0 (
    goto WAIT_LOOP
)

echo [4/4] Da san sang! Dang mo trinh duyet...
start http://localhost:3000

echo.
echo ========================================================================
echo    HE THONG DA KHOI DONG THANH CONG!
echo    - Cua so cmd nay se tu dong dong ngay bay gio.
echo    - Moi khi sua code, chi can nhan F5 tren trinh duyet la cap nhat!
echo    - Khi muon tat he thong, chi can nhap dup vao Tat_He_Thong.bat.
echo ========================================================================
echo.
ping 127.0.0.1 -n 3 > nul
exit /b 0
