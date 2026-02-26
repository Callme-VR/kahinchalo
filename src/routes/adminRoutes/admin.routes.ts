import { Router } from "express";
import {
  listVendors,
  approveVendor,
  createVendorCategory,
  createTrip,
  promoteTrip,
  listQueries,
  replyToQuery,
  getRevenueReport,
  getTopVendorsReport,
} from "../../controllers/adminControllers/admin.controllers";

const router = Router();

// Vendor management
router.get("/vendors", listVendors);
router.put("/vendors/:id/approve", approveVendor);

// Category management
router.post("/vendor-categories", createVendorCategory);

// Trip management
router.post("/trips", createTrip);
router.put("/trips/:id/promote", promoteTrip);

// User queries
router.get("/queries", listQueries);
router.put("/queries/:id/reply", replyToQuery);

// Reports
router.get("/reports/revenue", getRevenueReport);
router.get("/reports/topvendors", getTopVendorsReport);

export default router;
