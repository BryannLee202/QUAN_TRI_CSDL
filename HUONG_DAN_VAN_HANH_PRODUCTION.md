# CẨM NANG VẬN HÀNH HỆ THỐNG MUSHROOMCLOUD (PRODUCTION GUIDE)

Tài liệu hướng dẫn triển khai, vận hành, bảo mật và sao lưu dữ liệu cho nền tảng **MushroomCloud - Smart Mushroom Farm FaaS** trên môi trường máy chủ sản xuất (Production VPS / Cloud Server).

---

## 1. SƠ ĐỒ KIẾN TRÚC MÁY CHỦ (PRODUCTION ARCHITECTURE)

```
[ Internet / Client Browser ]
             │
             ▼ HTTPS (Port 443) / HTTP (Port 80)
┌────────────────────────────────────────────────────────┐
│               Nginx Reverse Proxy Server               │
│  - SSL Termination (Let's Encrypt)                     │
│  - Gzip Compression (Level 6)                         │
│  - Static Asset Caching (30 Days)                      │
└────────────┬───────────────────────────────┬───────────┘
             │                               │
    Proxy /  │                      Proxy /api/ & /socket.io/
             ▼                               ▼
┌────────────────────────┐      ┌────────────────────────┐
│  Next.js 14 Frontend   │      │   Node.js Backend      │
│  - Production SSR/SSG  │      │   - Managed by PM2     │
│  - Port 3000           │      │   - Port 5000          │
└────────────────────────┘      └────────────┬───────────┘
                                             │
                                     T-SQL Driver (Pool)
                                             ▼
                                ┌────────────────────────┐
                                │ MS SQL Server Database │
                                │ - SmartMushroomDB      │
                                │ - Port 1433            │
                                └────────────────────────┘
```

---

## 2. QUẢN TRỊ TIẾN TRÌNH BACKEND VỚI PM2

File cấu hình chính: `ecosystem.config.cjs`

### Các lệnh điều khiển hàng ngày:
```bash
# Cài đặt PM2 toàn cục (nếu chưa có)
npm install -g pm2

# Khởi chạy Backend dưới sự giám sát của PM2
pm2 start ecosystem.config.cjs

# Xem bảng trạng thái RAM, CPU, Uptime
pm2 status

# Xem nhật ký log thời gian thực
pm2 logs mushroomcloud-backend

# Khởi động lại ứng dụng không gián đoạn
pm2 reload mushroomcloud-backend

# Thiết lập PM2 tự khởi động cùng hệ điều hành khi máy chủ reboot
pm2 startup
pm2 save
```

---

## 3. CẤU HÌNH NGINX REVERSE PROXY & SSL

File cấu hình mẫu: `nginx/mushroomcloud.conf`

### Các bước kích hoạt trên Ubuntu/Debian:
```bash
# Copy file cấu hình vào Nginx
sudo cp nginx/mushroomcloud.conf /etc/nginx/sites-available/mushroomcloud.conf

# Kích hoạt site qua symbolic link
sudo ln -s /etc/nginx/sites-available/mushroomcloud.conf /etc/nginx/sites-enabled/

# Kiểm tra cú pháp Nginx
sudo nginx -t

# Tải lại Nginx
sudo systemctl reload nginx

# Cài đặt chứng chỉ bảo mật SSL HTTPS miễn phí tự động gia hạn
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d mushroomcloud.vn -d www.mushroomcloud.vn
```

---

## 4. CHIẾN LƯỢC SAO LƯU DỮ LIỆU CSDL (DATABASE BACKUP)

Hệ Quản Trị CSDL **SmartMushroomDB** cần được duy trì chính sách sao lưu định kỳ:
1. **Full Backup**: Thực hiện vào lúc 02:00 sáng mỗi Chủ Nhật.
2. **Differential Backup**: Thực hiện vào lúc 02:00 sáng mỗi ngày từ Thứ Hai đến Thứ Bảy.
3. **Transaction Log Backup**: Thực hiện mỗi 4 giờ một lần trong ngày.

### Script T-SQL Sao Lưu Tự Động:
```sql
-- Sao lưu Full cơ sở dữ liệu SmartMushroomDB
BACKUP DATABASE [SmartMushroomDB]
TO DISK = N'C:\Backups\SmartMushroomDB_Full.bak'
WITH NOFORMAT, NOINIT,
NAME = N'SmartMushroomDB-Full Database Backup',
SKIP, NOREWIND, NOUNLOAD, STATS = 10;
GO
```

---

## 5. XỬ LÝ SỰ CỐ NHANH (TROUBLESHOOTING)

| Triệu chứng | Nguyên nhân có thể | Cách khắc phục |
| :--- | :--- | :--- |
| Cổng 5000 hoặc 3000 báo bận (`EADDRINUSE`) | Tiến trình cũ chưa tắt hẳn | Chạy lệnh `node scripts/free-ports.js` |
| Kết nối CSDL SQL Server bị từ chối | Dịch vụ SQL Server bị tắt hoặc sai port | Chạy `net start MSSQL$SQLEXPRESS01` và kiểm tra file `.env` |
| API trả mã lỗi 403 `CSRF_TOKEN_MISMATCH` | Token Double Submit Cookie không khớp | Kiểm tra cookie `XSRF-TOKEN` và header `x-xsrf-token` của client |
