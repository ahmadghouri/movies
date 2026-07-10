const express = require("express");
const {
  userSignin,
  userProfile,
  userSignout,
} = require("../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");
const { signinValidation } = require("../middleware/validators");
const validate = require("../middleware/validate");

const router = express.Router();

// Public — admin login only (no signup route exists)
router.post("/signin", authLimiter, signinValidation, validate, userSignin);

// Protected — admin only
router.post("/signout", authMiddleware, adminMiddleware, userSignout);
router.get("/me", authMiddleware, adminMiddleware, userProfile);

module.exports = router;
