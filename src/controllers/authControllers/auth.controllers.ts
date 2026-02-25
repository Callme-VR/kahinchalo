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