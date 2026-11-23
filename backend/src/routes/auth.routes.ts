import { Router } from "express";
import { register, login, logout, getMe, updateProfile, changePassword } from "../controllers/auth.controller.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", getMe);
router.put("/profile", updateProfile);
router.post("/change-password", changePassword);

export default router;
