import React from "react";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Footer = () => {
  const year = new Date().getFullYear();
  const { siteName } = useSiteSettings();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <p>
          &copy; {year}{" "}
          <span className="text-white font-medium">{siteName}</span>. All
          rights reserved.
        </p>
        <p className="text-gray-600">
          Disclaimer: This site does not store any files on its server. All
          contents are provided by non-affiliated third parties.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
