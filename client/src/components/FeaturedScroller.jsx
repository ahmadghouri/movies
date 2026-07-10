import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, TrendingUp, Film } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import axiosbase from "../../axiosbasa";

/* ─── Single poster card ──────────────────────────────────── */
const PosterCard = ({ movie }) => {
  const navigate = useNavigate();
  const [imgErr, setImgErr] = useState(false);

  return (
    <button
      onClick={() => navigate(`/moviedetail/${movie._id}`)}
      className="relative flex-shrink-0 w-[130px] sm:w-[150px] md:w-[170px] group
                 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-lg"
      aria-label={`Watch ${movie.title}`}
    >
      <div className="relative overflow-hidden rounded-lg aspect-[2/3] bg-gray-800
                      border border-gray-700 group-hover:border-red-500 transition-colors duration-200">
        {imgErr ? (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs px-2 text-center">
            {movie.title}
          </div>
        ) : (
          <img
            src={movie.poster}
            alt={movie.title}
            loading="lazy"
            onError={() => setImgErr(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent
                        opacity-0 group-hover:opacity-100 transition-opacity duration-200
                        flex items-end p-2">
          <span className="text-white text-xs font-semibold line-clamp-2 leading-tight text-left">
            {movie.title}
          </span>
        </div>
      </div>
    </button>
  );
};

/* ─── Skeleton card ───────────────────────────────────────── */
const PosterSkeleton = () => (
  <div className="flex-shrink-0 w-[130px] sm:w-[150px] md:w-[170px]">
    <Skeleton className="aspect-[2/3] w-full rounded-lg" />
  </div>
);

/* ─── Horizontal scroll row ───────────────────────────────── */
const ScrollRow = ({ movies, loading, count = 12 }) => {
  const scrollRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const SCROLL_AMOUNT = 600;

  const scroll = (dir) => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowLeft(el.scrollLeft > 10);
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  };

  return (
    <div className="relative group/row">
      {/* Left arrow */}
      {showLeft && (
        <button
          onClick={() => scroll("left")}
          aria-label="Scroll left"
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center
                     bg-gradient-to-r from-gray-950 to-transparent text-white
                     opacity-0 group-hover/row:opacity-100 transition-opacity duration-200
                     focus:outline-none focus-visible:opacity-100"
        >
          <ChevronLeft className="w-7 h-7" />
        </button>
      )}
      {/* Right arrow */}
      {showRight && (
        <button
          onClick={() => scroll("right")}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-center
                     bg-gradient-to-l from-gray-950 to-transparent text-white
                     opacity-0 group-hover/row:opacity-100 transition-opacity duration-200
                     focus:outline-none focus-visible:opacity-100"
        >
          <ChevronRight className="w-7 h-7" />
        </button>
      )}

      {/* Track */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        className="flex gap-3 overflow-x-auto scroll-smooth px-4 sm:px-6 pb-2
                   [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {loading
          ? Array.from({ length: count }).map((_, i) => <PosterSkeleton key={i} />)
          : movies.map((movie) => <PosterCard key={movie._id} movie={movie} />)}
      </div>
    </div>
  );
};

/* ─── Section header ──────────────────────────────────────── */
const SectionHeader = ({ icon: Icon, title, color = "text-red-500" }) => (
  <div className="px-4 sm:px-6 mb-3 flex items-center gap-2">
    <Icon className={`w-4 h-4 ${color}`} aria-hidden="true" />
    <h2 className="text-white text-sm font-bold uppercase tracking-widest">{title}</h2>
  </div>
);

/* ─── Main component ──────────────────────────────────────── */
const FeaturedScroller = ({ movies, loading }) => {
  const [topMovies, setTopMovies] = useState([]);
  const [topLoading, setTopLoading] = useState(true);

  useEffect(() => {
    axiosbase
      .get("movie/top?limit=15")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setTopMovies(data);
      })
      .catch(() => {})
      .finally(() => setTopLoading(false));
  }, []);

  const showTop = topLoading || topMovies.length > 0;
  const showAll = loading || (movies && movies.length > 0);

  if (!showTop && !showAll) return null;

  return (
    <div className="bg-gray-950 border-b border-gray-800 py-5 space-y-5">

      {/* ── Top Movies row ─── */}
      {showTop && (
        <div>
          <SectionHeader icon={TrendingUp} title="Top Movies" color="text-yellow-400" />
          <ScrollRow movies={topMovies} loading={topLoading} count={10} />
        </div>
      )}

      {/* ── All Movies row ─── */}
      {showAll && (
        <div>
          <SectionHeader icon={Film} title="All Movies" color="text-red-500" />
          <ScrollRow movies={movies || []} loading={loading} count={12} />
        </div>
      )}

    </div>
  );
};

export default FeaturedScroller;
