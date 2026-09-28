# Budget Plan Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026

**Currency:** USD (kurs 15.500 IDR)



---



## 1. Ringkasan Budget per Fase



| Fase | Tahun | Target User | Server Spec | Biaya/bulan | Biaya/tahun |

|---|---|---|---|---|---|

| **1** | **2026** | **5.146** | **2 vCPU, 4 GB** | **$51-95** | **$612-1.140** |

| **2** | **2027** | **6.272** | **4 vCPU, 8 GB** | **$76-144** | **$912-1.728** |

| **3** | **2028-2029** | **8.392** | **8 vCPU, 16 GB** | **$251-367** | **$3.012-4.404** |

| **4** | **2030+** | **10.396+** | **Kubernetes** | **$439-489** | **$5.268-5.868** |



---



## 2. Fase 1: Launch 2026 (Immediate)



**Target:** 5.146 user, peak \~770 concurrent

**Server:** 2 vCPU, 4 GB RAM (spesifikasi saat ini)

**Buffer:** 1.3x dari kebutuhan



### Rincian Biaya



| Komponen | Provider | Spesifikasi | Biaya/bulan |

|---|---|---|---|

| **App Server** | DigitalOcean / Vultr / Hetzner | 2 vCPU, 4 GB RAM, 80 GB SSD | $24-48 |

| **Database** | Supabase Pro | 8 GB PostgreSQL, daily backup | $25 |

| **Object Storage** | Cloudflare R2 | 100 GB storage, no egress fee | $1.50 |

| **CDN** | Cloudflare Free | Unlimited bandwidth | $0 |

| **Email** | Resend | 10.000 email/bulan | $0-20 |

| **Domain** | Cloudflare | .com (tahunan) | \~$1 |

| **Monitoring** | UptimeRobot + Sentry | Free tier | $0 |

| **SSL** | Let's Encrypt / Cloudflare | Ã¢â‚¬â€ | $0 |

| **TOTAL** | | | **$51.50 - $95.50** |



**Dalam Rupiah:** Rp 800.000 - Rp 1.480.000/bulan

**Tahunan:** Rp 9.600.000 - Rp 17.760.000



### Perbandingan Provider App Server



| Provider | 2 vCPU, 4 GB | 4 vCPU, 8 GB |

|---|---|---|

| DigitalOcean | $24 | $48 |

| Vultr | $24 | $48 |

| Hetzner | Ã¢â€šÂ¬5 (\~$6) | Ã¢â€šÂ¬12 (\~$14) |

| Linode | $24 | $48 |

| AWS Lightsail | $20 | $40 |



**Rekomendasi:** DigitalOcean (server di Singapore, latency rendah untuk Indonesia).



---



## 3. Fase 2: Growth 2027



**Target:** 6.272 user, peak \~940 concurrent

**Upgrade ke:** 4 vCPU, 8 GB RAM + Nginx reverse proxy



### Rincian Biaya



| Komponen | Provider | Spesifikasi | Biaya/bulan |

|---|---|---|---|

| **App Server** | DigitalOcean | 4 vCPU, 8 GB RAM, 160 GB SSD | $48 |

| **Database** | Supabase Pro | 8 GB PostgreSQL | $25 |

| **Object Storage** | Cloudflare R2 | 200 GB storage | $3 |

| **CDN** | Cloudflare Free | Unlimited | $0 |

| **Nginx** | Self-hosted | Reverse proxy | $0 |

| **Email** | Resend | 10.000 email | $0-20 |

| **Monitoring** | Sentry + UptimeRobot | Free tier | $0 |

| **TOTAL** | | | **$76 - $96** |



**Dalam Rupiah:** Rp 1.180.000 - Rp 1.490.000/bulan

**Tahunan:** Rp 14.160.000 - Rp 17.880.000



---



## 4. Fase 3: Scale 2028-2029



**Target:** 8.392 user, peak \~1.260 concurrent

**Upgrade ke:** 8 vCPU, 16 GB RAM + Load Balancer + Redis



### Rincian Biaya



| Komponen | Provider | Spesifikasi | Biaya/bulan |

|---|---|---|---|

| **App Server** | 2Ãƒâ€” DigitalOcean | 4 vCPU, 8 GB RAM each | $96 |

| **Load Balancer** | DigitalOcean | Managed LB | $12 |

| **Database** | Supabase Medium | 100 GB PostgreSQL | $60 |

| **Object Storage** | Cloudflare R2 | 500 GB | $7.50 |

| **CDN** | Cloudflare Pro | WAF + image optimization | $20 |

| **Redis** | Upstash / Redis Cloud | Cache layer | $10-30 |

| **Email** | Resend Pro | 50.000 email | $20 |

| **Monitoring** | Sentry Team | Advanced | $26 |

| **TOTAL** | | | **$251 - $271** |



**Dalam Rupiah:** Rp 3.890.000 - Rp 4.200.000/bulan

**Tahunan:** Rp 46.680.000 - Rp 50.400.000



---



## 5. Fase 4: Enterprise 2030+



