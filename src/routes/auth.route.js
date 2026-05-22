import { Router } from "express";
import { registerHandler, loginHandler, verifyEmailHandler, profileHandler, refreshTokenHandler, logoutHandler, forgotPasswordHandler, resetPasswordHandler } from "../controllers/auth.controller.js";
import { requireAuth } from "../middlewares/requireAuth.js";

const router = Router();

router.post("/register", registerHandler);
router.get("/verify-email", verifyEmailHandler);

router.post("/login", loginHandler);

router.post("/refresh", refreshTokenHandler);

router.post('/logout', logoutHandler);

router.post('/forgot-password', forgotPasswordHandler);
router.post('/reset-password', resetPasswordHandler)



// Protected routes
router.get("/profile", requireAuth, profileHandler);


export default router;
