import { Router } from "express";
import { registerUser } from "../../controllers/authControllers/auth.controllers";   

const router = Router();

router.post("/register", registerUser);
// router.post("/login", Login);
// router.post("/refresh-token", refreshToken);
// router.post("/send-otp", SendOtp);
// router.post("/verify-otp", VerifyOtp);
// router.post("/logout", logout);

export default router;