\# Handover Documentation — Cimory Sales Academy



\*\*Versi:\*\* 1.0

\*\*Tanggal:\*\* 6 Oktober 2026

\*\*Untuk:\*\* Tim IT Cimory Group

\*\*Dari:\*\* Tim Development Cimory Sales Academy



\---



\## 📋 Daftar Isi



1\. \[Overview](#1-overview)

2\. \[Status Sistem](#2-status-sistem)

3\. \[Source Code](#3-source-code)

4\. \[Fitur Done](#4-fitur-done)

5\. \[On Going](#5-on-going)

6\. \[Planning](#6-planning)

7\. \[Testing](#7-testing)

8\. \[Future Roadmap](#8-future-roadmap)

9\. \[Kontak](#9-kontak)



\---



\## 1. Overview



\### 1.1 Deskripsi



Cimory Sales Academy adalah platform pembelajaran digital (LMS) yang awalnya dirancang untuk tim sales Cimory Group \& Kanzler. Saat ini fokus ke sales, tapi \*\*rencananya akan dikembangkan jadi LMS untuk semua divisi\*\* (bukan cuma sales).



\### 1.2 Tech Stack



| Layer | Teknologi |

|---|---|

| Backend | Node.js 20, NestJS 10, Express 4 (hybrid), Prisma 6 |

| Database | PostgreSQL 15+ |

| Frontend | Vanilla JavaScript (ES2022), HTML5, CSS3 |

| Object Storage | Cloudflare R2 (S3-compatible) |

| CDN | Cloudflare |

| Auth | JWT |

| Email | Nodemailer (SMTP) |



\### 1.3 Arsitektur



Sistem ini pakai \*\*strangler pattern\*\* — Express lama tetap jalan, fitur baru di NestJS:



```

┌──────────────────────────────────────────────────┐

│              CLOUDFLARE (CDN + WAF)              │

└──────────────────────┬───────────────────────────┘

&#x20;                      │

&#x20;         ┌────────────┴────────────┐

&#x20;         ▼                         ▼

┌──────────────────────┐   ┌──────────────────────┐

│    APP SERVER        │   │   OBJECT STORAGE     │

│    Node.js           │   │   Cloudflare R2      │

│    NestJS + Express  │   │                      │

│                      │   │   - Video modul      │

│    /api/\*      (v1)  │   │   - Gambar           │

│    /api/v2/\*   (v2)  │   │   - Upload user      │

└──────────┬───────────┘   └──────────────────────┘

&#x20;          │

&#x20;          ▼

┌──────────────────────┐

│     DATABASE         │

│     PostgreSQL       │

│     (Supabase Pro)   │

│     23 tabel         │

└──────────────────────┘

```



\---



\## 2. Status Sistem



\### 2.1 Ringkasan



| Layer | Status | Keterangan |

|---|---|---|

| Backend (Express) | ✅ Production-ready | Fitur lama |

| Backend (NestJS) | 🚧 Migrasi 40% | Fitur baru |

| Database | ✅ Production-ready | 23 tabel |

| Object Storage | ✅ Production-ready | Cloudflare R2 |

| Frontend | ✅ Production-ready | Vanilla JS SPA |

| Security | ✅ Production-ready | JWT, rate limiting |



\*\*Kesimpulan:\*\* Sistem \*\*siap production\*\*, dengan migrasi backend \*\*on going\*\*.



\### 2.2 Endpoint Mapping



| Prefix | Framework | Status |

|---|---|---|

| `/api/\*` | Express (legacy) | ✅ Jalan |

| `/api/v2/\*` | NestJS (baru) | ✅ Jalan |



\---



\## 3. Source Code



\### 3.1 Struktur Project



```

Sales-Academy/

├── backend/                 # API server (hybrid)

│   ├── nestjs/              # NestJS v2 (fitur baru)

│   ├── routes/              # Express routes (legacy)

│   ├── middleware/          # Auth, upload

│   ├── services/            # Badge, email, excel

│   ├── db/                  # PostgreSQL pool

│   └── legacy-app.js        # Express app (di-mount)

│

├── frontend/                # Web app

│   ├── index.html

│   ├── js/                  # Vanilla JS modules

│   ├── css/                 # Style \& admin CSS

│   └── assets/              # Logo, mascot

│

├── docs/                    # 📚 Dokumentasi

│

└── tests/                   # Test scripts

&#x20;   └── load/

```



\### 3.2 File Backend



\#### 3.2.1 Entry Point



| File | Fungsi |

|---|---|

| `backend/server.js` | Entry point Express lama (legacy) |

| `backend/legacy-app.js` | Express app yang di-mount ke NestJS |

| `backend/nestjs/src/main.ts` | Entry point NestJS + mount Express |



\#### 3.2.2 Database



| File | Fungsi |

|---|---|

| `backend/db/pool.js` | PostgreSQL connection pool (pg) |

| `backend/db/schema.sql` | Schema database (23 tabel) |

| `backend/db/migrate.js` | Migration runner |

| `backend/db/seed.js` | Seed data (admin, chapters, quizzes) |



\#### 3.2.3 Middleware



| File | Fungsi |

|---|---|

| `backend/middleware/auth.js` | JWT verification + admin guard |

| `backend/middleware/upload.js` | Multer config (video, excel, image) |



\#### 3.2.4 Routes (Express Legacy)



| File | Fungsi |

|---|---|

| `backend/routes/auth.routes.js` | Login, register, reset password |

| `backend/routes/chapters.routes.js` | Chapter \& modul CRUD |

| `backend/routes/quizzes.routes.js` | Kuis chapter \& submit |

| `backend/routes/monthly-quiz.routes.js` | Quiz bulanan |

| `backend/routes/flashcards.routes.js` | Fun fact |

| `backend/routes/badges.routes.js` | Badge CRUD |

| `backend/routes/progress.routes.js` | Progress user |

| `backend/routes/leaderboard.routes.js` | Leaderboard |

| `backend/routes/rewards.routes.js` | Hadiah |

| `backend/routes/reports.routes.js` | Reports Power BI |

| `backend/routes/upload.routes.js` | Upload video, excel, image |



\#### 3.2.5 Services



| File | Fungsi |

|---|---|

| `backend/services/badge.js` | Recompute badge logic |

| `backend/services/email.js` | Nodemailer wrapper |

| `backend/services/excel.js` | Excel parser \& template builder |

| `backend/services/reward.js` | Monthly ranking \& winners |



\#### 3.2.6 NestJS Modules (Baru)



| File | Fungsi |

|---|---|

| `backend/nestjs/src/modules/auth/` | Login, JWT strategy, guard |

| `backend/nestjs/src/modules/chapters/` | Chapter \& modul (Prisma) |

| `backend/nestjs/src/modules/storage/` | Presigned upload ke R2 |

| `backend/nestjs/src/prisma/` | Prisma service \& module |

| `backend/nestjs/src/app.module.ts` | Root module |

| `backend/nestjs/prisma/schema.prisma` | Prisma schema (23 model) |



\### 3.3 File Frontend



| File | Fungsi |

|---|---|

| `frontend/index.html` | Entry point SPA |

| `frontend/js/config.js` | Config API base |

| `frontend/js/api.js` | Fetch wrapper |

| `frontend/js/auth.js` | Auth logic (login, logout) |

| `frontend/js/store.js` | State management (cache) |

| `frontend/js/ui.js` | UI helpers (icon, toast, confetti) |

| `frontend/js/guard.js` | Screenshot guard |

| `frontend/js/admin.js` | Admin panel SPA |

| `frontend/js/app.js` | User SPA (main app) |

| `frontend/css/style.css` | User-facing CSS |

| `frontend/css/admin.css` | Admin CSS |

| `frontend/assets/` | Logo, mascot |



\### 3.4 File Test



| File | Fungsi |

|---|---|

| `tests/load/smoke-test.js` | Smoke test (1 VU, 30 detik) |

| `tests/load/load-test.js` | Load test (50 VU, 2 menit) |

| `tests/load/stress-test.js` | Stress test (1.000 VU, 8 menit) |

| `tests/load/spike-test.js` | Spike test (10→500 VU) |

| `tests/load/soak-test.js` | Soak test (500 VU, 1 jam) |

| `tests/load/r2-benchmark.js` | R2 upload/download benchmark |



\### 3.5 File Dokumentasi



| File | Fungsi |

|---|---|

| `docs/00-INDEX.md` | Daftar isi |

| `docs/02-SYSTEM-STATUS.md` | Status sistem |

| `docs/04-PERFORMANCE-REPORT.md` | Hasil test performance |

| `docs/HANDOVER.md` | Dokumentasi handover ini |

| `docs/08-FEATURES-DOCUMENTATION.md` | Dokumentasi fitur lengkap |



\---



\## 4. Fitur Done



\### 4.1 Fitur User (Sales)



| Fitur | Status | Endpoint |

|---|---|---|

| Login/Register | ✅ | POST /api/v2/auth/login |

| Forgot Password | ✅ | POST /api/auth/forgot-password |

| Reset Password | ✅ | POST /api/auth/reset-password |

| Dashboard | ✅ | GET /api/progress/me |

| Belajar (modul video) | ✅ | GET /api/v2/chapters |

| Video tracking | ✅ | POST /api/progress/modules/:id/complete |

| Kuis Chapter | ✅ | POST /api/quizzes/:chapterId/submit |

| Quiz Bulanan | ✅ | POST /api/monthly-quiz/:id/submit |

| Fun Fact | ✅ | GET /api/flashcards |

| Badges | ✅ | GET /api/badges |

| Leaderboard | ✅ | GET /api/leaderboard/progress |

| Reports Power BI | ✅ | GET /api/reports |

| Popup announcement | ✅ | GET /api/leaderboard/my-popup |



\### 4.2 Fitur Admin



| Fitur | Status |

|---|---|

| Dashboard admin | ✅ |

| Chapter \& Modul CRUD | ✅ |

| Upload video | ✅ |

| Kuis Chapter CRUD | ✅ |

| Import Excel kuis | ✅ |

| Quiz Bulanan CRUD | ✅ |

| Fun Fact CRUD | ✅ |

| Badges CRUD | ✅ |

| Users CRUD | ✅ |

| Import Excel users | ✅ |

| Leaderboard management | ✅ |

| Generate winners | ✅ |

| Reports CRUD | ✅ |

| Analytics | ✅ |



\### 4.3 Fitur Keamanan



| Fitur | Status |

|---|---|

| JWT Authentication | ✅ |

| bcrypt Password Hashing | ✅ |

| Rate Limiting (login) | ✅ |

| Screenshot Guard | ✅ |

| Video Guard (anti-skip) | ✅ |

| CORS | ✅ |

| Helmet (HTTP headers) | ✅ |

| Content Security Policy | ✅ |



\### 4.4 Fitur Backend (NestJS v2)



| Fitur | Status |

|---|---|

| Hybrid server (Express + NestJS) | ✅ |

| Auth v2 (login, me) | ✅ |

| Chapters v2 (list) | ✅ |

| Storage v2 (presigned upload ke R2) | ✅ |

| Prisma ORM | ✅ |



\---



\## 5. On Going



\### 5.1 Backend Migration (Express → NestJS)



\*\*Progress:\*\* 4/10 modul (40%)



| # | Modul | Status |

|---|---|---|

| 1 | Setup hybrid server | ✅ Selesai |

| 2 | Auth (login, me) | ✅ Selesai |

| 3 | Storage (presigned upload) | ✅ Selesai |

| 4 | Chapters (list) | ✅ Selesai |

| 5 | Quizzes | 🚧 On going |

| 6 | Progress | ⏳ Pending |

| 7 | Leaderboard | ⏳ Pending |

| 8 | Reports | ⏳ Pending |

| 9 | Monthly Quiz | ⏳ Pending |

| 10 | Upload Excel | ⏳ Pending |



\### 5.2 Frontend Migration



| Item | Status |

|---|---|

| Setup Vite bundler | ⏳ Pending |

| Convert IIFE → ES Modules | ⏳ Pending |

| Migrasi ke component-based | ⏳ Pending |



\### 5.3 Infrastructure Setup



| Item | Status |

|---|---|

| Setup CI/CD (GitLab CI) | ⏳ Pending |

| Setup monitoring (Sentry) | ⏳ Pending |

| Setup staging environment | ⏳ Pending |

| Setup backup otomatis | ⏳ Pending |



\### 5.4 Testing



| Item | Status |

|---|---|

| Performance test | ✅ Selesai (7 test) |

| Unit testing | ⏳ Pending |

| Integration testing | ⏳ Pending |

| E2E testing | ⏳ Pending |



\---



\## 6. Planning



\### 6.1 Short Term (Q4 2026)



| Item | Prioritas | Estimasi |

|---|---|---|

| Selesaikan migrasi NestJS (6 modul sisa) | Tinggi | 2 bulan |

| Setup CI/CD GitLab | Tinggi | 2 minggu |

| Setup monitoring (Sentry + UptimeRobot) | Tinggi | 1 minggu |

| Setup backup otomatis | Tinggi | 1 minggu |

| Migrasi frontend ke Vite | Sedang | 1 bulan |



\### 6.2 Medium Term (2027)



| Item | Prioritas | Estimasi |

|---|---|---|

| Unit testing | Sedang | 1 bulan |

| Integration testing | Sedang | 1 bulan |

| Setup staging environment | Sedang | 2 minggu |

| Migrasi frontend ke React/Next.js | Rendah | 2 bulan |

| Setup Redis cache | Rendah | 2 minggu |



\### 6.3 Long Term (2027-2028)



| Item | Prioritas |

|---|---|

| HLS streaming (video adaptive) | Sedang |

| Signed URL untuk video | Sedang |

| Mobile app (React Native) | Rendah |

| SSO integration (Azure AD) | Rendah |



\---



\## 7. Testing



\### 7.1 Performance Test (Done)



\*\*7 test udah dilakukan:\*\*



| # | Test | Concurrent | Error | p(95) | Status |

|---|---|---|---|---|---|

| 1 | Smoke | 1 | 0.00% | 28.08 ms | ✅ PASS |

| 2 | Load | 50 | 0.00% | 27.99 ms | ✅ PASS |

| 3 | Stress | 1.000 | 0.17% | 1.49 s | ✅ PASS |

| 4 | Spike | 500 | 0.00% | 1.3 s | ✅ PASS |

| 5 | Soak (1 jam) | 500 | 0.01% | 1.29 s | ✅ PASS |

| 6 | R2 Benchmark | — | — | 14.46 MB/s | ✅ PASS |

| 7 | Database | 50 | 0.00% | 5.216 TPS | ✅ PASS |



\*\*Tools:\*\*

\- k6 v2.3.0 (load test)

\- pgbench (database benchmark)

\- Custom Node.js (R2 benchmark)



\*\*Hasil:\*\*

\- Breaking point: \~1.200 concurrent user

\- Server 2 vCPU, 4 GB RAM: kuat sampai 1.200 concurrent user

\- Database: 5.216 TPS (bukan bottleneck)

\- R2: 14.46 MB/s (cukup untuk video)



\*\*Laporan lengkap:\*\* `docs/04-PERFORMANCE-REPORT.md`



\### 7.2 Testing yang Belum Dilakukan



| Item | Status |

|---|---|

| Unit testing | ⏳ Belum |

| Integration testing | ⏳ Belum |

| E2E testing | ⏳ Belum |

| Security audit | ⏳ Belum |

| UAT (User Acceptance Test) | ⏳ Belum |



\---



\## 8. Future Roadmap



\### 8.1 Rencana: LMS untuk Semua Divisi



\*\*Current:\*\* LMS khusus tim sales

\*\*Future:\*\* LMS untuk semua divisi Cimory Group



\*\*Perubahan yang Dibutuhkan:\*\*



\#### 8.1.1 Backend



| Item | Perubahan |

|---|---|

| Database | Tambah tabel `departments`, `user\_departments` |

| User model | Tambah kolom `department\_id` |

| Chapter model | Tambah kolom `department\_id` (chapter bisa spesifik divisi) |

| Quiz model | Tambah kolom `department\_id` |

| Leaderboard | Bisa filter per department |

| Reports | Bisa filter per department |

| Badges | Bisa spesifik per department |



\#### 8.1.2 Frontend



| Item | Perubahan |

|---|---|

| Dashboard | Tambah filter department |

| Chapter list | Filter by department |

| Quiz | Filter by department |

| Leaderboard | Filter by department |

| Admin panel | CRUD department, assign user ke department |

| Reports | Filter by department |



\#### 8.1.3 Fitur Baru yang Dibutuhkan



| Fitur | Deskripsi |

|---|---|

| \*\*Multi-tenant\*\* | Support multiple department |

| \*\*Custom branding\*\* | Setiap department bisa punya logo/warna sendiri |

| \*\*Role per department\*\* | Admin department, manager department |

| \*\*Reporting per department\*\* | Analytics per divisi |

| \*\*Content library\*\* | Konten yang bisa di-share antar divisi |

| \*\*Learning path\*\* | Path pembelajaran custom per role |



\### 8.2 Estimasi Effort



| Fase | Aktivitas | Estimasi |

|---|---|---|

| 1 | Tambah tabel department \& migrasi data | 2 minggu |

| 2 | Update user model + auth | 1 minggu |

| 3 | Update chapter/quiz model | 2 minggu |

| 4 | Update frontend (filter department) | 3 minggu |

| 5 | Update admin panel | 2 minggu |

| 6 | Testing \& QA | 2 minggu |

| \*\*Total\*\* | | \*\*\~12 minggu (3 bulan)\*\* |



\### 8.3 Catatan Penting



\- \*\*Frontend belum disesuaikan\*\* untuk multi-department (masih fokus sales)

\- \*\*Backend perlu refactor\*\* untuk support multi-department

\- \*\*Database perlu migrasi\*\* untuk tambah tabel department

\- \*\*Testing menyeluruh\*\* diperlukan sebelum launch multi-department



\---



\## 9. Kontak



\*\*Project Owner:\*\* Desi Armanda Sari

\*\*Email:\*\* desi.armanda@cimory.com

\*\*Repository:\*\* https://gitlab.com/decision-support-system-group/cimory-academy



\---



\*\*Last Updated:\*\* 6 Oktober 2026

\*\*Versi:\*\* 1.0

\*\*Status:\*\* Final

