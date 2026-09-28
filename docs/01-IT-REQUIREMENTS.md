# IT Requirements Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** September 2026

**Status:** Draft untuk review IT



---



## 1. Ringkasan Proyek



Cimory Sales Academy adalah platform pembelajaran internal untuk tim sales Cimory Group \& Kanzler. Platform ini menyediakan:

- Modul pembelajaran video per chapter

- Kuis chapter \& kuis bulanan

- Sistem XP, streak, dan badge

- Papan peringkat (leaderboard) dengan hadiah bulanan

- Laporan Power BI terintegrasi

- Fun fact (flashcards) interaktif



**Target pengguna:** 500-2.000 sales di seluruh Indonesia (jangka panjang: 5.000+).



---



## 2. Stack Teknologi



### Backend

- **Runtime:** Node.js 20+

- **Framework:** NestJS 10 (migrasi bertahap dari Express)

- **ORM:** Prisma 6

- **Database:** PostgreSQL 15+

- **Auth:** JWT (JSON Web Token)



### Frontend

- **Bahasa:** Vanilla JavaScript (ES Modules)

- **Styling:** CSS murni (custom design system)

- **Font:** Google Fonts (Fredoka, Plus Jakarta Sans)



### Infrastruktur (Rekomendasi)

- **App Server:** VPS (DigitalOcean / Vultr / Hetzner)

- **Database:** Supabase Pro (managed PostgreSQL)

- **Object Storage:** Cloudflare R2

- **CDN:** Cloudflare Free

- **Email:** Resend / SendGrid

- **Monitoring:** Sentry + UptimeRobot



---



## 3. Kebutuhan Infrastruktur



### 3.1 App Server

| Spesifikasi | Minimum | Rekomendasi |

|---|---|---|

| CPU | 1 vCPU | 2-4 vCPU |

| RAM | 2 GB | 4-8 GB |

| Storage | 40 GB SSD | 80-160 GB NVMe |

| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |



**Fungsi:** Menjalankan Node.js API server + frontend static files.



### 3.2 Database

| Spesifikasi | Minimum | Rekomendasi |

|---|---|---|

| Provider | PostgreSQL self-hosted | Supabase Pro (managed) |

| Storage | 500 MB | 8-10 GB (auto-scale) |

| Backup | Manual | Daily automated |

| Connection Pooling | Tidak perlu | Ya (PgBouncer) |



**Estimasi pertumbuhan data:** 35-40 MB/tahun untuk 1.000 user aktif. Untuk 5.000 user, \~200 MB/tahun.



### 3.3 Object Storage

| Spesifikasi | Nilai |

|---|---|

| Provider | Cloudflare R2 |

| Storage awal | 10-100 GB |

| Bandwidth | Unlimited (no egress fee) |

| Operasi | 1 juta/bulan (free tier) |



**Fungsi:** Menyimpan video modul, gambar announcement, file upload.



### 3.4 CDN

| Spesifikasi | Nilai |

|---|---|

| Provider | Cloudflare Free |

| Fungsi | Cache video \& static assets di edge server |

| SSL | Gratis (Universal SSL) |

| DDoS Protection | Ya |



### 3.5 Email

| Spesifikasi | Nilai |

|---|---|

| Provider | Resend / SendGrid / Mailgun |

| Volume | 10.000 email/bulan |

| Fungsi | Reset password, notifikasi |



---



## 4. Kebutuhan Non-Fungsional



### 4.1 Performa

- Waktu load halaman: < 3 detik (koneksi 4G)

- API response time: < 500 ms (p95)

- Video streaming: tanpa buffering (via CDN)



### 4.2 Skalabilitas

- Support 1.000 concurrent user

- Auto-scaling (opsional, fase lanjut)

- Horizontal scaling untuk app server



### 4.3 Keamanan

- HTTPS wajib (SSL/TLS 1.2+)

- Rate limiting di endpoint login (20 req / 15 menit)

- JWT expiration: 8 jam

- Password hashing: bcrypt (10 rounds)

- SQL injection protection: Prisma (parameterized queries)

- WAF: Cloudflare (DDoS + bot protection)

- Screenshot guard di halaman pembelajaran (anti-piracy)



### 4.4 Backup \& Recovery

- Database: daily snapshot, retention 30 hari

- Object storage: versioning enabled

- Recovery time objective (RTO): 4 jam

- Recovery point objective (RPO): 24 jam



### 4.5 Monitoring

- Uptime monitoring: UptimeRobot (5 menit interval)

- Error tracking: Sentry (real-time alert)

- Log aggregation: Cloudflare Logs / Papertrail

- Database metrics: Supabase dashboard



---



## 5. Checklist untuk IT



### Infrastruktur

- [ ] VPS/Cloud server (2 vCPU, 4 GB RAM minimum)

- [ ] PostgreSQL database (Supabase Pro atau self-host)

- [ ] Cloudflare R2 bucket (`cimory-media`)

- [ ] Cloudflare CDN (domain + SSL)

- [ ] SMTP service (Resend/SendGrid)

- [ ] Domain (subdomain existing atau baru)

- [ ] DNS management



### Keamanan

- [ ] WAF (Cloudflare)

- [ ] Rate limiting (Cloudflare + app-level)

- [ ] Secrets management (environment variables)

- [ ] Backup strategy (daily DB snapshot)

- [ ] Monitoring (UptimeRobot, Sentry)

- [ ] SSL certificate (Let's Encrypt / Cloudflare)



### Deployment

- [ ] CI/CD pipeline (GitLab CI)

- [ ] Auto-deploy dari GitLab ke server

- [ ] Rollback strategy

- [ ] Health check endpoint (`/api/v2/health`)



### Akses \& Kolaborasi

- [ ] GitLab repository (private)

- [ ] Akses developer ke GitLab (Developer role)

- [ ] Akses server (SSH key-based)

- [ ] Akses database (read-only untuk auditor)



---



## 6. Kontak



**Project Owner:** [Nama Lo]

**Email:** [Email Lo]

**Repository:** [Link GitLab]

