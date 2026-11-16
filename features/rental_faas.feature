# language: vi
Tính năng: Đặt thuê khay nấm thông minh (Farm-as-a-Service)
  Để tối ưu hóa chi phí và trải nghiệm người dùng,
  Hệ thống MushroomCloud cung cấp cơ chế thuê khay nấm từ xa với khóa dòng chống tranh chấp CSDL.

  Kịch bản: Khách hàng kiểm tra buồng nuôi nấm ISO Class 5 khả dụng
    Cho hệ thống Backend API và CSDL SQL Server đang hoạt động bình thường
    Khi khách hàng truy vấn danh sách buồng nuôi tại endpoint "/api/operator/rooms"
    Thì hệ thống phải phản hồi mã trạng thái 200
    Và dữ liệu trả về phải có ít nhất 1 buồng nuôi đang vận hành
    Và buồng nuôi "RM01" phải có nhiệt độ chuẩn từ 20 đến 28 độ C

  Kịch bản: Đặt thuê khay nấm và bảo toàn tính toàn vẹn giao dịch (ACID)
    Cho khách hàng có ID là 4 gửi yêu cầu thuê khay nấm
    Khi khách hàng gửi yêu cầu thuê gói "Bào Ngư Xám" với thời hạn 1 tháng và giá 299000 VNĐ
    Thì hệ thống phải xử lý giao dịch an toàn và phản hồi trạng thái 201 hoặc 409
    Và nếu hết khay trống hệ thống phải phản hồi lỗi 409 thay vì sập lỗi máy chủ 500
