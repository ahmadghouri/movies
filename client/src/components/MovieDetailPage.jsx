import React, { useEffect, useState } from "react";
import { Star, Calendar, Clock, Globe, Eye, ArrowLeft, Download } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosbase from "../../axiosbasa";
import Navbar from "./Navbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

const DetailSkeleton = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <Skeleton className="h-10 w-full max-w-7xl mx-auto rounded-lg" />
    </div>
    <div className="bg-black py-4 px-4">
      <Skeleton className="h-8 w-3/4 mx-auto" />
    </div>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="aspect-[2/3] w-full rounded-lg" />
        </div>
      </div>
    </div>
  </div>
);

const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [views, setViews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search from detail page → go home with search term
  const handleSearch = (term) => {
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchMovie = async () => {
      setLoading(true);
      try {
        const res = await axiosbase.get(`movie/getmovie/${id}`);
        if (!cancelled) {
          const data = res.data?.data ?? res.data;
          setMovie(data);
          setViews(data.views ?? 0);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMovie();
    return () => { cancelled = true; };
  }, [id]);

  // Fire-and-forget: increment view once per page load
  useEffect(() => {
    if (!id) return;
    axiosbase
      .patch(`movie/view/${id}`)
      .then(() => setViews((v) => (v !== null ? v + 1 : v)))
      .catch(() => {}); // silently ignore — view count is non-critical
  }, [id]);

  if (loading) return <DetailSkeleton />;

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar setSearchh={handleSearch} />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-gray-400 text-lg">{error || "Movie not found."}</p>
          <Button variant="outline" asChild>
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* ── Navbar ── */}
      <Navbar setSearchh={handleSearch} />

      {/* Title bar */}
      <div className="bg-black py-4 px-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" asChild className="mb-3 text-gray-400 hover:text-white">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
              Back
            </Link>
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
            {movie.title}{movie.year && ` (${movie.year})`}
            {movie.language && ` — ${movie.language}`} Full Movie Watch Online HD
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Players + Download */}
          <main className="lg:col-span-3 space-y-6">
            {movie.players?.length > 0 ? (
              movie.players.map((src, idx) => (
                <Card key={idx} className="border-gray-700 overflow-hidden">
                  <CardHeader className="py-3 px-4 bg-gray-700/50">
                    <CardTitle className="text-base font-semibold">
                      Watch {movie.title} — Player {idx + 1}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={src}
                        allowFullScreen
                        className="w-full h-full border-none"
                        title={`${movie.title} — Player ${idx + 1}`}
                        sandbox="allow-scripts allow-same-origin allow-presentation"
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-gray-700">
                <CardContent className="py-12 text-center text-gray-400">
                  No video players available for this movie.
                </CardContent>
              </Card>
            )}

            {/* Download links */}
            {movie.downloadLinks?.length > 0 && (
              <Card className="border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-green-400" aria-hidden="true" />
                    Download Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {movie.downloadLinks.map((link, idx) => (
                      <Button
                        key={idx}
                        variant="success"
                        asChild
                        className="w-full"
                      >
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`Download ${link.quality} from ${link.provider}`}
                        >
                          <Download className="w-4 h-4 mr-2" aria-hidden="true" />
                          {link.quality} — {link.provider}
                        </a>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </main>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <Card className="border-gray-700 sticky top-4">
              <CardContent className="p-4 space-y-4">
                <img
                  src={movie.poster}
                  alt={`${movie.title} poster`}
                  className="w-full rounded-lg"
                  loading="lazy"
                />

                <Separator />

                <dl className="space-y-2.5 text-sm">
                  {views != null && (
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-400">
                        <Eye className="w-4 h-4" aria-hidden="true" /> Views
                      </dt>
                      <dd className="font-medium">{views.toLocaleString()}</dd>
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-400">
                        <Clock className="w-4 h-4" aria-hidden="true" /> Duration
                      </dt>
                      <dd className="font-medium">{movie.duration}</dd>
                    </div>
                  )}
                  {movie.language && (
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-400">
                        <Globe className="w-4 h-4" aria-hidden="true" /> Language
                      </dt>
                      <dd className="font-medium">{movie.language}</dd>
                    </div>
                  )}
                  {movie.rating != null && (
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-400">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" aria-hidden="true" /> Rating
                      </dt>
                      <dd className="font-medium">{movie.rating}/10</dd>
                    </div>
                  )}
                  {movie.releaseDate && (
                    <div className="flex justify-between">
                      <dt className="flex items-center gap-1.5 text-gray-400">
                        <Calendar className="w-4 h-4" aria-hidden="true" /> Release
                      </dt>
                      <dd className="font-medium">
                        {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </dd>
                    </div>
                  )}
                </dl>

                {movie.genre?.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-gray-400 text-sm mb-2">Genres</p>
                      <div className="flex flex-wrap gap-1.5">
                        {movie.genre.map((g, i) => (
                          <Badge key={i} variant="default">{g}</Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
