import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "../lib/utils";

const MovieCard = ({ title, image, id }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  return (
    <article
      className={cn(
        "bg-gray-800 rounded-lg overflow-hidden border border-gray-700",
        "hover:border-red-500 hover:shadow-lg hover:shadow-red-900/20",
        "transition-all duration-200 cursor-pointer group focus-within:ring-2 focus-within:ring-red-500"
      )}
    >
      <button
        className="w-full text-left focus:outline-none"
        onClick={() => navigate(`/moviedetail/${id}`)}
        aria-label={`View details for ${title}`}
      >
        <div className="relative overflow-hidden aspect-[2/3]">
          {imgError ? (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center" aria-hidden="true">
              <span className="text-gray-500 text-xs">No image</span>
            </div>
          ) : (
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          )}
        </div>
        <div className="p-2">
          <h2
            className="text-white text-sm font-semibold leading-tight line-clamp-2"
            title={title}
          >
            {title}
          </h2>
        </div>
      </button>
    </article>
  );
};

export default MovieCard;
