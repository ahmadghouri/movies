const { validationResult } = require("express-validator");

/**
 * Runs express-validator results and returns a 422 if any errors exist.
 * Use after your validation chain array in routes.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = validate;
