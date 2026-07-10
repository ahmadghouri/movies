const { body, param } = require("express-validator");

// ── Auth ─────────────────────────────────────────────────
const signupValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters."),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required.")
    .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/).withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/).withMessage("Password must contain at least one number."),
];

const signinValidation = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail(),
  body("password")
    .notEmpty().withMessage("Password is required."),
];

// ── Contact ──────────────────────────────────────────────
const contactValidation = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required.")
    .isLength({ min: 2, max: 60 }).withMessage("Name must be 2–60 characters.")
    .escape(),
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required.")
    .isEmail().withMessage("Invalid email address.")
    .normalizeEmail(),
  body("phone")
    .optional()
    .trim()
    .matches(/^[+\d\s\-()]{7,20}$/).withMessage("Invalid phone number."),
  body("subject")
    .trim()
    .notEmpty().withMessage("Subject is required.")
    .isLength({ min: 3, max: 120 }).withMessage("Subject must be 3–120 characters.")
    .escape(),
  body("message")
    .trim()
    .notEmpty().withMessage("Message is required.")
    .isLength({ min: 10, max: 2000 }).withMessage("Message must be 10–2000 characters.")
    .escape(),
];

// ── Movie ID param ────────────────────────────────────────
const movieIdValidation = [
  param("id")
    .notEmpty().withMessage("Movie ID is required.")
    .isMongoId().withMessage("Invalid movie ID format."),
];

// ── Movie create ─────────────────────────────────────────
const movieCreateValidation = [
  body("title")
    .trim()
    .notEmpty().withMessage("Title is required.")
    .isLength({ min: 1, max: 200 }).withMessage("Title must be under 200 characters."),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage("Description must be under 2000 characters."),
  body("year")
    .optional()
    .trim()
    .matches(/^\d{4}$/).withMessage("Year must be a 4-digit number."),
  body("rating")
    .optional()
    .isFloat({ min: 0, max: 10 }).withMessage("Rating must be between 0 and 10."),
  body("duration")
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage("Duration must be under 20 characters."),
  body("language")
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage("Language must be under 50 characters."),
  body("views")
    .optional()
    .isInt({ min: 0 }).withMessage("Views must be a non-negative integer."),
];

module.exports = {
  signupValidation,
  signinValidation,
  contactValidation,
  movieIdValidation,
  movieCreateValidation,
};
