import React, { useState } from "react";
import { Mail, Phone, User, MessageSquare, Send, ArrowLeft } from "lucide-react";
import axiosbase from "../../axiosbasa";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Spinner } from "../components/ui/spinner";
import { showSuccess } from "../lib/toast";
import Footer from "../components/Footer";
import useSEO from "../lib/useSEO";
import { useSiteSettings } from "../context/SiteSettingsContext";

export default function ContactForm() {
  const navigate = useNavigate();
  const { siteName } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useSEO({
    title: "Contact Us",
    description: `Have a question or feedback? Get in touch with the ${siteName} team. We'd love to hear from you.`,
    url: window.location.origin + "/contact",
    siteName,
    jsonLd: {
      "@context": "https://schema.org",
      "@type": "ContactPage",
      name: `Contact — ${siteName}`,
      url: window.location.origin + "/contact",
    },
  });

  const handleChange = (e) => {
    setError("");
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await axiosbase.post("/contect", formData);
      showSuccess("Message sent successfully!");
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-10 px-4 flex flex-col">
      <div className="max-w-2xl mx-auto space-y-6 flex-1 w-full">
        {/* Back button */}
        <Button variant="ghost" asChild className="text-gray-400 hover:text-white">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" />
            Back to Movies
          </Link>
        </Button>

        <Card className="border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Contact Us</CardTitle>
            <CardDescription>
              Have a question or feedback? We&apos;d love to hear from you.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6" role="alert">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="grid sm:grid-cols-2 gap-5">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="Your name"
                      required
                      minLength={2}
                      maxLength={60}
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
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
                      placeholder="you@example.com"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                      aria-hidden="true"
                    />
                    <Input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="pl-9"
                      placeholder="+92 300 1234567"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Subject */}
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="How can we help?"
                    required
                    minLength={3}
                    maxLength={120}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <div className="relative">
                  <MessageSquare
                    className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <Textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    className="pl-9 min-h-[120px]"
                    placeholder="Tell us more about your inquiry…"
                    required
                    minLength={10}
                    maxLength={2000}
                    disabled={loading}
                    rows={5}
                  />
                </div>
                <p className="text-xs text-gray-500 text-right">
                  {formData.message.length}/2000
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading} aria-busy={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner size="sm" /> Sending…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" aria-hidden="true" />
                    Send Message
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
