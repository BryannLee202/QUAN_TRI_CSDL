# Đặc Tả Kịch Bản BDD Living Documentation (Cucumber Gherkin)

Tài liệu này chuẩn hóa toàn bộ các kịch bản kiểm thử hướng hành vi (**Behavior-Driven Development - BDD**) cho nền tảng Nông Trại Thông Minh **MushroomCloud Smart Farm FaaS**, tích hợp theo tiêu chuẩn quốc tế của [cucumber/cucumber-js](https://github.com/cucumber/cucumber-js).

---

## 1. Giới Thiệu Về BDD & Living Documentation Trong Đồ Án

BDD không chỉ là kỹ thuật kiểm thử tự động, mà là phương tiện xây dựng **"Tài Liệu Sống" (Living Documentation)**:
- **Ngôn ngữ tự nhiên**: Mọi kịch bản được viết bằng cú pháp Gherkin tiếng Việt (`Cho - Khi - Thì - Và`).
- **Minh bạch hóa nghiệp vụ**: Giúp giảng viên hướng dẫn, hội đồng bảo vệ đồ án và khách hàng hiểu rõ từng bước tương tác hệ thống mà không cần đọc mã nguồn.
- **Tự động đối chiếu CSDL**: Mỗi bước kiểm thử được liên kết trực tiếp với các Stored Procedures (`sp_CreateRentalOrder`, `sp_AssignTrayToOrder`) và Trigger vi khí hậu trong Microsoft SQL Server 2022.

---

## 2. Danh Mục Các Tính Năng Nghiệp Vụ (Features)

### 2.1. Tính Năng 1: Đặt Thuê Khay Nấm FaaS ([features/rental_faas.feature](file:///c:/Mushromm/features/rental_faas.feature))
- **Mục tiêu**: Xác thực luồng khách hàng kiểm tra buồng nuôi nấm ISO Class 5 và đặt thuê khay nấm bảo toàn tính toàn vẹn giao dịch (ACID, khóa bi quan chống overbooking).
- **Kịch bản chính**:
  1. *Khách hàng kiểm tra buồng nuôi nấm ISO Class 5 khả dụng*: Xác minh buồng RM01 có dải nhiệt độ chuẩn từ 20°C đến 28°C.
  2. *Đặt thuê khay nấm an toàn*: Khi hết khay trống, hệ thống phản hồi mã lỗi `409 Conflict` thân thiện thay vì sập lỗi máy chủ `500`.

### 2.2. Tính Năng 2: Xác Thực & Phân Quyền Đa Vai Trò RBAC ([features/auth_and_rbac.feature](file:///c:/Mushromm/features/auth_and_rbac.feature))
- **Mục tiêu**: Bảo vệ an toàn các cổng vận hành, chỉ cho phép đúng đối tượng truy cập.
- **Kịch bản chính**:
  1. *Đăng nhập Quản trị viên (Admin)*: Cấp phát JWT token hợp lệ với vai trò `Admin`.
  2. *Chặn khách hàng can thiệp phần cứng*: Khi khách hàng cố tình gọi API `/api/operator/devices/toggle`, hệ thống chặn đứng với mã `403 Forbidden`.

### 2.3. Tính Năng 3: Điều Hòa Vi Khí Hậu & Thiết Bị IoT ([features/iot_climate_control.feature](file:///c:/Mushromm/features/iot_climate_control.feature))
- **Mục tiêu**: Tự động giải mã gói tin nhị phân và kích hoạt điều hòa vi khí hậu.
- **Kịch bản chính**:
  1. *Giải mã gói tin Modbus RTU*: Nạp hex `01030600F50375026CBDB3` và lưu chính xác 24.5°C, 88.5% độ ẩm vào bảng `SensorData`.
  2. *Kỹ thuật viên bật máy phun sương từ xa*: Đóng tiếp điểm relay và phát sóng WebSocket realtime đến trang Dashboard.

---

## 3. Cách Thức Vận Hành & Chạy BDD Suite

Chỉ với 1 câu lệnh Node.js:
```bash
# Chạy bộ kiểm thử BDD Cucumber
node scripts/bdd_cucumber_runner.js
```

Hoặc chạy toàn bộ Master Suite (bao gồm cả BDD, Load Test, Fuzzing, Swagger và Market Scraper):
```bash
node scripts/run_awesome_test_suite.js
```
