import React, { useEffect, useState, useCallback } from "react";
import axiosbase from "../../../axiosbasa";
import { Link2, Trash2, ExternalLink, Copy, Check, TrendingUp, Hash, MousePointerClick, RefreshCw, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Skeleton } from "../ui/skeleton";
import { Badge } from "../ui/badge";
import { showSuccess, showError } from "../../lib/toast";

// ── Stat card ─────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex items-center gap-4">
    <div className={`w-11 h-11 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-medium">{label}</p>
      <p className="text-white text-2xl font-bold leading-tight">{value ?? "—"}</p>
    </div>
  </div>
);

// ── Format date ───────────────────────────────────────────
const fmt = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

// ── Main component ────────────────────────────────────────
const AdminShortLinks = () => {
  const [links, setLinks]         = useState([]);
  const [stats, setStats]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [sort, setSort]           = useState("createdAt"); // "createdAt" | "clicks"
  const [search, setSearch]       = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [copiedId, setCopiedId]   = useState(null);
  const [page, setPage]           = useState(1);
  const [pagination, setPagination] = useState(null);
  const LIMIT = 20;

  const fetchLinks = useCallback(async (p = 1, s = sort) => {
    setLoading(true);
    setError("");
    try {
      const res = await axiosbase.get("/admin/short-links", {
        params: { page: p, limit: LIMIT, sort: s },
      });
      setLinks(res.data.data);
      setStats(res.data.stats);
      setPagination(res.data.pagination);
      setPage(p);
    } catch (err) {
      setError(err.message || "Failed to load short links.");
    } finally {
      setLoading(false);
    }
  }, [sort]);

  useEffect(() => { fetchLinks(1, sort); }, [sort]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this short link? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      await axiosbase.delete(`/admin/short-links/${id}`);
      setLinks((prev) => prev.filter((l) => l._id !== id));
      setStats((s) => s ? { ...s, totalLinks: s.totalLinks - 1 } : s);
      showSuccess("Short link deleted.");
    } catch (err) {
      showError(err.message || "Failed to delete.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = async (url, id) => {
    try { await navigator.clipboard.writeText(url); } catch { /* ignore */ }
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Client-side search filter
  const filtered = search
    ? links.filter(
        (l) =>
          l.shortUrl?.toLowerCase().includes(search.toLowerCase()) ||
          l.longUrl?.toLowerCase().includes(search.toLowerCase()) ||
          l.movieId?.title?.toLowerCase().includes(search.toLowerCase()) ||
          l.code?.toLowerCase().includes(search.toLowerCase())
      )
    : links;

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
            <Link2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Short Links Analytics</h1>
            <p className="text-gray-400 text-sm">Track all generated short links and their clicks.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchLinks(page, sort)}
          className="border-gray-600 text-gray-300 hover:text-white self-start sm:self-auto"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Hash}              label="Total Short Links" value={stats?.totalLinks?.toLocaleString()} color="bg-blue-600" />
        <StatCard icon={MousePointerClick} label="Total Clicks"      value={stats?.totalClicks?.toLocaleString()} color="bg-green-600" />
        <StatCard icon={TrendingUp}        label="Avg Clicks / Link"
          value={stats?.totalLinks ? Math.round(stats.totalClicks / stats.totalLinks) : 0}
          color="bg-purple-600"
        />
      </div>

      {/* ── Controls ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by code, URL, or movie…"
            className="pl-9 bg-gray-800 border-gray-600 text-white"
          />
        </div>
        {/* Sort */}
        <div className="flex gap-2">
          <Button
            variant={sort === "createdAt" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("createdAt")}
            className={sort === "createdAt" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300"}
          >
            Newest First
          </Button>
          <Button
            variant={sort === "clicks" ? "default" : "outline"}
            size="sm"
            onClick={() => setSort("clicks")}
            className={sort === "clicks" ? "bg-blue-600 hover:bg-blue-700" : "border-gray-600 text-gray-300"}
          >
            Most Clicked
          </Button>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* ── Table ── */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[1fr_2fr_2fr_80px_140px_100px] gap-3 px-4 py-3 bg-gray-800 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span>Code</span>
          <span>Short URL</span>
          <span>Movie / Destination</span>
          <span className="text-center">Clicks</span>
          <span>Created</span>
          <span className="text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="divide-y divide-gray-800">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="px-4 py-4 flex gap-3 items-center">
                <Skeleton className="h-4 w-16 bg-gray-700" />
                <Skeleton className="h-4 flex-1 bg-gray-700" />
                <Skeleton className="h-4 w-32 bg-gray-700" />
                <Skeleton className="h-4 w-10 bg-gray-700" />
                <Skeleton className="h-4 w-24 bg-gray-700" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-500 gap-3">
            <Link2 className="w-12 h-12 text-gray-700" />
            <p className="font-medium">No short links found.</p>
            {search && <p className="text-sm">Try a different search term.</p>}
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {filtered.map((link) => (
              <div
                key={link._id}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr_2fr_80px_140px_100px] gap-2 md:gap-3 px-4 py-4 hover:bg-gray-800/40 transition-colors items-center"
              >
                {/* Code badge */}
                <div>
                  <Badge className="bg-blue-900/50 text-blue-300 border border-blue-700 font-mono text-xs">
                    {link.code}
                  </Badge>
                </div>

                {/* Short URL */}
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-blue-400 text-sm font-mono truncate">{link.shortUrl}</span>
                  <button
                    onClick={() => handleCopy(link.shortUrl, link._id)}
                    className="shrink-0 text-gray-500 hover:text-blue-400 transition"
                    title="Copy short URL"
                    aria-label="Copy short URL"
                  >
                    {copiedId === link._id
                      ? <Check className="w-3.5 h-3.5 text-green-400" />
                      : <Copy className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>

                {/* Movie / Destination */}
                <div className="flex items-center gap-2 min-w-0">
                  {link.movieId ? (
                    <>
                      {link.movieId.poster && (
                        <img
                          src={link.movieId.poster}
                          alt={link.movieId.title}
                          className="w-8 h-10 object-cover rounded shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{link.movieId.title}</p>
                        <p className="text-gray-500 text-xs">{link.movieId.year} · {link.movieId.language}</p>
                      </div>
                    </>
                  ) : (
                    <a
                      href={link.longUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 text-xs truncate hover:text-blue-400 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3 shrink-0" />
                      {link.longUrl}
                    </a>
                  )}
                </div>

                {/* Clicks */}
                <div className="md:text-center">
                  <span className={`text-lg font-bold ${link.clicks > 0 ? "text-green-400" : "text-gray-500"}`}>
                    {link.clicks.toLocaleString()}
                  </span>
                  <p className="text-gray-600 text-[10px] md:hidden inline ml-1">clicks</p>
                </div>

                {/* Created */}
                <div className="text-gray-400 text-xs">
                  {fmt(link.createdAt)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:justify-end">
                  <a
                    href={link.shortUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-500 hover:text-blue-400 transition p-1 rounded"
                    title="Open short link"
                    aria-label="Open short link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    onClick={() => handleDelete(link._id)}
                    disabled={deletingId === link._id}
                    className="text-gray-500 hover:text-red-400 transition p-1 rounded disabled:opacity-50"
                    title="Delete"
                    aria-label="Delete short link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {pagination && pagination.totalPages > 1 && !search && (
        <div className="flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            Showing {((page - 1) * LIMIT) + 1}–{Math.min(page * LIMIT, pagination.total)} of {pagination.total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLinks(page - 1, sort)}
              disabled={page <= 1 || loading}
              className="border-gray-600 text-gray-300"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchLinks(page + 1, sort)}
              disabled={page >= pagination.totalPages || loading}
              className="border-gray-600 text-gray-300"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </main>
  );
};

export default AdminShortLinks;
