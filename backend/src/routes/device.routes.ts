import { Router } from "express";
import {
  getDeviceCommands,
  getRoomDeviceStates,
  listIoTDevices,
  postDeviceReading,
  registerIoTDevice,
  rotateIoTDeviceKey,
} from "../controllers/device.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

/**
 * Route cho thiết bị IoT thật (ESP32), gắn vào /api/iot
 * - /readings, /commands: ESP32 xác thực bằng header x-device-key (không dùng JWT)
 * - /devices: quản trị thiết bị cho Admin / Operator
 */
const router = Router();

router.post("/readings", postDeviceReading);
router.get("/commands", getDeviceCommands);

router.get("/rooms/:roomId/device-states", getRoomDeviceStates);
router.get("/devices", requireAuth, requireRole(["Admin", "Operator"]), listIoTDevices);
router.post("/devices", requireAuth, requireRole(["Admin"]), registerIoTDevice);
router.post("/devices/:deviceId/rotate-key", requireAuth, requireRole(["Admin"]), rotateIoTDeviceKey);

export default router;
