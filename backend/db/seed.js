import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { pool } from "./pool.js";
dotenv.config();

async function seed() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const adminEmail = (process.env.ADMIN_EMAIL || "admin@cimory.com").toLowerCase();
    const adminPass = process.env.ADMIN_PASSWORD || "admin123!";
    const hash = await bcrypt.hash(adminPass, 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, hash, "Admin Cimory"]
    );

    const demoHash = await bcrypt.hash("demo123", 10);
    await client.query(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1, $2, $3, 'user')
       ON CONFLICT (email) DO NOTHING`,
      ["demo@cimory.com", demoHash, "Demo Sales"]
    );

    const chapters = [
      {
        id: "ch1", no: 1, title: "Serba-Serbi Menjadi Sales Kanzler",
        modules: [
          { id: "ch1-m1",  no: 1,  title: "Dikira Cuma Jualan, Taunya Cuan.", duration: "6 min" },
          { id: "ch1-m2",  no: 2,  title: "Cara PDKT Sama Toko", duration: "8 min" },
          { id: "ch1-m3",  no: 3,  title: "Bikin Produk Menang di Toko", duration: "6 min" },
          { id: "ch1-m4",  no: 4,  title: "Hadapi Penolakan dengan Percaya Diri", duration: "5 min" },
          { id: "ch1-m5",  no: 5,  title: "Hadapi Penolakan dengan Percaya Diri (Lanjutan)", duration: "5 min" },
          { id: "ch1-m6",  no: 6,  title: "Stok habis = Haram", duration: "7 min" },
          { id: "ch1-m7",  no: 7,  title: "Orderan Tepat, Toko Puas, Salesman Senang", duration: "5 min" },
          { id: "ch1-m8",  no: 8,  title: "Kalau bisa lebih, kenapa orderannya cuma segitu?", duration: "7 min" },
          { id: "ch1-m9",  no: 9,  title: "Jangan Cuma Pamit, Bikin Diingat.", duration: "7 min" },
          { id: "ch1-m10", no: 10, title: "Baca Pikiran Toko, Menang di Lapangan", duration: "6 min" }
        ]
      },
      {
        id: "ch2", no: 2, title: "Toko Jadi Teman, Bukan Sekadar Pelanggan",
        modules: [
          { id: "ch2-m1", no: 1, title: "Tampil Cakep,", duration: "7 min" },
          { id: "ch2-m2", no: 2, title: "Salam, Sapa, Senyum", duration: "8 min" },
          { id: "ch2-m3", no: 3, title: "Ngobrol Asik, Hubungan Baik", duration: "6 min" },
          { id: "ch2-m4", no: 4, title: "Bangun Trust, Raih Loyalitas", duration: "7 min" }
        ]
      },
      {
        id: "ch3", no: 3, title: "No Hari Ini, Yes Besok!",
        modules: [
          { id: "ch3-m1", no: 1, title: "Mental Baja Sales Juara", duration: "7 min" },
          { id: "ch3-m2", no: 2, title: "Ubah Tidak menjadi Penjualan", duration: "7 min" },
          { id: "ch3-m3", no: 3, title: "Membangun Kembali Kepercayaan Customer", duration: "7 min" }
        ]
      }
    ];

    for (const ch of chapters) {
      await client.query(
        `INSERT INTO chapters (id, no, title, sort_order) VALUES ($1,$2,$3,$2)
         ON CONFLICT (id) DO NOTHING`,
        [ch.id, ch.no, ch.title]
      );
      for (const m of ch.modules) {
        await client.query(
          `INSERT INTO modules (id, chapter_id, no, title, duration, sort_order)
           VALUES ($1,$2,$3,$4,$5,$3)
           ON CONFLICT (id) DO NOTHING`,
          [m.id, ch.id, m.no, m.title, m.duration]
        );
      }
    }

    const quizzes = [
      {
        chapterId: "ch1",
        title: "Kuis Chapter 1 — Fondasi Sales Kanzler",
        questions: [
          {
            q: "Apa langkah pertama yang paling tepat saat masuk ke toko baru?",
            options: ["Langsung tawarkan promo termahal", "Kenalan & bangun obrolan ringan dulu (PDKT)", "Bongkar semua produk di meja kasir", "Minta orderan besar di menit pertama"],
            answer: 1,
            explain: "PDKT dulu. Toko lebih mudah percaya kalau kamu bangun hubungan sebelum jualan."
          },
          {
            q: "“Stok habis = Haram.” Maksud prinsip ini adalah…",
            options: ["Jangan pernah jualan kalau stok kosong", "Pastikan produk selalu tersedia di rak toko", "Haram menjual stok lama", "Toko wajib beli stok penuh"],
            answer: 1,
            explain: "Produk yang tidak ada di rak = penjualan yang hilang."
          },
          {
            q: "Cara paling ampuh biar produk kita menang di toko?",
            options: ["Sembunyikan produk kompetitor", "Display rapi, posisi strategis, dan menarik mata", "Pasang harga paling mahal", "Taruh di gudang belakang"],
            answer: 1,
            explain: "Display yang menarik & posisi eye-level bikin produk lebih cepat dilirik."
          },
          {
            q: "Saat closing kunjungan, hal yang bikin kamu diingat toko adalah…",
            options: ["Pergi diam-diam tanpa pamit", "Pamit sopan + tinggalkan kesan & komitmen tindak lanjut", "Janji promo yang tidak mungkin ditepati", "Buru-buru ke toko berikutnya"],
            answer: 1,
            explain: "Closing yang berkesan bikin kunjungan berikutnya lebih hangat."
          }
        ]
      },
      {
        chapterId: "ch2",
        title: "Kuis Chapter 2 — Toko Jadi Teman",
        questions: [
          { q: "Rumus interaksi awal yang bikin toko nyaman?", options: ["Salam, Sapa, Senyum", "Diam, Datar, Dingin", "Desak, Debat, Diskon", "Duduk, Diam, Dengar"], answer: 0, explain: "Salam, Sapa, Senyum — tiga hal sederhana yang mencairkan suasana." },
          { q: "“Bangun Trust, Raih Loyalitas” paling tepat dicapai lewat…", options: ["Sekali jualan besar lalu hilang", "Konsistensi, tepat janji, dan bantu selesaikan masalah toko", "Kasih hadiah setiap kunjungan", "Rajin menelepon di malam hari"], answer: 1, explain: "Trust dibangun dari konsistensi dan keandalan." },
          { q: "“Tampil cakep” saat kunjungan penting karena…", options: ["Biar difoto pelanggan", "Penampilan rapi = kesan profesional & dipercaya", "Supaya dapat diskon baju", "Tidak penting sama sekali"], answer: 1, explain: "First impression itu nyata." }
        ]
      },
      {
        chapterId: "ch3",
        title: "Kuis Chapter 3 — No Hari Ini, Yes Besok!",
        questions: [
          { q: "Saat toko bilang “Tidak”, mindset sales juara adalah…", options: ["Menyerah dan pindah toko", "“Belum” bukan “tidak selamanya” — follow up di waktu tepat", "Memaksa sampai toko kesal", "Menjelekkan kompetitor"], answer: 1, explain: "Penolakan sering soal timing." },
          { q: "Cara mengubah “Tidak” menjadi penjualan?", options: ["Cari tahu alasan penolakan lalu tawarkan solusi", "Diamkan toko selama sebulan", "Turunkan harga sampai rugi", "Ganti toko target"], answer: 0, explain: "Gali objection-nya." },
          { q: "Kunci membangun kembali kepercayaan customer yang kecewa?", options: ["Pura-pura tidak terjadi apa-apa", "Akui, minta maaf, perbaiki, dan buktikan lewat tindakan", "Salahkan pihak lain", "Berhenti mengunjungi toko itu"], answer: 1, explain: "Recovery yang tulus + tindakan nyata." }
        ]
      }
    ];

    for (const qz of quizzes) {
      const exists = await client.query("SELECT id FROM quizzes WHERE chapter_id = $1", [qz.chapterId]);
      let quizId;
      if (exists.rowCount === 0) {
        const r = await client.query(
          `INSERT INTO quizzes (chapter_id, title, min_score_pct, time_limit_sec)
           VALUES ($1,$2,60,300) RETURNING id`,
          [qz.chapterId, qz.title]
        );
        quizId = r.rows[0].id;
      } else {
        quizId = exists.rows[0].id;
      }
      const cnt = await client.query("SELECT COUNT(*)::int AS c FROM quiz_questions WHERE quiz_id=$1", [quizId]);
      if (cnt.rows[0].c === 0) {
        let i = 0;
        for (const q of qz.questions) {
          await client.query(
            `INSERT INTO quiz_questions (quiz_id, q, options_json, answer_idx, explain, sort_order)
             VALUES ($1,$2,$3::jsonb,$4,$5,$6)`,
            [quizId, q.q, JSON.stringify(q.options), q.answer, q.explain, i++]
          );
        }
      }
    }

    const flashcards = [
      { id: "fc1", emoji: "🌭", front: "Tahukah Kamu? Kanzler Bukan Nama Biasa! 👑", back: ["Kanzler berasal dari bahasa Jerman yang berarti \"Kanselir\" atau pemimpin negara.", "Nama ini dipilih untuk merepresentasikan kualitas premium dan standar tinggi."] },
      { id: "fc2", emoji: "🌭", front: "Kanzler Terinspirasi dari Negeri Sosis 🇩🇪", back: ["Kanzler membawa inspirasi dari cita rasa sosis khas Jerman ke Indonesia.", "Sejak awal hadir, Kanzler ingin memberikan pengalaman menikmati produk daging olahan premium."] },
      { id: "fc3", emoji: "🌭", front: "Siapa di Balik Kanzler? 🏭", back: ["Kanzler merupakan brand dari PT Macroprima Panganutama, bagian dari Cimory Group.", "Fokusnya menghadirkan produk olahan protein berkualitas untuk keluarga Indonesia."] }
    ];
    let fi = 0;
    for (const f of flashcards) {
      await client.query(
        `INSERT INTO flashcards (id, emoji, front, back_json, sort_order)
         VALUES ($1,$2,$3,$4::jsonb,$5) ON CONFLICT (id) DO NOTHING`,
        [f.id, f.emoji, f.front, JSON.stringify(f.back), fi++]
      );
    }

    const badges = [
      { id: "first-step",    emoji: "🎯", title: "Langkah Pertama",   descr: "Selesaikan modul pertamamu",       type: "modules",     threshold: 1 },
      { id: "on-fire",       emoji: "🔥", title: "On Fire",           descr: "Jaga streak belajar 3 hari",       type: "streak",      threshold: 3 },
      { id: "chapter-champ", emoji: "🏆", title: "Chapter Champion",  descr: "Tuntaskan satu chapter penuh",     type: "chapter",     threshold: 1 },
      { id: "quiz-whiz",     emoji: "🧠", title: "Quiz Whiz",         descr: "Dapat nilai sempurna di satu kuis", type: "perfectQuiz", threshold: 1 },
      { id: "fun-collector", emoji: "🃏", title: "Kolektor Fun Fact", descr: "Buka semua kartu Fun Fact",        type: "flashcards",  threshold: 3 },
      { id: "graduate",      emoji: "🎓", title: "Lulus Academy",     descr: "Selesaikan semua modul di Academy", type: "allModules",  threshold: 1 }
    ];
    for (const b of badges) {
      await client.query(
        `INSERT INTO badges (id, emoji, title, descr, type, threshold)
         VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (id) DO NOTHING`,
        [b.id, b.emoji, b.title, b.descr, b.type, b.threshold]
      );
    }

    await client.query("COMMIT");
    console.log("✅ Seed selesai");
    console.log(`   Admin  : ${adminEmail} / ${adminPass}`);
    console.log("   User   : demo@cimory.com / demo123");
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("❌ Seed gagal:", e.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

seed();