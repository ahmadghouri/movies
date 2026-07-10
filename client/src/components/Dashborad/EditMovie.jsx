import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosbase from "../../../axiosbasa";
import { PlusCircle, Trash2, Film, Upload, Info, ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Spinner } from "../ui/spinner";
import { Skeleton } from "../ui/skeleton";
import { Switch } from "../ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../ui/select";
import { GenreMultiSelect } from "../ui/GenreMultiSelect";
import { LANGUAGES } from "../../lib/languages";
import { GENRES } from "../../lib/genres";
import { showSuccess } from "../../lib/toast";

/* ── extract src from <iframe> or return plain URL ── */
const extractPlayerUrl = (raw) => {
  const trimmed = raw.trim();
  const match = trimmed.match(/src\s*=\s*["']([^"']+)["']/i);
  return match ? match[1].trim() : trimmed;
};

/* ── format date to yyyy-mm-dd for <input type="date"> ── */
const toDateInput = (val) => {
  if (!val) return "";
  try { return new Date(val).toISOString().split("T")[0]; }
  catch { return ""; }
};

const EditMovie = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);      // null = still loading
  const [isTopMovie, setIsTopMovie] = useState(false);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");

  /* ── Load existing movie data ── */
  useEffect(() => {
    axiosbase.get(`movie/getmovie/${id}`)
      .then((res) => {
        const m = res.data?.data ?? res.data;
        setForm({
          title:        m.title        ?? "",
          year:         m.year         ?? "",
          rating:       m.rating       ?? "",
          duration:     m.duration     ?? "",
          language:     m.language     ?? "",
          genres:       Array.isArray(m.genre) ? m.genre : [],
          releaseDate:  toDateInput(m.releaseDate),
          views:        m.views        ?? "",
          players:      m.players?.length ? m.players : [""],
          downloadLinks: m.downloadLinks?.length
            ? m.downloadLinks.map(d => ({
                provider: d.provider || "",
                quality:  d.quality  || "",
                episode:  d.episode  || "",
                url:      d.url      || "",
              }))
            : [{ provider: "", quality: "", episode: "", url: "" }],
        });
        setIsTopMovie(!!m.isTopMovie);
        setPosterPreview(m.poster);
      })
      .catch(() => setError("Failed to load movie."))
      .finally(() => setFetching(false));
  }, [id]);

  const handleChange = (e) => {
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* Players */
  const handlePlayerChange = (i, val) => {
    const arr = [...form.players]; arr[i] = val;
    setForm((p) => ({ ...p, players: arr }));
  };
  const handlePlayerBlur = (i) => {
    const extracted = extractPlayerUrl(form.players[i]);
    if (extracted !== form.players[i]) {
      const arr = [...form.players]; arr[i] = extracted;
      setForm((p) => ({ ...p, players: arr }));
    }
  };
  const addPlayer    = () => setForm((p) => ({ ...p, players: [...p.players, ""] }));
  const removePlayer = (i) => setForm((p) => ({ ...p, players: p.players.filter((_, x) => x !== i) }));

  /* Download links */
  const handleDLChange = (i, field, val) => {
    const arr = [...form.downloadLinks]; arr[i] = { ...arr[i], [field]: val };
    setForm((p) => ({ ...p, downloadLinks: arr }));
  };
  const addDL    = () => setForm((p) => ({ ...p, downloadLinks: [...p.downloadLinks, { provider: "", quality: "", episode: "", url: "" }] }));
  const removeDL = (i) => setForm((p) => ({ ...p, downloadLinks: p.downloadLinks.filter((_, x) => x !== i) }));

  /* Poster */
  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowed.includes(file.type)) { setError("Only JPEG, PNG, WebP and GIF images are allowed."); return; }
    if (file.size > 5 * 1024 * 1024)  { setError("Image must be under 5MB."); return; }
    setPosterFile(file);
    setPosterPreview(URL.createObjectURL(file));
    setError("");
  };

  /* Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title.trim()) { setError("Title is required."); return; }

    const cleanedPlayers = form.players.map(extractPlayerUrl).filter(Boolean);

    const data = new FormData();
    if (posterFile) data.append("poster", posterFile);
    data.append("title",       form.title.trim());
    if (form.year)        data.append("year",        form.year);
    if (form.rating)      data.append("rating",      form.rating);
    if (form.duration)    data.append("duration",    form.duration);
    if (form.language)    data.append("language",    form.language);
    if (form.releaseDate) data.append("releaseDate", form.releaseDate);
    if (form.views !== "") data.append("views",      form.views);
    data.append("genre",         JSON.stringify(form.genres));
    data.append("players",       JSON.stringify(cleanedPlayers));
    data.append("downloadLinks", JSON.stringify(form.downloadLinks.filter((d) => d.url.trim())));
    data.append("isTopMovie",    String(isTopMovie));

    setLoading(true);
    try {
      await axiosbase.put(`movie/update/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      showSuccess("Movie updated successfully!");
      navigate("/admin-db/movies");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Loading skeleton ── */
  if (fetching) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    );
  }

  if (error && !form) {
    return (
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/admin-db/movies")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Movies
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6">
      {/* Back */}
      <Button variant="ghost" size="sm" className="mb-4 text-gray-400 hover:text-white"
        onClick={() => navigate("/admin-db/movies")}>
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Movies
      </Button>

      <Card className="border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Film className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Edit Movie</CardTitle>
              <CardDescription>Update the movie details below</CardDescription>
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

            {/* ── Basic Info ── */}
            <section aria-labelledby="edit-basic">
              <h3 id="edit-basic" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
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
                <div className="space-y-2">
                  <Label htmlFor="views">Views</Label>
                  <Input id="views" name="views" type="number" min="0" value={form.views}
                    onChange={handleChange} placeholder="0" disabled={loading} />
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

            {/* ── Poster ── */}
            <section aria-labelledby="edit-poster">
              <h3 id="edit-poster" className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Poster Image
              </h3>
              <div className="flex items-start gap-4">
                {posterPreview ? (
                  <img src={posterPreview} alt="Poster"
                    className="w-24 h-32 object-cover rounded-lg border border-gray-600 flex-shrink-0" />
                ) : (
                  <div className="w-24 h-32 bg-gray-700 rounded-lg border border-dashed border-gray-600
                                  flex items-center justify-center flex-shrink-0">
                    <Upload className="w-6 h-6 text-gray-500" />
                  </div>
                )}
                <div className="flex-1 space-y-2">
                  <Label htmlFor="poster">
                    Change Poster{" "}
                    <span className="text-gray-500 font-normal">(leave empty to keep current)</span>
                  </Label>
                  <Input id="poster" type="file" accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handlePosterChange} disabled={loading} className="cursor-pointer" />
                </div>
              </div>
            </section>

            <Separator />

            {/* ── Players ── */}
            <section aria-labelledby="edit-players">
              <div className="flex items-center justify-between mb-3">
                <h3 id="edit-players" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Video Players
                </h3>
                <Button type="button" variant="secondary" size="sm" onClick={addPlayer} disabled={loading}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Player
                </Button>
              </div>
              <div className="flex items-start gap-2 bg-blue-950/40 border border-blue-800/50 rounded-lg px-3 py-2 mb-3">
                <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-300">
                  Plain URL ya pura &lt;iframe&gt; tag — dono kaam karte hain.
                </p>
              </div>
              <div className="space-y-3">
                {form.players.map((player, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={player}
                      onChange={(e) => handlePlayerChange(i, e.target.value)}
                      onBlur={() => handlePlayerBlur(i)}
                      placeholder={`Player ${i + 1} — URL ya <iframe>`}
                      disabled={loading} aria-label={`Player ${i + 1}`} />
                    {form.players.length > 1 && (
                      <Button type="button" variant="destructive" size="icon"
                        onClick={() => removePlayer(i)} disabled={loading}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </section>

            <Separator />

            {/* ── Download Links ── */}
            <section aria-labelledby="edit-downloads">
              <div className="flex items-center justify-between mb-4">
                <h3 id="edit-downloads" className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                  Download Links
                </h3>
                <Button type="button" variant="secondary" size="sm" onClick={addDL} disabled={loading}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Add Provider Group
                </Button>
              </div>

              {(() => {
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
                          {/* Provider header */}
                          <div className="flex items-center gap-2 bg-gray-700 px-3 py-2">
                            <Input
                              placeholder="Provider name (e.g. Streamtape)"
                              value={grp.provider}
                              onChange={(e) => {
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

                          {/* Quality (shared) */}
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
                                    placeholder="Episode (optional)"
                                    value={link.episode || ""}
                                    onChange={(e) => handleDLChange(absIdx, "episode", e.target.value)}
                                    disabled={loading}
                                    className="w-44 shrink-0 bg-gray-800 border-gray-600 text-sm"
                                  />
                                  <Input
                                    placeholder="Download URL"
                                    value={link.url}
                                    onChange={(e) => handleDLChange(absIdx, "url", e.target.value)}
                                    disabled={loading}
                                    className="flex-1 bg-gray-800 border-gray-600 text-sm"
                                  />
                                  {form.downloadLinks.length > 1 && (
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="icon"
                                      onClick={() => removeDL(absIdx)}
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
                <span className="flex items-center gap-2"><Spinner size="sm" /> Saving…</span>
              ) : (
                <span className="flex items-center gap-2"><Film className="w-5 h-5" /> Save Changes</span>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditMovie;
