import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";

const ROOT = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(path.join(ROOT, "videos"), { recursive: true });
fs.mkdirSync(path.join(ROOT, "imports"), { recursive: true });

const videoStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(ROOT, "videos")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(12)}${ext}`);
  }
});

const excelStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(ROOT, "imports")),
  filename: (_req, file, cb) => cb(null, `${nanoid(12)}.xlsx`)
});

export const uploadVideo = multer({
  storage: videoStore,
  limits: { fileSize: (Number(process.env.MAX_VIDEO_MB) || 500) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(mp4|webm|mov|mkv)$/i.test(file.originalname);
    cb(ok ? null : new Error("Format video tidak didukung"), ok);
  }
});

export const uploadExcel = multer({
  storage: excelStore,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.xlsx?$/i.test(file.originalname);
    cb(ok ? null : new Error("Hanya file Excel"), ok);
  }
});