import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";
import { VendorStatus, QueryStatus } from "../../generated/prisma";

// GET /admin/vendors - List all vendors (filter: status)
export const listVendors = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status as string as VendorStatus;
    }

    const vendors = await prisma.vendor.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Vendors retrieved successfully",
      vendors,
    });
  } catch (error) {
    console.error("Error listing vendors:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /admin/vendors/:id/approve - Approve vendor
export const approveVendor = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const vendor = await prisma.vendor.update({
      where: { id: id as string },
      data: {
        status: VendorStatus.APPROVED,
        isVerified: true,
      },
    });

    res.status(200).json({
      message: "Vendor approved successfully",
      vendor,
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /admin/vendor-categories - Create new vendor category
export const createVendorCategory = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, description, icon } = req.body;

    if (!name) {
      res.status(400).json({ message: "Category name is required" });
      return;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description,
        icon,
      },
    });

    res.status(201).json({
      message: "Vendor category created successfully",
      category,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// POST /admin/trips - Create trip
export const createTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      price,
      location,
      startDate,
      endDate,
      ageGroup,
      maxCapacity,
      categoryId,
      vendorId,
    } = req.body;

    if (!title || !price || !location || !startDate || !endDate) {
      res.status(400).json({ message: "Missing required trip fields" });
      return;
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        price,
        location,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        ageGroup,
        maxCapacity,
        categoryId,
        vendorId,
      },
    });

    res.status(201).json({
      message: "Trip created successfully",
      trip,
    });
  } catch (error) {
    console.error("Error creating trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /admin/trips/:id/promote - Set promotion + age group
export const promoteTrip = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isPromoted, promotionTitle, ageGroup } = req.body;

    const trip = await prisma.trip.update({
      where: { id: id as string },
      data: {
        isPromoted: isPromoted !== undefined ? isPromoted : true,
        promotionTitle,
        ageGroup,
      },
    });

    res.status(200).json({
      message: "Trip promoted successfully",
      trip,
    });
  } catch (error) {
    console.error("Error promoting trip:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/queries - List user queries
export const listQueries = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { status } = req.query;

    const where: any = {};
    if (status) {
      where.status = status as string as QueryStatus;
    }

    const queries = await prisma.supportQuery.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Support queries retrieved successfully",
      queries,
    });
  } catch (error) {
    console.error("Error listing queries:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT /admin/queries/:id/reply - Reply to query
export const replyToQuery = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reply, status } = req.body;

    if (!reply) {
      res.status(400).json({ message: "Reply message is required" });
      return;
    }

    const query = await prisma.supportQuery.update({
      where: { id: id as string },
      data: {
        reply,
        status: status || QueryStatus.RESOLVED,
      },
    });

    res.status(200).json({
      message: "Reply sent successfully",
      query,
    });
  } catch (error) {
    console.error("Error replying to query:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/reports/revenue - Revenue report
export const getRevenueReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        status: "CONFIRMED", // Or COMPLETED
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const totalRevenue = bookings.reduce(
      (sum, booking) => sum + booking.totalAmount.toNumber(),
      0,
    );

    res.status(200).json({
      message: "Revenue report retrieved successfully",
      report: {
        totalRevenue,
        bookingCount: bookings.length,
        bookings,
      },
    });
  } catch (error) {
    console.error("Error fetching revenue report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET /admin/reports/topvendors - Top vendors report
export const getTopVendorsReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  try {
    const vendors = await prisma.vendor.findMany({
      take: 10,
      orderBy: [{ rating: "desc" }, { totalReviews: "desc" }],
      select: {
        id: true,
        name: true,
        businessName: true,
        rating: true,
        totalReviews: true,
      },
    });

    res.status(200).json({
      message: "Top vendors report retrieved successfully",
      vendors,
    });
  } catch (error) {
    console.error("Error fetching top vendors report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
