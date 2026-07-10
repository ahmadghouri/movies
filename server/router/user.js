const express = require("express");
const {
  userSignin,
  userProfile,
  userSignout,
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { authLimiter, apiLimiter } = require("../middleware/rateLimiter");
const { signinValidation } = require("../middleware/validators");
const validate = require("../middleware/validate");

const router = express.Router();

// Prevent search engines from indexing signin and admin API endpoints
const noIndex = (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
};

// Public — admin login only (no signup route exists)
router.post("/signin", noIndex, authLimiter, signinValidation, validate, userSignin);

// Protected — admin only
router.post("/signout", noIndex, authMiddleware, adminMiddleware, apiLimiter, userSignout);
router.get("/me",      noIndex, authMiddleware, adminMiddleware, apiLimiter, userProfile);

module.exports = router;
