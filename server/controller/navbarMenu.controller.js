const NavbarMenu = require("../models/navbarMenu");

// ── Public ─────────────────────────────────────────────────────────────────

/**
 * GET /api/navbar-menu
 * Returns all active menu items (sorted by order) with their active sub-items.
 * Used by the frontend Btnnavbar to render dropdowns.
 */
const handleGetNavbarMenu = async (req, res, next) => {
  try {
    const items = await NavbarMenu.find({ isActive: true }).sort({ order: 1 }).lean();

    // Filter sub-items to only active ones and sort them
    const result = items.map((item) => ({
      ...item,
      subItems: (item.subItems || [])
        .filter((s) => s.isActive)
        .sort((a, b) => a.order - b.order),
    }));

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

// ── Admin ──────────────────────────────────────────────────────────────────

/**
 * GET /api/admin/navbar-menu
 * Returns ALL menu items (including inactive) for admin management.
 */
const handleAdminGetNavbarMenu = async (req, res, next) => {
  try {
    const items = await NavbarMenu.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/admin/navbar-menu
 * Create a new top-level menu item.
 * Body: { label, order, isActive, subItems: [{label, filterValue, order, isActive}] }
 */
const handleCreateNavbarMenu = async (req, res, next) => {
  try {
    const { label, order, isActive, subItems } = req.body;

    if (!label || !label.trim()) {
      return res.status(400).json({ success: false, message: "Label is required." });
    }

    const item = await NavbarMenu.create({
      label: label.trim(),
      order: order ?? 0,
      isActive: isActive ?? true,
      subItems: (subItems || []).map((s, i) => ({
        label: s.label?.trim(),
        filterValue: s.filterValue?.trim(),
        order: s.order ?? i,
        isActive: s.isActive ?? true,
      })),
    });

    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/admin/navbar-menu/:id
 * Update a top-level menu item (label, order, isActive, subItems).
 */
const handleUpdateNavbarMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { label, order, isActive, subItems } = req.body;

    const item = await NavbarMenu.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }

    if (label !== undefined) item.label = label.trim();
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;
    if (subItems !== undefined) {
      item.subItems = subItems.map((s, i) => ({
        _id: s._id,
        label: s.label?.trim(),
        filterValue: s.filterValue?.trim(),
        order: s.order ?? i,
        isActive: s.isActive ?? true,
      }));
    }

    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/navbar-menu/:id
 * Delete a top-level menu item.
 */
const handleDeleteNavbarMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await NavbarMenu.findByIdAndDelete(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }
    res.json({ success: true, message: "Menu item deleted." });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/navbar-menu/:id/toggle
 * Toggle isActive on a top-level menu item.
 */
const handleToggleNavbarMenu = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await NavbarMenu.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Menu item not found." });
    }
    item.isActive = !item.isActive;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  handleGetNavbarMenu,
  handleAdminGetNavbarMenu,
  handleCreateNavbarMenu,
  handleUpdateNavbarMenu,
  handleDeleteNavbarMenu,
  handleToggleNavbarMenu,
};
