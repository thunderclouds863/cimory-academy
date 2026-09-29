# Executive Summary — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group
**Dari:** Tim Development Cimory Sales Academy

---

## Ringkasan

Cimory Sales Academy adalah platform pembelajaran digital untuk tim sales Cimory Group & Kanzler. Platform ini menyediakan modul video, kuis, leaderboard, dan reports Power BI.

**Status:** Aplikasi siap production. Telah melalui 7 jenis performance test dengan hasil **semua PASS**.

---

## Requirement Utama

Berdasarkan forecast headcount dan hasil performance test, berikut requirement infrastruktur:

| Komponen | Requirement | Biaya/bulan |
|---|---|---|
| **App Server** | 2 vCPU, 4 GB RAM, 80 GB SSD | $24-48 |
| **Database** | PostgreSQL 15+ managed, 8 GB | $25 |
| **Object Storage** | S3-compatible, 100 GB, no egress fee | $1.50 |
| **CDN** | Global CDN, unlimited bandwidth | $0 |
| **Email** | SMTP 10.000 email/bulan | $0-20 |
| **Monitoring** | Uptime + error tracking | $0 |
| **TOTAL** | | **$51-95/bulan** |

**Dalam Rupiah:** Rp 800.000 - Rp 1.480.000/bulan

---

## Hasil Performance Test

| # | Test | Concurrent User | Error Rate | p(95) | Status |
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

## Forecast Kebutuhan Infrastruktur

Berdasarkan forecast headcount HR (2026-2030):

| Tahun | Total HC | Peak Concurrent | Server Requirement | Biaya/bulan |
|---|---|---|---|---|
| **2026** | **5.146** | **~770** | **2 vCPU, 4 GB** | **$51-95** |
| **2027** | **6.272** | **~940** | **2 vCPU, 4 GB** | **$62-106** |
| **2028** | **7.347** | **~1.100** | **2 vCPU, 4 GB** | **$62-106** |
| **2029** | **8.392** | **~1.260** | **4 vCPU, 8 GB** | **$162-210** |
| **2030** | **10.396** | **~1.560** | **4 vCPU, 8 GB** | **$162-210** |

**Total 5 tahun:** ~$4.500-6.000 (~Rp 70-93 juta)

---

## Rekomendasi

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

## Keuntungan Cloudflare R2 vs AWS S3

| Komponen | Cloudflare R2 | AWS S3 | Hemat |
|---|---|---|---|
| Storage 100 GB | $1.50 | $2.30 | $0.80 |
| Egress 500 GB | **$0** | **$45** | **$45** |
| **Total/bulan** | **$1.50** | **$47.30** | **$45.80** |

**Hemat 5 tahun:** ~$2.748 (~Rp 42.6 juta)

---

## Action Items untuk IT

- [ ] Review dokumen ini
- [ ] Approve budget Fase 1 (2026): ~$51-95/bulan
- [ ] Setup VPS (2 vCPU, 4 GB RAM)
- [ ] Setup Supabase Pro account
- [ ] Setup Cloudflare R2 bucket
- [ ] Setup domain & DNS
- [ ] Schedule deployment meeting

---

## Dokumen Terkait

- **[Infrastructure Requirements](02-INFRASTRUCTURE-REQUIREMENTS.md)** — requirement detail
- **[Performance Report](03-PERFORMANCE-REPORT.md)** — hasil test lengkap
- **[Capacity Planning](04-CAPACITY-PLANNING.md)** — forecast & kalkulasi
- **[Budget Estimation](05-BUDGET-ESTIMATION.md)** — rincian biaya
- **[Technical Specification](06-TECHNICAL-SPECIFICATION.md)** — spesifikasi teknis