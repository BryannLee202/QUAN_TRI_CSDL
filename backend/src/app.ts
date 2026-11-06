import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import fs from "fs";
import path from "path";

import authRoutes from "./routes/auth.routes.js";
import rentalRoutes from "./routes/rental.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(cors());
app.use(express.json());

// Load Swagger document an toàn cho cả dev và production
const swaggerPath = path.resolve(process.cwd(), "src/docs/swagger.json");
const swaggerDocument = fs.existsSync(swaggerPath)
  ? JSON.parse(fs.readFileSync(swaggerPath, "utf-8"))
  : {};

// Swagger OpenAPI documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api", rentalRoutes);
app.use("/api", paymentRoutes);
app.use("/api", analyticsRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "MushroomCloud Backend API",
    version: "1.0.0",
    status: "active",
    docs: "/api-docs",
    endpoints: {
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
