import { Router } from "express";
import { query } from "../db/pool.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const r = Router();
r.use(requireAuth);

function sanitizeEmbedUrl(raw) {
  if (!raw) return "";
  let url = String(raw).trim();

  if (url.toLowerCase().startsWith("<iframe")) {
    const m = url.match(/src\s*=\s*["']([^"']+)["']/i);
    if (m) url = m[1];
  }

  url = url.replace(/^["']|["']$/g, "").trim();

  return url;
}

r.get("/", async (req, res) => {
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  if (isAdmin) {
    const rows = (await query(`
      SELECT r.id, r.slug, r.title, r.description, r.icon, r.sort_order,
             (SELECT COUNT(*)::int FROM report_access WHERE report_id=r.id) AS access_count
      FROM reports r
      WHERE r.is_active = TRUE
      ORDER BY r.sort_order, r.title
    `)).rows;
    return res.json(rows);
  }

  const rows = (await query(`
    SELECT r.id, r.slug, r.title, r.description, r.icon, r.sort_order
    FROM reports r
    JOIN report_access ra ON ra.report_id = r.id
    WHERE r.is_active = TRUE AND ra.user_id = $1
    ORDER BY r.sort_order, r.title
  `, [userId])).rows;

  res.json(rows);
});

r.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const userId = req.user.id;
  const isAdmin = req.user.role === "admin";

  const report = (await query(
    "SELECT * FROM reports WHERE slug=$1 AND is_active=TRUE",
    [slug]
  )).rows[0];

  if (!report) return res.status(404).json({ error: "Report tidak ditemukan" });

  if (!isAdmin) {
    const hasAccess = await query(
      "SELECT 1 FROM report_access WHERE report_id=$1 AND user_id=$2",
      [report.id, userId]
    );
    if (hasAccess.rowCount === 0) {
      return res.status(403).json({ error: "Kamu tidak punya akses ke report ini" });
    }
  }

  query(
    "INSERT INTO report_views (report_id, user_id) VALUES ($1,$2)",
    [report.id, userId]
  ).catch((e) => console.error("Gagal log report view:", e.message));

  res.json({
    id: report.id,
    slug: report.slug,
    title: report.title,
    description: report.description,
    embedUrl: report.embed_url,
    icon: report.icon
  });
});

r.get("/admin/all", requireAdmin, async (_req, res) => {
  const rows = (await query(`
    SELECT r.*,
      u.name AS created_by_name,
      (SELECT COUNT(*)::int FROM report_access WHERE report_id=r.id) AS access_count,
      (SELECT COUNT(*)::int FROM report_views WHERE report_id=r.id) AS view_count
    FROM reports r
    LEFT JOIN users u ON u.id = r.created_by
    ORDER BY r.sort_order, r.title
  `)).rows;
  res.json(rows);
});

