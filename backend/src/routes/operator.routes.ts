import { Router } from "express";
import {
  getRooms,
  getTrays,
  getAlerts,
  resolveAlert,
  toggleDevice,
  updateTrayStatus,
  createNewTrays,
  getUsersList,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
} from "../controllers/operator.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Các endpoint nghiệp vụ cho Trung Tâm Điều Hành - Bắt buộc vai trò Quản Trị Viên hoặc Kỹ Thuật Viên
router.get("/operator/rooms", requireAuth, requireRole(["Admin", "Operator"]), getRooms);
router.get("/operator/trays", requireAuth, requireRole(["Admin", "Operator"]), getTrays);
router.get("/operator/alerts", requireAuth, requireRole(["Admin", "Operator"]), getAlerts);

// Các thao tác can thiệp phần cứng và CSDL bắt buộc quyền Admin hoặc Operator
router.post("/operator/alerts/:alertId/resolve", requireAuth, requireRole(["Admin", "Operator"]), resolveAlert);
router.post("/operator/devices/toggle", requireAuth, requireRole(["Admin", "Operator"]), toggleDevice);
router.post("/operator/trays/create", requireAuth, requireRole(["Admin", "Operator"]), createNewTrays);
router.post("/operator/trays/:trayId/status", requireAuth, requireRole(["Admin", "Operator"]), updateTrayStatus);

// Quản lý người dùng và phân quyền RBAC (Chỉ dành cho Quản trị viên Admin - Chức năng A3)
router.get("/operator/users", requireAuth, requireRole(["Admin"]), getUsersList);
router.put("/operator/users/:userId/status", requireAuth, requireRole(["Admin"]), updateUserStatus);
router.put("/operator/users/:userId/role", requireAuth, requireRole(["Admin"]), updateUserRole);
router.post("/operator/users/:userId/reset-password", requireAuth, requireRole(["Admin"]), resetUserPassword);

export default router;
