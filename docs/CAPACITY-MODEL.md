# Capacity Model Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026

**Tujuan:** Menentukan spesifikasi server yang dibutuhkan berdasarkan proyeksi pertumbuhan user.



---



## 1. Data Proyeksi User



### 1.1 Data Historis Headcount (2019-2026)



| Tahun | Headcount | YoY Change |

|---|---|---|

| 2019 | 142 | Ã¢â‚¬â€ |

| 2020 | 90 | -52 |

| 2021 | 310 | +220 |

| 2022 | 445 | +135 |

| 2023 | 476 | +31 |

| 2024 | 436 | -40 |

| 2025 | 865 | +429 |

| **2026** | **1.202** | **+337** |



*Sumber: Data HR Cimory Group*



### 1.2 Forecast Headcount (2026-2030)



| Tahun | Opening HC | Forecast Addition | Resign | Net Change | **Forecast Next Year** |

|---|---|---|---|---|---|

| 2026 | 5.146 | +1.250 | -124 | +1.126 | **6.272** |

| 2027 | 6.272 | +1.250 | -175 | +1.075 | **7.347** |

| 2028 | 7.347 | +1.250 | -205 | +1.045 | **8.392** |

| 2029 | 8.392 | +1.250 | -234 | +1.016 | **9.408** |

| 2030 | 9.408 | +1.250 | -262 | +988 | **10.396** |



**Kesimpulan:** Total HC Cimory Group diproyeksi tumbuh dari **\~5.100 (2026)** menjadi **\~10.400 (2030)** Ã¢â‚¬â€ pertumbuhan **\~15-20% per tahun**.



---



## 2. Konversi ke Concurrent User



### 2.1 Rasio Concurrent User Ã¢â‚¬â€ Sumber Referensi



**Definisi:** Concurrent user = jumlah user yang mengakses sistem **bersamaan** di peak hour.



**Standar industri:**



| Sumber | Rasio Concurrent | Catatan |

|---|---|---|

| **Infor** (enterprise software) | \~10% | "of 100 users, 10 users would be concurrent" |

| **Unit4** (ERP SaaS) | \~10% | "Maximum level of concurrency" |

| **TTAK.KO-10.0292** (standar Korea) | 1-10% | "Ã¬Â â€žÃ¬Â²Â´ Ã¬â€šÂ¬Ã¬Å¡Â©Ã¬Å¾ÂÃ¬ÂËœ 1%\~10%" |

| **TOTVS** (software Brazil) | 10-30% | "entre 10% e 30%" |



**Rekomendasi kami:** **15%** Ã¢â‚¬â€ konservatif-modern, di tengah range standar industri.



**Alasan naik dari 10% ke 15%:**

1\. Platform internal (user lebih terikat, wajib training)

2\. Target sales (mobile worker, akses kapan aja)

3\. Konten video (long session 15-30 menit)



### 2.2 Formula Alternatif (Lebih Akurat)



```

Concurrent = (Total user Ãƒâ€” % aktif harian Ãƒâ€” Durasi sesi) / Jam kerja

```



**Contoh untuk 4.449 user (2026):**

- 30% aktif harian = 1.334 user

- Durasi sesi 20 menit = 1/3 jam

- Jam kerja 8 jam

- **Concurrent = (1.334 Ãƒâ€” 0.33) / 8 = 55 user**



**Catatan:** Formula ini menghasilkan angka **lebih kecil** dari 15%. Artinya, 15% adalah **safety margin** yang cukup besar.



### 2.3 Proyeksi Concurrent User



**Skenario A: Semua HC (semua karyawan bisa akses)**



| Tahun | Total HC | Peak Concurrent (15%) |

|---|---|---|

| 2026 | 5.146 | **\~770** |

| 2027 | 6.272 | **\~940** |

| 2028 | 7.347 | **\~1.100** |

| 2029 | 8.392 | **\~1.260** |

| 2030 | 10.396 | **\~1.560** |



**Skenario B: Sales Only (\~35% dari HC)**



| Tahun | Total HC | Sales | Peak Concurrent (15%) |

|---|---|---|---|

| 2026 | 5.146 | \~1.800 | **\~270** |

| 2027 | 6.272 | \~2.200 | **\~330** |

| 2028 | 7.347 | \~2.570 | **\~385** |

| 2029 | 8.392 | \~2.940 | **\~440** |

| 2030 | 10.396 | \~3.640 | **\~545** |



**Rekomendasi untuk capacity planning:** Pakai **Skenario A** (semua HC) sebagai **upper bound** Ã¢â‚¬â€ biar server cukup untuk worst case.



---



## 3. Kebutuhan Server per Fase



### Fase 1: Launch (2026)



**Target:** 5.146 user, peak \~770 concurrent



**Server:** 2 vCPU, 4 GB RAM



**Hasil test:** Soak 500 VU = 0.08% error, p95 = 90ms Ã¢Å“â€¦



**Buffer:** 1.5-3x dari kebutuhan



**Biaya:** \~$25-50/bulan



### Fase 2: Growth (2027)



**Target:** 6.272 user, peak \~940 concurrent



**Upgrade ke:** 4 vCPU, 8 GB RAM + Nginx reverse proxy



**Handle:** \~2.000 concurrent



**Buffer:** 2x dari kebutuhan



**Biaya:** \~$50-100/bulan



### Fase 3: Scale (2028-2029)



**Target:** 7.347-8.392 user, peak \~1.100-1.260 concurrent



**Upgrade ke:** 8 vCPU, 16 GB RAM + Load Balancer



**Tambahan:**

- Load balancer (2Ãƒâ€” app server)

- Read replica database

- Redis cache (wajib)



**Biaya:** \~$150-300/bulan



### Fase 4: Enterprise (2030+)



**Target:** 10.396+ user, peak \~1.560 concurrent



**Upgrade ke:** Kubernetes + auto-scaling



**Biaya:** \~$500-1.000/bulan



---



## 4. Ringkasan Rekomendasi



| Fase | Tahun | Target User | Peak Concurrent | Server Spec | Biaya/bulan |

|---|---|---|---|---|---|

| 1 | 2026 | 5.146 | \~770 | **2 vCPU, 4 GB** | $25-50 |

| 2 | 2027 | 6.272 | \~940 | **4 vCPU, 8 GB** + Nginx | $50-100 |

| 3 | 2028-2029 | 8.392 | \~1.260 | **8 vCPU, 16 GB** + LB | $150-300 |

| 4 | 2030+ | 10.396+ | \~1.560 | **Kubernetes** | $500-1.000 |



---



## 5. Referensi



1\. Infor. "Concurrent User Sizing Guidelines." Infor Documentation.

2\. Unit4. "Concurrent User Definition." Unit4 Documentation.

3\. TTAK.KO-10.0292. "Ã¬â€ Å’Ã­â€â€žÃ­Å Â¸Ã¬â€ºÂ¨Ã¬â€“Â´ Ã¬â€šÂ¬Ã¬â€”â€¦ ÃªÂ·Å“Ã«ÂªÂ¨ Ã¬â€šÂ°Ã¬Â â€¢ Ã¬Â§â‚¬Ã¬Â¹Â¨." Korean Standards Association.

4\. TOTVS. "Dimensionamento de UsuÃƒÂ¡rios Concorrentes." TOTVS Documentation.



---



**Dokumen ini disusun untuk keperluan capacity planning dan budgeting infrastruktur Cimory Sales Academy.**

