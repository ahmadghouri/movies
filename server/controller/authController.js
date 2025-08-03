const User = require("../models/user");
const bcrypt = require("bcryptjs");
const JWT = require("jsonwebtoken");
const cookie = require("cookie-parser");

const userSignup = async (req, res) => {
  const { name, email, password } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    const user = await User.create({ name, email, password: hashPassword });
    return res.json({ message: "user Add", user });
  } catch (error) {
    console.log(error);
  }
};
const userSignin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    // console.log(user);

    if (!user) {
      return res.status(400).json({ message: "User not Found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "User not Found" });
    }

    const token = JWT.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "Lax", // or 'None' for production with HTTPS
      secure: false, // true in production
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ msg: "Login success", user });
  } catch (error) {
    console.log(error);
  }
};

const userProfile = async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(400).json({ message: "Token not found" });
  }

  try {
    const decode = JWT.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decode.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Invalid token" });
  }
};
module.exports = {
  userSignup,
  userSignin,
  userProfile,
};
