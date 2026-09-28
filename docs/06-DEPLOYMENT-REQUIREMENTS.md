# Deployment Requirements — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 28 September 2026

---

## 1. Kebutuhan Server

### 1.1 App Server

| Spesifikasi | Minimum | Rekomendasi |
|---|---|---|
| CPU | 1 vCPU | 2-4 vCPU |
| RAM | 2 GB | 4-8 GB |
| Storage | 40 GB SSD | 80-160 GB NVMe |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| Bandwidth | 500 GB/bulan | 1 TB/bulan |

**Fungsi:** Menjalankan Node.js API server + frontend static files.

### 1.2 Database

| Spesifikasi | Minimum | Rekomendasi |
|---|---|---|
| Provider | PostgreSQL self-hosted | Supabase Pro (managed) |
| Storage | 500 MB | 8-10 GB |
| Backup | Manual | Daily automated |
| Connection Pooling | Tidak perlu | Ya (PgBouncer) |

**Estimasi pertumbuhan:** 35-40 MB/tahun untuk 1.000 user aktif.

### 1.3 Object Storage

| Spesifikasi | Nilai |
|---|---|
| Provider | Cloudflare R2 |
| Storage awal | 10-100 GB |
| Bandwidth | Unlimited (no egress fee) |
| Operasi | 1 juta/bulan (free tier) |

**Fungsi:** Menyimpan video modul, gambar announcement, file upload.

### 1.4 CDN

| Spesifikasi | Nilai |
|---|---|
| Provider | Cloudflare Free |
| Fungsi | Cache video & static assets di edge |
| SSL | Gratis (Universal SSL) |
| DDoS Protection | Ya |

### 1.5 Email

| Spesifikasi | Nilai |
|---|---|
| Provider | Resend / SendGrid / Mailgun |
| Volume | 10.000 email/bulan |
| Fungsi | Reset password, notifikasi |

---

## 2. Kebutuhan Non-Fungsional

### 2.1 Performa

| Metrik | Target | Hasil Test |
|---|---|---|
| Waktu load halaman | < 3 detik | ✅ |
| API response time (p95) | < 500 ms | ✅ 5.67 ms |
| Video streaming | Tanpa buffering | ✅ via CDN |

### 2.2 Skalabilitas

| Target | Concurrent User | Server Spec |
|---|---|---|
| 2026 | ~770 | 2 vCPU, 4 GB |
| 2027 | ~940 | 4 vCPU, 8 GB |
| 2028-2029 | ~1.260 | 8 vCPU, 16 GB |
| 2030+ | ~1.560 | Kubernetes |

### 2.3 Keamanan

- HTTPS wajib (SSL/TLS 1.2+)
- Rate limiting di endpoint login (20 req / 15 menit)
- JWT expiration: 8 jam
- Password hashing: bcrypt (10 rounds)
- SQL injection protection: Prisma (parameterized queries)
- WAF: Cloudflare (DDoS + bot protection)
- Screenshot guard di halaman pembelajaran (anti-piracy)

### 2.4 Backup & Recovery

| Item | Spesifikasi |
|---|---|
| Database | Daily snapshot, retention 30 hari |
| Object storage | Versioning enabled |
| Recovery Time Objective (RTO) | 4 jam |
| Recovery Point Objective (RPO) | 24 jam |

### 2.5 Monitoring

| Tool | Fungsi |
|---|---|
| UptimeRobot | Uptime monitoring (5 menit interval) |
| Sentry | Error tracking (real-time alert) |
| Cloudflare Logs | Access logs |
| Supabase Dashboard | Database metrics |

---

## 3. Checklist IT

### 3.1 Infrastruktur

- [ ] VPS/Cloud server (2 vCPU, 4 GB RAM minimum)
- [ ] PostgreSQL database (Supabase Pro atau self-host)
- [ ] Cloudflare R2 bucket (`cimory-media`)
- [ ] Cloudflare CDN (domain + SSL)
- [ ] SMTP service (Resend/SendGrid)
- [ ] Domain (subdomain existing atau baru)
- [ ] DNS management

### 3.2 Keamanan

- [ ] WAF (Cloudflare)
- [ ] Rate limiting (Cloudflare + app-level)
- [ ] Secrets management (environment variables)
- [ ] Backup strategy (daily DB snapshot)
- [ ] Monitoring (UptimeRobot, Sentry)
- [ ] SSL certificate (Let's Encrypt / Cloudflare)

### 3.3 Deployment

- [ ] CI/CD pipeline (GitLab CI)
- [ ] Auto-deploy dari GitLab ke server
- [ ] Rollback strategy
- [ ] Health check endpoint (`/api/v2/health`)

### 3.4 Akses & Kolaborasi

- [ ] GitLab repository (private)
- [ ] Akses developer ke GitLab (Developer role)
- [ ] Akses server (SSH key-based)
- [ ] Akses database (read-only untuk auditor)

---

## 4. Spesifikasi Teknis Detail

### 4.1 Node.js

| Item | Nilai |
|---|---|
| Version | Node.js 20+ |
| Package Manager | npm 10+ |
| Process Manager | PM2 |

### 4.2 PostgreSQL

| Item | Nilai |
|---|---|
| Version | PostgreSQL 15+ |
| max_connections | 200 (default 100) |
| Connection Pool | 20 (Prisma) |
| Shared Buffers | 25% dari RAM |

### 4.3 Nginx (Reverse Proxy)

| Item | Nilai |
|---|---|
| Version | Nginx 1.24+ |
| Fungsi | Reverse proxy, SSL termination, static files |
| Config | `proxy_pass http://localhost:4000` |

### 4.4 Cloudflare

| Item | Nilai |
|---|---|
| Plan | Free (bisa upgrade ke Pro) |
| Fitur | CDN, SSL, DDoS protection, WAF |
| Cache Level | Cache Everything (untuk `/uploads/*`) |
| Edge Cache TTL | 1 bulan (video) |

---

## 5. Deployment Steps (Ringkas)

1. **Setup VPS:** Ubuntu 22.04, Node.js 20, PostgreSQL, Nginx
2. **Clone repo:** `git clone <gitlab-url>`
3. **Setup backend:** `cd backend/nestjs && npm install`
4. **Setup env:** copy `.env.example` ke `.env`, isi config
5. **Prisma:** `npx prisma generate`
6. **Build:** `npm run build`
7. **Setup PM2:** `pm2 start npm --name "cimory-academy" -- run start:prod`
8. **Setup Nginx:** config reverse proxy ke port 4000
9. **Setup SSL:** certbot untuk HTTPS
10. **Setup CI/CD:** GitLab CI untuk auto-deploy

---

## 6. Monitoring & Alerting

### 6.1 Uptime Monitoring

- **Tool:** UptimeRobot
- **URL:** `https://academy.cimory.com/api/v2/health`
- **Interval:** 5 menit
- **Alert:** Email + Slack

### 6.2 Error Tracking

- **Tool:** Sentry
- **Integration:** `@sentry/node` di NestJS
- **Alert:** Real-time untuk error 5xx

### 6.3 Log Aggregation

- **Tool:** Cloudflare Logs / Papertrail
- **Format:** JSON
- **Retention:** 30 hari

---

## 7. Kontak

**Project Owner:** [Desi Armanda Sari]
**Email:** [desi.armanda@cimory.com]
**Repository:** https://gitlab.com/decision-support-system-group/cimory-academy