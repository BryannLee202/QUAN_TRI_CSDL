# Kế Hoạch & Đặc Tả Kiểm Thử Tự Động Ứng Dụng Di Động (MushroomCloud Mobile App)

Tài liệu này chuẩn hóa quy trình kiểm thử tự động (Mobile Test Automation) cho phân hệ **Ứng dụng di động đồng hành 24/7 (iOS & Android)** của nền tảng Nông Trại Thông Minh **MushroomCloud Smart Farm FaaS**, ứng dụng tài nguyên và các app mẫu đối sánh từ cộng đồng kiểm thử [anhtester/mobile-app-demo](https://github.com/anhtester/mobile-app-demo).

---

## 1. Tổng Quan Về Kho Ứng Dụng Mẫu `anhtester/mobile-app-demo`

Kho ứng dụng `anhtester/mobile-app-demo` (tổng hợp bởi cộng đồng Anh Tester) là kho lưu trữ chuẩn hóa các tệp nhị phân (`.apk` cho Android và `.ipa`/`.zip` cho iOS) chứa đầy đủ các thành phần giao diện (UI Components) từ cơ bản đến nâng cao:

| Ứng Dụng Mẫu | Nền Tảng | Thành Phần Nổi Bật | Giá Trị Đối Sánh Cho MushroomCloud Mobile |
| :--- | :--- | :--- | :--- |
| **`SauceLabs-Demo-App.apk`** | Android Native | E-Commerce catalog, filter sản phẩm, thêm vào giỏ, checkout đặt hàng, đăng nhập | Mô hình hóa luồng khách hàng **Chọn và thuê khay nấm** (Linh Chi, Bào Ngư, Đông Trùng Hạ Thảo), thanh toán gói dịch vụ FaaS |
| **`android.wdio.native.app.v1.0.8.apk`** | React Native / Native | Đăng nhập sinh trắc học (Fingerprint / FaceID), Form validation, Swipe carousel, Drag & Drop | Chuẩn hóa quy trình **Đăng nhập nhanh 1 chạm của khách hàng**, xem chuỗi ảnh Timelapse sinh trưởng nấm bằng thao tác vuốt |
| **`proverbial_android.apk`** | Android Native | Công tắc Switch, Text inputs, Push notification tức thời, Toast alert, Định vị GPS | Kiểm thử tính năng **Điều khiển từ xa (Bật/tắt phun sương, quạt hút)** và **Nhận thông báo đẩy khẩn cấp khi vi khí hậu vượt ngưỡng** |
| **`provider_shopper_flutter_sample.apk`** | Flutter Native | Quản lý state Flutter, tối ưu hóa key widget, render danh sách lớn | Đối sánh nếu ứng dụng MushroomCloud được phát triển bằng Flutter cross-platform |

---

## 2. Ứng Dụng Thực Tế Vào Dự Án MushroomCloud FaaS

### 2.1. Kiểm thử luồng Đăng nhập & Xác thực (Authentication & RBAC)
- **Mục tiêu**: Đảm bảo khách hàng thuê khay nấm và Operator vận hành có thể đăng nhập an toàn vào ứng dụng di động.
- **Kịch bản**:
  1. Nhập tài khoản `khachhang@mushroomcloud.vn` hoặc dùng FaceID.
  2. Xác thực JWT Token lưu trong `EncryptedSharedPreferences` (Android) / `Keychain` (iOS).
  3. Ứng dụng tự động điều hướng vào Portal Khách hàng, ẩn các nút can thiệp sâu của Operator.

### 2.2. Kiểm thử Điều khiển Vi khí hậu & Telemetry Thời gian thực
- **Mục tiêu**: Giám sát nhiệt độ, độ ẩm, nồng độ CO2 truyền từ trạm IoT buồng nấm qua WebSocket/LoRaWAN.
- **Kịch bản**:
  1. Kiểm thử hiển thị widget vi khí hậu (Cập nhật 5s/lần).
  2. Bật công tắc "Phun sương" hoặc "Quạt thông gió": Assert tín hiệu gửi về `/api/operator/actuator` và UI chuyển trạng thái màu xanh active.

### 2.3. Kiểm thử Luồng Đẩy Thông Báo Khẩn (Push Notification)
- **Mục tiêu**: Khi độ ẩm buồng hạ xuống dưới 75% hoặc nhiệt độ > 32°C (kích hoạt từ trigger SQL Server `trg_CheckSensorThresholds`), thông báo đẩy phải hiển thị ngay trên điện thoại khách hàng.
- **Kịch bản**:
  1. Sử dụng kịch bản đẩy notification mô phỏng từ `proverbial_android.apk`.
  2. Click vào Notification -> Ứng dụng mở trực tiếp (Deep-link) vào Khay nấm đang gặp sự cố để xem Camera 4K trực tiếp.

---

## 3. Kiến Trúc Kiểm Thử Tự Động Kết Hợp AI Antigravity

Hệ thống AI Antigravity đã được tích hợp bộ kỹ năng **`mobile-app-testing`** cùng các plugin có sẵn:
- **`android-cli`**: Điều khiển môi trường Android SDK, biên dịch và chạy ứng dụng.
- **`android-device-hub` Sidecar**: Quản lý máy ảo (AVD), phản chiếu màn hình (screen mirror) trực quan ngay trong IDE Antigravity.
- **ADB & UIAutomator**: Bóc tách cây giao diện (`accessibility-id`, `resource-id`), tự động chụp ảnh màn hình và gửi phím/chạm.
- **Appium / WebdriverIO**: Tự động thực thi toàn bộ kịch bản E2E Test.

```
                      [ Antigravity AI Agent ]
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
       [ android-device-hub ]             [ ADB / Appium ]
                 │                               │
                 ▼                               ▼
      [ Android AVD / Thiết Bị ] ◄───── [ Kịch Bản Test E2E ]
                 │
                 ├── 1. Khởi chạy MushroomCloud Mobile App
                 ├── 2. Bóc tách Resource-ID & Selector
                 ├── 3. Thực thi Test Login / IoT / Camera
                 └── 4. Xuất Báo Cáo & Screenshot Nghiệm Thu
```

---

## 4. Lộ Trình Triển Khai (Roadmap)

1. **Giai đoạn 1**: Thử nghiệm và bóc tách các thành phần UI mẫu từ `anhtester/mobile-app-demo` trên máy ảo Android.
2. **Giai đoạn 2**: Chuẩn hóa bộ Locator (`content-desc`, `testID`) cho các màn hình MushroomCloud Mobile App.
3. **Giai đoạn 3**: Xây dựng bộ kịch bản tự động hóa (Regression Test Suite) chạy định kỳ mỗi khi cập nhật backend API hoặc giao diện ứng dụng.
