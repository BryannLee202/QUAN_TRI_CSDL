import { Router } from "express";
import {
  getRooms,
  getTrays,
  getAlerts,
  resolveAlert,
  toggleDevice,
  updateTrayStatus,
  createNewTrays,
} from "../controllers/operator.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Các endpoint nghiệp vụ cho Trung Tâm Điều Hành
router.get("/operator/rooms", getRooms);
router.get("/operator/trays", getTrays);
router.get("/operator/alerts", getAlerts);

// Các thao tác can thiệp phần cứng và CSDL bắt buộc quyền Admin hoặc Operator
router.post("/operator/alerts/:alertId/resolve", requireAuth, requireRole(["Admin", "Operator"]), resolveAlert);
router.post("/operator/devices/toggle", requireAuth, requireRole(["Admin", "Operator"]), toggleDevice);
router.post("/operator/trays/create", requireAuth, requireRole(["Admin", "Operator"]), createNewTrays);
router.post("/operator/trays/:trayId/status", requireAuth, requireRole(["Admin", "Operator"]), updateTrayStatus);

export default router;
