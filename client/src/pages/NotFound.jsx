import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Film, Home, ArrowLeft, Search } from "lucide-react";
import useSEO from "../lib/useSEO";

const NotFound = () => {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(10);

  useSEO({
    title: "404 — Page Not Found",
    description: "The page you are looking for does not exist.",
    noIndex: true,
  });

  // Auto-redirect to home after 10 seconds
  useEffect(() => {
    if (countdown <= 0) {
      navigate("/", { replace: true });
      return;
    }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center px-4 text-center">

      {/* Film reel icon */}
      <div className="relative mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center">
          <Film className="w-16 h-16 text-gray-600" aria-hidden="true" />
        </div>
        {/* 404 badge */}
        <div className="absolute -top-2 -right-2 bg-red-600 text-white font-extrabold text-sm px-2.5 py-1 rounded-full shadow-lg">
          404
        </div>
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-3">
        404
      </h1>
      <h2 className="text-xl md:text-2xl font-bold text-gray-300 mb-3">
        Page Not Found
      </h2>
      <p className="text-gray-500 text-sm md:text-base max-w-md mb-8 leading-relaxed">
        Oops! The page you're looking for doesn't exist or has been removed.
        Maybe the URL is wrong, or the movie has left the building.
      </p>

      {/* Auto-redirect countdown */}
      <div className="mb-8 bg-gray-800 border border-gray-700 rounded-xl px-5 py-3 text-sm text-gray-400">
        Redirecting to home in{" "}
        <span className="text-white font-bold text-base">{countdown}</span>
        {" "}seconds…
        {/* countdown ring */}
        <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-1 bg-red-500 rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${(countdown / 10) * 100}%` }}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors w-full sm:w-auto justify-center"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Go to Home
        </Link>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors w-full sm:w-auto justify-center"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          Go Back
        </button>
        <Link
          to="/?search="
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors w-full sm:w-auto justify-center"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Search Movies
        </Link>
      </div>

      {/* Popular links */}
      <div className="mt-10 text-sm text-gray-500">
        <p className="mb-3 font-medium text-gray-400">Popular pages</p>
        <div className="flex flex-wrap justify-center gap-3">
          {[
            { to: "/",        label: "Home" },
            { to: "/contact", label: "Contact" },
          ].map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="text-blue-400 hover:text-blue-300 hover:underline transition"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotFound;
