@echo off
title MushroomCloud - Khoi Chay An Danh

:: 1. Giai phong cong mang 3000 va 5000 truoc khi khoi chay
node "%~dp0scripts/free-ports.js" > nul 2>&1

:: 2. Khoi chay Backend va Frontend chay ngam hoan toan (khong hien cua so hay icon taskbar)
powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c cd /d \""%~dp0backend\"" && npm run dev' -WindowStyle Hidden"
powershell -NoProfile -Command "Start-Process cmd -ArgumentList '/c cd /d \""%~dp0frontend\"" && npm run dev' -WindowStyle Hidden"

:: 3. Cho he thong san sang va tu dong mo trinh duyet
ping 127.0.0.1 -n 5 > nul
start http://localhost:3000

:: 4. Tu dong dong ngay cua so bat nay, giu thanh taskbar hoan toan sach dep!
exit
