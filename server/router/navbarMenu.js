const express = require("express");
const {
  handleGetNavbarMenu,
  handleAdminGetNavbarMenu,
  handleCreateNavbarMenu,
  handleUpdateNavbarMenu,
  handleDeleteNavbarMenu,
  handleToggleNavbarMenu,
} = require("../controller/navbarMenu.controller");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { publicLimiter, apiLimiter } = require("../middleware/rateLimiter");

const navbarMenuRouter = express.Router();

// ── Public ─────────────────────────────────────────────────
// Frontend fetches this to render the navbar with dropdowns
navbarMenuRouter.get("/navbar-menu", publicLimiter, handleGetNavbarMenu);

// ── Admin only ──────────────────────────────────────────────
navbarMenuRouter.get(
  "/admin/navbar-menu",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleAdminGetNavbarMenu
);

navbarMenuRouter.post(
  "/admin/navbar-menu",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleCreateNavbarMenu
);

navbarMenuRouter.put(
  "/admin/navbar-menu/:id",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleUpdateNavbarMenu
);

navbarMenuRouter.delete(
  "/admin/navbar-menu/:id",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleDeleteNavbarMenu
);

navbarMenuRouter.patch(
  "/admin/navbar-menu/:id/toggle",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleToggleNavbarMenu
);

module.exports = navbarMenuRouter;
