const Movies = require("../models/movie");
const cloudinary = require("../conf/cloudinary");
const fs = require("fs");

// Helper — safely delete temp file
const removeTempFile = (filePath) => {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (_) {}
};

// POST /api/movie/create
const handleCreateMovie = async (req, res, next) => {
  const file = req.file;
  try {
    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "Poster image is required." });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "moviemania/posters",
      resource_type: "image",
      transformation: [{ quality: "auto", fetch_format: "auto" }],
    });

    removeTempFile(file.path);

    if (!result?.secure_url) {
      return res.status(500).json({
        success: false,
        message: "Image upload failed. Please try again.",
      });
    }

    // Safely parse JSON fields from multipart form
    let genre = [];
    let players = [];
    let downloadLinks = [];

    try {
      genre = JSON.parse(req.body.genre || "[]");
      players = JSON.parse(req.body.players || "[]");
      downloadLinks = JSON.parse(req.body.downloadLinks || "[]");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Invalid JSON in genre, players, or downloadLinks.",
      });
    }

    // Filter empty player URLs and download links
    const safePlayers = players.filter((p) => typeof p === "string" && p.trim());
    const safeDownloadLinks = downloadLinks.filter(
      (d) => d && typeof d === "object" && d.url
    );

    const movie = await Movies.create({
      title: req.body.title,
      description: req.body.description || "",
      year: req.body.year,
      rating: req.body.rating ? Number(req.body.rating) : undefined,
      duration: req.body.duration,
      language: req.body.language,
      genre,
      releaseDate: req.body.releaseDate || undefined,
      views: req.body.views ? Number(req.body.views) : 0,
      isTopMovie: req.body.isTopMovie === "true" || req.body.isTopMovie === true,
      players: safePlayers,
      downloadLinks: safeDownloadLinks,
      poster: result.secure_url,
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully.",
      data: movie,
    });
  } catch (error) {
    removeTempFile(file?.path);
    next(error);
  }
};

// GET /api/movie/getmovie
const handleGetMovie = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [movies, total] = await Promise.all([
      Movies.find().sort({ _id: -1 }).skip(skip).limit(limit).lean(),
      Movies.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: movies,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/movie/getmovie/:id
const handleMovieDetail = async (req, res, next) => {
  try {
    const movie = await Movies.findById(req.params.id).lean();
    if (!movie) {
      return res
        .status(404)
        .json({ success: false, message: "Movie not found." });
    }
    return res.status(200).json({ success: true, data: movie });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/movie/view/:id  — increment views by 1 (fire-and-forget from client)
const handleIncrementView = async (req, res, next) => {
  try {
    await Movies.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: false }
    );
    return res.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};

// GET /api/movie/genres — distinct genre list from all movies
const handleGetGenres = async (req, res, next) => {
  try {
    const genres = await Movies.distinct("genre");
    const clean = genres
      .filter((g) => typeof g === "string" && g.trim())
      .map((g) => g.trim())
      .sort((a, b) => a.localeCompare(b));
    return res.status(200).json({ success: true, data: clean });
  } catch (error) {
    next(error);
  }
};

// GET /api/movie/top — top movies (isTopMovie: true)
const handleGetTopMovies = async (req, res, next) => {
  try {
    const movies = await Movies.find({ isTopMovie: true })
      .sort({ _id: -1 })
      .select("_id title poster views year isTopMovie")
      .lean();
    return res.status(200).json({ success: true, data: movies });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/movie/toggle-top/:id — admin only, toggle isTopMovie
const handleToggleTopMovie = async (req, res, next) => {
  try {
    const movie = await Movies.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }
    movie.isTopMovie = !movie.isTopMovie;
    await movie.save();
    return res.status(200).json({
      success: true,
      message: `Movie ${movie.isTopMovie ? "added to" : "removed from"} Top Movies.`,
      data: { _id: movie._id, isTopMovie: movie.isTopMovie },
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/movie/update/:id — admin only, poster is optional
const handleUpdateMovie = async (req, res, next) => {
  const file = req.file;
  try {
    const movie = await Movies.findById(req.params.id);
    if (!movie) {
      removeTempFile(file?.path);
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    let posterUrl = movie.poster; // keep existing by default

    // If a new poster was uploaded, replace on Cloudinary
    if (file) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "moviemania/posters",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      removeTempFile(file.path);

      if (!result?.secure_url) {
        return res.status(500).json({ success: false, message: "Image upload failed." });
      }

      // Delete old image from Cloudinary (best-effort — don't fail if it errors)
      if (movie.poster) {
        try {
          const oldPublicId = movie.poster
            .split("/")
            .slice(-2)
            .join("/")
            .replace(/\.[^.]+$/, "");
          await cloudinary.uploader.destroy(oldPublicId);
        } catch (_) {}
      }

      posterUrl = result.secure_url;
    }

    // Parse array fields
    let genre = movie.genre;
    let players = movie.players;
    let downloadLinks = movie.downloadLinks;

    try {
      if (req.body.genre !== undefined)        genre        = JSON.parse(req.body.genre);
      if (req.body.players !== undefined)      players      = JSON.parse(req.body.players);
      if (req.body.downloadLinks !== undefined) downloadLinks = JSON.parse(req.body.downloadLinks);
    } catch {
      return res.status(400).json({ success: false, message: "Invalid JSON in genre, players, or downloadLinks." });
    }

    const updated = await Movies.findByIdAndUpdate(
      req.params.id,
      {
        title:         req.body.title        ?? movie.title,
        description:   req.body.description  ?? movie.description,
        year:          req.body.year         ?? movie.year,
        rating:        req.body.rating !== undefined ? Number(req.body.rating) : movie.rating,
        duration:      req.body.duration     ?? movie.duration,
        language:      req.body.language     ?? movie.language,
        releaseDate:   req.body.releaseDate  ? new Date(req.body.releaseDate) : movie.releaseDate,
        views:         req.body.views !== undefined ? Number(req.body.views) : movie.views,
        isTopMovie:    req.body.isTopMovie !== undefined
                         ? (req.body.isTopMovie === "true" || req.body.isTopMovie === true)
                         : movie.isTopMovie,
        genre,
        players:       players.filter((p) => typeof p === "string" && p.trim()),
        downloadLinks: downloadLinks.filter((d) => d && typeof d === "object" && d.url),
        poster:        posterUrl,
      },
      { new: true }
    );

    return res.status(200).json({ success: true, message: "Movie updated successfully.", data: updated });
  } catch (error) {
    removeTempFile(file?.path);
    next(error);
  }
};

// DELETE /api/movie/delete/:id — admin only
const handleDeleteMovie = async (req, res, next) => {
  try {
    const movie = await Movies.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ success: false, message: "Movie not found." });
    }

    // Remove poster from Cloudinary (best-effort)
    if (movie.poster) {
      try {
        const publicId = movie.poster
          .split("/")
          .slice(-2)
          .join("/")
          .replace(/\.[^.]+$/, "");
        await cloudinary.uploader.destroy(publicId);
      } catch (_) {}
    }

    await Movies.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: "Movie deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  handleCreateMovie,
  handleGetMovie,
  handleMovieDetail,
  handleIncrementView,
  handleGetGenres,
  handleGetTopMovies,
  handleToggleTopMovie,
  handleUpdateMovie,
  handleDeleteMovie,
};
