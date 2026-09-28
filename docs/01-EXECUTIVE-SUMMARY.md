# Executive Summary Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026

**Status:** Siap review IT



---



## Ringkasan



Cimory Sales Academy adalah platform pembelajaran digital untuk tim sales Cimory Group \& Kanzler. Platform ini menyediakan modul video, kuis, leaderboard, dan reports Power BI.



**Status teknis:** Aplikasi siap production. Telah melalui 8 jenis performance test dengan hasil **semua PASS**.



---



## Hasil Test Performance



| # | Test | Concurrent User | Error Rate | p(95) | Status |

|---|---|---|---|---|---|

| 1 | Smoke | 1 | 0.00% | 33.75 ms | Ã¢Å“â€¦ PASS |

| 2 | Load | 50 | 0.00% | 5.67 ms | Ã¢Å“â€¦ PASS |

| 3 | Stress | 1.000 | 0.38% | 1.43 s | Ã¢Å“â€¦ PASS |

| 4 | Stress (optimized) | 1.000 | 0.00% | 4.00 s | Ã¢Å“â€¦ PASS |

| 5 | Spike | 500 | 0.00% | 1.56 s | Ã¢Å“â€¦ PASS |

| 6 | Soak (1 jam) | 500 | 0.08% | 90.38 ms | Ã¢Å“â€¦ PASS |

| 7 | R2 Benchmark | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢â‚¬â€ | Ã¢Å“â€¦ PASS |

| 8 | Database Benchmark | 50 | 0.00% | 15.88 ms | Ã¢Å“â€¦ PASS |



**Kesimpulan:** Server 2 vCPU, 4 GB RAM **cukup untuk launch 2026** (target 5.146 user, peak \~770 concurrent).



---



## Forecast Kebutuhan Infrastruktur



| Tahun | Total Headcount | Peak Concurrent | Server Spec | Biaya/bulan |

|---|---|---|---|---|

| **2026** | **5.146** | **\~770** | **2 vCPU, 4 GB** | **$51-95** |

| **2027** | **6.272** | **\~940** | **4 vCPU, 8 GB** | **$76-144** |

| **2028-2029** | **8.392** | **\~1.260** | **8 vCPU, 16 GB** | **$251-367** |

| **2030+** | **10.396** | **\~1.560** | **Kubernetes** | **$439-489** |



---



## Rekomendasi



### Fase 1: Launch 2026 (Immediate)



**Server:** 2 vCPU, 4 GB RAM (spesifikasi saat ini)

**Biaya:** \~$51-95/bulan (\~Rp 800.000 - 1.480.000)



| Komponen | Provider | Spesifikasi |

|---|---|---|

| App Server | DigitalOcean / Vultr | 2 vCPU, 4 GB RAM |

| Database | Supabase Pro | 8 GB PostgreSQL |

| Object Storage | Cloudflare R2 | 100 GB, no egress fee |

| CDN | Cloudflare Free | Unlimited |

| Email | Resend | 10.000 email/bulan |



### Fase 2: Growth 2027



**Upgrade ke:** 4 vCPU, 8 GB RAM + Nginx reverse proxy

**Biaya:** \~$76-144/bulan



### Fase 3: Scale 2028-2029



**Upgrade ke:** 8 vCPU, 16 GB RAM + Load Balancer + Redis

**Biaya:** \~$251-367/bulan



### Fase 4: Enterprise 2030+



**Upgrade ke:** Kubernetes + auto-scaling

**Biaya:** \~$439-489/bulan



---



## Keuntungan Cloudflare R2 vs AWS S3



| Komponen | Cloudflare R2 | AWS S3 |

|---|---|---|

| Storage 100 GB | $1.50 | $2.30 |

| Egress 500 GB | **$0** | **$45** |

| **Total/bulan** | **$1.50** | **$47.30** |



**Hemat:** $45.80/bulan = **$549.60/tahun**



---



## Action Items untuk IT



- [ ] Review dokumen ini

- [ ] Approve budget Fase 1 (2026): \~$51-95/bulan

- [ ] Setup VPS (2 vCPU, 4 GB RAM)

- [ ] Setup Supabase Pro account

- [ ] Setup Cloudflare R2 bucket

- [ ] Setup domain \& DNS

- [ ] Schedule deployment meeting



---



## Dokumen Terkait



- **[Performance Report](02-PERFORMANCE-REPORT.md)** Ã¢â‚¬â€ hasil test lengkap

- **[Capacity Model](03-CAPACITY-MODEL.md)** Ã¢â‚¬â€ forecast \& kalkulasi

- **[Budget Plan](04-BUDGET-PLAN.md)** Ã¢â‚¬â€ rincian biaya

- **[Architecture](05-ARCHITECTURE.md)** Ã¢â‚¬â€ arsitektur sistem

- **[Deployment Requirements](06-DEPLOYMENT-REQUIREMENTS.md)** Ã¢â‚¬â€ requirement deployment

- **[Technical Decisions](07-TECHNICAL-DECISIONS.md)** Ã¢â‚¬â€ keputusan teknis

