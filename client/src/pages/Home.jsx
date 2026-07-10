import React, { useEffect, useState } from "react";
import axiosbase from "../../axiosbasa";
import Navbar from "../components/Navbar";
import Btnnavbar from "../components/Btnnavbar";
import FeaturedScroller from "../components/FeaturedScroller";
import LatestMoviesSection from "../components/LatestMoviesSection";

function Home() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");

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
    <div>
      <Navbar setSearchh={setSearch} />
      {/* Horizontal poster scroller — shows all movies */}
      <FeaturedScroller />
      <Btnnavbar onFilter={setFilter} />
      <LatestMoviesSection
        filer={filter}
        search={search}
        resData={movies}
        loading={loading}
      />
    </div>
  );
}

export default Home;
