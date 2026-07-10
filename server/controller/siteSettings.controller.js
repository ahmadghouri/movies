const SiteSettings = require("../models/siteSettings");

// ── Public ──────────────────────────────────────────────────────────────────
/**
 * GET /api/site-settings
 * Returns current site settings. Creates default if none exist.
 */
const handleGetSiteSettings = async (req, res, next) => {
  try {
    let settings = await SiteSettings.findOne({ key: "main" });
    if (!settings) {
      settings = await SiteSettings.create({ key: "main" });
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

// ── Admin ────────────────────────────────────────────────────────────────────
/**
 * PUT /api/admin/site-settings
 * Update site settings (upsert).
 * Body: { siteName }
 */
const handleUpdateSiteSettings = async (req, res, next) => {
  try {
    const { siteName } = req.body;

    if (!siteName || !siteName.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Site name is required." });
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { siteName: siteName.trim() },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

module.exports = { handleGetSiteSettings, handleUpdateSiteSettings };
