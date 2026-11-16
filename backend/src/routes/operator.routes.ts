import { Router } from "express";
import {
  getRooms,
  getTrays,
  getAlerts,
  resolveAlert,
  toggleDevice,
  updateTrayStatus,
} from "../controllers/operator.controller.js";

const router = Router();

// Các endpoint nghiệp vụ cho Trung Tâm Điều Hành
router.get("/operator/rooms", getRooms);
router.get("/operator/trays", getTrays);
router.get("/operator/alerts", getAlerts);
router.post("/operator/alerts/:alertId/resolve", resolveAlert);
router.post("/operator/devices/toggle", toggleDevice);
router.post("/operator/trays/:trayId/status", updateTrayStatus);

export default router;
