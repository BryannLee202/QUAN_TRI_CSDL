# 📘 CẨM NANG HƯỚNG DẪN KIỂM THỬ VÀ DEMO ĐỒ ÁN MUSHROOMCLOUD
*Môn học: Hệ Quản Trị Cơ Sở Dữ Liệu (MS SQL Server / T-SQL)*  
*Phụ trách: Hoàng Huy (hoanghuy216412@gmail.com)*

---

## 1. Yêu Cầu Trước Khi Bắt Đầu
- Đảm bảo dịch vụ SQL Server (`SQLEXPRESS01` hoặc `MSSQLSERVER`) đang hoạt động.
- Máy tính đã cài đặt **Node.js LTS (v18 trở lên)**.
- Mở file [`scripts/tai-khoan-demo.txt`](file:///c:/Mushromm/scripts/tai-khoan-demo.txt) để xem thông tin đăng nhập mẫu.

---

## 2. Khởi Động Hệ Thống 1-Click
Chỉ cần click đúp vào file [`Chay_He_Thong.bat`](file:///c:/Mushromm/Chay_He_Thong.bat) ở thư mục gốc:
1. Hệ thống sẽ tự động quét và giải phóng các cổng 3000 & 5000 nếu bị kẹt tiến trình cũ.
2. Tự động bật Backend API (Node.js/Express trên port 5000) và Frontend Web (Next.js 14 trên port 3000).
3. Tự động mở trình duyệt web tại địa chỉ: `http://localhost:3000`.

---

## 3. Các Đường Dẫn Kiểm Thử Trọng Yếu
- **Cổng Khách Hàng (Customer Portal)**: `http://localhost:3000`
- **Trung Tâm Điều Hành Kỹ Thuật Viên (Operator Center)**: `http://localhost:3000/operator`
- **Tài Liệu API Trực Quan (Swagger OpenAPI)**: `http://localhost:5000/api-docs`
- **Endpoint Giám Sát Sức Khỏe**: `http://localhost:5000/api/health`

---

## 4. Kiểm Thử Cơ Sở Dữ Liệu Tự Động
Mở PowerShell tại thư mục dự án và chạy:
```bash
node scripts/test-runner.js
```
Bộ test runner sẽ tự động thực thi 3 vòng lặp liên tiếp trên cả 6 kịch bản kiểm thử CSDL (`test_end_to_end_lifecycle.sql`, `test_sp_create_rental_order.sql`, `test_concurrency_race_condition.sql`, `test_constraints_and_integrity.sql`, `test_sp_harvest_and_qr.sql`, `test_audit_and_security.sql`) với kết quả cam kết **100% PASS**.
