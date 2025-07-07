import express from "express";
import upload from "../middleware/uploadImageMiddleware.js";
import {
  RegisterController,
  LoginController,
  LogoutController,
  refreshTokenController,
  GetUserProfileController,
  UpdateProfileController,
  getAllUsersController,
  toggleUserStatusController,
  updateUserRoleController,
} from "../controllers/user.controller.js";

import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// ==================== Public Routes ====================
router.post("/register", upload.single("profileImage"), RegisterController);
router.post("/login", LoginController);
router.post("/logout", LogoutController);
router.get("/refresh-token", refreshTokenController);

// ==================== Protected Routes (Logged-in users only) ====================
router.get("/me", requireAuth, GetUserProfileController);
router.put(
  "/update-profile",
  requireAuth,
  upload.single("profileImage"),
  UpdateProfileController
);

// ==================== Admin Only Routes ====================
router.get("/", requireAuth, requireRole(["admin"]), getAllUsersController);
router.patch(
  "/:id/status",
  requireAuth,
  requireRole(["admin"]),
  toggleUserStatusController
);
router.patch(
  "/:id/role",
  requireAuth,
  requireRole(["admin"]),
  updateUserRoleController
);

export default router;
