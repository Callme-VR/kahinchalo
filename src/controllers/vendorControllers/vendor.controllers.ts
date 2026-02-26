import type { Response } from "express";
import type { AuthenticatedRequest } from "../../types/express";
import { prisma } from "../../lib/db";
import bcrypt from "bcrypt";

// POST /vendors/register - Vendor registration
export const registerVendor = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  console.log("vendor created", req.body);

  try {
    const { name, email, password, phone, businessName, serviceCategory } =
      req.body;

    if (!name || !email || !password) {
      res
        .status(400)
        .json({ message: "Name, email, and password are required" });
      return;
    }

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
