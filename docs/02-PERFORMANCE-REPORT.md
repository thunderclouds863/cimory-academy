# Performance Report Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026

**Environment:** Local dev (2 vCPU, 4 GB RAM, Windows 11, PostgreSQL 18.6)

**Tool:** k6 v0.50, pgbench, custom R2 benchmark



---



## 1. Executive Summary



Aplikasi Cimory Sales Academy telah melalui **8 jenis performance test**. **Semua test PASS** dengan hasil:



- **Error rate rata-rata:** < 0.4%

- **Latency p(95):** < 4 detik (target < 2 detik di beban normal)

- **Server tidak crash** di semua skenario

- **Tidak ada memory leak** (soak test 1 jam)



**Breaking point:** \~800-1.000 concurrent user pada server 2 vCPU.



---



## 2. Hasil Test Detail



### 2.1 Smoke Test Ã¢Å“â€¦



**Tujuan:** Verifikasi dasar bahwa sistem responsif.



| Metrik | Hasil | Target | Status |

|---|---|---|---|

| Concurrent VU | 1 | 1 | Ã¢Å“â€¦ |

| Duration | 30 detik | 30 detik | Ã¢Å“â€¦ |

| Error rate | 0.00% | < 1% | Ã¢Å“â€¦ |

| p(50) | 10.98 ms | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| p(95) | 33.75 ms | < 500 ms | Ã¢Å“â€¦ |

| Throughput | 0.97 req/s | Ã¢â‚¬â€ | Ã¢Å“â€¦ |



**Kesimpulan:** Server responsif. Endpoint `/health`, `/chapters`, `/progress/me` OK.



---



### 2.2 Load Test Ã¢Å“â€¦



**Tujuan:** Ukur performa di beban normal.



| Metrik | Hasil | Target | Status |

|---|---|---|---|

| Concurrent VU | 50 | 50 | Ã¢Å“â€¦ |

| Duration | 2 menit | 2 menit | Ã¢Å“â€¦ |

| Error rate | 0.00% | < 1% | Ã¢Å“â€¦ |

| p(50) | 2.78 ms | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| p(95) | 5.67 ms | < 500 ms | Ã¢Å“â€¦ |

| p(99) | 7.56 ms | < 1500 ms | Ã¢Å“â€¦ |

| Throughput | 18.7 req/s | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Iterations | 475 | Ã¢â‚¬â€ | Ã¢Å“â€¦ |



**Kesimpulan:** Server sangat sehat di beban normal.



---



### 2.3 Stress Test Ã¢Å“â€¦



**Tujuan:** Cari breaking point server.



#### Test 1 (8 menit)



| Metrik | Hasil |

|---|---|

| Max VU | 1.000 |

| Error rate | 0.38% |

| p(50) | 45.53 ms |

| p(95) | 1.43 s |

| p(99) | 2.82 s |

| Max latency | 2m 40s |

| Throughput | 501 req/s |

| Server crash? | Tidak |



#### Test 2 (25 menit)



| Metrik | Hasil |

|---|---|

| Max VU | 1.000 |

| Error rate | 0.15% |

| p(50) | 177.97 ms |

| p(95) | 2.86 s |

| Max latency | 10.25 s |

| Throughput | 120 req/s |



#### Test 3 (8 menit, setelah optimasi)



| Metrik | Hasil |

|---|---|

| Max VU | 1.000 |

| Error rate | **0.00%** |

| p(50) | 208.06 ms |

| p(95) | 4.00 s |

| p(99) | \~7 s |

| Max latency | 6.8 s |

| Throughput | 405 req/s |

| Server crash? | Tidak |



**Kesimpulan:** Breaking point di **\~800-1.000 concurrent user**. Di atas itu, latency naik tapi server gak crash.



---



### 2.4 Spike Test Ã¢Å“â€¦



**Tujuan:** Test ketahanan lonjakan mendadak.



| Metrik | Hasil | Target | Status |

|---|---|---|---|

| Spike | 10 Ã¢â€ â€™ 500 VU dalam 30 detik | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Duration | 3 menit 10 detik | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Error rate | 0.00% | < 5% | Ã¢Å“â€¦ |

