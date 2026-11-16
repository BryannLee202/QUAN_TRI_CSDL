import { Router } from "express";
import {
  decodeHexPayload,
  getSampleFrame,
  ingestHexPayload,
} from "../controllers/iotParser.controller.js";

const router = Router();

router.post("/decode", decodeHexPayload);
router.post("/ingest", ingestHexPayload);
router.get("/sample", getSampleFrame);

export default router;
