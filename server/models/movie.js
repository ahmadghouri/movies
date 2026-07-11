const mongoose = require("mongoose");
const { randomUUID } = require("crypto");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    unique: true,
    index: true,
    default: () => randomUUID().replace(/-/g, "").slice(0, 12), // e.g. "a1b2c3d4e5f6"
  },
  description: {
    type: String,
    default: "",
  },
  year: {
    type: String,
  },
  poster: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
  },
  duration: {
    type: String,
  },
  language: {
    type: String,
  },
  genre: [String],
  releaseDate: {
    type: Date,
  },
  views: {
    type: Number,
    default: 0,
  },
  isTopMovie: {
    type: Boolean,
    default: false,
    index: true,
  },
  isLatestMovie: {
    type: Boolean,
    default: false,
    index: true,
  },
  players: [String],
  trailerUrl: {
    type: String,
    default: "",
  },
  downloadLinks: [
    {
      provider: String,
      quality: String,
      episode: String,
      url: String,
    },
  ],
});

const Movies = mongoose.model("movie", movieSchema);

module.exports = Movies;
