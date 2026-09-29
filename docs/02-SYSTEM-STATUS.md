# System Status — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group

---

## 1. Ringkasan Status

| Layer | Status | Keterangan |
|---|---|---|
| **Backend (Express)** | ✅ Production-ready | Fitur lama (auth, chapters, dll) |
| **Backend (NestJS)** | 🚧 Migrasi 40% | Fitur baru (auth v2, chapters v2, storage) |
| **Database** | ✅ Production-ready | PostgreSQL 15+, 23 tabel |
| **Object Storage** | ✅ Production-ready | Cloudflare R2, presigned upload |
| **Frontend** | ✅ Production-ready | Vanilla JS, SPA |
| **Security** | ✅ Production-ready | JWT, rate limiting, WAF |

**Kesimpulan:** Sistem **siap production**, dengan migrasi backend **on going**.

---

## 2. Fitur yang Sudah Jalan ✅

### 2.1 Fitur User

| Fitur | Status | Endpoint |
|---|---|---|
| Login/Register | ✅ | POST /api/auth/login |
| Forgot Password | ✅ | POST /api/auth/forgot-password |
| Reset Password | ✅ | POST /api/auth/reset-password |
| Dashboard | ✅ | GET /api/progress/me |
| Belajar (modul video) | ✅ | GET /api/chapters |
| Video tracking | ✅ | POST /api/progress/modules/:id/complete |
| Kuis Chapter | ✅ | POST /api/quizzes/:chapterId/submit |
| Quiz Bulanan | ✅ | POST /api/monthly-quiz/:id/submit |
| Fun Fact | ✅ | GET /api/flashcards |
| Badges | ✅ | GET /api/badges |
| Leaderboard | ✅ | GET /api/leaderboard/progress |
| Reports Power BI | ✅ | GET /api/reports |
| Popup announcement | ✅ | GET /api/leaderboard/my-popup |

### 2.2 Fitur Admin

| Fitur | Status |
|---|---|
| Dashboard admin | ✅ |
| Chapter & Modul CRUD | ✅ |
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

### 2.3 Fitur Keamanan

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

---

## 3. Progress Migrasi 🚧

### 3.1 Backend Migration (Express → NestJS)

**Pendekatan:** Strangler pattern — Express lama tetap jalan, fitur baru di NestJS.

| # | Modul | Status | Keterangan |
|---|---|---|---|
| 1 | Setup hybrid server | ✅ Selesai | Express + NestJS jalan bareng |
| 2 | Auth (login, me) | ✅ Selesai | JWT shared |
| 3 | Storage (presigned upload) | ✅ Selesai | Cloudflare R2 |
| 4 | Chapters (list) | ✅ Selesai | Query Prisma |
| 5 | Quizzes | ⏳ Pending | — |
| 6 | Progress | ⏳ Pending | — |
| 7 | Leaderboard | ⏳ Pending | — |
| 8 | Reports | ⏳ Pending | — |
| 9 | Monthly Quiz | ⏳ Pending | — |
| 10 | Upload Excel | ⏳ Pending | — |

**Progress:** 4/10 modul (40%)

### 3.2 Frontend Migration

| Item | Status |
|---|---|
| Setup Vite bundler | ⏳ Pending |
| Convert IIFE → ES Modules | ⏳ Pending |
| Migrasi ke component-based | ⏳ Pending |

**Progress:** 0%

### 3.3 Infrastructure Setup

| Item | Status |
|---|---|
| Setup CI/CD (GitLab CI) | ⏳ Pending |
| Setup monitoring (Sentry) | ⏳ Pending |
| Setup staging environment | ⏳ Pending |
| Setup backup otomatis | ⏳ Pending |

**Progress:** 0%

### 3.4 Testing

| Item | Status |
|---|---|
| Performance test | ✅ Selesai (7 test) |
| Unit testing | ⏳ Pending |
| Integration testing | ⏳ Pending |
| E2E testing | ⏳ Pending |

**Progress:** 15%

---

## 4. Arsitektur Sistem Saat Ini

### 4.1 Backend Hybrid

```
backend/
├── nestjs/                 # NestJS v2 (fitur baru)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # ✅ Login, JWT
│   │   │   ├── chapters/   # ✅ Chapter & modul
│   │   │   └── storage/    # ✅ Upload ke R2
│   │   ├── prisma/         # ✅ Prisma service
│   │   └── main.ts         # ✅ Hybrid mount
│   └── prisma/
│
├── legacy-app.js           # ✅ Express app
├── routes/                 # ✅ Express routes (fitur lama)
├── middleware/             # ✅ Auth, upload
├── services/               # ✅ Badge, email, excel
└── db/                     # ✅ PostgreSQL pool
```


### 4.2 Endpoint Mapping

| Prefix | Framework | Status |
|---|---|---|
| `/api/*` | Express (legacy) | ✅ Jalan |
| `/api/v2/*` | NestJS (baru) | ✅ Jalan |

**Endpoint v2 yang sudah live:**
- GET `/api/v2/health`
- POST `/api/v2/auth/login`
- GET `/api/v2/auth/me`
- GET `/api/v2/chapters`
- POST `/api/v2/storage/presign`

---

## 5. Requirement Infrastruktur

| Komponen | Requirement | Alasan |
|---|---|---|
| App Server | 2 vCPU, 4 GB RAM | Hasil test: kuat sampai 1.200 concurrent user |
| Database | 8 GB PostgreSQL managed | 23 tabel, pertumbuhan ~35 MB/tahun |
| Object Storage | 100 GB, no egress fee | Video modul ~50 MB × 100 modul |
| CDN | Global, unlimited bandwidth | Akses dari seluruh Indonesia |
| Email | 10.000 email/bulan | Reset password, notifikasi |

**Biaya:** ~$51-95/bulan

---

## 6. Risk & Mitigation

| Risk | Dampak | Mitigation |
|---|---|---|
| Migrasi NestJS belum selesai | Dua codebase harus di-maintain | Migrasi bertahap, test tiap modul |
| Tidak ada CI/CD | Deploy manual, rawan error | Setup GitLab CI |
| Tidak ada monitoring | Gak tau kalau server down | Setup Sentry + UptimeRobot |
| Tidak ada unit testing | Regression gak ketangkep | Tambah test coverage |
| Frontend pakai IIFE | Susah di-maintain | Migrasi ke ES Modules |

---

## 7. Roadmap 2026-2027

| Fase | Aktivitas | Estimasi |
|---|---|---|
| Q4 2026 | Selesaikan migrasi NestJS (6 modul sisa) | 2 bulan |
| Q4 2026 | Setup CI/CD + monitoring | 2 minggu |
| Q1 2027 | Migrasi frontend ke Vite | 1 bulan |
| Q1 2027 | Setup unit testing | 1 bulan |
| Q2 2027 | Deploy production + training user | 2 minggu |
| Q2 2027 | Full launch | — |

---

## 8. Action Items untuk IT

- [ ] Review status sistem
- [ ] Approve budget infrastruktur
- [ ] Setup environment production
- [ ] Kolaborasi dengan development untuk deployment
- [ ] Setup monitoring & backup
- [ ] Review ulang tiap 3 bulan

---

## 9. Referensi

- **[Infrastructure Requirements](03-INFRASTRUCTURE-REQUIREMENTS.md)**
- **[Performance Report](04-PERFORMANCE-REPORT.md)**
- **[Technical Specification](07-TECHNICAL-SPECIFICATION.md)**

---

**Last Updated:** 29 September 2026