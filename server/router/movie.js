const express = require("express");
const {
  handleCreateMovie,
  handleGetMovie,
  handleMovieDetail,
  handleMovieBySlug,
  handleIncrementView,
  handleGetGenres,
  handleGetTopMovies,
  handleToggleTopMovie,
  handleToggleLatestMovie,
  handleUpdateMovie,
  handleDeleteMovie,
} = require("../controller/movie.controller");
const { upload } = require("../middleware/multer");
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const { uploadLimiter, publicLimiter, apiLimiter } = require("../middleware/rateLimiter");
const { movieIdValidation, movieCreateValidation } = require("../middleware/validators");
const validate = require("../middleware/validate");

const movieRoutes = express.Router();

// Prevent search engines from indexing admin endpoints
const noIndex = (_req, res, next) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  next();
};

// ── Admin routes ──────────────────────────────────────────
movieRoutes.post(
  "/create",
  noIndex, authMiddleware, adminMiddleware,
  uploadLimiter, upload.single("poster"),
  movieCreateValidation, validate,
  handleCreateMovie
);

movieRoutes.put(
  "/update/:id",
  noIndex, authMiddleware, adminMiddleware,
  uploadLimiter, upload.single("poster"),
  movieIdValidation, movieCreateValidation, validate,
  handleUpdateMovie
);

movieRoutes.delete(
  "/delete/:id",
  noIndex, authMiddleware, adminMiddleware,
  apiLimiter, movieIdValidation, validate,
  handleDeleteMovie
);

movieRoutes.patch(
  "/toggle-top/:id",
  noIndex, authMiddleware, adminMiddleware,
  apiLimiter, movieIdValidation, validate,
  handleToggleTopMovie
);

movieRoutes.patch(
  "/toggle-latest/:id",
  noIndex, authMiddleware, adminMiddleware,
  apiLimiter, movieIdValidation, validate,
  handleToggleLatestMovie
);

// ── Public routes ─────────────────────────────────────────
movieRoutes.get("/genres",          publicLimiter, handleGetGenres);
movieRoutes.get("/top",             publicLimiter, handleGetTopMovies);
movieRoutes.get("/getmovie",        publicLimiter, handleGetMovie);
movieRoutes.get("/getmovie/:id",    publicLimiter, movieIdValidation, validate, handleMovieDetail);
movieRoutes.get("/slug/:slug",      publicLimiter, handleMovieBySlug);
movieRoutes.patch("/view/:id",      publicLimiter, movieIdValidation, validate, handleIncrementView);

module.exports = movieRoutes;
