# 🎬 KỊCH BẢN THUYẾT TRÌNH BẢO VỆ ĐỒ ÁN MUSHROOMCLOUD (10 PHÚT)
*Môn học: Hệ Quản Trị Cơ Sở Dữ Liệu (MS SQL Server / T-SQL)*  
*Phụ trách: Hoàng Huy (hoanghuy216412@gmail.com)*

---

## ⏱️ Tổng Quan Phân Bổ Thời Gian
- **Thời lượng chuẩn**: 10 phút thuyết trình + 5 phút hỏi đáp hội đồng.
- **Mục tiêu**: Làm nổi bật kiến trúc CSDL chuẩn hóa 3NF, tính toàn vẹn giao dịch ACID, cơ chế khóa bi quan chống Overbooking và tự động hóa qua Trigger T-SQL.

---

## 📋 Chi Tiết Kịch Bản Từng Phút

### Phút 00:00 - 02:00: Mở Đầu & Giới Thiệu Kiến Trúc 3NF
- **Thao tác**: Chiếu trang chủ `http://localhost:3000`. Giới thiệu mô hình **Farm-as-a-Service (FaaS)**.
- **Lời thoại thuyết trình**:
  > *"Kính thưa Thầy Cô hội đồng, đồ án MushroomCloud giải quyết bài toán nông trại nấm thông minh cho phép khách hàng thuê khay nấm từ xa. Toàn bộ cơ sở dữ liệu được chuẩn hóa ở dạng chuẩn 3 (3NF) gồm 8 thực thể chính, phân tách triệt để dữ liệu cấu hình, nghiệp vụ giao dịch và chuỗi thời gian telemetry IoT."*

### Phút 02:00 - 04:30: Quy Trình Thuê Khay & Khóa Bi Quan (sp_CreateRentalOrder)
- **Thao tác**: Cuộn xuống mục **Danh Mục Các Gói Thuê Nấm**, rê chuột qua các thẻ `TiltCard` 3D, chọn gói *Linh Chi Đỏ Luxury* và bấm **Đăng Ký Thuê Ngay**. Hiệu ứng pháo hoa Confetti kích hoạt!
- **Lời thoại thuyết trình**:
  > *"Để chống tình trạng 2 khách hàng cùng đặt thuê 1 khay nấm duy nhất (Race Condition), hệ thống sử dụng Stored Procedure `sp_CreateRentalOrder` với khóa bi quan `UPDLOCK, ROWLOCK`. Giao dịch ACID đảm bảo tính cô lập tuyệt đối, chỉ 1 giao dịch được cấp khay, giao dịch còn lại sẽ bị chặn an toàn và trả thông báo lỗi ngay lập tức."*

### Phút 04:30 - 07:00: Điều Hành Kỹ Thuật Viên & Trigger T-SQL Tự Động Bật Quạt Hút
- **Thao tác**: Mở trang Trung Tâm Điều Hành `http://localhost:3000/operator`. Bật công tắc giao diện Sáng/Tối `ThemeToggle`.
- **Lời thoại thuyết trình**:
  > *"Tại trung tâm điều hành, cảm biến IoT liên tục gửi thông số vi khí hậu. Khi nồng độ CO2 vượt ngưỡng an toàn (ví dụ 1450 ppm > 1000 ppm), Trigger T-SQL `trg_CheckSensorThresholds` tự động kích hoạt: vừa ghi cảnh báo vào bảng `SensorAlerts`, vừa tự động bật quạt hút `EXHAUST_FAN` và phát tín hiệu qua Socket.io thời gian thực lên Dashboard mà không cần can thiệp thủ công."*

### Phút 07:00 - 08:30: Quét Mã QR & Nghiệm Thu Thu Hoạch Nấm (sp_CompleteHarvest)
- **Thao tác**: Tại Cổng Khách Hàng, bấm nút **Gửi Yêu Cầu Thu Hoạch**. Sau đó quay sang Dashboard kỹ thuật viên để chốt sản lượng thu hoạch 3.25 kg nấm Loại A.
- **Lời thoại thuyết trình**:
  > *"Khi nấm đến kỳ vụ, thủ tục `sp_CompleteHarvest` được gọi để chốt sản lượng thực tế, ghi nhận mã vận đơn bưu cục và chuyển trạng thái khay nấm sang `MAINTENANCE` để khử trùng chuẩn bị cho vụ mới. Toàn bộ thay đổi đều được ghi vào bảng `AuditLogs`."*

### Phút 08:30 - 10:00: Minh Chứng Tối Ưu Hóa Hiệu Năng & Tổng Kết
- **Thao tác**: Mở Swagger API tại `http://localhost:5000/api-docs` và chạy kiểm thử `node scripts/test-runner.js`.
- **Lời thoại thuyết trình**:
  > *"Về mặt tối ưu hóa, nhóm đã thiết lập chỉ mục Non-Clustered Covering Index trên 100,000 dòng telemetry `SensorData`, giúp SQL Server chuyển hoàn toàn từ Clustered Index Scan sang Index Seek, giảm 92% số lần đọc đĩa I/O. Bộ test tự động 6 kịch bản đều đạt 100% PASS. Nhóm xin kết thúc phần trình bày và sẵn sàng lắng nghe câu hỏi từ Thầy Cô."*
