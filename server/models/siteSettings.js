const mongoose = require("mongoose");

/**
 * Supported social platforms — used for icon mapping on the frontend.
 */
const PLATFORMS = [
  "telegram", "facebook", "tiktok", "whatsapp",
  "youtube", "instagram", "twitter", "website",
  "discord", "pinterest", "snapchat", "other",
];

const socialLinkSchema = new mongoose.Schema({
  platform: { type: String, enum: PLATFORMS, required: true },
  url:      { type: String, required: true, trim: true },
  label:    { type: String, trim: true, default: "" },  // custom label e.g. "Join Our Telegram"
  isActive: { type: Boolean, default: true },
  order:    { type: Number, default: 0 },
}, { _id: true });

const siteSettingsSchema = new mongoose.Schema(
  {
    key:         { type: String, default: "main", unique: true },
    siteName:    { type: String, default: "PakMovie", trim: true },
    socialLinks: { type: [socialLinkSchema], default: [] },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
module.exports.PLATFORMS = PLATFORMS;
