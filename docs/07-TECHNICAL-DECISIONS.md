\# Technical Decisions — Cimory Sales Academy



\*\*Versi:\*\* 1.0

\*\*Tanggal:\*\* 28 September 2026



\---



\## 1. Keputusan Teknis Utama



\### 1.1 NestJS + Express Hybrid (Strangler Pattern)



\*\*Keputusan:\*\* Migrasi bertahap dari Express ke NestJS.



\*\*Alasan:\*\*



\- \*\*Gak ada downtime:\*\* Express lama tetap jalan, fitur baru di NestJS

\- \*\*Risiko rendah:\*\* Kalau NestJS bermasalah, tinggal matiin `/api/v2`

\- \*\*Bisa di-test bertahap:\*\* Satu fitur selesai, langsung deploy

\- \*\*Gak perlu rewrite total:\*\* Hemat waktu \& biaya



\*\*Konsekuensi:\*\*



\- Dua codebase (Express \& NestJS) harus di-maintain

\- JWT secret harus sama di kedua `.env`

\- Perlu shared library untuk auth



\*\*Status:\*\* ✅ Berjalan (Fase 1-4 selesai)



\---



\### 1.2 Prisma sebagai ORM



\*\*Keputusan:\*\* Ganti raw SQL ke Prisma ORM.



\*\*Alasan:\*\*



\- \*\*Type-safe:\*\* TypeScript error ketangkep di compile time

\- \*\*Migrations gampang:\*\* `prisma migrate` handle schema changes

\- \*\*Query builder:\*\* Gak perlu nulis SQL manual

\- \*\*Schema-driven:\*\* Satu file `schema.prisma` jadi source of truth



\*\*Konsekuensi:\*\*



\- Perlu generate client setiap schema berubah

\- Beberapa query kompleks (window function) harus pakai `$queryRaw`

\- Ukuran `node\_modules` lebih besar



\*\*Status:\*\* ✅ Berjalan



\---



\### 1.3 Cloudflare R2 untuk Object Storage



\*\*Keputusan:\*\* Pakai Cloudflare R2, bukan AWS S3.



\*\*Alasan:\*\*



\- \*\*No egress fee:\*\* Hemat $45/bulan untuk 500 GB bandwidth

\- \*\*S3-compatible:\*\* Gampang migrate kalau perlu

\- \*\*Integrasi Cloudflare CDN:\*\* Gratis

\- \*\*Harga storage murah:\*\* $0.015/GB/bulan



\*\*Perbandingan:\*\*



| Provider | Storage 100 GB | Egress 500 GB | Total/bulan |

|---|---|---|---|

| \*\*Cloudflare R2\*\* | $1.50 | \*\*$0\*\* | \*\*$1.50\*\* |

| AWS S3 | $2.30 | $45 | $47.30 |



\*\*Hemat:\*\* $45.80/bulan = \*\*$549.60/tahun\*\*



\*\*Status:\*\* ✅ Berjalan



\---



\### 1.4 Supabase untuk Database



\*\*Keputusan:\*\* Pakai Supabase Pro (managed PostgreSQL).



\*\*Alasan:\*\*



\- \*\*Managed:\*\* IT gak perlu maintenance server DB

\- \*\*Daily backup:\*\* Otomatis, retention 30 hari

\- \*\*Connection pooling:\*\* Built-in (PgBouncer)

\- \*\*Dashboard:\*\* Monitoring \& query editor

\- \*\*Harga:\*\* $25/bulan (8 GB)



\*\*Konsekuensi:\*\*



\- Data di server Supabase (bukan on-premise)

\- Perlu internet untuk akses

\- Vendor lock-in (tapi bisa migrate)



\*\*Status:\*\* ✅ Berjalan



\---



\### 1.5 JWT untuk Auth



\*\*Keputusan:\*\* Pakai JWT (stateless auth).



\*\*Alasan:\*\*



\- \*\*Stateless:\*\* Gak perlu session store

\- \*\*Scalable:\*\* Bisa multiple server tanpa sharing session

\- \*\*Standard:\*\* Banyak library \& tool support

\- \*\*Payload flexible:\*\* Bisa simpan role, name, dll



\*\*Konsekuensi:\*\*



