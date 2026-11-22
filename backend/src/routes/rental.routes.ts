import { Router } from "express";
import { createRental, getMyTrays, assignTrayQR, requestHarvest, completeHarvest } from "../controllers/rental.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/rentals", createRental);
router.get("/rentals/my-trays", requireAuth, getMyTrays);
router.post("/trays/assign-qr", requireAuth, requireRole(["Admin", "Operator"]), assignTrayQR);
router.post("/harvest", requireAuth, requestHarvest);
router.post("/harvest/complete", requireAuth, requireRole(["Admin", "Operator"]), completeHarvest);

export default router;
