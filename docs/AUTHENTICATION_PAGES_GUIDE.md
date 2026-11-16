# Hướng Dẫn & Đặc Tả Các Trang Đăng Nhập / Đăng Ký Riêng Biệt (MushroomCloud)

Tài liệu này mô tả thiết kế và kiến trúc chuyển đổi từ dạng Popup Modal sang **Trang chuyên biệt (Dedicated Split-Card Pages)** cho tính năng Đăng nhập và Đăng ký của nền tảng **MushroomCloud Smart Farm FaaS**.

---

## 1. Lý Do Chuyển Đổi Sang Trang Riêng Biệt

- **Tối ưu trải nghiệm người dùng (UX)**: Người dùng có không gian nhập liệu rộng rãi, chuyên nghiệp, không bị giới hạn trong khung modal nhỏ hẹp.
- **Tăng tỷ lệ chuyển đổi (Conversion Rate)**: Áp dụng bố cục **Split-Card Layout** (tương tự các học viện đào tạo và nền tảng SaaS hiện đại như Running Man Academy):
  - Cột trái: Giới thiệu giá trị cốt lõi của nông trại thông minh (ISO Class 5, cảm biến IoT 24/7, camera 4K, bảo hiểm sản lượng VietGAP).
  - Cột phải: Form nhập liệu rõ ràng, có hỗ trợ gợi ý mật khẩu mạnh, ẩn/hiện mật khẩu và nút bấm nổi bật.
- **Hỗ trợ Bookmark và Chia sẻ URL trực tiếp**:
  - `/login` hoặc `/dang-nhap`: Trang Đăng nhập.
  - `/register` hoặc `/dang-ky`: Trang Đăng ký tài khoản mới.

---

## 2. Các Tuyến Đường Được Hỗ Trợ

| Tuyến Đường | Mục Đích | Thành Phần Nổi Bật |
| :--- | :--- | :--- |
| **`/login`** & **`/dang-nhap`** | Cổng đăng nhập hệ thống | Hỗ trợ tính năng **1-Click Demo Accounts** (Quản Trị Viên, Kỹ Thuật Viên, Khách Hàng) giúp giảng viên và ban giám khảo chấm thi đăng nhập tức thì. |
| **`/register`** & **`/dang-ky`** | Đăng ký thành viên mới | Form đăng ký đầy đủ (Họ tên, SĐT, Email, Mật khẩu, Checkbox đối tác nông trại, Địa chỉ nhận nấm tươi). |

---

## 3. Liên Kết Điều Hướng

- Thanh điều hướng chính (Navbar):
  - Nút **"Đăng Nhập"** $\rightarrow$ Dẫn trực tiếp đến `/login`.
  - Nút **"Đăng Ký"** $\rightarrow$ Dẫn trực tiếp đến `/register`.
- Banner cổng khách hàng (CustomerBanner):
  - Nút **"Đăng Nhập Khách Hàng"** $\rightarrow$ Dẫn trực tiếp đến `/login`.
- Nút chuyển đổi nhanh ở chân trang của mỗi trang giúp người dùng chuyển qua lại giữa Đăng nhập và Đăng ký chỉ bằng 1 cú nhấp chuột.
