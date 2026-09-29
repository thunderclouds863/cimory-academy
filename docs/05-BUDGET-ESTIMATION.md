# Budget Estimation — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group
**Scope:** Infrastruktur saja (development oleh internal)
**Currency:** USD (kurs 15.500 IDR)

---

## 1. Ringkasan Budget

| Fase | Tahun | Target User | Server Spec | Biaya/bulan | Biaya/tahun |
|---|---|---|---|---|---|
| **1** | **2026** | **5.146** | **2 vCPU, 4 GB** | **$51-95** | **$612-1.140** |
| **2** | **2027-2028** | **7.347** | **2 vCPU, 4 GB + Redis** | **$62-106** | **$744-1.272** |
| **3** | **2029-2030** | **10.396** | **4 vCPU, 8 GB + LB** | **$162-210** | **$1.944-2.520** |
| **4** | **2031+** | **> 10.396** | **Kubernetes** | **$439-489** | **$5.268-5.868** |

**Total 5 tahun (2026-2030):** ~$4.500-6.000 (~Rp 70-93 juta)

**Catatan:** Budget ini **hanya untuk infrastruktur**. Development dilakukan oleh tim internal.

---

## 2. Fase 1: Launch 2026 (Immediate)

**Target:** 5.146 user, peak ~770 concurrent
**Server:** 2 vCPU, 4 GB RAM

### Rincian Biaya Infrastruktur

| Komponen | Provider | Spesifikasi | Biaya/bulan |
|---|---|---|---|
| **App Server** | DigitalOcean / Vultr / Hetzner | 2 vCPU, 4 GB RAM, 80 GB SSD | $24-48 |
| **Database** | Supabase Pro | 8 GB PostgreSQL, daily backup | $25 |
| **Object Storage** | Cloudflare R2 | 100 GB, no egress fee | $1.50 |
| **CDN** | Cloudflare Free | Unlimited bandwidth | $0 |
| **Email** | Resend | 10.000 email/bulan | $0-20 |
| **Domain** | Cloudflare | .com (tahunan) | ~$1 |
| **Monitoring** | UptimeRobot + Sentry | Free tier | $0 |
| **SSL** | Let's Encrypt / Cloudflare | — | $0 |
| **TOTAL** | | | **$51.50 - $95.50** |

**Dalam Rupiah:** Rp 800.000 - Rp 1.480.000/bulan
**Tahunan:** Rp 9.600.000 - Rp 17.760.000

### Catatan

- **Domain:** Kalau pakai subdomain existing (academy.cimory.com), biaya domain bisa $0
- **Email:** Free tier Resend cukup untuk launch (3.000 email/bulan)
- **Monitoring:** Free tier UptimeRobot + Sentry cukup

---

## 3. Fase 2: Growth 2027-2028

**Target:** 6.272-7.347 user, peak ~940-1.100 concurrent
**Server:** 2 vCPU, 4 GB RAM (masih cukup)
**Tambahan:** Redis cache

### Rincian Biaya Infrastruktur

| Komponen | Provider | Spesifikasi | Biaya/bulan |
|---|---|---|---|
| **App Server** | DigitalOcean | 2 vCPU, 4 GB RAM | $24-48 |
| **Database** | Supabase Pro | 8 GB PostgreSQL | $25 |
| **Object Storage** | Cloudflare R2 | 200 GB | $3 |
| **CDN** | Cloudflare Free | Unlimited | $0 |
| **Redis** | Upstash | Cache layer | $10 |
| **Email** | Resend | 10.000 email | $0-20 |
| **TOTAL** | | | **$62 - $106** |

**Dalam Rupiah:** Rp 960.000 - Rp 1.640.000/bulan
**Tahunan:** Rp 11.520.000 - Rp 19.680.000

---

## 4. Fase 3: Scale 2029-2030

**Target:** 8.392-10.396 user, peak ~1.260-1.560 concurrent
**Server:** 4 vCPU, 8 GB RAM + Load Balancer

### Rincian Biaya Infrastruktur

| Komponen | Provider | Spesifikasi | Biaya/bulan |
|---|---|---|---|
| **App Server** | 2× DigitalOcean | 2 vCPU, 4 GB RAM each | $48-96 |
| **Load Balancer** | DigitalOcean | Managed LB | $12 |
| **Database** | Supabase Pro | 8 GB PostgreSQL | $25 |
| **Object Storage** | Cloudflare R2 | 500 GB | $7.50 |
| **CDN** | Cloudflare Pro | WAF + image optimization | $20 |
| **Redis** | Redis Cloud | High availability | $30 |
| **Email** | Resend Pro | 50.000 email | $20 |
| **TOTAL** | | | **$162.50 - $210.50** |

**Dalam Rupiah:** Rp 2.520.000 - Rp 3.260.000/bulan
**Tahunan:** Rp 30.240.000 - Rp 39.120.000

---

## 5. Fase 4: Enterprise 2031+

**Target:** > 10.396 user, peak > 1.560 concurrent
**Server:** Kubernetes + auto-scaling

### Rincian Biaya Infrastruktur

| Komponen | Provider | Spesifikasi | Biaya/bulan |
|---|---|---|---|
| **Kubernetes** | DigitalOcean DOKS | 3× node (4 vCPU, 8 GB) | $144 |
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

