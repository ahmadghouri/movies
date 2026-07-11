/**
 * One-time migration: add slug to all movies that don't have one.
 * Run once: node scripts/addSlugs.js
 */
require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const mongoose = require("mongoose");
const { randomUUID } = require("crypto");
const Movies = require("../models/movie");

const generateSlug = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const movies = await Movies.find({ slug: { $in: [null, "", undefined] } });
  console.log(`Found ${movies.length} movies without slug`);

  let updated = 0;
  for (const movie of movies) {
    let slug = generateSlug();
    // ensure uniqueness
    let exists = await Movies.findOne({ slug });
    while (exists) {
      slug = generateSlug();
      exists = await Movies.findOne({ slug });
    }
    movie.slug = slug;
    await movie.save();
    updated++;
    console.log(`  ✓ "${movie.title}" → ${slug}`);
  }

  console.log(`\nDone! ${updated} movies updated.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
