const express = require("express");
const { handleCreateShortLink, handleRedirect, handleGetAllShortLinks, handleDeleteShortLink } = require("../controller/shortLink.controller");
const { publicLimiter, apiLimiter } = require("../middleware/rateLimiter");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

const noIndex = (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
};

// Public — create short link (called from SharePopup)
router.post("/api/shorten", publicLimiter, handleCreateShortLink);

// Public — redirect
router.get("/s/:code", handleRedirect);

// Admin — get all short links with analytics
router.get("/api/admin/short-links", noIndex, authMiddleware, adminMiddleware, apiLimiter, handleGetAllShortLinks);

// Admin — delete a short link
router.delete("/api/admin/short-links/:id", noIndex, authMiddleware, adminMiddleware, apiLimiter, handleDeleteShortLink);

module.exports = router;
