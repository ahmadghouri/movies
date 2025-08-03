import React, { useState, useEffect } from "react";
import MovieCard from "./MovieCard";

const LatestMoviesSection = ({ filer, search, resData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const moviesPerPage = 15;

  // ✅ Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filer, search]);

  // ✅ Apply filters first
  let filteredMovies = resData;

  if (filer && filer !== "Home") {
    filteredMovies = filteredMovies.filter((movie) =>
      Array.isArray(movie.genre)
        ? movie.genre.some((g) => g.toLowerCase().includes(filer.toLowerCase()))
        : typeof movie.genre === "string"
        ? movie.genre.toLowerCase().includes(filer.toLowerCase())
        : false
    );
  }

  if (search) {
    filteredMovies = filteredMovies.filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    );
  }

  // ✅ Pagination logic
  const indexOfLast = currentPage * moviesPerPage;
  const indexOfFirst = indexOfLast - moviesPerPage;
  const currentMovies = filteredMovies.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredMovies.length / moviesPerPage);

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <section className="bg-black min-h-[100vh] text-white py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">LATEST MOVIES</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {currentMovies.map((movie, index) => (
          <MovieCard
            key={movie._id}
            title={movie.title}
            image={movie.poster}
            id={movie._id}
          />
        ))}
      </div>

      {/* ✅ Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={goToPrevPage}
            className="bg-red-500 px-4 py-2 rounded disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-white font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={goToNextPage}
            className="bg-red-500 px-4 py-2 rounded disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </section>
  );
};

export default LatestMoviesSection;

// import React from "react";
// import MovieCard from "./MovieCard";

// const LatestMoviesSection = ({ filer, search, resData }) => {
//   let movies = resData;

//   let filterMovie =
//     filer === "Home" || filer === ""
//       ? movies
//       : movies.filter((movie) => movie.genre.includes(filer));

//   if (search) {
//     filer === "Home" || filer === ""
//       ? movies
//       : (filterMovie = filterMovie.filter((movie) =>
//           movie.title.toLowerCase().includes(search.toLowerCase())
//         ));
//   }

//   return (
//     <section className="bg-black min-h-[100vh] text-white py-10 px-4">
//       <h2 className="text-2xl font-bold mb-6">LATEST MOVIES</h2>

//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {filterMovie.map((movie, index) => (
//           <MovieCard
//             key={index}
//             title={movie.title}
//             image={movie.poster}
//             id={movie._id}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default LatestMoviesSection;
