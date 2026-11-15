# BÁO CÁO ĐỒ ÁN MÔN HỌC: QUẢN TRỊ CƠ SỞ DỮ LIỆU NÂNG CAO
## ĐỀ TÀI: HỆ THỐNG QUẢN LÝ VÀ ĐIỀU HÀNH NUÔI TRỒNG NẤM THÔNG MINH THEO MÔ HÌNH FARM-AS-A-SERVICE (MUSHROOMCLOUD)

**Đơn vị đào tạo**: Khoa Công nghệ Thông tin – Trường Đại học Sư phạm Kỹ thuật TP. Hồ Chí Minh  
**Học phần**: Quản trị Cơ sở Dữ liệu Nâng cao (Advanced Database Management Systems)  
**Hệ Quản trị CSDL mục tiêu**: Microsoft SQL Server (Transact-SQL)  
**Kho lưu trữ mã nguồn**: [https://github.com/BryannLee202/QUAN_TRI_CSDL](https://github.com/BryannLee202/QUAN_TRI_CSDL)

---

### BẢNG PHÂN CÔNG NHIỆM VỤ VÀ THÀNH VIÊN THỰC HIỆN

| STT | Họ và Tên | Vai trò | Trách nhiệm chuyên môn chính |
| :---: | :--- | :--- | :--- |
| 1 | **Lê Minh Tài** | **Nhóm trưởng / Kiến trúc sư Hệ thống** | • Thiết kế kiến trúc tổng thể và mô hình quan hệ CSDL chuẩn hóa 3NF.<br>• Xây dựng các Stored Procedure xử lý giao dịch lõi (`sp_CreateRentalOrder`) tích hợp kiểm soát tương tranh với khóa dòng `UPDLOCK, ROWLOCK`.<br>• Thiết kế bộ kịch bản kiểm thử tranh chấp (Concurrency & Race Conditions) và kịch bản vòng đời E2E.<br>• Quản trị tiến trình Git, tích hợp nhánh và phát triển công cụ tự động hóa kiểm thử. |
| 2 | **Hoàng Huy** | **Kỹ sư T-SQL & Tối ưu Hiệu năng** | • Xây dựng hệ thống DML Triggers tự động kiểm tra ngưỡng vi khí hậu (`trg_CheckSensorThresholds`).<br>• Thiết kế các Views báo cáo công suất buồng nuôi và doanh thu định kỳ.<br>• Thiết lập chiến lược chỉ mục nâng cao: Composite Non-Clustered Indexes có mệnh đề `INCLUDE` và Filtered Indexes.<br>• Thực hiện Benchmark đo lường chi phí I/O trên tập dữ liệu 1.000.000 bản ghi. |
| 3 | **Nguyễn Thanh Hiển** | **Kỹ sư Backend & An toàn Thông tin** | • Hiện thực hóa tầng dịch vụ API bằng Node.js / Express với TypeScript.<br>• Cấu hình hồ chứa kết nối (Connection Pool) tối ưu hóa truy vấn đến SQL Server.<br>• Thiết lập xác thực phân quyền RBAC dựa trên JWT lưu trữ an toàn trong HttpOnly Cookie.<br>• Triển khai cơ chế phòng vệ CSRF Double-Submit Cookie và kiểm soát tần suất Rate Limiting. |
| 4 | **Đăng** | **Kỹ sư Giao diện & Trải nghiệm Người dùng** | • Phát triển Cổng Khách hàng (Customer Portal) trên nền tảng Next.js 14 App Router.<br>• Xây dựng hệ thống quốc tế hóa đa ngôn ngữ (i18n Song ngữ Việt – Anh).<br>• Hiện thực hóa các thành phần tương tác: Giấy chứng nhận số VietGAP, bảng điều khiển gói thuê và biểu đồ vi khí hậu. |
| 5 | **Võ Duy Thịnh** | **Kỹ sư IoT & Hệ thống Thời gian thực** | • Xây dựng module giả lập cảm biến vi khí hậu đa thông số (Nhiệt độ, Độ ẩm, CO2, Ánh sáng).<br>• Triển khai cổng truyền thông thời gian thực Socket.io kết nối trực tiếp với Database Event Stream.<br>• Phát triển Bàn điều phối Kỹ thuật viên (Operator Control Center) và Trợ lý giải đáp tự động MushroomBot. |

---

## I. TỔNG QUAN ĐỀ TÀI

Mô hình **Farm-as-a-Service (FaaS)** trong nông nghiệp công nghệ cao cho phép khách hàng từ xa thuê sở hữu các khay nuôi cấy nấm dược liệu (Đông Trùng Hạ Thảo, Linh Chi Đỏ, Nấm Mối Đen...) đặt tại nhà kính khép kín. Dự án **MushroomCloud** giải quyết bài toán quản trị vận hành toàn diện:

1. **Phía Khách hàng (Customer Portal)**:
   * Cho phép đăng ký thuê khay trực tuyến theo chu kỳ sinh trưởng chuẩn.
   * Giám sát thông số vi khí hậu (Telemetry) và hình ảnh trực tiếp 24/7 từ cảm biến IoT.
   * Tra cứu nguồn gốc xuất xứ và Giấy chứng nhận canh tác sạch chuẩn VietGAP có mã QR xác thực.
   * Gửi yêu cầu thu hoạch và nghiệm thu sản lượng trực tuyến.

2. **Phía Vận hành viên (Operator Center)**:
   * Quản lý ma trận khay nuôi vật lý theo từng buồng khí hậu.
   * Điều khiển cưỡng bức thiết bị phần cứng (Quạt thông gió, Máy phun sương, Rèm lạnh).
   * Tra cứu quy trình vận hành chuẩn (SOP), mã lỗi giao dịch và xử lý cảnh báo sự cố vi khí hậu theo thời gian thực.

3. **Phía Quản trị viên (Management & Analytics)**:
   * Thống kê tỷ lệ lấp đầy khay nuôi trên toàn bộ nhà kính.
   * Báo cáo doanh thu, sản lượng thu hoạch và lưu vết toàn vẹn dữ liệu kiểm toán (Audit Trail).

---

## II. KIẾN TRÚC HỆ THỐNG VÀ CÔNG NGHỆ

Hệ thống được thiết kế theo mô hình 3 tầng chuẩn doanh nghiệp (3-Tier Enterprise Architecture):

```
                       [ TẦNG TRÌNH DIỄN - PRESENTATION TIER ]
                 Next.js 14 (App Router) | Tailwind CSS | Socket.io Client
           ┌─────────────────────────────┴─────────────────────────────┐
           ▼                                                           ▼
 [ Cổng Khách Hàng (Portal) ]                               [ Bàn Điều Hành Kỹ Thuật Viên ]
 • Tra cứu khay & telemetry vi khí hậu                      • Ma trận trạng thái buồng nuôi
 • Đăng ký thuê khay & thanh toán                           • Điều khiển cưỡng bức thiết bị
 • Giấy chứng nhận số VietGAP                               • Sổ tay tra cứu quy trình SOP
           │                                                           │
           └─────────────────────────────┬─────────────────────────────┘
                                         │ HTTPS / WSS (Port 443 / 80)
                                         ▼
                            [ NGINX REVERSE PROXY ]
                            • Cân bằng tải & SSL Termination
                            • Nén Gzip & Caching tài nguyên tĩnh
                                         │
                                         ▼
                        [ TẦNG NGHIỆP VỤ - APPLICATION TIER ]
                       Node.js & Express (TypeScript) | Socket.io
           ┌───────────────────────────────────────────────────────────┐
           │ • Quản lý tiến trình sản xuất bằng PM2 Cluster            │
           │ • Xác thực bảo mật JWT qua HttpOnly Cookie                │
           │ • Phòng thủ CSRF Double-Submit & Rate Limiting            │
           │ • Điều phối luồng dữ liệu thời gian thực (Telemetry Hub)  │
           └─────────────────────────────┬─────────────────────────────┘
                                         │ TDS Protocol (Port 1433)
                                         ▼
                          [ TẦNG DỮ LIỆU - DATABASE TIER ]
                         Microsoft SQL Server 2022 (T-SQL)
           ┌───────────────────────────────────────────────────────────┐
           │ • 11 bảng chuẩn hóa 3NF với ràng buộc toàn vẹn nghiêm ngặt│
           │ • ACID Transactions với khóa dòng: UPDLOCK, ROWLOCK       │
           │ • DML Triggers phản ứng sự cố vi khí hậu tự động          │
           │ • Views tổng hợp báo cáo công suất & doanh thu định kỳ    │
           │ • Non-clustered Composite Indexes & Filtered Indexes      │
           └───────────────────────────────────────────────────────────┘
```

---

## III. THIẾT KẾ CƠ SỞ DỮ LIỆU (SMARTMUSHROOMDB)

Cơ sở dữ liệu được tổ chức tại thư mục `database/` gồm các kịch bản T-SQL có cấu trúc:

1. **`01_schema.sql` (Cấu trúc bảng và ràng buộc toàn vẹn)**:
   * `Roles`, `Users`: Phân quyền người dùng theo vai trò RBAC (Admin, Operator, Customer). Mật khẩu được mã hóa an toàn bằng thuật toán BCrypt.
   * `Rooms`, `MushroomSpecies`: Quản lý danh mục nhà kính, buồng nuôi và thông số sinh học chuẩn của từng loài nấm.
   * `RentalPackages`, `RentalOrders`: Quản lý các gói dịch vụ và hợp đồng thuê có ràng buộc thời hạn.
   * `CultivationTrays`: Quản lý thực thể khay nuôi với mã QR định danh duy nhất (VD: `TRAY-RM01-R01-001`).
   * `SensorData`, `SensorAlerts`: Lưu trữ chuỗi thời gian telemetry và nhật ký cảnh báo bất thường.
   * `GrowthLogs`, `HarvestRequests`, `DeviceActionLogs`: Theo dõi chu kỳ phát triển, quy trình thu hoạch và lưu vết điều khiển phần cứng.

2. **`02_tsql_logic.sql` (Thủ tục lưu trữ, Trigger và Khung nhìn)**:
   * `sp_CreateRentalOrder`: Thực thi nghiệp vụ tạo đơn thuê trong giao dịch ACID cô lập. Ứng dụng kỹ thuật khóa dòng `WITH (UPDLOCK, ROWLOCK)` ngăn chặn hoàn toàn hiện tượng tranh chấp đặt trùng khay (Zero Overbooking).
   * `sp_AssignTrayToOrder`: Kỹ thuật viên quét mã QR xác thực để gán khay vật lý vào hợp đồng thuê.
   * `sp_RequestHarvest` & `sp_CompleteHarvest`: Quy trình đóng gói, nghiệm thu sản lượng và chuyển trạng thái khay về bảo trì khử trùng.
   * `trg_CheckSensorThresholds`: DML Trigger gắn trên bảng `SensorData`, tự động đối soát chỉ số môi trường với ngưỡng sinh học. Khi nồng độ CO2 vượt 1200 ppm, trigger tự sinh cảnh báo và kích hoạt quạt hút `EXHAUST_FAN`.
   * Khung nhìn báo cáo: `vw_RoomOccupancyReport`, `vw_CustomerActiveRentals`, `vw_MonthlyRevenueReport`.

3. **`03_seed_data.sql` (Dữ liệu thử nghiệm chuẩn)**:
   * Cung cấp 8 tài khoản mẫu chuẩn hóa, 70 khay nuôi vật lý, 16 hợp đồng thuê mẫu và lịch sử telemetry phong phú phục vụ kiểm định trực quan.

4. **`04_indexing_and_performance.sql` (Tối ưu hóa chỉ mục & Benchmark)**:
   * Composite Non-Clustered Index trên `SensorData(RoomID, RecordedAt)` kết hợp mệnh đề `INCLUDE (Temperature, Humidity, CO2Level)`.
   * Filtered Index trên `SensorAlerts(RoomID, AlertTime)` với điều kiện lọc `WHERE IsResolved = 0`.
   * Bảng thử nghiệm 1.000.000 bản ghi đo lường kế hoạch thực thi (Execution Plan), chứng minh việc giảm thiểu hơn 99% chi phí Logical Reads (từ >22.000 trang quét toàn bảng xuống <50 trang tìm kiếm chỉ mục).

---

## IV. GIẢI QUYẾT BỐN BÀI TOÁN TƯƠNG TRANH (CONCURRENCY CONTROL)

Hệ thống được thiết kế để xử lý triệt để 4 vấn đề tương tranh kinh điển trong CSDL phân tán:

1. **Lost Update (Mất dữ liệu cập nhật)**:
   * *Hiện tượng*: Hai giao dịch đồng thời đọc một khay trống và cùng tiến hành đặt, dẫn đến một đơn hàng bị ghi đè mất dấu.
   * *Giải pháp T-SQL*: Sử dụng gợi ý khóa `WITH (UPDLOCK, ROWLOCK)` trong lệnh `SELECT` kiểm tra chỗ trống của thủ tục `sp_CreateRentalOrder`. Giao dịch thứ hai buộc phải chờ và nhận thông báo lỗi an toàn khi giao dịch thứ nhất hoàn tất.

2. **Dirty Read (Đọc dữ liệu rác)**:
   * *Hiện tượng*: Giao dịch B đọc dữ liệu đơn hàng đang được tạo bởi Giao dịch A; sau đó Giao dịch A gặp lỗi và bị ROLLBACK.
   * *Giải pháp T-SQL*: Áp dụng mức cô lập mặc định `READ COMMITTED` kết hợp giao dịch tường minh `BEGIN TRANSACTION ... COMMIT TRANSACTION`.

3. **Non-Repeatable Read (Đọc không lặp lại được)**:
   * *Hiện tượng*: Một giao dịch đọc lại cùng một bản ghi trong phiên làm việc nhưng nhận hai giá trị khác nhau do giao dịch khác đã sửa đổi và COMMIT ở giữa chừng.
   * *Giải pháp T-SQL*: Nâng cấp mức cô lập lên `REPEATABLE READ` hoặc `SERIALIZABLE` đối với các tác vụ tổng hợp doanh thu và đối soát số dư.

4. **Phantom Read (Bản ghi bóng ma)**:
   * *Hiện tượng*: Một giao dịch truy vấn danh sách khay khả dụng trong khoảng giá trị; một giao dịch khác chèn thêm bản ghi mới thỏa mãn điều kiện đó khiến lần đọc thứ hai xuất hiện bản ghi mới.
   * *Giải pháp T-SQL*: Sử dụng mức cô lập `SERIALIZABLE` với khóa phạm vi (Range Locks) trong các tác vụ kiểm toán và chốt sổ kỳ kế toán.

---

## V. HƯỚNG DẪN CÀI ĐẶT VÀ KHỞI CHẠY HỆ THỐNG

### 1. Yêu cầu môi trường tiền đề
* Hệ điều hành: Windows 10/11 hoặc Linux (Ubuntu 22.04 LTS).
* Cơ sở dữ liệu: Microsoft SQL Server 2019/2022 (hoặc SQL Server Express).
* Môi trường thực thi: Node.js (Phiên bản khuyến nghị LTS v20.x hoặc v22.x).
* Công cụ dòng lệnh: `sqlcmd` (Microsoft Command Line Utilities for SQL Server).

### 2. Khởi tạo Cơ sở dữ liệu
Khởi chạy SQL Server Management Studio (SSMS) hoặc cửa sổ dòng lệnh:
```bash
# Thực thi nạp toàn bộ cấu trúc và dữ liệu mẫu
sqlcmd -S .\SQLEXPRESS01 -d master -E -C -I -i database/01_schema.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/02_tsql_logic.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/03_seed_data.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/04_indexing_and_performance.sql
```

### 3. Khởi chạy nhanh bằng công cụ tự động hóa (1-Click Launchers)
Dự án đã tích hợp sẵn các tập lệnh batch tiện ích tại thư mục gốc:

* **Khởi chạy hệ thống toàn diện**:
  ```cmd
  Chay_He_Thong.bat
  ```
  Cung cấp menu điều khiển tương tác đa chế độ:
  * `[1]` Khởi chạy môi trường phát triển cục bộ (Backend Port 5000 + Frontend Port 3000).
  * `[2]` Khởi chạy cụm dịch vụ qua Docker Compose với chuỗi Healthcheck phụ thuộc.
  * `[3]` Thực thi bộ kiểm thử tự động toàn diện.
  * `[4]` Giải phóng các cổng mạng 3000 và 5000 bị chiếm dụng.

* **Khởi chạy chế độ siêu nhẹ (Minimized Background)**:
  ```cmd
  Chay_Noi_Bo_Sieu_Nhe.bat
  ```
  Tự động giải phóng cổng, khởi động backend và frontend ở chế độ cửa sổ thu nhỏ, trực tiếp điều hướng đến trình duyệt mà không gây rối màn hình làm việc.

---

## VI. BỘ KIỂM THỬ TỰ ĐỘNG VÀ XÁC MINH TOÀN VẸN (TESTING SUITE)

Hệ thống tích hợp quy trình kiểm thử lặp lại nghiêm ngặt nhằm đảm bảo tính ổn định tuyệt đối trước Hội đồng chấm:

### 1. Lệnh thực thi kiểm thử 1-Click
```cmd
run-automated-tests.bat
```
Hoặc chạy trực tiếp qua Node.js:
```bash
node scripts/test-runner.js
```

### 2. Ma trận 6 kịch bản kiểm thử tự động
Bộ kiểm thử tự động thực hiện **3 vòng lặp liên tiếp** (tổng cộng 18 lượt kiểm tra độc lập):
1. `tests/test_end_to_end_lifecycle.sql`: Xác minh chu trình 8 bước khép kín từ đặt khay, gán QR, kích hoạt vi khí hậu đến thu hoạch và thanh lý.
2. `tests/test_sp_create_rental_order.sql`: Kiểm tra tính toàn vẹn của nghiệp vụ tạo đơn thuê và cập nhật trạng thái khay.
3. `tests/test_concurrency_race_condition.sql`: Kiểm tra khả năng chống chịu tranh chấp khi nhiều luồng cùng chiếm một vị trí khay.
4. `tests/test_constraints_and_integrity.sql`: Kiểm thử việc kích hoạt lỗi khi vi phạm các ràng buộc CHECK và khóa ngoại FK.
5. `tests/test_sp_harvest_and_qr.sql`: Kiểm tra quy trình quét mã QR và chốt sản lượng thu hoạch thực tế.
6. `tests/test_audit_and_security.sql`: Kiểm tra tính bảo mật, ghi nhật ký vết kiểm toán và bảo vệ dữ liệu.

**Kết quả tiêu chuẩn**: **18/18 lượt kiểm thử đạt 100% (ALL PASS)**. Nhật ký chi tiết được kết xuất tự động tại file `test-report.log`.

---

## VII. DANH MỤC TÀI KHOẢN MẪU PHỤC VỤ ĐÁNH GIÁ (DEMO CREDENTIALS)

Tất cả tài khoản thử nghiệm được khởi tạo sẵn với mật khẩu mặc định: **`Password123@`**

| Nhóm quyền (RBAC) | Họ và Tên | Tên đăng nhập / Email | Phạm vi thao tác chính |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | Nguyễn Quản Trị | `admin@mushroomcloud.test` | Toàn quyền cấu hình buồng nuôi, xem báo cáo doanh thu tài chính và quản trị tài khoản |
| **Kỹ thuật viên (Operator)** | Trần Kỹ Thuật | `operator1@mushroomcloud.test` | Điều khiển thiết bị nhà kính, quét mã QR khay nuôi, xử lý sự cố cảnh báo vi khí hậu |
| **Kỹ thuật viên (Operator)** | Lê Vận Hành | `operator2@mushroomcloud.test` | Giám sát trạng thái bảo trì và lập nhật ký sinh trưởng |
| **Khách hàng (Customer)** | Phạm Minh An | `customer1@mushroomcloud.test` | Đặt thuê khay nấm, giám sát telemetry, xem Giấy chứng nhận VietGAP và yêu cầu thu hoạch |
| **Khách hàng (Customer)** | Võ Thu Hà | `customer2@mushroomcloud.test` | Theo dõi lịch sử hợp đồng và dữ liệu cảm biến thời gian thực |

---

## VIII. CÁC TÀI LIỆU KỸ THUẬT KÈM THEO

* [DEMO_GUIDE.md](./DEMO_GUIDE.md): Cẩm nang chi tiết các bước vận hành và chuẩn bị hệ thống trước Hội đồng.
* [DEMO_SCRIPT.md](./DEMO_SCRIPT.md): Kịch bản thuyết trình bảo vệ đồ án từng phút.
* [HUONG_DAN_VAN_HANH_PRODUCTION.md](./HUONG_DAN_VAN_HANH_PRODUCTION.md): Sổ tay hướng dẫn triển khai thực tế trên máy chủ VPS, cấu hình PM2, Nginx và lịch trình sao lưu CSDL.
* [scripts/tai-khoan-demo.txt](./scripts/tai-khoan-demo.txt): Bảng tóm tắt tài khoản demo định dạng plain text tiện sao chép.
* [scripts/ma-tran-quyen.txt](./scripts/ma-tran-quyen.txt): Ma trận phân quyền truy xuất dữ liệu chi tiết theo từng vai trò.
