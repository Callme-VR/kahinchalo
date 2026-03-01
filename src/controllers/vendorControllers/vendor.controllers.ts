import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// POST /vendors/login - Vendor login
export const loginVendor = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    // Find vendor by email
    const vendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (!vendor) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, vendor.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: vendor.id, email: vendor.email, role: 'vendor' },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Set cookie
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Changed for CORS
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Vendor logged in successfully",
      user: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        businessName: vendor.businessName,
        rating: vendor.rating.toNumber(),
        totalReviews: vendor.totalReviews,
        isVerified: vendor.isVerified,
        status: vendor.status,
      },
      token,
    });
  } catch (error) {
    console.error("Error logging in vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /vendors/me - Get vendor dashboard data
export const getVendorDashboard = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: user.id },
      include: {
        trips: {
          include: {
            _count: {
              select: {
                bookings: true,
                reviews: true,
              },
            },
          },
        },
        reviews: true,
      },
    });

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    res.status(200).json({
      message: "Vendor dashboard data retrieved successfully",
      data: {
        id: vendor.id,
        name: vendor.name,
        email: vendor.email,
        businessName: vendor.businessName,
        phone: vendor.phone,
        description: vendor.description,
        serviceCategory: vendor.serviceCategory,
        status: vendor.status,
        isVerified: vendor.isVerified,
        rating: vendor.rating.toNumber(),
        totalReviews: vendor.totalReviews,
        createdAt: vendor.createdAt,
        updatedAt: vendor.updatedAt,
        stats: {
          totalTrips: vendor.trips.length,
          totalBookings: vendor.trips.reduce((sum, trip) => sum + trip._count.bookings, 0),
          totalReviews: vendor.reviews.length,
        },
      },
    });
  } catch (error) {
    console.error("Error getting vendor dashboard:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /vendors/me/trips - Get vendor's trips
export const getVendorTrips = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const trips = await prisma.trip.findMany({
      where: { vendorId: user.id },
      include: {
        _count: {
          select: {
            bookings: true,
            reviews: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: "Vendor trips retrieved successfully",
      trips: trips.map(trip => ({
        ...trip,
        avgRating: trip.avgRating.toNumber(),
        price: trip.price.toNumber(),
      })),
    });
  } catch (error) {
    console.error("Error getting vendor trips:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /vendors/me/trips - Create new trip
export const createVendorTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const {
      title,
      description,
      price,
      location,
      startDate,
      endDate,
      ageGroup,
      maxCapacity,
      imageUrl,
    } = req.body;

    if (!title || !price || !location || !startDate || !endDate) {
      res.status(400).json({ message: "Required fields are missing" });
      return;
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        price: price,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ageGroup,
        maxCapacity,
        imageUrl,
        vendorId: user.id,
      },
    });

    res.status(201).json({
      message: "Trip created successfully",
      trip: {
        ...trip,
        avgRating: trip.avgRating.toNumber(),
        price: trip.price.toNumber(),
      },
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /vendors/me/trips/:tripId - Update trip
export const updateVendorTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { tripId } = req.params;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if trip belongs to this vendor
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId as string, vendorId: user.id },
    });

    if (!existingTrip) {
      res.status(404).json({ message: "Trip not found" });
      return;
    }

    const updateData = req.body;
    
    // Convert dates if present
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate);
    }
    if (updateData.endDate) {
      updateData.endDate = new Date(updateData.endDate);
    }

    const trip = await prisma.trip.update({
      where: { id: tripId as string },
      data: updateData,
    });

    res.status(200).json({
      message: "Trip updated successfully",
      trip: {
        ...trip,
        avgRating: trip.avgRating.toNumber(),
        price: trip.price.toNumber(),
      },
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /vendors/me/trips/:tripId - Delete trip
export const deleteVendorTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { tripId } = req.params;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Check if trip belongs to this vendor
    const existingTrip = await prisma.trip.findFirst({
      where: { id: tripId as string, vendorId: user.id },
    });

    if (!existingTrip) {
      res.status(404).json({ message: "Trip not found" });
      return;
    }

    await prisma.trip.delete({
      where: { id: tripId as string },
    });

    res.status(200).json({
      message: "Trip deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /vendors/me/bookings - Get vendor's bookings
export const getVendorBookings = async (
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
      where: {
        trip: {
          vendorId: user.id,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
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
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      message: "Vendor bookings retrieved successfully",
      bookings: bookings.map(booking => ({
        ...booking,
        totalAmount: booking.totalAmount.toNumber(),
      })),
    });
  } catch (error) {
    console.error("Error getting vendor bookings:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /vendors/me/bookings/:bookingId - Update booking status
export const updateBookingStatus = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!['CONFIRMED', 'CANCELLED'].includes(status)) {
      res.status(400).json({ message: "Invalid status" });
      return;
    }

    // Check if booking belongs to vendor's trip
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId as string,
        trip: {
          vendorId: user.id,
        },
      },
    });

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId as string },
      data: { status },
    });

    res.status(200).json({
      message: "Booking status updated successfully",
      booking: {
        ...updatedBooking,
        totalAmount: updatedBooking.totalAmount.toNumber(),
      },
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /vendors/register - Vendor registration
export const registerVendor = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  console.log("vendor created", req.body);

  try {
    const { name, email, password, phone, businessName, serviceCategory } =
      req.body;

    // if (!name || !email || !password) {
    //   res
    //     .status(400)
    //     .json({ message: "Name, email, and password are required" });
    //   return;
    // }

    // Check if vendor already exists
    const existingVendor = await prisma.vendor.findUnique({
      where: { email },
    });

    if (existingVendor) {
      res
        .status(409)
        .json({ message: "Vendor with this email already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        businessName,
        serviceCategory,
      },
    });

    // Exclude password from response
    const { password: _, ...vendorWithoutPassword } = vendor;

    res.status(201).json({
      message: "Vendor registered successfully",
      vendor: vendorWithoutPassword,
    });
  } catch (error) {
    console.error("Error registering vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /vendors/:id - Vendor public profile
export const getVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Vendor ID is required" });
      return;
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id: id as string },
      select: {
        id: true,
        name: true,
        businessName: true,
        description: true,
        rating: true,
        totalReviews: true,
        isVerified: true,
        createdAt: true,
        trips: {
          select: {
            id: true,
            title: true,
            description: true,
            price: true,
            location: true,
            startDate: true,
            endDate: true,
            ageGroup: true,
            maxCapacity: true,
            currentCapacity: true,
          },
        },
      },
    });

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    res.status(200).json({
      message: "Vendor profile retrieved successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error fetching vendor profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /vendors/:id - Update vendor info (own)
export const updateVendorProfile = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { id } = req.params;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Vendor ID is required" });
      return;
    }

    // Check if vendor exists and belongs to the user
    const vendor = await prisma.vendor.findUnique({
      where: { id: id as string },
    });

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // For now, we'll assume user can update any vendor profile
    // In a real app, you'd check if the user owns this vendor profile
    const { name, phone, description, businessName, serviceCategory } =
      req.body;

    const updateData: {
      name?: string;
      phone?: string;
      description?: string;
      businessName?: string;
      serviceCategory?: string;
    } = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (description) updateData.description = description;
    if (businessName) updateData.businessName = businessName;
    if (serviceCategory) updateData.serviceCategory = serviceCategory;

    const updatedVendor = await prisma.vendor.update({
      where: { id: id as string },
      data: updateData,
    });

    // Exclude password from response
    const { password: _, ...vendorWithoutPassword } = updatedVendor;

    res.status(200).json({
      message: "Vendor profile updated successfully",
      vendor: vendorWithoutPassword,
    });
  } catch (error) {
    console.error("Error updating vendor profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /vendors/:id/reviews - Get vendor reviews
export const getVendorReviews = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== "string") {
      res.status(400).json({ message: "Vendor ID is required" });
      return;
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: id as string },
    });

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    const reviews = await prisma.review.findMany({
      where: { vendorId: id as string },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Vendor reviews retrieved successfully",
      reviews,
    });
  } catch (error) {
    console.error("Error fetching vendor reviews:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /vendors/documents - Upload verification docs
export const uploadVendorDocument = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { vendorId, documentType, documentUrl } = req.body;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!vendorId || !documentType || !documentUrl) {
      res.status(400).json({
        message: "Vendor ID, document type, and document URL are required",
      });
      return;
    }

    // Check if vendor exists
    const vendor = await prisma.vendor.findUnique({
      where: { id: vendorId },
    });

    if (!vendor) {
      res.status(404).json({ message: "Vendor not found" });
      return;
    }

    // Create document
    const document = await prisma.vendorDocument.create({
      data: {
        vendorId,
        documentType,
        documentUrl,
      },
    });

    res.status(201).json({
      message: "Document uploaded successfully",
      document,
    });
  } catch (error) {
    console.error("Error uploading vendor document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
