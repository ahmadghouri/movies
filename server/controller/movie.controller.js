const Movies = require("../models/movie");
const cloudinary = require("../conf/cloudinary");
const fs = require("fs");

const handleCreateMovie = async (req, res) => {
  try {
    const file = req.file;
    const body = req.body;

    if (!file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const result = await cloudinary.uploader.upload(file.path);
    fs.unlinkSync(file.path); // remove local temp file

    if (!result.secure_url) {
      return res.status(500).json({ error: "Failed to upload to Cloudinary" });
    }

    const movieCreate = await Movies.create({
      ...body,
      genre: JSON.parse(body.genre || "[]"),
      players: JSON.parse(body.players || "[]"),
      downloadLinks: JSON.parse(body.downloadLinks || "[]"),
      poster: result.secure_url, // ✅ FULL Cloudinary image URL
    });

    return res.status(200).json(movieCreate);
  } catch (error) {
    console.log("Create Movie Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const handleGetMovie = async (req, res) => {
  try {
    const getMovie = await Movies.find().sort({ createdAt: -1 });
    return res.status(200).json(getMovie);
  } catch (error) {
    console.error("Get Movie Error:", error.message);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const handleMovieDetail = async (req, res) => {
  try {
    const getDetail = await Movies.findById(req.params.id);
    return res.status(200).json(getDetail);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  handleCreateMovie,
  handleGetMovie,
  handleMovieDetail,
};
