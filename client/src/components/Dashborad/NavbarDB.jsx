import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/admin-db/dashboard"
          className="text-xl font-bold text-red-500"
        >
          MyMovies
        </Link>

        <div className="hidden md:flex space-x-6">
          <Link to="/all-movies" className="hover:text-red-400">
            All Movies
          </Link>
          <Link to="/admin-db/dashboard" className="hover:text-red-400">
            Add Movie
          </Link>
          <Link to="/admin-db/admin-contect" className="hover:text-red-400">
            Contact
          </Link>
          <button onClick={handleLogout} className="hover:text-red-400">
            Logout
          </button>
        </div>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-gray-800 px-4 pb-4 space-y-2">
          <Link to="/all-movies" className="block hover:text-red-400">
            All Movies
          </Link>
          <Link to="/admin-db/dashboard" className="block hover:text-red-400">
            Add Movie
          </Link>
          <Link
            to="/admin-db/admin-contect"
            className="block hover:text-red-400"
          >
            Contact
          </Link>
          <button onClick={handleLogout} className="block hover:text-red-400">
            Logout
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
