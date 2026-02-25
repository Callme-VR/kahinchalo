import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { generateToken } from "../../utils/generatetoken/generateToken";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  console.log("registered user successfully");
  console.log("Request_body", req.body);
  try {

    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate JWT token
    const token = generateToken(email, res);
    
    res.status(201).json({
      message: "User registered successfully",
      user: {
        name,
        email,
        password: hashedPassword,
        token
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Login user successfully");
  console.log("Request_body", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Mock login success (no DB)
    console.log("User logged in successfully (no DB)");
    
    // Generate JWT token
    const token = generateToken(email, res);
    
    res.status(200).json({
      message: "Login successful",
      user: {
        email,
        token
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Logout user successfully");
  console.log("Request_body", req.body);
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }
    res.status(200).json({
      message: "Logout successful",
      user: {
        email,
        loggedOut: true
      }
    });
  } catch (error) {
    console.error("Error logging out user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// In-memory OTP store (no DB)
const otpStore: Map<string, { otp: string; expiresAt: number }> = new Map();

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  console.log("Refresh token request");
  console.log("Request_body", req.body);
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Generate new JWT token
    const token = generateToken(email, res);
    console.log("Token refreshed successfully (no DB)");

    res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        email,
        token
      }
    });
  } catch (error) {
    console.error("Error refreshing token:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const sendOTP = async (req: Request, res: Response): Promise<void> => {
  console.log("Send OTP request");
  console.log("Request_body", req.body);
  try {
    const { aadhaarOrMobile } = req.body;

    if (!aadhaarOrMobile) {
      res.status(400).json({ message: "Aadhaar number or mobile is required" });
      return;
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with 10-minute expiration
    const expiresAt = Date.now() + 10 * 60 * 1000;
    otpStore.set(aadhaarOrMobile, { otp, expiresAt });

    console.log(`OTP sent to ${aadhaarOrMobile}: ${otp}`);
    console.log("OTP stored in memory (no DB)");

    res.status(200).json({
      message: "OTP sent successfully",
      aadhaarOrMobile,
      otp: otp, // Return OTP for testing (remove in production)
      expiresIn: "10 minutes"
    });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  console.log("Verify OTP request");
  console.log("Request_body", req.body);
  try {
    const { aadhaarOrMobile, otp } = req.body;

    if (!aadhaarOrMobile || !otp) {
      res.status(400).json({ message: "Aadhaar/mobile and OTP are required" });
      return;
    }

    const storedData = otpStore.get(aadhaarOrMobile);

    if (!storedData) {
      res.status(400).json({ message: "OTP not found or expired" });
      return;
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(aadhaarOrMobile);
      res.status(400).json({ message: "OTP has expired" });
      return;
    }

    if (storedData.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // OTP verified - remove from store
    otpStore.delete(aadhaarOrMobile);
    console.log("OTP verified successfully (no DB)");

    res.status(200).json({
      message: "OTP verified successfully",
      aadhaarOrMobile,
      verified: true
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}