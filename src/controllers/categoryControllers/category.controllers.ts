import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";

// GET /vendors/categories - List all categories
export const getAllCategories = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            trips: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json({
      message: "Categories retrieved successfully",
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /categories/:id/trips - Get trips by category
export const getTripsByCategory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Category ID is required" });
      return;
    }

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: id as string },
    });

    if (!category) {
      res.status(404).json({ message: "Category not found" });
      return;
    }

    const trips = await prisma.trip.findMany({
      where: { categoryId: id as string },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            rating: true,
            isVerified: true,
          },
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { startDate: "asc" },
    });

    res.status(200).json({
      message: "Trips retrieved successfully",
      trips,
    });
  } catch (error) {
    console.error("Error fetching trips by category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
