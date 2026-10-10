# Features Documentation — Cimory Sales Academy

**Versi:** 1.0
**Tanggal:** 6 Oktober 2026
**Untuk:** Tim IT Cimory Group

---

## 📋 Daftar Isi

1. [Overview](#1-overview)
2. [Fitur User (Sales)](#2-fitur-user-sales)
3. [Fitur Admin](#3-fitur-admin)
4. [Fitur Keamanan](#4-fitur-keamanan)
5. [Database Schema](#5-database-schema)
6. [API Endpoints](#6-api-endpoints)

---

## 1. Overview

### 1.1 Deskripsi

Cimory Sales Academy adalah platform pembelajaran digital untuk tim sales Cimory Group & Kanzler. Platform ini menyediakan:

- **Modul video pembelajaran** per chapter
- **Kuis** untuk menguji pemahaman
- **Gamifikasi** (XP, streak, badge)
- **Leaderboard** dengan hadiah bulanan
- **Reports Power BI** terintegrasi
- **Fun fact** (flashcards) interaktif

### 1.2 Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | Node.js 20, NestJS 10, Express 4 (hybrid), Prisma 6 |
| Database | PostgreSQL 15+ |
| Frontend | Vanilla JavaScript (ES2022), HTML5, CSS3 |
| Object Storage | Cloudflare R2 (S3-compatible) |
| CDN | Cloudflare |
| Auth | JWT |
| Email | Nodemailer (SMTP) |

---

## 2. Fitur User (Sales)

### 2.1 Authentication

#### Login

**Deskripsi:** User login pakai email kantor & password.

**Endpoint:** `POST /api/v2/auth/login`

**Input:**
```json
{
  "email": "demo@cimory.com",
  "password": "demo123"
}
```

**Output:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 2,
    "email": "demo@cimory.com",
    "role": "user",
    "name": "Demo Sales"
  }
}
```

**Business Logic:**
1. Validasi email & password
2. Cek user di database
3. Verify password pakai bcrypt
4. Generate JWT token (expire 8 jam)
5. Return token & user data

**Security:**
- Rate limiting: 20 req / 15 menit
- bcrypt hashing (10 rounds)
- JWT dengan HS256

#### Forgot Password

**Deskripsi:** User minta link reset password via email.

**Endpoint:** `POST /api/auth/forgot-password`

**Business Logic:**
1. Cek email di database
2. Generate token 32-byte hex
3. Simpan token dengan expiry 1 jam
4. Kirim email dengan link reset
5. Link format: `https://academy.cimory.com/#/reset-password?token=xxx`

**Security:**
- Token random (crypto.randomBytes)
- Expire 1 jam
- Hapus token lama sebelum buat baru
- Selalu return `{ ok: true }` (jangan leak apakah email exist)

#### Reset Password

**Deskripsi:** User reset password pakai token dari email.

**Endpoint:** `POST /api/auth/reset-password`

**Business Logic:**
1. Verify token valid & belum expired
2. Hash password baru
3. Update password di database
4. Mark token sebagai used

#### Get User Info

**Deskripsi:** Ambil info user yang login.

**Endpoint:** `GET /api/v2/auth/me`

**Header:** `Authorization: Bearer <token>`

---

### 2.2 Dashboard

**Deskripsi:** Halaman utama user dengan ringkasan progress.

**Endpoint:** `GET /api/progress/me`

**Output:**
```json
{
  "completed": ["ch1-m1", "ch1-m2"],
  "quiz": {
    "ch1": { "best": 4, "total": 4 }
  },
  "flashcards": ["fc1", "fc2"],
  "xp": 250,
  "streak": 5
}
```

**Fitur Dashboard:**
- **Hero section** — menampilkan modul berikutnya yang harus diselesaikan
- **Progress ring** — persentase overall progress
- **Stats cards:**
  - Total modul selesai (X/Y)
  - Total XP
  - Streak hari beruntun
  - Badge diraih
- **Leaderboard preview** — Top 5 trainee + quiz bulan ini
- **Chapter cards** — list chapter dengan progress masing-masing

---

### 2.3 Belajar (Learn)

#### List Chapters

**Deskripsi:** Lihat semua chapter & modul.

**Endpoint:** `GET /api/v2/chapters`

**Output:**
```json
[
  {
    "id": "ch1",
    "no": 1,
    "title": "Serba-Serbi Menjadi Sales Kanzler",
    "description": "...",
    "modules": [
      {
        "id": "ch1-m1",
        "no": 1,
        "title": "Dikira Cuma Jualan, Taunya Cuan.",
        "duration": "6:30",
        "durationSec": 390,
        "video": "/uploads/videos/xxx.mp4",
        "summary": "..."
      }
    ]
  }
]
```

**Business Logic:**
- Query chapters dengan modules (include)
- Format duration dari detik ke `m:ss`
- Sort by sort_order

#### View Module (Video Player)

**Deskripsi:** Tonton video modul.

**Fitur Video Player:**
- **Video Guard** — pause otomatis saat user pindah tab / blur window
- **Anti-skip** — user tidak bisa seek ke depan (harus nonton sampai habis)
- **Watch tracking** — simpan posisi terakhir di localStorage
- **Auto-complete** — tombol "Tandai Selesai" aktif setelah video habis

**Module Locking:**
- Modul 1 di chapter 1: **unlocked**
- Modul 2+: **locked** sampai modul sebelumnya selesai
- Chapter 2+: **locked** sampai semua modul chapter sebelumnya selesai

#### Complete Module

**Deskripsi:** Tandai modul sebagai selesai.

**Endpoint:** `POST /api/progress/modules/:id/complete`

**Business Logic:**
1. Cek apakah modul terkunci (prev module belum selesai)
2. Cek apakah chapter terkunci (prev chapter belum 100%)
3. Kalau udah selesai sebelumnya, skip (idempotent)
4. Insert ke `user_module_progress`
5. **+50 XP** untuk user
6. Update streak
7. Recompute badges

**Reward:**
- XP: +50
- Streak: di-update
- Badges: di-recompute

---

### 2.4 Kuis Chapter

#### List Kuis

**Deskripsi:** Lihat semua kuis per chapter.

**Endpoint:** `GET /api/quizzes`

**Business Logic:**
- Kalau user **admin**, include `explain` di setiap question
- Kalau user **biasa**, jangan include `explain`

#### Submit Kuis

**Deskripsi:** Submit jawaban kuis chapter.

**Endpoint:** `POST /api/quizzes/:chapterId/submit`

**Input:**
```json
{
  "answers": [
    { "questionId": 1, "chosen": 1 },
    { "questionId": 2, "chosen": 0 }
  ],
  "durationSec": 180
}
```

**Business Logic:**
1. **Cek lock:** semua modul di chapter harus selesai dulu
2. Hitung correct answer
3. **First-time correct:** XP cuma dikasih kalau user belum pernah jawab benar soal ini
   - Insert ke `user_question_answered`
   - **+10 XP per first-time correct**
4. Insert attempt ke `quiz_attempts`
5. Update streak
6. Recompute badges

**Reward:**
- XP: +10 per first-time correct
- Badges: recompute

**Kunci Jawaban:**
- Kalau **passed**: tampilkan kunci + penjelasan
- Kalau **gak passed**: kunci disembunyikan

---

### 2.5 Quiz Bulanan

#### Quiz Bulan Ini

**Deskripsi:** Quiz event bulanan, cuma bisa dikerjakan 1× per bulan.

**Endpoint:** `GET /api/monthly-quiz/current`

**Business Logic:**
- Quiz bulanan berdasarkan `monthKey` (format YYYY-MM)
- Cuma 1 quiz per bulan (UNIQUE constraint)
- Kalau user udah attempt → `locked: true`

#### Submit Quiz Bulanan

**Deskripsi:** Submit jawaban quiz bulanan.

**Endpoint:** `POST /api/monthly-quiz/:id/submit`

**Business Logic:**
1. **Cek UNIQUE:** user cuma bisa submit 1× per bulan
2. Cek quiz masih aktif & bulan ini
3. Hitung correct answer
4. **XP:** +15 per correct
5. Insert attempt (dengan `answers_json`)
6. Update streak
7. Recompute badges

**Reward:**
- XP: +15 per correct
- Badges: recompute

#### Arsip Quiz Bulanan

**Deskripsi:** Lihat quiz bulan lalu.

**Endpoint:** `GET /api/monthly-quiz/archive`

---

### 2.6 Fun Fact (Flashcards)

**Deskripsi:** Kartu flip 3D dengan fakta menarik Cimory & Kanzler.

**Endpoint:** `GET /api/flashcards`

**Fitur:**
- **Kartu flip 3D** — klik untuk balik
- **Tracking view** — catat kartu mana yang udah dilihat
- **Badge "Kolektor Fun Fact"** — dapat badge kalau buka semua kartu

**Business Logic:**
- `POST /api/flashcards/:id/view` — catat view
- Insert ke `user_flashcard_views`
- Recompute badges

---

### 2.7 Badges

**Deskripsi:** Koleksi badge yang udah diraih.

**Endpoint:** `GET /api/badges`

**6 Tipe Badge:**

| Type | Kondisi |
|---|---|
| `modules` | Jumlah modul selesai >= threshold |
| `streak` | Streak >= threshold |
| `chapter` | Chapter selesai >= threshold |
| `perfectQuiz` | Quiz dengan skor 100% >= threshold |
| `flashcards` | Flashcard dibuka >= threshold |
| `allModules` | Semua modul selesai |

**Business Logic:**
- Badge di-recompute setiap kali:
  - Selesai modul
  - Submit kuis
  - Buka flashcard

---

### 2.8 Leaderboard

**Deskripsi:** Papan peringkat dengan 2 mode.

**Endpoint:** `GET /api/leaderboard/progress`

**2 Mode Leaderboard:**

**Mode 1: Top Trainee (Quiz Chapter)**
- Ranking berdasarkan **total skor** dari semua kuis chapter bulan ini
- Tie-breaker: **waktu tercepat**
- Best score per chapter (ROW_NUMBER PARTITION BY user, chapter)

**Mode 2: Quiz Bulanan**
- Ranking berdasarkan **skor quiz bulanan**
- Tie-breaker: **waktu tercepat**

**Business Logic:**
- Query pakai **window function** (ROW_NUMBER)
- Ambil best attempt per chapter per user
- Aggregate total score & duration
- Sort by score DESC, duration ASC, xp DESC, name ASC
- Limit 200

---

### 2.9 Reports (Power BI)

**Deskripsi:** Embed dashboard Power BI dengan access control.

**Endpoint:** `GET /api/reports`

**Fitur:**
- **Access control:** user cuma bisa lihat report yang di-grant admin
- **Embed Power BI:** pakai iframe dengan URL dari admin
- **Fullscreen mode:** tombol untuk fullscreen
- **View tracking:** catat view per user

---

### 2.10 Popup & Announcement

**Deskripsi:** Popup yang muncul saat user login.

**Endpoint:** `GET /api/leaderboard/my-popup`

**3 Tipe Popup:**

1. **Winner** — kalau user menang, tampilkan popup "Kamu Juara 1!"
2. **Winners Board** — kalau user gak menang, tampilkan papan pemenang
3. **Announcement** — pengumuman dari admin (dengan jadwal tayang)

**Business Logic:**
- Popup cuma muncul **sekali** per user
- Setelah user lihat, mark sebagai seen
- Admin bisa atur jadwal tayang popup

---

## 3. Fitur Admin

### 3.1 Dashboard Admin

**Endpoint:** `GET /api/progress/admin/all` + `GET /api/leaderboard/progress`

**Fitur:**
- **Stats:** total user, chapter, modul, soal kuis
- **Top 5 trainee** bulan ini
- **Banner quiz bulanan aktif**

---

### 3.2 Manajemen Chapter & Modul

#### CRUD Chapter

**Endpoint:**
- `POST /api/chapters` — tambah chapter
- `PUT /api/chapters/:id` — update chapter
- `DELETE /api/chapters/:id` — hapus chapter

#### CRUD Modul

**Endpoint:**
- `POST /api/chapters/:chapterId/modules` — tambah modul
- `PUT /api/chapters/modules/:id` — update modul
- `DELETE /api/chapters/modules/:id` — hapus modul

**Upload Video:**
- `POST /api/upload/video` — upload video (max 500 MB)
- Format: MP4, WebM, MOV, MKV

---

### 3.3 Manajemen Kuis

#### CRUD Kuis

**Endpoint:**
- `POST /api/quizzes` — tambah kuis
- `DELETE /api/quizzes/:id` — hapus kuis

#### CRUD Soal

**Endpoint:**
- `POST /api/quizzes/:quizId/questions` — tambah soal
- `DELETE /api/quizzes/questions/:id` — hapus soal

#### Import Excel

**Endpoint:** `POST /api/upload/excel/quiz/import`

**Format Excel:**

| q | option_a | option_b | option_c | option_d | answer | explain |
|---|---|---|---|---|---|---|
| Apa langkah pertama? | PDKT | Promo | Bongkar rak | Minta order | a | PDKT dulu. |

---

### 3.4 Manajemen Quiz Bulanan

**Endpoint:**
- `GET /api/monthly-quiz/admin/list`
- `POST /api/monthly-quiz/admin`
- `PUT /api/monthly-quiz/admin/:id`
- `POST /api/monthly-quiz/admin/:id/toggle-active`
- `DELETE /api/monthly-quiz/admin/:id`
- `GET /api/monthly-quiz/admin/:id/attempts`

---

### 3.5 Manajemen Flashcard

**Endpoint:**
- `POST /api/flashcards`
- `PUT /api/flashcards/:id`
- `DELETE /api/flashcards/:id`
- `POST /api/upload/excel/flashcards/import`

---

### 3.6 Manajemen Badge

**Endpoint:**
- `GET /api/badges/admin/list`
- `POST /api/badges/admin`
- `PUT /api/badges/admin/:id`
- `DELETE /api/badges/admin/:id?force=1`
- `GET /api/badges/admin/:id/owners`

---

### 3.7 Manajemen User

**Endpoint:**
- `GET /api/progress/admin/all`
- `GET /api/progress/admin/users/:id`
- `POST /api/progress/admin/users`
- `PUT /api/progress/admin/users/:id`
- `POST /api/progress/admin/users/:id/reset-password`
- `DELETE /api/progress/admin/users/:id`
- `POST /api/upload/excel/users/import`

---

### 3.8 Manajemen Leaderboard

**Endpoint:**
- `POST /api/leaderboard/prizes` — set hadiah
- `POST /api/leaderboard/generate-winners` — generate pemenang
- `POST /api/leaderboard/announcement` — set announcement
- `GET /api/leaderboard/popup-analytics` — analytics

---

### 3.9 Manajemen Reports

**Endpoint:**
- `GET /api/reports/admin/all`
- `POST /api/reports/admin`
- `PUT /api/reports/admin/:id`
- `DELETE /api/reports/admin/:id`
- `GET /api/reports/admin/:id/access`
- `POST /api/reports/admin/:id/access`
- `GET /api/reports/admin/:id/analytics`
- `POST /api/upload/excel/reports/import`

---

## 4. Fitur Keamanan

### 4.1 Screenshot Guard

**Deskripsi:** Deteksi & blokir aktivitas screenshot/screen record.

**Deteksi:**
- **PrintScreen** key
- **Ctrl+P** (print), **Ctrl+S** (save)
- **Cmd+Shift+S** (screenshot macOS)
- **Cmd+Shift+3/4/5** (screenshot macOS)
- **Window blur** (pindah aplikasi)
- **Visibility change** (pindah tab)

**Aksi:**
- Tampilkan **overlay dengan identitas user**
- Overlay auto-hide setelah **15 detik**
- Block `contextmenu`, `selectstart`, `dragstart`

### 4.2 Video Guard

**Deskripsi:** Pause video otomatis saat user pindah tab / blur.

### 4.3 Anti-Skip Video

**Deskripsi:** User gak bisa seek ke depan.

### 4.4 Rate Limiting

**Endpoint:** `POST /api/auth/login`
**Limit:** 20 request / 15 menit

### 4.5 Content Security Policy (CSP)

Pakai Helmet dengan CSP custom (allow Power BI, Google Fonts, dll).

### 4.6 CORS

`origin: true, credentials: true`

---

## 5. Database Schema

### 5.1 Tabel Overview

**Total:** 23 tabel

| Kategori | Tabel | Row Estimasi/Tahun |
|---|---|---|
| **User** | users | 1.000-10.000 |
| | password_resets | ~500 |
| | user_badges | ~6.000 |
| | user_module_progress | ~50.000 |
| | user_flashcard_views | ~10.000 |
| | user_popup_seen | ~120.000 |
| | user_question_answered | ~50.000 |
| **Konten** | chapters | ~10 |
| | modules | ~100 |
| | flashcards | ~50 |
| | badges | ~10 |
| **Kuis** | quizzes | ~10 |
| | quiz_questions | ~200 |
| | quiz_attempts | ~36.000 |
| | monthly_quizzes | ~12 |
| | monthly_quiz_questions | ~120 |
| | monthly_quiz_attempts | ~12.000 |
| **Leaderboard** | leaderboard_prizes | ~36 |
| | leaderboard_winners | ~36 |
| | leaderboard_config | ~12 |
| **Reports** | reports | ~10 |
| | report_access | ~100 |
| | report_views | ~240.000 |

**Total pertumbuhan:** ~35-40 MB/tahun (1.000 user aktif)

---

## 6. API Endpoints

### 6.1 Auth

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | /api/v2/auth/login | ❌ | Login |
| POST | /api/auth/register | ❌ | Register |
| GET | /api/v2/auth/me | ✅ | Info user |
| POST | /api/auth/forgot-password | ❌ | Request reset |
| POST | /api/auth/reset-password | ❌ | Reset password |
| POST | /api/auth/change-password | ✅ | Ganti password |

### 6.2 Chapters

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/v2/chapters | ✅ | ❌ | List chapter |
| POST | /api/chapters | ✅ | ✅ | Tambah |
| PUT | /api/chapters/:id | ✅ | ✅ | Update |
| DELETE | /api/chapters/:id | ✅ | ✅ | Hapus |

### 6.3 Quizzes

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/quizzes | ✅ | ❌ | List kuis |
| POST | /api/quizzes/:chapterId/submit | ✅ | ❌ | Submit |
| POST | /api/quizzes | ✅ | ✅ | Tambah kuis |
| POST | /api/quizzes/:quizId/questions | ✅ | ✅ | Tambah soal |
| DELETE | /api/quizzes/questions/:id | ✅ | ✅ | Hapus soal |
| DELETE | /api/quizzes/:id | ✅ | ✅ | Hapus kuis |

### 6.4 Monthly Quiz

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/monthly-quiz/current | ✅ | ❌ | Quiz bulan ini |
| GET | /api/monthly-quiz/archive | ✅ | ❌ | Arsip |
| POST | /api/monthly-quiz/:id/submit | ✅ | ❌ | Submit |
| GET | /api/monthly-quiz/admin/list | ✅ | ✅ | List (admin) |
| POST | /api/monthly-quiz/admin | ✅ | ✅ | Buat baru |
| PUT | /api/monthly-quiz/admin/:id | ✅ | ✅ | Update |
| DELETE | /api/monthly-quiz/admin/:id | ✅ | ✅ | Hapus |

### 6.5 Flashcards

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/flashcards | ✅ | ❌ | List |
| POST | /api/flashcards/:id/view | ✅ | ❌ | Catat view |
| POST | /api/flashcards | ✅ | ✅ | Tambah |
| PUT | /api/flashcards/:id | ✅ | ✅ | Update |
| DELETE | /api/flashcards/:id | ✅ | ✅ | Hapus |

### 6.6 Badges

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/badges | ✅ | ❌ | List + owned |
| GET | /api/badges/admin/list | ✅ | ✅ | List + stats |
| POST | /api/badges/admin | ✅ | ✅ | Tambah |
| PUT | /api/badges/admin/:id | ✅ | ✅ | Update |
| DELETE | /api/badges/admin/:id | ✅ | ✅ | Hapus |
| GET | /api/badges/admin/:id/owners | ✅ | ✅ | Lihat owners |

### 6.7 Progress

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/progress/me | ✅ | ❌ | Progress user |
| POST | /api/progress/modules/:id/complete | ✅ | ❌ | Tandai selesai |
| GET | /api/progress/admin/all | ✅ | ✅ | List semua user |
| GET | /api/progress/admin/users/:id | ✅ | ✅ | Detail user |
| POST | /api/progress/admin/users | ✅ | ✅ | Tambah user |
| PUT | /api/progress/admin/users/:id | ✅ | ✅ | Update user |
| DELETE | /api/progress/admin/users/:id | ✅ | ✅ | Hapus user |

### 6.8 Leaderboard

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/leaderboard/progress | ✅ | ❌ | Ranking |
| GET | /api/leaderboard/winners | ✅ | ❌ | Pemenang |
| GET | /api/leaderboard/prizes | ✅ | ❌ | Hadiah |
| POST | /api/leaderboard/prizes | ✅ | ✅ | Set hadiah |
| POST | /api/leaderboard/generate-winners | ✅ | ✅ | Generate winners |
| GET | /api/leaderboard/announcement | ✅ | ❌ | Ambil announcement |
| POST | /api/leaderboard/announcement | ✅ | ✅ | Set announcement |
| GET | /api/leaderboard/my-popup | ✅ | ❌ | Popup user |
| POST | /api/leaderboard/mark-seen | ✅ | ❌ | Mark popup seen |

### 6.9 Reports

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| GET | /api/reports | ✅ | ❌ | List user |
| GET | /api/reports/:slug | ✅ | ❌ | Detail |
| GET | /api/reports/admin/all | ✅ | ✅ | List admin |
| POST | /api/reports/admin | ✅ | ✅ | Tambah |
| PUT | /api/reports/admin/:id | ✅ | ✅ | Update |
| DELETE | /api/reports/admin/:id | ✅ | ✅ | Hapus |
| GET | /api/reports/admin/:id/access | ✅ | ✅ | List akses |
| POST | /api/reports/admin/:id/access | ✅ | ✅ | Set akses |
| GET | /api/reports/admin/:id/analytics | ✅ | ✅ | Analytics |

### 6.10 Upload

| Method | Endpoint | Auth | Admin | Fungsi |
|---|---|---|---|---|
| POST | /api/upload/video | ✅ | ✅ | Upload video |
| POST | /api/upload/image | ✅ | ✅ | Upload gambar |
| POST | /api/upload/excel/quiz/import | ✅ | ✅ | Import kuis |
| POST | /api/upload/excel/monthly-quiz/import | ✅ | ✅ | Import monthly quiz |
| POST | /api/upload/excel/flashcards/import | ✅ | ✅ | Import flashcards |
| POST | /api/upload/excel/users/import | ✅ | ✅ | Import users |
| POST | /api/upload/excel/reports/import | ✅ | ✅ | Import reports |
| GET | /api/upload/excel/template/:type | ✅ | ✅ | Download template |

### 6.11 Storage (NestJS v2)

| Method | Endpoint | Auth | Fungsi |
|---|---|---|---|
| POST | /api/v2/storage/presign | ✅ | Presigned upload URL |

---

**Last Updated:** 6 Oktober 2026
**Versi:** 1.0
**Status:** Final