import React, { useState, useEffect } from "react";
import { Mail, Lock, Eye, EyeOff, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosbase from "../../axiosbasa";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Spinner } from "../components/ui/spinner";
import { showSuccess } from "../lib/toast";
import { useSiteSettings } from "../context/SiteSettingsContext";

const Signin = () => {
  const navigate = useNavigate();
  const { siteName } = useSiteSettings();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent search engines from indexing this page
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosbase.post("/signin", formData);
      showSuccess("Signed in successfully!");
      navigate("/admin-db/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Card className="w-full max-w-md border-gray-700 bg-gray-800/80 backdrop-blur">
        <CardHeader className="text-center space-y-3">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center mx-auto">
            <Film className="w-7 h-7 text-white" aria-hidden="true" />
          </div>
          <CardTitle className="text-2xl text-white">{siteName}</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4" role="alert">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="admin@example.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  aria-hidden="true"
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-9 pr-10"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Spinner size="sm" /> Signing in…
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>


        </CardContent>
      </Card>
    </div>
  );
};

export default Signin;
