import { Router } from "express";
import {
  decodeHexPayload,
  getSampleFrame,
  ingestHexPayload,
} from "../controllers/iotParser.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/decode", decodeHexPayload);
router.post("/ingest", requireAuth, requireRole(["Admin", "Operator"]), ingestHexPayload);
router.get("/sample", getSampleFrame);

export default router;
