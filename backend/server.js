import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";
import path from "node:path";
import crypto from "node:crypto";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

import authRoutes from "./routes/auth.routes.js";
import chapterRoutes from "./routes/chapters.routes.js";
import quizRoutes from "./routes/quizzes.routes.js";
import flashRoutes from "./routes/flashcards.routes.js";
import badgeRoutes from "./routes/badges.routes.js";
import progressRoutes from "./routes/progress.routes.js";
import leaderboardRoutes from "./routes/leaderboard.routes.js";
import rewardsRoutes from "./routes/rewards.routes.js";
import uploadRoutes from "./routes/upload.routes.js";
import monthlyQuizRoutes from "./routes/monthly-quiz.routes.js";
import reportRoutes from "./routes/reports.routes.js";

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        "script-src-attr": ["'unsafe-inline'"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "style-src-elem": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "data:", "https://fonts.gstatic.com"],
        "img-src": ["'self'", "data:", "https:", "blob:"],
        "frame-src": [
          "'self'",
          "https://app.powerbi.com",
          "https://*.powerbi.com",
          "https://*.analysis.windows.net"
        ],
        "connect-src": [
          "'self'",
          "https://app.powerbi.com",
          "https://*.powerbi.com",
          "https://*.analysis.windows.net",
          "https://fonts.googleapis.com",
          "https://fonts.gstatic.com"
        ],
        "worker-src": ["'self'", "blob:"],
        "media-src": ["'self'", "https:", "blob:"]
      }
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
    frameguard: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(path.resolve(__dirname, process.env.UPLOAD_DIR || "uploads")));

app.use("/", express.static(path.join(__dirname, "../frontend")));

app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));
app.use("/api/auth", authRoutes);
app.use("/api/chapters", chapterRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/flashcards", flashRoutes);
app.use("/api/badges", badgeRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/rewards", rewardsRoutes);
app.use("/api/monthly-quiz", monthlyQuizRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/upload", uploadRoutes);

app.post("/api/demo/reset", async (req, res) => {
  const expected = process.env.DEMO_RESET_SECRET || "";
  if (!expected) return res.status(503).json({ ok: false, error: "DEMO_RESET_SECRET not configured" });
  const auth = String(req.headers.authorization || "");
  const provided = auth.startsWith("Bearer ") ? auth.slice(7).trim() : String(req.headers["x-demo-reset-secret"] || "");
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ ok: false, error: "Unauthorized" });
  }
  try {
    await execFileAsync(process.execPath, [path.join(__dirname, "deploy/migrate-locked.js"), "--force"], {
      cwd: __dirname,
      env: process.env,
      timeout: 120000,
    });
    return res.json({ ok: true, app: "cimory-academy-demo", reset_at: new Date().toISOString() });
  } catch (err) {
    console.error("Demo reset failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`✅ API & FE jalan di http://localhost:${port}`);
});