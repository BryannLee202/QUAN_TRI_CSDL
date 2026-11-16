# ĐẶC TẢ CƠ CHẾ XÁC THỰC & PHÂN QUYỀN TRUY CẬP (AUTHENTICATION & RBAC SPECIFICATION)

**Dự án:** MushroomCloud Farm-as-a-Service (FaaS) Platform  
**Phiên bản:** 2.0  
**Tác giả:** Nhóm Phát Triển Dự Án FaaS  
**Tiêu chuẩn bảo mật:** OWASP Top 10 API Security & JWT RFC 7519  

---

## 1. Tổng Quan Kiến Trúc Xác Thực (Authentication Architecture)

Hệ thống MushroomCloud triển khai kiến trúc xác thực đa tầng (BFF - Backend-for-Frontend):
1. **Mã Hóa Mật Khẩu:** Sử dụng **BCrypt (salt rounds 10)**, không bao giờ lưu trữ mật khẩu ở dạng plain text trong SQL Server.
2. **Quản Lý Phiên (Session Management):**
   - **JSON Web Token (JWT):** Ký số HMAC SHA-256 chứa thông tin danh tính (`userId`, `email`, `roleId`, `roleName`).
   - **Lưu Trữ Kép (Dual Storage):**
     - Lưu trong **HttpOnly Cookie** (`SameSite=Lax`, `Secure` trên production) để phòng vệ trước các cuộc tấn công XSS.
     - Lưu trữ tạm thời trong Client Context để gán vào `Authorization: Bearer <token>` Header khi gọi API.
3. **Phòng Thủ Chống Giả Mạo CSRF:** Áp dụng mô hình Double Submit Cookie CSRF token cho toàn bộ các yêu cầu HTTP POST/PUT/DELETE làm thay đổi trạng thái dữ liệu.

---

## 2. Ma Trận Phân Quyền Vai Trò (Role-Based Access Control - RBAC)

Cơ sở dữ liệu Microsoft SQL Server định nghĩa 3 vai trò chính trong bảng `Roles`:

| Mã Vai Trò | Tên Vai Trò (`RoleName`) | Mô Tả Quyền Hạn | Quyền Hạn Chi Tiết |
| :---: | :--- | :--- | :--- |
| **1** | **Admin** | Quản trị viên toàn hệ thống | - Toàn quyền cấu hình buồng nuôi và ma trận khay.<br>- Bật/tắt cưỡng bức rơ-le thiết bị IoT.<br>- Quản lý tài khoản người dùng và hợp đồng FaaS.<br>- Xem báo cáo doanh thu tài chính hàng tháng (`/analytics/revenue-monthly`). |
| **2** | **Operator** | Kỹ thuật viên trực ca | - Giám sát vi khí hậu, xử lý các cảnh báo vi phạm ngưỡng (`SensorAlerts`).<br>- Bật/tắt quạt hút khí CO₂, máy phun sương khi có sự cố.<br>- Chuyển đổi trạng thái khay nuôi giữa `AVAILABLE` và `MAINTENANCE`.<br>- Nghiệm thu cân ký nấm thu hoạch tại nông trại. |
| **3** | **Customer** | Khách hàng thuê khay | - Xem Camera Live Stream 4K và thước tua Timelapse khay nấm cá nhân.<br>- Xem chỉ số vi khí hậu buồng kính chứa khay của mình.<br>- Gửi lệnh thu hoạch nấm và tải Chứng nhận nguồn gốc VietGAP.<br>- **BỊ CHẶN (403 FORBIDDEN):** Không có quyền can thiệp phần cứng hoặc đổi trạng thái bảo dưỡng khay. |

---

## 3. Danh Sách Tài Khoản Mẫu Phục Vụ Kiểm Thử & Chấm Điểm Đồ Án (Demo Credentials)

Tất cả các tài khoản demo đều được thiết lập sẵn mật khẩu chuẩn hóa:

| Vai Trò (Role) | Họ Và Tên | Email Đăng Nhập | Mật Khẩu Demo | Thẩm Quyền Thử Nghiệm |
| :--- | :--- | :--- | :--- | :--- |
| **Quản Trị Viên (Admin)** | Nguyễn Quản Trị | `admin@mushroomcloud.test` | `Password123@` | Toàn quyền cấu hình, can thiệp IoT, xem analytics |
| **Kỹ Thuật Viên (Operator)** | Trần Kỹ Thuật | `operator1@mushroomcloud.test` | `Password123@` | Can thiệp phần cứng, xử lý cảnh báo, bảo dưỡng khay |
| **Khách Hàng (Customer)** | Phạm Minh An | `customer1@mushroomcloud.test` | `Password123@` | Giám sát khay cá nhân `#TR-08`, gửi lệnh thu hoạch |
| **Khách Hàng 2 (Customer)** | Võ Thu Hà | `customer2@mushroomcloud.test` | `Password123@` | Kiểm thử kiểm soát đồng thời (Concurrency Control) |

---

## 4. Thiết Kế Giao Diện Người Dùng (UI/UX)
- **AuthModal Cafe Latte:** Tích hợp cả 2 chế độ *Đăng Nhập* và *Đăng Ký*, đi kèm tính năng **1-Click Demo Login** giúp giảng viên và người đánh giá có thể chuyển đổi qua lại giữa các vai trò chỉ với 1 cú click.
- **Thanh Điều Hướng (Navbar):** Hiển thị Avatar, tên người dùng, huy hiệu vai trò tương ứng và Menu thả xuống quản lý tài khoản.
- **Bảo Vệ Đa Tầng (Frontend & Backend):** Nếu tài khoản Khách Hàng cố gắng can thiệp phần cứng, cả giao diện sẽ hiển thị cảnh báo từ chối và API Backend sẽ trả về mã lỗi HTTP `403 FORBIDDEN`.
