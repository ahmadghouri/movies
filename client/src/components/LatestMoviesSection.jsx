import React, { useState, useEffect } from "react";
import MovieCard from "./MovieCard";
import { Skeleton } from "./ui/skeleton";
import { Film } from "lucide-react";
import PaginationBar from "./ui/PaginationBar";

const MOVIES_PER_PAGE = 15;

const MovieSkeleton = () => (
  <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
    <Skeleton className="aspect-[2/3] w-full" />
    <div className="p-2 space-y-1">
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-3 w-3/5" />
    </div>
  </div>
);

const LatestMoviesSection = ({ filer, search, resData, loading }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filer, search]);

  let filtered = resData || [];

  if (filer && filer !== "Home") {
    filtered = filtered.filter((movie) =>
      Array.isArray(movie.genre)
        ? movie.genre.some((g) => g.toLowerCase().includes(filer.toLowerCase()))
        : typeof movie.genre === "string"
        ? movie.genre.toLowerCase().includes(filer.toLowerCase())
        : false
    );
  }

  if (search) {
    filtered = filtered.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  const totalPages = Math.ceil(filtered.length / MOVIES_PER_PAGE);
  const paginated  = filtered.slice(
    (currentPage - 1) * MOVIES_PER_PAGE,
    currentPage * MOVIES_PER_PAGE
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Scroll to top of section smoothly
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
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Film className="w-16 h-16 text-gray-700 mb-4" aria-hidden="true" />
            <p className="text-gray-400 text-lg font-medium">No movies found</p>
            {(search || (filer && filer !== "Home")) && (
              <p className="text-gray-500 text-sm mt-1">
                Try a different search term or genre.
              </p>
            )}
          </div>

        ) : (
          <>
            {/* ── Movie grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {paginated.map((movie) => (
                <MovieCard
                  key={movie._id}
                  title={movie.title}
                  image={movie.poster}
                  id={movie._id}
                />
              ))}
            </div>

            {/* ── Shadcn Pagination ── */}
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
