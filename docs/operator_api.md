# Tài Liệu API Trung Tâm Điều Hành (Operator Hub API)

Mô tả các giao diện lập trình ứng dụng (RESTful API) phục vụ Kỹ thuật viên & Quản trị viên trong trang trại thông minh MushroomCloud FaaS.

---

## 1. Danh Sách Buồng Nuôi (Rooms Matrix)
- **Endpoint**: `GET /api/operator/rooms`
- **Quyền hạn**: Công khai / Kỹ thuật viên
- **Mô tả**: Trả về danh sách buồng vô trùng, thông số môi trường chuẩn (Temp, Humidity, CO2) và sức chứa khay.
- **Phản hồi mẫu**:
```json
{
  "success": true,
  "data": [
    {
      "roomId": 1,
      "roomCode": "RM-01",
      "roomName": "Buồng Nuôi Bào Ngư Xám A1",
      "maxTrays": 40,
      "tempMin": 22.0,
      "tempMax": 25.0,
      "humidityMin": 85.0,
      "humidityMax": 95.0,
      "co2Max": 800,
      "totalTrays": 40,
      "occupiedTrays": 32,
      "availableTrays": 6,
      "maintenanceTrays": 2
    }
  ]
}
```

---

## 2. Ma Trận Khay Nuôi Vật Lý (Cultivation Trays Matrix)
- **Endpoint**: `GET /api/operator/trays`
- **Query params**: `?roomId=1` (tuỳ chọn)
- **Quyền hạn**: Công khai / Kỹ thuật viên
- **Mô tả**: Truy vấn trạng thái toàn bộ khay nấm trong buồng, thời điểm gieo mầm, thông tin gói thuê và mã QR truy xuất.
- **Phản hồi mẫu**:
```json
{
  "success": true,
  "data": [
    {
      "trayId": 1,
      "trayCode": "TR-01",
      "roomId": 1,
      "roomCode": "RM-01",
      "status": "OCCUPIED",
      "packageId": 1,
      "packageName": "Gói Nấm Bào Ngư Xám",
      "customerName": "Nguyễn Văn A",
      "plantDate": "2026-11-01T08:00:00Z",
      "expectedHarvestDate": "2026-12-01T08:00:00Z"
    }
  ]
}
```

---

## 3. Danh Sách Cảnh Báo Vi Khí Hậu (Climate Alerts)
- **Endpoint**: `GET /api/operator/alerts`
- **Query params**: `?resolved=false&limit=20`
- **Quyền hạn**: Công khai / Kỹ thuật viên
- **Mô tả**: Lấy các cảnh báo vượt ngưỡng vi khí hậu do cảm biến IoT gửi về CSDL theo thời gian thực.
- **Phản hồi mẫu**:
```json
{
  "success": true,
  "data": [
    {
      "alertId": 12,
      "roomId": 2,
      "roomCode": "RM-02",
      "alertType": "HUMIDITY_LOW",
      "severity": "WARNING",
      "message": "Độ ẩm buồng Linh Chi giảm còn 82% (ngưỡng tối thiểu 85%)",
      "isResolved": false,
      "createdAt": "2026-11-16T19:40:00Z"
    }
  ]
}
```

---

## 4. Xử Lý Cảnh Báo (Resolve Alert)
- **Endpoint**: `POST /api/operator/alerts/:alertId/resolve`
- **Quyền hạn**: `Admin`, `Operator` (Yêu cầu JWT cookie/token)
- **Payload**:
```json
{
  "note": "Đã bật quạt đối lưu và phun sương siêu âm 15 phút, độ ẩm đã hồi phục 91%"
}
```

---

## 5. Can Thiệp Thiết Bị Vi Khí Hậu (Toggle Device)
- **Endpoint**: `POST /api/operator/devices/toggle`
- **Quyền hạn**: `Admin`, `Operator` (Yêu cầu JWT cookie/token)
- **Mô tả**: Bật/tắt cưỡng bức rèm lạnh, máy tạo ẩm sóng siêu âm, đèn quang phổ hoặc quạt hút khí tươi.
- **Payload**:
```json
{
  "roomId": 1,
  "deviceType": "MIST_ULTRASONIC",
  "action": "ON",
  "durationSeconds": 300
}
```

---

## 6. Cập Nhật Trạng Thái Khay Nấm (Update Tray Status)
- **Endpoint**: `POST /api/operator/trays/:trayId/status`
- **Quyền hạn**: `Admin`, `Operator` (Yêu cầu JWT cookie/token)
- **Payload**:
```json
{
  "status": "MAINTENANCE",
  "reason": "Khử trùng tia cực tím UV-C sau chu kỳ thu hoạch"
}
```
