import { Router } from "express";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";
import {
  registerVendor,
  getVendorProfile,
  updateVendorProfile,
  getVendorReviews,
  uploadVendorDocument,
} from "../../controllers/vendorControllers/vendor.controllers";

const router = Router();

// Public routes
router.post("/register", registerVendor);
router.get("/:id", getVendorProfile);
router.get("/:id/reviews", getVendorReviews);

// Protected routes
router.use(authenticateUser);
router.put("/:id", updateVendorProfile);
router.post("/documents", uploadVendorDocument);

export default router;