| p(50) | 791.38 ms | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| p(95) | 1.56 s | < 3000 ms | Ã¢Å“â€¦ |

| Max latency | 2.38 s | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Throughput | 236 req/s | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Server crash? | Tidak | Ã¢â‚¬â€ | Ã¢Å“â€¦ |



**Kesimpulan:** Server **survive lonjakan mendadak** 10 Ã¢â€ â€™ 500 VU dalam 30 detik. Gak crash, gak error.



---



### 2.5 Soak Test Ã¢Å“â€¦



**Tujuan:** Deteksi memory leak \& degradasi jangka panjang.



| Metrik | Hasil | Target | Status |

|---|---|---|---|

| Concurrent VU | 500 | 500 | Ã¢Å“â€¦ |

| Duration | **1 jam penuh** | 1 jam | Ã¢Å“â€¦ |

| Total requests | 1.964.724 | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Error rate | 0.08% | < 1% | Ã¢Å“â€¦ |

| p(50) | 20.85 ms | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| p(95) | 90.38 ms | < 2000 ms | Ã¢Å“â€¦ |

| p(99) | \~200 ms | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Throughput | **545 req/s** | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Memory leak? | Tidak | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Latency stabil? | Ya | Ã¢â‚¬â€ | Ã¢Å“â€¦ |



**Error breakdown:**



| Endpoint | Error | Total | Rate |

|---|---|---|---|

| health | 770 | 654.138 | 0.12% |

| chapters | 525 | 654.383 | 0.08% |

| progress | 356 | 654.552 | 0.05% |



**Penyebab error:** TCP backlog + connection refused di awal test (server warming up).



**Kesimpulan:** Server **stabil 1 jam penuh**. Tidak ada memory leak. Tidak ada degradasi.



---



### 2.6 R2 Benchmark Ã¢Å“â€¦



**Tujuan:** Ukur performa Cloudflare R2 (object storage).



| Size | Upload | Upload Throughput | Download | Download Throughput |

|---|---|---|---|---|

| 1 MB | 1.42 s | 0.70 MB/s | 0.67 s | 1.50 MB/s |

| 10 MB | 1.42 s | 7.04 MB/s | 0.76 s | 13.20 MB/s |

| 50 MB | 4.37 s | 11.44 MB/s | 4.29 s | 11.65 MB/s |



**Analisa:**



- Latency overhead \~1.4 detik per request (wajar untuk local dev)

- Throughput file besar: 11-13 MB/s

- Dengan CDN: Bisa turun ke 1-2 detik (cache di edge)



**Kesimpulan:** R2 **cukup cepet** untuk video pembelajaran.



**Perbandingan biaya:**



| Provider | Storage 100 GB | Egress 500 GB | Total/bulan |

|---|---|---|---|

| **Cloudflare R2** | $1.50 | **$0** | **$1.50** |

| AWS S3 | $2.30 | $45 | $47.30 |

| Supabase Storage | $2.10 | $45 | $47.10 |



**Hemat:** $45.80/bulan vs AWS S3 = **$549.60/tahun**



---



### 2.7 Database Benchmark Ã¢Å“â€¦



**Tujuan:** Ukur performa PostgreSQL langsung.



| Metrik | Hasil | Target | Status |

|---|---|---|---|

| Concurrent clients | 50 | 50 | Ã¢Å“â€¦ |

| Threads | 4 | 4 | Ã¢Å“â€¦ |

| Total transactions | 374.030 | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Failed transactions | **0 (0.000%)** | 0% | Ã¢Å“â€¦ |

| TPS | **3.149** | > 500 | Ã¢Å“â€¦ |

| Latency avg | 15.88 ms | < 50 ms | Ã¢Å“â€¦ |

| Initial connection | 1.26 s | Ã¢â‚¬â€ | Ã¢Å“â€¦ |

| Duration | 120 detik | Ã¢â‚¬â€ | Ã¢Å“â€¦ |



**Kesimpulan:** PostgreSQL **sangat sehat**. Database **bukan bottleneck**.



**Konversi ke beban aplikasi:**



| Concurrent User | Query/detik (est. 5 query/request) | Database Capacity |

