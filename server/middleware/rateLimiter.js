const rateLimit = require("express-rate-limit");

// ── helpers ────────────────────────────────────────────────
const jsonResponse = (res, statusCode, message) =>
  res.status(statusCode).json({
    success: false,
    message,
    retryAfter: res.getHeader("Retry-After"),
  });

// ── Auth endpoints (strict) ────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    jsonResponse(
      res,
      429,
      "Too many login attempts. Please try again after 15 minutes."
    ),
});

// ── General API (authenticated users) ────────────────────
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    jsonResponse(res, 429, "Too many requests. Please slow down."),
});

// ── Public endpoints (read-only) ──────────────────────────
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    jsonResponse(res, 429, "Too many requests. Please slow down."),
});

// ── File uploads ──────────────────────────────────────────
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    jsonResponse(
      res,
      429,
      "Upload limit reached. Please try again after 1 hour."
    ),
});

// ── Contact form ──────────────────────────────────────────
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    jsonResponse(
      res,
      429,
      "Too many contact submissions. Please try again later."
    ),
});

module.exports = {
  authLimiter,
  apiLimiter,
  publicLimiter,
  uploadLimiter,
  contactLimiter,
};
