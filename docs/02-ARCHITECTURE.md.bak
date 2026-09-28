# Architecture â€” Cimory Sales Academy



---



## 1. Diagram Arsitektur



```

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”

â”‚                    CLOUDFLARE (CDN + WAF)                â”‚

â”‚              Free tier: DDoS, SSL, CDN global            â”‚

â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

&#x20;                    â”‚

&#x20;        â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”´â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”

&#x20;        â–¼                       â–¼

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”    â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”

â”‚  APP SERVER     â”‚    â”‚  OBJECT STORAGE â”‚

â”‚  Node.js        â”‚    â”‚  Cloudflare R2  â”‚

â”‚  NestJS + Expressâ”‚    â”‚                 â”‚

â”‚                 â”‚    â”‚  - Video modul  â”‚

â”‚  2-4 vCPU       â”‚    â”‚  - Gambar       â”‚

â”‚  4-8 GB RAM     â”‚    â”‚  - Upload user  â”‚

â””â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”˜    â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

&#x20;        â”‚

&#x20;        â–¼

â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”

â”‚  DATABASE       â”‚

â”‚  PostgreSQL     â”‚

â”‚  (Supabase Pro) â”‚

â”‚  8-10 GB        â”‚

â”‚  Daily Backup   â”‚

â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜

```



---



## 2. Struktur Aplikasi



### Backend (Hybrid)



```

backend/

â”œâ”€â”€ nestjs/                 # NestJS v2 (fitur baru)

â”‚   â”œâ”€â”€ src/

â”‚   â”‚   â”œâ”€â”€ modules/

â”‚   â”‚   â”‚   â”œâ”€â”€ auth/       # Login, register, JWT

â”‚   â”‚   â”‚   â”œâ”€â”€ chapters/   # Chapter \& modul

â”‚   â”‚   â”‚   â”œâ”€â”€ storage/    # Upload ke R2

â”‚   â”‚   â”‚   â””â”€â”€ ...         # Modul lain (bertahap)

â”‚   â”‚   â”œâ”€â”€ prisma/         # Prisma service

â”‚   â”‚   â”œâ”€â”€ app.module.ts

â”‚   â”‚   â””â”€â”€ main.ts

â”‚   â”œâ”€â”€ prisma/

â”‚   â”‚   â””â”€â”€ schema.prisma   # Schema database

â”‚   â””â”€â”€ .env                # Config (JANGAN commit)

â”œâ”€â”€ legacy-app.js           # Express lama (di-mount)

â”œâ”€â”€ routes/                 # Express routes

â”œâ”€â”€ middleware/             # Auth, upload

â”œâ”€â”€ services/               # Badge, email, excel

â”œâ”€â”€ db/

â”‚   â””â”€â”€ pool.js             # PostgreSQL pool

â””â”€â”€ .env                    # Config (JANGAN commit)

```



### Frontend



```

frontend/

â”œâ”€â”€ index.html

â”œâ”€â”€ js/

â”‚   â”œâ”€â”€ config.js           # Config API base

â”‚   â”œâ”€â”€ api.js              # Fetch wrapper

â”‚   â”œâ”€â”€ auth.js             # Login/logout

â”‚   â”œâ”€â”€ ui.js               # UI helpers

â”‚   â”œâ”€â”€ store.js            # State management

â”‚   â”œâ”€â”€ guard.js            # Screenshot guard

â”‚   â”œâ”€â”€ admin.js            # Admin panel

â”‚   â””â”€â”€ app.js              # Main SPA

â”œâ”€â”€ css/

â”‚   â”œâ”€â”€ style.css           # User-facing CSS

â”‚   â””â”€â”€ admin.css           # Admin CSS

â””â”€â”€ assets/

&#x20;   â””â”€â”€ *.png               # Logo, mascot

```



---



## 3. Alur Request



### 3.1 Fitur Lama (Express)



```

User â†’ Cloudflare â†’ App Server

&#x20;                      â†“

&#x20;                  Express (legacy-app.js)

&#x20;                      â†“

&#x20;                  /api/* routes

&#x20;                      â†“

&#x20;                  PostgreSQL (via pg.Pool)

```



**Endpoint:** `/api/auth/*`, `/api/chapters/*`, `/api/quizzes/*`, dll.



### 3.2 Fitur Baru (NestJS)



```

User â†’ Cloudflare â†’ App Server

&#x20;                      â†“

&#x20;                  NestJS (main.ts)

&#x20;                      â†“

&#x20;                  /api/v2/* routes

&#x20;                      â†“

&#x20;                  Module â†’ Service â†’ Prisma â†’ PostgreSQL

```



**Endpoint:** `/api/v2/auth/*`, `/api/v2/chapters/*`, `/api/v2/storage/*`, dll.



### 3.3 Upload Video (Presigned URL)



```

1\. Frontend â†’ POST /api/v2/storage/presign (dengan JWT)

2\. Backend â†’ Generate presigned URL (R2 SDK)

3\. Backend â†’ Return { uploadUrl, publicUrl }

4\. Frontend â†’ PUT file ke R2 langsung (bypass server)

5\. Frontend â†’ Simpan publicUrl ke database

```



**Keuntungan:** Video besar gak lewat app server â†’ hemat bandwidth server.



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

| Fase 0 | âœ… Selesai | Setup hybrid server |

| Fase 1 | âœ… Selesai | Auth (login, me) |

| Fase 2 | âœ… Selesai | Storage (presigned upload) |

| Fase 3 | âœ… Selesai | Rename Prisma ke singular |

| Fase 4 | â³ Berjalan | Chapters (list) |

| Fase 5 | â³ Pending | Quizzes |

| Fase 6 | â³ Pending | Progress |

| Fase 7 | â³ Pending | Leaderboard |

| Fase 8 | â³ Pending | Reports |

| Fase 9 | â³ Pending | Upload Excel |



**Endpoint baru** selalu di `/api/v2/*`. **Endpoint lama** tetap di `/api/*`.



---



## 6. Keamanan



### Auth Flow



1\. User login â†’ POST `/api/v2/auth/login`

2\. Server verify password (bcrypt) â†’ Generate JWT

3\. JWT payload: `{ id, email, role, name }`

4\. JWT expiration: 8 jam

5\. Client simpan token di `localStorage`

6\. Setiap request â†’ Header `Authorization: Bearer <token>`



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

DATABASE_URL=postgresql://user:pass@host:5432/db



# JWT (HARUS SAMA di kedua .env)

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

```



**âš ï¸ JANGAN commit `.env` ke GitLab.**

