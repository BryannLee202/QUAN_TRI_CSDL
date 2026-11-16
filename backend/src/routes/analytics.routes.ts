import { Router } from "express";
import { getMonthlyRevenueReport } from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Báo cáo doanh thu tài chính chỉ dành riêng cho Quản trị viên (Admin)
router.get("/analytics/revenue-monthly", requireAuth, requireRole(["Admin"]), getMonthlyRevenueReport);

export default router;