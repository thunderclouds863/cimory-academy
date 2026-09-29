# Technical Specification — Cimory Sales Academy

**Versi:** 2.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group
**Status:** Final

---

## 1. Ringkasan

Dokumen ini menjelaskan **spesifikasi teknis** Cimory Sales Academy untuk keperluan **infrastructure planning**. Dokumen ini bukan panduan instalasi, melainkan **referensi teknis** yang dibutuhkan tim IT.

---

## 2. Tech Stack

### 2.1 Backend Stack

| Komponen | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Runtime | Node.js | 20+ | Menjalankan server |
| Framework Utama | NestJS | 10+ | Fitur baru (v2) |
| Framework Legacy | Express | 4.x | Fitur lama (v1) |
| ORM | Prisma | 6+ | Database access |
| Database | PostgreSQL | 15+ | Data storage |
| Auth | JWT (jsonwebtoken) | 9+ | Authentication |
| Password Hashing | bcryptjs | 2+ | Password security |
| File Upload | multer | 1.4+ | Upload middleware |
| Excel Processing | ExcelJS | 4+ | Import/export Excel |
| Email | Nodemailer | 6+ | Email sending |
| Security | helmet | 7+ | HTTP headers |
| Rate Limiting | express-rate-limit | 7+ | Rate limiter |
| Object Storage | @aws-sdk/client-s3 | 3+ | Cloudflare R2 client |

### 2.2 Frontend Stack

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Markup | HTML5 | Struktur halaman |
| Styling | CSS3 (vanilla) | Design system |
| Logic | Vanilla JavaScript (ES2022) | Aplikasi SPA |
| Font | Google Fonts | Typography |
| Icons | Inline SVG | Icon set |

### 2.3 Infrastructure Stack

| Komponen | Provider | Requirement | Biaya/bulan |
|---|---|---|---|
| App Server | Vultr / DigitalOcean | 2 vCPU, 4 GB RAM | $24-48 |
| Database | Supabase Pro | 8 GB PostgreSQL | $25 |
| Object Storage | Cloudflare R2 | 100 GB, no egress | $1.50 |
| CDN | Cloudflare Free | Unlimited bandwidth | $0 |
| Email | Resend | 10.000 email/bulan | $0-20 |

---

## 3. Arsitektur Sistem

### 3.1 Diagram Arsitektur

```
┌───────────────────────────────────────────────────────────┐
│                  CLOUDFLARE (CDN + WAF)                   │
│         Fitur: DDoS Protection, SSL, Global CDN           │
└──────────────────────┬────────────────────────────────────┘
                       │
          ┌────────────┴────────────┐
          ▼                         ▼
┌──────────────────────┐   ┌──────────────────────┐
│    APP SERVER        │   │   OBJECT STORAGE     │
│    Node.js 20        │   │   Cloudflare R2      │
│    NestJS + Express  │   │                      │
│                      │   │   - Video modul      │
│    2 vCPU            │   │   - Gambar           │
│    4 GB RAM          │   │   - Upload user      │
│    80 GB SSD         │   │                      │
└──────────┬───────────┘   └──────────────────────┘
           │
           ▼
┌──────────────────────┐
│     DATABASE         │
│     PostgreSQL 15+   │
│     (Supabase Pro)   │
│     8 GB             │
│     Daily Backup     │
└──────────────────────┘
```

### 3.2 Alur Request

**Fitur Legacy (Express):**
```
User → Cloudflare → App Server → Express (/api/*) → PostgreSQL
```

**Fitur Baru (NestJS):**
```
User → Cloudflare → App Server → NestJS (/api/v2/*) → Prisma → PostgreSQL
```

**Upload Video (Presigned URL):**
```
Step 1: Frontend → POST /api/v2/storage/presign (dengan JWT)
Step 2: Backend  → Generate presigned URL (R2 SDK, expire 1 jam)
Step 3: Backend  → Return { uploadUrl, publicUrl }
Step 4: Frontend → PUT file ke R2 langsung (bypass server)
Step 5: Frontend → Simpan publicUrl ke database
```

---

## 4. Database Schema

### 4.1 Total Tabel: 23

| Kategori | Tabel | Fungsi |
|---|---|---|
| **User** | users | Data user (sales & admin) |
| | password_resets | Token reset password |
| | user_badges | Badge yang diperoleh user |
| | user_module_progress | Progress modul per user |
| | user_flashcard_views | Flashcard yang dilihat user |
| | user_popup_seen | Popup yang sudah dilihat user |
| | user_question_answered | Soal yang sudah dijawab benar |
| **Konten** | chapters | Chapter pembelajaran |
| | modules | Modul per chapter (video) |
| | flashcards | Fun fact |
| | badges | Definisi badge |
| **Kuis** | quizzes | Kuis per chapter |
| | quiz_questions | Soal kuis chapter |
| | quiz_attempts | Riwayat pengerjaan kuis |
| | monthly_quizzes | Kuis bulanan |
| | monthly_quiz_questions | Soal kuis bulanan |
| | monthly_quiz_attempts | Riwayat kuis bulanan |
| **Leaderboard** | leaderboard_prizes | Hadiah per rank |
| | leaderboard_winners | Pemenang bulanan |
| | leaderboard_config | Config leaderboard |
| **Reports** | reports | Report Power BI |
| | report_access | Akses report per user |
| | report_views | Log view report |

