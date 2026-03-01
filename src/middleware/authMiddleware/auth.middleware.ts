import type { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    let token = req.cookies?.jwt || req.cookies?.authToken;

    // Also check for Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ message: "Authentication required" });
      return;
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not configured");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;

    let user;
    
    // Check if it's a vendor or regular user
    if (decoded.role === 'vendor') {
      user = await prisma.vendor.findUnique({
        where: { id: decoded.userId },
      });
    } else {
      user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });
    }

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ message: "Invalid token" });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ message: "Token expired" });
      return;
    }
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
