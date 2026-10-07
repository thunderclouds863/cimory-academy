# 🏢 Cimory Sales Academy

Platform pembelajaran digital (LMS) untuk tim sales **Cimory Group** & **Kanzler**.

**Status:** Production-ready. 7 performance test PASS.

---

## 📚 Dokumentasi Handover

Dokumentasi lengkap untuk **handover source code** ke tim IT.

| # | Dokumen | Isi |
|---|---|---|
| 1 | **[📌 Handover](docs/HANDOVER.md)** | **Dokumen utama** — handover lengkap |
| 2 | **[Index](docs/00-INDEX.md)** | Daftar isi |
| 3 | **[System Status](docs/02-SYSTEM-STATUS.md)** | Status fitur & progress |
| 4 | **[Performance Report](docs/04-PERFORMANCE-REPORT.md)** | Hasil 7 test |
| 5 | **[Features Documentation](docs/08-FEATURES-DOCUMENTATION.md)** | Dokumentasi fitur lengkap |

---

## 🎯 Status Sistem

| Layer | Status |
|---|---|
| Backend (Express) | ✅ Jalan (fitur lama) |
| Backend (NestJS) | 🚧 Migrasi 40% (fitur baru) |
| Database (PostgreSQL) | ✅ Jalan |
| Object Storage (R2) | ✅ Jalan |
| Frontend | ✅ Jalan |

### Done / On Going / Planning

| Kategori | Item |
|---|---|
| **✅ Done** | Auth, chapters, quizzes, flashcards, badges, leaderboard, reports, admin panel, security |
| **🚧 On Going** | Migrasi backend Express → NestJS (40%), setup CI/CD, monitoring |
| **📋 Planning** | Unit testing, migrasi frontend, multi-department, HLS streaming |

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
├── docs/                    # 📚 Dokumentasi handover
│   ├── HANDOVER.md
│   ├── 00-INDEX.md
│   ├── 02-SYSTEM-STATUS.md
│   ├── 04-PERFORMANCE-REPORT.md
│   └── 08-FEATURES-DOCUMENTATION.md
│
└── tests/                   # Test scripts (k6, benchmark)
    └── load/
```

---

## 🔮 Future Roadmap

**Current:** LMS khusus tim sales
**Future:** LMS untuk semua divisi Cimory Group

**Perubahan yang dibutuhkan:**
- Multi-tenant (support multiple department)
- Custom branding per department
- Role per department
- Learning path custom per role

**Estimasi:** ~3 bulan development.

Detail lengkap: lihat **[Handover](docs/HANDOVER.md)** section 8.

---

## 📞 Kontak

| Role | Kontak |
|---|---|
| **Project Owner** | Desi Armanda Sari — desi.armanda@cimory.com |
| **Repository** | https://gitlab.com/decision-support-system-group/cimory-academy |

---

## 📄 Lisensi

**Internal use only** — © 2026 Cimory Group. All rights reserved.

Konten, video, dan materi pembelajaran adalah properti Cimory Group & Kanzler. Dilarang mendistribusikan tanpa izin tertulis.

---

**Last Updated:** 6 Oktober 2026