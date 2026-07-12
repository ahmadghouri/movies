const ShortLink = require("../models/shortLink");

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "https://pakmovie.online";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/shorten
// Body: { longUrl, movieId? }
// ─────────────────────────────────────────────────────────────────────────────
const handleCreateShortLink = async (req, res, next) => {
  try {
    const { longUrl, movieId } = req.body;

    if (!longUrl?.trim())
      return res.status(400).json({ success: false, message: "longUrl is required." });

    // Idempotent — same longUrl returns the same short link
    const existing = await ShortLink.findOne({ longUrl: longUrl.trim() });
    if (existing) {
      return res.json({
        success: true,
        shortUrl: `${CLIENT_ORIGIN}/s/${existing.code}`,
        code: existing.code,
      });
    }

    // Generate unique 6-char code
    let code, attempts = 0;
    do {
      code = ShortLink.generateCode();
      if (++attempts > 10)
        return res.status(500).json({ success: false, message: "Could not generate unique code." });
    } while (await ShortLink.findOne({ code }));

    const link = await ShortLink.create({
      code,
      longUrl: longUrl.trim(),
      movieId: movieId || null,
    });

    return res.status(201).json({
      success: true,
      shortUrl: `${CLIENT_ORIGIN}/s/${link.code}`,
      code: link.code,
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /s/:code  — redirect + click tracking
// ─────────────────────────────────────────────────────────────────────────────
const handleRedirect = async (req, res, next) => {
  try {
    const link = await ShortLink.findOneAndUpdate(
      { code: req.params.code },
      { $inc: { clicks: 1 } },
      { new: false }
    );

    if (!link)
      return res.status(404).json({ success: false, message: "Short link not found." });

    if (link.expiresAt && link.expiresAt < new Date())
      return res.status(410).json({ success: false, message: "This link has expired." });

    return res.redirect(301, link.longUrl);
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/short-links  — all links with analytics (admin only)
// ─────────────────────────────────────────────────────────────────────────────
const handleGetAllShortLinks = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip  = (page - 1) * limit;
    const sort  = req.query.sort === "clicks" ? { clicks: -1 } : { createdAt: -1 };

    const [links, total] = await Promise.all([
      ShortLink.find()
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("movieId", "title poster slug language year")
        .lean(),
      ShortLink.countDocuments(),
    ]);

    // Summary stats
    const [totalClicks] = await ShortLink.aggregate([
      { $group: { _id: null, total: { $sum: "$clicks" } } },
    ]);

    return res.json({
      success: true,
      data: links.map((l) => ({
        ...l,
        shortUrl: `${CLIENT_ORIGIN}/s/${l.code}`,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      stats: {
        totalLinks: total,
        totalClicks: totalClicks?.total ?? 0,
      },
    });
  } catch (err) { next(err); }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/admin/short-links/:id
// ─────────────────────────────────────────────────────────────────────────────
const handleDeleteShortLink = async (req, res, next) => {
  try {
    const link = await ShortLink.findByIdAndDelete(req.params.id);
    if (!link)
      return res.status(404).json({ success: false, message: "Short link not found." });
    return res.json({ success: true, message: "Deleted." });
  } catch (err) { next(err); }
};

module.exports = {
  handleCreateShortLink,
  handleRedirect,
  handleGetAllShortLinks,
  handleDeleteShortLink,
};
