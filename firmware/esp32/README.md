# Firmware ESP32 cho MushroomCloud

ESP32 đọc nhiệt độ, độ ẩm (DHT22) và CO₂ (MQ-135 ước lượng hoặc MH-Z19B), gửi lên backend mỗi 2 giây, hỏi lệnh mỗi giây và bật/tắt 4 relay: phun sương, quạt, đèn (LED), sưởi (LED).

## 1. Luồng dữ liệu

```
ESP32 ──POST /api/iot/readings (x-device-key)──> backend ──EXEC sp_IngestDeviceReading──> SQL Server
                                                                   │  INSERT SensorData
                                                                   │  ├─ trg_CheckSensorThresholds: cảnh báo + tự bật/tắt quạt theo CO2
                                                                   │  └─ luật tự động: phun sương theo độ ẩm, sưởi theo nhiệt độ
ESP32 <──────────── { commands: [...] } ───────────────────────────┘  (lệnh gần nhất trong DeviceActionLogs)
ESP32 ──GET /api/iot/commands mỗi giây──> lệnh bật/tắt tay từ trang Operator tới trong khoảng 1 giây
Socket.IO (sensor.socket.ts) quét SensorData / DeviceActionLogs ──> biểu đồ, cảnh báo, công tắc trên web
```

| Firmware (`kind`) | DeviceType trong `DeviceActionLogs` | Relay | Tự động |
|---|---|---|---|
| `mist` | `MISTING_SYSTEM` (hoặc `MIST_MAKER`) | GPIO 14 | Bật khi độ ẩm < HumidityMin, tắt khi ≥ HumidityMin + 3 |
| `fan` | `EXHAUST_FAN` | GPIO 27 | Trigger SQL: bật khi CO₂ > CO2Max, tắt khi < 90% CO2Max |
| `light` | `GROW_LIGHT` | GPIO 26 | Chỉ bật/tắt tay |
| `heater` | `HEATER` | GPIO 25 | Bật khi nhiệt độ < TempMin, tắt khi ≥ TempMin + 1 |

Lệnh tay trên trang Operator được ưu tiên 10 phút trước khi luật tự động phun sương/sưởi chạy lại. Ngưỡng lấy từ bảng `Rooms` (sửa trong bảng quản trị buồng nuôi).

## 2. Chuẩn bị phía server

1. Chạy thêm file CSDL (sau 01–05):
   ```powershell
   cd database
   sqlcmd -S localhost -d SmartMushroomDB -E -C -I -f 65001 -i 06_iot_devices.sql
   ```
   File tạo bảng `IoTDevices`, view `vw_IoTDeviceStatus`, các stored procedure và **một thiết bị demo gắn buồng RM03 với key `MC-ESP32-RM03-DEMO`**.
2. Khởi động lại backend.
3. Thử khi chưa có phần cứng:
   ```powershell
   node scripts/simulate-esp32.mjs MC-ESP32-RM03-DEMO 2 http://localhost:5000 5
   ```
   Thấy `-> 201 buồng #3 | lệnh: mist=... fan=...` là server đã sẵn sàng. Trên trang Operator, chọn buồng RM03: góc khung "Điều khiển thiết bị buồng" hiện **ESP32 trực tuyến**.
4. Mở cổng 5000 trên Windows Firewall để ESP32 trong cùng mạng Wi-Fi gọi được:
   ```powershell
   New-NetFirewallRule -DisplayName "MushroomCloud backend 5000" -Direction Inbound -Protocol TCP -LocalPort 5000 -Action Allow -Profile Private
   ```
   (PowerShell chạy bằng quyền Administrator, mạng Wi-Fi đặt là Private.)

Tạo key riêng thay cho key demo (tài khoản Admin):
- `POST /api/iot/devices` với `{ "roomId": 3, "deviceName": "ESP32 RM03" }`: trả `apiKey` **một lần duy nhất** (CSDL chỉ lưu SHA-256).
- `POST /api/iot/devices/<deviceId>/rotate-key`: cấp key mới, key cũ hết hiệu lực.
- `GET /api/iot/devices?roomId=3`: danh sách thiết bị và trạng thái online (liên lạc trong 60 giây).

## 3. Linh kiện và sơ đồ chân

| Thiết bị | Chân ESP32 | Ghi chú |
|---|---|---|
| DHT22 – DAT | GPIO 33 | VCC → 3V3 |
| MQ-135 – AO (qua cầu chia áp R1 = R2) | GPIO 32 | VCC → 5V. Bắt buộc chia áp vì AO có thể lên 5V |
| *hoặc* MH-Z19B – TX / RX | GPIO 16 / GPIO 17 | VCC → 5V. Đặt `CO2_SENSOR CO2_MHZ19B` |
| Relay phun sương | GPIO 14 | |
| Relay quạt | GPIO 27 | |
| Relay đèn LED | GPIO 26 | LED + điện trở 220Ω qua tiếp điểm NO |
| Relay sưởi (LED) | GPIO 25 | LED + điện trở 220Ω qua tiếp điểm NO |

