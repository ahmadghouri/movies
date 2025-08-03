import React, { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { useParams } from "react-router-dom";
import axiosbase from "../../axiosbasa";

const MovieDetailPage = () => {
  const { id } = useParams();

  const [getMovie, setGetMovie] = useState(null);
  console.log(getMovie);
  // console.log(getMovie.title);

  useEffect(() => {
    const getMovies = async () => {
      try {
        const res = await axiosbase.get(`movie/getmovie/${id}`);
        setGetMovie(res.data); // ✅ use only the data part
      } catch (error) {
        console.log(error);
      }
    };
    getMovies();
  }, [id]);

  // Wait for getMovie to load
  if (!getMovie) {
    return <div className="text-white text-center py-10">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="bg-black py-4 px-4">
        <div className="container mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            {getMovie.title} ({getMovie.year}) {getMovie.language} Full Movie
            Watch Online HD
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 space-y-6">
            {getMovie.players.map((src, idx) => (
              <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
                <h2 className="bg-gray-700 px-4 py-2 font-semibold">
                  Watch {getMovie.title} ({getMovie.year}) {getMovie.language} -
                  Player {idx + 1}
                </h2>
                <div className="p-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <iframe
                      src={src}
                      allowFullScreen
                      className="w-full h-full rounded-lg border-none"
                      title={`Player ${idx + 1}`}
                    ></iframe>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Download Links</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {getMovie.downloadLinks.map((link, idx) => (
                  <a
                    key={idx}
                    target="_blank"
                    href={link.url}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-center block transition-colors"
                  >
                    Download {link.quality} from {link.provider}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg p-4">
              <img
                src={getMovie.poster}
                alt={getMovie.title}
                className="w-full rounded-lg mb-4"
              />
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Views:</span>
                  <span>{getMovie.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span>{getMovie.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span>{getMovie.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Rating:</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {getMovie.rating}/10
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Release:</span>
                  <span>
                    {new Date(getMovie.releaseDate).toLocaleDateString(
                      "en-US",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Genres:</p>
                <div className="flex flex-wrap gap-1">
                  {getMovie.genre.map((genre, index) => (
                    <span
                      key={index}
                      className="bg-red-600 px-2 py-1 rounded text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-gray-400 text-sm mb-2">Tags:</p>
                <span className="bg-gray-700 px-2 py-1 rounded text-xs">
                  Featured
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
