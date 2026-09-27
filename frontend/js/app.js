(() => {
  const M = UI.IMG;
  const root = document.getElementById("app");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const go = (p) => { location.hash = p; };
  const firstName = () => (Store.user()?.name || "Sales").split(" ")[0];
  const isAdmin = () => Store.user()?.role === "admin";

  function asArray(x) {
    if (Array.isArray(x)) return x;
    if (x && Array.isArray(x.rows)) return x.rows;
    if (x && Array.isArray(x.data)) return x.data;
    if (x && Array.isArray(x.items)) return x.items;
    return [];
  }

  function fmtDuration(sec) {
    if (!sec && sec !== 0) return "-";
    if (sec < 1) return "-";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function fmtMonthName(monthKey) {
    if (!monthKey) return "";
    const [y, m] = monthKey.split("-").map(Number);
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni",
                   "Juli","Agustus","September","Oktober","November","Desember"];
    return `${bulan[m - 1]} ${y}`;
  }

  function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  const WatchState = (() => {
    const lsKey = (moduleId) => "csa_watched_" + moduleId;
    const lsPos = (moduleId) => "csa_vidpos_" + moduleId;

    function isWatched(moduleId) {
      return localStorage.getItem(lsKey(moduleId)) === "1";
    }
    function setWatched(moduleId) {
      try { localStorage.setItem(lsKey(moduleId), "1"); } catch {}
    }
    function getPos(moduleId) {
      return parseFloat(localStorage.getItem(lsPos(moduleId)) || "0");
    }
    function setPos(moduleId, t) {
      try { localStorage.setItem(lsPos(moduleId), String(t)); } catch {}
    }
    return { isWatched, setWatched, getPos, setPos };
  })();

  let myReports = [];

  function shell(active, inner) {
    const o = Store.overall();
    const u = Store.user();
    const mq = Store.monthlyQuiz ? Store.monthlyQuiz() : { current: null, archive: [] };
    const hasActiveMQ = !!(mq.current && !mq.current.myAttempt);

    const nav = [
      ["dashboard",    "home",  "Dashboard",       "#/dashboard"],
      ["learn",        "learn", "Belajar",         "#/learn"],
      ["quiz",         "quiz",  "Kuis",            "#/quiz"],
      ["monthly-quiz", "quiz",  "Quiz Bulanan",    "#/monthly-quiz", hasActiveMQ],
      ["leaderboard",  "badge", "Papan Peringkat", "#/leaderboard"],
      ["funfact",      "fun",   "Fun Fact",        "#/funfact"],
      ["badges",       "badge", "Badge",           "#/badges"],
      ...(myReports.length ? [["reports", "chart", "Reports", "#/reports"]] : [])
    ].map(([id, ic, label, href, badge]) =>
      `<a class="nav-item ${active === id ? "active" : ""}" href="${href}">
         ${UI.icon(ic)}<span>${label}</span>
         ${badge ? '<span class="nav-dot"></span>' : ""}
       </a>`
    ).join("");

    return `
    <div class="shell">
      <aside class="sidebar" id="sidebar">
        <div class="brand">
          <img src="${M.logo}" alt="Cimory" onerror="this.style.display='none'">
          <div class="b-name">Sales Academy<small>CIMORY GROUP</small></div>
        </div>
        <div class="nav-label">MENU</div>
        <div class="nav-scroll">
          ${nav}
        </div>
        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="ava">${UI.initials(u.name)}</div>
            <div style="min-width:0">
              <div class="u-name">${UI.esc(u.name)}</div>
              <div class="u-mail">${UI.esc(u.email)}</div>
            </div>
          </div>
          <a class="nav-item" href="#" id="logoutBtn" style="margin-top:6px">${UI.icon("logout")}<span>Keluar</span></a>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <div class="menu-toggle" id="menuToggle">${UI.icon("menu", 20)}</div>
          <div class="greet">
            <h1>${greeting()}, ${UI.esc(firstName())} 👋</h1>
            <p>${subline(o)}</p>
          </div>
          <div class="chip flame"><span class="em">🔥</span>${o.streak}<span class="lbl-txt">&nbsp;hari</span></div>
          <div class="chip gold"><span class="em">⭐</span>${o.xp}<span class="lbl-txt">&nbsp;XP</span></div>
        </header>
        <div class="content">${inner}</div>
      </main>
    </div>`;
  }

  const greeting = () => {
    const h = new Date().getHours();
    return h < 11 ? "Selamat pagi" : h < 15 ? "Selamat siang" : h < 19 ? "Selamat sore" : "Selamat malam";
  };
  const subline = (o) =>
    o.done === 0 ? "Yuk mulai modul pertamamu hari ini!"
    : o.pct === 100 ? "Mantap! Semua modul sudah kamu taklukkan 🏆"
    : `Kamu sudah menyelesaikan ${o.done} dari ${o.total} modul. Lanjut, ya!`;

  function bindShell() {
    $("#logoutBtn")?.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("csa_popup_shown");
      Auth.signOut();
      location.hash = "";
      location.reload();
    });
    const sb = $("#sidebar"), mt = $("#menuToggle");
    mt?.addEventListener("click", () => sb.classList.toggle("open"));
    $$(".nav-item").forEach((n) => n.addEventListener("click", () => sb?.classList.remove("open")));

    const activeNav = $(".nav-item.active");
    if (activeNav) {
      activeNav.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    $$("[data-mq-dismiss]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const mqId = btn.dataset.mqDismiss;
        localStorage.setItem("csa_mq_dismissed_" + mqId, "1");
        const banner = btn.closest(".mq-banner");
        if (banner) {
          banner.style.transition = "opacity .25s, transform .25s";
          banner.style.opacity = "0";
          banner.style.transform = "translateY(-8px)";
          setTimeout(() => banner.remove(), 250);
        }
      });
    });
  }

  function viewDashboard() {
    const o = Store.overall();
    const cont = Store.continueModule();
    const contCh = cont ? Store.chapters().find((c) => c.id === cont.chapterId) : null;
    const lb = Store.leaderboard();
    const mq = Store.monthlyQuiz();

    let mqBanner = "";
    const mqDismissKey = "csa_mq_dismissed_" + (mq.current ? mq.current.id : "");
    const mqDismissed = localStorage.getItem(mqDismissKey) === "1";

    if (mq.current && !mq.current.myAttempt && mq.current.isActive) {
      mqBanner = `
        <a href="#/monthly-quiz/${mq.current.id}" class="mq-banner">
          <div class="mq-banner-icon">📅</div>
          <div class="mq-banner-info">
            <div class="mq-banner-title">${UI.esc(mq.current.title)}</div>
            <div class="mq-banner-sub">
              ${mq.current.totalQuestions || (mq.current.questions ? mq.current.questions.length : 0)} soal •
              ${Math.round(mq.current.timeLimitSec / 60)} menit •
              Cuma bisa dikerjakan <b>1×</b>
            </div>
          </div>
          <div class="mq-banner-cta">Mulai →</div>
        </a>`;
    } else if (mq.current && mq.current.myAttempt && !mqDismissed) {
      mqBanner = `
        <div class="mq-banner done" style="cursor:default" data-mq-banner-id="${mq.current.id}">
          <button class="mq-banner-close" data-mq-dismiss="${mq.current.id}" title="Tutup">✕</button>
          <div class="mq-banner-icon">✅</div>
          <div class="mq-banner-info">
            <div class="mq-banner-title">${UI.esc(mq.current.title)} — Selesai</div>
            <div class="mq-banner-sub">
              Skor kamu: ${mq.current.myAttempt.correct}/${mq.current.myAttempt.total}
              ${mq.current.myAttempt.passed ? "• Lulus ✅" : "• Belum lulus"}
            </div>
          </div>
          <a href="#/monthly-quiz/${mq.current.id}" class="mq-banner-cta">Lihat →</a>
        </div>`;
    }

    const hero = `
      <section class="hero">
        <img class="hero-mascot" src="${M.happy}" alt="" onerror="this.style.display='none'">
        <div class="eyebrow">${o.done === 0 ? "MULAI PERJALANANMU" : "LANJUTKAN BELAJAR"}</div>
        <h2>${cont ? UI.esc(cont.title) : "Sales Academy"}</h2>
        <p>${cont ? UI.esc(contCh ? contCh.title : "") : "Belajar jadi sales juara ala Cimory & Kanzler."}</p>
        <div class="hero-actions">
          <button class="btn btn-red btn-lg" data-go="#/learn/${cont ? cont.id : ""}">
            ${UI.icon("play", 18)} ${o.done === 0 ? "Mulai Belajar" : "Lanjutkan"}
          </button>
          <button class="btn btn-ghost btn-lg" data-go="#/learn">Lihat semua chapter</button>
        </div>
        <div class="mini-prog">
          <div class="plabel"><span>Progress keseluruhan</span><span>${o.pct}%</span></div>
          <div class="bar"><i style="width:${o.pct}%"></i></div>
        </div>
      </section>`;

    const stats = `
      <div class="stats">
        <div class="stat">${UI.ring(o.pct)}<div><div class="big">${o.done}/${o.total}</div><div class="lbl">Modul selesai</div></div></div>
        <div class="stat"><div class="icn gold">⭐</div><div><div class="big">${o.xp}</div><div class="lbl">Total XP</div></div></div>
        <div class="stat"><div class="icn flame">🔥</div><div><div class="big">${o.streak}</div><div class="lbl">Hari beruntun</div></div></div>
        <div class="stat"><div class="icn red">🏅</div><div><div class="big">${o.badges}/${o.badgeTotal}</div><div class="lbl">Badge diraih</div></div></div>
      </div>`;

    const lbProgress = asArray(lb.progress).slice(0, 5).map((u, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
      return `<div class="lb-row">
        <div class="lb-rank">${medal}</div>
        <div class="lb-info">
          <div class="lb-name">${UI.esc(u.name)}</div>
          <div class="lb-sub">🧠 ${u.chapters_played} chapter • ${fmtDuration(u.total_duration)}</div>
        </div>
        <div class="lb-score">${u.total_score} poin</div>
      </div>`;
    }).join("") || `
      <div class="lb-empty-mini">
        <div class="em">🚀</div>
        <p>Belum ada aktivitas.<br>Jadilah yang pertama!</p>
      </div>`;

    const lbMonthly = asArray(lb.monthly).slice(0, 5).map((u, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
      return `<div class="lb-row">
        <div class="lb-rank">${medal}</div>
        <div class="lb-info">
          <div class="lb-name">${UI.esc(u.name)}</div>
          <div class="lb-sub">${u.correct}/${u.total} • ${fmtDuration(u.duration_sec)}</div>
        </div>
        <div class="lb-score">🧠 ${u.correct}</div>
      </div>`;
    }).join("") || `
      <div class="lb-empty-mini">
        <div class="em">🎯</div>
        <p>Belum ada yang kerjakan<br>quiz bulan ini.</p>
      </div>`;

    const leaderboards = `
      <div class="dashboard-leaderboards">
        <div class="lb-card">
          <div class="lb-head">
            <h3>🏆 Top Trainee ${fmtMonthName(currentMonthKey())}</h3>
            <a href="#/leaderboard" class="lb-more">Lihat semua →</a>
          </div>
          <div class="lb-list">${lbProgress}</div>
        </div>
        <div class="lb-card">
          <div class="lb-head">
            <h3>🧠 Quiz Bulan Ini</h3>
            <a href="#/leaderboard?tab=monthly" class="lb-more">Lihat semua →</a>
          </div>
          <div class="lb-list">${lbMonthly}</div>
        </div>
      </div>`;

    const rows = Store.chapters().map((ch, i) => {
      const chapterUnlocked = Store.isChapterUnlocked(ch.id);
      const cards = ch.modules.map((m) => moduleCard(m, i, chapterUnlocked)).join("");
      const cp = Store.chapterProgress(ch);
      return `<div class="section-head">
        <h3>${UI.esc(ch.title)}</h3>
        <span class="sub">${cp.done}/${cp.total} modul • ${cp.pct}%</span>
      </div>
      <div class="row-track">${cards}</div>`;
    }).join("");

    return mqBanner + hero + stats + leaderboards + rows;
  }

  function moduleCard(m, chIndex, chapterUnlocked = true) {
    const done = Store.isDone(m.id);
    const unlocked = chapterUnlocked && Store.isModuleUnlocked(m.id);
    const locked = !unlocked;
    const dur = m.durationSec ? fmtDuration(m.durationSec) + " min" : (m.duration || "-");

    if (locked) {
      return `<article class="card locked" title="Selesaikan modul sebelumnya dulu">
        <div class="poster locked-poster">
          <span class="ptag">CHAPTER ${chIndex + 1} • MODUL ${m.no}</span>
          <span class="pnum">${String(m.no).padStart(2, "0")}</span>
          <div class="lock-overlay">🔒</div>
        </div>
        <div class="cbody">
          <div class="ctitle">${UI.esc(m.title)}</div>
          <div class="cmeta">${UI.icon("clock", 14)} ${dur}<span class="dot"></span>Terkunci</div>
        </div>
      </article>`;
    }

    return `<article class="card" data-go="#/learn/${m.id}">
      <div class="poster" style="background:${UI.grad(chIndex)}">
        <span class="ptag">CHAPTER ${chIndex + 1} • MODUL ${m.no}</span>
        <span class="pnum">${String(m.no).padStart(2, "0")}</span>
        ${done ? `<span class="done-badge">${UI.icon("check", 13)} Selesai</span>` : ""}
        <div class="pplay">${UI.icon("play", 18)}</div>
      </div>
      <div class="cbody">
        <div class="ctitle">${UI.esc(m.title)}</div>
        <div class="cmeta">${UI.icon("clock", 14)} ${dur}<span class="dot"></span>${done ? "Tuntas" : "Belum"}</div>
      </div>
    </article>`;
  }

  function viewLeaderboardPage(tab = "progress") {
    const lb = Store.leaderboard();
    const me = Store.user();
    const progressArr = asArray(lb.progress);
    const winners = asArray(lb.winners);
    const monthlyArr = asArray(lb.monthly);

    const monthLabel = lb.progressMeta?.monthLabel || fmtMonthName(currentMonthKey());
    const winnersLabel = lb.progressMeta?.monthLabel || "";

    const hasProgress = progressArr.length > 0;
    const hasMonthly = monthlyArr.length > 0;

    const top3 = progressArr.slice(0, 3);
    const podiumOrder = [top3[1], top3[0], top3[2]];

    const podiumHtml = top3.length > 0 ? `
      <div class="podium">
        ${podiumOrder.map((u) => {
          if (!u) return `<div></div>`;
          const rank = u.rank;
          const isMe = me && me.id === u.id;
          const medalEmoji = rank === 1 ? "🥇" : rank === 2 ? "🥈" : "🥉";
          return `<div class="podium-item rank-${rank}">
            ${isMe ? '<div class="p-you">KAMU</div>' : ""}
            <div class="p-medal">${medalEmoji}</div>
            <div class="p-ava">${UI.initials(u.name)}</div>
            <div class="p-name" title="${UI.esc(u.name)}">${UI.esc(u.name)}</div>
            <div class="p-points">${u.total_score}<small>poin</small></div>
            ${u.prizeText ? `<div class="p-prize">${u.prizeEmoji || "🎁"} ${UI.esc(u.prizeText)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>` : "";

    const p = progressArr.map((u) => {
      const medal = u.rank === 1 ? "🥇" : u.rank === 2 ? "🥈" : u.rank === 3 ? "🥉" : u.rank;
      const isMe = me && me.id === u.id;
      const dur = Math.round(u.total_duration / 60);
      const chapters = u.chapters_played || 0;
      const streak = u.streak || 0;
      const xp = u.xp || 0;

      let prizeText = "";
      let prizeEmoji = "🎁";
      const prizes = asArray(lb.prizes);
      const myPrize = prizes.find((pz) => pz.rank === u.rank);
      if (myPrize) {
        prizeText = myPrize.prize || myPrize.title || "";
        prizeEmoji = myPrize.emoji || "🎁";
      }

      return `<tr class="${isMe ? "row-me" : ""}">
        <td style="width:60px;font-family:var(--font-d);font-weight:600;font-size:18px">${medal}</td>
        <td>
          <strong>${UI.esc(u.name)}</strong>
          ${isMe ? '<span class="tag-me">Kamu</span>' : ""}
          <div style="color:var(--muted);font-size:12px;margin-top:3px">
            ${UI.esc(u.email || "")}
          </div>
        </td>
        <td>
          <span style="font-weight:700">🧠 ${chapters}</span>
          <div style="color:var(--muted);font-size:11.5px;margin-top:2px">chapter</div>
        </td>
        <td>
          <span style="font-weight:700">🔥 ${streak}</span>
          <div style="color:var(--muted);font-size:11.5px;margin-top:2px">hari</div>
        </td>
        <td>
          <span style="font-weight:700">⭐ ${xp}</span>
          <div style="color:var(--muted);font-size:11.5px;margin-top:2px">XP</div>
        </td>
        <td style="font-family:var(--font-d);font-weight:600;color:var(--gold);font-size:16px">
          ${u.total_score}
        </td>
        <td>${dur} mnt</td>
        <td>${prizeText ? `${prizeEmoji} ${UI.esc(prizeText)}` : "-"}</td>
      </tr>`;
    }).join("");

    const m = monthlyArr.map((u, i) => {
      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (i + 1);
      const isMe = me && me.id === u.id;
      return `<tr class="${isMe ? "row-me" : ""}">
        <td style="width:60px;font-family:var(--font-d);font-weight:600;font-size:18px">${medal}</td>
        <td><strong>${UI.esc(u.name)}</strong>${isMe ? '<span class="tag-me">Kamu</span>' : ""}</td>
        <td>${u.correct}/${u.total}</td>
        <td>${fmtDuration(u.duration_sec)}</td>
        <td>${u.passed ? "✅" : "❌"}</td>
      </tr>`;
    }).join("");

    const emptyProgress = `
      <div class="lb-empty-state">
        <div class="em">🚀</div>
        <h3>Belum ada aktivitas di bulan ${monthLabel}</h3>
        <p>Selesaikan kuis chapter untuk muncul di papan peringkat!</p>
        <button class="btn btn-red" data-go="#/learn">Mulai Belajar →</button>
      </div>`;

    const emptyMonthly = `
      <div class="lb-empty-state">
        <div class="em">🎯</div>
        <h3>Belum ada yang kerjakan quiz bulan ini</h3>
        <button class="btn btn-red" data-go="#/monthly-quiz">Lihat Quiz Bulanan →</button>
      </div>`;

    const prevWinnersHtml = winners.length > 0 ? `
      <div class="admin-card" style="border-color:var(--gold)">
        <h2>🏆 Pemenang ${winnersLabel}</h2>
        <div class="sub">Selamat untuk para juara bulan ini!</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${winners.map((w) => `
            <div class="winner-row ${w.user_id === me.id ? 'me' : ''}">
              <div class="wr-medal">${w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}</div>
              <div class="wr-info">
                <div class="wr-name">${UI.esc(w.name)}</div>
                <div class="wr-points">${w.total_score} poin • ${Math.round(w.total_duration / 60)} mnt</div>
              </div>
              ${w.prize_desc ? `<div class="wr-prize">${w.prize_emoji || "🎁"} ${UI.esc(w.prize_desc)}</div>` : ""}
            </div>`).join("")}
        </div>
      </div>` : "";

    const legendHtml = `
      <div class="lb-legend">
      </div>`;

    return `
      <div class="section-head">
        <h3>Papan Peringkat</h3>
        <span class="sub">Top Trainee per bulan — ranking reset tiap awal bulan</span>
      </div>

      <div class="tabs">
        <div class="tab ${tab === "progress" ? "active" : ""}" data-tab="progress">
          🏆 Top Trainee ${monthLabel}
          ${hasProgress ? `<span class="tab-count">${progressArr.length}</span>` : ""}
        </div>
        <div class="tab ${tab === "monthly" ? "active" : ""}" data-tab="monthly">
          🧠 Quiz Bulanan
          ${hasMonthly ? `<span class="tab-count">${monthlyArr.length}</span>` : ""}
        </div>
      </div>

      ${tab === "progress" ? `
        ${prevWinnersHtml}
        ${podiumHtml}
        <div class="admin-card">
          <h2>Klasemen ${monthLabel}</h2>
          <div class="sub">Ranking berdasarkan skor kuis chapter bulan ini. Tie-breaker: waktu tercepat.</div>
          ${legendHtml}
          ${hasProgress
            ? `<div style="overflow-x:auto">
                 <table class="data-table">
                   <thead><tr>
                     <th>#</th>
                     <th>Nama</th>
                     <th>Chapter</th>
                     <th>Streak</th>
                     <th>XP</th>
                     <th>Poin</th>
                     <th>Waktu</th>
                     <th>Hadiah</th>
                   </tr></thead>
                   <tbody>${p}</tbody>
                 </table>
               </div>`
            : emptyProgress}
        </div>
      ` : `
        <div class="admin-card">
          <h2>Leaderboard Quiz Bulanan</h2>
          <div class="sub">Skor tertinggi dari kuis bulanan</div>
          ${hasMonthly
            ? `<table class="data-table">
                 <thead><tr><th>#</th><th>Nama</th><th>Skor</th><th>Waktu</th><th>Status</th></tr></thead>
                 <tbody>${m}</tbody>
               </table>`
            : emptyMonthly}
        </div>
      `}`;
  }

  function bindLeaderboardPage() {
    $$(".tab").forEach((el) => {
      el.addEventListener("click", () => {
        const tab = el.dataset.tab;
        location.hash = "/leaderboard" + (tab === "monthly" ? "?tab=monthly" : "");
      });
    });
  }

  function viewLearn() {
    return Store.chapters().map((ch, i) => {
      const cp = Store.chapterProgress(ch);
      const modules = ch.modules;
      const chapterUnlocked = Store.isChapterUnlocked(ch.id);

      const unlockedMap = modules.map((m, idx) => {
        if (!chapterUnlocked) return false;
        if (idx === 0) return true;
        return Store.isDone(modules[idx - 1].id);
      });

      const mods = modules.map((m, idx) => {
        const done = Store.isDone(m.id);
        const unlocked = unlockedMap[idx];
        const cls = !unlocked ? "locked" : (done ? "done" : "");
        const clickAttr = unlocked ? `data-go="#/learn/${m.id}"` : "";
        const icon = done ? UI.icon("check", 15) : (!unlocked ? "🔒" : m.no);
        const dur = m.durationSec ? fmtDuration(m.durationSec) : (m.duration || "");
        return `<div class="mod-row ${cls}" ${clickAttr}>
          <div class="mstate">${icon}</div>
          <div class="mtitle">${UI.esc(m.title)}</div>
          <div class="mdur">${unlocked ? (dur ? dur + " min" : "") : "Terkunci"}</div>
          <div class="go">${unlocked ? UI.icon("arrow", 18) : ""}</div>
        </div>`;
      }).join("");

      const quizUnlocked = cp.pct === 100 && chapterUnlocked;
      const lockedChapterBadge = !chapterUnlocked
        ? `<div class="chapter-locked-note">🔒 Selesaikan chapter sebelumnya dulu</div>` : "";

      return `<section class="chapter-card">
        <div class="ch-head">
          <div class="ch-no">${i + 1}</div>
          <div style="flex:1">
            <h3>${UI.esc(ch.title)}</h3>
            <div class="csub">${cp.done}/${cp.total} modul selesai • ${cp.pct}%</div>
            <div class="pbar" style="margin-top:10px;max-width:320px"><i style="width:${cp.pct}%"></i></div>
            ${lockedChapterBadge}
          </div>
          <button class="btn ${quizUnlocked ? "btn-green" : "btn-ghost"}" ${quizUnlocked ? `data-go="#/quiz/${ch.id}"` : "disabled"}>
            ${quizUnlocked ? "Kerjakan Kuis" : "🔒 Kuis Terkunci"}
          </button>
        </div>
        <div class="mod-list">${mods}</div>
      </section>`;
    }).join("");
  }

  function viewModule(id) {
    const m = Store.findModule(id);
    if (!m) return empty("🔍", "Modul tidak ditemukan", "Kembali ke daftar belajar.", "#/learn", "Ke Belajar");

    const ch = Store.chapters().find((c) => c.id === m.chapterId);
    const idx = ch.modules.findIndex((x) => x.id === m.id);
    if (idx > 0) {
      const prev = ch.modules[idx - 1];
      if (!Store.isDone(prev.id)) {
        return empty("🔒", "Modul terkunci",
          `Selesaikan dulu "${prev.title}" sebelum buka modul ini.`,
          "#/learn", "Ke Belajar");
      }
    }

    const prev = ch.modules[idx - 1];
    const next = ch.modules[idx + 1];
    const nextUnlocked = Store.isDone(m.id);
    const done = Store.isDone(m.id);
    const video = m.video || "";
    const alreadyWatched = WatchState.isWatched(id);
    const canComplete = !video || alreadyWatched || done;
    const dur = m.durationSec ? fmtDuration(m.durationSec) : (m.duration || "-");

    const videoBlock = video
      ? `<video id="moduleVideo" controls preload="metadata"
             style="width:100%;height:100%;background:#000"
             oncontextmenu="return false"
             controlslist="nodownload noplaybackrate noremoteplayback"
             disablepictureinpicture
             playsinline>
           <source src="${video}" type="video/mp4">
         </video>

         <div class="video-guard-overlay" id="videoGuard">
           <div class="vg-box">
             <div class="vg-icon">⏸️</div>
             <h3 class="vg-title">Video Dijeda Otomatis</h3>
             <p class="vg-sub">Kami mendeteksi perpindahan fokus dari halaman ini.<br>
               Aktivitas ini <b>tercatat oleh sistem</b>.</p>
             <div class="vg-reason" id="vgReason">Perpindahan fokus terdeteksi</div>
             <div>
               <button class="vg-resume-btn" id="vgResume">
                 ${UI.icon("play", 18)} Lanjutkan Menonton
               </button>
             </div>
           </div>
         </div>`
      : `<div class="poster-play" id="posterPlay">
           <div class="pbtn">${UI.icon("play", 30)}</div>
           <div class="ptext">Video belum tersedia</div>
           <img class="vmascot" src="${M.happy}" alt="" onerror="this.style.display='none'">
         </div>`;

    const completeBtn = video
      ? (done
          ? `<button class="btn btn-ghost btn-lg" disabled>✓ Sudah selesai</button>`
          : (canComplete
              ? `<button class="btn btn-green btn-lg" id="completeBtn">${UI.icon("check", 18)} Tandai selesai</button>`
              : `<button class="btn btn-ghost btn-lg" id="completeBtn" disabled title="Tonton video sampai habis dulu">⏳ Tonton video sampai habis</button>`))
      : (done
          ? `<button class="btn btn-ghost btn-lg" disabled>✓ Sudah selesai</button>`
          : `<button class="btn btn-green btn-lg" id="completeBtn">${UI.icon("check", 18)} Tandai selesai</button>`);

    return `<div class="player-wrap">
      <button class="btn-back" id="backBtn">
        ${UI.icon("arrowLeft", 16)} Kembali ke Daftar Belajar
      </button>
      <div class="crumb">
        <a href="#/learn">Belajar</a> ${UI.icon("arrow", 14)}
        <a href="#/learn">${UI.esc(ch.title)}</a> ${UI.icon("arrow", 14)}
        <span>Modul ${m.no}</span>
      </div>
      <div class="video" id="video" style="position:relative">${videoBlock}</div>
      <h1 class="player-title">${UI.esc(m.title)}</h1>
      <div class="player-meta">
        ${UI.icon("clock", 15)} ${dur}
        <span>•</span> Chapter ${ch.no}: ${UI.esc(ch.title)}
        ${done ? '<span>•</span> <span style="color:var(--green)">✓ Selesai</span>' : ""}
      </div>
      ${m.summary
        ? `<div class="callout">${UI.esc(m.summary)}</div>`
        : `<div class="callout"><b>Tips:</b> Tonton video sampai habis, lalu tandai selesai untuk dapat <b>+50 XP</b>.</div>`}
      <div class="player-actions">
        ${completeBtn}
        ${prev
          ? `<button class="btn btn-ghost btn-lg" data-go="#/learn/${prev.id}">${UI.icon("arrowLeft", 18)} Modul Sebelumnya</button>`
          : ""}
        ${next
          ? (nextUnlocked
              ? `<button class="btn btn-ghost btn-lg" data-go="#/learn/${next.id}">Modul berikutnya ${UI.icon("arrow", 18)}</button>`
              : `<button class="btn btn-ghost btn-lg" disabled>🔒 Modul berikutnya</button>`)
          : (Store.chapterProgress(ch).pct === 100
              ? `<button class="btn btn-red btn-lg" data-go="#/quiz/${ch.id}">Kerjakan Kuis Chapter ${UI.icon("arrow", 18)}</button>`
              : `<button class="btn btn-ghost btn-lg" disabled>🔒 Kuis Terkunci</button>`)}
      </div>
    </div>`;
  }

  function showVideoGuard(reason = "Perpindahan fokus terdeteksi") {
    const v = document.getElementById("moduleVideo");
    const g = document.getElementById("videoGuard");
    const r = document.getElementById("vgReason");
    if (!v || !g) return;
    if (!v.paused) v.pause();
    if (r) r.textContent = reason;
    g.classList.add("show");
  }

  function hideVideoGuard() {
    const g = document.getElementById("videoGuard");
    if (g) g.classList.remove("show");
  }

  function bindVideoGuard() {
    const v = document.getElementById("moduleVideo");
    if (!v) return;

    const resumeBtn = document.getElementById("vgResume");
    resumeBtn?.addEventListener("click", () => {
      hideVideoGuard();
      v.play().catch(() => {});
    });

    const onBlur = () => { if (!v.paused) showVideoGuard("Perpindahan fokus dari halaman"); };
    window.addEventListener("blur", onBlur);

    const onVis = () => { if (document.hidden && !v.paused) showVideoGuard("Berpindah tab / minimize"); };
    document.addEventListener("visibilitychange", onVis);

    v._guardCleanup = () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVis);
    };
  }

  function cleanupVideoGuard() {
    const v = document.getElementById("moduleVideo");
    if (v && v._guardCleanup) v._guardCleanup();
  }

  function bindModule(id) {
    const m = Store.findModule(id);
    if (!m) return;

    cleanupVideoGuard();

    $("#backBtn")?.addEventListener("click", () => go("/learn"));

    const v = $("#moduleVideo");
    const alreadyDone = Store.isDone(id);

    if (v) {
      const allowFree = WatchState.isWatched(id);
      let maxWatched = WatchState.getPos(id);
      let durationSent = false;

      const sendDuration = async () => {
        if (durationSent) return;
        if (!v.duration || !isFinite(v.duration) || v.duration < 1) return;
        durationSent = true;
        try { await Store.updateModuleDuration(id, Math.round(v.duration)); } catch {}
      };

      v.addEventListener("loadedmetadata", () => {
        if (allowFree && maxWatched > 0) {
          try { v.currentTime = maxWatched; } catch {}
        }
        sendDuration();
      });

      v.addEventListener("durationchange", sendDuration);

      v.playbackRate = 1;
      v.addEventListener("ratechange", () => { if (!allowFree) v.playbackRate = 1; });

      v.addEventListener("timeupdate", () => {
        if (v.seeking) return;
        if (v.currentTime > maxWatched) {
          maxWatched = v.currentTime;
          if (!allowFree) WatchState.setPos(id, maxWatched);
        }
      });

      v.addEventListener("seeking", () => {
        if (allowFree) return;
        if (v.currentTime > maxWatched + 2) v.currentTime = maxWatched;
      });

      v.addEventListener("ended", () => {
        WatchState.setWatched(id);
        maxWatched = v.duration;
        WatchState.setPos(id, maxWatched);

        const btn = document.getElementById("completeBtn");
        if (btn && !alreadyDone) {
          btn.disabled = false;
          btn.classList.remove("btn-ghost");
          btn.classList.add("btn-green");
          btn.innerHTML = UI.icon("check", 18) + " Tandai selesai";
        }

        UI.toast("🎬", "Video selesai ditonton!", "Kamu bisa tandai modul sebagai selesai.");
      });

      bindVideoGuard();
    }

    $("#completeBtn")?.addEventListener("click", async () => {
      const btn = $("#completeBtn");
      if (btn.disabled) return;
      btn.disabled = true;
      btn.textContent = "Menyimpan…";
      try {
        const r = await Store.completeModule(id);
        if (r.gained) {
          UI.confetti(90);
          UI.toast("⭐", `+${r.gained} XP!`, "Modul selesai. Keren!");
        }
        UI.celebrateBadges(r.newBadges);
        setTimeout(render, 400);
      } catch (e) {
        btn.disabled = false;
        btn.innerHTML = UI.icon("check", 18) + " Tandai selesai";
        UI.toast("⚠️", "Gagal menyimpan", e.message);
      }
    });
  }

  const quizState = {};

  function viewQuizList() {
    const cards = Store.chapters().map((ch, i) => {
      const q = Store.quizFor(ch.id);
      const cp = Store.chapterProgress(ch);
      const res = Store.quizResult(ch.id);
      const chapterUnlocked = Store.isChapterUnlocked(ch.id);
      const unlocked = cp.pct === 100 && chapterUnlocked;

      return `<section class="chapter-card">
        <div class="ch-head">
          <div class="ch-no" style="background:${UI.grad(i)};box-shadow:none">🧠</div>
          <div style="flex:1">
            <h3>${q ? UI.esc(q.title) : "Kuis " + UI.esc(ch.title)}</h3>
            <div class="csub">
              ${q ? q.questions.length + " soal" : "Belum ada soal"}
              ${res ? `• nilai terbaik ${res.best}/${res.total}` : ""}
              ${!unlocked ? `• 🔒 selesaikan ${cp.total - cp.done} modul lagi` : ""}
            </div>
          </div>
          <button class="btn ${unlocked ? "btn-red" : "btn-ghost"}"
                  ${unlocked ? `data-go="#/quiz/${ch.id}"` : "disabled"}>
            ${!unlocked ? "🔒 Terkunci" : (res ? "Ulangi" : "Mulai")}
          </button>
        </div>
      </section>`;
    }).join("");
    return `<div class="section-head"><h3>Kuis Chapter</h3><span class="sub">Uji pemahamanmu, kumpulkan XP & badge</span></div>${cards}`;
  }

  function viewQuiz(chapterId) {
    const q = Store.quizFor(chapterId);
    if (!q) return empty("📝", "Kuis belum tersedia", "Chapter ini belum punya soal kuis.", "#/quiz", "Ke Kuis");

    const ch = Store.chapters().find((c) => c.id === chapterId);
    const cp = Store.chapterProgress(ch);
    if (cp.pct < 100) {
      const sisa = cp.total - cp.done;
      return empty("🔒", "Kuis terkunci",
        `Selesaikan ${sisa} modul lagi di chapter "${ch.title}" sebelum mengerjakan kuis.`,
        "#/learn", "Ke Belajar");
    }

    quizState[chapterId] = { i: 0, answers: [], startAt: Date.now(), submitted: false };
    return `<div class="quiz-wrap" id="quizWrap"></div>`;
  }

  function renderQuizStep(chapterId) {
    const q = Store.quizFor(chapterId);
    const st = quizState[chapterId];
    const wrap = $("#quizWrap");
    if (!wrap) return;
    if (st.i >= q.questions.length) return renderQuizResult(chapterId);

    const item = q.questions[st.i];
    const bars = q.questions.map((_, k) => `<i class="${k < st.i ? "on" : ""}"></i>`).join("");

    wrap.innerHTML = `
      <div class="quiz-progress">${bars}</div>
      <div class="qcard">
        <div class="qnum">SOAL ${st.i + 1} DARI ${q.questions.length}</div>
        <div class="qtext">${UI.esc(item.q)}</div>
        <div class="opts">
          ${item.options.map((opt, k) =>
            `<button class="opt" data-k="${k}">
              <span class="key">${String.fromCharCode(65 + k)}</span>
              <span>${UI.esc(opt)}</span>
            </button>`).join("")}
        </div>
        <div id="fbSlot"></div>
      </div>`;

    $$(".opt", wrap).forEach((btn) =>
      btn.addEventListener("click", () => answer(chapterId, +btn.dataset.k))
    );
  }

  function answer(chapterId, k) {
    const q = Store.quizFor(chapterId);
    const st = quizState[chapterId];
    if (st.submitted) return;
    st.submitted = true;
    st.answers.push({ questionId: q.questions[st.i].id, chosen: k });

    const item = q.questions[st.i];
    const correctIdx = item.answer;
    const isCorrect = correctIdx !== undefined && k === correctIdx;

    $$(".opt").forEach((b) => {
      b.disabled = true;
      if (+b.dataset.k === k) b.classList.add(isCorrect ? "correct" : "wrong");
    });

    $("#fbSlot").innerHTML = `
      <div class="feedback ${isCorrect ? "ok" : "no"}">
        <img src="${isCorrect ? M.happy : M.oops}" alt="" onerror="this.style.display='none'">
        <div><div class="fh">${isCorrect ? "Betul! 🎉" : "Belum tepat"}</div></div>
      </div>
      <div style="margin-top:20px;text-align:right">
        <button class="btn btn-red btn-lg" id="nextQ">
          ${st.i + 1 >= q.questions.length ? "Lihat Hasil" : "Lanjut"}
          ${UI.icon("arrow", 18)}
        </button>
      </div>`;

    $("#nextQ").addEventListener("click", () => {
      st.i++;
      st.submitted = false;
      renderQuizStep(chapterId);
    });
  }

  async function renderQuizResult(chapterId) {
    const q = Store.quizFor(chapterId);
    const st = quizState[chapterId];
    const wrap = $("#quizWrap");

    wrap.innerHTML = `<div class="result"><div style="font-size:56px">⏳</div><h2>Menghitung skor…</h2></div>`;

    const durationSec = Math.round((Date.now() - st.startAt) / 1000);
    let r;
    try {
      r = await Store.recordQuiz(chapterId, st.answers, durationSec);
    } catch (e) {
      wrap.innerHTML = empty("⚠️", "Gagal submit", e.message, "#/quiz", "Ke Kuis");
      return;
    }

    const perfect = r.pct === 100;
    const pct = r.pct;
    const msg = perfect ? "Sempurna! Kamu paham banget materinya."
              : pct >= r.minScorePct ? "Kerja bagus! Sedikit lagi menuju sempurna."
              : "Belum lulus. Tonton ulang video chapter ini, lalu coba lagi ya!";

    const xpMsg = r.gainedXp > 0
      ? `+${r.gainedXp} XP`
      : `+0 XP (sudah pernah menjawab benar)`;

    setTimeout(() => {
      if (r.passed) UI.confetti(160);
      UI.toast("⭐", xpMsg, `${r.correct} benar dari ${r.total}`);
      UI.celebrateBadges(r.newBadges);
    }, 150);

    const review = r.passed ? `
      <div style="margin-top:26px;text-align:left">
        <h3 style="margin-bottom:14px">Pembahasan</h3>
        ${r.details.map((d, i) => {
          const qq = q.questions.find((x) => x.id === d.questionId);
          return `<div class="qcard" style="margin-bottom:12px;padding:18px">
            <div class="qnum">SOAL ${i + 1} ${d.correct ? "✅" : "❌"}</div>
            <div style="font-weight:700;margin:6px 0 10px">${UI.esc(qq.q)}</div>
            <div style="color:var(--green);font-weight:700">Benar: ${String.fromCharCode(65 + d.rightAnswer)}</div>
            ${d.explain ? `<div style="color:var(--muted);margin-top:8px;font-size:14px">${UI.esc(d.explain)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>`
      : `<p style="margin-top:16px;color:var(--muted);font-size:14px">
           Kunci jawaban akan muncul setelah kamu lulus skor minimal (${r.minScorePct}%).
         </p>`;

    wrap.innerHTML = `<div class="result">
      <img src="${pct >= r.minScorePct ? M.happy : M.oops}" alt="" onerror="this.style.display='none'">
      <div class="score">${r.correct}<small>/${r.total}</small></div>
      <h2>${perfect ? "Skor Sempurna! 🏆" : r.passed ? "Lulus! 👍" : "Coba Lagi 💪"}</h2>
      <p>${msg}</p>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-ghost btn-lg" id="retryQuizBtn">Ulangi Kuis</button>
        <button class="btn btn-red btn-lg" id="toDashBtn">Ke Dashboard</button>
      </div>
      ${review}
    </div>`;

    if (typeof Guard !== "undefined" && Guard.hide) Guard.hide();

    document.getElementById("retryQuizBtn")?.addEventListener("click", () => {
      location.hash = "/quiz/" + chapterId;
      render();
    });
    document.getElementById("toDashBtn")?.addEventListener("click", () => {
      location.hash = "/dashboard";
      render();
    });
  }

  const monthlyState = {};

  async function viewMonthlyList() {
    try { await Store.loadMonthlyQuiz(); } catch (e) { console.warn(e); }

    const mq = Store.monthlyQuiz();
    const cur = mq.current;
    const archives = asArray(mq.archive);
    const curMonth = fmtMonthName(currentMonthKey());

    let activeCard = "";

    if (cur) {
      const myAttempt = cur.myAttempt || cur.attempt;
      const isDone = !!myAttempt;
      const scorePct = isDone ? Math.round((myAttempt.correct / myAttempt.total) * 100) : 0;

      const headBadge = isDone
        ? `<div class="mq-badge">✓ Selesai</div>`
        : `<div class="mq-badge">🟢 Sedang Aktif</div>`;

      let bodyInner;
      if (isDone) {
        const dur = myAttempt.duration_sec !== undefined ? myAttempt.duration_sec : myAttempt.durationSec;
        bodyInner = `
          <div class="mq-result ${myAttempt.passed ? "pass" : "fail"}">
            <div>
              <div class="mq-score">${myAttempt.correct}<small>/${myAttempt.total}</small></div>
              <div class="mq-rank" style="margin-top:4px">Skor ${scorePct}%</div>
            </div>
            <div class="mq-rank">
              ${myAttempt.passed ? "✅ Lulus" : "❌ Belum lulus"}<br>
              <small>Waktu: ${fmtDuration(dur)}</small>
            </div>
          </div>
          <div class="mq-card-actions">
            <button class="btn btn-ghost btn-sm" data-go="#/monthly-quiz/${cur.id}">Lihat Pembahasan</button>
            <button class="btn btn-ghost btn-sm" data-go="#/leaderboard?tab=monthly">Lihat Ranking</button>
          </div>`;
      } else {
        bodyInner = `
          <div class="mq-meta">
            <span>📋 ${cur.totalQuestions || (cur.questions ? cur.questions.length : 0)} soal</span>
            <span>⏱️ ${Math.round(cur.timeLimitSec / 60)} menit</span>
            <span>🎯 Min. ${cur.minScorePct}%</span>
          </div>
          <div class="mq-warning">⚠️ Cuma bisa dikerjakan <b>1×</b>. Pastikan kamu siap!</div>
          <div class="mq-card-actions">
            <button class="btn btn-red btn-lg" data-go="#/monthly-quiz/${cur.id}">Mulai Quiz →</button>
          </div>`;
      }

      activeCard = `
        <div class="mq-grid">
          <div class="mq-card ${isDone ? "archived" : "active"}">
            <div class="mq-card-head">
              ${headBadge}
              <h3>${UI.esc(cur.title)}</h3>
              <div class="mq-month">${curMonth}</div>
            </div>
            <div class="mq-card-body">
              ${bodyInner}
            </div>
          </div>
        </div>`;
    } else {
      activeCard = `
        <div class="mq-grid">
          <div class="lb-empty-state" style="grid-column:1/-1">
            <div class="em">📅</div>
            <h3>Belum ada quiz bulan ini</h3>
            <p>Tunggu admin membuat quiz bulanan baru.<br>Sambil itu, tetap belajar chapter yuk!</p>
            <button class="btn btn-red" data-go="#/learn">Ke Belajar →</button>
          </div>
        </div>`;
    }

    const archiveCards = archives.length
      ? archives.map((a) => {
          const monthLabel = fmtMonthName(a.monthKey || a.month_key);
          const title = a.title || "(tanpa judul)";
          const myAttempt = a.myAttempt;
          const isDone = !!myAttempt;

          const badge = isDone
            ? `<div class="mq-badge">${myAttempt.passed ? "✅ Lulus" : "❌ Belum"}</div>`
            : `<div class="mq-badge">Tidak Ikut</div>`;

          let bodyInner;
          if (isDone) {
            const dur = myAttempt.duration_sec !== undefined ? myAttempt.duration_sec : myAttempt.durationSec;
            bodyInner = `
              <div class="mq-result ${myAttempt.passed ? "pass" : "fail"}">
                <div>
                  <div class="mq-score">${myAttempt.correct}<small>/${myAttempt.total}</small></div>
                  <div class="mq-rank" style="margin-top:4px">
                    Skor ${Math.round((myAttempt.correct / myAttempt.total) * 100)}%
                  </div>
                </div>
                <div class="mq-rank">
                  ${myAttempt.passed ? "✅ Lulus" : "❌ Belum"}<br>
                  <small>Waktu: ${fmtDuration(dur)}</small>
                </div>
              </div>
              <div class="mq-card-actions">
                <button class="btn btn-ghost btn-sm" data-go="#/monthly-quiz/${a.id}">Lihat Pembahasan</button>
              </div>`;
          } else {
            bodyInner = `
              <div class="mq-empty-note">Kamu tidak mengikuti quiz bulan ini.</div>`;
          }

          return `
            <div class="mq-card archived">
              <div class="mq-card-head">
                ${badge}
                <h3>${UI.esc(title)}</h3>
                <div class="mq-month">${monthLabel}</div>
              </div>
              <div class="mq-card-body">
                ${bodyInner}
              </div>
            </div>`;
        }).join("")
      : `<div class="lb-empty-mini" style="padding:30px;grid-column:1/-1"><p>Belum ada arsip quiz bulanan.</p></div>`;

    return `
      <div class="section-head">
        <h3>📅 Quiz Bulanan</h3>
        <span class="sub">Event bulanan — cuma bisa dikerjakan 1×, bersaing dengan tim!</span>
      </div>

      ${activeCard}

      <div class="section-head" style="margin-top:30px">
        <h3>📦 Arsip Quiz Bulanan</h3>
        <span class="sub">Quiz bulan lalu — bisa dilihat, nggak bisa dikerjakan ulang</span>
      </div>
      <div class="mq-grid">${archiveCards}</div>
    `;
  }

  async function viewMonthlyQuiz(id) {
    let quiz;
    try {
      quiz = await API.call(`/monthly-quiz/${id}`);
    } catch (e) {
      return empty("⚠️", "Gagal memuat", e.message, "#/monthly-quiz", "Kembali");
    }

    if (quiz.myAttempt || quiz.locked) {
      return viewMonthlyResult(quiz);
    }

    if (!quiz.isActive || quiz.monthKey !== currentMonthKey()) {
      return empty("🔒", "Quiz sudah lewat",
        `Quiz ${fmtMonthName(quiz.monthKey)} sudah tidak bisa dikerjakan.`,
        "#/monthly-quiz", "Kembali");
    }

    if (!quiz.questions || quiz.questions.length === 0) {
      return empty("⚠️", "Quiz kosong",
        "Quiz ini belum punya soal. Hubungi admin.",
        "#/monthly-quiz", "Kembali");
    }

    setTimeout(() => bindMonthlyQuizStart(id), 0);

    return `<div class="quiz-wrap" id="quizWrap">
      <div class="mq-confirm">
        <div class="mq-confirm-icon">⚠️</div>
        <h2>${UI.esc(quiz.title)}</h2>
        <p class="mq-confirm-desc">${UI.esc(quiz.description || "Uji pengetahuanmu bulan ini!")}</p>
        <div class="mq-confirm-meta">
          <div class="mq-confirm-item">
            <div class="mq-confirm-lbl">Jumlah Soal</div>
            <div class="mq-confirm-val">${quiz.questions.length}</div>
          </div>
          <div class="mq-confirm-item">
            <div class="mq-confirm-lbl">Waktu</div>
            <div class="mq-confirm-val">${Math.round(quiz.timeLimitSec / 60)} menit</div>
          </div>
          <div class="mq-confirm-item">
            <div class="mq-confirm-lbl">Min. Skor</div>
            <div class="mq-confirm-val">${quiz.minScorePct}%</div>
          </div>
        </div>
        <div class="mq-confirm-warning">
          <b>⚠️ Perhatian:</b> Kamu <b>hanya bisa mengerjakan quiz ini SEKALI</b>.
          Setelah submit, jawaban tidak bisa diubah. Pastikan sudah siap!
        </div>
        <div class="mq-confirm-actions">
          <button class="btn btn-ghost btn-lg" data-go="#/monthly-quiz">Batal</button>
          <button class="btn btn-red btn-lg" id="mqStartBtn">Mulai Sekarang →</button>
        </div>
      </div>
    </div>`;
  }

  function bindMonthlyQuizStart(quizId) {
    $("#mqStartBtn")?.addEventListener("click", async () => {
      try {
        const quiz = await API.call(`/monthly-quiz/${quizId}`);

        if (quiz.myAttempt || quiz.locked) {
          UI.toast("⚠️", "Sudah dikerjakan", "Kamu sudah mengerjakan quiz ini.");
          location.hash = "/monthly-quiz";
          return;
        }

        if (!quiz.isActive || quiz.monthKey !== currentMonthKey()) {
          UI.toast("⚠️", "Quiz sudah lewat", "Quiz ini tidak bisa dikerjakan lagi.");
          location.hash = "/monthly-quiz";
          return;
        }

        if (!quiz.questions || quiz.questions.length === 0) {
          UI.toast("⚠️", "Quiz kosong", "Belum ada soal.");
          return;
        }

        monthlyState[quizId] = {
          quiz,
          i: 0,
          answers: [],
          startAt: Date.now(),
          submitted: false
        };
        renderMonthlyStep(quizId);
      } catch (e) {
        UI.toast("⚠️", "Gagal memulai", e.message);
      }
    });
  }

  function renderMonthlyStep(quizId) {
    const st = monthlyState[quizId];
    if (!st) return;
    const q = st.quiz;
    const wrap = $("#quizWrap");

    if (st.i >= q.questions.length) return renderMonthlyResultFromState(quizId);

    const item = q.questions[st.i];
    const bars = q.questions.map((_, k) => `<i class="${k < st.i ? "on" : ""}"></i>`).join("");
    const elapsed = Math.round((Date.now() - st.startAt) / 1000);
    const remaining = Math.max(0, q.timeLimitSec - elapsed);

    wrap.innerHTML = `
      <div class="quiz-progress">${bars}</div>
      <div class="mq-timer" id="mqTimer">
        ⏱️ <b>${fmtDuration(remaining)}</b> tersisa
      </div>
      <div class="qcard">
        <div class="qnum">SOAL ${st.i + 1} DARI ${q.questions.length}</div>
        <div class="qtext">${UI.esc(item.q)}</div>
        <div class="opts">
          ${item.options.map((opt, k) =>
            `<button class="opt" data-k="${k}">
              <span class="key">${String.fromCharCode(65 + k)}</span>
              <span>${UI.esc(opt)}</span>
            </button>`).join("")}
        </div>
        <div id="fbSlot"></div>
      </div>`;

    $$(".opt", wrap).forEach((btn) =>
      btn.addEventListener("click", () => answerMonthly(quizId, +btn.dataset.k))
    );
  }

  function answerMonthly(quizId, k) {
    const st = monthlyState[quizId];
    if (!st || st.submitted) return;
    st.submitted = true;
    st.answers.push({ questionId: st.quiz.questions[st.i].id, chosen: k });

    const item = st.quiz.questions[st.i];
    const correctIdx = item.answer;
    const isCorrect = correctIdx !== undefined && k === correctIdx;

    $$(".opt").forEach((b) => {
      b.disabled = true;
      if (+b.dataset.k === k) b.classList.add(isCorrect ? "correct" : "wrong");
    });

    $("#fbSlot").innerHTML = `
      <div class="feedback ${isCorrect ? "ok" : "no"}">
        <img src="${isCorrect ? M.happy : M.oops}" alt="" onerror="this.style.display='none'">
        <div><div class="fh">${isCorrect ? "Betul! 🎉" : "Belum tepat"}</div></div>
      </div>
      <div style="margin-top:20px;text-align:right">
        <button class="btn btn-red btn-lg" id="nextQ">
          ${st.i + 1 >= st.quiz.questions.length ? "Lihat Hasil" : "Lanjut"}
          ${UI.icon("arrow", 18)}
        </button>
      </div>`;

    $("#nextQ").addEventListener("click", () => {
      st.i++;
      st.submitted = false;
      renderMonthlyStep(quizId);
    });
  }

  async function renderMonthlyResultFromState(quizId) {
    const st = monthlyState[quizId];
    if (!st) return;
    const wrap = $("#quizWrap");
    const durationSec = Math.round((Date.now() - st.startAt) / 1000);

    wrap.innerHTML = `<div class="result"><div style="font-size:56px">⏳</div><h2>Menghitung skor…</h2></div>`;

    let r;
    try {
      r = await API.call(`/monthly-quiz/${quizId}/submit`, {
        method: "POST",
        body: { answers: st.answers, durationSec }
      });
    } catch (e) {
      wrap.innerHTML = empty("⚠️", "Gagal submit", e.message, "#/monthly-quiz", "Kembali");
      return;
    }

    try { await Store.loadMonthlyQuiz(); } catch {}

    const perfect = r.pct === 100;
    const passed = r.passed;

    setTimeout(() => {
      if (passed) UI.confetti(180);
      UI.toast("⭐", `+${r.gainedXp || 0} XP`, `${r.correct} benar dari ${r.total}`);
      UI.celebrateBadges(r.newBadges);
    }, 150);

    const review = `
      <div style="margin-top:26px;text-align:left">
        <h3 style="margin-bottom:14px">Pembahasan</h3>
        ${r.details.map((d, i) => {
          const qq = st.quiz.questions.find((x) => x.id === d.questionId);
          return `<div class="qcard" style="margin-bottom:12px;padding:18px">
            <div class="qnum">SOAL ${i + 1} ${d.correct ? "✅" : "❌"}</div>
            <div style="font-weight:700;margin:6px 0 10px">${UI.esc(qq.q)}</div>
            <div style="color:var(--green);font-weight:700">Benar: ${String.fromCharCode(65 + d.rightAnswer)}</div>
            ${d.explain ? `<div style="color:var(--muted);margin-top:8px;font-size:14px">${UI.esc(d.explain)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>`;

    wrap.innerHTML = `<div class="result">
      <img src="${passed ? M.happy : M.oops}" alt="" onerror="this.style.display='none'">
      <div class="score">${r.correct}<small>/${r.total}</small></div>
      <h2>${perfect ? "Skor Sempurna! 🏆" : passed ? "Lulus! 👍" : "Coba Lagi Bulan Depan 💪"}</h2>
      <p>${perfect ? "Kamu luar biasa!" : passed ? "Kerja bagus!" : `Skor minimal ${r.minScorePct}%. Coba lagi bulan depan!`}</p>
      <div class="mq-final-stats">
        <div class="mq-final-item">
          <div class="mq-final-lbl">Skor</div>
          <div class="mq-final-val">${r.pct}%</div>
        </div>
        <div class="mq-final-item">
          <div class="mq-final-lbl">Waktu</div>
          <div class="mq-final-val">${fmtDuration(r.durationSec)}</div>
        </div>
        <div class="mq-final-item">
          <div class="mq-final-lbl">XP Didapat</div>
          <div class="mq-final-val">+${r.gainedXp || 0}</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-ghost btn-lg" data-go="#/leaderboard?tab=monthly">Lihat Ranking</button>
        <button class="btn btn-red btn-lg" data-go="#/monthly-quiz">Ke Quiz Bulanan</button>
      </div>
      ${review}
    </div>`;
  }

  async function viewMonthlyResult(quiz) {
    const a = quiz.myAttempt || quiz.attempt;
    if (!a) return empty("⚠️", "Data tidak ditemukan", "Coba buka ulang halaman.", "#/monthly-quiz", "Kembali");

    const passed = a.passed;
    const perfect = a.correct === a.total && a.total > 0;
    const dur = a.durationSec !== undefined ? a.durationSec : a.duration_sec;

    let details = Array.isArray(a.details) ? a.details : [];

    if (!details.length && Array.isArray(quiz.questions) && quiz.questions.length) {
      details = quiz.questions.map((q) => ({
        questionId: q.id,
        chosen: null,
        correct: null,
        rightAnswer: q.answer,
        explain: q.explain
      }));
    }

    const review = details.length ? `
      <div style="margin-top:26px;text-align:left">
        <h3 style="margin-bottom:14px">Pembahasan</h3>
        ${details.map((d, i) => {
          const qq = (quiz.questions || []).find((x) => x.id === d.questionId) || {};
          const answerKey = d.rightAnswer !== undefined && d.rightAnswer !== null
            ? String.fromCharCode(65 + d.rightAnswer)
            : (qq.answer !== undefined ? String.fromCharCode(65 + qq.answer) : "?");

          const statusIcon = d.correct === true ? "✅" : d.correct === false ? "❌" : "•";

          return `<div class="qcard" style="margin-bottom:12px;padding:18px">
            <div class="qnum">SOAL ${i + 1} ${statusIcon}</div>
            <div style="font-weight:700;margin:6px 0 10px">${UI.esc(qq.q || "(soal tidak tersedia)")}</div>
            ${qq.options ? `
              <div style="display:flex;flex-direction:column;gap:6px;margin-bottom:10px">
                ${qq.options.map((opt, k) => {
                  const isRight = k === d.rightAnswer;
                  const isPicked = k === d.chosen;
                  let bg = "rgba(255,255,255,.03)";
                  let border = "var(--line)";
                  let badge = "";
                  if (isRight) { bg = "rgba(63,191,49,.15)"; border = "var(--green)"; badge = '<span style="color:var(--green);font-weight:800">✓ Jawaban benar</span>'; }
                  else if (isPicked) { bg = "rgba(237,29,36,.12)"; border = "var(--red)"; badge = '<span style="color:#ff8a8a;font-weight:800">✗ Jawaban kamu</span>'; }
                  return `<div style="display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:10px;background:${bg};border:1px solid ${border}">
                    <span style="font-weight:800;width:20px">${String.fromCharCode(65 + k)}</span>
                    <span style="flex:1">${UI.esc(opt)}</span>
                    ${badge}
                  </div>`;
                }).join("")}
              </div>` : ""}
            <div style="color:var(--green);font-weight:700;margin-top:6px">Kunci: ${answerKey}</div>
            ${d.explain ? `<div style="color:var(--muted);margin-top:8px;font-size:14px">💡 ${UI.esc(d.explain)}</div>` : ""}
          </div>`;
        }).join("")}
      </div>`
      : `<p style="margin-top:20px;color:var(--muted);font-size:14px;text-align:center">
           Pembahasan tidak tersedia untuk quiz ini.
         </p>`;

    return `<div class="result">
      <img src="${passed ? M.happy : M.oops}" alt="" onerror="this.style.display='none'">
      <div class="score">${a.correct}<small>/${a.total}</small></div>
      <h2>${perfect ? "Skor Sempurna! 🏆" : passed ? "Lulus! 👍" : "Belum Lulus 💪"}</h2>
      <p>${UI.esc(quiz.title)} — ${fmtMonthName(quiz.monthKey)}</p>
      <div class="mq-final-stats">
        <div class="mq-final-item">
          <div class="mq-final-lbl">Skor</div>
          <div class="mq-final-val">${Math.round((a.correct / a.total) * 100)}%</div>
        </div>
        <div class="mq-final-item">
          <div class="mq-final-lbl">Waktu</div>
          <div class="mq-final-val">${fmtDuration(dur)}</div>
        </div>
        <div class="mq-final-item">
          <div class="mq-final-lbl">Status</div>
          <div class="mq-final-val">${passed ? "✅ Lulus" : "❌ Belum"}</div>
        </div>
      </div>
      <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <button class="btn btn-ghost btn-lg" data-go="#/leaderboard?tab=monthly">Lihat Ranking</button>
        <button class="btn btn-red btn-lg" data-go="#/monthly-quiz">Ke Quiz Bulanan</button>
      </div>
      ${review}
    </div>`;
  }

  function viewFunFact() {
    const cards = Store.flashcards();
    if (!cards.length) return empty("💡", "Belum ada Fun Fact", "Admin belum upload.", "#/dashboard", "Ke Dashboard");

    const grid = cards.map((c, i) => `
      <div class="flip" data-id="${c.id}" data-i="${i}" tabindex="0" role="button">
        <div class="flip-in">
          <div class="face face-front" style="background:${UI.grad(i)}">
            <div class="fc-emoji">${c.emoji}</div>
            <div class="fc-title">${UI.esc(c.front)}</div>
            <div class="fc-hint">Ketuk untuk buka ${UI.icon("arrow", 14)}</div>
          </div>
          <div class="face face-back">
            <div class="fc-badge">FUN FACT #${i + 1}</div>
            ${(c.back || []).map((b) => `<p>${UI.esc(b)}</p>`).join("")}
            <div class="kite">🪁</div>
          </div>
        </div>
      </div>`).join("");

    const seen = Store.getProgress().flashcards.length;
    return `<div class="section-head">
        <h3>Fun Fact Cimory & Kanzler</h3>
        <span class="sub">Ketuk kartu untuk balik • ${seen}/${cards.length} dibuka</span>
      </div>
      <div class="fc-grid">${grid}</div>`;
  }

  function bindFunFact() {
    $$(".flip").forEach((el) => {
      const flip = async () => {
        el.classList.toggle("flipped");
        if (el.classList.contains("flipped")) {
          try {
            const r = await Store.seeFlashcard(el.dataset.id);
            UI.celebrateBadges(r.newBadges);
          } catch (e) {}
        }
      };
      el.addEventListener("click", flip);
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
      });
    });
  }

  function viewBadges() {
    const tiles = Store.badgesDef().map((b) => {
      const on = b.owned;
      return `<div class="badge ${on ? "on" : ""}">
        <div class="lock">${on ? "✅" : "🔒"}</div>
        <div class="bem">${b.emoji}</div>
        <div class="bt">${UI.esc(b.title)}</div>
        <div class="bd">${UI.esc(b.desc)}</div>
      </div>`;
    }).join("");
    const o = Store.overall();
    return `<div class="section-head">
        <h3>Koleksi Badge</h3>
        <span class="sub">${o.badges} dari ${o.badgeTotal} terkumpul</span>
      </div>
      <div class="badge-grid">${tiles}</div>`;
  }

  function viewReportsList() {
    if (!myReports.length) {
      return empty("📊", "Belum ada report", "Admin belum memberikan akses report ke kamu.", "#/dashboard", "Ke Dashboard");
    }

    const cards = myReports.map((r, i) => `
      <div class="card" data-go="#/reports/${r.slug}" style="cursor:pointer">
        <div class="poster" style="background:${UI.grad(i)}">
          <span class="ptag">REPORT</span>
          <span class="pnum" style="font-size:52px">${UI.esc(r.icon || "📊")}</span>
          <div class="pplay">${UI.icon("arrow", 18)}</div>
        </div>
        <div class="cbody">
          <div class="ctitle">${UI.esc(r.title)}</div>
          <div class="cmeta">${UI.esc(r.description || "Klik untuk buka")}</div>
        </div>
      </div>
    `).join("");

    return `
      <div class="section-head">
        <h3>Reports</h3>
        <span class="sub">${myReports.length} report tersedia</span>
      </div>
      <div class="row-track">${cards}</div>`;
  }

  async function viewReportDetail(slug) {
    let report;
    try {
      report = await API.call(`/reports/${slug}`);
    } catch (e) {
      return empty("🚫", "Tidak bisa diakses", e.message, "#/reports", "Ke Reports");
    }

    return `<div class="player-wrap">
      <button class="btn-back" id="reportBackBtn">
        ${UI.icon("arrowLeft", 16)} Kembali ke Reports
      </button>
      <div class="crumb">
        <a href="#/reports">Reports</a> ${UI.icon("arrow", 14)}
        <span>${UI.esc(report.title)}</span>
      </div>

      <h1 class="player-title">${UI.esc(report.title)}</h1>
      ${report.description ? `<div class="player-meta">${UI.esc(report.description)}</div>` : ""}

      <div class="report-frame-wrap" id="reportFrameWrap">
        <button class="report-fs-btn" id="reportFsBtn" title="Fullscreen" aria-label="Fullscreen">⛶</button>
        <iframe
          id="reportFrame"
          src="${UI.esc(report.embedUrl)}"
          frameborder="0"
          allowFullScreen="true"
          loading="lazy"
        ></iframe>
      </div>
    </div>`;
  }

  function bindReportDetail() {
    $("#reportBackBtn")?.addEventListener("click", () => go("/reports"));

    const fsBtn = $("#reportFsBtn");
    const wrap = $("#reportFrameWrap");
    fsBtn?.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        wrap.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  function viewLogin() {
    const modalRoot = document.getElementById("modal-root");
    if (modalRoot) modalRoot.innerHTML = "";

    root.innerHTML = `
    <div class="login-page">
      <img class="login-mascot l" src="${M.oops}" alt="" onerror="this.style.display='none'">
      <img class="login-mascot r" src="${M.happy}" alt="" onerror="this.style.display='none'">
      <div class="login-card">
        <img class="lc-logo" src="${M.logo}" alt="Cimory" onerror="this.style.display='none'">
        <h1>Sales Academy</h1>
        <div class="lsub">Masuk pakai email Cimory Group kamu untuk mulai belajar.</div>

        <div id="loginForm">
          <div class="login-err" id="loginErr"></div>
          <div class="field">
            <label for="email">Email kantor</label>
            <input id="email" type="email" placeholder="nama@cimory.com" autocomplete="email">
          </div>
          <div class="field">
            <label for="pw">Password</label>
            <input id="pw" type="password" placeholder="••••••••" autocomplete="current-password">
          </div>
          <button class="btn btn-red btn-lg" id="signInBtn">Masuk</button>
          <div style="text-align:center;margin-top:14px">
            <a href="#" id="showForgot" style="color:var(--gold);font-size:13px;font-weight:600">
              Lupa password?
            </a>
          </div>
        </div>

        <div id="forgotForm" style="display:none">
          <div class="login-err" id="forgotErr"></div>
          <div class="login-msg" id="forgotMsg"></div>
          <div class="lsub" style="margin-bottom:20px">
            Masukkan email kantormu. Kami akan mengirim link untuk membuat password baru.
          </div>
          <div class="field">
            <label for="fpEmail">Email kantor</label>
            <input id="fpEmail" type="email" placeholder="nama@cimory.com" autocomplete="email">
          </div>
          <button class="btn btn-red btn-lg" id="sendResetBtn">Kirim Link Reset</button>
          <div style="text-align:center;margin-top:14px">
            <a href="#" id="backToLogin" style="color:var(--muted);font-size:13px;font-weight:600">
              ← Kembali ke login
            </a>
          </div>
        </div>

        <div class="sso-note">🔒 Login SSO Cimory — segera hadir</div>
      </div>
    </div>`;

    const submit = async () => {
      const err = $("#loginErr");
      const btn = $("#signInBtn");
      err.classList.remove("show");
      btn.disabled = true;
      btn.textContent = "Memuat…";

      const res = await Auth.signIn($("#email").value, $("#pw").value);

      if (!res.ok) {
        btn.disabled = false;
        btn.textContent = "Masuk";
        err.textContent = res.msg;
        err.classList.add("show");
        return;
      }

      if (!location.hash || location.hash === "" || location.hash === "#") {
        location.hash = "/dashboard";
      }

      try {
        await Store.bootstrap();
        try { await Store.loadLeaderboard(); } catch {}
        try { await Store.loadMonthlyQuiz(); } catch {}
        try { await Store.loadMyPopup(); } catch {}
        try {
          myReports = await API.call("/reports") || [];
        } catch (e) {
          console.warn("Gagal load reports:", e.message);
          myReports = [];
        }
      } catch (e) { console.error("Bootstrap error:", e); }

      render();
      setTimeout(() => showPopupQueueOnce(), 1200);
    };

    $("#signInBtn").addEventListener("click", submit);
    ["email", "pw"].forEach((id) =>
      $("#" + id).addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); })
    );
    $("#email").focus();

    $("#showForgot").addEventListener("click", (e) => {
      e.preventDefault();
      $("#loginForm").style.display = "none";
      $("#forgotForm").style.display = "block";
      const cur = $("#email").value.trim();
      if (cur) $("#fpEmail").value = cur;
      $("#fpEmail").focus();
    });

    $("#backToLogin").addEventListener("click", (e) => {
      e.preventDefault();
      $("#forgotForm").style.display = "none";
      $("#loginForm").style.display = "block";
      $("#forgotErr").classList.remove("show");
      $("#forgotMsg").classList.remove("show");
      $("#fpEmail").value = "";
    });

    const submitForgot = async () => {
      const err = $("#forgotErr");
      const msg = $("#forgotMsg");
      const btn = $("#sendResetBtn");
      err.classList.remove("show");
      msg.classList.remove("show");

      const email = $("#fpEmail").value.trim().toLowerCase();
      const v = Auth.validateEmail(email);
      if (!v.ok) { err.textContent = v.msg; err.classList.add("show"); return; }

      btn.disabled = true;
      btn.textContent = "Mengirim…";

      try {
        await API.call("/auth/forgot-password", { method: "POST", body: { email } });
        msg.innerHTML = `<strong>✓ Link reset terkirim!</strong><br>
          Cek inbox <b>${UI.esc(email)}</b>. Link berlaku 1 jam.<br>
          <small>Tidak menerima email? Cek folder spam atau hubungi IT.</small>`;
        msg.classList.add("show");
        btn.textContent = "Terkirim ✓";
        btn.disabled = true;
      } catch (e) {
        btn.disabled = false;
        btn.textContent = "Kirim Link Reset";
        err.textContent = e.message || "Gagal mengirim link reset";
        err.classList.add("show");
      }
    };

    $("#sendResetBtn").addEventListener("click", submitForgot);
    $("#fpEmail").addEventListener("keydown", (e) => { if (e.key === "Enter") submitForgot(); });
  }

  async function viewResetPassword(token) {
    root.innerHTML = `<div class="login-page"><div class="login-card">
      <div style="text-align:center"><div style="font-size:48px">⏳</div>
      <h2 style="margin-top:10px">Memverifikasi link…</h2></div>
    </div></div>`;

    let userInfo;
    try {
      userInfo = await API.call(`/auth/verify-reset-token/${token}`);
    } catch (e) {
      root.innerHTML = `<div class="login-page"><div class="login-card">
        <div style="text-align:center">
          <div style="font-size:56px">❌</div>
          <h2 style="margin:10px 0 6px">Link tidak valid</h2>
          <p style="color:var(--muted);font-size:14px">${UI.esc(e.message)}</p>
          <a class="btn btn-red btn-lg" href="/" style="margin-top:18px">Kembali ke Login</a>
        </div>
      </div></div>`;
      return;
    }

    root.innerHTML = `
    <div class="login-page">
      <div class="login-card">
        <h1>Password Baru</h1>
        <div class="lsub">Untuk akun: <b>${UI.esc(userInfo.email)}</b></div>
        <div class="login-err" id="resetErr"></div>
        <div class="login-msg" id="resetMsg"></div>
        <div class="field">
          <label for="rp1">Password Baru</label>
          <input id="rp1" type="password" placeholder="Minimal 6 karakter">
        </div>
        <div class="field">
          <label for="rp2">Ulangi Password</label>
          <input id="rp2" type="password" placeholder="Ketik ulang password">
        </div>
        <button class="btn btn-red btn-lg" id="saveResetBtn">Simpan Password</button>
      </div>
    </div>`;

    const submit = async () => {
      const err = $("#resetErr"), msg = $("#resetMsg"), btn = $("#saveResetBtn");
      err.classList.remove("show");
      msg.classList.remove("show");
      const p1 = $("#rp1").value, p2 = $("#rp2").value;
      if (p1.length < 6) { err.textContent = "Password minimal 6 karakter"; err.classList.add("show"); return; }
      if (p1 !== p2) { err.textContent = "Password tidak sama"; err.classList.add("show"); return; }
      btn.disabled = true;
      btn.textContent = "Menyimpan…";
      try {
        await API.call("/auth/reset-password", { method: "POST", body: { token, newPassword: p1 } });
        msg.innerHTML = `<strong>✓ Password berhasil diubah!</strong><br>Di-redirect ke login…`;
        msg.classList.add("show");
        btn.textContent = "Berhasil ✓";
        setTimeout(() => { localStorage.clear(); location.hash = ""; location.reload(); }, 2000);
      } catch (e) {
        btn.disabled = false;
        btn.textContent = "Simpan Password";
        err.textContent = e.message;
        err.classList.add("show");
      }
    };

    $("#saveResetBtn").addEventListener("click", submit);
    ["rp1", "rp2"].forEach((id) =>
      $("#" + id).addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); })
    );
  }

  async function viewRewards() {
    const monthKey = currentMonthKey();
    const prev = prevMonthKey();

    const [rewards, winners, ranking] = await Promise.all([
      API.call(`/rewards/admin/list?month=${monthKey}`),
      API.call(`/rewards/admin/winners?month=${prev}`),
      API.call(`/leaderboard/progress?month=${monthKey}`)
    ]);

    const rewardsList = Array.isArray(rewards) ? rewards : [];
    const winnersList = Array.isArray(winners) ? winners : [];
    const rankingList = (ranking && ranking.list) || [];

    const rewardsRows = rewardsList.length
      ? rewardsList.map((r) => `
          <tr>
            <td>${r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}</td>
            <td>Rank ${r.rank}</td>
            <td>${r.prize_emoji || "🎁"} ${UI.esc(r.prize_text)}</td>
            <td>
              <div class="row-actions">
                <button class="btn btn-ghost btn-sm" data-act="edit-reward" data-id="${r.id}" data-rank="${r.rank}" data-prize="${UI.esc(r.prize_text)}" data-emoji="${r.prize_emoji || "🎁"}">✏️</button>
                <button class="btn btn-danger btn-sm" data-act="del-reward" data-id="${r.id}">🗑️</button>
              </div>
            </td>
          </tr>`).join("")
      : `<tr><td colspan="4"><div class="admin-empty">Belum ada hadiah bulan ini.</div></td></tr>`;

    const winnersHtml = winnersList.length
      ? winnersList.map((w) => `
          <div class="winner-row">
            <div class="wr-medal">${w.rank === 1 ? "🥇" : w.rank === 2 ? "🥈" : "🥉"}</div>
            <div class="wr-info">
              <div class="wr-name">${UI.esc(w.name)} <small style="color:var(--muted)">${UI.esc(w.email)}</small></div>
              <div class="wr-points">${w.total_points} poin</div>
            </div>
            ${w.prize_text ? `<div class="wr-prize">${w.prize_emoji || "🎁"} ${UI.esc(w.prize_text)}</div>` : ""}
          </div>`).join("")
      : `<div class="admin-empty" style="padding:20px">Belum ada snapshot pemenang untuk bulan ${prev}.</div>`;

    return `
      <div class="admin-card">
        <h2>🎁 Hadiah — ${fmtMonthName(monthKey)}</h2>
        <div class="sub">Setting hadiah per rank untuk bulan ini</div>
        <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
          <button class="btn btn-red" data-act="add-reward">➕ Tambah Hadiah</button>
        </div>
        <table class="data-table">
          <thead><tr><th style="width:60px">#</th><th style="width:100px">Rank</th><th>Hadiah</th><th style="width:120px"></th></tr></thead>
          <tbody>${rewardsRows}</tbody>
        </table>
      </div>

      <div class="admin-card">
        <h2>🏆 Pemenang ${fmtMonthName(prev)}</h2>
        <div class="sub">Snapshot pemenang bulan lalu (otomatis dari ranking)</div>
        <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
          <button class="btn btn-ghost" data-act="snapshot-winners" data-month="${prev}">🔄 Hitung Ulang & Snapshot</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:10px">${winnersHtml}</div>
      </div>

      <div class="admin-card">
        <h2>📊 Ranking Sementara — ${fmtMonthName(monthKey)}</h2>
        <div class="sub">Live ranking sebelum di-snapshot jadi pemenang</div>
        <table class="data-table">
          <thead><tr><th>#</th><th>Nama</th><th>Poin</th><th>Waktu Total</th></tr></thead>
          <tbody>
            ${rankingList.slice(0, 20).map((u) => `
              <tr>
                <td>${u.rank}</td>
                <td>${UI.esc(u.name)}</td>
                <td>${u.totalPoints}</td>
                <td>${Math.round(u.totalDuration / 60)} mnt</td>
              </tr>`).join("") || `<tr><td colspan="4"><div class="admin-empty">Belum ada aktivitas</div></td></tr>`}
          </tbody>
        </table>
      </div>`;
  }

  function prevMonthKey() {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function empty(em, title, desc, href, cta) {
    return `<div class="empty">
      <div class="em">${em}</div>
      <h2 style="margin:10px 0 6px">${UI.esc(title)}</h2>
      <p>${UI.esc(desc)}</p>
      <a class="btn btn-red" href="${href}" style="margin-top:14px">${UI.esc(cta)}</a>
    </div>`;
  }

  let booting = false;

  async function bootAndRender() {
    if (booting) return;
    booting = true;
    try {
      await Store.bootstrap();
      try { await Store.loadLeaderboard(); } catch {}
      try { await Store.loadMonthlyQuiz(); } catch {}
      try { await Store.loadMyPopup(); } catch {}
      try {
        myReports = await API.call("/reports") || [];
      } catch (e) {
        console.warn("Gagal load reports:", e.message);
        myReports = [];
      }
    } catch (e) {
      console.error("Bootstrap error:", e);
    } finally {
      booting = false;
    }
    setTimeout(async () => {
      render();
      setTimeout(() => showPopupQueueOnce(), 1000);
    }, 0);
  }

  async function render() {
    const hash = location.hash.slice(1);
    if (hash.startsWith("/reset-password")) {
      const queryPart = hash.split("?")[1] || "";
      const params = new URLSearchParams(queryPart);
      const token = params.get("token");
      if (token) { viewResetPassword(token); return; }
    }

    if (!Store.isLoggedIn()) { viewLogin(); return; }

    if (isAdmin()) {
      root.innerHTML = `<div style="padding:80px;text-align:center;color:var(--muted)">
        <div style="font-size:48px">⚙️</div>
        <h2 style="margin-top:10px;color:var(--text)">Memuat admin panel…</h2>
      </div>`;
      AdminApp.mount(Store.user());
      return;
    }

    cleanupVideoGuard();

    const rawHash = location.hash.slice(1) || "/dashboard";
    const [rawPath, rawQuery = ""] = rawHash.split("?");
    const parts = rawPath.split("/").filter(Boolean);
    const section = parts[0] || "dashboard";
    const param = parts[1];
    const query = new URLSearchParams(rawQuery);

    let active = section;
    let inner = "";
    let postBind = null;

    if (section === "dashboard") {
      inner = viewDashboard();
    } else if (section === "learn") {
      inner = param ? viewModule(param) : viewLearn();
    } else if (section === "quiz") {
      inner = param ? viewQuiz(param) : viewQuizList();
    } else if (section === "monthly-quiz") {
      if (param) {
        root.innerHTML = shell("monthly-quiz", `<div class="empty"><div class="em">⏳</div><h2>Memuat quiz…</h2></div>`);
        bindShell();
        const html = await viewMonthlyQuiz(param);
        if (typeof html === "string") {
          root.innerHTML = shell("monthly-quiz", html);
          bindShell();
        }
        return;
      } else {
        root.innerHTML = shell("monthly-quiz", `<div class="empty"><div class="em">⏳</div><h2>Memuat quiz bulanan…</h2></div>`);
        bindShell();
        const html = await viewMonthlyList();
        root.innerHTML = shell("monthly-quiz", html);
        bindShell();
        return;
      }
    } else if (section === "leaderboard") {
      const tab = query.get("tab") || "progress";
      inner = viewLeaderboardPage(tab);
      postBind = bindLeaderboardPage;
    } else if (section === "funfact") {
      inner = viewFunFact();
    } else if (section === "badges") {
      inner = viewBadges();
    } else if (section === "reports") {
      if (param) {
        root.innerHTML = shell("reports", `<div class="empty"><div class="em">⏳</div><h2>Memuat report…</h2></div>`);
        bindShell();
        const html = await viewReportDetail(param);
        root.innerHTML = shell("reports", html);
        bindShell();
        bindReportDetail();
        return;
      } else {
        inner = viewReportsList();
      }
    } else {
      active = "dashboard"; inner = viewDashboard();
    }

    root.innerHTML = shell(active, inner);
    bindShell();

    if (section === "learn" && param) bindModule(param);
    if (section === "quiz" && param) renderQuizStep(param);
    if (section === "funfact") bindFunFact();
    if (postBind) postBind();

    window.scrollTo(0, 0);
  }

  document.body.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (!el) return;
    if (el.disabled || el.classList.contains("disabled")) return;
    e.preventDefault();
    const t = el.dataset.go;
    if (t) go(t.replace(/^#/, ""));
  });

  window.addEventListener("hashchange", () => {
    const hash = location.hash.slice(1);
    if (hash.startsWith("/reset-password")) { render(); return; }
    if (!Store.isLoggedIn()) return;
    render();
  });

  const boot = () => {
    const hash = location.hash.slice(1);
    if (hash.startsWith("/reset-password")) { render(); return; }
    if (Store.isLoggedIn()) bootAndRender();
    else render();
  };

  if (document.readyState === "loading") {
    window.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

  const PopupQueue = {
    queue: [],
    current: null,
    container: null,

    init() {
      if (this.container) return;
      this.container = document.createElement("div");
      this.container.className = "popup-overlay";
      this.container.id = "popupOverlay";
      document.body.appendChild(this.container);
    },

    show(popups) {
      if (!Array.isArray(popups) || popups.length === 0) return;
      this.init();
      this.queue = [...popups];
      this.next();
    },

    next() {
      if (this.queue.length === 0) {
        this.close();
        return;
      }
      this.current = this.queue.shift();
      this.renderCurrent();
    },

    close() {
      if (this.container) {
        this.container.classList.remove("show");
        setTimeout(() => {
          if (this.container) this.container.innerHTML = "";
        }, 250);
      }
      this.current = null;
      this.queue = [];
    },

    renderCurrent() {
      const p = this.current;
      if (!p) return;

      const dots = (this.queue.length > 0 || this.queue.length === 0)
        ? `<div class="popup-dots">
            <span class="on"></span>
            ${this.queue.map(() => `<span></span>`).join("")}
          </div>`
        : "";

      let html = "";

      if (p.type === "winner") {
        const badge = p.badge || "gold";
        const badgeLabel = badge === "gold" ? "🥇 JUARA 1" :
                          badge === "silver" ? "🥈 JUARA 2" :
                          badge === "bronze" ? "🥉 JUARA 3" : `🏅 RANK ${p.rank}`;

        html = `
          <div class="popup-card">
            <button class="popup-close" data-popup-close>✕</button>
            <div class="popup-emoji">🎉</div>
            <div class="popup-eyebrow">SELAMAT!</div>
            <h2 class="popup-title">Kamu Juara ${p.rank}!</h2>
            <p class="popup-sub">${UI.esc(p.periodLabel || "")} — kerja keren! Terus pertahankan.</p>
            <div class="popup-badge ${badge}">${badgeLabel}</div>

            <div class="popup-stats">
              <div class="popup-stat">
                <div class="popup-stat-lbl">Total Skor</div>
                <div class="popup-stat-val">${p.totalScore}</div>
              </div>
              <div class="popup-stat">
                <div class="popup-stat-lbl">Total Waktu</div>
                <div class="popup-stat-val">${fmtDuration(p.totalDuration)}</div>
              </div>
            </div>

            ${p.prizeDesc || p.prizeTitle ? `
              <div class="popup-prize">
                <div class="popup-prize-lbl">🎁 HADIAH KAMU</div>
                ${p.prizeTitle ? `<div class="popup-prize-title">${UI.esc(p.prizeTitle)}</div>` : ""}
                ${p.prizeDesc ? `<div class="popup-prize-desc">${UI.esc(p.prizeDesc)}</div>` : ""}
              </div>` : ""}

            <div class="popup-actions">
              <button class="btn btn-red" data-popup-next>Lanjut →</button>
            </div>
            ${dots}
          </div>`;
      }
      else if (p.type === "winners-board") {
        const rows = (p.winners || []).map((w) => `
          <div class="popup-podium-row rank-${w.rank}">
            <div class="popup-podium-medal">${w.badgeEmoji || "🏅"}</div>
            <div class="popup-podium-info">
              <div class="popup-podium-name">${UI.esc(w.name)}</div>
              <div class="popup-podium-score">${w.score} poin</div>
            </div>
            ${w.prizeDesc ? `<div class="popup-podium-prize">${UI.esc(w.prizeDesc)}</div>` : ""}
          </div>`).join("");

        html = `
          <div class="popup-card">
            <button class="popup-close" data-popup-close>✕</button>
            <div class="popup-emoji">🏆</div>
            <div class="popup-eyebrow">PAPAN PERINGKAT</div>
            <h2 class="popup-title">Pemenang ${p.periodLabel || "Bulan Ini"}</h2>
            <p class="popup-sub">Selamat untuk para juara! Kamu bisa jadi yang berikutnya 💪</p>

            <div class="popup-podium">
              ${rows || `<p style="color:var(--muted);text-align:center">Belum ada pemenang.</p>`}
            </div>

            <div class="popup-actions">
              <button class="btn btn-ghost" data-popup-close>Tutup</button>
              <button class="btn btn-red" data-popup-go-leaderboard>Lihat Papan Peringkat →</button>
            </div>
            ${dots}
          </div>`;
      }
      else if (p.type === "announcement") {
        html = `
          <div class="popup-card popup-announce">
            <button class="popup-close" data-popup-close>✕</button>
            <div class="popup-emoji">${p.emoji || "📢"}</div>
            <div class="popup-eyebrow">PENGUMUMAN</div>
            <h2 class="popup-title">${UI.esc(p.title || "Pengumuman")}</h2>

            ${p.image ? `
              <img class="popup-announce-img" src="/${p.image.replace(/^\/?/, "")}"
                  alt="announcement" onerror="this.style.display='none'">
            ` : ""}

            <div class="popup-announce-msg">${UI.esc(p.message || "")}</div>

            <div class="popup-actions">
              <button class="btn btn-red" data-popup-close>Tutup</button>
            </div>
            ${dots}
          </div>`;
      }

      this.container.innerHTML = html;
      this.container.classList.add("show");

      Store.markPopupSeen(p.key);

      this.container.querySelectorAll("[data-popup-close]").forEach((b) => {
        b.addEventListener("click", () => this.next());
      });
      this.container.querySelectorAll("[data-popup-next]").forEach((b) => {
        b.addEventListener("click", () => this.next());
      });
      this.container.querySelectorAll("[data-popup-go-leaderboard]").forEach((b) => {
        b.addEventListener("click", () => {
          this.close();
          location.hash = "/leaderboard";
        });
      });

      const escHandler = (e) => {
        if (e.key === "Escape") {
          document.removeEventListener("keydown", escHandler);
          this.close();
        }
      };
      document.addEventListener("keydown", escHandler);
    }
  };

  function showPopupQueue() {
    const list = Store.popups();
    if (!Array.isArray(list) || list.length === 0) return;
    PopupQueue.show(list);
  }

  function showPopupQueueOnce() {
    if (isAdmin()) return;

    const FLAG = "csa_popup_shown";
    if (localStorage.getItem(FLAG) === "1") return;

    localStorage.setItem(FLAG, "1");

    showPopupQueue();
  }
  Guard.install();
})();