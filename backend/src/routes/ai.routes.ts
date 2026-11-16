import { Router } from "express";
import { aiController } from "../controllers/aiController.js";

const router = Router();

/**
 * Các Tuyến Đường API AI Thông Minh - MushroomCloud
 */
router.post("/chat", (req, res) => aiController.handleChat(req, res));
router.post("/diagnose", (req, res) => aiController.handleDiagnose(req, res));
router.get("/climate-recommendation", (req, res) =>
  aiController.handleClimateRecommendation(req, res)
);
router.get("/status", (req, res) => aiController.handleStatus(req, res));

export default router;
