# HƯỚNG DẪN THIẾT LẬP GIÁM SÁT 24/7 & CHỐNG NGỦ ĐÔNG VỚI UPTIMEROBOT
*Phụ trách: Hoàng Huy (hoanghuy216412@gmail.com)*

Khi triển khai Backend MushroomCloud lên đám mây Render.com (gói Free tier), máy chủ sẽ tự động chuyển sang chế độ "ngủ đông" (Spin down) sau 15 phút không có lượt truy cập. Để phục vụ buổi bảo vệ đồ án mượt mà và live demo trực tiếp trên điện thoại:

## 1. Đăng ký tài khoản miễn phí
- Truy cập: https://uptimerobot.com
- Đăng ký tài khoản miễn phí (hỗ trợ tối đa 50 monitors, chu kỳ 5 phút/lần hoàn toàn 0 đồng).

## 2. Tạo Monitor giám sát
- Nhấn **Add New Monitor**:
  - **Monitor Type**: `HTTP(s)`
  - **Friendly Name**: `MushroomCloud Backend Health`
  - **URL (or IP)**: `https://<ten-app-cua-ban>.onrender.com/api/health`
  - **Monitoring Interval**: `Every 5 minutes`
  - **Monitor Timeout**: `30 seconds`
- Nhấn **Create Monitor**.

## 3. Hiệu quả
- Cứ mỗi 5 phút, UptimeRobot sẽ gửi một yêu cầu `GET /api/health`.
- Endpoint `/api/health` trả về JSON `status: healthy` và độ trễ kết nối CSDL SQL Server.
- Máy chủ đám mây giữ trạng thái thức 24/7, luôn sẵn sàng trình chiếu demo tức thì không có độ trễ khởi động lại!
