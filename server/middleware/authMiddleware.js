const JWT = require("jsonwebtoken");

/**
 * Protects routes — verifies JWT from httpOnly cookie.
 * Attaches decoded payload to req.user.
 */
const authMiddleware = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized — please sign in." });
  }

  try {
    const decoded = JWT.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, message: "Session expired. Please sign in again." });
    }
    return res
      .status(401)
      .json({ success: false, message: "Invalid token." });
  }
};

module.exports = authMiddleware;
