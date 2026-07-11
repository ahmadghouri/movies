import { useEffect } from "react";

/**
 * useSEO — sets document title and all relevant meta/OG/Twitter tags.
 *
 * @param {object} options
 * @param {string}  options.title        – page <title> (will be appended with site name)
 * @param {string}  [options.description]
 * @param {string}  [options.image]      – absolute URL for OG image
 * @param {string}  [options.url]        – canonical URL (defaults to window.location.href)
 * @param {string}  [options.type]       – OG type: "website" | "video.movie" (default "website")
 * @param {string}  [options.siteName]   – site name suffix in title
 * @param {object}  [options.jsonLd]     – JSON-LD structured data object (will be serialised)
 * @param {boolean} [options.noIndex]    – add noindex, nofollow
 */
const useSEO = ({
  title,
  description,
  image,
  url,
  type = "website",
  siteName = "MovieMania",
  jsonLd,
  noIndex = false,
}) => {
  useEffect(() => {
    // If title is null/undefined, don't update anything yet — wait for data
    if (title == null) return;

    const fullTitle = title ? `${title} | ${siteName}` : siteName;
    const canonical = url || window.location.href;

    // ── <title> ──────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper: upsert a <meta> tag ──────────────────────────
    const setMeta = (selector, attr, value) => {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement("meta");
        const [attrName, attrValue] = attr.split("=");
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute("content", value);
    };

    // ── Helper: upsert a <link> tag ──────────────────────────
    const setLink = (rel, href) => {
      let el = document.querySelector(`link[rel="${rel}"]`);
      if (!el) {
        el = document.createElement("link");
        el.setAttribute("rel", rel);
        document.head.appendChild(el);
      }
      el.setAttribute("href", href);
    };

    // ── Standard meta ────────────────────────────────────────
    if (description) setMeta('meta[name="description"]', "name=description", description);

    // ── Robots ───────────────────────────────────────────────
    setMeta('meta[name="robots"]', "name=robots",
      noIndex ? "noindex, nofollow" : "index, follow"
    );

    // ── Canonical ────────────────────────────────────────────
    setLink("canonical", canonical);

    // ── Open Graph ───────────────────────────────────────────
    setMeta('meta[property="og:title"]',       "property=og:title",       fullTitle);
    setMeta('meta[property="og:type"]',        "property=og:type",        type);
    setMeta('meta[property="og:url"]',         "property=og:url",         canonical);
    setMeta('meta[property="og:site_name"]',   "property=og:site_name",   siteName);
    if (description)
      setMeta('meta[property="og:description"]', "property=og:description", description);
    if (image)
      setMeta('meta[property="og:image"]',     "property=og:image",       image);

    // ── Twitter Card ─────────────────────────────────────────
    setMeta('meta[name="twitter:card"]',        "name=twitter:card",        image ? "summary_large_image" : "summary");
    setMeta('meta[name="twitter:title"]',       "name=twitter:title",       fullTitle);
    if (description)
      setMeta('meta[name="twitter:description"]', "name=twitter:description", description);
    if (image)
      setMeta('meta[name="twitter:image"]',     "name=twitter:image",       image);

    // ── JSON-LD structured data ───────────────────────────────
    const JSON_LD_ID = "seo-json-ld";
    let scriptEl = document.getElementById(JSON_LD_ID);
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement("script");
        scriptEl.id = JSON_LD_ID;
        scriptEl.type = "application/ld+json";
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }

    // ── Cleanup on unmount ────────────────────────────────────
    return () => {
      document.title = siteName || "PakMovie";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, image, url, type, siteName, noIndex, JSON.stringify(jsonLd)]);
};

export default useSEO;
