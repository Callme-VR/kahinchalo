import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";

// GET /trips - List trips (filter: ageGroup, budget, location)
export const listTrips = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { ageGroup, budget, location, page = "1", limit = "10" } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = {};

    if (ageGroup) {
      where.ageGroup = ageGroup as string;
    }

    if (location) {
      where.location = {
        contains: location as string,
        mode: "insensitive",
      };
    }

    if (budget) {
      const budgetNum = parseFloat(budget as string);
      if (!isNaN(budgetNum)) {
        where.price = {
          lte: budgetNum,
        };
      }
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
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
          // count: {
          //   select: {
          //     bookings: true,
          //     reviews: true,
          //   },
          // },
        },
        orderBy: { startDate: "asc" },
        skip,
        take: limitNum,
      }),
      prisma.trip.count({ where }),
    ]);

    res.status(200).json({
      message: "Trips retrieved successfully",
      trips,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("Error listing trips:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /trips/:id - Trip detail + data
export const getTripDetails = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Trip ID is required" });
      return;
    }

    const trip = await prisma.trip.findUnique({
      where: { id: id as string },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            businessName: true,
            description: true,
            rating: true,
            totalReviews: true,
            isVerified: true,
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found" });
      return;
    }

    res.status(200).json({
      message: "Trip details retrieved successfully",
      trip,
    });
  } catch (error) {
    console.error("Error fetching trip details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /trips/bookings - Create booking
export const createBooking = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { tripId, numberOfPeople = 1 } = req.body;

    if (!tripId) {
      res.status(400).json({ message: "Trip ID is required" });
      return;
    }

    // Check if trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      res.status(404).json({ message: "Trip not found" });
      return;
    }

    // Check availability
    if (
      trip.maxCapacity &&
      trip.currentCapacity + numberOfPeople > trip.maxCapacity
    ) {
      res.status(400).json({ message: "Not enough capacity available" });
      return;
    }

    // Calculate total amount
    const totalAmount = trip.price.toNumber() * numberOfPeople;

    // Create booking
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          userId: user.id,
          tripId,
          totalAmount,
        },
        include: {
          trip: {
            select: {
              id: true,
              title: true,
              location: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
        },
      });

      // Update trip capacity
      if (trip.maxCapacity) {
        await tx.trip.update({
          where: { id: tripId },
          data: {
            currentCapacity: trip.currentCapacity + numberOfPeople,
          },
        });
      }

      return newBooking;
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
