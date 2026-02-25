import { Router } from "express";
import { registerUser, loginUser, logoutUser } from "../../controllers/authControllers/auth.controllers";   

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
// router.post("/refresh-token", refreshToken);
// router.post("/send-otp", SendOtp);
// router.post("/verify-otp", VerifyOtp);
router.post("/logout", logoutUser);

export default router;