import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshToken, sendOTP, verifyOTP } from "../../controllers/authControllers/auth.controllers";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", authenticateUser, refreshToken);
router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);
router.post("/logout", authenticateUser, logoutUser);

export default router;