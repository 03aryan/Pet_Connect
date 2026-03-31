require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

/* ── Import models (registers them with Mongoose) ── */
require("./models/User");
require("./models/Pet");
require("./models/StrayReport");
require("./models/Appointment");
require("./models/VetProfile");
require("./models/PetInquiry");

/* ── Initialize Express ─────────────────────────── */
const app = express();

/* ── Global middleware ──────────────────────────── */
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* ── Request logger (dev only) ──────────────────── */
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  });
}

/* ── Health check ───────────────────────────────── */
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/* ── API Routes ─────────────────────────────────── */
app.use("/api/auth", require("./routes/auth"));
app.use("/api/pets", require("./routes/pets"));
app.use("/api/strays", require("./routes/strays"));
app.use("/api/vets", require("./routes/vets"));

/* ── 404 catch-all ──────────────────────────────── */
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

/* ── Global error handler ───────────────────────── */
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err.stack || err.message);

  // Mongoose validation error → 400
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res
      .status(400)
      .json({ message: "Validation failed", errors: messages });
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({ message: `${field} already exists` });
  }

  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
  });
});

/* ── Start server ───────────────────────────────── */
const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`  Environment: ${process.env.NODE_ENV || "production"}`);
  });
};

start();
