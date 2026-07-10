const dotenv = require("dotenv");
dotenv.config();

// ── Validate required env vars on startup ─────────────────
const REQUIRED_ENV = [
  "MONG_DB",
  "JWT_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`[STARTUP] Missing required environment variables: ${missing.join(", ")}`);
  process.exit(1);
}

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./conf/db");
const userRouter = require("./router/user");
const movieRoutes = require("./router/movie");
const commentRouter = require("./router/comment");
const contectRouter = require("./router/contect");
const navbarMenuRouter = require("./router/navbarMenu");
const siteSettingsRouter = require("./router/siteSettings");
const healthRouter = require("./router/health");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// ── Security headers ──────────────────────────────────────
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow Cloudinary images
    contentSecurityPolicy: false, // set manually or via frontend meta
  })
);

// ── CORS ──────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (Postman/curl) in development
      if (!origin && process.env.NODE_ENV !== "production") return cb(null, true);
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: Origin ${origin} not allowed.`));
    },
    credentials: true,
  })
);

// ── Request parsing ───────────────────────────────────────
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ── Logging ───────────────────────────────────────────────
if (process.env.NODE_ENV !== "test") {
  app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
}

// ── Database ──────────────────────────────────────────────
connectDB();

// ── Routes ────────────────────────────────────────────────
app.use("/health", healthRouter);
app.use("/api", userRouter);
app.use("/api/movie", movieRoutes);
app.use("/api/movie/:id/comments", commentRouter);
app.use("/api", contectRouter);
app.use("/api", navbarMenuRouter);
app.use("/api", siteSettingsRouter);

// ── 404 handler ───────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// ── Centralized error handler (must be last) ──────────────
app.use(errorHandler);

// ── Start server ──────────────────────────────────────────
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(
    `[Server] Running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
  );
});
