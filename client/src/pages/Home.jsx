import React, { useEffect, useState } from "react";
import axiosbase from "../../axiosbasa";
import Navbar from "../components/Navbar";
import Btnnavbar from "../components/Btnnavbar";
import FeaturedScroller from "../components/FeaturedScroller";
import LatestMoviesSection from "../components/LatestMoviesSection";
import Footer from "../components/Footer";
import useSEO from "../lib/useSEO";
import { useSiteSettings } from "../context/SiteSettingsContext";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const { siteName } = useSiteSettings();

  useSEO({
    title: "Watch & Download Latest Movies Online in HD",
    description: `Browse and watch the latest Pakistani, Bollywood and Hollywood movies online for free in HD quality on ${siteName}.`,
    url: window.location.origin + "/",
    siteName,
    type: "website",
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: window.location.origin,
      description: `Watch and download movies online in HD on ${siteName}.`,
      potentialAction: {
        "@type": "SearchAction",
        target: `${window.location.origin}/?search={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  });

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const res = await axiosbase.get("movie/getmovie?limit=500");
        if (!cancelled) {
          const data = Array.isArray(res.data)
            ? res.data
            : res.data?.data ?? [];
          setMovies(data);
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar setSearchh={setSearch} />
      <FeaturedScroller />
      <Btnnavbar onFilter={setFilter} />
      <LatestMoviesSection
        filer={filter}
        search={search}
        resData={movies}
        loading={loading}
      />
      <Footer />
    </div>
  );
}

export default Home;
