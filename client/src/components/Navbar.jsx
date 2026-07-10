import React, { useState } from "react";
import { Search, Film } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Navbar = ({ setSearchh }) => {
  const [search, setSearch] = useState("");
  const { siteName } = useSiteSettings();

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchh(search);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      setSearchh(search);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 shadow-md">
      <nav
        className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3"
        aria-label="Main navigation"
      >
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center gap-2 text-white font-bold text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
          aria-label={`${siteName} — Home`}
        >
          <Film className="w-7 h-7 text-red-500" aria-hidden="true" />
          <span>{siteName}</span>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex items-center gap-2 w-full sm:w-auto"
          role="search"
          aria-label="Search movies"
        >
          <div className="relative flex-1 sm:flex-none">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search movies…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                if (!e.target.value) setSearchh("");
              }}
              onKeyDown={handleKeyDown}
              className="pl-9 w-full sm:w-64"
              aria-label="Search movies"
            />
          </div>
          <Button type="submit" size="sm" aria-label="Submit search">
            Search
          </Button>
        </form>

        {/* Admin link removed */}
      </nav>
    </header>
  );
};

export default Navbar;
