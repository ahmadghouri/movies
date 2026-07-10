import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosbase from "../../axiosbasa";

// ─── Dropdown panel that appears on hover ────────────────────────────────────
const DropdownPanel = ({ subItems, onSelect }) => (
  <div
    className="absolute top-full left-0 z-50 mt-1 min-w-[280px] bg-blue-700 border border-blue-600 rounded shadow-xl"
    // keep panel open while mouse is over it
    onMouseEnter={(e) => e.currentTarget.closest("[data-menu-item]")?.setAttribute("data-open", "true")}
    onMouseLeave={(e) => e.currentTarget.closest("[data-menu-item]")?.removeAttribute("data-open")}
  >
    <div className="grid grid-cols-2 gap-px p-1">
      {subItems.map((sub) => (
        <button
          key={sub._id ?? sub.filterValue}
          onClick={() => onSelect(sub.filterValue, sub.label)}
          className="text-left text-sm text-white px-3 py-2 hover:bg-blue-600 rounded transition-colors"
        >
          {sub.label}
        </button>
      ))}
    </div>
  </div>
);

// ─── Single nav button (with optional dropdown) ───────────────────────────────
const NavBtn = ({ item, isActive, onClick, onFilter }) => {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const hasDropdown = item.subItems?.length > 0;

  const openMenu  = () => { clearTimeout(timerRef.current); setOpen(true);  };
  const closeMenu = () => { timerRef.current = setTimeout(() => setOpen(false), 150); };

  const handleSubSelect = (filterValue, label) => {
    setOpen(false);
    onFilter(filterValue, label, item.label);
  };

  const handleClick = () => {
    if (!hasDropdown) onClick(item);
  };

  return (
    <div
      data-menu-item
      className="relative"
      onMouseEnter={hasDropdown ? openMenu : undefined}
      onMouseLeave={hasDropdown ? closeMenu : undefined}
    >
      <button
        onClick={handleClick}
        aria-pressed={isActive}
        aria-haspopup={hasDropdown ? "true" : undefined}
        aria-expanded={hasDropdown ? open : undefined}
        className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
          isActive
            ? "bg-red-700 text-white"
            : "bg-red-500 hover:bg-red-600 text-white"
        }`}
      >
        {item.label}
        {hasDropdown && (
          <span className="ml-1 text-xs opacity-75">▾</span>
        )}
      </button>

      {hasDropdown && open && (
        <DropdownPanel subItems={item.subItems} onSelect={handleSubSelect} />
      )}
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const ResponsiveMenuNavbar = ({ onFilter }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [active,    setActive]    = useState("Home");   // label of active button
  const [isOpen,    setIsOpen]    = useState(false);    // mobile hamburger
  const navigate = useNavigate();

  // ── Fetch navbar items from backend ────────────────────────────────────────
  const fetchMenu = useCallback(async () => {
    try {
      const res = await axiosbase.get("/navbar-menu");
      setMenuItems(res.data?.data ?? []);
    } catch {
      // silently fall back to empty; static GENRES could be fallback if needed
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  // ── Handle simple (no-dropdown) button click ────────────────────────────────
  const handleClick = (item) => {
    setActive(item.label);
    setIsOpen(false);
    if (item.label === "Contact") {
      navigate("/contact");
      return;
    }
    if (item.label === "Home") {
      onFilter("");
      return;
    }
    onFilter(item.label);
  };

  // ── Handle dropdown sub-item select ─────────────────────────────────────────
  // activeLabel  — highlight the parent button
  // filterValue  — what gets sent to LatestMoviesSection
  const handleSubFilter = (filterValue, subLabel, parentLabel) => {
    setActive(parentLabel);
    setIsOpen(false);
    onFilter(filterValue);
  };

  // ── Skeleton row while loading ───────────────────────────────────────────────
  if (loading) {
    return (
      <nav className="bg-gray-900 border-b border-gray-800 px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex gap-2 flex-wrap">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="h-7 w-20 rounded bg-gray-700 animate-pulse"
            />
          ))}
        </div>
      </nav>
    );
  }

  const btnClass = (label) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
      active === label
        ? "bg-red-700 text-white"
        : "bg-red-500 hover:bg-red-600 text-white"
    }`;

  return (
    <nav
      className="bg-gray-900 border-b border-gray-800 text-white px-4 py-3 shadow-md"
      aria-label="Genre filter"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between lg:justify-start">

        {/* Mobile hamburger */}
        <div className="lg:hidden mr-4">
          <button
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-label={isOpen ? "Close genre menu" : "Open genre menu"}
            className="text-white"
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Desktop — horizontal row with hover dropdowns */}
        <div className="hidden lg:flex flex-wrap gap-2 items-start">
          {/* Static: Home — always first */}
          <button
            onClick={() => handleClick({ label: "Home" })}
            aria-pressed={active === "Home"}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
              active === "Home" ? "bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Home
          </button>

          {/* Dynamic items from backend */}
          {menuItems.map((item) => (
            <NavBtn
              key={item._id}
              item={item}
              isActive={active === item.label}
              onClick={handleClick}
              onFilter={handleSubFilter}
            />
          ))}

          {/* Static: Contact — always last */}
          <button
            onClick={() => handleClick({ label: "Contact" })}
            aria-pressed={active === "Contact"}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
              active === "Contact" ? "bg-red-700 text-white" : "bg-red-500 hover:bg-red-600 text-white"
            }`}
          >
            Contact
          </button>
        </div>
      </div>

      {/* Mobile dropdown — flat list (no nested hover on mobile) */}
      {isOpen && (
        <div className="lg:hidden mt-3 pb-1 space-y-2">
          {/* Static: Home — always first */}
          <div>
            <button
              className={btnClass("Home")}
              onClick={() => handleClick({ label: "Home" })}
              aria-pressed={active === "Home"}
            >
              Home
            </button>
          </div>

          {/* Dynamic items from backend */}
          {menuItems.map((item) => (
            <div key={item._id}>
              <button
                className={btnClass(item.label)}
                onClick={() => handleClick(item)}
                aria-pressed={active === item.label}
              >
                {item.label}
              </button>

              {/* Sub-items indented */}
              {item.subItems?.length > 0 && (
                <div className="ml-4 mt-1 flex flex-wrap gap-1.5">
                  {item.subItems.map((sub) => (
                    <button
                      key={sub._id ?? sub.filterValue}
                      onClick={() => handleSubFilter(sub.filterValue, sub.label, item.label)}
                      className="px-2.5 py-0.5 rounded text-xs font-medium bg-blue-700 hover:bg-blue-600 text-white transition-colors"
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Static: Contact — always last */}
          <div>
            <button
              className={btnClass("Contact")}
              onClick={() => handleClick({ label: "Contact" })}
              aria-pressed={active === "Contact"}
            >
              Contact
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default ResponsiveMenuNavbar;
