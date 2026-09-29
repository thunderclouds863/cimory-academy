# 🏢 Cimory Sales Academy

Platform pembelajaran digital untuk tim sales **Cimory Group** & **Kanzler**.

---

## 📚 Dokumentasi untuk Tim IT

Dokumentasi lengkap sebagai **pegangan IT** tentang sistem ini. Semua dokumen berbentuk **laporan & requirement**, bukan tutorial.

| # | Dokumen |
|---|---|---|
| 1 | **[Index](docs/00-INDEX.md)** | 
| 2 | **[Executive Summary](docs/01-EXECUTIVE-SUMMARY.md)** |
| 3 | **[System Status](docs/02-SYSTEM-STATUS.md)** |
| 4 | **[Infrastructure Requirements](docs/03-INFRASTRUCTURE-REQUIREMENTS.md)** |
| 5 | **[Performance Report](docs/04-PERFORMANCE-REPORT.md)** |
| 6 | **[Capacity Planning](docs/05-CAPACITY-PLANNING.md)** |
| 7 | **[Budget Estimation](docs/06-BUDGET-ESTIMATION.md)** |
| 8 | **[Technical Specification](docs/07-TECHNICAL-SPECIFICATION.md)** |

---

## 🎯 Quick Summary

### Status Sistem

**Production-ready.** 7 performance test PASS. Error rate < 0.2%.

| Layer | Status |
|---|---|
| Backend (Express) | ✅ Jalan (fitur lama) |
| Backend (NestJS) | 🚧 Migrasi 40% (fitur baru) |
| Database (PostgreSQL) | ✅ Jalan |
| Object Storage (R2) | ✅ Jalan |
| Frontend | ✅ Jalan |

### Requirement Infrastruktur

| Komponen | Requirement | Biaya/bulan |
|---|---|---|
| App Server | 2 vCPU, 4 GB RAM | $24-48 |
| Database | 8 GB PostgreSQL managed | $25 |
| Object Storage | 100 GB, no egress | $1.50 |
| CDN | Global, unlimited | $0 |
| Email | 10.000 email/bulan | $0-20 |
| **TOTAL** | | **$51-95/bulan** |

### Forecast Kebutuhan

| Tahun | Total User | Peak Concurrent | Server Spec |
|---|---|---|---|
| 2026 | 5.146 | ~770 | 2 vCPU, 4 GB |
| 2027 | 6.272 | ~940 | 2 vCPU, 4 GB |
| 2028 | 7.347 | ~1.100 | 2 vCPU, 4 GB |
| 2029 | 8.392 | ~1.260 | 4 vCPU, 8 GB |
| 2030 | 10.396 | ~1.560 | 4 vCPU, 8 GB |

---

## 🏗️ Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js 20, NestJS 10, Express 4, Prisma 6 |
| Database | PostgreSQL 15+ |
| Frontend | Vanilla JavaScript (ES2022) |
| Object Storage | Cloudflare R2 (S3-compatible) |
| CDN | Cloudflare |
| Auth | JWT |

---

## 📊 Fitur Utama

### Untuk User (Sales)

- **Dashboard** — Progress ring, stats (XP/streak/badge), preview leaderboard
- **Belajar** — Chapter → modul linear dengan video player anti-skip
- **Kuis Chapter** — 1 kuis per chapter, terkunci sampai semua modul selesai
- **Quiz Bulanan** — Event bulanan, hanya bisa dikerjakan 1×
- **Fun Fact** — Kartu flip 3D dengan fakta menarik
- **Badges** — 6 tipe kondisi (modules, streak, chapter, perfectQuiz, flashcards, allModules)
- **Leaderboard** — Top Trainee & Quiz Bulanan dengan hadiah
- **Reports** — Embed Power BI dengan access control

### Untuk Admin

- **Dashboard** — Statistik user, top 5 trainee, banner quiz aktif
- **Chapter & Modul** — CRUD lengkap, upload video
- **Kuis Chapter** — Import Excel, view soal
- **Quiz Bulanan** — CRUD, import Excel, toggle active
- **Fun Fact** — CRUD + import Excel
- **Badges** — CRUD, lihat owners
- **Users** — CRUD, reset password, import Excel
- **Leaderboard** — Set hadiah, announcement, generate winners
- **Reports** — CRUD, access control, analytics

### Fitur Keamanan

- **Screenshot Guard** — Deteksi PrintScreen, Ctrl+P/S, Cmd+Shift+3/4/5
- **Video Guard** — Pause otomatis saat blur/tab switch
- **Anti-skip** — Seeking ke depan di-reset
- **Rate Limiting** — Di endpoint login
- **JWT** — Token-based auth dengan expiry 8 jam

---

## 📁 Struktur Project

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
│   ├── css/                 # Style & admin CSS
│   └── assets/              # Logo, mascot
│
├── docs/                    # 📚 Dokumentasi IT
│   ├── 00-INDEX.md
│   ├── 01-EXECUTIVE-SUMMARY.md
│   ├── 02-SYSTEM-STATUS.md
│   ├── 03-INFRASTRUCTURE-REQUIREMENTS.md
│   ├── 04-PERFORMANCE-REPORT.md
│   ├── 05-CAPACITY-PLANNING.md
│   ├── 06-BUDGET-ESTIMATION.md
│   └── 07-TECHNICAL-SPECIFICATION.md
│
└── tests/                   # Test scripts (k6, benchmark)
    └── load/
```

---

## 🚀 Action Items untuk IT

- [ ] Review semua dokumen
- [ ] Approve budget Fase 1 (2026): ~$51-95/bulan
- [ ] Setup VPS (2 vCPU, 4 GB RAM)
- [ ] Setup Supabase Pro account
- [ ] Setup Cloudflare R2 bucket
- [ ] Setup domain & DNS
- [ ] Schedule deployment meeting

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Project Owner** | [Desi Armanda Sari] — [desi.armanda@cimory.com] |
| **Repository** | https://gitlab.com/decision-support-system-group/cimory-academy |

---

## 📄 Lisensi

**Internal use only** — © 2026 Cimory Group. All rights reserved.

Konten, video, dan materi pembelajaran adalah properti Cimory Group & Kanzler. Dilarang mendistribusikan tanpa izin tertulis.

---

**Last Updated:** 29 September 2026