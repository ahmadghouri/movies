const Contect = require("../models/contect");

// POST /api/contect
const handleContectFrom = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const contact = await Contect.create({ name, email, phone, subject, message });
    return res.status(201).json({
      success: true,
      message: "Your message has been sent successfully.",
      data: { id: contact._id },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/admin/contect  (protected by authMiddleware in router)
const handleGetContectFrom = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [contacts, total] = await Promise.all([
      Contect.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Contect.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: contacts,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { handleContectFrom, handleGetContectFrom };
