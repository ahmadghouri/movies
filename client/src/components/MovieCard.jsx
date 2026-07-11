import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { buildMovieUrl } from "../lib/movieUrl";

const MovieCard = ({ title, image, id, slug, views, year, language, isLatestMovie }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const movieUrl = buildMovieUrl({ _id: id, slug, title, language });

  // Build the SEO-style title shown on card
  const displayTitle = [
    title,
    year ? `(${year})` : "",
    language ?? "",
    "Full Movie Watch Online",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article
      onClick={() => navigate(movieUrl)}
      className="cursor-pointer group rounded-lg overflow-hidden
                 bg-[#1a6b78] hover:bg-[#1d7a89]
                 border border-[#1d7a89] hover:border-[#24909f]
                 transition-all duration-200
                 focus-within:ring-2 focus-within:ring-cyan-400
                 shadow-md hover:shadow-lg hover:shadow-cyan-900/30"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(movieUrl)}
      aria-label={`Watch ${title}`}
    >
      {/* ── Title bar ── */}
      <div className="px-3 pt-3 pb-2">
        <h2 className="text-white text-sm font-bold leading-snug line-clamp-2 min-h-[2.5rem]">
          {displayTitle}
        </h2>
      </div>

      {/* ── Poster image ── */}
      <div className="mx-2 overflow-hidden rounded relative">
        {isLatestMovie && (
          <span className="absolute top-1.5 left-1.5 z-10 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide shadow">
            Latest
          </span>
        )}
        {imgError ? (
          <div className="aspect-[3/4] w-full bg-[#145560] flex items-center justify-center">
            <span className="text-cyan-200 text-xs text-center px-2">{title}</span>
          </div>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full aspect-[3/4] object-cover
                       group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {/* ── Views bar ── */}
      <div className="px-3 py-2.5">
        <p className="text-white text-sm">
          Views :{" "}
          <span className="font-medium">
            {typeof views === "number" ? views.toLocaleString() : "—"}
          </span>
        </p>
      </div>
    </article>
  );
};

export default MovieCard;
