# Architecture Ã¢â‚¬â€ Cimory Sales Academy



**Versi:** 1.0

**Tanggal:** 28 September 2026



---



## 1. Diagram Arsitektur



```

Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â

Ã¢â€â€š                    CLOUDFLARE (CDN + WAF)                Ã¢â€â€š

Ã¢â€â€š              Free tier: DDoS, SSL, CDN global            Ã¢â€â€š

Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ

&#x20;                    Ã¢â€â€š

&#x20;        Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â´Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â

&#x20;        Ã¢â€“Â¼                       Ã¢â€“Â¼

Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â    Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â

Ã¢â€â€š  APP SERVER     Ã¢â€â€š    Ã¢â€â€š  OBJECT STORAGE Ã¢â€â€š

Ã¢â€â€š  Node.js        Ã¢â€â€š    Ã¢â€â€š  Cloudflare R2  Ã¢â€â€š

Ã¢â€â€š  NestJS + ExpressÃ¢â€â€š    Ã¢â€â€š                 Ã¢â€â€š

Ã¢â€â€š                 Ã¢â€â€š    Ã¢â€â€š  - Video modul  Ã¢â€â€š

Ã¢â€â€š  2-4 vCPU       Ã¢â€â€š    Ã¢â€â€š  - Gambar       Ã¢â€â€š

Ã¢â€â€š  4-8 GB RAM     Ã¢â€â€š    Ã¢â€â€š  - Upload user  Ã¢â€â€š

Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ    Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ

&#x20;        Ã¢â€â€š

&#x20;        Ã¢â€“Â¼

Ã¢â€Å’Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Â

Ã¢â€â€š  DATABASE       Ã¢â€â€š

Ã¢â€â€š  PostgreSQL     Ã¢â€â€š

Ã¢â€â€š  (Supabase Pro) Ã¢â€â€š

Ã¢â€â€š  8-10 GB        Ã¢â€â€š

Ã¢â€â€š  Daily Backup   Ã¢â€â€š

Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€Ëœ

```



---



## 2. Struktur Aplikasi



### Backend (Hybrid)



```

backend/

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ nestjs/                 # NestJS v2 (fitur baru)

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ src/

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ modules/

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ auth/       # Login, register, JWT

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ chapters/   # Chapter \& modul

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ storage/    # Upload ke R2

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ ...         # Modul lain (bertahap)

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ prisma/         # Prisma service

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ app.module.ts

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ main.ts

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ prisma/

Ã¢â€â€š   Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ schema.prisma   # Schema database

Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ .env                # Config (JANGAN commit)

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ legacy-app.js           # Express lama (di-mount)

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ routes/                 # Express routes

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ middleware/             # Auth, upload

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ services/               # Badge, email, excel

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ db/

Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ pool.js             # PostgreSQL pool

Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ .env                    # Config (JANGAN commit)

```



### Frontend



```

frontend/

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ index.html

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ js/

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ config.js           # Config API base

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ api.js              # Fetch wrapper

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ auth.js             # Login/logout

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ ui.js               # UI helpers

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ store.js            # State management

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ guard.js            # Screenshot guard

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ admin.js            # Admin panel

Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ app.js              # Main SPA

Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ css/

Ã¢â€â€š   Ã¢â€Å“Ã¢â€â‚¬Ã¢â€â‚¬ style.css           # User-facing CSS

Ã¢â€â€š   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ admin.css           # Admin CSS

Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ assets/

&#x20;   Ã¢â€â€Ã¢â€â‚¬Ã¢â€â‚¬ *.png               # Logo, mascot

```



---



## 3. Alur Request



### 3.1 Fitur Lama (Express)



```

User Ã¢â€ â€™ Cloudflare Ã¢â€ â€™ App Server

&#x20;                      Ã¢â€ â€œ

&#x20;                  Express (legacy-app.js)

&#x20;                      Ã¢â€ â€œ

&#x20;                  /api/* routes

&#x20;                      Ã¢â€ â€œ

&#x20;                  PostgreSQL (via pg.Pool)

```



**Endpoint:** `/api/auth/*`, `/api/chapters/*`, `/api/quizzes/*`, dll.



### 3.2 Fitur Baru (NestJS)



```

User Ã¢â€ â€™ Cloudflare Ã¢â€ â€™ App Server

&#x20;                      Ã¢â€ â€œ

&#x20;                  NestJS (main.ts)

&#x20;                      Ã¢â€ â€œ

&#x20;                  /api/v2/* routes

&#x20;                      Ã¢â€ â€œ

&#x20;                  Module Ã¢â€ â€™ Service Ã¢â€ â€™ Prisma Ã¢â€ â€™ PostgreSQL

```



**Endpoint:** `/api/v2/auth/*`, `/api/v2/chapters/*`, `/api/v2/storage/*`, dll.



### 3.3 Upload Video (Presigned URL)



```

1\. Frontend Ã¢â€ â€™ POST /api/v2/storage/presign (dengan JWT)

2\. Backend Ã¢â€ â€™ Generate presigned URL (R2 SDK)

3\. Backend Ã¢â€ â€™ Return { uploadUrl, publicUrl }

4\. Frontend Ã¢â€ â€™ PUT file ke R2 langsung (bypass server)

5\. Frontend Ã¢â€ â€™ Simpan publicUrl ke database

```



**Keuntungan:** Video besar gak lewat app server Ã¢â€ â€™ hemat bandwidth.



---



## 4. Database Schema (Ringkas)



| Tabel | Fungsi |

|---|---|

| `users` | Data user (sales \& admin) |

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



Project ini pakai **strangler pattern**: Express lama \& NestJS baru jalan berdampingan.



| Fase | Status | Endpoint |

|---|---|---|

| Fase 0 | Ã¢Å“â€¦ Selesai | Setup hybrid server |

| Fase 1 | Ã¢Å“â€¦ Selesai | Auth (login, me) |

| Fase 2 | Ã¢Å“â€¦ Selesai | Storage (presigned upload) |

| Fase 3 | Ã¢Å“â€¦ Selesai | Rename Prisma ke singular |

| Fase 4 | Ã¢Å“â€¦ Selesai | Chapters (list) |

| Fase 5 | Ã¢ÂÂ³ Pending | Quizzes |

| Fase 6 | Ã¢ÂÂ³ Pending | Progress |

| Fase 7 | Ã¢ÂÂ³ Pending | Leaderboard |

| Fase 8 | Ã¢ÂÂ³ Pending | Reports |

| Fase 9 | Ã¢ÂÂ³ Pending | Upload Excel |



**Endpoint baru** selalu di `/api/v2/*`. **Endpoint lama** tetap di `/api/*`.



---



## 6. Keamanan



### Auth Flow



1\. User login Ã¢â€ â€™ POST `/api/v2/auth/login`

2\. Server verify password (bcrypt) Ã¢â€ â€™ Generate JWT

3\. JWT payload: `{ id, email, role, name }`

4\. JWT expiration: 8 jam

5\. Client simpan token di `localStorage`

6\. Setiap request Ã¢â€ â€™ Header `Authorization: Bearer <token>`



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



### Backend (`backend/.env` \& `backend/nestjs/.env`)



```env

# Server

PORT=4000

NODE_ENV=production



# Database

DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20\&pool_timeout=30



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

