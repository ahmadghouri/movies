const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
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
