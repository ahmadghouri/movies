/**
 * adminMiddleware — must run AFTER authMiddleware.
 * Rejects any request where the decoded JWT does not carry isAdmin: true,
 * preventing privilege escalation even if someone crafts a custom token
 * with a valid secret but a missing/false isAdmin flag.
 */
const adminMiddleware = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res
      .status(403)
      .json({ success: false, message: "Forbidden — admin access required." });
  }
  next();
};

module.exports = adminMiddleware;