### 4.2 Estimasi Ukuran Database

| Item | Estimasi |
|---|---|
| Ukuran awal (seed data) | 50-100 MB |
| Pertumbuhan per tahun | 35-40 MB (1.000 user aktif) |
| Ukuran 5 tahun | 250-350 MB |

### 4.3 Estimasi Performa

| Metrik | Hasil |
|---|---|
| TPS | **5.216** |
| Latency avg | **9.59 ms** |
| Failed transactions | **0%** |

---

## 5. API Endpoints

### 5.1 Endpoint Legacy (Express)

**Base URL:** `https://academy.cimory.com/api/*`

| Kategori | Endpoint | Fungsi |
|---|---|---|
| **Auth** | POST /auth/login | Login |
| | POST /auth/register | Register |
| | GET /auth/me | Info user |
| | POST /auth/forgot-password | Request reset |
| | POST /auth/reset-password | Reset password |
| **Chapters** | GET /chapters | List chapter |
| | POST /chapters | Tambah (admin) |
| | PUT /chapters/:id | Update (admin) |
| | DELETE /chapters/:id | Hapus (admin) |
| **Quizzes** | GET /quizzes | List kuis |
| | POST /quizzes/:chapterId/submit | Submit |
| **Monthly Quiz** | GET /monthly-quiz/current | Kuis bulan ini |
| | POST /monthly-quiz/:id/submit | Submit |
| **Flashcards** | GET /flashcards | List |
| | POST /flashcards/:id/view | Catat view |
| **Badges** | GET /badges | List badge |
| **Progress** | GET /progress/me | Progress user |
| | POST /progress/modules/:id/complete | Tandai selesai |
| **Leaderboard** | GET /leaderboard/progress | Ranking |
| | GET /leaderboard/winners | Pemenang |
| **Reports** | GET /reports | List report |
| | GET /reports/:slug | Detail report |
| **Upload** | POST /upload/video | Upload video (admin) |
| | POST /upload/excel/* | Import Excel (admin) |

### 5.2 Endpoint Baru (NestJS)

**Base URL:** `https://academy.cimory.com/api/v2/*`

| Endpoint | Fungsi | Status |
|---|---|---|
| GET /health | Health check | ✅ Live |
| POST /auth/login | Login | ✅ Live |
| GET /auth/me | Info user | ✅ Live |
| GET /chapters | List chapter | ✅ Live |
| POST /storage/presign | Presigned upload | ✅ Live |
| GET /quizzes/* | Kuis | ⏳ Migrasi |
| GET /progress/* | Progress | ⏳ Migrasi |
| GET /leaderboard/* | Leaderboard | ⏳ Migrasi |

---

## 6. Environment Variables

### 6.1 Backend `.env`

**File:** `backend/.env` dan `backend/nestjs/.env`

```env
# Server
PORT=4000
NODE_ENV=production
APP_URL=https://academy.cimory.com

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=50&pool_timeout=30

# JWT (HARUS SAMA di kedua .env)
JWT_SECRET=<random-32-chars>
JWT_EXPIRES=8h

# Admin seed
ADMIN_EMAIL=admin@cimory.com
ADMIN_PASSWORD=<strong-password>

# Upload
UPLOAD_DIR=uploads
MAX_VIDEO_MB=500

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM="Cimory Sales Academy <noreply@cimory.com>"

# Cloudflare R2
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<access-key>
R2_SECRET_ACCESS_KEY=<secret-key>
R2_BUCKET=cimory-media
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# Performance
UV_THREADPOOL_SIZE=8
```

**Catatan:** File `.env` **TIDAK BOLEH** di-commit ke GitLab.

---

## 7. Security Specification

### 7.1 Authentication

| Item | Spesifikasi |
|---|---|
| Method | JWT |
| Algorithm | HS256 |
| Payload | { id, email, role, name } |
| Expiration | 8 jam |
| Storage | localStorage |

### 7.2 Password Security

| Item | Spesifikasi |
|---|---|
| Hashing | bcrypt |
| Rounds | 10 |
| Min Length | 6 karakter |
| Reset Token | 32 byte hex, expire 1 jam |

### 7.3 Rate Limiting

| Endpoint | Limit |
|---|---|
| POST /api/auth/login | 20 req / 15 menit |

### 7.4 Content Protection

| Fitur | Fungsi |
|---|---|
| Screenshot Guard | Deteksi PrintScreen, Ctrl+P/S, Cmd+Shift+3/4/5 |
| Video Guard | Pause otomatis saat blur |
| Anti-skip | Seeking ke depan di-reset |
| Anti-debug | Block contextmenu, selectstart, dragstart |

---

## 8. Performance Specification

### 8.1 Target vs Hasil

| Metrik | Target | Hasil | Status |
|---|---|---|---|
| API Response (p95) | < 500 ms | 27.99 ms | ✅ |
| Concurrent User | 1.000+ | 1.200 | ✅ |
| Error Rate | < 1% | 0.17% | ✅ |
| Database TPS | > 500 | 5.216 | ✅ |
| R2 Throughput | > 10 MB/s | 14.46 MB/s | ✅ |

### 8.2 Optimasi yang Diterapkan

| # | Optimasi | Nilai | Efek |
|---|---|---|---|
| 1 | Prisma connection pool | 50 | Error turun, throughput naik |
| 2 | UV_THREADPOOL_SIZE | 8 | Throughput naik 41% |
| 3 | PostgreSQL max_connections | 200 | Buffer untuk scaling |
| 4 | Compression | Enabled | Response lebih kecil |
| 5 | Nginx reverse proxy | Enabled | TCP backlog lebih baik |

---

## 9. Scalability Specification

### 9.1 Kapasitas Server Sekarang

| Item | Nilai |
|---|---|
| Server | 2 vCPU, 4 GB RAM |
| Breaking Point | ~1.200 concurrent user |
| Optimal | 500-1.000 concurrent user |

### 9.2 Kapasitas vs Forecast

| Tahun | Peak Concurrent | Kapasitas Server | Status |
|---|---|---|---|
| 2026 | ~770 | ~1.200 | ✅ 1.6x buffer |
| 2027 | ~940 | ~1.200 | ✅ 1.3x buffer |
| 2028 | ~1.100 | ~1.200 | ✅ 1.1x buffer |
| 2029 | ~1.260 | ~1.200 | ⚠️ Pas-pasan |
| 2030 | ~1.560 | ~1.200 | ❌ Butuh upgrade |

### 9.3 Rencana Upgrade

| Fase | Tahun | Target Peak | Server Spec |
|---|---|---|---|
| 1 | 2026 | ~770 | 2 vCPU, 4 GB |
| 2 | 2027-2028 | ~1.100 | 2 vCPU, 4 GB + Redis |
| 3 | 2029-2030 | ~1.560 | 4 vCPU, 8 GB + LB |
| 4 | 2031+ | > 1.560 | Kubernetes |

---

## 10. Backup & Recovery

### 10.1 Backup Strategy

| Item | Spesifikasi |
|---|---|
| Database | Daily snapshot (Supabase otomatis) |
| Retention | 30 hari |
| Object Storage | Versioning enabled |

### 10.2 Recovery Target

| Metrik | Target |
|---|---|
| RTO (Recovery Time Objective) | 4 jam |
| RPO (Recovery Point Objective) | 24 jam |

---

## 11. Monitoring Specification

### 11.1 Uptime Monitoring

| Item | Spesifikasi |
|---|---|
| Tool | UptimeRobot |
| Endpoint | /api/v2/health |
| Interval | 5 menit |
| Alert | Email + Slack |

### 11.2 Error Tracking

| Item | Spesifikasi |
|---|---|
| Tool | Sentry |
| Integration | @sentry/node di NestJS |
| Alert | Real-time untuk error 5xx |

### 11.3 Log Aggregation

| Item | Spesifikasi |
|---|---|
| Tool | Cloudflare Logs / Papertrail |
| Format | JSON |
| Retention | 30 hari |

---

## 12. Referensi Lengkap

| # | Referensi | URL | Digunakan Untuk |
|---|---|---|---|
| 1 | NestJS Documentation | docs.nestjs.com | Framework |
| 2 | Prisma Documentation | prisma.io/docs | ORM |
| 3 | Cloudflare R2 Pricing | developers.cloudflare.com/r2/pricing | Object storage |
| 4 | Supabase Documentation | supabase.com/docs | Database |
| 5 | Node.js UV_THREADPOOL_SIZE | nodejs.org/api/cli.html | Performance |
| 6 | PostgreSQL Documentation | postgresql.org/docs | Database |
| 7 | VPSBenchmarks | vpsbenchmarks.com | Harga VPS |
| 8 | Resend Pricing | resend.com/docs | Email |
| 9 | TTAK.KO-10.0292 | aid.altibase.com | Standar concurrent user |

---

## 13. Kontak

**Project Owner:** [Nama]
**Email:** [Email]
**Repository:** https://gitlab.com/decision-support-system-group/cimory-academy

---

**Last Updated:** 29 September 2026