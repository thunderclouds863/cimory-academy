# Capacity Planning — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group

---

## 1. Data Headcount Historis

| Tahun | Headcount | YoY Change |
|---|---|---|
| 2019 | 142 | — |
| 2020 | 90 | -52 |
| 2021 | 310 | +220 |
| 2022 | 445 | +135 |
| 2023 | 476 | +31 |
| 2024 | 436 | -40 |
| 2025 | 865 | +429 |
| **2026** | **1.202** | **+337** |

**Current HC 2026:** 4.449
**Act Resign 2026 (YTD):** 93
**Forecast Resign 2026:** 124
**Rate Resign:** 2.79%

---

## 2. Forecast Headcount 2026-2030

| Tahun | Opening HC | Addition | Resign | Net Change | Forecast Next Year |
|---|---|---|---|---|---|
| 2026 | 5.146 | +1.250 | -124 | +1.126 | **6.272** |
| 2027 | 6.272 | +1.250 | -175 | +1.075 | **7.347** |
| 2028 | 7.347 | +1.250 | -205 | +1.045 | **8.392** |
| 2029 | 8.392 | +1.250 | -234 | +1.016 | **9.408** |
| 2030 | 9.408 | +1.250 | -262 | +988 | **10.396** |

**Pertumbuhan rata-rata:** 15-20% per tahun.

---

## 3. Rasio Concurrent User

**Definisi:** Concurrent user = jumlah user yang mengakses sistem bersamaan di peak hour.

**Standar industri:**

| Sumber | Rasio Concurrent | Catatan |
|---|---|---|
| Infor | ~10% | "of 100 users, 10 users would be concurrent" |
| Unit4 | ~10% | "Maximum level of concurrency" |
| TTAK.KO-10.0292 (Korea) | 1-10% | Standar nasional Korea |
| TOTVS (Brazil) | 10-30% | "entre 10% e 30%" |

**Rekomendasi:** **15%** — konservatif-modern, di tengah range standar industri.

**Alasan:**
1. Platform internal (user lebih terikat, wajib training)
2. Target sales (mobile worker, akses kapan aja)
3. Konten video (long session 15-30 menit)

---

## 4. Proyeksi Concurrent User

**Skenario A: Semua HC (semua karyawan bisa akses)**

| Tahun | Total HC | Peak Concurrent (15%) |
|---|---|---|
| 2026 | 5.146 | **~770** |
| 2027 | 6.272 | **~940** |
| 2028 | 7.347 | **~1.100** |
| 2029 | 8.392 | **~1.260** |
| 2030 | 10.396 | **~1.560** |

**Skenario B: Sales Only (~35% dari HC)**

| Tahun | Total HC | Sales | Peak Concurrent (15%) |
|---|---|---|---|
| 2026 | 5.146 | ~1.800 | ~270 |
| 2027 | 6.272 | ~2.200 | ~330 |
| 2028 | 7.347 | ~2.570 | ~385 |
| 2029 | 8.392 | ~2.940 | ~440 |
| 2030 | 10.396 | ~3.640 | ~545 |

**Rekomendasi:** Pakai **Skenario A** sebagai upper bound.

---

## 5. Kebutuhan vs Kapasitas Server

### 5.1 Kapasitas Server Sekarang

**Server:** 2 vCPU, 4 GB RAM

Berdasarkan hasil test:
- **Breaking point:** ~1.200 concurrent user
- **Optimal:** 500-1.000 concurrent user

### 5.2 Perbandingan

| Tahun | Peak Concurrent | Server Sekarang (2 vCPU) | Status |
|---|---|---|---|
| **2026** | **~770** | **Kuat sampai ~1.200** | ✅ **1.6x buffer** |
| **2027** | **~940** | **Kuat sampai ~1.200** | ✅ **1.3x buffer** |
| **2028** | **~1.100** | **Kuat sampai ~1.200** | ✅ **1.1x buffer** |
| **2029** | **~1.260** | **Kuat sampai ~1.200** | ⚠️ **Pas-pasan** |
| **2030** | **~1.560** | **Kuat sampai ~1.200** | ❌ **Kurang** |

**Kesimpulan:**
- **2026-2028:** Server sekarang cukup ✅
- **2029:** Pas-pasan, mulai butuh upgrade
- **2030:** Wajib upgrade

---

## 6. Rekomendasi Server per Fase

### Fase 1: Launch (2026)

| Item | Requirement |
|---|---|
| Target User | 5.146 |
| Peak Concurrent | ~770 |
| **Server** | **2 vCPU, 4 GB RAM** |
| Buffer | 1.6x |
| Estimasi Biaya | $51-95/bulan |

### Fase 2: Growth (2027-2028)

| Item | Requirement |
|---|---|
| Target User | 6.272-7.347 |
| Peak Concurrent | ~940-1.100 |
| **Server** | **2 vCPU, 4 GB RAM** (masih cukup) |
| Tambahan | Redis cache (opsional) |
| Estimasi Biaya | $62-106/bulan |

### Fase 3: Scale (2029-2030)

| Item | Requirement |
|---|---|
| Target User | 8.392-10.396 |
| Peak Concurrent | ~1.260-1.560 |
| **Server** | **4 vCPU, 8 GB RAM + Load Balancer** |
| Tambahan | Redis, Cloudflare Pro |
| Estimasi Biaya | $162-210/bulan |

### Fase 4: Enterprise (2031+)

| Item | Requirement |
|---|---|
| Target User | > 10.396 |
| Peak Concurrent | > 1.560 |
| **Server** | **Kubernetes + auto-scaling** |
| Estimasi Biaya | $439-489/bulan |

---

## 7. Ringkasan Rekomendasi

| Fase | Tahun | Target User | Peak Concurrent | Server Spec | Biaya/bulan |
|---|---|---|---|---|---|
| 1 | 2026 | 5.146 | ~770 | 2 vCPU, 4 GB | $51-95 |
| 2 | 2027-2028 | 7.347 | ~1.100 | 2 vCPU, 4 GB + Redis | $62-106 |
| 3 | 2029-2030 | 10.396 | ~1.560 | 4 vCPU, 8 GB + LB | $162-210 |
| 4 | 2031+ | > 10.396 | > 1.560 | Kubernetes | $439-489 |

**Total 5 tahun (2026-2030):** ~$4.500-6.000 (~Rp 70-93 juta)

---

## 8. Referensi

1. Infor. "Concurrent User Sizing Guidelines."
2. Unit4. "Concurrent User Definition."
3. TTAK.KO-10.0292. "소프트웨어 사업 규모 산정 지침."
4. TOTVS. "Dimensionamento de Usuários Concorrentes."
5. Cimory Group HR Data (internal).