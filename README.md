# 🏢 Cimory Sales Academy

Platform pembelajaran digital untuk tim sales **Cimory Group** & **Kanzler**. Berisi modul video, kuis chapter, quiz bulanan, fun fact, badge, leaderboard, dan reports Power BI.

---

## 📖 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Struktur Project](#-struktur-project)
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

## Fitur Utama

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

## Tech Stack

### Backend
| Komponen | Teknologi |
|----------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express.js 4.x |
| Database | PostgreSQL 14+ |
| Auth | JWT (jsonwebtoken) |
| Password | bcryptjs |
| File Upload | multer |
| Excel | ExcelJS |
| Email | Nodemailer |
| Security | helmet, express-rate-limit |

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

## Struktur Project

```
Sales-Academy/
├── .gitignore                    # Git ignore rules
├── .gitattributes                # Line ending normalization
├── README.md                     # Dokumentasi ini
│
├── backend/                      # API server
│   ├── .env.example              # Template environment
│   ├── package.json
│   ├── server.js                 # Entry point
│   ├── db/
│   │   ├── pool.js               # PostgreSQL connection pool
│   │   ├── schema.sql            # Database schema
│   │   ├── migrate.js            # Migration runner
│   │   └── seed.js               # Seed data
│   ├── middleware/
│   │   ├── auth.js               # JWT verification
│   │   └── upload.js             # Multer config
│   ├── routes/
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
│       ├── videos/
│       ├── images/
│       └── imports/
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

## Requirements Sistem

### Development
- **Node.js** v18+ ([download](https://nodejs.org))
- **npm** v9+ (biasanya bundled dengan Node.js)
- **PostgreSQL** v14+ ([download](https://www.postgresql.org/download))
- **Git** v2.30+ ([download](https://git-scm.com))
- **Laragon** (opsional, untuk Windows) — [download](https://laragon.org)

### Production (Rekomendasi)
- **OS:** Ubuntu 22.04 LTS atau Debian 12
- **CPU:** 2 vCPU minimum
- **RAM:** 4 GB minimum
- **Storage:** 80 GB SSD minimum
- **Bandwidth:** 500 GB/bulan minimum

---

## Instalasi & Setup

### 1. Clone Repository

```bash
git clone https://gitlab.com/username-lo/sales-academy.git
cd sales-academy
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Setup Database

Buat database PostgreSQL baru:

```bash
# Via psql
psql -U postgres -c "CREATE DATABASE cimory_academy;"
```

Atau via pgAdmin / Laragon.

### 4. Konfigurasi Environment

```bash
cp .env.example .env
```

