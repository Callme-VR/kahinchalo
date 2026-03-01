import { Router } from "express";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorReviews,
  uploadVendorDocument,
  loginVendor,
  getVendorDashboard,
  getVendorTrips,
  createVendorTrip,
  updateVendorTrip,
  deleteVendorTrip,
  getVendorBookings,
  updateBookingStatus,
} from "../../controllers/vendorControllers/vendor.controllers";

const router = Router();

// Public routes
router.post("/register", registerVendor);
router.post("/login", loginVendor);

// Protected routes - vendor specific (must come before /:id)
router.use(authenticateUser);
router.get("/me", getVendorDashboard);
router.get("/me/trips", getVendorTrips);
router.post("/me/trips", createVendorTrip);
router.put("/me/trips/:tripId", updateVendorTrip);
router.delete("/me/trips/:tripId", deleteVendorTrip);
router.get("/me/bookings", getVendorBookings);
router.put("/me/bookings/:bookingId", updateBookingStatus);

// Public routes for specific vendor by ID
router.get("/:id", getVendorProfile);
router.get("/:id/reviews", getVendorReviews);

// Protected routes for specific vendor by ID
router.put("/:id", updateVendorProfile);
router.post("/documents", uploadVendorDocument);

export default router;
