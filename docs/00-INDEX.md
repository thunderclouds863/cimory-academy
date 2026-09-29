# 📚 Dokumentasi — Cimory Sales Academy

**Versi:** 2.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group

---

## Tentang Dokumen Ini

Dokumentasi ini adalah **pegangan untuk tim IT** tentang sistem Cimory Sales Academy. Isinya:

1. **Status sistem saat ini** — fitur apa aja yang udah jalan
2. **Progress development** — lagi on going apa
3. **Requirement infrastruktur** — butuh apa buat production

**Catatan:** Development dilakukan internal. Dokumentasi ini fokus ke **requirement infrastruktur** yang dibutuhkan sistem.

---

## Daftar Dokumen

| # | Dokumen | Isi |
|---|---|---|
| 1 | **[Executive Summary](01-EXECUTIVE-SUMMARY.md)** | Ringkasan 1 halaman |
| 2 | **[System Status](02-SYSTEM-STATUS.md)** | Status fitur & progress development | 
| 3 | **[Infrastructure Requirements](03-INFRASTRUCTURE-REQUIREMENTS.md)** | Requirement detail (server, DB, storage) |
| 4 | **[Performance Report](04-PERFORMANCE-REPORT.md)** | Hasil 7 test performance |
| 5 | **[Capacity Planning](05-CAPACITY-PLANNING.md)** | Forecast & proyeksi kebutuhan |
| 6 | **[Budget Estimation](06-BUDGET-ESTIMATION.md)** | Budget infrastruktur (development internal) |
| 7 | **[Technical Specification](07-TECHNICAL-SPECIFICATION.md)** | Spesifikasi teknis lengkap |

---

## Quick Summary

### Status Sistem

**Production-ready.** 7 performance test PASS. Error rate < 0.2%.

| Layer | Status |
|---|---|
| Backend (Express) | ✅ Jalan (fitur lama) |
| Backend (NestJS) | 🚧 Migrasi bertahap (fitur baru) |
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


## 📞 Kontak

**Project Owner:** [Desi Armanda Sari]  
**Email:** [desi.armanda@cimory.com]  
**Repository:** https://gitlab.com/decision-support-system-group/cimory-academy

**Last Updated:** 29 September 2026