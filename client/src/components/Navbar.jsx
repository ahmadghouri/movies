import React, { useState } from "react";
import Btnnavbar from "./Btnnavbar";
// import logo from "../assets/logo.png";

const Navbar = ({ setSearchh }) => {
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    console.log("Search:", search);
    setSearchh(search); // yahan API call ya filter logic laga sakti ho
  };

  return (
    <nav className="bg-gray-900 px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <img src="" alt="Logo" className="h-10 w-10 object-contain" />
          <h1 className="text-white text-xl font-bold">MovieMania</h1>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search movies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 px-3 py-1 rounded bg-gray-800 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            onClick={handleSearch}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-white transition duration-200"
          >
            Search
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
