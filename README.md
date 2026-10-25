# 🍄 MushroomCloud - Smart Mushroom Cultivation & Rental Platform
### Hệ Thống Quản Lý Nuôi Trồng Nấm Thông Minh Tích Hợp Cho Thuê & Giám Sát Từ Xa (FaaS)

[![Database: Microsoft SQL Server](https://img.shields.io/badge/Database-MS%20SQL%20Server%202022-CC292B?logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![T-SQL Stored Procedures](https://img.shields.io/badge/T--SQL-Procedures%20%26%20Triggers-0078D4)](https://docs.microsoft.com/sql/t-sql/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%26%20Express%20(TS)-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React & Next.js](https://img.shields.io/badge/Frontend-Next.js%20%26%20React-black?logo=next.js)](https://nextjs.org/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Theme-Scandinavian%20Luxury-0D5C3A?logo=tailwindcss)](https://tailwindcss.com/)
[![IoT & Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED?logo=docker)](https://www.docker.com/)

---

## 📖 1. Giới Thiệu Dự Án

**MushroomCloud** là nền tảng thương mại dịch vụ và điều hành nuôi trồng nấm thông minh theo mô hình **"Farm as a Service" (FaaS)**:
- **Khách hàng (Customer)**: Thuê khay nấm trực tuyến từ xa, giám sát vi khí hậu (Nhiệt độ, Độ ẩm, $\text{CO}_2$, Ánh sáng) thời gian thực 24/7, xem buồng nuôi 3D tương tác và nhận nấm tươi sạch đóng gói giao tận nhà.
- **Trang trại & Vận hành (Farm Operator / Technician)**: Quản lý ma trận khay nuôi trồng bằng mã QR Code, tự động hóa điều khiển thiết bị vi khí hậu (máy phun sương, quạt thông gió), bắt lỗi cảnh báo tức thì thông qua **DML Triggers T-SQL** và theo dõi báo cáo tỷ lệ lấp đầy khay.

---

## 🏗️ 2. Kiến Trúc Hệ Thống (3-Tier & Fullstack Web Pattern)

```text
[ Trình Duyệt Web Khách Hàng ]     [ Dashboard Quản Trị Viên ]     [ IoT Simulator / ESP32 ]
            │                                    │                                  │
            └─────────────────────┬──────────────┴──────────────────────────────────┘
                                  ▼
                   [ Backend API (Node.js / Express TypeScript) ]
                   - RESTful API & JWT Authentication
                   - Middleware kiểm tra quyền RBAC (Admin, Technician, Customer)
                                  │
                                  ▼ (Port 1433 / mssql)
             [ Microsoft SQL Server 2022 (SmartMushroomDB) ]
             - Stored Procedures (Giao dịch ACID & Khóa dòng UPDLOCK, ROWLOCK)
             - DML Triggers (Tự động bắt lỗi vi khí hậu & Ghi log thiết bị)
             - Views (Thống kê tỷ lệ lấp đầy & Báo cáo doanh thu)
             - Composite Indexes & Filtered Indexes
```

---

## 🗄️ 3. Cơ Sở Dữ Liệu `SmartMushroomDB` (Chuẩn Hóa 3NF)

Toàn bộ kịch bản CSDL được lưu trữ tại thư mục [`/database`](./database):

1. [`01_schema.sql`](./database/01_schema.sql): Khởi tạo CSDL, 11 bảng chuẩn 3NF, khóa chính PK, khóa ngoại FK và ràng buộc CHECK:
   - `Roles`, `Users`: Phân quyền RBAC (Admin, Technician, Customer).
   - `Rooms`, `MushroomSpecies`: Buồng nuôi và danh mục giống nấm quý (Linh chi đỏ, Đông trùng hạ thảo, Bào ngư xám).
   - `RentalPackages`, `RentalOrders`: Gói thuê và hợp đồng nuôi trồng điện tử.
   - `CultivationTrays`: Khay nấm có mã QR định danh duy nhất (`TRAY-RM01-R01-01`).
   - `SensorData`, `SensorAlerts`: Dữ liệu chuỗi thời gian IoT và cảnh báo vi khí hậu.
   - `GrowthLogs`, `HarvestRequests`, `DeviceActionLogs`: Nhật ký sinh trưởng, yêu cầu thu hoạch và điều khiển phần cứng.

2. [`02_tsql_logic.sql`](./database/02_tsql_logic.sql): Bộ não T-SQL nâng cao:
   - **`sp_CreateRentalOrder`**: Giao dịch ACID với kỹ thuật khóa dòng `WITH (UPDLOCK, ROWLOCK)` ngăn chặn tuyệt đối tình trạng race condition / overbooking.
   - **`sp_AssignTrayToOrder`**: Quét mã QR gán khay thực tế vào đơn thuê.
   - **`sp_RequestHarvest`** & **`sp_CompleteHarvest`**: Quy trình yêu cầu và hoàn tất thu hoạch khay nấm.
   - **`trg_CheckSensorThresholds`**: Trigger `AFTER INSERT` trên bảng `SensorData`, tự động phát hiện vi khí hậu bất thường và kích hoạt quạt thông gió.
   - **`vw_RoomOccupancyReport`** & **`vw_CustomerActiveRentals`**: Các Views phục vụ Dashboard tức thì.

3. [`03_seed_data.sql`](./database/03_seed_data.sql): Dữ liệu mẫu phong phú gồm 5 tài khoản mẫu (mã hóa mật khẩu BCrypt), 70 khay nấm, các loài nấm quý, đơn thuê thực tế có sẵn ảnh nhật ký sinh trưởng và 7 ngày dữ liệu cảm biến mô phỏng.

4. [`04_indexing_and_performance.sql`](./database/04_indexing_and_performance.sql): Thiết kế chỉ mục Composite Non-Clustered Index có `INCLUDE` và Filtered Index kèm kịch bản đo lường hiệu năng `SET STATISTICS IO, TIME ON`.

---

## 🧪 4. Bộ Kiểm Thử Độc Lập Ở Tầng CSDL (Test Suites)

Toàn bộ các bộ kiểm thử do **Lê Minh Tài (Trưởng nhóm)** xây dựng tại thư mục [`/tests`](./tests):

| Tệp Kiểm Thử | Mục Tiêu & Kịch Bản Kiểm Chứng | Kết Quả Mong Đợi |
| :--- | :--- | :--- |
| **`test_concurrency_race_condition.sql`** | Mô phỏng 2 tiến trình song song cùng tranh chấp 1 khay trống duy nhất trong buồng nuôi, kiểm tra cơ chế khóa dòng `UPDLOCK, ROWLOCK`. | Tiến trình 1 thành công; Tiến trình 2 bị chặn an toàn và rollback. Khay nấm không bao giờ bị gán trùng (**Zero Overbooking**). |
| **`test_concurrency_runner.ts`** | Bắn đồng thời 10 yêu cầu đặt thuê khay nấm song song qua Promise.all tại cùng 1 mili-giây vào buồng chỉ còn 2 chỗ. | Đúng 2 yêu cầu thành công, 8 yêu cầu bị từ chối an toàn với mã lỗi phòng kín chỗ, 0 khay bị trùng lặp. |
| **`test_sp_harvest_and_qr.sql`** | Kiểm chứng toàn vẹn chu trình sống của khay nấm từ quét mã QR gán khay (`sp_AssignTrayToOrder`), khách yêu cầu thu hoạch (`sp_RequestHarvest`) đến nghiệm thu sản lượng (`sp_CompleteHarvest`). | Toàn bộ 4 test case đều đạt `[PASS]`, trạng thái đơn và khay chuyển đổi chuẩn xác. |
| **`test_sp_create_rental_order.sql`** | Kiểm thử giao dịch đặt thuê khay hợp lệ (Happy path) và từ chối gói thuê không tồn tại. | Giao dịch tự `ROLLBACK` an toàn khi có lỗi, khay chuyển trạng thái chuẩn xác (`[PASS]`). |
| **`test_constraints_and_integrity.sql`** | Kiểm tra ràng buộc CHECK nhiệt độ, độ ẩm và ràng buộc UNIQUE chống trùng mã QR khay. | SQL Server tự động kích hoạt ràng buộc toàn vẹn chặn đứng các câu lệnh vi phạm (`[PASS]`). |

*Chi tiết phân tích lý thuyết khóa dòng xem tại: [`docs/Bao_Cao_Kiem_Thu_Dong_Thoi_T-SQL.md`](./docs/Bao_Cao_Kiem_Thu_Dong_Thoi_T-SQL.md).*

---

## 🚀 5. Hướng Dẫn Cài Đặt & Chạy Dự Án

### Khởi động Cơ sở dữ liệu:
* **Cách 1 (Docker Compose)**:
  ```bash
  docker compose up -d
  ```
* **Cách 2 (SSMS)**:
  Mở SSMS và thực thi file `database/run_all.sql`.

### Chạy các bài kiểm thử CSDL:
```bash
# Chạy bộ test tranh chấp đồng thời
sqlcmd -S localhost -d SmartMushroomDB -E -i tests/test_concurrency_race_condition.sql

# Chạy bộ test quét QR và nghiệm thu thu hoạch
sqlcmd -S localhost -d SmartMushroomDB -E -i tests/test_sp_harvest_and_qr.sql
```

---

## 👥 6. Phân Công Thành Viên Nhóm

* **Lê Minh Tài (Trưởng nhóm / Database Lead)**: Thiết kế Kiến trúc hệ thống, Mô hình CSDL ERD 3NF, Stored Procedures giao dịch lõi (`sp_CreateRentalOrder` với khóa dòng `UPDLOCK, ROWLOCK`), Kịch bản kiểm thử đồng thời (Concurrency Tests) & Quản lý Git Flow.
* **Hoàng Huy (T-SQL & Performance Specialist)**: Thiết kế CSDL T-SQL, DML Triggers kiểm tra ngưỡng vi khí hậu tự động, Views báo cáo, Composite Indexing & Benchmark I/O.
* **Nguyễn Thanh Hiển (Backend & Security Engineer)**: Phát triển Backend Web API (Node.js/Express TypeScript), JWT RBAC, kết nối MSSQL Pool & Nghiệp vụ đơn thuê nấm.
* **Đăng (Frontend & 3D Web UI Engineer)**: Phát triển Giao diện Web (Next.js 14, Tailwind CSS Scandinavian Luxury), Mô hình 3D buồng nấm tương tác & Cổng khách hàng.
* **Võ Duy Thịnh (IoT & DevOps Engineer)**: Xây dựng Docker Compose SQL Server 2022, Python Telemetry Simulator giả lập cảm biến nhiệt/ẩm/CO2 và Realtime WebSocket Hub.

---

## 🔒 7. Quy Định Đóng Góp Mã Nguồn & Quy Trình Pull Request (Bắt Buộc)

> **QUY TẮC CỦA NHÓM**: 
> 1. Nhánh `main` được bảo vệ bằng **Branch Protection Rule**.
> 2. Các thành viên phải tạo nhánh chức năng riêng từ `main`: `feature/<tên-tính-năng>-<tên-thành-viên>`.
> 3. Sau khi hoàn thành và tự kiểm thử, thành viên đẩy nhánh lên GitHub và tạo **Pull Request (PR)**.
> 4. Trưởng nhóm (**Lê Minh Tài**) kiểm tra code, đánh giá đạt chuẩn và duyệt **Merge vào `main`**.
