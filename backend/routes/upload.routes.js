import { Router } from "express";
import bcrypt from "bcryptjs";
import ExcelJS from "exceljs";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { nanoid } from "nanoid";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { uploadVideo, uploadExcel } from "../middleware/upload.js";
import { parseQuizExcel, parseFlashcardExcel, parseReportsExcel, buildTemplate } from "../services/excel.js";
import { query } from "../db/pool.js";

const r = Router();
r.use(requireAuth, requireAdmin);

r.post("/video", uploadVideo.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file" });
  res.json({ path: `uploads/videos/${req.file.filename}` });
});

const IMG_ROOT = process.env.UPLOAD_DIR || "uploads";
fs.mkdirSync(path.join(IMG_ROOT, "images"), { recursive: true });

const imageStore = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(IMG_ROOT, "images")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${nanoid(12)}${ext}`);
  }
});

const uploadImage = multer({
  storage: imageStore,
  limits: { fileSize: 5 * 1024 * 1024 }, 
  fileFilter: (_req, file, cb) => {
    const ok = /\.(jpg|jpeg|png|gif|webp)$/i.test(file.originalname);
    cb(ok ? null : new Error("Format gambar tidak didukung (jpg/png/gif/webp)"), ok);
  }
});

r.post("/image", uploadImage.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "Tidak ada file" });
  res.json({ path: `uploads/images/${req.file.filename}` });
});

r.post("/excel/quiz/preview", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    const parsed = await parseQuizExcel(req.file.path);
    res.json(parsed);
  } catch (e) { next(e); }
});

r.post("/excel/quiz/import", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const { chapterId } = req.body || {};
    if (!chapterId) return res.status(400).json({ error: "chapterId wajib" });

    const ch = await query("SELECT id FROM chapters WHERE id=$1", [chapterId]);
    if (ch.rowCount === 0) return res.status(404).json({ error: "Chapter tidak ditemukan" });

    const parsed = await parseQuizExcel(req.file.path);
    const sheet = parsed.sheets[0];
    if (!sheet) return res.status(400).json({ error: "Sheet kosong" });
    if (!sheet.questions || sheet.questions.length === 0) {
      return res.status(400).json({
        error: "Tidak ada soal valid di file. Cek kolom answer (harus a/b/c/d)."
      });
    }

    await query("DELETE FROM quizzes WHERE chapter_id=$1", [chapterId]);

    const info = await query(
      "INSERT INTO quizzes (chapter_id, title) VALUES ($1,$2) RETURNING id",
      [chapterId, sheet.title]
    );
    const quizId = info.rows[0].id;

    let i = 0;
    for (const q of sheet.questions) {
      await query(
        `INSERT INTO quiz_questions (quiz_id, q, options_json, answer_idx, explain, sort_order)
         VALUES ($1,$2,$3::jsonb,$4,$5,$6)`,
        [quizId, q.q, JSON.stringify(q.options), q.answer, q.explain, i++]
      );
    }

    res.json({ ok: true, count: sheet.questions.length });
  } catch (e) { next(e); }
});

r.post("/excel/monthly-quiz/import", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const { monthlyId } = req.body || {};
    if (!monthlyId) return res.status(400).json({ error: "monthlyId wajib" });

    const mq = await query("SELECT id, title FROM monthly_quizzes WHERE id=$1", [monthlyId]);
    if (mq.rowCount === 0) return res.status(404).json({ error: "Quiz bulanan tidak ditemukan" });

    const parsed = await parseQuizExcel(req.file.path);
    const sheet = parsed.sheets[0];
    if (!sheet) return res.status(400).json({ error: "Sheet kosong" });
    if (!sheet.questions || sheet.questions.length === 0) {
      return res.status(400).json({
        error: "Tidak ada soal valid di file. Cek kolom answer (harus a/b/c/d)."
      });
    }

    await query("DELETE FROM monthly_quiz_questions WHERE monthly_id=$1", [monthlyId]);

    let i = 0;
    for (const q of sheet.questions) {
      await query(
        `INSERT INTO monthly_quiz_questions (monthly_id, q, options_json, answer_idx, explain, sort_order)
         VALUES ($1,$2,$3::jsonb,$4,$5,$6)`,
        [monthlyId, q.q, JSON.stringify(q.options), q.answer, q.explain, i++]
      );
    }

    res.json({ ok: true, count: sheet.questions.length });
  } catch (e) { next(e); }
});

r.post("/excel/flashcards/import", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const parsed = await parseFlashcardExcel(req.file.path);
    const cards = parsed.cards || [];
    if (cards.length === 0) {
      return res.status(400).json({
        error: "Tidak ada kartu valid di file. Minimal kolom: emoji | front | back1"
      });
    }

    const maxRow = (await query("SELECT COALESCE(MAX(sort_order), -1) AS m FROM flashcards")).rows[0];
    let nextOrder = Number(maxRow.m) + 1;

    let added = 0;
    for (const c of cards) {
      const id = `fc_${Date.now().toString(36)}_${nextOrder}_${Math.random().toString(36).slice(2, 6)}`;
      await query(
        `INSERT INTO flashcards (id, emoji, front, back_json, sort_order)
         VALUES ($1,$2,$3,$4::jsonb,$5)`,
        [id, c.emoji || "💡", c.front, JSON.stringify(c.back || []), nextOrder]
      );
      nextOrder += 1;
      added += 1;
    }

    res.json({ ok: true, count: added });
  } catch (e) { next(e); }
});

r.post("/excel/users/import", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile(req.file.path);
    const ws = wb.worksheets[0];
    if (!ws) return res.status(400).json({ error: "Sheet kosong" });

    const rows = [];
    ws.eachRow({ includeEmpty: false }, (row) => {
      rows.push(row.values.slice(1).map((v) => (v == null ? "" : String(v).trim())));
    });
    if (rows.length < 2) return res.status(400).json({ error: "File kosong / tidak ada data" });

    let headerIdx = 0;
    let header = rows[0].map((h) => h.toLowerCase());
    for (let i = 0; i < Math.min(5, rows.length); i++) {
      const h = rows[i].map((x) => String(x).toLowerCase());
      if (h.some((x) => x.includes("email"))) { headerIdx = i; header = h; break; }
    }

    const idxName  = header.findIndex((h) => h.includes("nama") || h.includes("name"));
    const idxEmail = header.findIndex((h) => h.includes("email"));
    const idxPw    = header.findIndex((h) => h.includes("password") || h === "pw" || h.includes("sandi"));

    if (idxEmail === -1) return res.status(400).json({ error: "Kolom 'email' tidak ditemukan di header" });
    if (idxPw === -1)    return res.status(400).json({ error: "Kolom 'password' tidak ditemukan di header" });

    let created = 0, skipped = 0;
    const errors = [];

    for (let i = headerIdx + 1; i < rows.length; i++) {
      const row = rows[i];
      if (!row || !row[idxEmail]) continue;

      const email = String(row[idxEmail]).toLowerCase().trim();
      const password = String(row[idxPw] || "").trim();
      const name = (idxName >= 0 && row[idxName])
        ? String(row[idxName]).trim()
        : email.split("@")[0];

      if (!email.includes("@")) {
        errors.push({ row: i + 1, email, reason: "Email tidak valid" });
        continue;
      }
      if (password.length < 6) {
        errors.push({ row: i + 1, email, reason: "Password < 6 karakter" });
        continue;
      }

      try {
        const exists = await query("SELECT 1 FROM users WHERE email=$1", [email]);
        if (exists.rowCount) { skipped++; continue; }

        const hash = await bcrypt.hash(password, 10);
        await query(
          "INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,'user')",
          [email, hash, name]
        );
        created++;
      } catch (e) {
        errors.push({ row: i + 1, email, reason: e.message });
      }
    }

    res.json({ created, skipped, errors });
  } catch (e) { next(e); }
});

function autoSlug(t) {
  return String(t || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

r.post("/excel/reports/preview", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });
    const parsed = await parseReportsExcel(req.file.path);
    res.json(parsed);
  } catch (e) { next(e); }
});

r.post("/excel/reports/import", uploadExcel.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: "File tidak ditemukan" });

    const parsed = await parseReportsExcel(req.file.path);
    const reports = parsed.reports || [];
    if (reports.length === 0) {
      return res.status(400).json({
        error: "Tidak ada report valid. Minimal kolom: title, embed_url"
      });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const rep of reports) {
      let slug = rep.slug || autoSlug(rep.title);

      let finalSlug = slug;
      let attempt = 1;
      while (true) {
        const exists = await query("SELECT 1 FROM reports WHERE slug=$1", [finalSlug]);
        if (exists.rowCount === 0) break;
        attempt++;
        finalSlug = `${slug}-${attempt}`;
        if (attempt > 50) {
          errors.push({ title: rep.title, reason: "Gagal generate slug unik" });
          finalSlug = null;
          break;
        }
      }

      if (!finalSlug) {
        skipped++;
        continue;
      }

      let url = rep.embedUrl;
      if (url.toLowerCase().startsWith("<iframe")) {
        const m = url.match(/src\s*=\s*["']([^"']+)["']/i);
        if (m) url = m[1];
      }
      url = url.replace(/^["']|["']$/g, "").trim();

      if (!url.startsWith("http")) {
        errors.push({ title: rep.title, reason: "Embed URL tidak valid" });
        continue;
      }

      try {
        const info = await query(
          `INSERT INTO reports (slug, title, description, embed_url, icon, sort_order, created_by)
           VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
          [
            finalSlug,
            rep.title,
            rep.description || null,
            url,
            rep.icon || "📊",
            rep.sort_order || 0,
            req.user.id
          ]
        );

        const reportId = info.rows[0].id;

        if (rep.access_emails && rep.access_emails.length > 0) {
          const userRows = await query(
            `SELECT id, email FROM users WHERE role='user' AND LOWER(email) = ANY($1::text[])`,
            [rep.access_emails]
          );

          const foundEmails = new Set(userRows.rows.map((u) => u.email.toLowerCase()));
          const notFound = rep.access_emails.filter((e) => !foundEmails.has(e));

          for (const u of userRows.rows) {
            try {
              await query(
                `INSERT INTO report_access (report_id, user_id, granted_by)
                 VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
                [reportId, u.id, req.user.id]
              );
            } catch {}
          }

          if (notFound.length > 0) {
            errors.push({
              title: rep.title,
              reason: `Email nggak ditemukan: ${notFound.join(", ")}`
            });
          }
        }

        created++;
      } catch (e) {
        errors.push({ title: rep.title, reason: e.message });
      }
    }

    res.json({ created, skipped, errors });
  } catch (e) { next(e); }
});

r.get("/excel/template/:type", async (req, res, next) => {
  try {
    const { type } = req.params;

    if (type === "users") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Users");
      ws.columns = [
        { header: "name",     key: "name",     width: 28 },
        { header: "email",    key: "email",    width: 36 },
        { header: "password", key: "password", width: 20 }
      ];
      ws.addRow({ name: "Budi Santoso", email: "budi@cimory.com", password: "rahasia123" });
      ws.addRow({ name: "Siti Aminah",  email: "siti@cimory.com", password: "rahasia456" });
      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="template-users.xlsx"`);
      return res.send(Buffer.from(buf));
    }

    if (type === "reports") {
      const wb = new ExcelJS.Workbook();
      const ws = wb.addWorksheet("Reports");

      ws.columns = [
        { header: "title",         key: "title",         width: 28 },
        { header: "slug",          key: "slug",          width: 22 },
        { header: "description",   key: "description",   width: 35 },
        { header: "embed_url",     key: "embed_url",     width: 55 },
        { header: "icon",          key: "icon",          width: 8  },
        { header: "sort_order",    key: "sort_order",    width: 12 },
        { header: "access_emails", key: "access_emails", width: 50 }
      ];

      ws.addRow({
        title: "Sales Dashboard",
        slug: "sales-dashboard",
        description: "Dashboard penjualan bulanan",
        embed_url: "https://app.powerbi.com/view?r=eyJrIjoi...",
        icon: "📊",
        sort_order: 1,
        access_emails: "budi@cimory.com, siti@cimory.com, andi@cimory.com"
      });

      ws.addRow({
        title: "HR Report",
        slug: "",
        description: "Laporan HR (slug auto-generate)",
        embed_url: "https://app.powerbi.com/view?r=eyJrIjoi...",
        icon: "👥",
        sort_order: 2,
        access_emails: ""
      });

      const headerRow = ws.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B40D6" }
      };
      headerRow.alignment = { vertical: "middle", horizontal: "center" };

      ws.columns.forEach((col) => {
        let maxLen = col.header ? String(col.header).length : 10;
        col.eachCell({ includeEmpty: false }, (cell) => {
          const v = cell.value ? String(cell.value) : "";
          if (v.length > maxLen) maxLen = v.length;
        });
        col.width = Math.min(Math.max(maxLen + 2, 12), 60);
      });

      const infoWs = wb.addWorksheet("Info");
      infoWs.columns = [
        { header: "Kolom",      width: 20 },
        { header: "Keterangan", width: 80 }
      ];
      infoWs.addRow(["title",         "Wajib. Judul report"]);
      infoWs.addRow(["slug",          "Opsional. Kalau kosong, auto-generate dari title"]);
      infoWs.addRow(["description",   "Opsional. Deskripsi singkat"]);
      infoWs.addRow(["embed_url",     "Wajib. URL Power BI Publish to Web, atau paste full iframe code"]);
      infoWs.addRow(["icon",          "Opsional. Emoji (default: 📊)"]);
      infoWs.addRow(["sort_order",    "Opsional. Angka urutan (default: 0)"]);
      infoWs.addRow(["access_emails", "Opsional. List email yang boleh akses, dipisah koma (,). Contoh: budi@cimory.com, siti@cimory.com"]);

      const infoHeader = infoWs.getRow(1);
      infoHeader.font = { bold: true, color: { argb: "FFFFFFFF" } };
      infoHeader.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF3B40D6" }
      };

      const buf = await wb.xlsx.writeBuffer();
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", `attachment; filename="template-reports.xlsx"`);
      return res.send(Buffer.from(buf));
    }

    if (!["quiz", "flashcards", "monthly-quiz"].includes(type)) {
      return res.status(400).json({ error: `Template type tidak dikenal: ${type}` });
    }

    const buf = await buildTemplate(type);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="template-${type}.xlsx"`);
    res.send(Buffer.from(buf));
  } catch (e) { next(e); }
});

export default r;