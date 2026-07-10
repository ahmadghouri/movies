import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosbase from "../../axiosbasa";

// These are always shown — not from DB
const FIXED_START = ["Home"];
const FIXED_END = ["Contact"];

const ResponsiveMenuNavbar = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [genres, setGenres] = useState([]);       // from backend
  const [active, setActive] = useState("Home");
  const navigate = useNavigate();

  // Fetch genres from backend once on mount
  useEffect(() => {
    axiosbase
      .get("movie/genres")
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : res.data?.data ?? [];
        setGenres(data);
      })
      .catch(() => {
        // If fetch fails, genres just stay empty — fixed buttons still work
      });
  }, []);

  // Full button list: Home → [db genres] → Contact
  const allItems = [...FIXED_START, ...genres, ...FIXED_END];

  const handleClick = (item) => {
    setActive(item);
    setIsOpen(false);

    if (item === "Contact") {
      navigate("/contact");
      return;
    }
    onFilter(item);
  };

  const btnClass = (item) =>
    `px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${
      active === item
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

        {/* Desktop — horizontal row */}
        <div className="hidden lg:flex flex-wrap gap-2">
          {allItems.map((item) => (
            <button
              key={item}
              className={btnClass(item)}
              onClick={() => handleClick(item)}
              aria-pressed={active === item}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div className="lg:hidden mt-3 flex flex-wrap gap-2 pb-1">
          {allItems.map((item) => (
            <button
              key={item}
              className={btnClass(item)}
              onClick={() => handleClick(item)}
              aria-pressed={active === item}
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
};

export default ResponsiveMenuNavbar;
