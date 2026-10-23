# 🧪 HƯỚNG DẪN QUY TRÌNH KIỂM THỬ CƠ SỞ DỮ LIỆU SMARTMUSHROOMDB
### Hệ Thống Quản Lý Nuôi Trồng Nấm Thông Minh & Cho Thuê (MushroomCloud)
### Người phụ trách kỹ thuật: Lê Minh Tài (Trưởng nhóm - Lead Architect)

---

## 📋 1. Danh Mục Các Bộ Kiểm Thử (Test Suites)

Thư mục `/tests` chứa các kịch bản kiểm thử độc lập ở tầng Hệ quản trị Cơ sở dữ liệu (Microsoft SQL Server / T-SQL):

| Tệp Kiểm Thử | Mục Tiêu & Kịch Bản Kiểm Chứng | Kết Quả Mong Đợi |
| :--- | :--- | :--- |
| **`test_sp_create_rental_order.sql`** | - **Test 1**: Thuê khay trống hợp lệ (Happy path).<br>- **Test 2**: Chống Overbooking khi cố tình đặt trùng khay đang nuôi (Race Condition).<br>- **Test 3**: Từ chối dữ liệu rác (Gói thuê không tồn tại). | Toàn bộ 3 bài test đều trả về `[PASS]`. Giao dịch tự `ROLLBACK` an toàn khi có lỗi, khay chuyển trạng thái chuẩn xác. |
| **`test_constraints_and_integrity.sql`** | - **Test 1**: Ràng buộc CHECK độ ẩm buồng nuôi ($0 - 100\%$).<br>- **Test 2**: Ràng buộc UNIQUE chống trùng mã QR định danh khay nấm.<br>- **Test 3**: Ràng buộc CHECK miền giá trị trạng thái khay nấm. | SQL Server tự động kích hoạt ràng buộc toàn vẹn chặn đứng các câu lệnh vi phạm, trả về `[PASS]`. |

---

## 🚀 2. Hướng Dẫn Thực Thi Kiểm Thử

### Cách 1: Chạy trực tiếp trong SQL Server Management Studio (SSMS) - Khuyên dùng
1. Mở **SSMS** và kết nối vào máy chủ SQL Server của bạn.
2. Đảm bảo đã chạy khởi tạo CSDL và nạp dữ liệu mẫu bằng cách thực thi lần lượt:
   - `database/01_schema.sql`
   - `database/02_tsql_logic.sql`
   - `database/03_seed_data.sql`
3. Mở tệp `tests/test_sp_create_rental_order.sql` và bấm **Execute (phím F5)**.
4. Mở tab **Messages** bên dưới để xem bảng tổng kết kết quả:
   ```text
   ======================================================================
   TỔNG KẾT KẾT QUẢ KIỂM THỬ:
   - Tổng số bài test: 3
   - Số bài ĐẠT (PASS): 3
   - Số bài LỖI (FAIL): 0
   >>> XÁC NHẬN: STORED PROCEDURE ĐẠT CHUẨN AN TOÀN ACID VÀ SẴN SÀNG VẬN HÀNH! <<<
   ======================================================================
   ```
5. Mở tiếp tệp `tests/test_constraints_and_integrity.sql` và bấm **Execute (phím F5)** để xác nhận toàn vẹn ràng buộc.

### Cách 2: Chạy tự động qua dòng lệnh bằng công cụ `sqlcmd`
```powershell
# Chạy bộ test giao dịch Stored Procedure
sqlcmd -S localhost -d SmartMushroomDB -E -i tests/test_sp_create_rental_order.sql

# Chạy bộ test ràng buộc toàn vẹn CSDL
sqlcmd -S localhost -d SmartMushroomDB -E -i tests/test_constraints_and_integrity.sql
```

---

## 🎯 3. Ý Nghĩa Đối Với Hội Đồng Chấm Điểm
- Minh chứng cho giảng viên thấy hệ thống áp dụng phương pháp **Test-Driven Database Development (TDDD)**.
- Chứng minh khả năng tự bảo vệ dữ liệu ở tầng CSDL: Dù hacker có vượt qua tầng giao diện thì tầng CSDL vẫn chặn đứng mọi hành vi gây sai lệch dữ liệu.
