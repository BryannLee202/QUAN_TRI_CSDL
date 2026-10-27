# Hợp đồng sự kiện realtime (Socket.io)

Server: `initSensorSocket` trong `backend/src/sockets/sensor.socket.ts`.
Chu kỳ đọc DB: `SOCKET_POLL_MS` (mặc định 2000 ms).

## Client gửi
| Sự kiện | Payload | Ý nghĩa |
|---|---|---|
| `subscribe` | `{ rooms: "all" }` hoặc `{ rooms: [1, 2] }` | Đăng ký nhận dữ liệu; có ack `{ ok }` |
| `unsubscribe` | cùng dạng | Hủy đăng ký |

## Server phát
| Sự kiện | Khi nào | Trường chính |
|---|---|---|
| `sensor:snapshot` | Ngay sau `subscribe` | Mảng bản tin mới nhất mỗi buồng |
| `sensor:update` | Có dòng mới trong `SensorData` | `roomId, temperature, humidity, co2, lightLux, recordedAt` |
| `alert:new` | Trigger ghi `SensorAlerts` | `roomId, alertType, severity, message, alertTime` |
| `device:action` | Có dòng mới trong `DeviceActionLogs` | `roomId, deviceType, actionState, triggeredBy, executedAt` |

Thời gian là chuỗi ISO 8601 (UTC); frontend tự đổi sang giờ địa phương.

## Ví dụ
    const s = io("http://localhost:3000");
    s.on("connect", () => s.emit("subscribe", { rooms: "all" }));
    s.on("sensor:update", (d) => console.log(d));