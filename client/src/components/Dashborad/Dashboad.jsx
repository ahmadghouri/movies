import React, { useState } from "react";
import axios from "../../../axiosbasa";

const CreateMovieForm = () => {
  const [form, setForm] = useState({
    title: "",
    year: "",
    rating: "",
    duration: "",
    language: "",
    genre: "",
    releaseDate: "",
    views: "",
    players: ["", "", ""],
    downloadLinks: [{ provider: "", quality: "", url: "" }],
  });

  const [posterFile, setPosterFile] = useState(null);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...form.players];
    newPlayers[index] = value;
    setForm((prev) => ({ ...prev, players: newPlayers }));
  };

  const handleDownloadChange = (index, field, value) => {
    const updatedLinks = [...form.downloadLinks];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setForm((prev) => ({ ...prev, downloadLinks: updatedLinks }));
  };

  const addDownloadLink = () => {
    setForm((prev) => ({
      ...prev,
      downloadLinks: [
        ...prev.downloadLinks,
        { provider: "", quality: "", url: "" },
      ],
    }));
  };

  const removeDownloadLink = (index) => {
    const newLinks = [...form.downloadLinks];
    newLinks.splice(index, 1);
    setForm((prev) => ({ ...prev, downloadLinks: newLinks }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("poster", posterFile);

    data.append("title", form.title);
    data.append("year", form.year);
    data.append("rating", form.rating);
    data.append("duration", form.duration);
    data.append("language", form.language);
    data.append("releaseDate", form.releaseDate);
    data.append("views", form.views);
    data.append(
      "genre",
      JSON.stringify(form.genre.split(",").map((g) => g.trim()))
    );
    data.append("players", JSON.stringify(form.players));
    data.append("downloadLinks", JSON.stringify(form.downloadLinks));

    try {
      const res = await axios.post("/movie/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Movie created successfully!");
    } catch (err) {
      console.error(err);
      alert("Error creating movie");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto bg-white shadow-md p-6 rounded space-y-4"
    >
      <h2 className="text-xl font-bold">Add New Movie</h2>

      <input
        name="title"
        onChange={handleChange}
        placeholder="Title"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="year"
        onChange={handleChange}
        placeholder="Year"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="rating"
        onChange={handleChange}
        type="number"
        placeholder="Rating"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="duration"
        onChange={handleChange}
        placeholder="Duration"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="language"
        onChange={handleChange}
        placeholder="Language"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="genre"
        onChange={handleChange}
        placeholder="Genre (comma separated)"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="releaseDate"
        onChange={handleChange}
        type="date"
        className="w-full border px-3 py-2 rounded"
      />
      <input
        name="views"
        onChange={handleChange}
        type="number"
        placeholder="Views"
        className="w-full border px-3 py-2 rounded"
      />

      <div>
        <label className="block mb-1">Poster Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPosterFile(e.target.files[0])}
          className="w-full border px-3 py-2 rounded"
          required
        />
      </div>

      <div>
        <label className="block mb-1">Players</label>
        {form.players.map((player, index) => (
          <input
            key={index}
            value={player}
            onChange={(e) => handlePlayerChange(index, e.target.value)}
            placeholder={`Player ${index + 1} URL`}
            className="w-full border px-3 py-2 rounded mb-2"
          />
        ))}
      </div>

      <div>
        <label className="block font-medium">Download Links</label>
        {form.downloadLinks.map((link, index) => (
          <div
            key={index}
            className="mb-4 border p-3 rounded bg-gray-50 relative"
          >
            <input
              type="text"
              placeholder="Provider"
              value={link.provider}
              onChange={(e) =>
                handleDownloadChange(index, "provider", e.target.value)
              }
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <input
              type="text"
              placeholder="Quality"
              value={link.quality}
              onChange={(e) =>
                handleDownloadChange(index, "quality", e.target.value)
              }
              className="w-full border px-3 py-2 rounded mb-2"
            />
            <input
              type="text"
              placeholder="URL"
              value={link.url}
              onChange={(e) =>
                handleDownloadChange(index, "url", e.target.value)
              }
              className="w-full border px-3 py-2 rounded"
            />
            {form.downloadLinks.length > 1 && (
              <button
                type="button"
                onClick={() => removeDownloadLink(index)}
                className="absolute top-1 right-1 text-red-500"
              >
                ❌
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addDownloadLink}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          + Add Download Link
        </button>
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Submit
      </button>
    </form>
  );
};

export default CreateMovieForm;
