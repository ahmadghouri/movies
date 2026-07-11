import React, { useEffect, useState, useCallback } from "react";
import {
  Star, Calendar, Clock, Globe, Eye, ArrowLeft, Download,
  MessageSquare, Send, User, CornerDownRight, ShieldCheck,
} from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosbase from "../../axiosbasa";
import Navbar from "./Navbar";
import Footer from "./Footer";
import useSEO from "../lib/useSEO";
import { useSiteSettings } from "../context/SiteSettingsContext";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Skeleton } from "./ui/skeleton";

// ─── YouTube URL → embed URL ─────────────────────────────────────────────────
const toYouTubeEmbed = (raw) => {
  if (!raw) return null;
  const url = raw.trim();

  // 1. Extract src from <iframe> tag if pasted
  const iframeSrc = url.match(/src\s*=\s*["']([^"']+)["']/i);
  const src = iframeSrc ? iframeSrc[1].trim() : url;

  try {
    // 2. Already an embed URL — just clean it up
    if (src.includes("youtube.com/embed/")) {
      const videoId = src.match(/\/embed\/([a-zA-Z0-9_-]{11})/)?.[1];
      return videoId
        ? `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
        : null;
    }

    // 3. youtu.be/VIDEO_ID
    const shortMatch = src.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}?rel=0&modestbranding=1`;

    // 4. youtube.com/watch?v=VIDEO_ID
    const watchMatch = src.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
    if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}?rel=0&modestbranding=1`;
  } catch (_) {}

  return null;
};

// ─── Skeleton ────────────────────────────────────────────────────────────────
const DetailSkeleton = () => (
  <div className="min-h-screen bg-gray-900 text-white">
    <div className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <Skeleton className="h-10 w-full max-w-7xl mx-auto rounded-lg" />
    </div>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex gap-6">
        <div className="flex-1 space-y-4">
          <Skeleton className="aspect-video w-full rounded-lg" />
          <Skeleton className="aspect-video w-full rounded-lg" />
        </div>
        <div className="w-72 shrink-0 space-y-3">
          <Skeleton className="h-8 w-full" />
          {[1,2,3,4,5].map(i=><Skeleton key={i} className="h-16 w-full"/>)}
        </div>
      </div>
    </div>
  </div>
);

// ─── Sidebar: Recent/Popular + Most Viewed ───────────────────────────────────
const SidebarMovies = () => {
  const [tab, setTab] = useState("recent");      // "recent" | "popular"
  const [movies, setMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    try {
      const [allRes, topRes] = await Promise.all([
        axiosbase.get("/movie/getmovie?limit=100"),
        axiosbase.get("/movie/getmovie?limit=100"),
      ]);
      const all = Array.isArray(allRes.data) ? allRes.data : allRes.data?.data ?? [];
      // Recent: sort by _id desc (newest first), take 8
      const recent = [...all].sort((a,b) => b._id > a._id ? 1 : -1).slice(0,8);
      // Popular: sort by views desc, take 8
      const popular = [...all].sort((a,b) => (b.views||0)-(a.views||0)).slice(0,8);
      // Most viewed 24h: just top by views for now, take 8
      const topV = [...all].sort((a,b)=>(b.views||0)-(a.views||0)).slice(0,8);
      setMovies({ recent, popular });
      setTopMovies(topV);
    } catch {
      setMovies({ recent:[], popular:[] });
      setTopMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(()=>{ fetchAll(); }, [fetchAll]);

  const list = tab === "recent" ? movies.recent || [] : movies.popular || [];

  const fmtViews = (v) => {
    if (!v) return "0";
    if (v >= 1000) return (v/1000).toFixed(1)+"k";
    return v.toString();
  };

  return (
    <div className="space-y-4">
      {/* ── Tabs ── */}
      <div className="flex border border-blue-600 rounded overflow-hidden text-sm font-semibold">
        <button
          onClick={()=>setTab("popular")}
          className={`flex-1 py-2 transition-colors ${tab==="popular" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
        >
          Popular Movies
        </button>
        <button
          onClick={()=>setTab("recent")}
          className={`flex-1 py-2 transition-colors ${tab==="recent" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
        >
          Recent Movies
        </button>
      </div>

      {/* ── Tab list ── */}
      <div className="border border-blue-700 rounded overflow-hidden divide-y divide-blue-800">
        {loading
          ? [1,2,3,4,5].map(i=>(
              <div key={i} className="flex gap-2 p-2 bg-blue-900/30">
                <Skeleton className="w-14 h-16 shrink-0"/>
                <div className="flex-1 space-y-1.5 py-1">
                  <Skeleton className="h-3 w-full"/>
                  <Skeleton className="h-3 w-2/3"/>
                  <Skeleton className="h-3 w-1/3"/>
                </div>
              </div>
            ))
          : list.map(m=>(
              <Link
                key={m._id}
                to={`/moviedetail/${m._id}`}
                className="flex gap-2 p-2 bg-blue-900/30 hover:bg-blue-800/50 transition-colors"
              >
                <img
                  src={m.poster}
                  alt={m.title}
                  className="w-14 h-[72px] object-cover rounded shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-semibold leading-snug line-clamp-3">
                    {m.title} {m.year ? `(${m.year})` : ""} {m.language ? `${m.language} Full Movie` : ""}
                  </p>
                  <p className="text-blue-300 text-xs mt-1">
                    {m.releaseDate
                      ? new Date(m.releaseDate).toLocaleDateString("en-US",{month:"long",day:"numeric",year:"numeric"})
                      : ""}
                  </p>
                </div>
              </Link>
            ))
        }
      </div>

      {/* ── Most Viewed ── */}
      <div className="mt-4">
        <div className="bg-red-600 text-white text-center text-sm font-bold py-2 uppercase tracking-wider rounded-t">
          Most Viewed Movies For 24 Hours
        </div>
        <div className="border border-red-700 rounded-b overflow-hidden divide-y divide-gray-700">
          {loading
            ? [1,2,3,4,5].map(i=>(
                <div key={i} className="flex gap-2 p-2 bg-gray-800">
                  <Skeleton className="w-14 h-16 shrink-0"/>
                  <div className="flex-1 space-y-1.5 py-1">
                    <Skeleton className="h-3 w-full"/>
                    <Skeleton className="h-3 w-1/3"/>
                  </div>
                </div>
              ))
            : topMovies.map(m=>(
                <Link
                  key={m._id}
                  to={`/moviedetail/${m._id}`}
                  className="flex gap-2 p-2 bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <img
                    src={m.poster}
                    alt={m.title}
                    className="w-14 h-[72px] object-cover rounded shrink-0"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-semibold leading-snug line-clamp-3">
                      {m.title} {m.year ? `(${m.year})` : ""} {m.language ? `${m.language} Full Movie` : ""}
                    </p>
                    <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {fmtViews(m.views)} views
                    </p>
                  </div>
                </Link>
              ))
          }
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const MovieDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { siteName } = useSiteSettings();
  const [movie, setMovie] = useState(null);
  const [views, setViews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // comments
  const [comments, setComments] = useState([]);
  const [commentsTotal, setCommentsTotal] = useState(0);
  const [commentsPage, setCommentsPage] = useState(1);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentForm, setCommentForm] = useState({ name: "", comment: "" });
  const [commentErrors, setCommentErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const COMMENTS_LIMIT = 10;

  // admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replySubmitting, setReplySubmitting] = useState(false);
  const [replyError, setReplyError] = useState("");

  // ── SEO — updates as soon as movie data loads ──────────────
  const seoDescription = movie
    ? [
        movie.description?.trim(),
        movie.genre?.length ? `Genre: ${movie.genre.join(", ")}.` : "",
        movie.language ? `Language: ${movie.language}.` : "",
        movie.year ? `Year: ${movie.year}.` : "",
        movie.rating != null ? `Rating: ${movie.rating}/10.` : "",
      ]
        .filter(Boolean)
        .join(" ")
        .slice(0, 160)
    : "";

  useSEO({
    title: movie
      ? `${movie.title}${movie.year ? ` (${movie.year})` : ""} — Watch Online HD`
      : null,   // null = keep the default site title while loading, no flash of "Loading Movie…"
    description: seoDescription,
    image: movie?.poster || "",
    url: `${window.location.origin}/moviedetail/${id}`,
    type: "video.movie",
    siteName,
    jsonLd: movie
      ? {
          "@context": "https://schema.org",
          "@type": "Movie",
          name: movie.title,
          description: seoDescription,
          image: movie.poster,
          datePublished: movie.releaseDate
            ? new Date(movie.releaseDate).toISOString().split("T")[0]
            : undefined,
          genre: movie.genre,
          inLanguage: movie.language,
          aggregateRating: movie.rating != null
            ? { "@type": "AggregateRating", ratingValue: movie.rating, bestRating: 10 }
            : undefined,
          duration: movie.duration,
          url: `${window.location.origin}/moviedetail/${id}`,
        }
      : null,
  });

  const handleSearch = (term) => navigate(`/?search=${encodeURIComponent(term)}`);

  useEffect(() => {
    axiosbase.get("/me").then(()=>setIsAdmin(true)).catch(()=>setIsAdmin(false));
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
          // Initialize views from DB value directly
          setViews(typeof data.views === "number" ? data.views : 0);
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

  useEffect(() => {
    if (!id) return;

    // Allow re-counting after 30 minutes (1800000 ms)
    const EXPIRY_MS = 30 * 60 * 1000;
    const sessionKey = `viewed_${id}`;
    const stored = sessionStorage.getItem(sessionKey);

    if (stored) {
      const viewedAt = parseInt(stored, 10);
      const elapsed = Date.now() - viewedAt;
      if (elapsed < EXPIRY_MS) return; // still within 30 min window — skip
    }

    // First visit OR 30 min has passed — count the view
    sessionStorage.setItem(sessionKey, String(Date.now()));
    axiosbase.patch(`movie/view/${id}`)
      .then(() => setViews(v => (typeof v === "number" ? v + 1 : 1)))
      .catch(() => {});
  }, [id]);

  const fetchComments = async (page=1) => {
    setCommentsLoading(true);
    try {
      const res = await axiosbase.get(`movie/${id}/comments`,{params:{page,limit:COMMENTS_LIMIT}});
      const {data,pagination} = res.data;
      if (page===1) setComments(data); else setComments(prev=>[...prev,...data]);
      setCommentsTotal(pagination.total);
      setCommentsPage(page);
    } catch(_){} finally { setCommentsLoading(false); }
  };

  useEffect(()=>{ if(id) fetchComments(1); },[id]);

  const validateComment = () => {
    const errs={};
    if (!commentForm.name.trim()) errs.name="Name is required.";
    else if (commentForm.name.trim().length<2) errs.name="Name must be at least 2 characters.";
    if (!commentForm.comment.trim()) errs.comment="Comment is required.";
    else if (commentForm.comment.trim().length<2) errs.comment="Comment must be at least 2 characters.";
    return errs;
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const errs=validateComment();
    if (Object.keys(errs).length){setCommentErrors(errs);return;}
    setCommentErrors({});setSubmitting(true);
    try {
      const res = await axiosbase.post(`movie/${id}/comments`,{
        name:commentForm.name.trim(),comment:commentForm.comment.trim()
      });
      setComments(prev=>[res.data.data,...prev]);
      setCommentsTotal(t=>t+1);
      setCommentForm({name:"",comment:""});
      setSubmitSuccess(true);
      setTimeout(()=>setSubmitSuccess(false),3000);
    } catch(err){setCommentErrors({submit:err.message});}
    finally{setSubmitting(false);}
  };

  const handleReplySubmit = async (commentId) => {
    if(!replyText.trim()){setReplyError("Reply cannot be empty.");return;}
    setReplyError("");setReplySubmitting(true);
    try {
      const res = await axiosbase.patch(`movie/${id}/comments/${commentId}/reply`,{reply:replyText.trim()});
      setComments(prev=>prev.map(c=>c._id===commentId?res.data.data:c));
      setReplyingTo(null);setReplyText("");
    } catch(err){setReplyError(err.message);}
    finally{setReplySubmitting(false);}
  };

  const handleDeleteReply = async (commentId) => {
    try {
      const res = await axiosbase.delete(`movie/${id}/comments/${commentId}/reply`);
      setComments(prev=>prev.map(c=>c._id===commentId?res.data.data:c));
    } catch(_){}
  };

  const openReplyBox = (commentId) => { setReplyingTo(commentId);setReplyText("");setReplyError(""); };

  if (loading) return <DetailSkeleton />;

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex flex-col">
        <Navbar setSearchh={handleSearch} />
        <div className="flex flex-col items-center justify-center py-32 gap-4 flex-1">
          <p className="text-gray-400 text-lg">{error||"Movie not found."}</p>
          <Button variant="outline" asChild>
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-2"/>Back to Home</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar setSearchh={handleSearch} />

      {/* ── Title Bar ── */}
      <div className="bg-gray-950 border-b border-gray-700 px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <Button variant="ghost" size="sm" asChild className="mb-3 text-gray-400 hover:text-white -ml-2">
            <Link to="/"><ArrowLeft className="w-4 h-4 mr-1.5" aria-hidden="true"/>Back to Home</Link>
          </Button>
          <h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-white leading-snug">
            {movie.title}
          </h1>
        </div>
      </div>

      {/* ── Main 2-column layout ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">

          {/* LEFT: Players + Download + Movie Info + Comments */}
          <main className="flex-1 min-w-0 space-y-5">

            {/* Players */}
            {movie.players?.length > 0 ? (
              movie.players.map((src, idx) => (
                <div key={idx} className="border border-gray-700 rounded overflow-hidden">
                  <div className="bg-gray-800 px-4 py-2 text-sm font-semibold text-gray-200">
                    Player {idx + 1} Below
                  </div>
                  <div className="aspect-video bg-black">
                    <iframe
                      src={src}
                      allowFullScreen
                      className="w-full h-full border-none"
                      title={`${movie.title} — Player ${idx+1}`}
                      sandbox="allow-scripts allow-same-origin allow-presentation"
                    />
                  </div>
                </div>
              ))
            ) : (
              <Card className="border-gray-700">
                <CardContent className="py-12 text-center text-gray-400">
                  No video players available for this movie.
                </CardContent>
              </Card>
            )}

            {/* Download links — grouped by provider */}
            {movie.downloadLinks?.length > 0 && (() => {
              // Group links by provider
              const groups = movie.downloadLinks.reduce((acc, link) => {
                const key = link.provider || "Other";
                if (!acc[key]) acc[key] = [];
                acc[key].push(link);
                return acc;
              }, {});

              return (
                <div className="space-y-5">
                  {Object.entries(groups).map(([provider, links]) => {
                    // All qualities in this provider group (e.g. "360p")
                    const qualities = [...new Set(links.map(l => l.quality).filter(Boolean))].join(", ");
                    return (
                      <div key={provider}>
                        {/* Section header */}
                        <div className="mb-2">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-red-500 font-bold text-sm uppercase tracking-wide shrink-0">
                              {provider}
                            </span>
                            <div className="flex-1 h-px bg-gray-600" />
                          </div>
                          {qualities && (
                            <p className="text-gray-300 text-sm font-semibold">
                              {qualities} Quality Links — {provider}
                            </p>
                          )}
                        </div>
                        {/* Links */}
                        <div className="space-y-2">
                          {links.map((link, idx) => {
                            // Show only what admin filled in — episode if present, else quality
                            const inside = link.episode?.trim()
                              ? link.episode.trim()
                              : link.quality?.trim() || `Link ${idx + 1}`;
                            const label = `Click To Download (${inside})`;
                            return (
                              <a
                                key={idx}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-center bg-gray-900 border border-gray-600 hover:border-red-500 text-red-400 hover:text-red-300 font-semibold py-3 px-4 rounded transition-colors underline"
                              >
                                {label}
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            {/* ── Movie Info block (poster + details) ── */}
            <div className="flex gap-4 bg-gray-800 border border-gray-700 rounded p-4">
              {/* Poster */}
              <img
                src={movie.poster}
                alt={`${movie.title} poster`}
                className="w-32 h-44 object-cover rounded shrink-0"
                loading="lazy"
              />
              {/* Details */}
              <dl className="flex-1 text-sm space-y-2 text-gray-300">
                {/* Title */}
                <div className="mb-1">
                  <h2 className="text-white font-bold text-base md:text-lg leading-snug">
                    {movie.title}{movie.year ? ` (${movie.year})` : ""}
                  </h2>
                </div>
                {movie.genre?.length > 0 && (
                  <div>
                    <span className="text-gray-400 font-medium">Genres : </span>
                    {movie.genre.map((g,i)=>(
                      <span key={i}>
                        <Link to={`/?genre=${encodeURIComponent(g)}`} className="text-red-400 hover:underline">{g}</Link>
                        {i < movie.genre.length-1 && " , "}
                      </span>
                    ))}
                  </div>
                )}
                {movie.releaseDate && (
                  <div>
                    <span className="text-gray-400 font-medium">Added on : </span>
                    {new Date(movie.releaseDate).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}
                  </div>
                )}
                {views != null && (
                  <div>
                    <span className="text-gray-400 font-medium">Views : </span>
                    {views.toLocaleString()}
                  </div>
                )}
                {movie.duration && (
                  <div>
                    <span className="text-gray-400 font-medium">Duration: </span>
                    {movie.duration}
                  </div>
                )}
                {movie.language && (
                  <div>
                    <span className="text-gray-400 font-medium">Language: </span>
                    {movie.language}
                  </div>
                )}
                {movie.rating != null && (
                  <div className="flex items-center gap-1">
                    <span className="text-gray-400 font-medium">Rating: </span>
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400"/>
                    {movie.rating}/10
                  </div>
                )}
              </dl>
            </div>

            {/* ── Trailer Section ── */}
            {(() => {
              const embedUrl = toYouTubeEmbed(movie.trailerUrl);
              if (!embedUrl) return null;
              return (
                <div className="border border-gray-700 rounded overflow-hidden">
                  <div className="bg-red-700 px-4 py-2 flex items-center gap-2">
                    {/* YouTube play icon */}
                    <svg className="w-5 h-5 text-white shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8z"/>
                      <polygon fill="#ff0000" points="0,0 0,0 0,0"/>
                      <path d="M9.75 15.02V8.98L15.5 12l-5.75 3.02z" fill="white"/>
                    </svg>
                    <span className="text-white font-bold text-sm uppercase tracking-wide">
                      Official Trailer — {movie.title}
                    </span>
                  </div>
                  <div className="aspect-video bg-black">
                    <iframe
                      src={embedUrl}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-none"
                      title={`${movie.title} — Official Trailer`}
                      loading="lazy"
                    />
                  </div>
                </div>
              );
            })()}

            {/* ── Comments Section ── */}
            <section aria-label="Comments" className="mt-4">
              <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400"/>
                Comments
                {commentsTotal>0 && <span className="text-sm font-normal text-gray-400">({commentsTotal})</span>}
              </h2>

              {/* Comment form */}
              <Card className="border-gray-700 mb-6">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-white">Leave a Comment</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCommentSubmit} noValidate className="space-y-4">
                    <div>
                      <textarea
                        value={commentForm.comment}
                        onChange={e=>setCommentForm(f=>({...f,comment:e.target.value}))}
                        placeholder="Write your comment here..."
                        rows={5} maxLength={1000}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        aria-label="Comment text"
                      />
                      {commentErrors.comment && <p className="text-red-400 text-xs mt-1">{commentErrors.comment}</p>}
                      <p className="text-gray-500 text-xs mt-1 text-right">{commentForm.comment.length}/1000</p>
                    </div>
                    <div>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
                        <input
                          type="text" value={commentForm.name}
                          onChange={e=>setCommentForm(f=>({...f,name:e.target.value}))}
                          placeholder="Your Name" maxLength={60}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                          aria-label="Your name"
                        />
                      </div>
                      {commentErrors.name && <p className="text-red-400 text-xs mt-1">{commentErrors.name}</p>}
                    </div>
                    {commentErrors.submit && <p className="text-red-400 text-sm">{commentErrors.submit}</p>}
                    {submitSuccess && <p className="text-green-400 text-sm">Comment posted successfully!</p>}
                    <Button type="submit" disabled={submitting}
                      className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 uppercase tracking-wider disabled:opacity-60">
                      {submitting
                        ? <span className="flex items-center justify-center gap-2"><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Posting...</span>
                        : <span className="flex items-center justify-center gap-2"><Send className="w-4 h-4"/>Post Comment</span>
                      }
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Comments list */}
              {commentsLoading && comments.length===0 ? (
                <div className="space-y-4">
                  {[1,2,3].map(n=>(
                    <Card key={n} className="border-gray-700">
                      <CardContent className="p-4 space-y-2">
                        <Skeleton className="h-4 w-1/4"/><Skeleton className="h-3 w-full"/><Skeleton className="h-3 w-3/4"/>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : comments.length===0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No comments yet. Be the first to comment!</p>
              ) : (
                <div className="space-y-4">
                  {comments.map(c=>(
                    <Card key={c._id} className="border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                            <span className="text-white text-xs font-bold uppercase">{c.name?.[0]||"?"}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <p className="font-semibold text-sm text-white">{c.name}</p>
                              <p className="text-gray-500 text-xs">{new Date(c.createdAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                            </div>
                            <p className="text-gray-300 text-sm mt-1.5 leading-relaxed">{c.comment}</p>
                            {isAdmin && !replyingTo && (
                              <button onClick={()=>openReplyBox(c._id)} className="mt-2 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition">
                                <CornerDownRight className="w-3 h-3"/>Reply
                              </button>
                            )}
                          </div>
                        </div>
                        {isAdmin && replyingTo===c._id && (
                          <div className="mt-4 ml-12 space-y-2">
                            <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Write your reply..." rows={3} maxLength={1000}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 transition" autoFocus/>
                            {replyError && <p className="text-red-400 text-xs">{replyError}</p>}
                            <div className="flex gap-2">
                              <Button size="sm" onClick={()=>handleReplySubmit(c._id)} disabled={replySubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                                {replySubmitting?"Posting...":<span className="flex items-center gap-1"><Send className="w-3 h-3"/>Post Reply</span>}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={()=>{setReplyingTo(null);setReplyText("");setReplyError("");}} className="text-gray-400 hover:text-white">Cancel</Button>
                            </div>
                          </div>
                        )}
                        {c.adminReply?.text && (
                          <div className="mt-4 ml-12 border-l-2 border-blue-500 pl-4">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <div className="w-7 h-7 rounded-full bg-green-700 flex items-center justify-center shrink-0">
                                <ShieldCheck className="w-3.5 h-3.5 text-white"/>
                              </div>
                              <p className="font-bold text-sm text-green-400">Admin</p>
                              <p className="text-gray-500 text-xs">{new Date(c.adminReply.repliedAt).toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric",hour:"2-digit",minute:"2-digit"})}</p>
                              {isAdmin && <button onClick={()=>handleDeleteReply(c._id)} className="ml-auto text-red-400 hover:text-red-300 text-xs transition">Remove</button>}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed">{c.adminReply.text}</p>
                            {isAdmin && !replyingTo && (
                              <button onClick={()=>openReplyBox(c._id)} className="mt-1 text-blue-400 hover:text-blue-300 text-xs font-semibold flex items-center gap-1 transition">
                                <CornerDownRight className="w-3 h-3"/>Edit Reply
                              </button>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {comments.length<commentsTotal && (
                    <div className="text-center pt-2">
                      <Button variant="outline" onClick={()=>fetchComments(commentsPage+1)} disabled={commentsLoading} className="border-gray-600 text-gray-300 hover:text-white hover:border-gray-400">
                        {commentsLoading?"Loading...":`Load More (${commentsTotal-comments.length} remaining)`}
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </section>
          </main>

          {/* RIGHT: Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-4">
              <SidebarMovies />
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MovieDetailPage;
