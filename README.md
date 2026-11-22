# 🍄 MushroomCloud - Nền Tảng Nông Trại Thông Minh (Farm-as-a-Service)

> **MushroomCloud (FaaS)** là nền tảng quản trị và vận hành nuôi trồng nấm dược liệu công nghệ cao khép kín chuẩn **VietGAP** và **ISO Class 5**. Cho phép khách hàng từ xa thuê sở hữu khay nấm, giám sát vi khí hậu thời gian thực 24/7 qua cảm biến IoT, theo dõi buồng kính qua Camera PTZ 4K, lưu trữ thước tua Timelapse sinh trưởng và nhận nấm tươi thu hoạch tận nhà.

[![Next.js](https://img.shields.io/badge/Next.js-14.2.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![SQL Server](https://img.shields.io/badge/MS_SQL_Server-2022-red?style=flat-square&logo=microsoftsqlserver)](https://www.microsoft.com/sql-server)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8.4-black?style=flat-square&logo=socket.io)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Standard](https://img.shields.io/badge/Quality-VietGAP_Loại_A-emerald?style=flat-square)](https://vietgap.gov.vn/)
[![Tests](https://img.shields.io/badge/Tests-18%2F18_PASS_100%25-brightgreen?style=flat-square)]()

---

## 🌟 Tính Năng Nổi Bật

* **Giao Diện Cleanroom Mint & Bio-Emerald**: Thiết kế vô trùng chuẩn phòng lab sinh học hiện đại, tươi mát, sang trọng với các thẻ dữ liệu ngọc trai bóng mờ và biểu đồ vi khí hậu SVG Spline động.
* **Camera Giám Sát PTZ 4K & Timelapse 30 Ngày**: 3 góc quay ống kính quang học (Toàn cảnh 120°, Cận cảnh macro 4K, Giàn kệ vô trùng) tích hợp HUD camera chuyên nghiệp và thanh trượt tua dòng thời gian sinh học từ Ngày 01 đến Ngày 30.
* **Đồng Bộ Vi Khí Hậu Realtime (WebSocket 5s/lần)**: Cập nhật biến thiên Nhiệt độ (22-25°C), Độ ẩm (85-95%) và CO₂ (<800 ppm) trực tiếp đến trình duyệt.
* **Động Cơ Giao Dịch Chống Tranh Chấp Cực Đoan (Zero Overbooking)**: Xử lý hợp đồng thuê khay bằng Stored Procedure ACID với kỹ thuật khóa dòng `WITH (UPDLOCK, ROWLOCK)` trên Microsoft SQL Server 2022.
* **Trợ Lý Trí Tuệ Nhân Tạo (MushroomBot AI)**: Tích hợp mô hình ngôn ngữ Llama-3.1 cùng bộ máy tìm kiếm ngữ nghĩa RAG tra cứu tiêu chuẩn kỹ thuật VietGAP độ trễ 0ms.
* **Bàn Điều Phối Kỹ Thuật Viên (Operator Hub)**: Ma trận giám sát khay nuôi vật lý đa tầng, điều khiển cưỡng bức thiết bị (quạt hút, rèm lạnh, phun sương siêu âm) và xử lý cảnh báo tự động sinh ra từ DML Trigger CSDL.

---

## 🏛️ Kiến Trúc Hệ Thống (3-Tier Enterprise Architecture)

```
                       [ TẦNG TRÌNH DIỄN - PRESENTATION TIER ]
                 Next.js 14 (App Router) | Tailwind CSS | Socket.io Client
           ┌─────────────────────────────┴─────────────────────────────┐
           ▼                                                           ▼
 [ Cổng Khách Hàng (Portal) ]                               [ Bàn Điều Hành Kỹ Thuật Viên ]
 • Camera Live Stream PTZ & HUD 4K                          • Ma trận trạng thái buồng nuôi đa tầng
 • Thước tua Timelapse 30 ngày động                         • Điều khiển cưỡng bức thiết bị IoT
 • Biểu đồ vi khí hậu SVG Spline 24h                        • Tra cứu SOP & xử lý cảnh báo tự động
 • Nghiệm thu thu hoạch & VietGAP                           • Trợ lý AI nông nghiệp MushroomBot
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

## 🚀 Hướng Dẫn Trải Nghiệm Demo Toàn Diện Theo Từng Vai Trò

Dưới đây là kịch bản chuẩn hóa giúp bạn và các thành viên dễ dàng trình diễn trực quan đầy đủ tính năng của hệ thống:

```
                                  KỊCH BẢN DEMO HỆ THỐNG
   ┌──────────────────────────────────────────────────────────────────────────────────┐
   │ 1. Trang Chủ ──> 2. Đặt Thuê Khay ──> 3. Cổng Giám Sát ──> 4. Bàn Điều Hành      │
   │    (Landing)        (T-SQL ACID)         (Live Stream)        (Operator Hub)     │
   └──────────────────────────────────────────────────────────────────────────────────┘
```

### 1. Kịch Bản 1: Trải Nghiệm Khách Hàng (Customer Journey)
* **Bước 1 (Khám phá Landing Page)**:
  * Truy cập [http://localhost:3000](http://localhost:3000).
  * Chiêm ngưỡng Hero Section buồng kính lập phương 3D và các nút chuyển góc nhìn vi khí hậu.
  * Cuộn xuống dải số liệu thống kê **Cleanroom Mint & Bio-Emerald** (`120+ Khay Nấm`, `99% VietGAP`, `85.000+ Vi Khí Hậu`, `4 ms T-SQL`).
* **Bước 2 (Đăng ký thuê khay nấm)**:
  * Tại mục **Bảng Giá Dịch Vụ FaaS**, chọn 1 trong 3 gói nuôi trồng:
    * *Gói 1: Bào Ngư Xám (299.000 VNĐ - 30 Ngày)*.
    * *Gói 2: Linh Chi Đỏ Luxury (899.000 VNĐ - 90 Ngày - Tiêu điểm)*.
    * *Gói 3: Đông Trùng Hạ Thảo (1.899.000 VNĐ - 60 Ngày)*.
  * Bấm **Thuê Khay Ngay** -> Điền thông tin giao nhận -> Xác nhận đặt khay.
  * Hệ thống thực thi thủ tục `sp_CreateRentalOrder` với khóa dòng `UPDLOCK, ROWLOCK`, tự động cấp phát khay trống và bắn hiệu ứng pháo hoa Confetti chúc mừng.
* **Bước 3 (Giám sát buồng nuôi & Timelapse)**:
  * Vào **Cổng Khách Hàng Giám Sát Buồng Nấm**:
    * Thử chuyển 3 góc quay camera PTZ (`Toàn Cảnh Buồng`, `Cận Cảnh Macro 4K`, `Giàn Kệ Vô Trùng`).
    * Nhấn các nút zoom thu phóng quang học `1x - 2x - 4x`.
    * Kéo thước tua **Timelapse Sinh Trưởng** từ Ngày 01 -> Ngày 15 -> Ngày 30 để quan sát mầm nấm bung tán thực tế.
    * Quan sát biểu đồ **Vi Khí Hậu 24h Realtime** biến thiên theo chu kỳ cảm biến.
* **Bước 4 (Nghiệm thu & Chứng nhận VietGAP)**:
  * Bấm **Xem Chứng Thực VietGAP**: Mở Giấy chứng nhận xuất xứ số có dấu kiểm định điện tử và mã QR truy xuất CSDL.
  * Bấm **Yêu Cầu Thu Hoạch Tận Nhà**: Gửi lệnh thu hoạch tức thời qua WebSocket đến màn hình Kỹ thuật viên.

---

### 2. Kịch Bản 2: Trải Nghiệm Kỹ Thuật Viên Vận Hành (Operator Hub)
* **Bước 1 (Đăng nhập Operator)**:
  * Truy cập [http://localhost:3000/dang-nhap](http://localhost:3000/dang-nhap).
  * Đăng nhập tài khoản: `operator1@mushroomcloud.test` / `Password123@`.
* **Bước 2 (Trung Tâm Điều Hành Trang Trại)**:
  * Điều hướng đến [http://localhost:3000/operator](http://localhost:3000/operator).
  * **Ma trận Buồng Nuôi**: Quan sát công suất các buồng vô trùng (RM-01, RM-02, RM-03) với tỷ lệ lấp đầy khay.
  * **Ma trận Khay Vật Lý**: Quản lý từng ô khay theo mã định danh (TRAY-01, TRAY-02...), theo dõi trạng thái `OCCUPIED`, `AVAILABLE` hoặc `MAINTENANCE`.
* **Bước 3 (Can thiệp phần cứng & Cảnh báo môi trường)**:
  * Điều khiển bật/tắt thiết bị buồng sạch: *Quạt hút khí tươi đối lưu*, *Rèm lạnh chống đọng sương*, *Máy siêu âm phun ẩm*.
  * Tiếp nhận cảnh báo vi khí hậu tự động sinh ra từ **DML Trigger `trg_CheckSensorThresholds`** khi thông số lệch chuẩn.
  * Bấm **Xử Lý Cảnh Báo** và lưu vết xử lý vào nhật ký kiểm toán hệ thống.

---

### 3. Kịch Bản 3: Trợ Lý Trí Tuệ Nhân Tạo (MushroomBot AI)
* **Kích hoạt**: Bấm vào biểu tượng robot **MushroomBot AI** ở góc dưới cùng bên phải màn hình.
* **Đặt câu hỏi chuyên môn**:
  * *"Nhiệt độ và độ ẩm thích hợp cho nấm Bào Ngư Xám là bao nhiêu?"*
  * *"Quy trình kiểm định và chứng nhận nấm VietGAP Loại A hoạt động thế nào?"*
  * *"Chính sách bảo hiểm 100% sản lượng khi thuê khay nấm ra sao?"*
* **Quan sát kết quả**:
  * MushroomBot phản hồi tức thời (độ trễ 0ms) nhờ động cơ ngữ nghĩa nội bộ kết hợp RAG Knowledge Base.
  * Hiển thị đầy đủ nguồn tài liệu kiểm chứng (Viện Di Truyền Nông Nghiệp, Dược Điển Việt Nam V) cùng danh sách câu hỏi gợi ý thông minh.

---

### 4. Kịch Bản 4: Máy Tính Lợi Nhuận Đầu Tư (ROI Calculator)
* Truy cập [http://localhost:3000/tinh-loi-nhuan](http://localhost:3000/tinh-loi-nhuan).
* Kéo thanh trượt số lượng khay thuê và chọn chủng loại nấm.
* Hệ thống tính toán tức thời:
  * Tổng chi phí đầu tư ban đầu.
  * Sản lượng nấm tươi kỳ vọng theo chuẩn VietGAP.
  * Doanh thu dự kiến khi phân phối lại qua **Sàn Nông Sản FaaS** ([/san-nong-san](http://localhost:3000/san-nong-san)).
  * Tỷ suất sinh lời ròng (ROI %) và thời gian hoàn vốn minh bạch.

---

## 🔑 Danh Mục Tài Khoản Demo & Hướng Dẫn Test Đa Tab (Demo Credentials)

> **Mật khẩu dùng chung cho tất cả tài khoản demo:** `Password123@`  
> Ngoài ra, tại trang đăng nhập ([/login](http://localhost:3000/login) hoặc [/dang-nhap](http://localhost:3000/dang-nhap)), bạn có thể bấm trực tiếp các nút **Đăng nhập nhanh 1-Click** theo từng vai trò.

| Vai trò (Role) | Họ và Tên | Email đăng nhập | Mật khẩu | Quyền hạn và phạm vi sử dụng |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | Nguyễn Quản Trị | `admin@mushroomcloud.test` | `Password123@` | Toàn quyền hệ thống: tạo thêm khay nuôi mới (`+1/+5/+10`), quản lý buồng nuôi, điều khiển thiết bị IoT, xem doanh thu & lịch sử giao dịch |
| **Kỹ thuật viên (Operator)** | Trần Kỹ Thuật | `operator1@mushroomcloud.test` | `Password123@` | Truy cập `/operator`: điều khiển rơ-le buồng sạch, xử lý cảnh báo vi khí hậu, quan sát Camera PTZ đường ray kệ nấm & chuyển trạng thái bảo trì khay |
| **Kỹ thuật viên (Operator)** | Lê Vận Hành | `operator2@mushroomcloud.test` | `Password123@` | Tài khoản kỹ thuật viên dự phòng để test điều phối ca trực và quét kiểm định khay |
| **Khách hàng (Customer)** | Phạm Minh An | `customer1@mushroomcloud.test` | `Password123@` | Thuê khay nấm FaaS, thanh toán qua cổng Sandbox (VietQR/VNPAY/Visa/COD), xem hồ sơ chứng từ `/ho-so`, theo dõi telemetry & gửi lệnh thu hoạch |
| **Khách hàng (Customer)** | Võ Thu Hà | `customer2@mushroomcloud.test` | `Password123@` | Test luồng khách hàng đặt thuê khay song song và ký gửi nông sản trên `/san-nong-san` |
| **Khách hàng (Customer)** | Đặng Quốc Bảo | `customer3@mushroomcloud.test` | `Password123@` | Tài khoản khách hàng bổ sung phục vụ kiểm thử đa người dùng |

### 💡 Mẹo Test Chéo Nhiều Vai Trò Cùng Lúc Trên Nhiều Tab Trình Duyệt
Hệ thống hỗ trợ **cô lập phiên đăng nhập độc lập cho từng Tab** (`sessionStorage` + `Authorization: Bearer`) và **đồng bộ dữ liệu tức thì qua `BroadcastChannel`**:
1. **Tab 1**: Mở `http://localhost:3000/operator` và đăng nhập **`admin@mushroomcloud.test`** (Admin).
2. **Tab 2**: Mở tab mới (hoặc *Duplicate Tab*), đăng nhập **`operator1@mushroomcloud.test`** (Kỹ thuật viên).
3. **Tab 3**: Mở tab mới, đăng nhập **`customer1@mushroomcloud.test`** (Khách hàng) hoặc giữ nguyên chế độ Khách chưa đăng nhập.
4. Cả 3 tab hoạt động **độc lập hoàn toàn** (không bị đá phiên hay ghi đè quyền lẫn nhau). Khi một tab thay đổi dữ liệu (đặt thuê khay, tạo khay mới, bật/tắt rơ-le, thanh toán), các tab còn lại tự động cập nhật hoặc chỉ cần bấm **F5** là hiển thị dữ liệu mới nhất tức thì.

---

## 🛠️ Hướng Dẫn Cài Đặt Và Khởi Chạy Nhanh (1-Click Launchers)

### 1. Yêu cầu môi trường
* **Hệ điều hành**: Windows 10/11 hoặc Linux (Ubuntu 22.04 LTS).
* **Cơ sở dữ liệu**: Microsoft SQL Server 2019/2022 (hoặc SQL Server Express `.\SQLEXPRESS01`).
* **Môi trường thực thi**: Node.js (Khuyến nghị LTS v20.x hoặc v22.x).
* **Công cụ dòng lệnh**: `sqlcmd` (Microsoft Command Line Utilities for SQL Server).

### 2. Khởi tạo Cơ sở Dữ liệu
```bash
# Thực thi nạp toàn bộ cấu trúc bảng, logic T-SQL và dữ liệu mẫu
sqlcmd -S .\SQLEXPRESS01 -d master -E -C -I -i database/01_schema.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/02_tsql_logic.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/03_seed_data.sql
sqlcmd -S .\SQLEXPRESS01 -d SmartMushroomDB -E -C -I -i database/04_indexing_and_performance.sql
```

### 3. Khởi chạy 1-Click bằng Batch Script (Windows)
```cmd
# Khởi chạy toàn diện với menu tương tác
Chay_He_Thong.bat

# Hoặc khởi chạy chế độ siêu nhẹ cửa sổ ẩn (trực tiếp mở trình duyệt)
Chay_Noi_Bo_Sieu_Nhe.bat
```

### 4. Khởi chạy thủ công bằng lệnh
* **Khởi động Backend (Port 5000)**:
  ```bash
  cd backend
  npm install
  npm run dev
  ```
* **Khởi động Frontend (Port 3000)**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

---

## 🧪 Bộ Kiểm Thử Tự Động Toàn Diện (Testing Suite)

Hệ thống tích hợp quy trình kiểm thử tự động nghiêm ngặt nhằm đảm bảo tính toàn vẹn và khả năng xử lý tương tranh 100%:

### 1. Lệnh thực thi kiểm thử 1-Click
```bash
node scripts/test-runner.js
```
*(Hoặc click đúp chuột vào tệp `run-automated-tests.bat`)*

### 2. Ma trận 6 kịch bản kiểm thử T-SQL
Bộ kiểm thử tự động thực hiện **3 vòng lặp liên tiếp** (tổng cộng 18 lượt kiểm tra độc lập):
1. `tests/test_end_to_end_lifecycle.sql`: Xác minh chu trình 8 bước khép kín từ đặt khay, gán QR, kích hoạt vi khí hậu đến thu hoạch và thanh lý.
2. `tests/test_sp_create_rental_order.sql`: Kiểm tra tính toàn vẹn của nghiệp vụ tạo đơn thuê và cập nhật trạng thái khay.
3. `tests/test_concurrency_race_condition.sql`: Kiểm tra khả năng chống chịu tranh chấp khi nhiều luồng cùng chiếm một vị trí khay.
4. `tests/test_constraints_and_integrity.sql`: Kiểm thử việc kích hoạt lỗi khi vi phạm các ràng buộc CHECK và khóa ngoại FK.
5. `tests/test_sp_harvest_and_qr.sql`: Kiểm tra quy trình quét mã QR và chốt sản lượng thu hoạch thực tế.
6. `tests/test_audit_and_security.sql`: Kiểm tra tính bảo mật, ghi nhật ký vết kiểm toán và bảo vệ dữ liệu.

> **Kết quả đạt chuẩn**: **18/18 lượt kiểm thử PASS 100%**. Báo cáo chi tiết được ghi tự động tại [test-report.log](./test-report.log).

---

## 📚 Tài Liệu Kỹ Thuật Chuyên Sâu

* 📖 [docs/operator_api.md](docs/operator_api.md): Đặc tả chi tiết 6 REST API trung tâm điều hành cho Kỹ thuật viên & Admin.
* 🛡️ [docs/AUTH_RBAC_SPECIFICATION.md](docs/AUTH_RBAC_SPECIFICATION.md): Đặc tả kiến trúc phân quyền RBAC và bảo vệ HttpOnly Cookie.
* 📡 [docs/IOT_BINARY_PROTOCOL_SPEC.md](docs/IOT_BINARY_PROTOCOL_SPEC.md): Đặc tả giao thức truyền thông nhị phân cảm biến IoT buồng sạch.
* 🌐 [HUONG_DAN_VAN_HANH_PRODUCTION.md](HUONG_DAN_VAN_HANH_PRODUCTION.md): Sổ tay hướng dẫn triển khai sản xuất trên VPS với PM2, Nginx và Docker.
* 📑 [DEMO_GUIDE.md](DEMO_GUIDE.md) & [DEMO_SCRIPT.md](DEMO_SCRIPT.md): Cẩm nang chuẩn bị và kịch bản thuyết trình chi tiết từng phút.

---

© 2026 **MushroomCloud Platform**. Bản quyền thuộc về Đội ngũ Phát triển Nông Trại Nấm Thông Minh FaaS.
