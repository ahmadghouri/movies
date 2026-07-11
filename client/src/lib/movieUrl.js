/**
 * movieUrl.js — helpers for pretty movie URLs
 *
 * Format:  /movie/{title-slug}-{language}-{12-char-uuid-slug}
 * Example: /movie/inception-english-a1b2c3d4e5f6
 */

/**
 * Convert any string to a URL-safe kebab-case slug.
 * Removes special chars, lowercases, collapses spaces/dashes.
 */
const toKebab = (str = "") =>
  str
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")   // keep only alphanumeric, space, dash
    .trim()
    .replace(/[\s-]+/g, "-");        // spaces → dashes, collapse multiples

/**
 * Build the full pretty URL for a movie.
 * Falls back to /moviedetail/:id for old movies without a slug.
 *
 * @param {object} movie  – movie document (needs _id, slug, title, language)
 * @returns {string}       – e.g. "/movie/inception-english-a1b2c3d4e5f6"
 */
export const buildMovieUrl = (movie) => {
  if (!movie) return "/";
  if (!movie.slug) return `/moviedetail/${movie._id}`;  // backward compat

  const parts = [];
  if (movie.title)    parts.push(toKebab(movie.title));
  if (movie.language) parts.push(toKebab(movie.language));
  parts.push(movie.slug);   // always last — 12-char hex anchor

  return `/movie/${parts.join("-")}`;
};

/**
 * Extract the 12-char UUID slug from a pretty URL segment.
 * The slug is always the last hyphen-separated token of exactly 12 hex chars.
 *
 * @param {string} prettySlug  – e.g. "inception-english-a1b2c3d4e5f6"
 * @returns {string|null}
 */
export const extractSlug = (prettySlug = "") => {
  const tokens = prettySlug.split("-");
  const last = tokens[tokens.length - 1];
  // 12-char hex string
  return /^[0-9a-f]{12}$/.test(last) ? last : null;
};
