const mongoose = require("mongoose");

/**
 * SiteSettings — single document (singleton pattern).
 * Always upsert with a fixed key so only one record exists.
 */
const siteSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: "main", unique: true },
    siteName: { type: String, default: "MovieMania", trim: true },
  },
  { timestamps: true }
);

const SiteSettings = mongoose.model("SiteSettings", siteSettingsSchema);

module.exports = SiteSettings;
