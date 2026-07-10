import React, { useState } from "react";
import axios from "../../../axiosbasa";
import { PlusCircle, Trash2, Film, Upload, Info } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { showSuccess } from "../../lib/toast";

const INITIAL_FORM = {
  title: "",
  year: "",
  rating: "",
  duration: "",
  language: "",
  genre: "",
  releaseDate: "",
  views: "",
  players: [""],
  downloadLinks: [{ provider: "", quality: "", url: "" }],
};

// ── Helper: extract src URL from a full <iframe> tag or return as-is ──
const extractPlayerUrl = (raw) => {
  const trimmed = raw.trim();
  // If it looks like an iframe tag, pull the src attribute value
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  if (match) return match[1].trim();
  return trimmed; // already a plain URL
};

const CreateMovieForm = () => {
  const [form, setForm] = useState(INITIAL_FORM);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePlayerChange = (index, value) => {
    const updated = [...form.players];
    updated[index] = value;
    setForm((prev) => ({ ...prev, players: updated }));
  };

  // When player input loses focus, auto-extract src from iframe if needed
  const handlePlayerBlur = (index) => {
    const raw = form.players[index];
    if (!raw) return;
    const extracted = extractPlayerUrl(raw);
    if (extracted !== raw) {
      const updated = [...form.players];
      updated[index] = extracted;
      setForm((prev) => ({ ...prev, players: updated }));
    }
  };

  const addPlayer = () =>
    setForm((prev) => ({ ...prev, players: [...prev.players, ""] }));

  const removePlayer = (index) =>
    setForm((prev) => ({
      ...prev,
      players: prev.players.filter((_, i) => i !== index),
    }));

  const handleDownloadChange = (index, field, value) => {
    const updated = [...form.downloadLinks];
    updated[index] = { ...updated[index], [field]: value };
    setForm((prev) => ({ ...prev, downloadLinks: updated }));
  };

  const addDownloadLink = () =>
    setForm((prev) => ({
      ...prev,
      downloadLinks: [...prev.downloadLinks, { provider: "", quality: "", url: "" }],
    }));

  const removeDownloadLink = (index) =>
    setForm((prev) => ({
      ...prev,
      downloadLinks: prev.downloadLinks.filter((_, i) => i !== index),
    }));

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) {
      setError("Only JPEG, PNG, WebP and GIF images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!posterFile) {
      setError("Please select a poster image.");
      return;
    }
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    // Extract src from any iframe tags before sending
    const cleanedPlayers = form.players
      .map((p) => extractPlayerUrl(p))
      .filter(Boolean);

    const data = new FormData();
    data.append("poster", posterFile);
    data.append("title", form.title.trim());
    if (form.year) data.append("year", form.year);
    if (form.rating) data.append("rating", form.rating);
    if (form.duration) data.append("duration", form.duration);
    if (form.language) data.append("language", form.language);
    if (form.releaseDate) data.append("releaseDate", form.releaseDate);
    if (form.views) data.append("views", form.views);
    data.append(
      "genre",
      JSON.stringify(form.genre.split(",").map((g) => g.trim()).filter(Boolean))
    );
    data.append("players", JSON.stringify(cleanedPlayers));
    data.append(
      "downloadLinks",
      JSON.stringify(form.downloadLinks.filter((d) => d.url.trim()))
    );

    setLoading(true);
    try {
      await axios.post("/movie/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Movie created successfully!");
      setForm(INITIAL_FORM);
      setPosterFile(null);
      setPosterPreview(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      <Card className="border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Add New Movie</CardTitle>
              <CardDescription>Fill in the details to publish a new movie</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-5" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>

            {/* ── Basic Info ─────────────────────────────── */}
            <section aria-labelledby="basic-info-heading">
              <h3 id="basic-info-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Basic Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" name="title" value={form.title} onChange={handleChange}
                    placeholder="Movie title" required disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" value={form.year} onChange={handleChange}
                    placeholder="2024" maxLength={4} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rating">Rating (0–10)</Label>
                  <Input id="rating" name="rating" type="number" min="0" max="10" step="0.1"
                    value={form.rating} onChange={handleChange} placeholder="7.5" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration</Label>
                  <Input id="duration" name="duration" value={form.duration} onChange={handleChange}
                    placeholder="2h 30m" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" name="language" value={form.language} onChange={handleChange}
                    placeholder="Hindi" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genre">Genres (comma separated)</Label>
                  <Input id="genre" name="genre" value={form.genre} onChange={handleChange}
                    placeholder="Action, Drama, Thriller" disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input id="releaseDate" name="releaseDate" type="date" value={form.releaseDate}
                    onChange={handleChange} disabled={loading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="views">Initial Views</Label>
                  <Input id="views" name="views" type="number" min="0" value={form.views}
                    onChange={handleChange} placeholder="0" disabled={loading} />
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Poster Upload ──────────────────────────── */}
            <section aria-labelledby="poster-heading">
              <h3 id="poster-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Poster Image
              </h3>
              <div className="flex items-start gap-4">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster preview"
                    className="w-24 h-32 object-cover rounded-lg border border-gray-600 flex-shrink-0" />
                ) : (
                  <div className="w-24 h-32 bg-gray-700 rounded-lg border border-dashed border-gray-600 flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="poster">
                    Select Image * <span className="text-gray-500 font-normal">(JPEG, PNG, WebP — max 5MB)</span>
                  </Label>
                  <Input id="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePosterChange} disabled={loading} className="cursor-pointer" />
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Video Players ──────────────────────────── */}
            <section aria-labelledby="players-heading">
              <div className="flex items-center justify-between mb-3">
                <h3 id="players-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Video Players
                </h3>
                <Button type="button" variant="secondary" size="sm" onClick={addPlayer} disabled={loading}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Player
                </Button>
              </div>

              {/* Tip box */}
              <div className="flex items-start gap-2 bg-blue-950/40 border border-blue-800/50 rounded-lg px-3 py-2 mb-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300 leading-relaxed">
                  Aap <strong>plain URL</strong> ya pura <strong>&lt;iframe&gt; tag</strong> dono paste kar sakte hain.
                  Jaise: <code className="bg-blue-900/50 px-1 rounded">https://streamtape.com/e/abc123/</code> ya
                  &nbsp;<code className="bg-blue-900/50 px-1 rounded">&lt;iframe src="..."&gt;&lt;/iframe&gt;</code>
                  — dono kaam karenge.
                </p>
              </div>

              <div className="space-y-3">
                {form.players.map((player, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={player}
                      onChange={(e) => handlePlayerChange(index, e.target.value)}
                      onBlur={() => handlePlayerBlur(index)}
                      placeholder={`Player ${index + 1} — URL ya <iframe> tag paste karein`}
                      disabled={loading}
                      aria-label={`Player ${index + 1}`}
                    />
                    {form.players.length > 1 && (
                      <Button type="button" variant="destructive" size="icon"
                        onClick={() => removePlayer(index)} disabled={loading}
                        aria-label={`Remove player ${index + 1}`}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* ── Download Links ─────────────────────────── */}
            <section aria-labelledby="download-heading">
              <div className="flex items-center justify-between mb-4">
                <h3 id="download-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Download Links
                </h3>
                <Button type="button" variant="secondary" size="sm" onClick={addDownloadLink} disabled={loading}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Link
                </Button>
              </div>
              <div className="space-y-3">
                {form.downloadLinks.map((link, index) => (
                  <div key={index} className="grid sm:grid-cols-3 gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
                    <Input placeholder="Provider (e.g. Google Drive)" value={link.provider}
                      onChange={(e) => handleDownloadChange(index, "provider", e.target.value)}
                      disabled={loading} aria-label={`Download ${index + 1} provider`} />
                    <Input placeholder="Quality (e.g. 1080p)" value={link.quality}
                      onChange={(e) => handleDownloadChange(index, "quality", e.target.value)}
                      disabled={loading} aria-label={`Download ${index + 1} quality`} />
                    <div className="flex gap-2">
                      <Input placeholder="Download URL" value={link.url}
                        onChange={(e) => handleDownloadChange(index, "url", e.target.value)}
                        disabled={loading} aria-label={`Download ${index + 1} URL`} />
                      {form.downloadLinks.length > 1 && (
                        <Button type="button" variant="destructive" size="icon"
                          onClick={() => removeDownloadLink(index)} disabled={loading}
                          aria-label={`Remove download link ${index + 1}`}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Button type="submit" className="w-full" size="lg" disabled={loading} aria-busy={loading}>
              {loading ? (
                <span className="flex items-center gap-2"><Spinner size="sm" /> Uploading…</span>
              ) : (
                <span className="flex items-center gap-2"><Film className="w-5 h-5" /> Publish Movie</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMovieForm;
