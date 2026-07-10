import React, { useEffect, useState, useCallback } from "react";
import axiosbase from "../../../axiosbasa";
import {
  MessageSquare,
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Trash2,
  CornerDownRight,
  ShieldCheck,
  Film,
} from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { Alert, AlertDescription } from "../ui/alert";
import { showSuccess } from "../../lib/toast";

/* ─── Skeleton row ─────────────────────────────────────── */
const CommentSkeleton = () => (
  <div className="space-y-3 p-4">
    {[1, 2, 3].map((n) => (
      <div key={n} className="flex gap-3">
        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/4" />
          <Skeleton className="h-3 w-full" />
        </div>
      </div>
    ))}
  </div>
);

/* ─── Single comment row with reply form ───────────────── */
const CommentRow = ({ comment, movieId, onUpdate, onDelete }) => {
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState(comment.adminReply?.text || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const hasReply = !!comment.adminReply?.text;

  const handleReplySubmit = async () => {
    if (!replyText.trim()) { setError("Reply cannot be empty."); return; }
    setError("");
    setSubmitting(true);
    try {
      const res = await axiosbase.patch(
        `movie/${movieId}/comments/${comment._id}/reply`,
        { reply: replyText.trim() }
      );
      onUpdate(res.data.data);
      setReplyOpen(false);
      showSuccess("Reply posted.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async () => {
    try {
      const res = await axiosbase.delete(
        `movie/${movieId}/comments/${comment._id}/reply`
      );
      onUpdate(res.data.data);
      setReplyText("");
      showSuccess("Reply removed.");
    } catch (_) {}
  };

  const handleDeleteComment = async () => {
    try {
      await axiosbase.delete(`movie/${movieId}/comments/${comment._id}`);
      onDelete(comment._id);
      showSuccess("Comment deleted.");
    } catch (_) {}
  };

  const openEdit = () => {
    setReplyText(comment.adminReply?.text || "");
    setReplyOpen(true);
    setError("");
  };

  return (
    <div className="border-b border-gray-700/60 last:border-0 px-4 py-4">
      {/* User comment */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 text-white text-xs font-bold uppercase">
          {comment.name?.[0] || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-sm text-white">{comment.name}</span>
            <span className="text-gray-500 text-xs">
              {new Date(comment.createdAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
          </div>
          <p className="text-gray-300 text-sm mt-1 leading-relaxed">{comment.comment}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={openEdit}
              className="text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <CornerDownRight className="w-3 h-3" />
              {hasReply ? "Edit Reply" : "Reply"}
            </button>
            <button
              onClick={handleDeleteComment}
              className="text-red-400 hover:text-red-300 text-xs font-semibold flex items-center gap-1 transition"
            >
              <Trash2 className="w-3 h-3" />
              Delete Comment
            </button>
          </div>
        </div>
      </div>

      {/* Existing admin reply */}
      {hasReply && !replyOpen && (
        <div className="mt-3 ml-11 border-l-2 border-green-600 pl-3">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <div className="w-6 h-6 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-green-400 font-semibold text-xs">Admin</span>
            <span className="text-gray-500 text-xs">
              {new Date(comment.adminReply.repliedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </span>
            <button
              onClick={handleDeleteReply}
              className="ml-auto text-red-400 hover:text-red-300 text-xs transition"
            >
              Remove
            </button>
          </div>
          <p className="text-gray-300 text-sm leading-relaxed">{comment.adminReply.text}</p>
        </div>
      )}

      {/* Inline reply form */}
      {replyOpen && (
        <div className="mt-3 ml-11 space-y-2">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write your reply..."
            rows={3}
            maxLength={1000}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            autoFocus
          />
          {error && <p className="text-red-400 text-xs" role="alert">{error}</p>}
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReplySubmit}
              disabled={submitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {submitting ? "Posting..." : (
                <span className="flex items-center gap-1">
                  <Send className="w-3 h-3" /> Post Reply
                </span>
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setReplyOpen(false); setError(""); }}
              className="text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Movie comments accordion ─────────────────────────── */
const MovieCommentsCard = ({ movie }) => {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [total, setTotal] = useState(movie.commentCount || 0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const LIMIT = 20;

  const fetchComments = useCallback(async (pg = 1) => {
    setLoading(true);
    try {
      const res = await axiosbase.get(`movie/${movie._id}/comments`, {
        params: { page: pg, limit: LIMIT },
      });
      const { data, pagination } = res.data;
      setComments((prev) => (pg === 1 ? data : [...prev, ...data]));
      setTotal(pagination.total);
      setPage(pg);
      setFetched(true);
    } catch (_) {}
    finally { setLoading(false); }
  }, [movie._id]);

  const handleToggle = () => {
    setOpen((v) => {
      if (!v && !fetched) fetchComments(1);
      return !v;
    });
  };

  const handleUpdate = (updated) =>
    setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)));

  const handleDelete = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
    setTotal((t) => t - 1);
  };

  return (
    <Card className="border-gray-700">
      {/* Header — click to toggle */}
      <button
        className="w-full text-left"
        onClick={handleToggle}
        aria-expanded={open}
      >
        <CardHeader className="py-3 px-4 hover:bg-gray-700/30 transition-colors rounded-t-lg">
          <div className="flex items-center gap-3">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-9 h-12 object-cover rounded flex-shrink-0 border border-gray-600"
              loading="lazy"
            />
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold text-white truncate">
                {movie.title}
              </CardTitle>
              <p className="text-xs text-gray-400 mt-0.5">
                {movie.year && `${movie.year} · `}
                <span className="text-blue-400">{total} comment{total !== 1 ? "s" : ""}</span>
              </p>
            </div>
            {open ? (
              <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            )}
          </div>
        </CardHeader>
      </button>

      {/* Comments list */}
      {open && (
        <CardContent className="p-0">
          {loading && comments.length === 0 ? (
            <CommentSkeleton />
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">No comments yet.</p>
          ) : (
            <>
              {comments.map((c) => (
                <CommentRow
                  key={c._id}
                  comment={c}
                  movieId={movie._id}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
              {comments.length < total && (
                <div className="p-4 text-center border-t border-gray-700">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fetchComments(page + 1)}
                    disabled={loading}
                    className="border-gray-600 text-gray-300 hover:text-white"
                  >
                    {loading ? "Loading..." : `Load More (${total - comments.length} remaining)`}
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

/* ─── Main page ────────────────────────────────────────── */
const AdminComments = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await axiosbase.get("movie/getmovie?limit=500");
        const data = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
        setMovies(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const filtered = movies.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
          <MessageSquare className="w-5 h-5 text-white" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Comments Manager</h1>
          <p className="text-sm text-gray-400">
            Reply or delete comments on any movie
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-5" role="alert">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="search"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
          aria-label="Search movies"
        />
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="border-gray-700">
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="w-9 h-12 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border-gray-700 border-dashed">
          <CardContent className="py-16 text-center">
            <Film className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-lg font-medium">No movies found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((movie) => (
            <MovieCommentsCard key={movie._id} movie={movie} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminComments;
