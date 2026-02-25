import { Router } from "express";
import { registerUser, loginUser, logoutUser, refreshToken, sendOTP, verifyOTP } from "../../controllers/authControllers/auth.controllers";   

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken);
router.post("/otp/send", sendOTP);
router.post("/otp/verify", verifyOTP);
router.post("/logout", logoutUser);

export default router;