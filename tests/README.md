# HƯỚNG DẪN QUY TRÌNH KIỂM THỬ CƠ SỞ DỮ LIỆU SMARTMUSHROOMDB
### Hệ Thống Quản Lý Nuôi Trồng Nấm Thông Minh & Cho Thuê (MushroomCloud)
### Phụ trách kỹ thuật: Lê Minh Tài (Trưởng nhóm / Database Lead)

---

## 1. Danh Mục Các Bộ Kiểm Thử (Test Suites)

Thư mục `/tests` chứa các kịch bản kiểm thử độc lập ở tầng Hệ quản trị Cơ sở dữ liệu (Microsoft SQL Server / T-SQL):

| Tệp Kiểm Thử | Mục Tiêu & Kịch Bản Kiểm Chứng | Kết Quả Mong Đợi |
| :--- | :--- | :--- |
| **`test_end_to_end_lifecycle.sql`** | Kiểm thử toàn diện chu trình sống khép kín của đơn thuê: Đặt thuê (`sp_CreateRentalOrder`) -> Quét QR (`sp_AssignTrayToOrder`) -> Cảm biến kích hoạt Trigger -> Cổng khách hàng -> Thu hoạch (`sp_RequestHarvest`, `sp_CompleteHarvest`) -> Khử trùng khay -> Báo cáo doanh thu & công suất buồng. | 8/8 bước kiểm thử đạt `[PASS]`, dữ liệu chuyển đổi trạng thái nguyên tử, không phát sinh lỗi ngoại lệ. |
| **`test_concurrency_race_condition.sql`** | Mô phỏng 2 tiến trình song song cùng tranh chấp 1 khay trống duy nhất trong buồng nuôi; kiểm tra cơ chế khóa dòng `UPDLOCK, ROWLOCK`. | Tiến trình 1 thành công; Tiến trình 2 bị chặn an toàn và rollback. Không bao giờ phát sinh gán trùng khay (Zero Overbooking). |
| **`test_concurrency_runner.ts`** | Kiểm thử tải bất đồng bộ: Bắn đồng thời 10 yêu cầu đặt thuê khay nấm song song qua `Promise.all` tại cùng mili-giây vào buồng chỉ còn 2 chỗ. | Đúng 2 yêu cầu thành công, 8 yêu cầu bị từ chối với mã lỗi phòng kín chỗ, 0 khay bị trùng lặp. |
| **`test_sp_create_rental_order.sql`** | Kiểm thử các trường hợp biên của thủ tục đặt thuê: Đặt khay hợp lệ (Happy path), kiểm tra ràng buộc khóa dòng và tự động rollback khi gặp dữ liệu không hợp lệ. | Toàn bộ các test case đều trả về `[PASS]`, giao dịch tự `ROLLBACK` an toàn khi có lỗi. |
| **`test_sp_harvest_and_qr.sql`** | Kiểm chứng quy trình nghiệp vụ: Quét mã QR gán khay, gửi yêu cầu thu hoạch và hoàn tất nghiệm thu sản lượng. | Toàn bộ 4 kịch bản đạt `[PASS]`, khay chuyển từ `OCCUPIED` sang `MAINTENANCE`. |
| **`test_constraints_and_integrity.sql`** | Kiểm tra ràng buộc toàn vẹn miền giá trị CHECK (Nhiệt độ, độ ẩm, nồng độ CO2) và ràng buộc UNIQUE chống trùng mã khay vật lý. | SQL Server tự động kích hoạt ràng buộc toàn vẹn chặn đứng các câu lệnh vi phạm dữ liệu. |

---

## 2. Hướng Dẫn Thực Thi Kiểm Thử

### Cách 1: Chạy trực tiếp trong SQL Server Management Studio (SSMS) - Khuyên dùng
1. Mở **SSMS** và kết nối vào máy chủ SQL Server (`.\SQLEXPRESS01` hoặc `localhost`).
2. Mở tệp kịch bản muốn kiểm tra trong thư mục `tests/`:
   - `tests/test_end_to_end_lifecycle.sql` (Kịch bản toàn diện khuyên dùng cho demo)
   - `tests/test_concurrency_race_condition.sql`
   - `tests/test_sp_create_rental_order.sql`
   - `tests/test_sp_harvest_and_qr.sql`
   - `tests/test_constraints_and_integrity.sql`
3. Nhấn **Execute (phím F5)** để chạy và quan sát kết quả chi tiết trên tab `Messages`.

### Cách 2: Chạy kiểm thử tải song song tự động bằng Node.js / TypeScript
```bash
cd backend
npx tsx ../tests/test_concurrency_runner.ts
```

### Cách 3: Chạy tự động qua dòng lệnh bằng công cụ `sqlcmd`
```powershell
# Chạy bộ test vòng đời toàn diện
sqlcmd -S ".\SQLEXPRESS01" -d SmartMushroomDB -E -C -I -i tests/test_end_to_end_lifecycle.sql

# Chạy bộ test tranh chấp đồng thời
sqlcmd -S ".\SQLEXPRESS01" -d SmartMushroomDB -E -C -I -i tests/test_concurrency_race_condition.sql

# Chạy bộ test ràng buộc toàn vẹn CSDL
sqlcmd -S ".\SQLEXPRESS01" -d SmartMushroomDB -E -C -I -i tests/test_constraints_and_integrity.sql
```

---

## 3. Tiêu Chuẩn Kỹ Thuật Đạt Được
- **Áp dụng phương pháp Test-Driven Database Development (TDDD)**: Toàn bộ Stored Procedures, Views, Triggers và Constraints đều có kịch bản kiểm thử độc lập đi kèm.
- **Bảo toàn dữ liệu ACID**: Khóa mức hàng `WITH (UPDLOCK, ROWLOCK)` kết hợp `SET XACT_ABORT ON` đảm bảo tính nhất quán tuyệt đối trong môi trường đa người dùng.
