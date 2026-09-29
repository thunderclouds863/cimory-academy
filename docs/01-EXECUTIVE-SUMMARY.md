# Executive Summary — Cimory Sales Academy

**Versi:** 2.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group
**Dari:** Tim Development Cimory Sales Academy

---

## Ringkasan

Cimory Sales Academy adalah platform pembelajaran digital untuk tim sales Cimory Group & Kanzler. Platform ini menyediakan modul video, kuis, leaderboard, dan reports Power BI.

**Status:** Production-ready. 7 performance test PASS.

**Catatan:** Development dilakukan internal. Dokumen ini fokus ke **requirement infrastruktur**.

---

## Status Sistem Saat Ini

### Fitur yang Sudah Jalan ✅

| Fitur | Status |
|---|---|
| Login & Authentication (JWT) | ✅ Production-ready |
| Dashboard user | ✅ Production-ready |
| Belajar (modul video) | ✅ Production-ready |
| Kuis chapter | ✅ Production-ready |
| Quiz bulanan | ✅ Production-ready |
| Fun fact (flashcards) | ✅ Production-ready |
| Badges & XP | ✅ Production-ready |
| Leaderboard | ✅ Production-ready |
| Reports Power BI | ✅ Production-ready |
| Admin panel | ✅ Production-ready |
| Upload ke Cloudflare R2 | ✅ Production-ready |

### Yang Sedang On Going 🚧

| Item | Progress |
|---|---|
| Migrasi backend Express → NestJS | 40% (4/10 modul) |
| Migrasi frontend ke Vite bundler | 0% (planned) |
| Setup CI/CD | 0% (planned) |
| Unit testing | 0% (planned) |

### Requirement Infrastruktur

| Komponen | Requirement | Biaya/bulan |
|---|---|---|
| App Server | 2 vCPU, 4 GB RAM | $24-48 |
| Database | 8 GB PostgreSQL managed | $25 |
| Object Storage | 100 GB, no egress | $1.50 |
| CDN | Global, unlimited | $0 |
| Email | 10.000 email/bulan | $0-20 |
| **TOTAL** | | **$51-95/bulan** |

**Dalam Rupiah:** Rp 800.000 - Rp 1.480.000/bulan

---

## Hasil Performance Test

| # | Test | Concurrent | Error | p(95) | Status |
|---|---|---|---|---|---|
| 1 | Smoke | 1 | 0.00% | 28.08 ms | ✅ PASS |
| 2 | Load | 50 | 0.00% | 27.99 ms | ✅ PASS |
| 3 | Stress | 1.000 | 0.17% | 1.49 s | ✅ PASS |
| 4 | Spike | 500 | 0.00% | 1.3 s | ✅ PASS |
| 5 | Soak (1 jam) | 500 | 0.01% | 1.29 s | ✅ PASS |
| 6 | R2 Benchmark | — | — | 14.46 MB/s | ✅ PASS |
| 7 | Database | 50 | 0.00% | 5.216 TPS | ✅ PASS |

**Kesimpulan:** Server 2 vCPU, 4 GB RAM **kuat sampai ~1.200 concurrent user**.

---

## Forecast Kebutuhan

Berdasarkan forecast headcount HR (2026-2030):

| Tahun | Total User | Peak Concurrent | Server Requirement | Biaya/bulan |
|---|---|---|---|---|
| **2026** | **5.146** | **~770** | **2 vCPU, 4 GB** | **$51-95** |
| **2027** | **6.272** | **~940** | **2 vCPU, 4 GB** | **$62-106** |
| **2028** | **7.347** | **~1.100** | **2 vCPU, 4 GB** | **$62-106** |
| **2029** | **8.392** | **~1.260** | **4 vCPU, 8 GB** | **$162-210** |
| **2030** | **10.396** | **~1.560** | **4 vCPU, 8 GB** | **$162-210** |

**Total 5 tahun (infrastruktur):** ~$4.500-6.000 (~Rp 70-93 juta)

---

## Rekomendasi Infrastruktur

### Fase 1: Launch 2026 (Immediate)

**Server:** 2 vCPU, 4 GB RAM
**Provider:**
- App Server: DigitalOcean / Vultr
- Database: Supabase Pro
- Object Storage: Cloudflare R2
- CDN: Cloudflare Free
- Email: Resend

**Biaya:** ~$51-95/bulan (~Rp 800.000 - 1.480.000)

### Fase 2: Growth 2027-2028

**Server:** 2 vCPU, 4 GB RAM (masih cukup)
**Tambahan:** Redis cache (opsional)

**Biaya:** ~$62-106/bulan

### Fase 3: Scale 2029-2030

**Server:** 4 vCPU, 8 GB RAM + Load Balancer
**Tambahan:** Redis, Cloudflare Pro

**Biaya:** ~$162-210/bulan

### Fase 4: Enterprise 2031+

**Server:** Kubernetes + auto-scaling

**Biaya:** ~$439-489/bulan

---

## Komponen Budget

Budget ini **hanya infrastruktur cloud**:

| ✅ Termasuk | ❌ Tidak Termasuk |
|---|---|
| App Server (VPS) | Development (backend, frontend) |
| Database managed | Design (UI/UX) |
| Object Storage | Content creation |
| CDN | QA & Testing |
| Email service | Deployment setup |
| Monitoring | Maintenance code |

**Alasan:** Development dilakukan internal oleh tim.

## Dokumen Terkait

- **[Index](00-INDEX.md)** — daftar isi lengkap
- **[System Status](02-SYSTEM-STATUS.md)** — status fitur & progress
- **[Infrastructure Requirements](03-INFRASTRUCTURE-REQUIREMENTS.md)** — requirement detail
- **[Performance Report](04-PERFORMANCE-REPORT.md)** — hasil test
- **[Capacity Planning](05-CAPACITY-PLANNING.md)** — forecast
- **[Budget Estimation](06-BUDGET-ESTIMATION.md)** — rincian biaya
- **[Technical Specification](07-TECHNICAL-SPECIFICATION.md)** — spesifikasi teknis