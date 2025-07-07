import express from "express";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getCartController,
  addToCartController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  validateStockBeforeCheckoutController,
} from "../controllers/cart.controller.js";

const router = express.Router();

// All routes below require authentication
router.use(requireAuth);

// ========== Cart Routes ==========
router.get("/", getCartController);
router.post("/add", addToCartController);
router.put("/update", updateCartItemController);
router.delete("/remove", removeCartItemController);
router.delete("/clear", clearCartController);
router.get("/validate-stock", validateStockBeforeCheckoutController);

export default router;
