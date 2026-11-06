import { Router } from "express";
import { generatePaymentQR } from "../controllers/payment.controller.js";

const router = Router();

router.post("/payments/generate-qr", generatePaymentQR);

export default router;