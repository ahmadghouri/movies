import React, { useEffect, useRef, useState } from "react";
import { X, Copy, Check, Share2, Loader2 } from "lucide-react";
import { buildMovieUrl } from "../lib/movieUrl";
import axiosbase from "../../axiosbasa";

// ── Social platform config ────────────────────────────────
const platforms = [
  {
    name: "WhatsApp",
    color: "bg-[#25D366] hover:bg-[#1ebe57]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
        <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.118 1.528 5.852L.057 23.571a.75.75 0 0 0 .921.921l5.733-1.47A11.942 11.942 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.726 9.726 0 0 1-4.953-1.355l-.354-.212-3.668.941.962-3.558-.232-.368A9.712 9.712 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z" />
      </svg>
    ),
    getUrl: (url, title) =>
      `https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`,
  },
  {
    name: "Facebook",
    color: "bg-[#1877F2] hover:bg-[#0f65d9]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
      </svg>
    ),
    getUrl: (url) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    name: "Telegram",
    color: "bg-[#229ED9] hover:bg-[#1a8bbf]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.9l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.659z" />
      </svg>
    ),
    getUrl: (url, title) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Twitter / X",
    color: "bg-[#000000] hover:bg-[#1a1a1a]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    getUrl: (url, title) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
  },
  {
    name: "Pinterest",
    color: "bg-[#E60023] hover:bg-[#c9001f]",
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white" aria-hidden="true">
        <path d="M12 0C5.373 0 0 5.373 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z" />
      </svg>
    ),
    getUrl: (url, title, image) =>
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}&media=${encodeURIComponent(image || "")}`,
  },
];

// ── SharePopup ────────────────────────────────────────────
const SharePopup = ({ movie, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [shortUrl, setShortUrl] = useState("");
  const [shortLoading, setShortLoading] = useState(true);
  const [shortError, setShortError] = useState(false);
  const overlayRef = useRef(null);

  // Full pretty URL (fallback if short URL fails)
  const longUrl = movie
    ? `${window.location.origin}${buildMovieUrl(movie)}`
    : window.location.href;

  // The URL shown/shared — short if available, else long
  const shareUrl = shortUrl || longUrl;

  const shareTitle = movie?.title
    ? `Watch "${movie.title}" online — PakMovie`
    : "Watch on PakMovie";

  // ── Auto-generate short URL when popup opens ──────────────
  useEffect(() => {
    let cancelled = false;
    setShortLoading(true);
    setShortError(false);

    axiosbase
      .post("/shorten", { longUrl, movieId: movie?._id || null })
      .then((res) => {
        if (!cancelled && res.data?.shortUrl) {
          setShortUrl(res.data.shortUrl);
        }
      })
      .catch(() => {
        if (!cancelled) setShortError(true);
      })
      .finally(() => {
        if (!cancelled) setShortLoading(false);
      });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [longUrl]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share movie"
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h2 className="text-white font-bold text-base">Share Movie</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition rounded-full p-1 hover:bg-gray-700"
            aria-label="Close share popup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Movie info strip ── */}
        {movie && (
          <div className="flex items-center gap-3 px-5 py-3 bg-gray-800/60">
            {movie.poster && (
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-10 h-14 object-cover rounded shrink-0"
              />
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold line-clamp-2 leading-snug">
                {movie.title}
              </p>
              {movie.year && (
                <p className="text-gray-400 text-xs mt-0.5">{movie.year}</p>
              )}
            </div>
          </div>
        )}

        {/* ── Social buttons ── */}
        <div className="px-5 py-4 grid grid-cols-5 gap-3">
          {platforms.map((p) => (
            <a
              key={p.name}
              href={shortLoading ? "#" : p.getUrl(shareUrl, shareTitle, movie?.poster)}
              target="_blank"
              rel="noopener noreferrer"
              title={p.name}
              className={`${p.color} flex flex-col items-center justify-center gap-1 rounded-xl p-2.5 transition ${shortLoading ? "opacity-60 pointer-events-none" : ""}`}
              aria-label={`Share on ${p.name}`}
            >
              {p.icon}
              <span className="text-white text-[9px] font-semibold leading-none text-center">
                {p.name.split(" ")[0]}
              </span>
            </a>
          ))}
        </div>

        {/* ── Short URL copy box ── */}
        <div className="px-5 pb-5 space-y-2">
          {/* Labels row */}
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">
              Short Link
            </p>
            {shortLoading && (
              <span className="flex items-center gap-1 text-gray-500 text-xs">
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating…
              </span>
            )}
            {!shortLoading && shortError && (
              <span className="text-yellow-500 text-xs">Using full URL</span>
            )}
            {!shortLoading && shortUrl && (
              <span className="text-green-400 text-xs">✓ Ready</span>
            )}
          </div>

          {/* URL box */}
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2">
            {shortLoading ? (
              <span className="flex-1 text-gray-500 text-xs animate-pulse">
                Building short link…
              </span>
            ) : (
              <span className="flex-1 text-blue-300 text-xs truncate select-all font-mono">
                {shareUrl}
              </span>
            )}
            <button
              onClick={handleCopy}
              disabled={shortLoading}
              className={`shrink-0 flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-md transition disabled:opacity-50 ${
                copied
                  ? "bg-green-600 text-white"
                  : "bg-blue-600 hover:bg-blue-500 text-white"
              }`}
              aria-label="Copy link"
            >
              {copied ? (
                <><Check className="w-3.5 h-3.5" />Copied!</>
              ) : (
                <><Copy className="w-3.5 h-3.5" />Copy</>
              )}
            </button>
          </div>

          {/* Show full URL as small note */}
          {shortUrl && (
            <p className="text-gray-600 text-[10px] truncate">
              Full: {longUrl}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharePopup;