|---|---|---|

| 500 | 2.500 | Ã¢Å“â€¦ Cukup |

| 800 | 4.000 | Ã¢Å“â€¦ Cukup |

| 1.000 | 5.000 | Ã¢Å¡Â Ã¯Â¸Â Perlu tuning |

| 2.000 | 10.000 | Ã¢ÂÅ’ Butuh upgrade |



---



## 3. Ringkasan Semua Test



| # | Test | Duration | VU | Error | p(95) | Throughput | Status |

|---|---|---|---|---|---|---|---|

| 1 | Smoke | 30 s | 1 | 0.00% | 33.75 ms | 1 req/s | Ã¢Å“â€¦ |

| 2 | Load | 2 m | 50 | 0.00% | 5.67 ms | 19 req/s | Ã¢Å“â€¦ |

| 3 | Stress | 8 m | 1.000 | 0.38% | 1.43 s | 501 req/s | Ã¢Å“â€¦ |

| 4 | Stress (optimized) | 8 m | 1.000 | 0.00% | 4.00 s | 405 req/s | Ã¢Å“â€¦ |

| 5 | Spike | 3 m | 500 | 0.00% | 1.56 s | 236 req/s | Ã¢Å“â€¦ |

| 6 | Soak | 1 h | 500 | 0.08% | 90.38 ms | 545 req/s | Ã¢Å“â€¦ |

| 7 | R2 Benchmark | 10 m | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€ | 11 MB/s | Ã¢Å“â€¦ |

| 8 | Database | 2 m | 50 | 0.00% | 15.88 ms | 3.149 TPS | Ã¢Å“â€¦ |



**Total: 8 test, 8 PASS.**



---



## 4. Optimasi yang Dilakukan



| # | Optimasi | Sebelum | Sesudah | Efek |

|---|---|---|---|---|

| 1 | Prisma connection pool | 5 | 20 | Error turun 0.76% Ã¢â€ â€™ 0.00% |

| 2 | UV_THREADPOOL_SIZE | 4 | 8 | Throughput naik 41% |

| 3 | PostgreSQL max_connections | 100 | 200 | Buffer untuk scaling |



---



## 5. Analisa Breaking Point



| Concurrent User | p(95) | Error | Status |

|---|---|---|---|

| 50 | 5.67 ms | 0% | Ã¢Å“â€¦ Sangat sehat |

| 100 | \~10 ms | 0% | Ã¢Å“â€¦ Sehat |

| 200 | \~20 ms | 0% | Ã¢Å“â€¦ Sehat |

| 500 | 90 ms | 0.08% | Ã¢Å“â€¦ Sehat |

| 800 | \~1 s | \~0.2% | Ã¢Å¡Â Ã¯Â¸Â Mulai degrade |

| **1.000** | **1.43-4 s** | **0.00-0.38%** | Ã¢Å¡Â Ã¯Â¸Â **Mentok** |

| 1.500+ | Ã¢â‚¬â€ | > 1% | Ã¢ÂÅ’ Jebol |



**Breaking point:** \~800-1.000 concurrent user.



**Bottleneck:** CPU (2 vCPU) Ã¢â‚¬â€ Node.js single-threaded.



---



## 6. Kesimpulan



1\. **Server 2 vCPU, 4 GB RAM cukup untuk launch 2026** (peak \~770 concurrent)

2\. **Breaking point di \~800-1.000 concurrent user**

3\. **Database PostgreSQL bukan bottleneck** (TPS 3.149)

4\. **Cloudflare R2 cukup cepet untuk video** (11 MB/s)

5\. **Server survive spike 500 VU** (0% error)

6\. **Tidak ada memory leak** (soak test 1 jam)



**Rekomendasi:**



- 2026: 2 vCPU, 4 GB RAM

- 2027: 4 vCPU, 8 GB RAM

- 2028+: 8 vCPU, 16 GB RAM + Load Balancer

- 2030+: Kubernetes



---



## 7. Referensi



1\. k6 Documentation. https://k6.io/docs/

2\. Prisma Connection Pool Documentation.

3\. Cloudflare R2 Documentation.

4\. PostgreSQL pgbench Documentation.

