const express = require("express");
const {
  handleCreateMovie,
  handleGetMovie,
  handleMovieDetail,
} = require("../controller/movie.controller");
const { upload } = require("../middleware/multer"); // multer middleware
const authMiddleware = require("../middleware/authMiddleware");

const movieRoutes = express.Router();

// 👇 Use multer middleware for single image
movieRoutes.post(
  "/create",
  authMiddleware,
  upload.single("poster"),
  handleCreateMovie
);
movieRoutes.get("/getmovie", handleGetMovie);
movieRoutes.get("/getmovie/:id", handleMovieDetail);

module.exports = movieRoutes;