| Tahun | Fase | Biaya Infrastruktur | Total (Rp) |
|---|---|---|---|
| 2026 | Launch | $612-1.140 | ~Rp 9.5-17.7 juta |
| 2027 | Growth | $744-1.272 | ~Rp 11.5-19.7 juta |
| 2028 | Growth | $744-1.272 | ~Rp 11.5-19.7 juta |
| 2029 | Scale | $1.944-2.520 | ~Rp 30.1-39.1 juta |
| 2030 | Scale | $1.944-2.520 | ~Rp 30.1-39.1 juta |
| **TOTAL** | | **$5.988-8.724** | **~Rp 93-135 juta** |

**Catatan:** Angka ini **hanya infrastruktur**. Development dilakukan internal (tidak masuk budget ini).

---

## 7. Perbandingan Provider Object Storage

| Provider | Storage 100 GB | Egress 500 GB | Total/bulan |
|---|---|---|---|
| **Cloudflare R2** | $1.50 | **$0** | **$1.50** |
| AWS S3 | $2.30 | $45 | $47.30 |
| Backblaze B2 | $0.50 | $5 | $5.50 |
| Supabase Storage | $2.10 | $45 | $47.10 |

**Rekomendasi:** Cloudflare R2 (no egress fee).

**Hemat vs AWS S3:** $45.80/bulan = **$549.60/tahun**
**Hemat 5 tahun:** ~$2.748 (~Rp 42.6 juta)

---

## 8. Perbandingan Provider Database

| Provider | Free Tier | Pro | Enterprise |
|---|---|---|---|
| **Supabase** | 500 MB | $25/bln (8 GB) | Custom |
| Neon | 3 GB | $19/bln | Custom |
| Railway | $5 credit | $5/bln + usage | Custom |
| AWS RDS | 12 bulan free | $50+/bln | Custom |

**Rekomendasi:** Supabase Pro (best value, managed).

---

## 9. Perbandingan Provider App Server

| Provider | 2 vCPU, 4 GB | 4 vCPU, 8 GB |
|---|---|---|
| DigitalOcean | $24 | $48 |
| Vultr | $24 | $48 |
| Hetzner | €5 (~$6) | €12 (~$14) |
| Linode | $24 | $48 |
| AWS Lightsail | $20 | $40 |

**Rekomendasi:** DigitalOcean (server di Singapore, latency rendah untuk Indonesia).

**Alternatif murah:** Hetzner (€5/bulan) — tapi server di Eropa, latency lebih tinggi.

---

## 10. Rekomendasi Budget

### Opsi 1: Minimal (Bootstrap)

| Komponen | Provider | Biaya/bulan |
|---|---|---|
| App Server | Hetzner CX22 | €5 (~$6) |
| Database | Supabase Free | $0 |
| Object Storage | Cloudflare R2 Free (10 GB) | $0 |
| CDN | Cloudflare Free | $0 |
| Email | Resend Free | $0 |
| **TOTAL** | | **~$6/bulan** (~Rp 93.000) |

**Cocok untuk:** Testing/development, < 100 user.

### Opsi 2: Standard (Recommended)

| Komponen | Provider | Biaya/bulan |
|---|---|---|
| App Server | DigitalOcean 2 vCPU | $24 |
| Database | Supabase Pro | $25 |
| Object Storage | Cloudflare R2 | $1.50 |
| CDN | Cloudflare Free | $0 |
| Email | Resend Free | $0 |
| **TOTAL** | | **~$50/bulan** (~Rp 775.000) |

**Cocok untuk:** Launch 2026, 5.000+ user.

### Opsi 3: Scale (2.000+ concurrent)

| Komponen | Provider | Biaya/bulan |
|---|---|---|
| App Server | 2× DigitalOcean 4 vCPU | $96 |
| Database | Supabase Medium | $60 |
| Object Storage | Cloudflare R2 500 GB | $7.50 |
| CDN | Cloudflare Free | $0 |
| Email | Resend Pro | $20 |
| **TOTAL** | ~$184/bulan (~Rp 2.850.000) |

**Cocok untuk:** 2029-2030, 10.000+ user.

---

## 11. Komponen yang TIDAK Masuk Budget

| Komponen | Alasan |
|---|---|
| Development (backend, frontend) | Dilakukan internal oleh tim |
| Design (UI/UX) | Dilakukan internal |
| Content creation (video, materi) | Dilakukan tim konten |
| QA & Testing | Dilakukan internal |
| Deployment setup | Dilakukan internal |
| Maintenance code | Dilakukan internal |

**Budget ini murni untuk infrastruktur cloud.**

---

## 12. Action Items

- [ ] Approve budget Fase 1 (2026): ~$51-95/bulan
- [ ] Setup payment method (kartu kredit perusahaan)
- [ ] Setup akun provider: DigitalOcean, Supabase, Cloudflare
- [ ] Schedule review budget tiap 6 bulan (atau saat user > 2.000)

---

## 13. Referensi

1. DigitalOcean Pricing. https://www.digitalocean.com/pricing
2. Supabase Pricing. https://supabase.com/pricing
3. Cloudflare R2 Pricing. https://developers.cloudflare.com/r2/pricing/
4. Resend Pricing. https://resend.com/pricing
5. Cimory Group HR Data (internal).