- GND của adapter, ESP32, relay và cảm biến phải nối chung.
- MQ-135 chỉ được cắm chân ADC1 (32–36, 39); ADC2 bị Wi-Fi chiếm.
- GPIO 14 phát vài xung lúc ESP32 khởi động nên relay phun sương có thể "tách" nhẹ khi reset. Firmware đặt mức tắt trước khi bật OUTPUT để giảm hiện tượng này; nếu vẫn khó chịu, chuyển relay phun sương sang GPIO 13 hoặc 4 và sửa `RELAY_MIST`.

## 4. Nạp firmware

1. Arduino IDE → Boards Manager → **esp32 by Espressif Systems**; Library Manager → **DHT sensor library**, **Adafruit Unified Sensor**, **ArduinoJson** (v7).
2. Mở `firmware/esp32/mushroomcloud_esp32/mushroomcloud_esp32.ino`, sửa 4 dòng cấu hình:
   - `WIFI_SSID`, `WIFI_PASS`: Wi-Fi **2.4 GHz**.
   - `SERVER`: `http://<IP laptop chạy backend>:5000` (lấy bằng `ipconfig`, không dùng `localhost`).
   - `DEVICE_KEY`: `MC-ESP32-RM03-DEMO` hoặc key tạo riêng.
3. Board **ESP32 Dev Module**, đúng cổng COM, Upload (kẹt ở `Connecting...` thì giữ nút BOOT).
4. Serial Monitor 115200. Trong 30 giây đầu (MQ-135) hoặc 90 giây (MH-Z19B) cảm biến CO₂ làm nóng nên chưa gửi; sau đó thấy `HTTP 201` là thành công.

**Không commit mật khẩu Wi-Fi và API key thật.**

## 5. Tùy chọn trong firmware

| Hằng số | Mặc định | Ý nghĩa |
|---|---|---|
| `CO2_SENSOR` | `CO2_MQ135` | `CO2_MHZ19B` nếu dùng cảm biến NDIR (đo ppm thật, firmware tự tắt ABC) |
| `MQ_AUTO_BASELINE` | `true` | Lấy mức nền lúc làm nóng làm mốc ~420 ppm; `false` = quy đổi thẳng ADC 0..4095 -> 400–5000 ppm |
| `RELAY_ACTIVE_LOW` | `false` | Đổi `true` nếu thiết bị chạy ngược lệnh |
| `LED_DIRECT` | `false` | `true` nếu LED đèn/sưởi cắm thẳng GPIO 26/25 (không qua relay) |
| `SEND_EVERY_MS` / `POLL_EVERY_MS` | 2000 / 1000 | Chu kỳ gửi số đo / hỏi lệnh |

MQ-135 không đo riêng CO₂. Buồng RM03 có ngưỡng 800 ppm; với `MQ_AUTO_BASELINE` thì không khí sạch quanh 420 ppm, thổi hơi vào sẽ vượt ngưỡng, quạt tự bật. Muốn số đo đáng tin cho báo cáo thì dùng MH-Z19B.

## 6. Chạy chung với bộ giả lập

Buồng gắn ESP32 thật (RM03) không được nhận dữ liệu giả cùng lúc:
- Không chạy `scripts/simulate-esp32.mjs` với cùng key khi ESP32 đang cắm.
- `iot_simulator/simulator.py` hiện ghi cho mọi buồng: chỉ chạy khi ESP32 không cắm, hoặc giới hạn simulator vào RM01, RM02.
- `scripts/e2e_iot_integrity_test.js` gửi lệnh vào RM01 nên không ảnh hưởng RM03.

## 7. Xử lý lỗi

| Log Serial Monitor | Nguyên nhân / cách sửa |
|---|---|
| `that bai, se thu lai` | Sai Wi-Fi hoặc mạng 5 GHz |
| `HTTP -1` | Không tới được backend: sai IP, backend chưa chạy, Firewall chặn cổng 5000, khác mạng |
| `HTTP 401` | Sai `DEVICE_KEY` hoặc chưa chạy `06_iot_devices.sql` |
| `HTTP 400 INVALID_READING` | Số đo ngoài phạm vi (cảm biến lỗi hoặc hở dây) |
| `Loi doc DHT22` | Kiểm tra DAT → D33, VCC → 3V3 |
| `MQ-135 doc raw=0` | D32 ở 0V: kiểm tra dây AO, cầu chia áp |
| `MH-Z19B khong tra loi` | Đảo TX/RX, kiểm tra nguồn 5V |
| Web hiện "ESP32 mất kết nối" | Thiết bị không liên lạc quá 60 giây |
| ESP32 tự khởi động lại khi bật thiết bị | Thiếu nguồn: adapter 5V 2A riêng, nối chung GND |
