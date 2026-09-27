import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv"; 

dotenv.config();

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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createLegacyApp() {
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
  app.use("/uploads", express.static(path.join(__dirname, process.env.UPLOAD_DIR || "uploads")));

  // Rate limit khusus login
  app.use("/api/auth/login", rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }));

  // Semua routes Express lama
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

  // Error handler
  app.use((err, req, res, _next) => {
    console.error(err);
    res.status(err.status || 500).json({ error: err.message || "Server error" });
  });

  return app;
}