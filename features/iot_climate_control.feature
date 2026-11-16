# language: vi
Tính năng: Tự động điều hòa vi khí hậu buồng nấm và điều khiển thiết bị IoT
  Để đảm bảo nấm phát triển theo tiêu chuẩn dược liệu VietGAP,
  Hệ thống tự động giải mã gói tin cảm biến nhị phân và kích hoạt thiết bị phun sương khi cần thiết.

  Kịch bản: Giải mã gói tin nhị phân Modbus RTU từ cảm biến phòng sạch
    Cho trạm cảm biến IoT gửi gói tin Hex "01030600F50375026CBDB3"
    Khi gói tin được nạp vào Gateway qua endpoint "/api/iot/ingest" với mã phòng là 1
    Thì hệ thống phải phản hồi mã trạng thái 200 hoặc 201
    Và nhiệt độ đo được phải là 24.5 độ C
    Và độ ẩm đo được phải là 88.5 phần trăm
    Và dữ liệu cảm biến phải được lưu thành công vào bảng "SensorData"

  Kịch bản: Kỹ thuật viên (Operator) điều khiển bật máy phun sương từ xa
    Cho kỹ thuật viên "operator1@mushroomcloud.test" đã được cấp quyền Operator
    Khi kỹ thuật viên gửi lệnh bật thiết bị "MISTING_SYSTEM" cho buồng nuôi 1
    Thì hệ thống phải phản hồi mã trạng thái 200
    Và sự kiện bật máy phun sương được phát sóng thời gian thực qua WebSocket