**Target:** 10.396+ user, peak \~1.560 concurrent

**Upgrade ke:** Kubernetes + auto-scaling



### Rincian Biaya



| Komponen | Provider | Spesifikasi | Biaya/bulan |

|---|---|---|---|

| **Kubernetes** | DigitalOcean DOKS | 3Ãƒâ€” node (4 vCPU, 8 GB) | $144 |

| **Database** | Supabase Large | 200 GB PostgreSQL | $110 |

| **Object Storage** | Cloudflare R2 | 1 TB | $15 |

| **CDN** | Cloudflare Pro | Unlimited | $20 |

| **Redis** | Redis Cloud | High availability | $50-100 |

| **Email** | Resend Pro | 100.000 email | $20 |

| **Monitoring** | Sentry Business | Full stack | $80 |

| **TOTAL** | | | **$439 - $489** |



**Dalam Rupiah:** Rp 6.800.000 - Rp 7.580.000/bulan

**Tahunan:** Rp 81.600.000 - Rp 90.960.000



---



## 6. Total Cost of Ownership (5 Tahun)



| Tahun | Infrastruktur | Development | Total |

|---|---|---|---|

| 2026 | $612-1.140 | Rp 66.5 juta | \~Rp 76 juta |

| 2027 | $912-1.728 | Ã¢â‚¬â€ | \~Rp 14-27 juta |

| 2028 | $3.012-4.404 | Ã¢â‚¬â€ | \~Rp 47-68 juta |

| 2029 | $3.012-4.404 | Ã¢â‚¬â€ | \~Rp 47-68 juta |

| 2030 | $5.268-5.868 | Ã¢â‚¬â€ | \~Rp 82-91 juta |

| **TOTAL** | **$12.816-17.544** | **Rp 66.5 juta** | **\~Rp 266-330 juta** |



**Catatan:** Angka ini termasuk upgrade server, database, storage, dan monitoring.



---



## 7. Perbandingan Provider Object Storage



| Provider | Storage 100 GB | Egress 500 GB | Total/bulan |

|---|---|---|---|

| **Cloudflare R2** | $1.50 | **$0** | **$1.50** |

| AWS S3 | $2.30 | $45 | $47.30 |

| Backblaze B2 | $0.50 | $5 | $5.50 |

| Supabase Storage | $2.10 | $45 | $47.10 |



**Rekomendasi:** Cloudflare R2 (no egress fee = hemat besar untuk video).



**Hemat vs AWS S3:** $45.80/bulan = **$549.60/tahun**



---



## 8. Perbandingan Provider Database



| Provider | Free Tier | Pro | Enterprise |

|---|---|---|---|

| **Supabase** | 500 MB | $25/bln (8 GB) | Custom |

| Neon | 3 GB | $19/bln | Custom |

| Railway | $5 credit | $5/bln + usage | Custom |

| AWS RDS | 12 bulan free | $50+/bln | Custom |



**Rekomendasi:** Supabase Pro (best value untuk startup).



---



## 9. Biaya Development (Estimasi)



| Role | Estimasi Jam | Rate/jam | Total |

|---|---|---|---|

| Backend Dev | 200 jam | Rp 150.000 | Rp 30.000.000 |

| Frontend Dev | 150 jam | Rp 150.000 | Rp 22.500.000 |

| DevOps / Setup | 50 jam | Rp 200.000 | Rp 10.000.000 |

| QA / Testing | 40 jam | Rp 100.000 | Rp 4.000.000 |

| **TOTAL** | 440 jam | | **Rp 66.500.000** |



**Catatan:** Estimasi kasar. Kalau pakai vendor, bisa 2-3x lebih mahal.



---



## 10. Rekomendasi Budget



### Minimal (Bootstrap)



- App Server: Hetzner CX22 (Ã¢â€šÂ¬5/bln)

- Database: Supabase Free

- Storage: Cloudflare R2 Free (10 GB)

- CDN: Cloudflare Free

- **Total: \~$6/bulan** (\~Rp 93.000)



### Standard (Recommended)



- App Server: DigitalOcean 2 vCPU ($24/bln)

- Database: Supabase Pro ($25/bln)

- Storage: Cloudflare R2 ($1.50/bln)

- CDN: Cloudflare Free

- Email: Resend Free

- **Total: \~$50/bulan** (\~Rp 775.000)



### Scale (2.000+ user)



- App Server: 2Ãƒâ€” DigitalOcean 4 vCPU ($96/bln)

- Database: Supabase Medium ($60/bln)

- Storage: Cloudflare R2 500 GB ($7.50/bln)

- CDN: Cloudflare Free

- Email: Resend Pro ($20/bln)

- **Total: \~$184/bulan** (\~Rp 2.850.000)



---



## 11. Action Items



- [ ] Approve budget Fase 1 (2026): \~$51-95/bulan

- [ ] Setup payment method (kartu kredit perusahaan)

- [ ] Setup akun provider: DigitalOcean, Supabase, Cloudflare

- [ ] Schedule review budget tiap 6 bulan

