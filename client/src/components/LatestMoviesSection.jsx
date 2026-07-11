import React, { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { Skeleton } from "./ui/skeleton";
import { Film } from "lucide-react";
import PaginationBar from "./ui/PaginationBar";

const MOVIES_PER_PAGE = 15;

const MovieSkeleton = () => (
  <div className="rounded-lg overflow-hidden bg-[#1a6b78] border border-[#1d7a89]">
    <div className="px-3 pt-3 pb-2 space-y-1.5">
      <Skeleton className="h-3 w-full bg-[#145560]" />
      <Skeleton className="h-3 w-4/5 bg-[#145560]" />
    </div>
    <div className="mx-2">
      <Skeleton className="aspect-[3/4] w-full rounded bg-[#145560]" />
    </div>
    <div className="px-3 py-2.5">
      <Skeleton className="h-3 w-2/5 bg-[#145560]" />
    </div>
  </div>
);

/**
 * Smart filter — checks genre, year, language, and title
 * so navbar filterValues like "2026", "Hindi", "Action" all work.
 */
const matchesFilter = (movie, filterValue) => {
  if (!filterValue || filterValue === "Home") return true;
  const val = filterValue.toLowerCase().trim();

  // genre match
  if (Array.isArray(movie.genre)) {
    if (movie.genre.some((g) => g.toLowerCase().includes(val))) return true;
  } else if (typeof movie.genre === "string") {
    if (movie.genre.toLowerCase().includes(val)) return true;
  }

  // year match  e.g. filterValue = "2026"
  if (movie.year && movie.year.toString().toLowerCase().includes(val)) return true;

  // language match  e.g. filterValue = "Hindi"
  if (movie.language && movie.language.toLowerCase().includes(val)) return true;

  return false;
};

const LatestMoviesSection = ({ filer, search, resData, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filer, search]);

  let filtered = resData || [];

  // Apply smart filter
  if (filer && filer !== "Home") {
    filtered = filtered.filter((movie) => matchesFilter(movie, filer));
  }

  // Apply search
  if (search) {
    filtered = filtered.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // Sort: isLatestMovie by latestOrder asc (1 pehle, 2 doosra...), phir baaki by _id desc
  filtered = [...filtered].sort((a, b) => {
    const aLatest = a.isLatestMovie ? (a.latestOrder ?? 999999) : null;
    const bLatest = b.isLatestMovie ? (b.latestOrder ?? 999999) : null;

    if (aLatest !== null && bLatest !== null) return aLatest - bLatest; // both latest: by order
    if (aLatest !== null) return -1;   // a is latest, b is not → a first
    if (bLatest !== null) return 1;    // b is latest, a is not → b first
    return 0;                          // neither latest: keep original order
  });

  const totalPages = Math.ceil(filtered.length / MOVIES_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-black min-h-screen text-white py-10 px-4" aria-label="Movie listings">
      <div className="max-w-7xl mx-auto">

        {/* ── Section heading ── */}
        <div className="flex items-center gap-3 mb-6">
          <h2 className="text-2xl font-bold uppercase tracking-wide">
            {filer && filer !== "Home" ? filer : "Latest Movies"}
          </h2>
          {!loading && (
            <span className="text-sm text-gray-400">
              ({filtered.length} {filtered.length === 1 ? "movie" : "movies"})
            </span>
          )}
        </div>

        {/* ── Loading skeletons ── */}
        {loading ? (
          <div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
            aria-busy="true"
            aria-label="Loading movies"
          >
            {Array.from({ length: MOVIES_PER_PAGE }).map((_, i) => (
              <MovieSkeleton key={i} />
            ))}
          </div>

        ) : paginated.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film className="w-16 h-16 text-gray-700 mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg font-medium">No movies found</p>
            {(search || (filer && filer !== "Home")) && (
              <p className="text-gray-500 text-sm mt-1">
                Try a different search term or filter.
              </p>
            )}
          </div>

        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginated.map((movie) => (
                <MovieCard
                  key={movie._id}
                  title={movie.title}
                  image={movie.poster}
                  id={movie._id}
                  slug={movie.slug}
                  views={movie.views}
                  year={movie.year}
                  language={movie.language}
                  isLatestMovie={!!movie.isLatestMovie}
                />
              ))}
            </div>

            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              className="mt-10"
            />
          </>
        )}
      </div>
    </section>
  );
};

export default LatestMoviesSection;
