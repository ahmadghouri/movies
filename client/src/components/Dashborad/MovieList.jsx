import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axiosbase from "../../../axiosbasa";
import { Pencil, Trash2, Film, Search, AlertTriangle } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import PaginationBar from "../ui/PaginationBar";
import { showSuccess } from "../../lib/toast";

const ITEMS_PER_PAGE = 10;

/* ── Confirm delete dialog ─────────────────────────────── */
const DeleteDialog = ({ movie, onConfirm, onCancel, loading }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
    role="dialog"
    aria-modal="true"
    aria-labelledby="delete-dialog-title"
  >
    <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-2xl w-full max-w-sm p-6 space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-red-600/20 rounded-full flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h2 id="delete-dialog-title" className="text-white font-semibold text-base">
            Delete Movie?
          </h2>
          <p className="text-gray-400 text-sm mt-0.5">This action cannot be undone.</p>
        </div>
      </div>

      <p className="text-gray-300 text-sm bg-gray-700/50 rounded-lg px-3 py-2">
        <span className="font-semibold text-white">&ldquo;{movie.title}&rdquo;</span> will be
        permanently removed along with its poster image.
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="destructive"
          className="flex-1"
          onClick={onConfirm}
          disabled={loading}
          aria-busy={loading}
        >
          {loading ? "Deleting…" : "Yes, Delete"}
        </Button>
      </div>
    </div>
  </div>
);

/* ── Row skeleton ──────────────────────────────────────── */
const RowSkeleton = () => (
  <div className="flex items-center gap-3 p-3">
    <Skeleton className="w-10 h-14 rounded flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    <Skeleton className="h-8 w-16 rounded" />
    <Skeleton className="h-8 w-16 rounded" />
  </div>
);

/* ── Main component ────────────────────────────────────── */
const MovieList = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosbase.get("movie/getmovie?limit=500");
      const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setMovies(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);

  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await axiosbase.delete(`movie/delete/${toDelete._id}`);
      showSuccess(`"${toDelete.title}" deleted.`);
      setMovies((prev) => prev.filter((m) => m._id !== toDelete._id));
      setToDelete(null);
    } catch (err) {
      setError(err.message);
      setToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // Reset to page 1 when search changes
  const handleSearch = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
          <Film className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">All Movies</h1>
          <p className="text-sm text-gray-400">{movies.length} total</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search movies…"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
          aria-label="Search movies"
        />
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="border-gray-700">
        <CardContent className="p-0 divide-y divide-gray-700">
          {loading ? (
            Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => <RowSkeleton key={i} />)
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-400">
              <Film className="w-12 h-12 mx-auto mb-3 text-gray-700" />
              {search ? "No movies match your search." : "No movies yet."}
            </div>
          ) : (
            paginated.map((movie) => (
              <div
                key={movie._id}
                className="flex items-center gap-3 px-4 py-3 hover:bg-gray-700/30 transition-colors"
              >
                {/* Poster thumbnail */}
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-10 h-14 object-cover rounded flex-shrink-0 border border-gray-600"
                  loading="lazy"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">{movie.title}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    {movie.year && (
                      <span className="text-gray-400 text-xs">{movie.year}</span>
                    )}
                    {movie.language && (
                      <Badge variant="secondary" className="text-xs px-1.5 py-0">
                        {movie.language}
                      </Badge>
                    )}
                    {movie.views != null && (
                      <span className="text-gray-500 text-xs">
                        {movie.views.toLocaleString()} views
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(`/admin-db/edit/${movie._id}`)}
                    aria-label={`Edit ${movie.title}`}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setToDelete(movie)}
                    aria-label={`Delete ${movie.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <PaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        className="mt-6"
      />

      {/* Delete confirm dialog */}
      {toDelete && (
        <DeleteDialog
          movie={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default MovieList;
