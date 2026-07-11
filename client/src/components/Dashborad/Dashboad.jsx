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
import { Switch } from "../ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { GenreMultiSelect } from "../ui/GenreMultiSelect";
import { LANGUAGES } from "../../lib/languages";
import { GENRES } from "../../lib/genres";
import { showSuccess } from "../../lib/toast";

const INITIAL_FORM = {
  title: "",
  rating: "",
  duration: "",
  language: "",
  genres: [],
  releaseDate: "",
  trailerUrl: "",
  players: [""],
  downloadLinks: [{ provider: "", quality: "", episode: "", url: "" }],
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
  const [isTopMovie, setIsTopMovie] = useState(false);
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
      downloadLinks: [...prev.downloadLinks, { provider: "", quality: "", episode: "", url: "" }],
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
    if (form.rating) data.append("rating", form.rating);
    if (form.duration) data.append("duration", form.duration);
    if (form.language) data.append("language", form.language);
    if (form.releaseDate) data.append("releaseDate", form.releaseDate);
    data.append("genre", JSON.stringify(form.genres));
    data.append("players", JSON.stringify(cleanedPlayers));
    if (form.trailerUrl?.trim()) data.append("trailerUrl", extractPlayerUrl(form.trailerUrl.trim()));
    data.append(
      "downloadLinks",
      JSON.stringify(form.downloadLinks.filter((d) => d.url.trim()))
    );
    data.append("isTopMovie", String(isTopMovie));

    setLoading(true);
    try {
      await axios.post("/movie/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Movie created successfully!");
      setForm(INITIAL_FORM);
      setIsTopMovie(false);
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
                  <Select
                    value={form.language}
                    onValueChange={(val) =>
                      setForm((prev) => ({ ...prev, language: val }))
                    }
                    disabled={loading}
                  >
                    <SelectTrigger id="language" aria-label="Select language">
                      <SelectValue placeholder="Select language…" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>Genres</Label>
                  <GenreMultiSelect
                    value={form.genres}
                    onChange={(val) => setForm((prev) => ({ ...prev, genres: val }))}
                    genres={GENRES}
                    disabled={loading}
                    placeholder="Select genres…"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="releaseDate">Release Date</Label>
                  <Input id="releaseDate" name="releaseDate" type="date" value={form.releaseDate}
                    onChange={handleChange} disabled={loading} />
                </div>
                {/* Top Movie toggle */}
                <div className="sm:col-span-2 flex items-center justify-between rounded-lg border border-gray-600 bg-gray-700/40 px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-white">Top Movie</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Show this movie in the Top Movies section on the homepage
                    </p>
                  </div>
                  <Switch
                    id="isTopMovie"
                    checked={isTopMovie}
                    onCheckedChange={setIsTopMovie}
                    disabled={loading}
                    aria-label="Mark as Top Movie"
                  />
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

            {/* ── Trailer ──────────────────────────────────── */}
            <section aria-labelledby="trailer-heading">
              <h3 id="trailer-heading" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Movie Trailer
              </h3>
              <div className="space-y-2">
                <Label htmlFor="trailerUrl">YouTube / Trailer URL</Label>
                <Input
                  id="trailerUrl"
                  name="trailerUrl"
                  value={form.trailerUrl}
                  onChange={handleChange}
                  placeholder="https://www.youtube.com/watch?v=... ya embed link"
                  disabled={loading}
                />
                <p className="text-xs text-gray-500">
                  YouTube watch link, share link, ya embed URL — sab kaam karte hain.
                </p>
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
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Provider Group
                </Button>
              </div>

              {/* Group links by provider index for display */}
              {(() => {
                // Build groups: each "group" starts when provider changes
                // We track groups by first-link index so edits stay in sync
                const groups = [];
                form.downloadLinks.forEach((link, idx) => {
                  const prev = form.downloadLinks[idx - 1];
                  if (idx === 0 || link.provider !== prev.provider) {
                    groups.push({ startIdx: idx, provider: link.provider });
                  }
                });

                return (
                  <div className="space-y-4">
                    {groups.map((grp, grpIdx) => {
                      const nextGrpStart = groups[grpIdx + 1]?.startIdx ?? form.downloadLinks.length;
                      const grpLinks = form.downloadLinks.slice(grp.startIdx, nextGrpStart);

                      return (
                        <div key={grp.startIdx} className="border border-gray-600 rounded-lg overflow-hidden">
                          {/* Provider header row */}
                          <div className="flex items-center gap-2 bg-gray-700 px-3 py-2">
                            <Input
                              placeholder="Provider name (e.g. Streamtape)"
                              value={grp.provider}
                              onChange={(e) => {
                                // Update all links in this group with new provider name
                                const newLinks = [...form.downloadLinks];
                                for (let i = grp.startIdx; i < nextGrpStart; i++) {
                                  newLinks[i] = { ...newLinks[i], provider: e.target.value };
                                }
                                setForm(p => ({ ...p, downloadLinks: newLinks }));
                              }}
                              disabled={loading}
                              className="flex-1 bg-gray-800 border-gray-600 font-medium"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={loading}
                              onClick={() => {
                                // Add new link inside this provider group
                                const newLinks = [...form.downloadLinks];
                                newLinks.splice(nextGrpStart, 0, {
                                  provider: grp.provider,
                                  quality: grpLinks[0]?.quality || "",
                                  episode: "",
                                  url: "",
                                });
                                setForm(p => ({ ...p, downloadLinks: newLinks }));
                              }}
                              className="shrink-0 border-gray-500 text-gray-300 hover:text-white text-xs"
                            >
                              <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Link
                            </Button>
                          </div>

                          {/* Quality row (shared for group) */}
                          <div className="px-3 py-2 bg-gray-700/40 border-b border-gray-600">
                            <Input
                              placeholder="Quality (e.g. 1080p, 720p, 360p)"
                              value={grpLinks[0]?.quality || ""}
                              onChange={(e) => {
                                const newLinks = [...form.downloadLinks];
                                for (let i = grp.startIdx; i < nextGrpStart; i++) {
                                  newLinks[i] = { ...newLinks[i], quality: e.target.value };
                                }
                                setForm(p => ({ ...p, downloadLinks: newLinks }));
                              }}
                              disabled={loading}
                              className="bg-gray-800 border-gray-600"
                            />
                          </div>

                          {/* Individual links */}
                          <div className="divide-y divide-gray-700">
                            {grpLinks.map((link, relIdx) => {
                              const absIdx = grp.startIdx + relIdx;
                              return (
                                <div key={absIdx} className="flex items-center gap-2 px-3 py-2 bg-gray-800/40">
                                  <span className="text-gray-500 text-xs w-5 shrink-0 text-right">
                                    {relIdx + 1}.
                                  </span>
                                  <Input
                                    placeholder="Episode (e.g. Episode 1) — optional"
                                    value={link.episode || ""}
                                    onChange={(e) => handleDownloadChange(absIdx, "episode", e.target.value)}
                                    disabled={loading}
                                    className="w-44 shrink-0 bg-gray-800 border-gray-600 text-sm"
                                  />
                                  <Input
                                    placeholder="Download URL"
                                    value={link.url}
                                    onChange={(e) => handleDownloadChange(absIdx, "url", e.target.value)}
                                    disabled={loading}
                                    className="flex-1 bg-gray-800 border-gray-600 text-sm"
                                  />
                                  {form.downloadLinks.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => removeDownloadLink(absIdx)}
                                      disabled={loading}
                                      className="shrink-0"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
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
