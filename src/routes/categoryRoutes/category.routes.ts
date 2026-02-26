import { Router } from "express";
import {
  getAllCategories,
  getTripsByCategory,
} from "../../controllers/categoryControllers/category.controllers";

const router = Router();

// Public routes
router.get("/categories", getAllCategories);
router.post("/categories/:id/trips", getTripsByCategory);

export default router;
