import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, Film, LogOut, LayoutDashboard, MessageSquare, List } from "lucide-react";
import axiosbase from "../../../axiosbasa";
import { Button } from "../ui/button";
import { showSuccess } from "../../lib/toast";

const NavbarDB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axiosbase.post("/signout");
    } catch {
      // cookie cleared client-side regardless
    }
    showSuccess("Signed out successfully.");
    navigate("/signin");
  };

  const navLinks = [
    { to: "/admin-db/dashboard",     label: "Add Movie",      LucideIcon: LayoutDashboard },
    { to: "/admin-db/movies",        label: "All Movies",     LucideIcon: List },
    { to: "/admin-db/admin-contect", label: "Messages",       LucideIcon: MessageSquare },
    { to: "/",                       label: "View Site",      LucideIcon: Film },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-lg" role="navigation" aria-label="Admin navigation">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link
          to="/admin-db/dashboard"
          className="flex items-center gap-2 text-xl font-bold text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          aria-label="MovieMania Admin"
        >
          <Film className="w-6 h-6" aria-hidden="true" />
          <span>MovieMania</span>
          <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded font-normal ml-1">Admin</span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, LucideIcon }) => {
            const Icon = LucideIcon;
            return (
              <Button key={to} variant="ghost" size="sm" asChild>
                <Link to={to} className="flex items-center gap-1.5">
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            );
          })}
          <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2">
            <LogOut className="w-4 h-4 mr-1.5" aria-hidden="true" />
            Logout
          </Button>
        </div>

        {/* Mobile hamburger */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen((v) => !v)}
            aria-expanded={isOpen}
            aria-controls="mobile-menu"
            aria-label={isOpen ? "Close menu" : "Open menu"}
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {isOpen && (
        <div id="mobile-menu" className="md:hidden bg-gray-800 border-t border-gray-700 px-4 pb-4 pt-3 space-y-2">
          {navLinks.map(({ to, label, LucideIcon }) => {
            const MIcon = LucideIcon;
            return (
              <Button key={to} variant="ghost" className="w-full justify-start" asChild>
                <Link to={to} onClick={() => setIsOpen(false)}>
                  <MIcon className="w-4 h-4 mr-2" aria-hidden="true" />
                  {label}
                </Link>
              </Button>
            );
          })}
          <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" aria-hidden="true" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};

export default NavbarDB;
