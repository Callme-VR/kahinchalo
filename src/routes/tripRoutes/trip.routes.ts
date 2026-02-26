import { Router } from "express";
import { authenticateUser } from "../../middleware/authMiddleware/auth.middleware";
import {
  listTrips,
  getTripDetails,
  createBooking,
} from "../../controllers/tripControllers/trip.controllers";

const router = Router();

// Public routes
router.get("/", listTrips);
router.get("/:id", getTripDetails);

// Protected routes
router.use(authenticateUser);
router.post("/bookings", createBooking);

export default router;
