import express from "express";
import upload from "../middleware/uploadImageMiddleware.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  createCategoryController,
  updateCategoryController,
  deleteCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  toggleCategoryStatusController,
  getSubcategoriesController,
} from "../controllers/category.controller.js";

const router = express.Router();

// ==================== Public Routes ====================
router.get("/", getAllCategoriesController);
router.get("/:id", getCategoryByIdController);
router.get("/subcategories/:parentId", getSubcategoriesController);

// ==================== Admin Routes ====================
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  upload.single("image"),
  createCategoryController
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  upload.single("image"),
  updateCategoryController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  deleteCategoryController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin"]),
  toggleCategoryStatusController
);

export default router;
