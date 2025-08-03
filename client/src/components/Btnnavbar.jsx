import React, { useState } from "react";
import { Menu, X } from "lucide-react"; // Use any icon library or your own SVG
import { useNavigate } from "react-router-dom";
const navItems = [
  "Home",
  "Hindi",
  "Comedy",
  "Horror",
  "Thriller",
  "Romance",
  "Dubbed",
  "Cartoon",
  "Punjabi",
  "Animation",
  "Marathi",
  "Netflix",
  "Contact",
];

const ResponsiveMenuNavbar = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  let navtigate = useNavigate();

  function hanleclick(item) {
    console.log(item);
    onFilter(item);
    setIsOpen(false);
    if (item === "Contact") {
      console.log("click");
      navtigate("/contact");
    }
  }

  return (
    <nav className="bg-gray-900 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between lg:justify-start">
        {/* 🔹 Menu icon - now on left side */}
        <div className="lg:hidden mr-4">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white text-2xl"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* 🔹 Buttons - visible on medium and larger screens */}
        <div className="hidden lg:flex flex-wrap space-x-3">
          {navItems.map((item, index) => (
            <button
              key={index}
              className="px-3 py-1 rounded bg-red-500 hover:bg-red-600 text-sm transition duration-200"
              onClick={() => hanleclick(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* 🔹 Mobile dropdown menu */}
      {isOpen && (
        <div className="lg:hidden mt-3 flex flex-col space-y-2">
          {navItems.map((item, index) => (
            <button
              key={index}
              className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 w-[120px] text-left transition duration-200"
              onClick={() => hanleclick(item)}
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
