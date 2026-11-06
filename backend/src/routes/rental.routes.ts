import { Router } from "express";
import { createRental, assignTrayQR, requestHarvest, completeHarvest } from "../controllers/rental.controller.js";

const router = Router();

router.post("/rentals", createRental);
router.post("/trays/assign-qr", assignTrayQR);
router.post("/harvest", requestHarvest);
router.post("/harvest/complete", completeHarvest);

export default router;
