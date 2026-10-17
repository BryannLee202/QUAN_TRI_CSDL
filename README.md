# 🍄 MushroomCloud - Smart Mushroom Cultivation & Rental Platform
### Hệ Thống Quản Lý Nuôi Trồng Nấm Thông Minh Tích Hợp Cho Thuê & Giám Sát Từ Xa (FaaS)

[![Database: Microsoft SQL Server](https://img.shields.io/badge/Database-MS%20SQL%20Server%202022-CC292B?logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![T-SQL Stored Procedures](https://img.shields.io/badge/T--SQL-Procedures%20%26%20Triggers-0078D4)](https://docs.microsoft.com/sql/t-sql/)
[![Node.js & TypeScript](https://img.shields.io/badge/Backend-Node.js%20%26%20TypeScript-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React & Next.js](https://img.shields.io/badge/Frontend-Next.js%20%26%20React-black?logo=next.js)](https://nextjs.org/)
[![IoT Realtime](https://img.shields.io/badge/IoT-Telemetry%20%26%20WebSocket-10B981)](https://socket.io/)

---

## 📖 1. Giới Thiệu Dự Án

**MushroomCloud** là nền tảng thương mại dịch vụ và điều hành nuôi trồng nấm thông minh theo mô hình **"Farm as a Service" (FaaS)**:
- **Khách hàng (Customer)**: Thuê khay nấm trực tuyến từ xa, giám sát vi khí hậu (Nhiệt độ, Độ ẩm, $\text{CO}_2$) thời gian thực 24/7, xem camera luồng trực tiếp và tua timelapse nấm lớn từng ngày, đặt lệnh thu hoạch đóng gói ship tận nhà.
- **Trang trại & Vận hành (Farm Operator / Admin)**: Quản lý ma trận khay nuôi trồng bằng mã QR Code, tự động hóa điều khiển thiết bị vi khí hậu (máy phun sương, quạt thông gió), bắt lỗi cảnh báo tức thì thông qua **DML Triggers T-SQL** và theo dõi báo cáo doanh thu.

---

## 🏗️ 2. Kiến Trúc Hệ Thống (3-Tier & BFF Pattern)

```text
[ Trình Duyệt Web Khách Hàng ]     [ Dashboard Quản Trị Viên ]     [ IoT Simulator / ESP32 ]
            │                                    │                                  │
            └─────────────────────┬──────────────┴──────────────────────────────────┘
                                  ▼
                   [ Backend API (Node.js / Express) ]
                   - RESTful API & JWT Authentication
                   - WebSocket / SignalR Realtime Hub
                                  │
                                  ▼ (Port 1433 / mssql)
            [ Microsoft SQL Server 2022 (SmartMushroomDB) ]
            - Stored Procedures (Giao dịch ACID & Khóa dòng UPDLOCK)
            - DML Triggers (Tự động bắt lỗi vi khí hậu & Ghi log thiết bị)
            - Views (Thống kê tỷ lệ lấp đầy & Báo cáo doanh thu)
            - Composite Indexes & Filtered Indexes
```

---

## 🗄️ 3. Cơ Sở Dữ Liệu `SmartMushroomDB` (Chuẩn Hóa 3NF)

Toàn bộ kịch bản CSDL được lưu trữ tại thư mục [`/database`](./database):

1. [`01_schema.sql`](./database/01_schema.sql): Khởi tạo CSDL, 11 bảng chuẩn 3NF, khóa chính PK, khóa ngoại FK và ràng buộc CHECK:
   - `Roles`, `Users`: Phân quyền RBAC (Admin, Operator, Customer).
   - `Rooms`, `MushroomSpecies`: Buồng nuôi và danh mục nấm (Bào ngư, Hoàng kim, Hầu thủ, Linh chi, Đông trùng hạ thảo).
   - `RentalPackages`, `RentalOrders`: Gói thuê và hợp đồng điện tử.
   - `CultivationTrays`: Khay nấm có mã QR định danh duy nhất (`TRAY-RM01-R01-01`).
   - `SensorData`, `SensorAlerts`: Dữ liệu chuỗi thời gian IoT và cảnh báo vi khí hậu.
   - `GrowthLogs`, `HarvestRequests`, `DeviceActionLogs`: Nhật ký sinh trưởng, yêu cầu thu hoạch và điều khiển phần cứng.

2. [`02_tsql_logic.sql`](./database/02_tsql_logic.sql): Bộ não T-SQL nâng cao:
   - **`sp_CreateRentalOrder`**: Giao dịch ACID với kỹ thuật khóa dòng `WITH (UPDLOCK, ROWLOCK)` ngăn chặn tuyệt đối tình trạng race condition / overbooking.
   - **`sp_AssignTrayToOrder`**: Quét mã QR gán khay thực tế vào đơn thuê.
   - **`sp_RequestHarvest`** & **`sp_CompleteHarvest`**: Quy trình yêu cầu và hoàn tất thu hoạch khay nấm.
   - **`trg_CheckSensorThresholds`**: Trigger `AFTER INSERT` trên bảng `SensorData`, tự động phát hiện vi khí hậu bất thường và kích hoạt quạt thông gió.
   - **`vw_RoomOccupancyReport`** & **`vw_CustomerActiveRentals`**: Các Views phục vụ Dashboard tức thì.

3. [`03_seed_data.sql`](./database/03_seed_data.sql): Dữ liệu mẫu phong phú gồm 5 tài khoản mẫu, 70 khay nấm, các loài nấm quý, đơn thuê thực tế có sẵn ảnh nhật ký sinh trưởng và 24h chuỗi thời gian cảm biến.

4. [`04_indexing_and_performance.sql`](./database/04_indexing_and_performance.sql): Thiết kế chỉ mục Composite Non-Clustered Index có `INCLUDE` và Filtered Index kèm kịch bản đo lường hiệu năng `SET STATISTICS IO, TIME ON`.

---

## 🚀 4. Hướng Dẫn Cài Đặt Cơ Sở Dữ Liệu

### Cách 1: Chạy trực tiếp qua SQL Server Management Studio (SSMS)
1. Mở SSMS và kết nối vào SQL Server (`localhost` hoặc tên máy chủ của bạn).
2. Mở file `database/01_schema.sql` và bấm **Execute (F5)**.
3. Tiếp tục mở và thực thi lần lượt: `02_tsql_logic.sql` $\rightarrow$ `03_seed_data.sql` $\rightarrow$ `04_indexing_and_performance.sql`.

### Cách 2: Khởi chạy 1 lệnh bằng Docker Compose (Khuyên Dùng)
```bash
docker compose up -d
```
Hệ thống sẽ tự động khởi động SQL Server trên cổng 1433 và nạp toàn bộ cấu trúc bảng cùng dữ liệu mẫu.

---

## 👥 5. Thành Viên Nhóm Phát Triển
* **Lê Minh Tài (Trưởng nhóm)**: Thiết kế Kiến trúc hệ thống, Mô hình CSDL ERD 3NF & Stored Procedure giao dịch lõi.
* **Hoàng Huy**: Thiết kế CSDL T-SQL, DML Triggers vi khí hậu & Chiến lược Indexing.
* **Nguyễn Thanh Hi...**: Phát triển Backend Web API, JWT Security & Tích hợp Stored Procedures.
* **Đăng**: Phát triển Giao diện Web, Landing Page 3D Three.js & Cổng Giám sát Khách hàng.
* **Võ Duy Thịnh**: Phát triển Trung tâm Điều hành Kỹ thuật viên, IoT Telemetry Simulator & DevOps.
