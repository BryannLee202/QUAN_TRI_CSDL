import { Router } from "express";
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  getTrays,
  getAlerts,
  resolveAlert,
  toggleDevice,
  updateTrayStatus,
  createNewTrays,
  getUsersList,
  createManagedUser,
  updateManagedUser,
  updateUserStatus,
  updateUserRole,
  resetUserPassword,
} from "../controllers/operator.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

// Xem danh sách buồng nuôi và ma trận khay nuôi công khai (Phục vụ Mô hình Trang trại 3D và Trung tâm điều hành)
router.get("/operator/rooms", getRooms);
router.post("/operator/rooms", requireAuth, requireRole(["Admin"]), createRoom);
router.put("/operator/rooms/:roomId", requireAuth, requireRole(["Admin"]), updateRoom);
router.delete("/operator/rooms/:roomId", requireAuth, requireRole(["Admin"]), deleteRoom);

router.get("/operator/trays", getTrays);
router.get("/operator/alerts", requireAuth, requireRole(["Admin", "Operator"]), getAlerts);

// Các thao tác can thiệp phần cứng và CSDL bắt buộc quyền Admin hoặc Operator
router.post("/operator/alerts/:alertId/resolve", requireAuth, requireRole(["Admin", "Operator"]), resolveAlert);
router.post("/operator/devices/toggle", requireAuth, requireRole(["Admin", "Operator"]), toggleDevice);
router.post("/operator/trays/create", requireAuth, requireRole(["Admin", "Operator"]), createNewTrays);
router.post("/operator/trays/:trayId/status", requireAuth, requireRole(["Admin", "Operator"]), updateTrayStatus);

// Quản lý người dùng và phân quyền RBAC (Chỉ dành cho Quản trị viên Admin)
router.get("/operator/users", requireAuth, requireRole(["Admin"]), getUsersList);
router.post("/operator/users", requireAuth, requireRole(["Admin"]), createManagedUser);
router.put("/operator/users/:userId", requireAuth, requireRole(["Admin"]), updateManagedUser);
router.put("/operator/users/:userId/status", requireAuth, requireRole(["Admin"]), updateUserStatus);
router.put("/operator/users/:userId/role", requireAuth, requireRole(["Admin"]), updateUserRole);
router.post("/operator/users/:userId/reset-password", requireAuth, requireRole(["Admin"]), resetUserPassword);

export default router;
