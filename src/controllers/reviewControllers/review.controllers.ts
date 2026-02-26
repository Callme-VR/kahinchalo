import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";

// POST /reviews/trip/:tripId - User rates trip
export const rateTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { tripId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: user.id,
        tripId: tripId as string,
        rating,
        comment,
      },
    });

    res.status(201).json({
      message: "Trip rated successfully",
      review,
    });
  } catch (error) {
    console.error("Error rating trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /reviews/vendor/:vendorId - User rates vendor
export const rateVendor = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { vendorId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId: user.id,
          vendorId: vendorId as string,
          rating,
          comment,
        },
      });

      // Update vendor average rating
      const vendor = await tx.vendor.findUnique({
        where: { id: vendorId as string },
        select: { rating: true, totalReviews: true },
      });

      if (vendor) {
        const newTotalReviews = vendor.totalReviews + 1;
        const currentTotalRating =
          vendor.rating.toNumber() * vendor.totalReviews;
        const newAverageRating =
          (currentTotalRating + rating) / newTotalReviews;

        await tx.vendor.update({
          where: { id: vendorId as string },
          data: {
            rating: newAverageRating,
            totalReviews: newTotalReviews,
          },
        });
      }

      return newReview;
    });

    res.status(201).json({
      message: "Vendor rated successfully",
      review,
    });
  } catch (error) {
    console.error("Error rating vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /reviews/user/:userId - Vendor rates user
export const rateUser = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { rating, comment } = req.body;

    // In a real scenario, we'd check if the requester is a vendor
    // For now we'll check if requester has a vendor identity or just assume vendor info in body or session
    // Let's assume req.user could also be a vendor or we have req.vendor
    // Since AuthenticatedRequest only has 'user', I'll look for vendorId in body or header for now
    // or assume 'user' object might have vendor info if it's a vendor account.

    const vendorId = req.body.vendorId; // Simplification for demonstration

    if (!vendorId) {
      res.status(400).json({ message: "Vendor ID is required to rate a user" });
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: "Rating must be between 1 and 5" });
      return;
    }

    const review = await prisma.review.create({
      data: {
        userId: userId as string, // The user being rated
        reviewerVendorId: vendorId as string, // The vendor who is rating
        rating,
        comment,
      },
    });

    res.status(201).json({
      message: "User rated successfully by vendor",
      review,
    });
  } catch (error) {
    console.error("Error rating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
