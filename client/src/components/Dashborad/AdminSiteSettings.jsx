import React, { useState } from "react";
import axiosbase from "../../../axiosbasa";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Spinner } from "../ui/spinner";
import { Settings } from "lucide-react";
import { showSuccess } from "../../lib/toast";
import { useSiteSettings } from "../../context/SiteSettingsContext";

const AdminSiteSettings = () => {
  const { siteName, setSiteName } = useSiteSettings();
  const [value, setValue] = useState(siteName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Keep input in sync if context loads after mount
  React.useEffect(() => {
    setValue(siteName);
  }, [siteName]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!value.trim()) {
      setError("Site name cannot be empty.");
      return;
    }
    setLoading(true);
    try {
      const res = await axiosbase.put("/admin/site-settings", {
        siteName: value.trim(),
      });
      const updated = res.data?.data?.siteName;
      if (updated) {
        setSiteName(updated); // update context → all components update instantly
        setValue(updated);
      }
      showSuccess("Site name updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-xl mx-auto px-4 py-10">
      <Card className="border-gray-700">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-white">Site Settings</CardTitle>
              <CardDescription>
                Change the site name — it will update in the navbar, footer, and login page.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={value}
                onChange={(e) => { setError(""); setValue(e.target.value); }}
                placeholder="e.g. MovieMania"
                disabled={loading}
                maxLength={60}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-xs text-gray-500">
                This name appears in the top navbar logo and footer copyright.
              </p>
            </div>

            {/* Live preview */}
            <div className="rounded-lg border border-gray-700 bg-gray-800/50 px-4 py-3">
              <p className="text-xs text-gray-400 mb-1">Preview</p>
              <p className="text-white font-bold text-lg">{value || "—"}</p>
              <p className="text-gray-500 text-xs mt-1">
                © {new Date().getFullYear()} {value || "—"}. All rights reserved.
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {loading
                ? <span className="flex items-center gap-2"><Spinner size="sm" /> Saving…</span>
                : "Save Changes"
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
};

export default AdminSiteSettings;
