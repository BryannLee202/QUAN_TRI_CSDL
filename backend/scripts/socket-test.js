const { io } = require("socket.io-client");
const s = io("http://localhost:3000");
s.on("connect", () => s.emit("subscribe", { rooms: "all" }));
s.on("sensor:snapshot", (d) => console.log("snapshot:", d));
s.on("sensor:update", (d) => console.log(`[sensor] room ${d.roomId}: ${d.temperature}°C ${d.humidity}% ${d.co2}ppm`));
s.on("alert:new", (d) => console.log("[ALERT]", d.severity, d.alertType, d.message));
s.on("device:action", (d) => console.log("[DEVICE]", d.deviceType, d.actionState, d.triggeredBy));