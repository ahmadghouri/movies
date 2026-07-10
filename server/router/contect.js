const express = require("express");
const {
  handleContectFrom,
  handleGetContectFrom,
} = require("../controller/contect.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { contactLimiter, apiLimiter } = require("../middleware/rateLimiter");
const { contactValidation } = require("../middleware/validators");
const validate = require("../middleware/validate");

const contectRouter = express.Router();

// Public: contact form submission (rate limited)
contectRouter.post(
  "/contect",
  contactLimiter,
  contactValidation,
  validate,
  handleContectFrom
);

// Admin only: view contact submissions
contectRouter.get(
  "/admin/contect",
  authMiddleware,
  apiLimiter,
  handleGetContectFrom
);

module.exports = contectRouter;
