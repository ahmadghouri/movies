/**
 * Admin Seeder
 * ─────────────────────────────────────────────────────────
 * Usage:  npm run seed:admin
 *
 * Reads admin credentials from environment variables:
 *   ADMIN_NAME     – display name
 *   ADMIN_EMAIL    – login email
 *   ADMIN_PASSWORD – plain-text password (hashed before storing)
 *
 * Behaviour:
 *   • If no admin exists yet          → creates one
 *   • If an admin with ADMIN_EMAIL exists → updates name & password
 *   • If a DIFFERENT admin email exists   → exits with an error (prevents duplicate admins)
 *   • Never stores or logs the plain-text password
 */

"use strict";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/user");

// ── 1. Validate required env vars ─────────────────────────
const REQUIRED = ["MONG_DB", "ADMIN_NAME", "ADMIN_EMAIL", "ADMIN_PASSWORD"];
const missing = REQUIRED.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(
    `[seed:admin] ✖  Missing required environment variables: ${missing.join(", ")}`
  );
  console.error(
    "[seed:admin]    Add them to your .env file and try again."
  );
  process.exit(1);
}

const ADMIN_NAME = process.env.ADMIN_NAME.trim();
const ADMIN_EMAIL = process.env.ADMIN_EMAIL.trim().toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// ── 2. Basic password safety check ────────────────────────
if (ADMIN_PASSWORD.length < 8) {
  console.error("[seed:admin] ✖  ADMIN_PASSWORD must be at least 8 characters.");
  process.exit(1);
}

// ── 3. Connect to MongoDB ──────────────────────────────────
async function run() {
  await mongoose.connect(process.env.MONG_DB);
  console.log("[seed:admin] ✔  Connected to MongoDB.");

  try {
    // Find any existing admin account
    const existingAdmin = await User.findOne({ isAdmin: true });

    if (existingAdmin) {
      const existingEmail = existingAdmin.email.toLowerCase();

      if (existingEmail !== ADMIN_EMAIL) {
        // A different admin already exists — refuse to create a duplicate
        console.error(
          "[seed:admin] ✖  An admin account already exists with a different email."
        );
        console.error(
          "[seed:admin]    Update ADMIN_EMAIL in .env to match that account, or manually remove it first."
        );
        process.exit(1);
      }

      // Same email — update name and password
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      existingAdmin.name = ADMIN_NAME;
      existingAdmin.password = hash;
      await existingAdmin.save();

      console.log(`[seed:admin] ✔  Admin account updated  →  ${ADMIN_EMAIL}`);
    } else {
      // No admin exists — create one
      const hash = await bcrypt.hash(ADMIN_PASSWORD, 12);
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password: hash,
        isAdmin: true,
      });

      console.log(`[seed:admin] ✔  Admin account created  →  ${ADMIN_EMAIL}`);
    }
  } finally {
    // Always close the connection and never leave the process hanging
    await mongoose.disconnect();
    console.log("[seed:admin] ✔  Done.");
  }
}

run().catch((err) => {
  console.error("[seed:admin] ✖  Unexpected error:", err.message);
  process.exit(1);
});
