import { Router } from "express";
import { registerHandler, loginHandler, verifyEmailHandler, profileHandler, refreshTokenHandler } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/verify-email", verifyEmailHandler);
router.post("/refresh", refreshTokenHandler)

// Protected routes
router.get("/profile", requireAuth, profileHandler);


export default router;