r.post("/admin", requireAdmin, async (req, res) => {
  const { slug, title, description, embedUrl, icon = "📊", sort_order = 0 } = req.body || {};

  if (!slug || !title || !embedUrl) {
    return res.status(400).json({ error: "Slug, judul, dan embed URL wajib" });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return res.status(400).json({ error: "Slug hanya boleh huruf kecil, angka, dan tanda minus (-)" });
  }

  const cleanUrl = sanitizeEmbedUrl(embedUrl);
  if (!cleanUrl.startsWith("http")) {
    return res.status(400).json({ error: "Embed URL tidak valid" });
  }

  const exists = await query("SELECT 1 FROM reports WHERE slug=$1", [slug]);
  if (exists.rowCount) return res.status(409).json({ error: `Slug "${slug}" sudah dipakai` });

  const info = await query(
    `INSERT INTO reports (slug, title, description, embed_url, icon, sort_order, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [slug, title, description || null, cleanUrl, icon, sort_order, req.user.id]
  );

  res.json({ id: info.rows[0].id });
});

r.put("/admin/:id", requireAdmin, async (req, res) => {
  const id = +req.params.id;
  const { title, description, embedUrl, icon, sort_order, is_active } = req.body || {};

  const fields = [];
  const params = [];
  let i = 1;

  if (title !== undefined) { fields.push(`title=$${i++}`); params.push(title); }
  if (description !== undefined) { fields.push(`description=$${i++}`); params.push(description); }
  if (embedUrl) {
    const cleanUrl = sanitizeEmbedUrl(embedUrl);
    if (!cleanUrl.startsWith("http")) return res.status(400).json({ error: "Embed URL tidak valid" });
    fields.push(`embed_url=$${i++}`); params.push(cleanUrl);
  }
  if (icon !== undefined) { fields.push(`icon=$${i++}`); params.push(icon); }
  if (sort_order !== undefined) { fields.push(`sort_order=$${i++}`); params.push(sort_order); }
  if (is_active !== undefined) { fields.push(`is_active=$${i++}`); params.push(is_active); }

  if (!fields.length) return res.status(400).json({ error: "Tidak ada yang diubah" });
  fields.push(`updated_at=NOW()`);
  params.push(id);

  await query(`UPDATE reports SET ${fields.join(", ")} WHERE id=$${i}`, params);
  res.json({ ok: true });
});

r.delete("/admin/:id", requireAdmin, async (req, res) => {
  const info = await query("DELETE FROM reports WHERE id=$1 RETURNING id", [req.params.id]);
  if (info.rowCount === 0) return res.status(404).json({ error: "Report tidak ditemukan" });
  res.json({ ok: true });
});

r.get("/admin/:id/access", requireAdmin, async (req, res) => {
  const id = +req.params.id;

  const report = (await query("SELECT id, title FROM reports WHERE id=$1", [id])).rows[0];
  if (!report) return res.status(404).json({ error: "Report tidak ditemukan" });

  const users = (await query(`
    SELECT
      u.id, u.name, u.email,
      CASE WHEN ra.user_id IS NOT NULL THEN TRUE ELSE FALSE END AS granted
    FROM users u
    LEFT JOIN report_access ra ON ra.report_id = $1 AND ra.user_id = u.id
    WHERE u.role = 'user'
    ORDER BY u.name
  `, [id])).rows;

  res.json({ report, users });
});

r.post("/admin/:id/access", requireAdmin, async (req, res) => {
  const id = +req.params.id;
  const { userIds = [] } = req.body || {};

  const report = (await query("SELECT id FROM reports WHERE id=$1", [id])).rows[0];
  if (!report) return res.status(404).json({ error: "Report tidak ditemukan" });

  await query("DELETE FROM report_access WHERE report_id=$1", [id]);

  let granted = 0;
  for (const uid of userIds) {
    const n = Number(uid);
    if (!Number.isFinite(n)) continue;
    try {
      await query(
        "INSERT INTO report_access (report_id, user_id, granted_by) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
        [id, n, req.user.id]
      );
      granted++;
    } catch (e) {
    }
  }

  res.json({ ok: true, granted });
});

r.get("/admin/:id/analytics", requireAdmin, async (req, res) => {
  const id = +req.params.id;

  const total = (await query(
    "SELECT COUNT(*)::int AS c FROM report_views WHERE report_id=$1",
    [id]
  )).rows[0].c;

  const uniqueUsers = (await query(
    "SELECT COUNT(DISTINCT user_id)::int AS c FROM report_views WHERE report_id=$1",
    [id]
  )).rows[0].c;

  const topUsers = (await query(`
    SELECT u.name, u.email, COUNT(*)::int AS views, MAX(rv.viewed_at) AS last_view
    FROM report_views rv
    JOIN users u ON u.id = rv.user_id
    WHERE rv.report_id = $1
    GROUP BY u.id, u.name, u.email
    ORDER BY views DESC, last_view DESC
    LIMIT 10
  `, [id])).rows;

  res.json({ total, uniqueUsers, topUsers });
});

export default r;