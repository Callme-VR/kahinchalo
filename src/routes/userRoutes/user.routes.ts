import { Router } from "express";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";
import {
  getProfile,
  updateProfile,
  postQuery,
  getBookings,
  addToWishlist,
} from "../../controllers/userControllers/user.controllers";

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Profile routes
router.get("/me", getProfile);
router.put("/me", updateProfile);

// Support query
router.post("/queries", postQuery);

// Bookings
router.get("/bookings", getBookings);

// Wishlist
router.post("/wishlist/:tripId", addToWishlist);

export default router;
