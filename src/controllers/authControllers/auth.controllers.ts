import bcrypt from "bcrypt";
import type { Request, Response } from "express";

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Register user");

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("User registered successfully (no DB)");

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name,
        email,
        password: hashedPassword, // return only for testing (remove in production)
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};