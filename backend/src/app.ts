import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import healthRoutes from "./routes/health.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// 1. Bảo vệ tầng HTTP Headers bằng Helmet (Chống Clickjacking, MIME sniffing, XSS)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// Hỗ trợ gửi cookie an toàn giữa Frontend và Backend
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// 2. Cấu hình Rate Limiting phòng thủ chống DDoS & Brute-force
const generalApiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 120, // Tối đa 120 requests/phút cho các API thông thường
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Tần suất yêu cầu quá cao. Vui lòng thử lại sau 1 phút.",
    },
  },
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 10, // Tối đa 10 lần thử đăng nhập/phút
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: "TOO_MANY_LOGIN_ATTEMPTS",
      message: "Đã vượt quá số lần đăng nhập cho phép. Vui lòng thử lại sau 1 phút.",
    },
  },
});

// Load Swagger document an toàn cho cả dev và production
const swaggerPath = path.resolve(process.cwd(), "src/docs/swagger.json");
const swaggerDocument = fs.existsSync(swaggerPath)
  ? JSON.parse(fs.readFileSync(swaggerPath, "utf-8"))
  : {};

// Swagger OpenAPI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 3. API Routes kèm các lớp bảo vệ
app.use("/api", healthRoutes); // Không áp rate limit khắt khe lên endpoint health check
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api", generalApiLimiter, rentalRoutes);
app.use("/api", generalApiLimiter, paymentRoutes);
app.use("/api", generalApiLimiter, analyticsRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "MushroomCloud Backend API",
    version: "1.0.0",
    status: "active",
    health: "/api/health",
    docs: "/api-docs",
    endpoints: {
      health: "GET /api/health",
      auth: "/api/auth",
      rentals: "POST /api/rentals",
      assignQR: "POST /api/trays/assign-qr",
      harvest: "POST /api/harvest",
      paymentQR: "POST /api/payments/generate-qr",
      analytics: "GET /api/analytics/revenue-monthly",
    },
  });
});

// Middleware xử lý lỗi tập trung toàn hệ thống (Global Error Handler)
app.use(errorHandler);

export default app;