\- Token gak bisa di-revoke (kecuali pakai blacklist)

\- Expiry 8 jam (perlu refresh token untuk long session)

\- Token di localStorage (rentan XSS)



\*\*Status:\*\* ✅ Berjalan



\---



\### 1.6 UV\_THREADPOOL\_SIZE = 8



\*\*Keputusan:\*\* Naikin threadpool dari default 4 ke 8.



\*\*Alasan:\*\*



\- \*\*Node.js single-threaded:\*\* Event loop utama cuma 1

\- \*\*Threadpool:\*\* Handle I/O operations (file, network, crypto)

\- \*\*Default 4:\*\* Kadang bottleneck untuk I/O heavy

\- \*\*Naik ke 8:\*\* Throughput naik 41% (hasil test)



\*\*Konsekuensi:\*\*



\- Konsumsi CPU naik

\- Perlu RAM lebih (tiap thread \~2 MB stack)



\*\*Status:\*\* ✅ Berjalan



\---



\### 1.7 Connection Pool = 20



\*\*Keputusan:\*\* Naikin Prisma connection pool dari 5 ke 20.



\*\*Alasan:\*\*



\- \*\*Default 5:\*\* `num\_cpus \* 2 + 1` = 5 (2 vCPU)

\- \*\*Beban tinggi:\*\* 500-1.000 user butuh lebih banyak koneksi

\- \*\*Error turun:\*\* Dari 0.76% → 0.00% (hasil test)

\- \*\*Throughput naik:\*\* 41%



\*\*Konsekuensi:\*\*



\- PostgreSQL perlu `max\_connections` lebih besar

\- Setiap koneksi makan \~4-10 MB RAM



\*\*Status:\*\* ✅ Berjalan



\---



\## 2. Keputusan yang Dipertimbangkan Tapi Ditolak



\### 2.1 Next.js untuk Frontend



\*\*Alasan ditolak:\*\*



\- Perlu rewrite total frontend (vanilla JS → React)

\- Waktu 2-4 minggu

\- Belum urgent, bisa nanti



\*\*Status:\*\* ⏳ Ditunda



\### 2.2 Redis untuk Cache



\*\*Alasan ditolak:\*\*



\- Belum perlu (latency < 100ms)

\- Tambah kompleksitas

\- Bisa nanti kalau user > 5.000



\*\*Status:\*\* ⏳ Ditunda



\### 2.3 Kubernetes untuk Server



\*\*Alasan ditolak:\*\*



\- Overkill untuk 2 vCPU

\- Perlu tim DevOps khusus

\- Bisa nanti kalau user > 10.000



\*\*Status:\*\* ⏳ Ditunda



\### 2.4 PgBouncer untuk Connection Pooling



\*\*Alasan ditolak:\*\*



\- Prisma sudah punya connection pool

\- PgBouncer perlu setup terpisah

\- Bisa nanti kalau multiple app server



\*\*Status:\*\* ⏳ Ditunda



\---



\## 3. Keputusan yang Perlu Ditinjau Ulang



\### 3.1 JWT di localStorage



\*\*Risiko:\*\* Rentan XSS.



\*\*Alternatif:\*\* HttpOnly cookie.



\*\*Kapan ditinjau:\*\* Kalau ada security audit.



\### 3.2 Screenshot Guard



\*\*Risiko:\*\* Gak 100% efektif (user bisa pakai kamera HP).



\*\*Alternatif:\*\* Watermark video.



\*\*Kapan ditinjau:\*\* Kalau ada keluhan dari tim konten.



\### 3.3 CORS `origin: true`



\*\*Risiko:\*\* Allow semua origin.



\*\*Alternatif:\*\* Whitelist domain spesifik.



\*\*Kapan ditinjau:\*\* Sebelum production.



\---



\## 4. Referensi



1\. NestJS Documentation. https://docs.nestjs.com/

2\. Prisma Documentation. https://www.prisma.io/docs/

3\. Cloudflare R2 Documentation. https://developers.cloudflare.com/r2/

4\. Supabase Documentation. https://supabase.com/docs/

5\. Node.js UV\_THREADPOOL\_SIZE. https://nodejs.org/api/cli.html

