const mongoose = require("mongoose");
const { randomBytes } = require("crypto");

const shortLinkSchema = new mongoose.Schema(
  {
    code:      { type: String, unique: true, index: true, required: true },
    longUrl:   { type: String, required: true, trim: true },
    movieId:   { type: mongoose.Schema.Types.ObjectId, ref: "movie", default: null },
    clicks:    { type: Number, default: 0 },
    expiresAt: { type: Date, default: null }, // null = never expires
  },
  { timestamps: true }
);

// Static helper — generate a unique 6-char alphanumeric code
shortLinkSchema.statics.generateCode = function () {
  return randomBytes(4).toString("base64url").slice(0, 6);
};

module.exports = mongoose.model("ShortLink", shortLinkSchema);
