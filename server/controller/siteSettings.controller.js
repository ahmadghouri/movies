const SiteSettings = require("../models/siteSettings");
const { PLATFORMS } = require("../models/siteSettings");

// ── Helpers ──────────────────────────────────────────────────────────────────
const getOrCreate = async () => {
  let s = await SiteSettings.findOne({ key: "main" });
  if (!s) s = await SiteSettings.create({ key: "main" });
  return s;
};

// ── Public ───────────────────────────────────────────────────────────────────
// GET /api/site-settings
const handleGetSiteSettings = async (req, res, next) => {
  try {
    const settings = await getOrCreate();
    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────────────────────────
// PUT /api/admin/site-settings
// Body: { siteName?, socialLinks? }
const handleUpdateSiteSettings = async (req, res, next) => {
  try {
    const { siteName, socialLinks } = req.body;

    const update = {};

    if (siteName !== undefined) {
      if (!siteName.trim())
        return res.status(400).json({ success: false, message: "Site name cannot be empty." });
      update.siteName = siteName.trim();
    }

    if (socialLinks !== undefined) {
      if (!Array.isArray(socialLinks))
        return res.status(400).json({ success: false, message: "socialLinks must be an array." });

      // Validate each link
      for (const link of socialLinks) {
        if (!PLATFORMS.includes(link.platform))
          return res.status(400).json({
            success: false,
            message: `Invalid platform: "${link.platform}". Must be one of: ${PLATFORMS.join(", ")}`,
          });
        if (!link.url?.trim())
          return res.status(400).json({ success: false, message: "Each social link must have a URL." });
      }

      update.socialLinks = socialLinks.map((l, i) => ({
        platform: l.platform,
        url:      l.url.trim(),
        label:    l.label?.trim() || "",
        isActive: l.isActive !== false,
        order:    l.order ?? i,
      }));
    }

    const settings = await SiteSettings.findOneAndUpdate(
      { key: "main" },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, data: settings });
  } catch (err) { next(err); }
};

module.exports = { handleGetSiteSettings, handleUpdateSiteSettings };
