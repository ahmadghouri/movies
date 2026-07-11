import React, { useState, useEffect } from "react";
import axiosbase from "../../../axiosbasa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import { Switch } from "../ui/switch";
import { Settings, Plus, Trash2, GripVertical, Link } from "lucide-react";
import { showSuccess, showError } from "../../lib/toast";
import { useSiteSettings } from "../../context/SiteSettingsContext";

// ── All supported platforms with display info ─────────────────────────────────
const PLATFORM_OPTIONS = [
  { value: "telegram",  label: "Telegram" },
  { value: "facebook",  label: "Facebook" },
  { value: "tiktok",    label: "TikTok" },
  { value: "whatsapp",  label: "WhatsApp" },
  { value: "youtube",   label: "YouTube" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter",   label: "Twitter / X" },
  { value: "website",   label: "Website" },
  { value: "discord",   label: "Discord" },
  { value: "pinterest", label: "Pinterest" },
  { value: "snapchat",  label: "Snapchat" },
  { value: "other",     label: "Other" },
];

const emptyLink = () => ({
  _id: `new_${Date.now()}_${Math.random()}`,
  platform: "telegram",
  url: "",
  label: "",
  isActive: true,
  order: 0,
});

// ── Single social link row ────────────────────────────────────────────────────
const SocialLinkRow = ({ link, index, onChange, onRemove }) => (
  <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-800 border border-gray-700 rounded-lg">
    <GripVertical className="w-4 h-4 text-gray-500 shrink-0" />

    {/* Platform select */}
    <select
      value={link.platform}
      onChange={(e) => onChange(index, "platform", e.target.value)}
      className="bg-gray-700 border border-gray-600 text-white text-sm rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[130px]"
    >
      {PLATFORM_OPTIONS.map((p) => (
        <option key={p.value} value={p.value}>{p.label}</option>
      ))}
    </select>

    {/* URL */}
    <Input
      value={link.url}
      onChange={(e) => onChange(index, "url", e.target.value)}
      placeholder="https://..."
      className="flex-1 min-w-[180px] bg-gray-700 border-gray-600 text-white text-sm"
    />

    {/* Custom label (optional) */}
    <Input
      value={link.label}
      onChange={(e) => onChange(index, "label", e.target.value)}
      placeholder="Custom label (optional)"
      className="w-44 bg-gray-700 border-gray-600 text-white text-sm"
    />

    {/* Order */}
    <Input
      type="number"
      value={link.order}
      onChange={(e) => onChange(index, "order", Number(e.target.value))}
      className="w-16 bg-gray-700 border-gray-600 text-white text-sm"
      placeholder="0"
      title="Display order"
    />

    {/* Active toggle */}
    <div className="flex flex-col items-center gap-0.5">
      <Switch
        checked={link.isActive}
        onCheckedChange={(v) => onChange(index, "isActive", v)}
        aria-label="Active"
      />
      <span className={`text-[9px] font-semibold ${link.isActive ? "text-green-400" : "text-gray-500"}`}>
        {link.isActive ? "On" : "Off"}
      </span>
    </div>

    {/* Remove */}
    <button
      type="button"
      onClick={() => onRemove(index)}
      className="text-red-400 hover:text-red-300 transition p-1 rounded hover:bg-red-900/30"
      aria-label="Remove"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const AdminSiteSettings = () => {
  const { siteName, setSiteName, socialLinks, setSocialLinks } = useSiteSettings();

  const [nameValue, setNameValue] = useState(siteName);
  const [links, setLinks] = useState(socialLinks);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Sync when context loads from server
  useEffect(() => { setNameValue(siteName); }, [siteName]);
  useEffect(() => { setLinks(socialLinks.map((l) => ({ ...l }))); }, [socialLinks]);

  const handleLinkChange = (index, field, value) => {
    setLinks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddLink = () => {
    setLinks((prev) => [...prev, { ...emptyLink(), order: prev.length }]);
  };

  const handleRemoveLink = (index) => {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!nameValue.trim()) {
      setError("Site name cannot be empty.");
      return;
    }

    // Validate URLs
    for (const link of links) {
      if (!link.url.trim()) {
        setError("All social links must have a URL.");
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axiosbase.put("/admin/site-settings", {
        siteName: nameValue.trim(),
        socialLinks: links.map((l, i) => ({
          platform: l.platform,
          url:      l.url.trim(),
          label:    l.label?.trim() || "",
          isActive: l.isActive,
          order:    l.order ?? i,
        })),
      });

      const updated = res.data?.data;
      if (updated?.siteName)    { setSiteName(updated.siteName); setNameValue(updated.siteName); }
      if (updated?.socialLinks) { setSocialLinks(updated.socialLinks); setLinks(updated.socialLinks); }

      showSuccess("Settings saved successfully!");
    } catch (err) {
      setError(err.message || "Failed to save.");
      showError("Failed to save settings.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">

      {/* ── Site Name Card ── */}
      <Card className="border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Site Settings</CardTitle>
              <CardDescription>
                Manage site name and social media links shown in the footer.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-5">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Site Name */}
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={nameValue}
                onChange={(e) => { setError(""); setNameValue(e.target.value); }}
                placeholder="e.g. PakMovie"
                disabled={loading}
                maxLength={60}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500">
                Appears in navbar, footer, and browser tab title.
              </p>
              {/* Live preview */}
              <div className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3 mt-1">
                <p className="text-xs text-gray-400 mb-1">Preview</p>
                <p className="text-white font-bold text-lg">{nameValue || "—"}</p>
                <p className="text-gray-500 text-xs mt-1">
                  © {new Date().getFullYear()} {nameValue || "—"}. All rights reserved.
                </p>
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-blue-400" />
                    Social Media Links
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    These icons appear in the footer. Toggle off to hide without deleting.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddLink}
                  disabled={loading}
                  className="border-gray-600 text-gray-300 hover:text-white shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Add Link
                </Button>
              </div>

              {/* Column headers */}
              {links.length > 0 && (
                <div className="hidden sm:grid grid-cols-[16px_130px_1fr_176px_64px_40px_32px] gap-2 px-3 text-[10px] text-gray-500 uppercase tracking-wider">
                  <span />
                  <span>Platform</span>
                  <span>URL</span>
                  <span>Label</span>
                  <span>Order</span>
                  <span>Active</span>
                  <span />
                </div>
              )}

              {links.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-700 rounded-lg text-gray-500 text-sm">
                  No social links yet. Click "Add Link" to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {[...links]
                    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    .map((link, index) => (
                      <SocialLinkRow
                        key={link._id ?? index}
                        link={link}
                        index={index}
                        onChange={handleLinkChange}
                        onRemove={handleRemoveLink}
                      />
                    ))}
                </div>
              )}
            </div>

            {/* Save */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading
                ? <span className="flex items-center gap-2"><Spinner size="sm" /> Saving…</span>
                : "Save All Settings"
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminSiteSettings;
