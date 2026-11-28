import { Router } from "express";
import {
  postDeviceReading,
} from "../controllers/device.controller.js";

/**
 * Route cho thiết bị IoT thật (ESP32), gắn vào /api/iot
 * - /readings, /commands: ESP32 xác thực bằng header x-device-key (không dùng JWT)
 * - /devices: quản trị thiết bị cho Admin / Operator
 */
const router = Router();

router.post("/readings", postDeviceReading);

export default router;
