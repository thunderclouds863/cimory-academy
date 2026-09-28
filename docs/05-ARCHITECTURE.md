# Architecture — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 28 September 2026

---

## 1. Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                    CLOUDFLARE (CDN + WAF)                │
│              Free tier: DDoS, SSL, CDN global            │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴───────────┐
         ▼                       ▼
┌─────────────────┐    ┌─────────────────┐
│  APP SERVER     │    │  OBJECT STORAGE │
│  Node.js        │    │  Cloudflare R2  │
│  NestJS + Express│    │                 │
│                 │    │  - Video modul  │
│  2-4 vCPU       │    │  - Gambar       │
│  4-8 GB RAM     │    │  - Upload user  │
└────────┬────────┘    └─────────────────┘
         │
         ▼
┌─────────────────┐
│  DATABASE       │
│  PostgreSQL     │
│  (Supabase Pro) │
│  8-10 GB        │
│  Daily Backup   │
└─────────────────┘
```

---

## 2. Struktur Aplikasi

### Backend (Hybrid)

```
backend/
├── nestjs/                 # NestJS v2 (fitur baru)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/       # Login, register, JWT
│   │   │   ├── chapters/   # Chapter & modul
│   │   │   ├── storage/    # Upload ke R2
│   │   │   └── ...         # Modul lain (bertahap)
│   │   ├── prisma/         # Prisma service
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   └── schema.prisma   # Schema database
│   └── .env                # Config (JANGAN commit)
├── legacy-app.js           # Express lama (di-mount)
├── routes/                 # Express routes
├── middleware/             # Auth, upload
├── services/               # Badge, email, excel
├── db/
│   └── pool.js             # PostgreSQL pool
└── .env                    # Config (JANGAN commit)
```

### Frontend

```
frontend/
├── index.html
├── js/
│   ├── config.js           # Config API base
│   ├── api.js              # Fetch wrapper
│   ├── auth.js             # Login/logout
│   ├── ui.js               # UI helpers
│   ├── store.js            # State management
│   ├── guard.js            # Screenshot guard
│   ├── admin.js            # Admin panel
│   └── app.js              # Main SPA
├── css/
│   ├── style.css           # User-facing CSS
│   └── admin.css           # Admin CSS
└── assets/
    └── *.png               # Logo, mascot
```

---

## 3. Alur Request

### 3.1 Fitur Lama (Express)

```
User → Cloudflare → App Server
                       ↓
                   Express (legacy-app.js)
                       ↓
                   /api/* routes
                       ↓
                   PostgreSQL (via pg.Pool)
```

**Endpoint:** `/api/auth/*`, `/api/chapters/*`, `/api/quizzes/*`, dll.

### 3.2 Fitur Baru (NestJS)

```
User → Cloudflare → App Server
                       ↓
                   NestJS (main.ts)
                       ↓
                   /api/v2/* routes
                       ↓
                   Module → Service → Prisma → PostgreSQL
```

**Endpoint:** `/api/v2/auth/*`, `/api/v2/chapters/*`, `/api/v2/storage/*`, dll.

### 3.3 Upload Video (Presigned URL)

```
1. Frontend → POST /api/v2/storage/presign (dengan JWT)
2. Backend → Generate presigned URL (R2 SDK)
3. Backend → Return { uploadUrl, publicUrl }
4. Frontend → PUT file ke R2 langsung (bypass server)
5. Frontend → Simpan publicUrl ke database
```

**Keuntungan:** Video besar gak lewat app server → hemat bandwidth.

---

## 4. Database Schema (Ringkas)

| Tabel | Fungsi |
|---|---|
| `users` | Data user (sales & admin) |
| `chapters` | Chapter pembelajaran |
| `modules` | Modul per chapter (video) |
| `quizzes` | Kuis per chapter |
| `quiz_questions` | Soal kuis chapter |
| `quiz_attempts` | Riwayat pengerjaan kuis |
| `monthly_quizzes` | Kuis bulanan |
| `monthly_quiz_questions` | Soal kuis bulanan |
| `monthly_quiz_attempts` | Riwayat kuis bulanan |
| `flashcards` | Fun fact |
| `badges` | Definisi badge |
| `user_badges` | Badge yang diperoleh user |
| `user_module_progress` | Progress modul per user |
| `user_flashcard_views` | Flashcard yang dilihat user |
| `leaderboard_prizes` | Hadiah per rank per bulan |
| `leaderboard_winners` | Pemenang bulanan |
| `leaderboard_config` | Config leaderboard |
| `user_popup_seen` | Popup yang sudah dilihat user |
| `password_resets` | Token reset password |
| `reports` | Report Power BI |
| `report_access` | Akses report per user |
| `report_views` | Log view report |

**Total:** 23 tabel.

---

## 5. Migrasi Bertahap

Project ini pakai **strangler pattern**: Express lama & NestJS baru jalan berdampingan.

| Fase | Status | Endpoint |
|---|---|---|
| Fase 0 | ✅ Selesai | Setup hybrid server |
| Fase 1 | ✅ Selesai | Auth (login, me) |
| Fase 2 | ✅ Selesai | Storage (presigned upload) |
| Fase 3 | ✅ Selesai | Rename Prisma ke singular |
| Fase 4 | ✅ Selesai | Chapters (list) |
| Fase 5 | ⏳ Pending | Quizzes |
| Fase 6 | ⏳ Pending | Progress |
| Fase 7 | ⏳ Pending | Leaderboard |
| Fase 8 | ⏳ Pending | Reports |
| Fase 9 | ⏳ Pending | Upload Excel |

**Endpoint baru** selalu di `/api/v2/*`. **Endpoint lama** tetap di `/api/*`.

---

## 6. Keamanan

### Auth Flow

1. User login → POST `/api/v2/auth/login`
2. Server verify password (bcrypt) → Generate JWT
3. JWT payload: `{ id, email, role, name }`
4. JWT expiration: 8 jam
5. Client simpan token di `localStorage`
6. Setiap request → Header `Authorization: Bearer <token>`

### Screenshot Guard

- Deteksi: `PrintScreen`, `Ctrl+P/S`, `Cmd+Shift+S/3/4/5`, `blur`, `visibilitychange`
- Overlay dengan identitas user (nama + email)
- Auto-hide 15 detik
- Block: `contextmenu`, `selectstart`, `dragstart`

### Video Guard

- Pause otomatis saat tab switch / window blur
- Anti-skip: seeking ke depan di-reset
- Watch tracking: video harus ditonton sampai habis

---

## 7. Environment Variables

### Backend (`backend/.env` & `backend/nestjs/.env`)

```env
# Server
PORT=4000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=30

# JWT (SAMA di kedua .env)
JWT_SECRET=<random-32-chars>
JWT_EXPIRES=8h

# Admin seed
ADMIN_EMAIL=admin@cimory.com
ADMIN_PASSWORD=<strong-password>

# Upload
UPLOAD_DIR=uploads
MAX_VIDEO_MB=500

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<email>
SMTP_PASS=<app-password>
SMTP_FROM="Cimory Sales Academy <noreply@cimory.com>"

# Cloudflare R2
R2_ACCOUNT_ID=<account-id>
R2_ACCESS_KEY_ID=<key>
R2_SECRET_ACCESS_KEY=<secret>
R2_BUCKET=cimory-media
R2_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# App URL
APP_URL=https://academy.cimory.com

# UV Threadpool
UV_THREADPOOL_SIZE=8
```

**JANGAN commit `.env` ke GitLab.**