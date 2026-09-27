import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import { query } from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { sendEmail } from "../services/email.js";

const r = Router();

const sign = (u) => jwt.sign(
  { id: u.id, email: u.email, role: u.role, name: u.name },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES || "8h" }
);

r.post("/register", async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: "Lengkapi data" });
  const exists = await query("SELECT 1 FROM users WHERE email=$1", [email.toLowerCase()]);
  if (exists.rowCount) return res.status(409).json({ error: "Email sudah terdaftar" });
  const hash = await bcrypt.hash(password, 10);
  const info = await query(
    "INSERT INTO users (email, password_hash, name, role) VALUES ($1,$2,$3,'user') RETURNING id, email, name, role",
    [email.toLowerCase(), hash, name]
  );
  const user = info.rows[0];
  res.json({ token: sign(user), user });
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body || {};
  const r1 = await query("SELECT * FROM users WHERE email=$1", [(email || "").toLowerCase()]);
  if (r1.rowCount === 0) return res.status(401).json({ error: "Email atau password salah" });
  const user = r1.rows[0];
  const ok = await bcrypt.compare(password || "", user.password_hash);
  if (!ok) return res.status(401).json({ error: "Email atau password salah" });
  const pub = { id: user.id, email: user.email, name: user.name, role: user.role };
  res.json({ token: sign(pub), user: pub });
});

r.post("/change-password", async (req, res) => {
  const { email, oldPassword, newPassword } = req.body || {};
  const r1 = await query("SELECT * FROM users WHERE email=$1", [(email || "").toLowerCase()]);
  if (r1.rowCount === 0) return res.status(404).json({ error: "User tidak ditemukan" });
  const user = r1.rows[0];
  const ok = await bcrypt.compare(oldPassword || "", user.password_hash);
  if (!ok) return res.status(401).json({ error: "Password lama salah" });
  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, user.id]);
  res.json({ ok: true });
});

r.get("/me", requireAuth, async (req, res) => {
  const r1 = await query("SELECT id, email, name, role, xp, streak FROM users WHERE id=$1", [req.user.id]);
  res.json(r1.rows[0]);
});

(async () => {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(120) NOT NULL UNIQUE,
        expires_at TIMESTAMPTZ NOT NULL,
        used_at    TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await query(`CREATE INDEX IF NOT EXISTS idx_pwreset_token ON password_resets(token)`);
  } catch (e) {
    console.error("Gagal bikin tabel password_resets:", e.message);
  }
})();

r.post("/forgot-password", async (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: "Email wajib diisi" });

  const emailLower = String(email).toLowerCase().trim();
  const user = (await query("SELECT id, email, name FROM users WHERE email=$1", [emailLower])).rows[0];

  if (!user) {
    return res.json({ ok: true });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await query("DELETE FROM password_resets WHERE user_id=$1 AND used_at IS NULL", [user.id]);

  await query(
    "INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1,$2,$3)",
    [user.id, rawToken, expiresAt]
  );

  const baseUrl = process.env.APP_URL || `http://localhost:${process.env.PORT || 4000}`;
  const resetLink = `${baseUrl}/#/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "Reset Password — Cimory Sales Academy",
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:24px;background:#0f1230;color:#EEF0FF;border-radius:16px">
          <h2 style="color:#ED1D24;margin-top:0">Reset Password</h2>
          <p>Halo <strong>${user.name}</strong>,</p>
          <p>Kami menerima permintaan untuk reset password akun Cimory Sales Academy kamu.</p>
          <p>Klik tombol di bawah ini untuk membuat password baru. Link ini berlaku <strong>1 jam</strong>:</p>
          <p style="text-align:center;margin:28px 0">
            <a href="${resetLink}" style="background:#ED1D24;color:#fff;padding:14px 28px;border-radius:99px;text-decoration:none;font-weight:bold;display:inline-block">Reset Password Saya</a>
          </p>
          <p style="color:#9aa0c9;font-size:13px">Kalau kamu tidak meminta reset password, abaikan email ini. Password kamu tetap aman.</p>
          <hr style="border-color:rgba(255,255,255,.1);margin:24px 0">
          <p style="color:#6f76a6;font-size:12px">Cimory Sales Academy — Cimory Group</p>
        </div>
      `
    });
    console.log(`✅ Link reset terkirim ke ${user.email}`);
  } catch (e) {
    console.error("❌ Gagal kirim email reset:", e.message);
  }

  res.json({ ok: true });
});

r.get("/verify-reset-token/:token", async (req, res) => {
  const { token } = req.params;
  const r1 = await query(
    `SELECT pr.user_id, u.email, u.name
     FROM password_resets pr
     JOIN users u ON u.id = pr.user_id
     WHERE pr.token=$1
       AND pr.used_at IS NULL
       AND pr.expires_at > NOW()`,
    [token]
  );

  if (r1.rowCount === 0) {
    return res.status(400).json({ error: "Link reset tidak valid atau sudah kadaluarsa" });
  }

  res.json({
    ok: true,
    email: r1.rows[0].email,
    name: r1.rows[0].name
  });
});

r.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body || {};
  if (!token || !newPassword) return res.status(400).json({ error: "Token & password baru wajib" });
  if (newPassword.length < 6) return res.status(400).json({ error: "Password minimal 6 karakter" });

  const r1 = await query(
    `SELECT id, user_id
     FROM password_resets
     WHERE token=$1 AND used_at IS NULL AND expires_at > NOW()`,
    [token]
  );
  if (r1.rowCount === 0) {
    return res.status(400).json({ error: "Link reset tidak valid atau sudah kadaluarsa" });
  }

  const resetRow = r1.rows[0];
  const hash = await bcrypt.hash(newPassword, 10);

  await query("UPDATE users SET password_hash=$1 WHERE id=$2", [hash, resetRow.user_id]);
  await query("UPDATE password_resets SET used_at=NOW() WHERE id=$1", [resetRow.id]);

  res.json({ ok: true });
});

export default r;