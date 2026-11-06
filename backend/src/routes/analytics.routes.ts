import { Router } from "express";
import { getMonthlyRevenueReport } from "../controllers/analytics.controller.js";

const router = Router();

router.get("/analytics/revenue-monthly", getMonthlyRevenueReport);

export default router;