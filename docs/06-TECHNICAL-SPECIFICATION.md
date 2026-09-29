# Technical Specification — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 29 September 2026
**Untuk:** Tim IT Cimory Group
**Status:** Final

---

## 1. Ringkasan

Dokumen ini menjelaskan spesifikasi teknis Cimory Sales Academy untuk keperluan **infrastructure planning**. Dokumen ini bukan panduan instalasi, melainkan **referensi teknis** yang dibutuhkan tim IT untuk:

- Menentukan spesifikasi server
- Memilih provider infrastructure
- Menyiapkan environment production
- Verifikasi requirement sistem

---

## 2. Tech Stack

### 2.1 Backend Stack

| Komponen | Teknologi | Versi | Fungsi |
|---|---|---|---|
| Runtime | Node.js | 20+ | Menjalankan server |
| Framework Utama | NestJS | 10+ | Fitur baru (v2) |
| Framework Legacy | Express | 4.x | Fitur lama (v1) |
| ORM | Prisma | 6+ | Database access |
| Database | PostgreSQL | 15+ | Data storage |
| Auth | JWT (jsonwebtoken) | 9+ | Authentication |
| Password Hashing | bcryptjs | 2+ | Password security |
| File Upload | multer | 1.4+ | Upload middleware |
| Excel Processing | ExcelJS | 4+ | Import/export Excel |
| Email | Nodemailer | 6+ | Email sending |
| Security | helmet | 7+ | HTTP headers |
| Rate Limiting | express-rate-limit | 7+ | Rate limiter |
| Object Storage | @aws-sdk/client-s3 | 3+ | Cloudflare R2 client |

### 2.2 Frontend Stack

| Komponen | Teknologi | Fungsi |
|---|---|---|
| Markup | HTML5 | Struktur halaman |
| Styling | CSS3 (vanilla) | Design system |
| Logic | Vanilla JavaScript (ES2022) | Aplikasi SPA |
| Font | Google Fonts (Fredoka, Plus Jakarta Sans) | Typography |
| Icons | Inline SVG | Icon set |

### 2.3 Infrastructure Stack

| Komponen | Provider | Requirement | Biaya/bulan |
|---|---|---|---|
| App Server | DigitalOcean / Vultr / Hetzner | 2 vCPU, 4 GB RAM | $24-48 |
| Database | Supabase Pro | 8 GB PostgreSQL | $25 |
| Object Storage | Cloudflare R2 | 100 GB, no egress | $1.50 |
| CDN | Cloudflare Free | Unlimited bandwidth | $0 |
| Email | Resend | 10.000 email/bulan | $0-20 |

---

## 3. Arsitektur Sistem

### 3.1 Diagram Arsitektur
