import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = Number(process.env.PORT) || 5000;

const startServer = async () => {
  try {
    await connectDB();
  } catch (error) {
    console.warn("[Server] Chạy ứng dụng ở chế độ chờ CSDL (Offline fallback)...");
  }

  app.listen(PORT, () => {
    console.log(`[Server] MushroomCloud Backend API đang chạy tại http://localhost:${PORT}`);
  });
};

startServer();
