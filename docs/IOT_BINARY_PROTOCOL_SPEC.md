# ĐẶC TẢ GIAO THỨC TRUYỀN THÔNG NHỊ PHÂN CẢM BIẾN VI KHÍ HẬU (IOT BINARY PROTOCOL SPECIFICATION)

**Dự án:** MushroomCloud Smart Farm FaaS Platform  
**Phiên bản:** 2.0  
**Tác giả:** Nhóm Phát Triển Dự Án FaaS  
**Chuẩn công nghiệp:** Modbus RTU qua RS485 & LoRaWAN Payload Compact  

---

## 1. Mục Đích & Bối Cảnh
Trong các buồng nuôi nấm phòng sạch vô trùng (ISO Class 5), các trạm cảm biến môi trường công nghiệp đo đạc 4 thông số trọng yếu:
1. **Nhiệt độ (Temperature - °C)**
2. **Độ ẩm không khí (Relative Humidity - %RH)**
3. **Nồng độ khí CO₂ (Carbon Dioxide - ppm)**
4. **Cường độ ánh sáng (Light Intensity - Lux)**

Để đảm bảo hiệu năng mạng, chống suy hao và tối ưu hóa băng thông, trạm cảm biến truyền dữ liệu dưới dạng **gói tin nhị phân (Binary Hex Stream)** thay vì JSON cồng kềnh. Tài liệu này đặc tả cấu trúc byte và thuật toán giải mã để backend Express nạp trực tiếp vào CSDL Microsoft SQL Server 2022.

---

## 2. Cấu Trúc Khung Tin Modbus RTU (11 Bytes)

Khung truyền chuẩn Modbus RTU bao gồm 11 byte:

| Byte Offset | Trường Dữ Liệu | Kiểu Dữ Liệu | Ý Nghĩa / Định Dạng | Ví Dụ Giá Trị |
| :--- | :--- | :--- | :--- | :--- |
| **0** | `DeviceAddress` | `uint8` | Địa chỉ trạm buồng (1 - 247) | `0x01` (Buồng RM01) |
| **1** | `FunctionCode` | `uint8` | Mã hàm Modbus: `0x03` (Read Holding Registers) | `0x03` |
| **2** | `ByteCount` | `uint8` | Số lượng byte dữ liệu theo sau (6 bytes) | `0x06` |
| **3 - 4** | `Temperature` | `int16_BE` | Nhiệt độ (°C x 10, bù 2 có dấu) | `0x00F5` = 245 -> **24.5°C** |
| **5 - 6** | `Humidity` | `uint16_BE` | Độ ẩm tương đối (%RH x 10) | `0x0375` = 885 -> **88.5%** |
| **7 - 8** | `CO2Level` | `uint16_BE` | Nồng độ khí CO₂ (ppm) | `0x026C` = **620 ppm** |
| **9 - 10** | `CRC16` | `uint16_LE` | Checksum kiểm tra lỗi (Modbus Polynomial `0xA001`) | `0xB3BD` (Little Endian) |

### Ví Dụ Gói Tin Raw Hex:
```hex
01 03 06 00 F5 03 75 02 6C BD B3
```
- **01**: Buồng số 1
- **03**: Đọc dữ liệu cảm biến
- **06**: 6 bytes dữ liệu
- **00F5**: 24.5°C
- **0375**: 88.5% RH
- **026C**: 620 ppm CO₂
- **BDB3**: Checksum CRC16 hợp lệ (Little-Endian: Low `0xBD`, High `0xB3`)

---

## 3. Thuật Toán Kiểm Tra Tính Toàn Vẹn CRC16 Modbus

Thuật toán sử dụng đa thức Modbus `0xA001`, giá trị khởi tạo `0xFFFF`:

```typescript
export function calculateCRC16Modbus(buffer: Buffer, length: number): number {
  let crc = 0xffff;
  for (let i = 0; i < length; i++) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x0001) !== 0) {
        crc = (crc >> 1) ^ 0xa001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}
```

---

## 4. Tích Hợp Vào CSDL SQL Server 2022 & Realtime Socket

Khi frame nhị phân được gửi tới API endpoint `POST /api/iot/ingest`:
1. **Kiểm tra tính toàn vẹn:** Bộ giải mã tính lại CRC16. Nếu checksum sai lệch (do nhiễu đường truyền), backend từ chối ghi nhận và phát cảnh báo cảm biến lỗi.
2. **Nạp dữ liệu vào bảng `SensorData`:**
   ```sql
   INSERT INTO SensorData (RoomID, Temperature, Humidity, CO2Level, LightLux, RecordedAt)
   VALUES (@RoomID, @Temperature, @Humidity, @CO2Level, @LightLux, SYSDATETIME());
   ```
3. **Kích hoạt DML Trigger:** Trigger `dbo.trg_CheckSensorThresholds` tự động so sánh giá trị vừa ghi với ngưỡng của loài nấm trong buồng:
   - Nếu CO₂ vượt ngưỡng (VD: > 1000 ppm đối với nấm Bào Ngư) -> Kích hoạt quạt hút `EXHAUST_FAN` và sinh cảnh báo đỏ `CRITICAL`.
   - Nếu độ ẩm tụt -> Tự động bật máy phun sương siêu âm `MISTING_SYSTEM`.
4. **Broadcast WebSocket:** Dữ liệu mới được phát tức thời đến Cổng Khách Hàng và Trung Tâm Điều Hành với độ trễ `< 5ms`.
