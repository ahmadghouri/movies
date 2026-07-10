const express = require("express");
const mongoose = require("mongoose");

const healthRouter = express.Router();

// GET /health — basic liveness
healthRouter.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  });
});

// GET /health/live — process alive
healthRouter.get("/live", (_req, res) => {
  res.status(200).json({ success: true, status: "alive" });
});

// GET /health/ready — db connectivity check
healthRouter.get("/ready", (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // 1 = connected
  if (dbState === 1) {
    return res.status(200).json({
      success: true,
      status: "ready",
      database: "connected",
    });
  }
  return res.status(503).json({
    success: false,
    status: "not ready",
    database: "disconnected",
  });
});

module.exports = healthRouter;
