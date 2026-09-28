# Capacity Model â€” Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026

**Tujuan:** Menentukan spesifikasi server berdasarkan forecast pertumbuhan user.



---



## 1. Data Historis Headcount



| Tahun | Headcount | YoY Change |

|---|---|---|

| 2019 | 142 | â€” |

| 2020 | 90 | -52 |

| 2021 | 310 | +220 |

| 2022 | 445 | +135 |

| 2023 | 476 | +31 |

| 2024 | 436 | -40 |

| 2025 | 865 | +429 |

| **2026** | **1.202** | **+337** |



*Sumber: Data HR Cimory Group*



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



## 3. Rasio Concurrent User â€” Referensi



**Definisi:** Concurrent user = jumlah user yang mengakses sistem bersamaan di peak hour.



**Standar industri:**



| Sumber | Rasio Concurrent | Catatan |

|---|---|---|

| Infor | \~10% | "of 100 users, 10 users would be concurrent" |

| Unit4 | \~10% | "Maximum level of concurrency" |

| TTAK.KO-10.0292 (Korea) | 1-10% | Standar nasional Korea |

| TOTVS (Brazil) | 10-30% | "entre 10% e 30%" |



**Rekomendasi:** **15%** â€” konservatif-modern, di tengah range standar industri.



**Alasan naik dari 10% ke 15%:**



1\. Platform internal (user lebih terikat, wajib training)

2\. Target sales (mobile worker, akses kapan aja)

3\. Konten video (long session 15-30 menit)



**Formula alternatif (lebih akurat):**



```

Concurrent = (Total user Ã— % aktif harian Ã— Durasi sesi) / Jam kerja

```



Contoh untuk 4.449 user (2026):



- 30% aktif harian = 1.334 user

- Durasi 20 menit = 1/3 jam

- Jam kerja 8 jam

- **Concurrent = (1.334 Ã— 0.33) / 8 = 55 user**



**Catatan:** Formula ini menghasilkan angka lebih kecil dari 15%. Jadi 15% adalah **safety margin**.



---



## 4. Proyeksi Concurrent User



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

| 2026 | 5.146 | \~1.800 | \~270 |

| 2027 | 6.272 | \~2.200 | \~330 |

| 2028 | 7.347 | \~2.570 | \~385 |

| 2029 | 8.392 | \~2.940 | \~440 |

| 2030 | 10.396 | \~3.640 | \~545 |



**Rekomendasi:** Pakai **Skenario A** sebagai **upper bound** â€” biar server cukup untuk worst case.



---



## 5. Kebutuhan vs Kapasitas Server



| Tahun | Peak Concurrent | Server Sekarang (2 vCPU) | Status |

|---|---|---|---|

| **2026** | 770 | Kuat sampai 1.000 | âœ… **Cukup** |

| **2027** | 940 | Kuat sampai 1.000 | âš ï¸ **Pas-pasan** |

| **2028** | 1.100 | Kuat sampai 1.000 | âŒ **Kurang** |

| **2029** | 1.260 | Kuat sampai 1.000 | âŒ **Kurang** |

| **2030** | 1.560 | Kuat sampai 1.000 | âŒ **Kurang** |



**Kesimpulan:**



- **2026:** Server sekarang cukup âœ…

- **2027:** Mulai butuh upgrade

- **2028+:** Wajib upgrade



---



## 6. Rekomendasi Server per Fase



### Fase 1: Launch (2026)



**Target:** 5.146 user, peak \~770 concurrent

**Server:** 2 vCPU, 4 GB RAM (sekarang)

**Buffer:** 1.3x dari kebutuhan



### Fase 2: Growth (2027)



**Target:** 6.272 user, peak \~940 concurrent

**Upgrade ke:** 4 vCPU, 8 GB RAM + Nginx

**Buffer:** 2x dari kebutuhan



### Fase 3: Scale (2028-2029)



**Target:** 8.392 user, peak \~1.260 concurrent

**Upgrade ke:** 8 vCPU, 16 GB RAM + Load Balancer + Redis

**Buffer:** 4x dari kebutuhan



### Fase 4: Enterprise (2030+)



**Target:** 10.396+ user, peak \~1.560 concurrent

**Upgrade ke:** Kubernetes + auto-scaling

**Buffer:** Auto-scaling



---



## 7. Ringkasan Rekomendasi



| Fase | Tahun | Target User | Peak Concurrent | Server Spec |

|---|---|---|---|---|

| 1 | 2026 | 5.146 | \~770 | 2 vCPU, 4 GB |

| 2 | 2027 | 6.272 | \~940 | 4 vCPU, 8 GB + Nginx |

| 3 | 2028-2029 | 8.392 | \~1.260 | 8 vCPU, 16 GB + LB |

| 4 | 2030+ | 10.396+ | \~1.560 | Kubernetes |



---



## 8. Referensi



1\. Infor. "Concurrent User Sizing Guidelines."

2\. Unit4. "Concurrent User Definition."

3\. TTAK.KO-10.0292. "ì†Œí”„íŠ¸ì›¨ì–´ ì‚¬ì—… ê·œëª¨ ì‚°ì • ì§€ì¹¨."

4\. TOTVS. "Dimensionamento de UsuÃ¡rios Concorrentes."

5\. Cimory Group HR Data (internal).

