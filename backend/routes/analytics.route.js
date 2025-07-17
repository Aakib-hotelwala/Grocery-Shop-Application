import express from "express";
import {
  getDailyStats,
  getMonthlyStats,
  getTopSellingProducts,
  recordManualSale,
  getRevenueOverTime,
  getSalesByCategory,
  exportOrdersCSV,
  exportOrdersPDF,
  getAdminStats,
} from "../controllers/analytics.controller.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes below are restricted to Admins
router.use(requireAuth, requireRole(["admin"]));

// 📅 Daily sales, profit, and order count
router.get("/daily", getDailyStats);

// 📆 Monthly sales, profit, and order count
router.get("/monthly", getMonthlyStats);

// 🥇 Top-selling products
router.get("/top-products", getTopSellingProducts);

// 📊 Revenue over time (last 30 days)
router.get("/revenue-over-time", getRevenueOverTime);

// 📊 Sales by category
router.get("/sales-by-category", getSalesByCategory);

// 📊 Admin statistics overview
router.get("/admin-stats", getAdminStats);

// 🧾 Export orders report as CSV
router.get("/export/orders/csv", exportOrdersCSV);

// 🧾 Export orders report as PDF
router.get("/export/orders/pdf", exportOrdersPDF);

// 🧾 Record a manual/in-shop sale
router.post("/manual-sale", recordManualSale);

export default router;
