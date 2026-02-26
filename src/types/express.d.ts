import type { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    name: string;
    email: string;
    password: string;
    role: string;
    createdAt: Date;
  };
}
