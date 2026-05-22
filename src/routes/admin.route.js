import { Router } from "express";
import { User } from "../models/user.mode.js";

import { requireAuth } from "../middlewares/requireAuth.js";
import { requireRole } from "../middlewares/requireRole.js";
import {
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUserRole,
} from "../controllers/admin.controller.js";

const router = Router();

// Admin Routes Only
router.get(
  "/users",
  requireAuth,
  requireRole("admin"),
  getAllUsers
);

router.get(
  "/users/:id",
  requireAuth,
  requireRole("admin"),
  getSingleUser
);

router.delete(
  "/users/:id",
  requireAuth,
  requireRole("admin"),
  deleteUser
);

router.put(
  "/users/:id/role",
  requireAuth,
  requireRole("admin"),
  updateUserRole
);

export default router;
