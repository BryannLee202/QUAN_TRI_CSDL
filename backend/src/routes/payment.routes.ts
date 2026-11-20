import { Router } from "express";
import {
  generatePaymentQR,
  initiatePaymentSession,
  confirmPaymentCheckout,
  getPaymentHistory,
} from "../controllers/payment.controller.js";

const router = Router();

router.post("/payments/generate-qr", generatePaymentQR);
router.post("/payments/initiate", initiatePaymentSession);
router.post("/payments/confirm", confirmPaymentCheckout);
router.get("/payments/history", getPaymentHistory);

export default router;
