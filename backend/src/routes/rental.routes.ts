import { Router } from "express";
import { createRental, getMyTrays, assignTrayQR, requestHarvest, completeHarvest } from "../controllers/rental.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/rentals", createRental);
router.get("/rentals/my-trays", requireAuth, getMyTrays);
router.post("/trays/assign-qr", assignTrayQR);
router.post("/harvest", requestHarvest);
router.post("/harvest/complete", completeHarvest);

export default router;
