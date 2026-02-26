import { Router } from "express";
import {
  rateTrip,
  rateVendor,
  rateUser,
} from "../../controllers/reviewControllers/review.controllers";

const router = Router();

router.post("/trip/:tripId", rateTrip);
router.post("/vendor/:vendorId", rateVendor);
router.post("/user/:userId", rateUser);

export default router;
