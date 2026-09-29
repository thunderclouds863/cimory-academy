# Infrastructure Requirements — Cimory Sales Academy

**Versi:** 2.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group

---

## 1. Requirement Summary

| Komponen | Requirement | Prioritas | Alasan |
|---|---|---|---|
| App Server | 2 vCPU, 4 GB RAM, 80 GB SSD | Wajib | Handle 1.200 concurrent user |
| Database | PostgreSQL 15+, 8 GB, managed | Wajib | 23 tabel, pertumbuhan 35 MB/tahun |
| Object Storage | S3-compatible, 100 GB, no egress | Wajib | Video modul 50 MB × 100 |
| CDN | Global CDN, unlimited bandwidth | Wajib | Akses dari seluruh Indonesia |
| Email | SMTP 10.000 email/bulan | Wajib | Reset password, notifikasi |
| Domain | Subdomain atau baru | Wajib | Akses user |
| SSL | HTTPS (SSL/TLS 1.2+) | Wajib | Security |
| Monitoring | Uptime + error tracking | Wajib | Deteksi downtime |
| Backup | Daily DB snapshot | Wajib | Data recovery |
| WAF | DDoS + bot protection | Wajib | Security |

---

## 2. App Server Requirements

### 2.1 Spesifikasi Minimum

| Item | Minimum | Rekomendasi | Alasan |
|---|---|---|---|
| CPU | 1 vCPU | **2 vCPU** | Hasil test: kuat sampai 1.200 user |
| RAM | 2 GB | **4 GB** | Handle Node.js + connection pool |
| Storage | 40 GB SSD | **80 GB SSD** | OS + app + logs |
| OS | Ubuntu 22.04 LTS | **Ubuntu 22.04 LTS** | LTS support |
| Bandwidth | 500 GB/bulan | **1 TB/bulan** | Video streaming |
| Node.js | 20+ | **20+** | Runtime |

### 2.2 Bukti dari Test

Berdasarkan stress test 1.000 concurrent user:
- Error rate: **0.17%**
- p(95): **1.49 s**
- Throughput: **579 req/s**
- Server tidak crash

**Kesimpulan:** 2 vCPU, 4 GB RAM cukup untuk ~1.200 concurrent user.

### 2.3 Referensi Harga VPS 2026

| Provider | Spesifikasi | Harga/bulan | Sumber |
|---|---|---|---|
| DigitalOcean | 1 vCPU, 1 GB RAM | $6 | vpsbenchmarks.com |
| DigitalOcean | 1 vCPU, 2 GB RAM | $12 | vpsbenchmarks.com |
| Vultr | 2 vCPU, 4 GB RAM | $24 | vpsbenchmarks.com |
| Vultr | 4 vCPU, 8 GB RAM | $48 | vpsbenchmarks.com |
| Linode | 2 vCPU, 4 GB RAM | $24 | 1vps.com |
| Hetzner | 2 vCPU, 4 GB RAM | ~$6 | — |

**Rekomendasi:** Vultr High Performance (2 vCPU, 4 GB RAM) — $24/bulan. Server di Singapore.

---

## 3. Database Requirements

### 3.1 Spesifikasi

| Item | Requirement | Alasan |
|---|---|---|
| Engine | PostgreSQL 15+ | Support JSONB, window function |
| Storage | 8 GB (auto-scale) | 23 tabel, pertumbuhan 35 MB/tahun |
| Backup | Daily snapshot, retention 30 hari | Data recovery |
| Connection Pooling | Ya | Handle concurrent connections |
| Max Connections | 200 | Buffer untuk scaling |

### 3.2 Bukti dari Test

Berdasarkan database benchmark:
- TPS: **5.216**
- Latency avg: **9.59 ms**
- Failed transactions: **0%**

**Kesimpulan:** Database bukan bottleneck.

### 3.3 Referensi Harga Database 2026

| Provider | Plan | Harga/bulan | Sumber |
|---|---|---|---|
| Supabase | Pro (8 GB) | $25 | supabase.com/pricing |
| Neon | Pro (3 GB) | $19 | — |
| Railway | Pro | $5+usage | — |

**Rekomendasi:** Supabase Pro — $25/bulan. Managed PostgreSQL dengan backup otomatis.

---

