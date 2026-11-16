# language: vi
Tính năng: Xác thực và Phân quyền truy cập đa vai trò (RBAC)
  Để bảo vệ an toàn dữ liệu và thiết bị phần cứng của nông trại,
  Hệ thống áp dụng cơ chế xác thực JWT kết hợp phân quyền theo vai trò (Admin, Operator, Customer).

  Kịch bản: Đăng nhập thành công với tài khoản Quản trị viên (Admin)
    Cho người dùng có email "admin@mushroomcloud.test" và mật khẩu "Password123@"
    Khi người dùng thực hiện đăng nhập qua endpoint "/api/auth/login"
    Thì hệ thống phải phản hồi mã trạng thái 200
    Và token JWT được cấp phát có thời hạn hợp lệ
    Và vai trò của người dùng được xác định là "Admin"

  Kịch bản: Khách hàng bị chặn truy cập vào tính năng điều khiển phần cứng của Operator
    Cho người dùng "customer1@mushroomcloud.test" đăng nhập thành công với vai trò "Customer"
    Khi khách hàng cố tình gửi lệnh bật thiết bị phần cứng tại "/api/operator/devices/toggle"
    Thì hệ thống bảo mật phải chặn lại với mã trạng thái 403 Forbidden
    Và không có sự thay đổi nào đối với trạng thái relay buồng nuôi nấm
