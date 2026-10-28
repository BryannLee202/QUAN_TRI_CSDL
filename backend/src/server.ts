import "dotenv/config";
import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { initSensorSocket } from "./sockets/sensor.socket.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  const httpServer = createServer(app);

  try {
    const pool = await connectDB();

    // Khởi tạo Socket.io realtime hub gắn với HTTP server và CSDL pool
    initSensorSocket(httpServer, pool);
  } catch (error) {
    console.warn("[Server] Chạy ứng dụng ở chế độ chờ CSDL (Offline fallback)...");
  }

  httpServer.listen(PORT, () => {
    console.log(`[Server] MushroomCloud Backend API & Socket.io đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
