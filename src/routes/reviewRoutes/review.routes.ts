import { Router } from "express";
import {
  rateTrip,
  rateVendor,
  rateUser,
  getVendorReviews,
  getTripReviews,
} from "../../controllers/reviewControllers/review.controllers";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";

const router = Router();

// Protect all review routes
router.use(authenticateUser);

router.post("/trip/:tripId", rateTrip);
router.get("/trip/:tripId", getTripReviews);
router.post("/vendor/:vendorId", rateVendor);
router.get("/vendor/:vendorId", getVendorReviews);
router.post("/user/:userId", rateUser);

export default router;
