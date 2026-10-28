const { io } = require("socket.io-client");

const PORT = process.env.PORT || 5000;
const s = io(`http://localhost:${PORT}`);

s.on("connect", () => {
  console.log(`[Socket Client] Đã kết nối thành công tới WebSocket Hub tại cổng ${PORT}`);
  s.emit("subscribe", { rooms: "all" });
});

s.on("sensor:snapshot", (d) => console.log("[Snapshot] Dữ liệu vi khí hậu mới nhất:", d));
s.on("sensor:update", (d) => console.log(`[Sensor] Buồng ${d.roomId}: ${d.temperature}°C | ${d.humidity}% | ${d.co2} ppm`));
s.on("alert:new", (d) => console.log("[CẢNH BÁO T-SQL]", d.severity, d.alertType, d.message));
s.on("device:action", (d) => console.log("[LỆNH THIẾT BỊ]", d.deviceType, d.actionState, `Bởi: ${d.triggeredBy}`));
s.on("disconnect", () => console.log("[Socket Client] Mất kết nối tới server"));
