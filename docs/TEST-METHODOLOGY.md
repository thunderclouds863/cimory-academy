# Test Methodology Ã¢â‚¬â€ Cimory Sales Academy



**Tujuan:** Menjelaskan metodologi test performance yang digunakan.



---



## 1. Jenis Test



### 1.1 Smoke Test



**Tujuan:** Verifikasi dasar bahwa sistem responsif.



**Beban:** 1-5 user



**Durasi:** 1 menit



**Expected:** 100% sukses, latency < 100ms



### 1.2 Load Test



**Tujuan:** Ukur performa di beban normal.



**Beban:** 50-100 user



**Durasi:** 5-10 menit



**Expected:** 0% error, p95 < 500ms



### 1.3 Stress Test



**Tujuan:** Cari breaking point server.



**Beban:** Ramp up 100 Ã¢â€ â€™ 1.000+ user



**Durasi:** 10-15 menit



**Expected:** Error mulai muncul di titik tertentu



### 1.4 Spike Test



**Tujuan:** Test ketahanan lonjakan mendadak.



**Beban:** 10 Ã¢â€ â€™ 500 user dalam 30 detik Ã¢â€ â€™ 10 user



**Durasi:** 5 menit



**Expected:** Server survive, gak crash



### 1.5 Soak Test



**Tujuan:** Deteksi memory leak \& degradasi jangka panjang.



**Beban:** 500 user konstan



**Durasi:** 1 jam



**Expected:** Latency stabil dari awal sampai akhir



### 1.6 R2 Benchmark



**Tujuan:** Ukur performa Cloudflare R2 (object storage).



**Beban:** Upload/download file 1MB, 10MB, 50MB



**Durasi:** 10 menit



**Expected:** Throughput > 10 MB/s



### 1.7 Database Benchmark



**Tujuan:** Ukur performa PostgreSQL langsung.



**Beban:** pgbench dengan 50 concurrent client



**Durasi:** 5 menit



**Expected:** TPS > 500



---



## 2. Tools



| Tool | Fungsi |

|---|---|

| **k6** | Load/stress/soak/spike test |

| **autocannon** | HTTP benchmark cepat |

| **pgbench** | PostgreSQL benchmark |

| **AWS SDK** | R2 benchmark |



---



## 3. Metrics



| Metric | Deskripsi | Target |

|---|---|---|

| **Error Rate** | % request yang gagal (4xx/5xx) | < 1% |

| **p(50)** | Median latency | Ã¢â‚¬â€ |

| **p(95)** | 95% request < X ms | < 500ms |

| **p(99)** | 99% request < X ms | < 1500ms |

| **Throughput** | Request/detik | Ã¢â‚¬â€ |

| **Iterations** | Berapa kali skenario selesai | Ã¢â‚¬â€ |

| **VU** | Virtual User (concurrent) | Ã¢â‚¬â€ |



---



## 4. Thresholds



Setiap test punya threshold yang harus dipenuhi:



| Test | Threshold |

|---|---|

| Load | p95 < 500ms, error < 1% |

| Stress | p95 < 2000ms, error < 10% |

| Spike | error < 5% |

| Soak | p95 < 2000ms, error < 1% |

| R2 | throughput > 10 MB/s |



**Kalau threshold dilanggar** Ã¢â€ â€™ test dianggap **fail**, tapi **tetap dicatat** sebagai temuan.



---



## 5. Environment



- **OS:** Windows 11 (local dev)

- **CPU:** [spec CPU lo]

- **RAM:** [spec RAM lo]

- **Node:** v24.x

- **PostgreSQL:** v15

- **Testing:** Local development



**Catatan:** Hasil test di local dev bisa berbeda dengan production. Untuk production, test ulang di server target.

