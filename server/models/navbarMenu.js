const mongoose = require("mongoose");

/**
 * NavbarMenu — stores the top-level navbar buttons and their dropdown sub-items.
 *
 * Example document:
 * {
 *   label: "Bollywood",
 *   order: 2,
 *   isActive: true,
 *   subItems: [
 *     { label: "2026 Movies", filterValue: "2026", order: 1, isActive: true },
 *     { label: "2025 Movies", filterValue: "2025", order: 2, isActive: true },
 *   ]
 * }
 */

const subItemSchema = new mongoose.Schema({
  label: { type: String, required: true, trim: true },
  filterValue: { type: String, required: true, trim: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
});

const navbarMenuSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    subItems: [subItemSchema],
  },
  { timestamps: true }
);

const NavbarMenu = mongoose.model("NavbarMenu", navbarMenuSchema);

module.exports = NavbarMenu;
