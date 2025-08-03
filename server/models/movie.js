const mongoose = require("mongoose");

const movieSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
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
  },
  players: [String],
  downloadLinks: [
    {
      provider: String,
      quality: String,
      url: String,
    },
  ],
});

const Movies = mongoose.model("movie", movieSchema);

module.exports = Movies;
