import React, { useEffect, useState } from "react";
import { Star, Calendar, Clock, Globe, Eye, ArrowLeft, Download, MessageSquare, Send, User, CornerDownRight, ShieldCheck } from "lucide-react";
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

  // ── Comments state ──────────────────────────────────────
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: "", comment: "" });
  const [commentErrors, setCommentErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const COMMENTS_LIMIT = 10;

  // ── Admin state ─────────────────────────────────────────
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);   // commentId being replied to
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  // Search from detail page → go home with search term
  const handleSearch = (term) => {
    navigate(`/?search=${encodeURIComponent(term)}`);
  };

  // ── Check if current user is admin ─────────────────────
  useEffect(() => {
    axiosbase.get("/me")
      .then(() => setIsAdmin(true))
      .catch(() => setIsAdmin(false));
  }, []);

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

  // ── Fetch comments ──────────────────────────────────────
  const fetchComments = async (page = 1) => {
    setCommentsLoading(true);
    try {
      const res = await axiosbase.get(`movie/${id}/comments`, {
        params: { page, limit: COMMENTS_LIMIT },
      });
      const { data, pagination } = res.data;
      if (page === 1) {
        setComments(data);
      } else {
        setComments((prev) => [...prev, ...data]);
      }
      setCommentsTotal(pagination.total);
      setCommentsPage(page);
    } catch (_) {
      // fail silently — comments are non-critical
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchComments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ── Comment form validation ─────────────────────────────
  const validateComment = () => {
    const errs = {};
    if (!commentForm.name.trim()) errs.name = "Name is required.";
    else if (commentForm.name.trim().length < 2) errs.name = "Name must be at least 2 characters.";
    if (!commentForm.comment.trim()) errs.comment = "Comment is required.";
    else if (commentForm.comment.trim().length < 2) errs.comment = "Comment must be at least 2 characters.";
    return errs;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const errs = validateComment();
    if (Object.keys(errs).length) {
      setCommentErrors(errs);
      return;
    }
    setCommentErrors({});
    setSubmitting(true);
    try {
      const res = await axiosbase.post(`movie/${id}/comments`, {
        name: commentForm.name.trim(),
        comment: commentForm.comment.trim(),
      });
      // Prepend new comment to the list
      setComments((prev) => [res.data.data, ...prev]);
      setCommentsTotal((t) => t + 1);
      setCommentForm({ name: "", comment: "" });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (err) {
      setCommentErrors({ submit: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Admin reply handlers ────────────────────────────────
  const handleReplySubmit = async (commentId) => {
    if (!replyText.trim()) {
      setReplyError("Reply cannot be empty.");
      return;
    }
    setReplyError("");
    setReplySubmitting(true);
    try {
      const res = await axiosbase.patch(`movie/${id}/comments/${commentId}/reply`, {
        reply: replyText.trim(),
      });
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );
      setReplyingTo(null);
      setReplyText("");
    } catch (err) {
      setReplyError(err.message);
    } finally {
      setReplySubmitting(false);
    }
  };

  const handleDeleteReply = async (commentId) => {
    try {
      const res = await axiosbase.delete(`movie/${id}/comments/${commentId}/reply`);
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? res.data.data : c))
      );
    } catch (_) {}
  };

  const openReplyBox = (commentId) => {
    setReplyingTo(commentId);
    setReplyText("");
    setReplyError("");
  };

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

          {/* Sidebar */}          <aside className="lg:col-span-1">
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

        {/* ── Comments Section ───────────────────────────────── */}
        <section className="mt-10" aria-label="Comments">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" aria-hidden="true" />
            Comments
            {commentsTotal > 0 && (
              <span className="text-sm font-normal text-gray-400">({commentsTotal})</span>
            )}
          </h2>

          {/* Leave a Comment form */}
          <Card className="border-gray-700 mb-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-white">
                Leave a Comment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCommentSubmit} noValidate className="space-y-4">
                {/* Comment textarea */}
                <div>
                  <textarea
                    id="comment-text"
                    value={commentForm.comment}
                    onChange={(e) =>
                      setCommentForm((f) => ({ ...f, comment: e.target.value }))
                    }
                    placeholder="Write your comment here..."
                    rows={5}
                    maxLength={1000}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    aria-label="Comment text"
                    aria-describedby={commentErrors.comment ? "comment-error" : undefined}
                  />
                  {commentErrors.comment && (
                    <p id="comment-error" className="text-red-400 text-xs mt-1" role="alert">
                      {commentErrors.comment}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1 text-right">
                    {commentForm.comment.length}/1000
                  </p>
                </div>

                {/* Name input */}
                <div>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" aria-hidden="true" />
                    <input
                      id="comment-name"
                      type="text"
                      value={commentForm.name}
                      onChange={(e) =>
                        setCommentForm((f) => ({ ...f, name: e.target.value }))
                      }
                      placeholder="Your Name"
                      maxLength={60}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      aria-label="Your name"
                      aria-describedby={commentErrors.name ? "name-error" : undefined}
                    />
                  </div>
                  {commentErrors.name && (
                    <p id="name-error" className="text-red-400 text-xs mt-1" role="alert">
                      {commentErrors.name}
                    </p>
                  )}
                </div>

                {/* Submit error */}
                {commentErrors.submit && (
                  <p className="text-red-400 text-sm" role="alert">
                    {commentErrors.submit}
                  </p>
                )}

                {/* Success message */}
                {submitSuccess && (
                  <p className="text-green-400 text-sm" role="status">
                    Comment posted successfully!
                  </p>
                )}

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 uppercase tracking-wider transition disabled:opacity-60"
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Posting...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Send className="w-4 h-4" aria-hidden="true" />
                      Post Comment
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Comments list */}
          {commentsLoading && comments.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <Card key={n} className="border-gray-700">
                  <CardContent className="p-4 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-8">
              No comments yet. Be the first to comment!
            </p>
          ) : (
            <div className="space-y-4">
              {comments.map((c) => (
                <Card key={c._id} className="border-gray-700">
                  <CardContent className="p-4">
                    {/* ── User comment ─────────────────── */}
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xs font-bold uppercase">
                          {c.name?.[0] || "?"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="font-semibold text-sm text-white">{c.name}</p>
                          <p className="text-gray-500 text-xs">
                            {new Date(c.createdAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <p className="text-gray-300 text-sm mt-1.5 leading-relaxed">{c.comment}</p>

                        {/* Reply button */}
                        {isAdmin && !replyingTo && (
                          <button
                            onClick={() => openReplyBox(c._id)}
                            className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Reply
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Inline reply form (admin only) ── */}
                    {isAdmin && replyingTo === c._id && (
                      <div className="mt-4 ml-12 space-y-2">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Write your reply..."
                          rows={3}
                          maxLength={1000}
                          className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          autoFocus
                        />
                        {replyError && (
                          <p className="text-red-400 text-xs" role="alert">{replyError}</p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleReplySubmit(c._id)}
                            disabled={replySubmitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            {replySubmitting ? "Posting..." : (
                              <span className="flex items-center gap-1">
                                <Send className="w-3 h-3" /> Post Reply
                              </span>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setReplyingTo(null); setReplyText(""); setReplyError(""); }}
                            className="text-gray-400 hover:text-white"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* ── Admin reply display ───────────── */}
                    {c.adminReply?.text && (
                      <div className="mt-4 ml-12 border-l-2 border-blue-500 pl-4">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center flex-shrink-0">
                            <ShieldCheck className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                          </div>
                          <p className="font-bold text-sm text-green-400 flex items-center gap-1">
                            Admin
                          </p>
                          <p className="text-gray-500 text-xs">
                            {new Date(c.adminReply.repliedAt).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteReply(c._id)}
                              className="ml-auto text-red-400 hover:text-red-300 text-xs transition"
                              aria-label="Remove reply"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <p className="text-gray-300 text-sm leading-relaxed">{c.adminReply.text}</p>

                        {/* Edit reply button for admin */}
                        {isAdmin && !replyingTo && (
                          <button
                            onClick={() => openReplyBox(c._id)}
                            className="mt-1 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <CornerDownRight className="w-3 h-3" />
                            Edit Reply
                          </button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Load more button */}
              {comments.length < commentsTotal && (
                <div className="text-center pt-2">
                  <Button
                    variant="outline"
                    onClick={() => fetchComments(commentsPage + 1)}
                    disabled={commentsLoading}
                    className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
                  >
                    {commentsLoading ? "Loading..." : `Load More (${commentsTotal - comments.length} remaining)`}
                  </Button>
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default MovieDetailPage;
