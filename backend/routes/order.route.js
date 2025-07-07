import express from "express";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";
import {
  placeOrderController,
  getUserOrdersController,
  getAllOrdersController,
  getSingleOrderController,
  updateOrderStatusController,
  deleteOrderController,
  getOrdersByStatusController,
} from "../controllers/order.controller.js";

const router = express.Router();

// ================== USER ROUTES ==================

// Place a new order
router.post("/", requireAuth, placeOrderController);

// Get logged-in user's orders
router.get("/my", requireAuth, getUserOrdersController);

// ================== ADMIN ROUTES ==================

// Get all orders
router.get("/", requireAuth, requireRole(["admin"]), getAllOrdersController);

// Get orders by status
router.get(
  "/status/:status",
  requireAuth,
  requireRole(["admin"]),
  getOrdersByStatusController
);

// Get single order by ID
router.get(
  "/:orderId",
  requireAuth,
  requireRole(["admin"]),
  getSingleOrderController
);

// Update order status
router.patch(
  "/status",
  requireAuth,
  requireRole(["admin"]),
  updateOrderStatusController
);

// Delete an order
router.delete(
  "/:orderId",
  requireAuth,
  requireRole(["admin"]),
  deleteOrderController
);

export default router;
