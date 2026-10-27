import express from "express";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);

app.get("/", (_req, res) => {
  res.json({
    name: "MushroomCloud Backend API",
    version: "1.0.0",
    status: "active",
    endpoints: {
      health: "GET /",
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      me: "GET /api/auth/me",
    },
  });
});

export default app;
