import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";

// GET /users/me - Get own profile
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Exclude password from response
    const { password, ...userWithoutPassword } = user;

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /users/me - Update profile
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { name, email } = req.body;

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    // Update user with provided fields
    const updateData: { name?: string; email?: string } = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    // Exclude password from response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /users/queries - Post support query
export const postQuery = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { subject, message, category } = req.body;

    if (!subject || !message) {
      res.status(400).json({ message: "Subject and message are required" });
      return;
    }

    const query = await prisma.supportQuery.create({
      data: {
        userId: user.id,
        subject,
        message,
        category: category || null,
      },
    });

    res.status(201).json({
      message: "Support query submitted successfully",
      query: {
        id: query.id,
        subject: query.subject,
        status: query.status,
        createdAt: query.createdAt,
      },
    });
  } catch (error) {
    console.error("Error creating support query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /users/bookings - Get booking history
export const getBookings = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const bookings = await prisma.booking.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        numberOfPeople: true,
        trip: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Bookings retrieved successfully",
      bookings,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /users/wishlist/:tripId - Add to wishlist
export const addToWishlist = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { tripId } = req.params;

    if (!tripId || typeof tripId !== "string") {
      res.status(400).json({ message: "Trip ID is required" });
      return;
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId as string },
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found" });
      return;
    }

    // Check if already in wishlist
    const existingWishlist = await prisma.wishlist.findUnique({
      where: {
        userId_tripId: {
          userId: user.id,
          tripId: tripId as string,
        },
      },
    });

    if (existingWishlist) {
      res.status(409).json({ message: "Trip already in wishlist" });
      return;
    }

    // Add to wishlist
    const wishlist = await prisma.wishlist.create({
      data: {
        userId: user.id,
        tripId: tripId as string,
      },
      include: {
        trip: {
          select: {
            id: true,
            title: true,
            location: true,
            price: true,
          },
        },
      },
    });

    res.status(201).json({
      message: "Added to wishlist successfully",
      wishlist,
    });
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