Edit `.env` sesuai environment lo (lihat [Konfigurasi Environment](#-konfigurasi-environment)).

### 5. Migrasi & Seed Database

```bash
npm run migrate    # Bikin tabel-tabel
npm run seed       # Isi data awal (admin, chapters, quizzes, badges)
```

Atau sekaligus:

```bash
npm run reset      # migrate + seed
```

### 6. Jalankan Backend

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Backend jalan di `http://localhost:4000`.

### 7. Jalankan Frontend

Buka `frontend/index.html` di browser, atau serve via static server:

```bash
cd frontend
npx serve .
```

Frontend biasanya diakses di `http://localhost:3000` (atau port yang diserve).

---

## Konfigurasi Environment

File `.env` di folder `backend/`:

```env
# Server
PORT=4000
APP_URL=http://localhost:4000

# Database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=cimory_academy

# JWT
JWT_SECRET=change-this-to-random-string
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

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy hasilnya ke `JWT_SECRET`.

---

## Run Aplikasi

### Development

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend (opsional, kalau pakai static server):**
```bash
cd frontend
npx serve .
```

### Production

```bash
cd backend
NODE_ENV=production npm start
```

### Akses Aplikasi

| URL | Deskripsi |
|-----|-----------|
| `http://localhost:4000` | Backend API + frontend static |
| `http://localhost:4000/api/*` | API endpoints |
| `http://localhost:4000/uploads/*` | File statis (video, gambar) |

### Akun Default (Setelah Seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@cimory.com` | `admin123!` (atau sesuai `.env`) |
| User | `demo@cimory.com` | `demo123` |

**PENTING:** Ganti password admin setelah deploy ke production!

---

## Database Schema

### Tabel Utama

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

### Migration & Seed

```bash
npm run migrate    # Apply schema.sql
npm run seed       # Insert initial data
npm run reset      # migrate + seed (fresh start)
```

**`npm run reset` akan DROP semua data!** Gunakan hanya di development.

---

## API Endpoints

### Base URL
```
http://localhost:4000/api
```

### Authentication
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/auth/register` | Registrasi user baru |
| POST | `/auth/login` | Login (returns JWT) |
| POST | `/auth/change-password` | Ganti password (butuh auth) |
| GET | `/auth/me` | Info user saat ini |
| POST | `/auth/forgot-password` | Request reset password |
| GET | `/auth/verify-reset-token/:token` | Verify token reset |
| POST | `/auth/reset-password` | Reset password dengan token |

### Chapters & Modules
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/chapters` | List semua chapter + modul |
| POST | `/chapters` | Bikin chapter (admin) |
| PUT | `/chapters/:id` | Update chapter (admin) |
| DELETE | `/chapters/:id` | Hapus chapter (admin) |
| POST | `/chapters/:chapterId/modules` | Bikin modul (admin) |
| PUT | `/chapters/modules/:id` | Update modul (admin) |
| DELETE | `/chapters/modules/:id` | Hapus modul (admin) |
| POST | `/chapters/modules/:id/duration` | Set durasi video |

### Quizzes
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/quizzes` | List semua kuis |
| GET | `/quizzes/:chapterId` | Detail kuis per chapter |
| POST | `/quizzes/:chapterId/submit` | Submit jawaban |
| POST | `/quizzes` | Bikin kuis (admin) |
| POST | `/quizzes/:quizId/questions` | Tambah soal (admin) |
| DELETE | `/quizzes/questions/:id` | Hapus soal (admin) |
| DELETE | `/quizzes/:id` | Hapus kuis (admin) |

### Monthly Quiz
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/monthly-quiz/current` | Quiz bulan ini |
| GET | `/monthly-quiz/archive` | Arsip quiz bulan lalu |
| GET | `/monthly-quiz/:id` | Detail quiz |
| POST | `/monthly-quiz/:id/submit` | Submit jawaban (1× only) |
| GET | `/monthly-quiz/admin/list` | List semua quiz (admin) |
| POST | `/monthly-quiz/admin` | Bikin quiz (admin) |
| PUT | `/monthly-quiz/admin/:id` | Update quiz (admin) |
| POST | `/monthly-quiz/admin/:id/toggle-active` | Toggle aktif (admin) |
| DELETE | `/monthly-quiz/admin/:id` | Hapus quiz (admin) |
| POST | `/monthly-quiz/admin/:id/questions` | Tambah soal (admin) |
| DELETE | `/monthly-quiz/admin/questions/:qid` | Hapus soal (admin) |
| GET | `/monthly-quiz/admin/:id/attempts` | Lihat peserta (admin) |

### Flashcards
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/flashcards` | List semua flashcard |
| POST | `/flashcards/:id/view` | Catat view |
| POST | `/flashcards` | Bikin flashcard (admin) |
| PUT | `/flashcards/:id` | Update flashcard (admin) |
| DELETE | `/flashcards/:id` | Hapus flashcard (admin) |

### Badges
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/badges` | List semua badge + status owned |
| GET | `/badges/admin/list` | List badge + statistics (admin) |
| POST | `/badges/admin` | Bikin badge (admin) |
| PUT | `/badges/admin/:id` | Update badge (admin) |
| DELETE | `/badges/admin/:id` | Hapus badge (admin) |
| GET | `/badges/admin/:id/owners` | Lihat pemilik badge (admin) |

### Progress
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/progress/me` | Progress user saat ini |
| POST | `/progress/modules/:id/complete` | Tandai modul selesai |
| GET | `/progress/admin/all` | List semua user + progress (admin) |
| GET | `/progress/admin/users/:id` | Detail user (admin) |
| POST | `/progress/admin/users` | Bikin user (admin) |
| PUT | `/progress/admin/users/:id` | Update user (admin) |
| POST | `/progress/admin/users/:id/reset-password` | Reset password (admin) |
| DELETE | `/progress/admin/users/:id` | Hapus user (admin) |

### Leaderboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/leaderboard/progress` | Ranking Top Trainee |
| GET | `/leaderboard/winners` | Pemenang bulan |
| GET | `/leaderboard/prizes` | Hadiah per rank |
| POST | `/leaderboard/prizes` | Set hadiah (admin) |
| POST | `/leaderboard/generate-winners` | Generate pemenang (admin) |
| GET | `/leaderboard/announcement` | Ambil announcement |
| POST | `/leaderboard/announcement` | Set announcement (admin) |
| GET | `/leaderboard/config` | Config leaderboard |
| POST | `/leaderboard/config` | Update config (admin) |
| GET | `/leaderboard/my-popup` | Popup untuk user |
| POST | `/leaderboard/mark-seen` | Tandai popup udah dilihat |
| GET | `/leaderboard/quiz-monthly` | Leaderboard quiz bulanan |
| GET | `/leaderboard/quiz-chapter` | Leaderboard per chapter |
| GET | `/leaderboard/popup-analytics` | Analytics popup (admin) |
| GET | `/leaderboard/winners-popup-setting` | Setting popup winners |
| POST | `/leaderboard/winners-popup-setting` | Update setting (admin) |

### Reports
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/reports` | List reports user punya akses |
| GET | `/reports/:slug` | Detail report |
| GET | `/reports/admin/all` | List semua reports (admin) |
| POST | `/reports/admin` | Bikin report (admin) |
| PUT | `/reports/admin/:id` | Update report (admin) |
| DELETE | `/reports/admin/:id` | Hapus report (admin) |
| GET | `/reports/admin/:id/access` | List akses (admin) |
| POST | `/reports/admin/:id/access` | Set akses (admin) |
| GET | `/reports/admin/:id/analytics` | Analytics (admin) |

### Upload
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/upload/video` | Upload video (admin) |
| POST | `/upload/image` | Upload gambar (admin) |
| POST | `/upload/excel/quiz/import` | Import kuis dari Excel (admin) |
| POST | `/upload/excel/monthly-quiz/import` | Import quiz bulanan (admin) |
| POST | `/upload/excel/flashcards/import` | Import flashcards (admin) |
| POST | `/upload/excel/users/import` | Import users (admin) |
| POST | `/upload/excel/reports/import` | Import reports (admin) |
| GET | `/upload/excel/template/:type` | Download template Excel (admin) |

---

## Deployment

### Rekomendasi Infrastruktur

```
┌─────────────────────────────────────────┐
│         CLOUDFLARE (CDN + WAF)          │
│   Free tier: DDoS, SSL, CDN global      │
└────────────────┬────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────────┐      ┌─────────────────┐
│ APP SERVER  │      │ OBJECT STORAGE  │
│ Node.js     │      │ Cloudflare R2   │
│ Express     │      │ - Video         │
│             │      │ - Gambar        │
│ 2-4 vCPU    │      │ - Backup        │
│ 4-8 GB RAM  │      │                 │
└──────┬──────┘      └─────────────────┘
       │
       ▼
┌─────────────────┐
│   DATABASE      │
│   PostgreSQL    │
│   (Supabase)    │
│   8-10 GB       │
│   Daily Backup  │
└─────────────────┘
```

### Estimasi Biaya (1.000 user aktif)

| Komponen | Provider | Biaya/bulan |
|----------|----------|-------------|
| App Server (2 vCPU, 4 GB) | DigitalOcean/Vultr | $24-48 |
| Database (Supabase Pro) | Supabase | $25 |
| Object Storage (100 GB) | Cloudflare R2 | $1.50 |
| CDN | Cloudflare Free | $0 |
| Email (10k/bulan) | Resend/SendGrid | $0-20 |
| Domain + SSL | Cloudflare | $0 |
| **TOTAL** | | **~$50-95/bulan** |

### Scaling Roadmap

| Jumlah User | App Server | Database | Storage |
|-------------|------------|----------|---------|
| < 100 | 1 vCPU, 2 GB | Supabase Free | R2 10 GB (free) |
| 100-500 | 2 vCPU, 4 GB | Supabase Pro | R2 50 GB |
| 500-2.000 | 4 vCPU, 8 GB | Supabase Medium | R2 200 GB |
| 2.000-10.000 | 2× App + LB | Supabase Large | R2 500 GB + CDN |
| > 10.000 | Kubernetes | Supabase XL+ | R2 1 TB+ |

### Deploy ke VPS (Manual)

```bash
# 1. SSH ke VPS
ssh user@your-vps-ip

# 2. Install Node.js, PostgreSQL, Nginx
sudo apt update
sudo apt install -y nodejs npm postgresql nginx

# 3. Clone repo
git clone https://gitlab.com/username/sales-academy.git
cd sales-academy/backend

# 4. Setup
npm install
cp .env.example .env
nano .env  # isi config production

# 5. Migrate & seed
npm run migrate
npm run seed

# 6. Setup PM2 (process manager)
sudo npm install -g pm2
pm2 start server.js --name cimory-academy
pm2 startup
pm2 save

# 7. Setup Nginx reverse proxy
sudo nano /etc/nginx/sites-available/cimory-academy
# (config Nginx — proxy ke localhost:4000)

# 8. SSL via Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Error: `Cannot connect to database`
- Cek PostgreSQL udah jalan: `sudo systemctl status postgresql`
- Cek kredensial di `.env` (PGHOST, PGUSER, PGPASSWORD, PGDATABASE)
- Cek database udah dibuat: `psql -U postgres -l`

### Error: `Port 4000 already in use`
- Cari proses: `lsof -i :4000` (Linux/Mac) atau `netstat -ano | findstr :4000` (Windows)
- Kill proses atau ganti `PORT` di `.env`

### Error: `JWT malformed / invalid`
- Cek `JWT_SECRET` di `.env` sama antara server & token
- Clear localStorage di browser, login ulang

### Error: `CORS error` di browser
- Cek config CORS di `server.js`
- Pastikan origin frontend di-allow

### Video tidak muncul / buffering
- Cek file ada di `backend/uploads/videos/`
- Cek `video_path` di database sesuai
- Untuk production, migrasi ke Cloudflare R2 + CDN

### Email reset password tidak terkirim
- Cek config SMTP di `.env`
- Untuk Gmail, pakai **App Password** (bukan password biasa)
- Cek log: `console.log` di `services/email.js`

---

## Roadmap

### Done
- [x] Auth & JWT
- [x] Modul belajar dengan video
- [x] Kuis chapter & bulanan
- [x] Fun fact flashcards
- [x] Badges & XP system
- [x] Leaderboard & rewards
- [x] Reports Power BI
- [x] Admin panel lengkap
- [x] Screenshot guard

### In Progress
- [ ] Migrasi ke NestJS + Prisma (incremental refactor)
- [ ] Migrasi video ke Cloudflare R2 + CDN
- [ ] Setup CI/CD GitLab
- [ ] Unit & integration testing

### Planned
- [ ] HLS streaming (video adaptive bitrate)
- [ ] Signed URLs (proteksi video)
- [ ] Mobile app (React Native / PWA)
- [ ] Analytics dashboard (Metabase / Grafana)
- [ ] Multi-language support
- [ ] SSO integration (Azure AD / Google Workspace)

---

## Kontribusi

### Setup Development

1. Clone repo
2. Install dependencies (`npm install`)
3. Setup `.env` (copy dari `.env.example`)
4. Jalankan migrasi & seed
5. Jalankan `npm run dev`

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

## Kontak & Support

| Role | Kontak |
|------|--------|
| **Developer** | [Desi Armanda Sari] — [desi.armanda@cimory.com] |

---

## Lisensi

**Internal use only** — © 2026 Cimory Group. All rights reserved.

Konten, video, dan materi pembelajaran adalah properti Cimory Group & Kanzler. Dilarang mendistribusikan tanpa izin tertulis.

---

## Credits

- **Design System:** Custom Cimory branding
- **Fonts:** [Fredoka](https://fonts.google.com/specimen/Fredoka) & [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)
- **Icons:** Custom SVG
- **Framework:** Express.js, PostgreSQL

---

**Last Updated:** 2026-09-27