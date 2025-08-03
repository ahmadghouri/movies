const express = require("express");
const {
  userSignup,
  userSignin,
  userProfile,
} = require("../controller/authController");

const router = express.Router();

router.post("/signup", userSignup);
router.post("/signin", userSignin);
router.get("/me", userProfile);

module.exports = router;
