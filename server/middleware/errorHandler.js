/**
 * Centralized error handler.
 * Must be registered LAST with app.use(errorHandler).
 */
const errorHandler = (err, req, res, next) => {
  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return res.status(409).json({
      success: false,
      message: `${field} already exists.`,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token." });
  }
  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ success: false, message: "Token expired. Please sign in again." });
  }

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res
      .status(413)
      .json({ success: false, message: "File too large. Maximum size is 5MB." });
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res
      .status(400)
      .json({ success: false, message: "Unexpected file field." });
  }

  // Default — never leak stack traces in production
  const isProd = process.env.NODE_ENV === "production";
  const status = err.status || err.statusCode || 500;
  const message = isProd ? "Something went wrong." : err.message || "Internal server error";

  if (!isProd) {
    console.error("[ErrorHandler]", err);
  }

  return res.status(status).json({ success: false, message });
};

module.exports = errorHandler;