## 4. Object Storage Requirements

### 4.1 Spesifikasi

| Item | Requirement | Alasan |
|---|---|---|
| Type | S3-compatible | Standar industri |
| Storage awal | 100 GB | Video modul 50 MB × 100 |
| Egress | Unlimited (no fee) | Video streaming |
| Fungsi | Video modul, gambar, upload | — |

### 4.2 Bukti dari Test

Berdasarkan R2 benchmark:

| Size | Upload | Download |
|---|---|---|
| 1 MB | 1.02 s | 0.31 s |
| 10 MB | 1.22 s | 0.91 s |
| **50 MB** | **4.71 s** | **3.46 s** |

**Throughput:** 14.46 MB/s (download 50MB)

### 4.3 Referensi Harga Object Storage 2026

| Provider | Storage | Egress | Harga (100 GB) | Sumber |
|---|---|---|---|---|
| **Cloudflare R2** | $0.015/GB | **Gratis** | **$1.50** | developers.cloudflare.com/r2/pricing |
| AWS S3 | $0.023/GB | $0.09/GB | ~$47.30 | — |
| Backblaze B2 | $0.005/GB | $0.01/GB | ~$5.50 | — |

**Detail Cloudflare R2:**
- Storage: $0.015/GB-month
- Egress: **Gratis**
- Free tier: 10 GB storage
- Class A Ops: $4.50/juta request
- Class B Ops: $0.36/juta request

**Rekomendasi:** Cloudflare R2 — egress gratis, hemat besar untuk video.

---

## 5. CDN Requirements

### 5.1 Spesifikasi

| Item | Requirement | Alasan |
|---|---|---|
| Type | Global CDN | Akses dari seluruh Indonesia |
| Bandwidth | Unlimited | Video streaming |
| SSL | Gratis | HTTPS |
| DDoS Protection | Ya | Security |
| WAF | Ya | Security |

### 5.2 Referensi Harga CDN 2026

| Provider | Plan | Harga/bulan | Sumber |
|---|---|---|---|
| Cloudflare | Free | $0 | — |
| Cloudflare | Pro | $25 | cloudflare.com/plans/pro |
| AWS CloudFront | Pay per use | ~$50+ | — |

**Rekomendasi:** Cloudflare Free (cukup untuk launch).

---

## 6. Email Requirements

### 6.1 Spesifikasi

| Item | Requirement | Alasan |
|---|---|---|
| Volume | 10.000 email/bulan | Reset password, notifikasi |
| SMTP | Ya | Standar |

### 6.2 Referensi Harga Email 2026

| Provider | Free Tier | Pro | Sumber |
|---|---|---|---|
| Resend | 3.000 email/bulan | $20 (50.000) | resend.com/docs |
| SendGrid | 100 email/hari | $15 (40.000) | — |
| Mailgun | 5.000 email/bulan | $35 (50.000) | — |

**Rekomendasi:** Resend Free tier (cukup untuk launch).

---

## 7. Referensi Concurrent User Ratio

**Kenapa 15%?** Untuk memperkirakan berapa user yang mengakses bersamaan di peak hour.

| Sumber | Rasio | Catatan |
|---|---|---|
| **TTAK.KO-10.0292** | 1-10% | Standar Korea |
| Infor | ~10% | Enterprise software |
| TOTVS | 10-30% | Standar Brazil |

**Perhitungan:** 15% diambil dari tengah range. Untuk sistem internal, rasio bisa lebih tinggi.

## 8. Referensi Lengkap

| # | Referensi | URL | Digunakan Untuk |
|---|---|---|---|
| 1 | VPSBenchmarks | vpsbenchmarks.com | Harga VPS |
| 2 | Supabase Pricing | supabase.com/pricing | Harga database |
| 3 | Cloudflare R2 Pricing | developers.cloudflare.com/r2/pricing | Harga storage |
| 4 | Resend Pricing | resend.com/docs | Harga email |
| 5 | Cloudflare Pro | cloudflare.com/plans/pro | Harga CDN |
| 6 | TTAK.KO-10.0292 | aid.altibase.com | Standar concurrent user |
| 7 | Linode Pricing | 1vps.com/pricing | Harga VPS alternatif |

---

**Last Updated:** 29 September 2026