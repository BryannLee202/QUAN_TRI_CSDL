# 🍄 MushroomCloud - Smart Mushroom Cultivation & Rental Platform
### Hệ Thống Quản Lý Nuôi Trồng Nấm Thông Minh Tích Hợp Cho Thuê & Giám Sát Từ Xa (FaaS)

[![Database: Microsoft SQL Server](https://img.shields.io/badge/Database-MS%20SQL%20Server%202022-CC292B?logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![T-SQL Stored Procedures](https://img.shields.io/badge/T--SQL-Procedures%20%26%20Triggers-0078D4)](https://docs.microsoft.com/sql/t-sql/)
[![Node.js & Express](https://img.shields.io/badge/Backend-Node.js%20%26%20Express%20(TS)-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React & Next.js](https://img.shields.io/badge/Frontend-Next.js%2014%20(App%20Router)-black?logo=next.js)](https://nextjs.org/)
[![Realtime: Socket.io](https://img.shields.io/badge/Realtime-Socket.io%20Hub-010101?logo=socket.io)](https://socket.io/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Theme-Scandinavian%20Luxury-0D5C3A?logo=tailwindcss)](https://tailwindcss.com/)
[![DevOps: Docker](https://img.shields.io/badge/DevOps-Docker%20Compose-2496ED?logo=docker)](https://www.docker.com/)

---

## 📖 1. Giới Thiệu Dự Án

**MushroomCloud** là nền tảng thương mại dịch vụ và điều hành nuôi trồng nấm công nghệ cao theo mô hình **Farm-as-a-Service (FaaS)**:
- **Khách hàng (Customer)**: Thuê khay nấm trực tuyến từ xa, theo dõi các chỉ số vi khí hậu (Nhiệt độ, Độ ẩm, nồng độ $\text{CO}_2$, Cường độ sáng) theo thời gian thực 24/7, theo dõi nhật ký phát triển của nấm và nhận nông sản tươi sạch tận nhà khi đến kỳ thu hoạch.
- **Kỹ thuật viên trang trại (Operator)**: Vận hành buồng nấm qua mã định danh QR Code, tự động hóa thiết bị vi khí hậu (máy phun ẩm, quạt thông gió), tiếp nhận cảnh báo tức thời khi môi trường có sự cố và nghiệm thu sản lượng thu hoạch.
- **Quản trị viên (Admin)**: Theo dõi công suất phòng nuôi, tỷ lệ lấp đầy khay và báo cáo doanh thu tài chính tổng hợp.

---

## 🏗️ 2. Kiến Trúc Hệ Thống (3-Tier & Fullstack Web Pattern)

```text
[ Trình Duyệt Web Khách Hàng ]     [ Dashboard Kỹ Thuật Viên ]     [ IoT Simulator / Hardware ]
       (Next.js 14)                       (Next.js 14)                 (Python / MQTT / Socket)
            │                                  │                                  │
            └───────────────────┬──────────────┴──────────────────────────────────┘
                                │ HTTP / WebSocket
                                ▼
                 [ Backend API & Realtime Hub ]
                 - Node.js & Express (TypeScript)
                 - Socket.io Gateway: Phát sóng telemetry & cảnh báo tức thì
                 - JWT Authentication & Phân quyền RBAC (Admin, Operator, Customer)
                 - MSSQL Connection Pool (Cổng 1433)
                                │
                                ▼
                 [ Microsoft SQL Server 2022 ]
                 - 11 bảng chuẩn hóa 3NF, ràng buộc CHECK và khóa ngoại FK
                 - Stored Procedures với khóa mức hàng (UPDLOCK, ROWLOCK)
                 - DML Triggers: Tự động kiểm tra vi khí hậu & bật/tắt thiết bị
                 - Views: Báo cáo công suất buồng (Occupancy) & Doanh thu hàng tháng
                 - Non-clustered Composite Indexes có INCLUDE & Filtered Indexes
```

---

## 🗄️ 3. Cơ Sở Dữ Liệu `SmartMushroomDB` (Chuẩn Hóa 3NF)

Toàn bộ kịch bản CSDL được lưu trữ tại thư mục [`/database`](./database):

1. **[`01_schema.sql`](./database/01_schema.sql)** - Khởi tạo cấu trúc 11 bảng chuẩn 3NF:
   - `Roles`, `Users`: Quản lý tài khoản và phân quyền hệ thống.
   - `Rooms`, `MushroomSpecies`: Buồng nuôi vi khí hậu và danh mục loài nấm.
   - `RentalPackages`, `RentalOrders`: Gói dịch vụ và hợp đồng thuê khay nấm.
   - `CultivationTrays`: Khay nấm có mã QR định danh duy nhất (`TRAY-RM01-R01-001`).
   - `SensorData`, `SensorAlerts`: Chuỗi thời gian cảm biến và cảnh báo vượt ngưỡng.
   - `GrowthLogs`, `HarvestRequests`, `DeviceActionLogs`: Nhật ký sinh trưởng, quy trình thu hoạch và nhật ký điều khiển thiết bị.

2. **[`02_tsql_logic.sql`](./database/02_tsql_logic.sql)** - T-SQL nâng cao:
   - `sp_CreateRentalOrder`: Giao dịch ACID với kỹ thuật khóa mức hàng `WITH (UPDLOCK, ROWLOCK)` ngăn chặn overbooking.
   - `sp_AssignTrayToOrder`: Quét mã QR gán khay vật lý vào đơn thuê.
   - `sp_InsertSensorData`: Tiếp nhận dữ liệu cảm biến đo đạc vi khí hậu.
   - `sp_RequestHarvest` & `sp_CompleteHarvest`: Quy trình gửi yêu cầu và chốt sản lượng thu hoạch.
   - `trg_CheckSensorThresholds`: Trigger `AFTER INSERT` trên `SensorData`, tự động phát hiện vượt ngưỡng và kích hoạt `EXHAUST_FAN`.
   - `vw_RoomOccupancyReport`, `vw_CustomerActiveRentals`, `vw_MonthlyRevenueReport`: Các Views phục vụ báo cáo.

3. **[`03_seed_data.sql`](./database/03_seed_data.sql)** - Dữ liệu mẫu phong phú:
   - 8 tài khoản mẫu (BCrypt hash chuẩn `$2b$10$`), 70 khay nấm, 16 đơn hàng mẫu và dữ liệu cảm biến mô phỏng.

4. **[`04_indexing_and_performance.sql`](./database/04_indexing_and_performance.sql)** - Tối ưu hóa chỉ mục:
   - Composite Non-Clustered Index có `INCLUDE` trên `SensorData(RoomID, RecordedAt)`.
   - Filtered Index trên `SensorAlerts(RoomID, AlertTime)` với điều kiện `WHERE IsResolved = 0`.
   - Bảng thử nghiệm benchmark 1 triệu dòng dữ liệu để đo lường `STATISTICS IO, TIME`.

---

## 🚀 4. Hướng Dẫn Cài Đặt & Khởi Chạy Nhanh

### Bước 1: Khởi tạo Cơ sở dữ liệu SQL Server
- Mở **SSMS (SQL Server Management Studio)**, kết nối vào máy chủ SQL Server cục bộ (`.\SQLEXPRESS01` hoặc `localhost`).
- Chạy lần lượt các file trong thư mục `database/`:
  1. `database/01_schema.sql`
  2. `database/02_tsql_logic.sql`
  3. `database/03_seed_data.sql`
  4. `database/04_indexing_and_performance.sql`
*(Hoặc chạy lệnh gộp qua file `database/run_all.sql` ở chế độ SQLCMD Mode)*.

### Bước 2: Khởi chạy Backend API & Realtime Hub
```bash
cd backend
npm install
npm run dev
```
👉 Server sẽ khởi động tại: **`http://localhost:5000`** (Kết nối CSDL và Socket.io Hub sẵn sàng).

### Bước 3: Khởi chạy Frontend Web
```bash
cd frontend
npm install
npm run dev
```
👉 Mở trình duyệt truy cập: **`http://localhost:3000`** để xem giao diện web.

### Bước 4: Khởi chạy Giả lập Cảm biến IoT (Tùy chọn)
```bash
cd iot_simulator
pip install -r requirements.txt
python simulator.py
```

---

## 🎬 5. Kịch Bản Demo Toàn Diện (Demo Guide Từng Bước)

Dành cho các buổi báo cáo, thuyết trình hoặc kiểm tra hệ thống:

### 🟢 Kịch bản Demo 1: Kiểm thử Toàn diện Vòng đời Hệ thống (E2E Lifecycle)
- **Mục tiêu**: Chứng minh chu trình dữ liệu khép kín từ lúc khách đặt thuê đến khi thu hoạch thành công trên CSDL.
- **Thao tác**:
  1. Mở file [`tests/test_end_to_end_lifecycle.sql`](./tests/test_end_to_end_lifecycle.sql) trong SSMS.
  2. Nhấn **Execute (F5)** (hoặc chạy qua lệnh PowerShell: `sqlcmd -S ".\SQLEXPRESS01" -d SmartMushroomDB -E -C -I -i tests/test_end_to_end_lifecycle.sql`).
  3. **Quan sát tab Messages**:
     - Bước 1: Khách đặt thuê (`sp_CreateRentalOrder`) $\rightarrow$ Khay chuyển `OCCUPIED`.
     - Bước 2: Kỹ thuật viên quét QR gán khay (`sp_AssignTrayToOrder`) $\rightarrow$ Xác nhận hợp lệ.
     - Bước 3: IoT gửi bản tin CO2 = 1450 ppm $\rightarrow$ Trigger kích hoạt cảnh báo và tự động bật quạt hút `EXHAUST_FAN`.
     - Bước 4: Cổng khách hàng cập nhật tiến độ nuôi qua `vw_CustomerActiveRentals`.
     - Bước 5: Khách gửi yêu cầu thu hoạch (`sp_RequestHarvest`) $\rightarrow$ Trạng thái `REQUESTED`.
     - Bước 6: Kỹ thuật viên chốt sản lượng 2.45 kg (`sp_CompleteHarvest`) $\rightarrow$ Khay sang `MAINTENANCE`.
     - Bước 7: Khử trùng khay $\rightarrow$ Khay hoàn trả về `AVAILABLE`.
     - Bước 8: Báo cáo công suất buồng và doanh thu nhảy số chính xác.
     - **Kết quả: 8/8 bước PASS (100%)**.

---

### 🟡 Kịch bản Demo 2: Kiểm thử Tranh chấp Đồng thời & Khóa Dòng (Concurrency & Race Condition)
- **Mục tiêu**: Chứng minh khóa dòng `WITH (UPDLOCK, ROWLOCK)` ngăn chặn 100% tình trạng đặt trùng khay (Zero Overbooking).
- **Thao tác**:
  - **Cách 1 (T-SQL)**: Mở [`tests/test_concurrency_race_condition.sql`](./tests/test_concurrency_race_condition.sql) trong SSMS $\rightarrow$ Bấm **F5**.
    - Tiến trình 1 chiếm khay thành công.
    - Tiến trình 2 cùng lúc bị chặn an toàn và rollback: `Lỗi: Phòng nuôi trồng hiện đã kín khay trống!`.
  - **Cách 2 (TypeScript Runner - 10 Request song song)**:
    ```bash
    cd backend
    npx tsx ../tests/test_concurrency_runner.ts
    ```
    - 10 luồng Promise bắn cùng mili-giây vào phòng chỉ còn 2 chỗ. Kết quả: Đúng 2 đơn thành công, 8 đơn bị từ chối an toàn, 0 khay bị trùng lặp.
- *Xem tài liệu kỹ thuật chi tiết tại: [`docs/Bao_Cao_Kiem_Thu_Dong_Thoi_T-SQL.md`](./docs/Bao_Cao_Kiem_Thu_Dong_Thoi_T-SQL.md).*

---

### 🔵 Kịch bản Demo 3: Mô phỏng Sự cố Môi trường & Socket.io Realtime
- **Mục tiêu**: Kiểm tra khả năng tự phục hồi của Trigger T-SQL kết hợp truyền dữ liệu không độ trễ qua Socket.io.
- **Thao tác**:
  1. Mở Terminal 1 (Kiểm tra lắng nghe Socket):
     ```bash
     node backend/scripts/socket-test.js
     ```
  2. Mở Terminal 2 (Bơm sự cố CO2 vượt ngưỡng):
     ```bash
     python iot_simulator/trigger_anomaly.py --room 1 --co2 1450
     ```
  3. **Kết quả**:
     - CSDL kích hoạt Trigger `trg_CheckSensorThresholds`, ghi nhận cảnh báo `HIGH_CO2` vào `SensorAlerts` và ghi lệnh bật `EXHAUST_FAN` vào `DeviceActionLogs`.
     - Socket.io phát sự kiện `alert:new` và `device:action` ngay lập tức xuống màn hình mà không cần tải lại trang.

---

### 🟣 Kịch bản Demo 4: Tối ưu Hóa Chỉ Mục & Đo Lường 1 Triệu Dòng (Indexing Benchmark)
- **Mục tiêu**: So sánh chi phí truy vấn trước và sau khi đánh chỉ mục trên bảng 1.000.000 dòng.
- **Thao tác**:
  1. Mở file [`database/04_indexing_and_performance.sql`](./database/04_indexing_and_performance.sql) trong SSMS.
  2. Chạy khối lệnh tạo bảng benchmark `SensorData_Bench` và `SensorAlerts_Bench`.
  3. Bật **Include Actual Execution Plan (Ctrl + M)** và chạy truy vấn so sánh.
  4. **Kết quả**:
     - Trước chỉ mục: Quét toàn bộ bảng (Table Scan), Logical Reads > 22.000 trang.
     - Sau chỉ mục: Tìm kiếm chỉ mục (Index Seek), Logical Reads giảm xuống < 50 trang (Giảm tải hơn 99% chi phí I/O).

---

## 🔑 6. Tài Khoản Đăng Nhập Mẫu (Demo Credentials)

Tất cả tài khoản trong file `03_seed_data.sql` đều sử dụng chung mật khẩu demo: **`Password123@`**

| Vai trò | Họ tên | Email đăng nhập | Quyền hạn chính |
| :--- | :--- | :--- | :--- |
| **Admin** | Nguyễn Quản Trị | `admin@mushroomcloud.test` | Xem toàn bộ báo cáo doanh thu, quản lý danh mục và người dùng |
| **Operator** | Trần Kỹ Thuật | `operator1@mushroomcloud.test` | Quét mã QR gán khay, xử lý sự cố thiết bị và chốt sản lượng thu hoạch |
| **Operator** | Lê Vận Hành | `operator2@mushroomcloud.test` | Giám sát trạng thái vi khí hậu và bảo trì khay nấm |
| **Customer** | Phạm Minh An | `customer1@mushroomcloud.test` | Thuê khay nấm, xem telemetry thời gian thực và gửi yêu cầu thu hoạch |
| **Customer** | Võ Thu Hà | `customer2@mushroomcloud.test` | Thuê khay nấm và theo dõi lịch sử sinh trưởng |

---

## 👥 7. Phân Công Thành Viên Dự Án

| STT | Thành viên | Vai trò kỹ thuật | Trách nhiệm chính |
| :---: | :--- | :--- | :--- |
| 1 | **Lê Minh Tài** | **Trưởng nhóm / Database Lead & System Architect** | Thiết kế kiến trúc tổng thể, mô hình CSDL 3NF (`01_schema.sql`), Stored Procedures giao dịch lõi (`sp_CreateRentalOrder` với khóa dòng `UPDLOCK, ROWLOCK`), bộ kịch bản kiểm thử đồng thời (`tests/`), kịch bản kiểm thử vòng đời E2E (`test_end_to_end_lifecycle.sql`) và quản lý Git Flow. |
| 2 | **Hoàng Huy** | **T-SQL & Performance Specialist** | Thiết kế DML Triggers cảnh báo vi khí hậu tự động (`trg_CheckSensorThresholds`), Views báo cáo (`vw_RoomOccupancyReport`, `vw_MonthlyRevenueReport`), nạp dữ liệu mẫu 70 khay và thiết kế chỉ mục Composite / Filtered Index với Benchmark 1 triệu dòng (`04_indexing_and_performance.sql`). |
| 3 | **Nguyễn Thanh Hiển** | **Backend & Security Engineer** | Xây dựng khung Backend Node.js / Express (TypeScript), cấu hình kết nối MSSQL Connection Pool, xác thực JWT & bảo mật băm mật khẩu BCrypt, viết các RESTful API quản lý gói thuê, đơn đặt và gọi Stored Procedure. |
| 4 | **Đăng** | **Frontend & UI/UX Engineer** | Thiết kế và xây dựng giao diện ứng dụng Web bằng Next.js 14 App Router và Tailwind CSS theo phong cách Scandinavian & Apple Luxury, hoàn thiện Navbar, Hero Section với HUD vi khí hậu nổi, bảng danh mục gói thuê nấm và cổng khách hàng. |
| 5 | **Võ Duy Thịnh** | **IoT & Realtime Systems Engineer** | Xây dựng kịch bản giả lập cảm biến vi khí hậu Python (`simulator.py`), kịch bản kiểm thử sự cố CO2 (`trigger_anomaly.py`), cổng Socket.io Realtime Gateway phát sóng dữ liệu cảm biến và cấu hình triển khai Docker Compose. |

---

## 🔒 8. Quy Chuẩn Đóng Góp Mã Nguồn (Git Branching Strategy)

- **Nhánh `main`**: Nhánh chính thức, chứa mã nguồn ổn định đã kiểm thử đạt chuẩn 100%.
- **Nhánh chức năng**: Mỗi thành viên làm việc trên nhánh riêng theo quy ước: `feature/<tên-chức-năng>-<tên-thành-viên>` (Ví dụ: `feature/socket-anomaly-thinh`, `feature/indexing-performance-huy`).
- **Quy trình tích hợp**: Tạo Pull Request (PR) $\rightarrow$ Kiểm tra conflict và code review $\rightarrow$ Trưởng nhóm phê duyệt và merge vào `main`.
