import bcrypt from "bcrypt";
import type { Request, Response } from "express";
import { generateToken } from "../../utils/generatetoken/generateToken";
import { prisma } from "../../lib/db";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Register user request");
  console.log("Request_body", req.body);
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ message: "User already exists with this email" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword
      }
    });

    // Generate JWT token
    const token = generateToken(user.id, res);

    console.log("User registered successfully in DB");

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Login user request");
  console.log("Request_body", req.body);
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = generateToken(user.id, res);

    // Store session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    console.log("User logged in successfully from DB");

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        token
      }
    });
  } catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export const logoutUser = async (req: Request, res: Response): Promise<void> => {
  console.log("Logout user request");
  console.log("Request_body", req.body);
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Delete all sessions for this user
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    console.log("User logged out successfully from DB");

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

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  console.log("Refresh token request");
  console.log("Request_body", req.body);
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Generate new JWT token
    const token = generateToken(user.id, res);

    // Update session in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    console.log("Token refreshed successfully in DB");

    res.status(200).json({
      message: "Token refreshed successfully",
      user: {
        id: user.id,
        email: user.email,
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

    // Calculate expiration (10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store OTP in database
    await prisma.oTP.create({
      data: {
        aadhaarMobile: aadhaarOrMobile,
        otp,
        expiresAt
      }
    });

    console.log(`OTP sent to ${aadhaarOrMobile}: ${otp}`);
    console.log("OTP stored in DB");

    res.status(200).json({
      message: "OTP sent successfully",
      aadhaarOrMobile,
      otp,
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

    // Find the most recent unverified OTP for this aadhaar/mobile
    const otpRecord = await prisma.oTP.findFirst({
      where: {
        aadhaarMobile: aadhaarOrMobile,
        verified: false,
        expiresAt: {
          gt: new Date()
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      res.status(400).json({ message: "OTP not found or expired" });
      return;
    }

    if (otpRecord.otp !== otp) {
      res.status(400).json({ message: "Invalid OTP" });
      return;
    }

    // Mark OTP as verified
    await prisma.oTP.update({
      where: { id: otpRecord.id },
      data: { verified: true }
    });

    console.log("OTP verified successfully in DB");

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