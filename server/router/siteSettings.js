const express = require("express");
const {
  handleGetSiteSettings,
  handleUpdateSiteSettings,
} = require("../controller/siteSettings.controller");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { publicLimiter, apiLimiter } = require("../middleware/rateLimiter");

const siteSettingsRouter = express.Router();

// Public — frontend fetches this on load
siteSettingsRouter.get("/site-settings", publicLimiter, handleGetSiteSettings);

// Admin only — update settings
siteSettingsRouter.put(
  "/admin/site-settings",
  authMiddleware,
  adminMiddleware,
  apiLimiter,
  handleUpdateSiteSettings
);

module.exports = siteSettingsRouter;
