import express from "express";
import upload from "../middleware/uploadImageMiddleware.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

import {
  createProductController,
  updateProductController,
  deleteProductController,
  toggleProductStatusController,
  getSingleProductController,
  getAllProductsController,
  getProductsByCategoryController,
  getBulkStockController,
  getVariantsByBulkProductController,
} from "../controllers/product.controller.js";

const router = express.Router();

// ==================== Public Routes ====================
router.get("/", getAllProductsController);
router.get("/:id", getSingleProductController);
router.get("/bulk/stock", getBulkStockController);
router.get("/bulk/:bulkId/variants", getVariantsByBulkProductController);
router.get("/category/:categoryId", getProductsByCategoryController);

// ==================== Admin Routes (protected) ====================
router.post(
  "/",
  requireAuth,
  requireRole(["admin"]),
  upload.array("images", 5),
  createProductController
);

router.put(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  upload.array("images", 5),
  updateProductController
);

router.delete(
  "/:id",
  requireAuth,
  requireRole(["admin"]),
  deleteProductController
);

router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin"]),
  toggleProductStatusController
);

export default router;
