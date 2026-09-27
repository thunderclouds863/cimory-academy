# 🏢 Cimory Sales Academy

Platform pembelajaran digital untuk tim sales **Cimory Group** & **Kanzler**. Berisi modul video, kuis chapter, quiz bulanan, fun fact, badge, leaderboard, dan reports Power BI.

---

## 📖 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
- [Dokumentasi Lengkap](#-dokumentasi-lengkap)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Deployment](#-deployment)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Kontribusi](#-kontribusi)

---

## ✨ Fitur Utama

### Untuk User (Sales)

| Fitur | Deskripsi |
|-------|-----------|
| **Autentikasi** | Login/register dengan email kantor, JWT, forgot/reset password via email |
| **Dashboard** | Progress ring, stats (XP/streak/badge), preview leaderboard, chapter cards |
| **Belajar (Learn)** | Chapter → modul linear dengan video player anti-skip + watch tracking |
| **Kuis Chapter** | 1 kuis per chapter, terkunci sampai semua modul selesai, XP untuk jawaban benar pertama kali |
| **Quiz Bulanan** | Event bulanan, hanya bisa dikerjakan 1×, timer, min score, pembahasan, arsip |
| **Fun Fact** | Kartu flip 3D dengan fakta menarik Cimory & Kanzler |
| **Badges** | 6 tipe kondisi: modules, streak, chapter, perfectQuiz, flashcards, allModules |
| **Leaderboard** | 2 mode: Top Trainee (kuis chapter) & Quiz Bulanan, podium, hadiah, pemenang |
| **Reports** | Embed Power BI dengan access control per user + analytics |
| **Popups** | Notifikasi pemenang, papan pemenang, announcement dengan jadwal & gambar |

### Untuk Admin

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Statistik user, top 5 trainee, banner quiz aktif |
| **Chapter & Modul** | CRUD lengkap, upload video (progress bar), set durasi |
| **Kuis Chapter** | Import dari Excel, view soal, delete |
| **Quiz Bulanan** | CRUD, import Excel, toggle active, lihat peserta |
| **Fun Fact** | CRUD + import Excel massal |
| **Badges** | CRUD, lihat pemilik, force delete |
| **Users** | CRUD, reset password, import Excel massal |
| **Leaderboard** | Pilih bulan, set hadiah, announcement, winners popup setting, generate winners, analytics |
| **Reports** | CRUD, access control, analytics, import Excel |

### Fitur Keamanan

- **Screenshot Guard** — deteksi PrintScreen, Ctrl+P/S, Cmd+Shift+3/4/5, blur, visibility change
- **Video Guard** — pause otomatis saat blur/tab switch, anti-skip seeking
- **Anti-debug** — blokir contextmenu, selectstart, dragstart
- **Rate limiting** — di endpoint login
- **JWT** — token-based auth dengan expiry configurable

---

## 🛠 Tech Stack

### Backend

| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js 20+ |
| Framework (baru) | **NestJS 10** |
| Framework (legacy) | Express.js 4.x |
| ORM (baru) | **Prisma 6** |
| Database | PostgreSQL 14+ |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| File Upload | multer |
| Excel | ExcelJS |
| Email | Nodemailer |
| Security | helmet, express-rate-limit |
| Object Storage | **Cloudflare R2** (S3-compatible) |

### Frontend

| Komponen | Teknologi |
|----------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (vanilla, custom design system) |
| Logic | Vanilla JavaScript (ES2022, IIFE modules) |
| Font | Fredoka + Plus Jakarta Sans (Google Fonts) |
| Icons | Inline SVG |

### Infrastruktur (Rekomendasi)

| Komponen | Provider |
|----------|----------|
| App Server | VPS (DigitalOcean/Vultr/Hetzner) |
| Database | PostgreSQL managed (Supabase) |
| Object Storage | Cloudflare R2 (video, gambar) |
| CDN | Cloudflare |
| Email | Resend / SendGrid |

---

## 📁 Struktur Project

```
Sales-Academy/
├── .gitignore                    # Git ignore rules
├── .gitattributes                # Line ending normalization
├── README.md                     # Dokumentasi ini
├── docs/                         # 📚 Dokumentasi IT
│   ├── 01-IT-REQUIREMENTS.md
│   ├── 02-ARCHITECTURE.md
│   ├── 03-DEPLOYMENT.md
│   └── 04-ROADMAP.md
│
├── backend/                      # API server (hybrid)
│   ├── .env.example              # Template environment
│   ├── package.json
│   ├── legacy-app.js             # Express app (di-mount ke NestJS)
│   ├── server.js                 # Entry point legacy (opsional)
│   │
│   ├── nestjs/                   # 🆕 NestJS v2 (fitur baru)
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── auth/         # Login, JWT, guard
│   │   │   │   ├── chapters/     # Chapter & modul
│   │   │   │   └── storage/      # Cloudflare R2 upload
│   │   │   ├── prisma/           # Prisma service
│   │   │   ├── app.module.ts
│   │   │   └── main.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   ├── db/
│   │   ├── pool.js               # PostgreSQL connection pool
│   │   ├── schema.sql            # Database schema
│   │   ├── migrate.js            # Migration runner
│   │   └── seed.js               # Seed data
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Multer config
│   ├── routes/                   # Express routes
│   │   ├── auth.routes.js
│   │   ├── chapters.routes.js
│   │   ├── quizzes.routes.js
│   │   ├── monthly-quiz.routes.js
│   │   ├── flashcards.routes.js
│   │   ├── badges.routes.js
│   │   ├── progress.routes.js
│   │   ├── leaderboard.routes.js
│   │   ├── rewards.routes.js
│   │   ├── reports.routes.js
│   │   └── upload.routes.js
│   ├── services/
│   │   ├── badge.js              # Badge recompute logic
│   │   ├── email.js              # Nodemailer wrapper
│   │   ├── excel.js              # Excel parser & template builder
│   │   └── reward.js             # Monthly ranking & winners
│   └── uploads/                  # Uploaded files (gitignored)
│
└── frontend/                     # Web app
    ├── index.html
    ├── css/
    │   ├── style.css             # User-facing styles
    │   └── admin.css             # Admin panel styles
    ├── js/
    │   ├── config.js             # App config (API_BASE, dll)
    │   ├── api.js                # Fetch wrapper
    │   ├── ui.js                 # UI helpers (icon, toast, confetti)
    │   ├── auth.js               # Auth logic
    │   ├── store.js              # Client-side state cache
    │   ├── guard.js              # Screenshot guard
    │   ├── admin.js              # Admin SPA
    │   └── app.js                # User SPA
    └── assets/
        ├── logo-cimory.png
        ├── mascot-tomyum.png
        └── mascot-baksobowy.png
```

---

## 📚 Dokumentasi Lengkap

Untuk dokumen lengkap yang bisa dibawa ke IT:

- 📋 **[IT Requirements](docs/01-IT-REQUIREMENTS.md)** — kebutuhan server, database, storage, checklist IT
- 🏗️ **[Architecture](docs/02-ARCHITECTURE.md)** — struktur aplikasi, alur data, database schema
- 🚀 **[Deployment Guide](docs/03-DEPLOYMENT.md)** — cara deploy ke production (Nginx, PM2, CI/CD)
- 🗺️ **[Roadmap](docs/04-ROADMAP.md)** — timeline migrasi & fitur jangka panjang

---

## 💻 Persyaratan Sistem

### Development

- **Node.js** v20+ ([download](https://nodejs.org))
- **npm** v9+ (bundled dengan Node.js)
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download))
- **Git** v2.30+ ([download](https://git-scm.com))
- **Laragon** (opsional, Windows) — [download](https://laragon.org)

### Production (Rekomendasi)

- **OS:** Ubuntu 22.04 LTS atau Debian 12
- **CPU:** 2 vCPU minimum
- **RAM:** 4 GB minimum
- **Storage:** 80 GB SSD minimum
- **Bandwidth:** 500 GB/bulan minimum

---

## 🚀 Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://gitlab.com/username-lo/sales-academy.git
cd sales-academy
```

### 2. Setup Database

Buat database PostgreSQL:

```bash
psql -U postgres -c "CREATE USER cimory_user WITH PASSWORD 'REDACTED_DB_PASSWORD';"
psql -U postgres -c "CREATE DATABASE cimory_academy OWNER cimory_user;"
```

### 3. Setup Backend Legacy (Express)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env — lihat bagian Konfigurasi Environment
npm run migrate
npm run seed
```

### 4. Setup Backend Baru (NestJS)

```bash
cd backend/nestjs
npm install
cp .env.example .env
# Edit .env — JWT_SECRET HARUS SAMA dengan backend/.env
npx prisma generate
npx prisma db pull
```

### 5. Jalankan Backend

**NestJS (recommended, menjalankan keduanya sekaligus):**

```bash
cd backend/nestjs
npm run start:dev
```

Server jalan di `http://localhost:4000`:
- Express legacy: `http://localhost:4000/api/*`
- NestJS v2: `http://localhost:4000/api/v2/*`

**Cek health:**

```bash
curl http://localhost:4000/api/v2/health
```

### 6. Jalankan Frontend

Buka `frontend/index.html` di browser, atau serve via static server:

```bash
cd frontend
npx serve .
```

---

## ⚙️ Konfigurasi Environment

### `backend/.env` (Express Legacy)

```env
# Server
PORT=4000
APP_URL=http://localhost:4000
NODE_ENV=development

# Database
PGHOST=localhost
PGPORT=5432
PGUSER=cimory_user
PGPASSWORD=REDACTED_DB_PASSWORD
PGDATABASE=cimory_academy

# JWT (HARUS SAMA dengan backend/nestjs/.env)
JWT_SECRET=dev_secret_ganti_di_production_minimal_32_char
JWT_EXPIRES=8h

# Admin Default (untuk seed)
ADMIN_EMAIL=admin@cimory.com
ADMIN_PASSWORD=admin123!

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Cimory Sales Academy" <noreply@cimory.com>

# Upload
UPLOAD_DIR=uploads
MAX_VIDEO_MB=500
```

### `backend/nestjs/.env` (NestJS)

```env
# Database (connection string untuk Prisma)
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/cimory_academy?schema=public

# JWT (HARUS SAMA dengan backend/.env)
JWT_SECRET=dev_secret_ganti_di_production_minimal_32_char
JWT_EXPIRES=8h

# Cloudflare R2
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=cimory-media
R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy hasilnya ke `JWT_SECRET` di **kedua** `.env` (backend & backend/nestjs).

---

## 🏃 Menjalankan Aplikasi

### Development

**Terminal 1 — Backend (Express + NestJS hybrid):**

```bash
cd backend/nestjs
npm run start:dev
```

**Terminal 2 — Frontend (opsional):**

```bash
cd frontend
npx serve .
```

### Production

```bash
cd backend/nestjs
npm run build
NODE_ENV=production npm run start:prod
```

### Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| `http://localhost:4000` | Backend API + frontend static |
| `http://localhost:4000/api/*` | Express legacy endpoints |
| `http://localhost:4000/api/v2/*` | NestJS v2 endpoints |
| `http://localhost:4000/uploads/*` | File statis (video, gambar) |

### Akun Default (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cimory.com` | `admin123!` (atau sesuai `.env`) |
| User | `demo@cimory.com` | `demo123` |

**⚠️ PENTING:** Ganti password admin setelah deploy ke production!

---

## 🗄 Database Schema

23 tabel utama:

| Tabel | Deskripsi |
|-------|-----------|
| `users` | User & admin (email, password_hash, role, xp, streak) |
| `chapters` | Chapter pembelajaran |
| `modules` | Modul di dalam chapter (video, durasi, summary) |
| `quizzes` | Kuis per chapter |
| `quiz_questions` | Soal kuis chapter |
| `quiz_attempts` | Riwayat attempt kuis chapter |
| `user_question_answered` | Track jawaban benar pertama (untuk XP) |
| `monthly_quizzes` | Quiz bulanan |
| `monthly_quiz_questions` | Soal quiz bulanan |
| `monthly_quiz_attempts` | Riwayat attempt quiz bulanan (1× per user per bulan) |
| `flashcards` | Fun fact cards |
| `badges` | Definisi badge |
| `user_badges` | Badge yang dimiliki user |
| `user_module_progress` | Progress modul user |
| `user_flashcard_views` | Flashcard yang udah dilihat user |
| `leaderboard_prizes` | Hadiah per rank per bulan |
| `leaderboard_winners` | Snapshot pemenang per bulan |
| `leaderboard_config` | Konfigurasi announcement & popup |
| `user_popup_seen` | Track popup yang udah dilihat user |
| `reports` | Embed Power BI reports |
| `report_access` | Access control reports per user |
| `report_views` | Log views reports |
| `password_resets` | Token reset password |

---

## 🔌 API Endpoints

### Base URL

```
http://localhost:4000/api       # Express legacy
http://localhost:4000/api/v2    # NestJS (fitur baru)
```

### Fitur yang Sudah Migrasi ke NestJS v2

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v2/health` | Health check |
| POST | `/api/v2/auth/login` | Login |
| GET | `/api/v2/auth/me` | Info user |
| GET | `/api/v2/chapters` | List chapter + modul |
| POST | `/api/v2/storage/presign` | Get presigned URL untuk upload |

### Fitur yang Masih di Express (Legacy)

Semua endpoint lain tetap di `/api/*` (lihat [Dokumentasi API lengkap](docs/02-ARCHITECTURE.md)).

---

## 🚢 Deployment

Lihat **[Deployment Guide](docs/03-DEPLOYMENT.md)** untuk panduan lengkap.

### Quick Deploy (VPS)

```bash
# 1. SSH ke VPS
ssh user@your-vps-ip

# 2. Install dependencies
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 3. Clone repo
git clone https://gitlab.com/username/sales-academy.git
cd sales-academy/backend/nestjs

# 4. Setup
npm install
cp .env.example .env
nano .env  # isi config production

# 5. Prisma
npx prisma generate

# 6. PM2
sudo npm install -g pm2
pm2 start npm --name "cimory-academy" -- run start:prod
pm2 startup && pm2 save

# 7. Nginx + SSL
# (lihat docs/03-DEPLOYMENT.md)
```

---

## 🔧 Troubleshooting

### Error: `Cannot connect to database`

- Cek PostgreSQL udah jalan: `sudo systemctl status postgresql`
- Cek kredensial di `.env` (PGHOST, PGUSER, PGPASSWORD, PGDATABASE)
- Cek database udah dibuat: `psql -U postgres -l`

### Error: `Port 4000 already in use`

- Cari proses: `netstat -ano | findstr :4000` (Windows) atau `lsof -i :4000` (Linux/Mac)
- Kill proses: `taskkill /F /PID <PID>` (Windows) atau `kill -9 <PID>` (Linux/Mac)

### Error: `JWT malformed / invalid`

- Cek `JWT_SECRET` di `backend/.env` dan `backend/nestjs/.env` **HARUS SAMA PERSIS**
- Clear localStorage di browser, login ulang

### Error: `Property 'user' does not exist on PrismaService`

- Berarti schema Prisma udah di-rename ke singular, tapi kode masih pakai plural
- Ganti `prisma.users` → `prisma.user` di kode

### Error: `EPERM: operation not permitted, rename ...`

- Matiin semua Node: `taskkill /F /IM node.exe` (Windows)
- Tutup editor (VS Code, dll)
- Hapus cache: `Remove-Item -Recurse -Force node_modules\.prisma`
- Generate ulang: `npx prisma generate`

### CORS error di browser

- Cek config CORS di `legacy-app.js` dan `main.ts`
- Pastikan origin frontend di-allow

### Video tidak muncul / buffering

- Untuk development: cek file di `backend/uploads/videos/`
- Untuk production: migrasi ke Cloudflare R2 + CDN

---

## 🗺 Roadmap

### ✅ Done

- [x] Auth & JWT
- [x] Modul belajar dengan video
- [x] Kuis chapter & bulanan
- [x] Fun fact flashcards
- [x] Badges & XP system
- [x] Leaderboard & rewards
- [x] Reports Power BI
- [x] Admin panel lengkap
- [x] Screenshot guard
- [x] Hybrid server NestJS + Express
- [x] Migrasi auth ke NestJS v2
- [x] Setup Cloudflare R2 + presigned upload
- [x] Rename Prisma models ke singular
- [x] Dokumentasi IT

### 🚧 In Progress

- [ ] Migrasi chapters ke NestJS v2
- [ ] Migrasi quizzes ke NestJS v2
- [ ] Migrasi progress ke NestJS v2
- [ ] Migrasi leaderboard ke NestJS v2
- [ ] Setup CI/CD GitLab

### 📅 Planned

- [ ] HLS streaming (video adaptive bitrate)
- [ ] Signed URLs (proteksi video)
- [ ] Mobile app (React Native / PWA)
- [ ] Analytics dashboard (Metabase / Grafana)
- [ ] Multi-language support
- [ ] SSO integration (Azure AD / Google Workspace)

Lihat **[Roadmap lengkap](docs/04-ROADMAP.md)** untuk detail.

---

## 🤝 Kontribusi

### Setup Development

1. Clone repo
2. Install dependencies (`npm install`)
3. Setup `.env` (copy dari `.env.example`)
4. Jalankan migrasi & seed
5. Jalankan `npm run start:dev`

### Branching Strategy

```
main           ← production-ready
├── develop    ← staging / integration
├── feature/*  ← fitur baru
├── bugfix/*   ← perbaikan bug
└── hotfix/*   ← perbaikan urgent production
```

### Commit Convention

```
feat: tambah fitur X
fix: perbaiki bug Y
docs: update README
refactor: refactor modul Z
style: format code
test: tambah test
chore: update dependencies
```

### Pull Request

1. Buat branch dari `develop`
2. Commit dengan pesan yang jelas
3. Push ke GitLab
4. Buat Merge Request ke `develop`
5. Tunggu review

---

## 📞 Kontak & Support

| Role | Kontak |
|------|--------|
| **Developer** | Desi Armanda Sari — desi.armanda@cimory.com |

---

## 📄 Lisensi

**Internal use only** — © 2026 Cimory Group. All rights reserved.

Konten, video, dan materi pembelajaran adalah properti Cimory Group & Kanzler. Dilarang mendistribusikan tanpa izin tertulis.

---

## 🙏 Credits

- **Design System:** Custom Cimory branding
- **Fonts:** [Fredoka](https://fonts.google.com/specimen/Fredoka) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Icons:** Custom SVG
- **Framework:** NestJS, Express.js, Prisma, PostgreSQL

---

**Last Updated:** 2026-09-27