const User = require("../models/user");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// POST /api/signin  — admin only
const userSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Find the user and include the password field for comparison
    const user = await User.findOne({ email }).select("+password");

    // Always return the same generic message — never reveal whether
    // the email exists or whether the account is not admin
    if (!user || !user.isAdmin) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password." });
    }

    // Include isAdmin in the token payload so adminMiddleware can verify it
    const token = JWT.sign(
      { id: user._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, COOKIE_OPTIONS);

    return res.status(200).json({
      success: true,
      message: "Signed in successfully.",
      // Never return the password hash
      data: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/me  — returns profile for the authenticated admin
const userProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/signout
const userSignout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res
    .status(200)
    .json({ success: true, message: "Signed out successfully." });
};

module.exports = { userSignin, userProfile, userSignout };
