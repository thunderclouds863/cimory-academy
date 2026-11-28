const AdminApp = (() => {
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];

  const MONTH_NAMES = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember"
  ];

  function currentMonthKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  }

  function fmtMonthName(monthKey) {
    if (!monthKey) return "";
    const [y, m] = monthKey.split("-").map(Number);
    return `${MONTH_NAMES[m - 1]} ${y}`;
  }

  function fmtTime(sec) {
    if (!sec && sec !== 0) return "-";
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }
  const fmtDuration = fmtTime;

  function badgeEmoji(rank) {
    return rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🏅";
  }

  function monthOptions(selected) {
    const now = new Date();
    const opts = [];
    for (let i = -6; i <= 1; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = fmtMonthName(key);
      opts.push(`<option value="${key}" ${key === selected ? "selected" : ""}>${label}${i === 0 ? " (bulan ini)" : ""}</option>`);
    }
    return opts.join("");
  }
  async function downloadWithAuth(url, filename) {
    try {
      const token = API.getToken();
      const res = await fetch(url, {
        method: "GET",
        headers: token ? { Authorization: "Bearer " + token } : {}
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objUrl;
      a.download = filename || "download.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(objUrl), 1000);
      if (UI && UI.toast) UI.toast("📄", "Template ter-download", filename);
    } catch (e) {
      alert("Gagal download: " + e.message);
    }
  }

  function openModal({ title, body, actions, onMount }) {
    const mr = document.getElementById("modal-root");
    if (!mr) return;

    mr.innerHTML = `
      <div class="modal-backdrop" id="mb">
        <div class="modal">
          <div class="modal-head">
            <h3>${UI.esc(title)}</h3>
            <button class="modal-close" id="modalClose" type="button" aria-label="Close">✕</button>
          </div>
          <div class="modal-body" id="modalBody">${body}</div>
          <div class="modal-foot" id="modalFoot">
            ${actions.map((a, i) =>
              `<button type="button" class="btn ${a.cls || "btn-ghost"}" data-mact="${i}">${UI.esc(a.label)}</button>`
            ).join("")}
          </div>
        </div>
      </div>`;

    const close = () => {
      mr.innerHTML = "";
      document.removeEventListener("keydown", escHandler);
    };

    $("#modalClose").addEventListener("click", close);

    $("#mb").addEventListener("click", (e) => {
      if (e.target.id === "mb") close();
    });

    const escHandler = (e) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", escHandler);

    mr.querySelectorAll("[data-mact]").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const idx = +btn.dataset.mact;
        const a = actions[idx];
        if (!a) return;
        if (typeof a.onClick === "function") {
          try {
            await a.onClick(close, btn);
          } catch (err) {
            console.error("Modal action error:", err);
            alert(err.message || "Terjadi kesalahan");
          }
        } else {
          close();
        }
      });
    });

    onMount?.(close);
    return close;
  }
  let root = null;
  let admin = null;
  let cache = {
    chapters: [],
    flashcards: [],
    quizzes: [],
    badges: [],
    monthly: []
  };
  let loaded = false;
  let lbMonth = currentMonthKey();

  function shell(active, inner) {
    const nav = [
      ["dashboard",   "🏠", "Ringkasan",       "#/"],
      ["chapters",    "📚", "Chapter & Modul", "#/chapters"],
      ["quiz",        "🧠", "Kuis Chapter",    "#/quiz"],
      ["monthly",     "📅", "Quiz Bulanan",    "#/monthly"],
      ["flashcards",  "💡", "Fun Fact",        "#/flashcards"],
      ["badges",      "🏅", "Badge",           "#/badges"],
      ["users",       "👥", "Progress User",   "#/users"],
      ["leaderboard", "🏆", "Leaderboard",     "#/leaderboard"],
      ["reports",     "📊", "Reports",         "#/reports"] 
    ];

    const navHtml = (items) => items.map(([id, em, label, href]) =>
      `<a class="admin-nav-item ${active === id ? "active" : ""}" href="${href}" data-admnav="${href}">
         <span style="width:22px;text-align:center">${em}</span><span>${label}</span>
       </a>`
    ).join("");

    return `
    <div class="admin-shell">
      <aside class="admin-sidebar" id="admSidebar">
        <div class="admin-brand">
          <img src="${UI.IMG.logo}" alt="Cimory" onerror="this.style.display='none'">
          <div class="txt">Sales Academy<small>ADMIN PANEL</small></div>
        </div>
        <div class="admin-nav-label">KONTEN</div>
        ${navHtml(nav.slice(0, 5))}
        <div class="admin-nav-label">MONITORING</div>
        ${navHtml(nav.slice(5))}
        <div style="flex:1"></div>
        <a class="admin-nav-item" href="#" id="admLogout">
          <span style="width:22px;text-align:center">🚪</span><span>Keluar</span>
        </a>
      </aside>
      <main class="admin-main">
        <header class="admin-topbar">
          <div class="menu-toggle" id="admMenu">☰</div>
          <h1>${titleOf(active)}</h1>
          <span class="role-badge">ADMIN</span>
          <div class="admin-actions">
            <div class="user-chip" style="padding:8px 12px">
              <div class="ava">${UI.initials(admin.name)}</div>
              <div style="min-width:0">
                <div class="u-name">${UI.esc(admin.name)}</div>
                <div class="u-mail">${UI.esc(admin.email)}</div>
              </div>
            </div>
          </div>
        </header>
        <div class="admin-content">${inner}</div>
      </main>
    </div>`;
  }

  function titleOf(active) {
    return {
      dashboard:   "Ringkasan",
      chapters:    "Chapter & Modul",
      quiz:        "Kuis Chapter",
      monthly:     "Quiz Bulanan",
      flashcards:  "Fun Fact",
      badges:      "Badge",
      users:       "Progress User",
      leaderboard: "Leaderboard",
      reports:     "Reports"
    }[active] || "Admin";
  }

  function bindShell() {
    $("#admLogout")?.addEventListener("click", (e) => {
      e.preventDefault();
      Auth.signOut();
      location.reload();
    });
    const sb = $("#admSidebar"), mt = $("#admMenu");
    mt?.addEventListener("click", () => sb.classList.toggle("open"));
    const updateMenu = () => { if (mt) mt.style.display = window.innerWidth <= 940 ? "grid" : "none"; };
    updateMenu();
    window.addEventListener("resize", updateMenu);

    $$("[data-admnav]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = a.dataset.admnav;
        location.hash = href.replace(/^#/, "");
        render();
      });
    });
  }

  async function loadContent() {
    const [chapters, flashcards, quizzes, badges] = await Promise.all([
      API.call("/chapters"),
      API.call("/flashcards"),
      API.call("/quizzes"),
      API.call("/badges")
    ]);
    cache.chapters = chapters || [];
    cache.flashcards = flashcards || [];
    cache.quizzes = quizzes || [];
    cache.badges = badges || [];

    try {
      const m = await API.call("/monthly-quiz/admin/list");
      cache.monthly = Array.isArray(m) ? m : (m?.rows || m?.data || []);
    } catch (e) {
      console.warn("Monthly quiz endpoint belum siap:", e.message);
      cache.monthly = [];
    }

    loaded = true;
  }

  async function viewDashboard() {
    const [users, lbData] = await Promise.all([
      API.call("/progress/admin/all"),
      API.call(`/leaderboard/progress?period=${currentMonthKey()}`).catch(() => ({ list: [] }))
    ]);

    const lb = lbData?.list || [];
    const totalChapters = cache.chapters.length;
    const totalModules = cache.chapters.reduce((a, c) => a + c.modules.length, 0);
    const totalQuizQ = cache.quizzes.reduce((a, q) => a + q.questions.length, 0);
    const activeMonthly = cache.monthly.find((m) => m.is_active && m.month_key === currentMonthKey());

    const stats = `
      <div class="admin-stats">
        <div class="admin-stat"><div class="num">${users.length}</div><div class="lbl">Total User</div></div>
        <div class="admin-stat"><div class="num">${totalChapters}</div><div class="lbl">Chapter</div></div>
        <div class="admin-stat"><div class="num">${totalModules}</div><div class="lbl">Modul</div></div>
        <div class="admin-stat"><div class="num">${totalQuizQ}</div><div class="lbl">Soal Kuis Chapter</div></div>
      </div>`;

    const monthlyBanner = activeMonthly
      ? `<div class="admin-card" style="border-color:var(--gold)">
           <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
             <div style="font-size:36px">📅</div>
             <div style="flex:1;min-width:200px">
               <h2 style="margin:0">${UI.esc(activeMonthly.title)} <span class="badge-live">AKTIF</span></h2>
               <div class="sub" style="margin:4px 0 0">
                 ${activeMonthly.total_questions || 0} soal •
                 ${activeMonthly.attempts_count || 0}/${activeMonthly.total_users || 0} user sudah kerjakan
               </div>
             </div>
             <button class="btn btn-red btn-sm" data-act="goto-monthly">Kelola →</button>
           </div>
         </div>`
      : "";

    const topUsers = lb.slice(0, 5).map((u) => {
      const medal = badgeEmoji(u.rank);
      return `<tr>
        <td style="width:50px;font-size:20px;text-align:center">${medal}</td>
        <td><strong>${UI.esc(u.name)}</strong><br>
            <small style="color:var(--muted)">${UI.esc(u.email)}</small></td>
        <td>🧠 ${u.chapters_played || 0} chapter</td>
        <td style="color:var(--gold);font-weight:700">${u.total_score || 0}</td>
        <td>${fmtDuration(u.total_duration || 0)}</td>
        <td>⭐ ${u.xp || 0}</td>
      </tr>`;
    }).join("");

    return stats + monthlyBanner + `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
          <div>
            <h2 style="margin-bottom:2px">🏆 Top 5 Trainee — ${fmtMonthName(currentMonthKey())}</h2>
            <div class="sub" style="margin:0">Berdasarkan skor kuis chapter bulan ini</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="goto-leaderboard">Lihat Semua →</button>
        </div>
        <table class="data-table">
          <thead><tr><th>#</th><th>User</th><th>Chapter</th><th>Skor</th><th>Waktu</th><th>XP</th></tr></thead>
          <tbody>${topUsers || `<tr><td colspan="6"><div class="admin-empty">Belum ada aktivitas bulan ini</div></td></tr>`}</tbody>
        </table>
      </div>`;
  }

  function viewChapters() {
    const cards = cache.chapters.map((ch, i) => `
      <div class="admin-card">
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">
          <div style="width:52px;height:52px;border-radius:14px;display:grid;place-items:center;font-family:var(--font-d);font-weight:600;font-size:22px;background:var(--red);box-shadow:0 4px 0 var(--red-d)">${i + 1}</div>
          <div style="flex:1;min-width:0">
            <h2 style="margin-bottom:2px">${UI.esc(ch.title)}</h2>
            <div class="sub" style="margin:0">ID: ${ch.id} • ${ch.modules.length} modul</div>
          </div>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-act="edit-chapter" data-id="${ch.id}">✏️ Edit</button>
            <button class="btn btn-ghost btn-sm" data-act="add-module" data-id="${ch.id}">➕ Modul</button>
            <button class="btn btn-danger btn-sm" data-act="del-chapter" data-id="${ch.id}">🗑️</button>
          </div>
        </div>
        <table class="data-table">
          <thead><tr><th style="width:50px">No</th><th>Judul</th><th style="width:100px">Durasi</th><th style="width:120px">Video</th><th style="width:240px"></th></tr></thead>
          <tbody>
            ${ch.modules.length ? ch.modules.map((m) => `
              <tr>
                <td>${m.no}</td>
                <td><strong>${UI.esc(m.title)}</strong></td>
                <td>${m.duration || "-"}</td>
                <td>${m.video ? `<span style="color:var(--green)">✅ Ada</span>` : `<span style="color:var(--muted)">Belum</span>`}</td>
                <td>
                  <div class="row-actions">
                    <button class="btn btn-ghost btn-sm" data-act="edit-module" data-ch="${ch.id}" data-id="${m.id}">✏️</button>
                    <button class="btn btn-ghost btn-sm" data-act="upload-video" data-ch="${ch.id}" data-id="${m.id}">🎬 Upload</button>
                    <button class="btn btn-danger btn-sm" data-act="del-module" data-ch="${ch.id}" data-id="${m.id}">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join("") : `<tr><td colspan="5"><div class="admin-empty">Belum ada modul</div></td></tr>`}
          </tbody>
        </table>
      </div>
    `).join("");

    return `
      <div style="display:flex;gap:12px;margin-bottom:18px">
        <button class="btn btn-red" data-act="add-chapter">➕ Tambah Chapter</button>
      </div>
      ${cards || `<div class="admin-empty"><div class="em">📚</div>Belum ada chapter. Klik "Tambah Chapter".</div>`}
    `;
  }

  function viewQuiz() {
    const rows = cache.chapters.map((ch) => {
      const q = cache.quizzes.find((x) => x.chapterId === ch.id);
      const count = q ? q.questions.length : 0;
      return `<tr>
        <td><strong>${UI.esc(ch.title)}</strong><br><small style="color:var(--muted)">${ch.id}</small></td>
        <td>${q ? UI.esc(q.title) : `<span style="color:var(--muted)">Belum ada kuis</span>`}</td>
        <td>${count} soal</td>
        <td>${q ? `<span style="color:var(--muted)">Min ${q.minScorePct || 60}% • ${Math.round((q.timeLimitSec||300)/60)} mnt</span>` : "-"}</td>
        <td>
          <div class="row-actions">
            ${q ? `<button class="btn btn-ghost btn-sm" data-act="view-quiz" data-ch="${ch.id}">👁️ Lihat Soal</button>` : ""}
            <button class="btn btn-ghost btn-sm" data-act="import-quiz" data-ch="${ch.id}">📥 Import Excel</button>
            ${q ? `<button class="btn btn-danger btn-sm" data-act="del-quiz" data-ch="${ch.id}">🗑️</button>` : ""}
          </div>
        </td>
      </tr>`;
    }).join("");

    return `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:6px">
          <div>
            <h2>Kuis Chapter</h2>
            <div class="sub" style="margin-bottom:0">Upload Excel, lihat soal, atau hapus</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="dl-template" data-type="quiz">📄 Download Template Excel</button>
        </div>
        <table class="data-table" style="margin-top:18px">
          <thead><tr><th>Chapter</th><th>Judul Kuis</th><th>Soal</th><th>Setting</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  }

  function viewMonthly() {
    const list = cache.monthly || [];
    const curMK = currentMonthKey();

    if (!list.length) {
      return `
        <div style="display:flex;gap:12px;margin-bottom:18px">
          <button class="btn btn-red" data-act="add-monthly">➕ Buat Quiz Bulan Baru</button>
        </div>
        <div class="admin-empty">
          <div class="em">📅</div>
          <h2 style="margin:10px 0 6px;color:var(--text)">Belum ada Quiz Bulanan</h2>
          <p>Buat quiz bulanan untuk menguji pengetahuan tim sales setiap bulan.</p>
        </div>`;
    }

    const cards = list.map((m) => {
      const monthKey     = m.month_key || m.monthKey;
      const isActive     = m.is_active ?? m.isActive;
      const totalQ       = m.total_questions ?? m.totalQuestions ?? 0;
      const attemptsCnt  = m.attempts_count ?? m.attemptsCount ?? 0;
      const totalUsers   = m.total_users ?? m.totalUsers ?? 1;
      const minScore     = m.min_score_pct ?? m.minScorePct ?? 60;
      const timeLimit    = m.time_limit_sec ?? m.timeLimitSec ?? 600;

      const isCurrent = monthKey === curMK;
      const status = isActive
        ? (isCurrent ? `<span class="badge-live">🟢 AKTIF</span>` : `<span class="badge-warn">⚠️ Aktif tapi bulan lalu</span>`)
        : `<span class="badge-off">⚪ NONAKTIF</span>`;
      const progress = totalUsers ? Math.round((attemptsCnt / totalUsers) * 100) : 0;

      return `<div class="admin-card monthly-card">
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#3B40D6,#61176b);display:grid;place-items:center;font-size:28px;flex:none">📅</div>
          <div style="flex:1;min-width:220px">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
              <h2 style="margin:0">${UI.esc(m.title)}</h2>
              ${status}
            </div>
            <div class="sub" style="margin:0 0 8px">
              ${fmtMonthName(monthKey)} • ${totalQ} soal • Min ${minScore}% • ${Math.round(timeLimit / 60)} menit
            </div>
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
              <div class="mini-bar" style="min-width:120px;max-width:200px"><i style="width:${progress}%"></i></div>
              <small style="color:var(--muted);font-weight:600">${attemptsCnt}/${totalUsers} user sudah kerjakan (${progress}%)</small>
            </div>
          </div>
          <div class="row-actions" style="flex:none">
            <button class="btn btn-ghost btn-sm" data-act="view-monthly-participants" data-id="${m.id}">👥 Peserta</button>
            <button class="btn btn-ghost btn-sm" data-act="import-monthly" data-id="${m.id}">📥 Import Excel</button>
            <button class="btn btn-ghost btn-sm" data-act="edit-monthly" data-id="${m.id}">✏️ Edit</button>
            <button class="btn btn-ghost btn-sm" data-act="toggle-monthly" data-id="${m.id}">${isActive ? "⏸️ Nonaktifkan" : "▶️ Aktifkan"}</button>
            <button class="btn btn-danger btn-sm" data-act="del-monthly" data-id="${m.id}">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join("");

    return `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <button class="btn btn-red" data-act="add-monthly">➕ Buat Quiz Bulan Baru</button>
        <button class="btn btn-ghost btn-sm" data-act="dl-template" data-type="quiz">📄 Download Template Excel</button>
      </div>
      ${cards}`;
  }
  async function viewLeaderboardNew() {
    const period = lbMonth;
    let data;
    try {
      data = await API.call(`/leaderboard/progress?period=${period}`);
    } catch (e) {
      return `<div class="admin-empty">
        <div class="em">⚠️</div>
        <h2 style="margin:10px 0 6px;color:var(--text)">Gagal load leaderboard</h2>
        <p>${UI.esc(e.message)}</p>
        <button class="btn btn-red" data-act="lb-refresh">🔄 Coba Lagi</button>
      </div>`;
    }

    const list = data.list || [];
    const winners = data.winners || [];
    const prizes = data.prizes || [];
    const config = data.config || {};
    const topN = config.top_n || 3;

    const totalParticipants = list.length;
    const totalAttempts = list.reduce((a, x) => a + (x.chapters_played || 0), 0);
    const topScore = list[0]?.total_score || 0;

    const podium = renderPodium(winners, list);

    const prizeRows = [];
    for (let i = 1; i <= Math.max(topN, prizes.length || 0); i++) {
      const p = prizes.find((x) => x.rank === i);
      prizeRows.push(`<tr>
        <td style="width:60px;text-align:center;font-size:22px">${badgeEmoji(i)}</td>
        <td><strong>${UI.esc(p?.title || `Juara ${i}`)}</strong></td>
        <td>${p ? UI.esc(p.prize) : `<span style="color:var(--muted)">— belum di-set —</span>`}</td>
      </tr>`);
    }
    const prizePanel = `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
          <div>
            <h2 style="margin-bottom:2px">🎁 Hadiah ${fmtMonthName(period)}</h2>
            <div class="sub" style="margin:0">Setting hadiah per rank (rank 1-${Math.max(topN, prizes.length || 3)})</div>
          </div>
          <button class="btn btn-red btn-sm" data-act="lb-edit-prizes">✏️ Edit Hadiah</button>
        </div>
        <table class="data-table">
          <thead><tr><th style="width:80px">Rank</th><th>Judul</th><th>Hadiah</th></tr></thead>
          <tbody>${prizeRows.join("")}</tbody>
        </table>
      </div>`;

    const announcementPanel = `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
          <div>
            <h2 style="margin-bottom:2px">${config.announcement_emoji || "📢"} Announcement</h2>
            <div class="sub" style="margin:0">Popup yang muncul ke semua user saat login</div>
          </div>
          <button class="btn btn-ghost btn-sm" data-act="lb-edit-announcement">✏️ Edit</button>
        </div>
        ${config.announcement
          ? `<div style="background:rgba(255,200,61,.08);border:1px solid rgba(255,200,61,.3);border-radius:12px;padding:14px 16px">
               <div style="font-weight:800;color:var(--gold);margin-bottom:4px">${UI.esc(config.announcement_title || "Pengumuman")}</div>
               <div style="color:var(--text);font-size:14px;line-height:1.5">${UI.esc(config.announcement)}</div>
             </div>`
          : `<div style="color:var(--muted);font-size:13px;padding:14px 0">Belum ada announcement untuk bulan ini.</div>`}
      </div>`;

    const listRows = list.map((u) => `
      <tr>
        <td style="width:60px;text-align:center;font-weight:800;font-family:var(--font-d);font-size:16px">
          ${u.rank <= 3 ? badgeEmoji(u.rank) : u.rank}
        </td>
        <td><strong>${UI.esc(u.name)}</strong><br>
            <small style="color:var(--muted)">${UI.esc(u.email)}</small></td>
        <td>${u.chapters_played} chapter</td>
        <td style="color:var(--gold);font-weight:800;font-size:15px">${u.total_score}</td>
        <td>${fmtTime(u.total_duration)}</td>
        <td>⭐ ${u.xp}</td>
      </tr>`).join("");

    return `
      <!-- Toolbar -->
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px">
        <div style="display:flex;align-items:center;gap:10px">
          <label style="font-size:13px;font-weight:700;color:var(--muted)">Bulan:</label>
          <select id="lbMonthSelect" style="...">
            ${monthOptions(period)}
          </select>
        </div>
        <div style="flex:1"></div>
        <button class="btn btn-ghost btn-sm" data-act="lb-winners-popup-setting">⏰ Atur Tayang Popup</button>
        <button class="btn btn-ghost btn-sm" data-act="lb-view-analytics">📊 Popup Analytics</button>
        <button class="btn btn-red btn-sm" data-act="lb-generate-winners">🔄 Generate Winners</button>
      </div>

      <!-- Stats mini -->
      <div class="admin-stats">
        <div class="admin-stat"><div class="num">${totalParticipants}</div><div class="lbl">Peserta Bulan Ini</div></div>
        <div class="admin-stat"><div class="num">${totalAttempts}</div><div class="lbl">Total Chapter Attempt</div></div>
        <div class="admin-stat"><div class="num" style="color:var(--gold)">${topScore}</div><div class="lbl">Skor Tertinggi</div></div>
        <div class="admin-stat"><div class="num">${winners.length}</div><div class="lbl">Pemenang di-set</div></div>
      </div>

      <!-- Podium -->
      ${podium}

      <!-- Prize + Announcement -->
      ${prizePanel}
      ${announcementPanel}

      <!-- List lengkap -->
      <div class="admin-card">
        <h2>📋 Ranking Lengkap — ${fmtMonthName(period)}</h2>
        <div class="sub">Skor terbaik per chapter, dijumlahkan. Tie-breaker: waktu tercepat.</div>
        <table class="data-table">
          <thead><tr>
            <th style="width:60px">#</th><th>User</th><th>Chapter</th><th>Skor</th><th>Waktu</th><th>XP</th>
          </tr></thead>
          <tbody>${listRows || `<tr><td colspan="6"><div class="admin-empty">Belum ada aktivitas di bulan ini</div></td></tr>`}</tbody>
        </table>
      </div>`;
  }

  function renderPodium(winners, fallbackList) {
    const podiumData = winners.length > 0
      ? winners.slice(0, 3)
      : fallbackList.slice(0, 3).map((u, i) => ({
          rank: i + 1,
          name: u.name,
          email: u.email,
          total_score: u.total_score,
          total_duration: u.total_duration,
          badge: ["gold","silver","bronze"][i],
          badge_emoji: badgeEmoji(i + 1),
          prize_title: null,
          prize_desc: null,
          _preview: true
        }));

    if (podiumData.length === 0) {
      return `<div class="admin-card">
        <h2>🏆 Podium</h2>
        <div class="sub">Pemenang bulan ini</div>
        <div class="admin-empty" style="padding:40px">
          <div class="em">🏅</div>
          Belum ada data pemenang. Klik "Generate Winners" setelah ada attempt.
        </div>
      </div>`;
    }

    const [first, second, third] = [
      podiumData.find((x) => x.rank === 1),
      podiumData.find((x) => x.rank === 2),
      podiumData.find((x) => x.rank === 3)
    ];

    const podCard = (p, place) => {
      if (!p) return `<div class="podium-slot podium-slot-${place} podium-empty"></div>`;
      const cls = `podium-slot podium-slot-${place}`;
      const emoji = badgeEmoji(place);
      const isPreview = p._preview;
      return `<div class="${cls}">
        <div class="podium-emoji">${emoji}</div>
        <div class="podium-name">${UI.esc(p.name)}</div>
        <div class="podium-score">${p.total_score} <small>poin</small></div>
        <div class="podium-time">⏱ ${fmtTime(p.total_duration)}</div>
        ${p.prize_desc ? `<div class="podium-prize">🎁 ${UI.esc(p.prize_desc)}</div>` : ""}
        ${isPreview ? `<div class="podium-preview">PREVIEW</div>` : ""}
      </div>`;
    };

    return `<div class="admin-card">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:14px">
        <div>
          <h2 style="margin-bottom:2px">🏆 Podium ${winners.length ? "" : "(Preview)"}</h2>
          <div class="sub" style="margin:0">
            ${winners.length ? "Pemenang resmi bulan ini" : "Preview top 3 — belum di-generate"}
          </div>
        </div>
      </div>
      <div class="podium-wrap">
        <div class="podium-col">
          ${podCard(second, 2)}
        </div>
        <div class="podium-col">
          ${podCard(first, 1)}
        </div>
        <div class="podium-col">
          ${podCard(third, 3)}
        </div>
      </div>
    </div>`;
  }

  async function modalPrizes(period) {
    let currentPrizes = [];
    try {
      const r = await API.call(`/leaderboard/prizes?period=${period}`);
      currentPrizes = r.prizes || [];
    } catch (e) { /* silent */ }

    const maxRank = Math.max(3, ...currentPrizes.map((p) => p.rank));
    const initRows = [];
    for (let i = 1; i <= maxRank; i++) {
      const p = currentPrizes.find((x) => x.rank === i);
      initRows.push({
        rank: i,
        emoji: p?.emoji || badgeEmoji(i),
        title: p?.title || (i <= 3 ? `Juara ${i}` : `Peringkat ${i}`),
        prize: p?.prize || ""
      });
    }

    const rowHtml = (r) => `
      <div class="prize-row" data-rank="${r.rank}">
        <div class="prize-emoji" style="display:flex;align-items:center;justify-content:center;font-size:20px">${r.emoji}</div>
        <input class="prize-title" type="text" value="${UI.esc(r.title)}" placeholder="Judul">
        <input class="prize-desc" type="text" value="${UI.esc(r.prize)}" placeholder="Hadiah, mis. Voucher 500rb">
        <button class="btn-icon btn-ghost btn-sm prize-del" type="button" title="Hapus rank">🗑️</button>
      </div>`;

    openModal({
      title: `🎁 Edit Hadiah — ${fmtMonthName(period)}`,
      body: `
        <div class="hint" style="margin-bottom:14px">
          Rank 1, 2, 3 otomatis dapat badge 🥇 🥈 🥉. Rank di atas 3 tetap dapat hadiah (tanpa badge).
          Kosongkan <b>Hadiah</b> kalau rank tersebut tidak ada hadiahnya.
        </div>
        <div id="prizeRowsContainer">
          ${initRows.map(rowHtml).join("")}
        </div>
        <button class="btn btn-ghost btn-sm" id="addPrizeRow" style="margin-top:10px">➕ Tambah Rank</button>
      `,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Simpan", cls: "btn-red", onClick: async (close) => {
          const rows = $$("#prizeRowsContainer .prize-row");
          const prizes = [];
          for (const row of rows) {
            const rank = +row.dataset.rank;
            const emoji = badgeEmoji(rank);
            const title = row.querySelector(".prize-title").value.trim();
            const prize = row.querySelector(".prize-desc").value.trim();
            if (!title && !prize) continue;
            prizes.push({ rank, emoji, title: title || `Juara ${rank}`, prize });
          }
          try {
            await API.call("/leaderboard/prizes", {
              method: "POST",
              body: { period, prizes }
            });
            UI.toast("✅", "Hadiah disimpan", `${prizes.length} rank di-set`);
            close();
            await render();
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: (close) => {
        $("#addPrizeRow").addEventListener("click", () => {
          const container = $("#prizeRowsContainer");
          const last = container.querySelector(".prize-row:last-child");
          const nextRank = last ? (+last.dataset.rank + 1) : 1;
          const div = document.createElement("div");
          div.innerHTML = rowHtml({
            rank: nextRank,
            emoji: "🏅",
            title: `Peringkat ${nextRank}`,
            prize: ""
          });
          container.appendChild(div.firstElementChild);
        });

        $("#prizeRowsContainer").addEventListener("click", (e) => {
          const btn = e.target.closest(".prize-del");
          if (!btn) return;
          const rows = $$("#prizeRowsContainer .prize-row");
          if (rows.length <= 1) { alert("Minimal 1 rank"); return; }
          btn.closest(".prize-row").remove();
        });
      }
    });
  }

async function modalAnnouncement(period) {
  let config = {};
  try {
    config = await API.call(`/leaderboard/announcement?period=${period}`);
  } catch (e) { /* silent */ }

  const fmtLocal = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  openModal({
    title: `📢 Announcement — ${fmtMonthName(period)}`,
    body: `
      <div class="hint" style="margin-bottom:14px">
        Pesan ini muncul sebagai popup ke <b>semua user</b> saat login, setelah popup pemenang.
      </div>

      <div class="form-row">
        <label>Emoji</label>
        <input id="annEmoji" type="text" value="${UI.esc(config.emoji || "📢")}" maxlength="4" placeholder="📢">
      </div>

      <div class="form-row">
        <label>Judul</label>
        <input id="annTitle" type="text" value="${UI.esc(config.title || "Pengumuman")}" placeholder="Pengumuman">
      </div>

      <div class="form-row">
        <label>Pesan</label>
        <textarea id="annMsg" rows="4" placeholder="Tulis pesan untuk semua user...">${UI.esc(config.announcement || "")}</textarea>
      </div>

      <div class="form-row">
        <label>Gambar <small>(opsional, maks 5MB)</small></label>
        <div class="file-drop" id="imgDrop" style="padding:16px">
          <div class="fi" style="font-size:24px">🖼️</div>
          <div class="ft" style="font-size:13px">Klik / drop gambar di sini</div>
          <div class="fs" style="font-size:11.5px">JPG / PNG / GIF / WEBP</div>
          <input id="imgFile" type="file" accept="image/*" hidden>
        </div>
        <div id="imgPreviewWrap" style="margin-top:10px; display:${config.image ? "block" : "none"}">
          <img id="imgPreview" src="${config.image ? (/^https?:\/\//i.test(config.image) ? config.image : "/" + config.image.replace(/^\/?/, "")) : ""}"
               style="max-width:100%;border-radius:12px;border:1px solid var(--line-2);max-height:200px">
          <button class="btn btn-ghost btn-sm" id="removeImgBtn" style="margin-top:6px">🗑️ Hapus Gambar</button>
        </div>
        <div class="hint" id="imgStatus" style="margin-top:6px"></div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
        <div class="form-row">
          <label>Mulai Tayang <small>(opsional)</small></label>
          <input id="annStart" type="datetime-local" value="${fmtLocal(config.start)}">
        </div>
        <div class="form-row">
          <label>Selesai Tayang <small>(opsional)</small></label>
          <input id="annEnd" type="datetime-local" value="${fmtLocal(config.end)}">
        </div>
      </div>

      <div class="form-row">
        <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
          <input id="annActive" type="checkbox" ${config.active !== false ? "checked" : ""} style="width:auto">
          <span>Aktifkan announcement</span>
        </label>
        <div class="hint">Kalau dicentang, popup muncul di rentang tanggal di atas. Kalau nggak dicentang, popup nggak muncul sama sekali.</div>
      </div>
    `,
    actions: [
      { label: "Batal", cls: "btn-ghost" },
      { label: "Simpan", cls: "btn-red", onClick: async (close) => {
        const emoji = $("#annEmoji").value.trim() || "📢";
        const title = $("#annTitle").value.trim() || "Pengumuman";
        const announcement = $("#annMsg").value.trim();
        const image = $("#imgPreview").dataset.path || null;
        const start = $("#annStart").value || null;
        const end = $("#annEnd").value || null;
        const active = $("#annActive").checked;

        try {
          await API.call("/leaderboard/announcement", {
            method: "POST",
            body: { period, emoji, title, announcement, image, start, end, active }
          });
          UI.toast("✅", "Announcement disimpan",
            !active ? "Dinonaktifkan" : (announcement ? "Akan muncul di popup user" : "Kosong"));
          close();
          await render();
        } catch (e) { alert(e.message); }
      }}
    ],
    onMount: () => {
      const drop = $("#imgDrop");
      const input = $("#imgFile");
      const preview = $("#imgPreview");
      const previewWrap = $("#imgPreviewWrap");
      const status = $("#imgStatus");

      if (config.image) preview.dataset.path = config.image;

      drop.onclick = () => input.click();
      input.onchange = async () => {
        const file = input.files[0];
        if (!file) return;
        status.textContent = "Mengupload…";
        try {
          const fd = new FormData();
          fd.append("image", file);
          const r = await API.call("/upload/image", { method: "POST", body: fd, raw: true });
          preview.src = /^https?:\/\//i.test(r.path) ? r.path : "/" + r.path.replace(/^\/?/, "");
          preview.dataset.path = r.path;
          previewWrap.style.display = "block";
          status.textContent = "✅ Terupload";
          setTimeout(() => status.textContent = "", 2000);
        } catch (e) {
          status.textContent = "❌ " + e.message;
        }
      };

      $("#removeImgBtn").addEventListener("click", () => {
        preview.src = "";
        preview.dataset.path = "";
        previewWrap.style.display = "none";
        status.textContent = "Gambar dihapus (klik Simpan untuk apply)";
      });
    }
  });
}

  async function modalGenerateWinners(period) {
    let preview;
    try {
      preview = await API.call(`/leaderboard/progress?period=${period}`);
    } catch (e) {
      alert("Gagal load preview: " + e.message);
      return;
    }

    const list = (preview.list || []).slice(0, 3);
    if (list.length === 0) {
      alert("Belum ada attempt di bulan ini. Generate dibatalkan.");
      return;
    }

    const previewHtml = list.map((u, i) => `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:12px;background:rgba(255,255,255,.04);border:1px solid var(--line);margin-bottom:8px">
        <div style="font-size:24px">${badgeEmoji(i + 1)}</div>
        <div style="flex:1">
          <div style="font-weight:700">${UI.esc(u.name)}</div>
          <div style="color:var(--muted);font-size:12px">${UI.esc(u.email)}</div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:800;color:var(--gold);font-size:16px">${u.total_score}</div>
          <div style="color:var(--muted);font-size:12px">⏱ ${fmtTime(u.total_duration)}</div>
        </div>
      </div>`).join("");

    openModal({
      title: "🔄 Generate Winners",
      body: `
        <div style="background:rgba(255,200,61,.08);border:1px solid rgba(255,200,61,.3);border-radius:12px;padding:12px 14px;margin-bottom:16px;font-size:13px;color:#ffe6a3">
          ⚠️ Generate akan <b>menimpa</b> winners yang sudah ada untuk <b>${fmtMonthName(period)}</b>.
          Data ini yang nanti muncul di popup user & halaman leaderboard.
        </div>
        <div style="font-weight:700;margin-bottom:10px">Top 3 berdasarkan data quiz saat ini:</div>
        ${previewHtml}
        <div style="margin-top:16px" class="form-row">
          <label>Jumlah Rank yang Di-generate (Top-N)</label>
          <input id="genTopN" type="number" min="1" max="20" value="3">
          <div class="hint">Biasanya 3 (Gold/Silver/Bronze). Bisa lebih banyak kalau mau juara 4, 5, dst.</div>
        </div>
      `,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "🔄 Generate Sekarang", cls: "btn-red", onClick: async (close) => {
          const topN = Math.max(1, Math.min(20, +$("#genTopN").value || 3));
          try {
            const r = await API.call("/leaderboard/generate-winners", {
              method: "POST",
              body: { period, topN }
            });
            UI.confetti(120);
            UI.toast("✅", "Winners di-generate", `${r.count} pemenang untuk ${fmtMonthName(period)}`);
            close();
            await render();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }
  async function modalWinnersPopupSetting(period) {
    let config = {};
    try {
      config = await API.call(`/leaderboard/winners-popup-setting?period=${period}`);
    } catch (e) { /* silent */ }

    const fmtLocal = (iso) => {
      if (!iso) return "";
      const d = new Date(iso);
      const pad = (n) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    openModal({
      title: `⏰ Atur Tayang Popup Pemenang — ${fmtMonthName(period)}`,
      body: `
        <div class="hint" style="margin-bottom:16px">
          Kontrol kapan <b>popup pemenang bulanan</b> muncul ke user saat login.
          Kalau dimatikan, popup pemenang nggak akan tampil — tapi announcement tetap muncul.
        </div>

        <div class="form-row">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer">
            <input id="wpActive" type="checkbox" ${config.active !== false ? "checked" : ""} style="width:auto">
            <span>Aktifkan popup pemenang</span>
          </label>
          <div class="hint">Kalau nggak dicentang, popup pemenang nggak akan muncul sama sekali bulan ini.</div>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-top:16px">
          <div class="form-row">
            <label>Mulai Tayang <small>(opsional)</small></label>
            <input id="wpStart" type="datetime-local" value="${fmtLocal(config.start)}">
            <div class="hint">Kosongin = langsung tayang</div>
          </div>
          <div class="form-row">
            <label>Selesai Tayang <small>(opsional)</small></label>
            <input id="wpEnd" type="datetime-local" value="${fmtLocal(config.end)}">
            <div class="hint">Kosongin = tayang terus</div>
          </div>
        </div>

        <div class="callout" style="margin-top:12px;font-size:13px">
          <b>Contoh pakai:</b><br>
          • Cuma tayang 1-7 Oktober → Start: <code>2026-10-01T00:00</code>, End: <code>2026-10-07T23:59</code><br>
          • Langsung tayang tanpa batas → Start & End dikosongin<br>
          • Matikan total → uncheck "Aktifkan popup pemenang"
        </div>
      `,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Simpan", cls: "btn-red", onClick: async (close) => {
          const active = $("#wpActive").checked;
          const start = $("#wpStart").value || null;
          const end = $("#wpEnd").value || null;

          try {
            await API.call("/leaderboard/winners-popup-setting", {
              method: "POST",
              body: { period, active, start, end }
            });
            UI.toast("✅", "Setting disimpan",
              !active ? "Popup pemenang dimatikan"
              : (start || end) ? "Popup muncul di rentang tanggal"
              : "Popup muncul tiap login");
            close();
            await render();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }
  async function modalPopupAnalytics(period) {
    let data;
    try {
      data = await API.call(`/leaderboard/popup-analytics?period=${period}`);
    } catch (e) {
      alert("Gagal load analytics: " + e.message);
      return;
    }

    const rows = data.analytics || [];
    const body = rows.length ? `
      <table class="data-table">
        <thead><tr><th>Popup Key</th><th>Dilihat</th><th>Terakhir</th></tr></thead>
        <tbody>
          ${rows.map((r) => `
            <tr>
              <td><code>${UI.esc(r.popup_key)}</code></td>
              <td>${r.view_count}×</td>
              <td><small style="color:var(--muted)">${new Date(r.last_seen).toLocaleString("id-ID")}</small></td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    ` : `<div class="admin-empty" style="padding:40px">Belum ada user yang lihat popup bulan ini.</div>`;

    openModal({
      title: `📊 Popup Analytics — ${fmtMonthName(period)}`,
      body,
      actions: [{ label: "Tutup", cls: "btn-ghost" }]
    });
  }
  function modalMonthlyCreate() {
    const curMK = currentMonthKey();
    const nextMK = (() => {
      const [y, m] = curMK.split("-").map(Number);
      const nm = m === 12 ? 1 : m + 1;
      const ny = m === 12 ? y + 1 : y;
      return `${ny}-${String(nm).padStart(2, "0")}`;
    })();

    openModal({
      title: "Buat Quiz Bulan Baru",
      body: `
        <div class="form-row">
          <label>Bulan</label>
          <select id="mqMonth">
            <option value="${curMK}">${fmtMonthName(curMK)} (bulan ini)</option>
            <option value="${nextMK}">${fmtMonthName(nextMK)} (bulan depan)</option>
          </select>
        </div>
        <div class="form-row">
          <label>Judul Quiz</label>
          <input id="mqTitle" type="text" placeholder="Quiz September 2026">
        </div>
        <div class="form-row">
          <label>Deskripsi <small>(opsional)</small></label>
          <textarea id="mqDesc" placeholder="Info tambahan untuk peserta..."></textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-row">
            <label>Min Skor (%)</label>
            <input id="mqMin" type="number" value="60" min="0" max="100">
          </div>
          <div class="form-row">
            <label>Batas Waktu (menit)</label>
            <input id="mqTime" type="number" value="10" min="1" max="60">
          </div>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Buat", cls: "btn-red", onClick: async (close) => {
          const monthKey = $("#mqMonth").value;
          const title = $("#mqTitle").value.trim();
          const description = $("#mqDesc").value.trim();
          const minScorePct = +$("#mqMin").value;
          const timeLimitSec = (+$("#mqTime").value) * 60;
          if (!title) return alert("Judul wajib diisi");
          try {
            await API.call("/monthly-quiz/admin", {
              method: "POST",
              body: { monthKey, title, description, minScorePct, timeLimitSec }
            });
            close(); await refresh();
            UI.toast("✅", "Quiz bulanan dibuat");
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: () => {
        const autoTitle = (mk) => {
          const [y, m] = mk.split("-").map(Number);
          return `Quiz ${MONTH_NAMES[m - 1]} ${y}`;
        };
        const sel = $("#mqMonth");
        const inp = $("#mqTitle");
        inp.value = autoTitle(sel.value);
        sel.addEventListener("change", () => { inp.value = autoTitle(sel.value); });
        inp.focus();
      }
    });
  }

  function modalMonthlyEdit(m) {
    const monthKey  = m.month_key || m.monthKey;
    const minScore  = m.min_score_pct ?? m.minScorePct ?? 60;
    const timeLimit = Math.round((m.time_limit_sec ?? m.timeLimitSec ?? 600) / 60);

    openModal({
      title: "Edit Quiz Bulanan",
      body: `
        <div class="form-row">
          <label>Bulan <small>(tidak bisa diubah)</small></label>
          <input type="text" value="${fmtMonthName(monthKey)}" disabled>
        </div>
        <div class="form-row">
          <label>Judul Quiz</label>
          <input id="mqTitle" type="text" value="${UI.esc(m.title)}">
        </div>
        <div class="form-row">
          <label>Deskripsi</label>
          <textarea id="mqDesc">${UI.esc(m.description || "")}</textarea>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
          <div class="form-row">
            <label>Min Skor (%)</label>
            <input id="mqMin" type="number" value="${minScore}" min="0" max="100">
          </div>
          <div class="form-row">
            <label>Batas Waktu (menit)</label>
            <input id="mqTime" type="number" value="${timeLimit}" min="1" max="60">
          </div>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Simpan", cls: "btn-red", onClick: async (close) => {
          const title = $("#mqTitle").value.trim();
          const description = $("#mqDesc").value.trim();
          const minScorePct = +$("#mqMin").value;
          const timeLimitSec = (+$("#mqTime").value) * 60;
          if (!title) return alert("Judul wajib diisi");
          try {
            await API.call(`/monthly-quiz/admin/${m.id}`, {
              method: "PUT",
              body: { title, description, minScorePct, timeLimitSec }
            });
            close(); await refresh();
            UI.toast("✅", "Quiz diperbarui");
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  function modalMonthlyImport(m) {
    openModal({
      title: "Import Soal — " + m.title,
      body: `
        <div class="callout" style="margin-bottom:16px;font-size:13px">
          Format kolom: <b>q</b> | <b>option_a</b> | <b>option_b</b> | <b>option_c</b> | <b>option_d</b> | <b>answer</b> (a/b/c/d) | <b>explain</b><br>
          <b>Import akan mengganti semua soal yang sudah ada.</b>
        </div>
        <div class="file-drop" id="dq">
          <div class="fi">📄</div>
          <div class="ft">Klik atau drop file Excel</div>
          <div class="fs">.xlsx</div>
          <input id="qfile" type="file" accept=".xlsx,.xls" hidden>
        </div>
        <div class="hint" id="qstatus" style="margin-top:10px">Belum ada file</div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Import & Ganti", cls: "btn-red", onClick: async (close) => {
          const file = $("#qfile").files[0];
          if (!file) return alert("Pilih file dulu");
          if (!confirm("Yakin? Semua soal lama di quiz ini akan diganti.")) return;
          const fd = new FormData();
          fd.append("file", file);
          fd.append("monthlyId", m.id);
          try {
            const r = await API.call("/upload/excel/monthly-quiz/import", { method: "POST", body: fd, raw: true });
            UI.toast("✅", `${r.count} soal diimport`);
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: () => {
        const drop = $("#dq"), input = $("#qfile");
        drop.onclick = () => input.click();
        input.onchange = () => { if (input.files[0]) $("#qstatus").textContent = input.files[0].name; };
      }
    });
  }

  async function modalMonthlyParticipants(m) {
    let rows = [];
    try {
      const r = await API.call(`/monthly-quiz/admin/${m.id}/attempts`);
      rows = Array.isArray(r) ? r : (r?.rows || r?.data || []);
    } catch (e) {
      alert("Gagal load peserta: " + e.message);
      return;
    }

    const body = rows.length ? `
      <div style="max-height:60vh;overflow:auto">
        <table class="data-table" style="font-size:13px">
          <thead><tr><th>#</th><th>Nama</th><th>Skor</th><th>Waktu</th><th>Status</th></tr></thead>
          <tbody>
            ${rows.map((r, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${UI.esc(r.name)}</strong><br><small style="color:var(--muted)">${UI.esc(r.email)}</small></td>
                <td>${r.correct}/${r.total}</td>
                <td>${fmtTime(r.duration_sec)}</td>
                <td>${r.passed ? '<span style="color:var(--green)">✅ Lulus</span>' : '<span style="color:#ff8a8a">❌ Belum</span>'}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
      <div class="hint" style="margin-top:12px">Total: ${rows.length} peserta</div>
    ` : `<div class="admin-empty"><div class="em">👥</div>Belum ada yang mengerjakan quiz ini.</div>`;

    openModal({
      title: `Peserta — ${m.title}`,
      body,
      actions: [{ label: "Tutup", cls: "btn-ghost" }]
    });
  }

  function modalChapter(chapter = null) {
    const isEdit = !!chapter;
    openModal({
      title: isEdit ? "Edit Chapter" : "Tambah Chapter",
      body: `
        <div class="form-row">
          <label>ID Chapter <small>(unik, tanpa spasi)</small></label>
          <input id="chId" type="text" value="${chapter?.id || ""}" ${isEdit ? "disabled" : ""} placeholder="ch4">
        </div>
        <div class="form-row">
          <label>Nomor Chapter</label>
          <input id="chNo" type="number" value="${chapter?.no || cache.chapters.length + 1}">
        </div>
        <div class="form-row">
          <label>Judul Chapter</label>
          <input id="chTitle" type="text" value="${UI.esc(chapter?.title || "")}" placeholder="Judul chapter...">
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: isEdit ? "Simpan" : "Tambah", cls: "btn-red", onClick: async (close) => {
          const id = $("#chId").value.trim();
          const no = +$("#chNo").value;
          const title = $("#chTitle").value.trim();
          if (!id || !no || !title) return alert("Lengkapi dulu");
          try {
            if (isEdit) {
              await API.call(`/chapters/${id}`, { method: "PUT", body: { title, sort_order: no } });
            } else {
              await API.call("/chapters", { method: "POST", body: { id, no, title, sort_order: no } });
            }
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  function modalModule(chapterId, module = null) {
    const isEdit = !!module;
    openModal({
      title: isEdit ? "Edit Modul" : "Tambah Modul",
      body: `
        <div class="form-row">
          <label>ID Modul</label>
          <input id="mId" type="text" value="${module?.id || ""}" ${isEdit ? "disabled" : ""} placeholder="ch1-m1">
        </div>
        <div class="form-row">
          <label>Nomor</label>
          <input id="mNo" type="number" value="${module?.no || 1}">
        </div>
        <div class="form-row">
          <label>Judul Modul</label>
          <input id="mTitle" type="text" value="${UI.esc(module?.title || "")}">
        </div>
        <div class="form-row">
          <label>Durasi</label>
          <input id="mDur" type="text" value="${module?.duration || ""}" placeholder="5 min">
        </div>
        <div class="form-row">
          <label>Ringkasan / Summary <small>(opsional)</small></label>
          <textarea id="mSum" placeholder="Ringkasan singkat modul...">${UI.esc(module?.summary || "")}</textarea>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: isEdit ? "Simpan" : "Tambah", cls: "btn-red", onClick: async (close) => {
          const id = $("#mId").value.trim();
          const no = +$("#mNo").value;
          const title = $("#mTitle").value.trim();
          const duration = $("#mDur").value.trim();
          const summary = $("#mSum").value.trim();
          if (!id || !no || !title) return alert("Lengkapi dulu");
          try {
            if (isEdit) {
              await API.call(`/chapters/modules/${id}`, { method: "PUT", body: { title, duration, summary } });
            } else {
              await API.call(`/chapters/${chapterId}/modules`, { method: "POST", body: { id, no, title, duration, summary } });
            }
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  function modalUploadVideo(module) {
    openModal({
      title: "Upload Video — " + module.title,
      body: `
        <div class="file-drop" id="vd">
          <div class="fi">🎬</div>
          <div class="ft">Klik atau drop video di sini</div>
          <div class="fs">MP4 / WebM / MOV / MKV • maks 500 MB</div>
          <input id="vfile" type="file" accept="video/*" hidden>
        </div>
        <div class="form-row" style="margin-top:16px">
          <label>Progress</label>
          <div style="height:8px;background:rgba(255,255,255,.1);border-radius:9px;overflow:hidden">
            <div id="vprog" style="height:100%;width:0;background:var(--green);transition:width .2s"></div>
          </div>
          <div class="hint" id="vstatus">Belum ada file</div>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Upload", cls: "btn-red", onClick: async (close) => {
          const file = $("#vfile").files[0];
          if (!file) return alert("Pilih file dulu");
          const fd = new FormData();
          fd.append("video", file);
          const xhr = new XMLHttpRequest();
          xhr.open("POST", (window.CIMORY_CONFIG?.API_BASE || "/api") + "/upload/video");
          xhr.setRequestHeader("Authorization", "Bearer " + API.getToken());
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const p = Math.round((e.loaded / e.total) * 100);
              $("#vprog").style.width = p + "%";
              $("#vstatus").textContent = p + "% terupload";
            }
          };
          xhr.onload = async () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const { path } = JSON.parse(xhr.responseText);
              try {
                await API.call(`/chapters/modules/${module.id}`, {
                  method: "PUT",
                  body: { title: module.title, duration: module.duration, summary: module.summary, video_path: path }
                });
                close(); await refresh();
                UI.toast("🎬", "Video terupload");
              } catch (e) { alert(e.message); }
            } else {
              alert("Upload gagal: " + xhr.responseText);
            }
          };
          xhr.send(fd);
        }}
      ],
      onMount: () => {
        const drop = $("#vd"), input = $("#vfile");
        drop.onclick = () => input.click();
        input.onchange = () => {
          if (input.files[0]) {
            $("#vstatus").textContent = input.files[0].name + " (" + Math.round(input.files[0].size / 1024 / 1024) + " MB)";
          }
        };
        drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
        drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
        drop.addEventListener("drop", (e) => {
          e.preventDefault(); drop.classList.remove("drag");
          if (e.dataTransfer.files[0]) {
            input.files = e.dataTransfer.files;
            $("#vstatus").textContent = e.dataTransfer.files[0].name;
          }
        });
      }
    });
  }

  function modalImportQuiz(chapterId) {
    openModal({
      title: "Import Kuis dari Excel",
      body: `
        <div class="callout" style="margin-bottom:16px;font-size:13px">
          Format kolom: <b>q</b> | <b>option_a</b> | <b>option_b</b> | <b>option_c</b> | <b>option_d</b> | <b>answer</b> (a/b/c/d) | <b>explain</b>
        </div>
        <div class="file-drop" id="dq">
          <div class="fi">📄</div>
          <div class="ft">Klik atau drop file Excel</div>
          <div class="fs">.xlsx</div>
          <input id="qfile" type="file" accept=".xlsx,.xls" hidden>
        </div>
        <div class="hint" id="qstatus" style="margin-top:10px">Belum ada file</div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Import", cls: "btn-red", onClick: async (close) => {
          const file = $("#qfile").files[0];
          if (!file) return alert("Pilih file dulu");
          const fd = new FormData();
          fd.append("file", file);
          fd.append("chapterId", chapterId);
          try {
            const r = await API.call("/upload/excel/quiz/import", { method: "POST", body: fd, raw: true });
            UI.toast("✅", `${r.count} soal diimport`);
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: () => {
        const drop = $("#dq"), input = $("#qfile");
        drop.onclick = () => input.click();
        input.onchange = () => { if (input.files[0]) $("#qstatus").textContent = input.files[0].name; };
      }
    });
  }

  function modalViewQuiz(chapterId) {
    const q = cache.quizzes.find((x) => x.chapterId === chapterId);
    if (!q) return;
    openModal({
      title: "Soal Kuis — " + q.title,
      body: `
        <div style="max-height:60vh;overflow:auto">
          ${q.questions.map((item, i) => `
            <div class="q-editor">
              <div class="q-head"><strong>Soal ${i + 1}</strong></div>
              <div style="font-weight:600;margin-bottom:10px">${UI.esc(item.q)}</div>
              <div style="display:flex;flex-direction:column;gap:6px">
                ${(item.options || []).map((opt, k) => `
                  <div style="display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:10px;background:${k === item.answer ? "rgba(63,191,49,.18)" : "rgba(255,255,255,.03)"};border:1px solid ${k === item.answer ? "var(--green)" : "var(--line)"}">
                    <span style="font-weight:800">${String.fromCharCode(65 + k)}</span>
                    <span style="flex:1">${UI.esc(opt)}</span>
                    ${k === item.answer ? '<span style="color:var(--green);font-weight:800">✓</span>' : ""}
                  </div>
                `).join("")}
              </div>
              ${item.explain ? `<div style="margin-top:10px;color:var(--muted);font-size:13px">💡 ${UI.esc(item.explain)}</div>` : ""}
            </div>
          `).join("")}
        </div>`,
      actions: [{ label: "Tutup", cls: "btn-ghost" }]
    });
  }

  function viewFlashcards() {
    const rows = cache.flashcards.map((f) => `
      <tr>
        <td style="width:60px;font-size:24px;text-align:center">${f.emoji}</td>
        <td><strong>${UI.esc(f.front)}</strong></td>
        <td>${(f.back || []).length} poin</td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-act="edit-flashcard" data-id="${f.id}">✏️</button>
            <button class="btn btn-danger btn-sm" data-act="del-flashcard" data-id="${f.id}">🗑️</button>
          </div>
        </td>
      </tr>`).join("");

    return `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2>Fun Fact (Flashcards)</h2>
            <div class="sub" style="margin-bottom:0">Upload Excel, edit, atau tambah manual</div>
          </div>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" data-act="dl-template" data-type="flashcards">📄 Template Excel</button>
            <button class="btn btn-ghost btn-sm" data-act="import-flashcards">📥 Import Excel</button>
            <button class="btn btn-red btn-sm" data-act="add-flashcard">➕ Tambah Kartu</button>
          </div>
        </div>
        <table class="data-table" style="margin-top:18px">
          <thead><tr><th>Emoji</th><th>Judul Kartu</th><th>Isi</th><th style="width:150px"></th></tr></thead>
          <tbody>${rows || `<tr><td colspan="4"><div class="admin-empty">Belum ada Fun Fact</div></td></tr>`}</tbody>
        </table>
      </div>`;
  }

  function modalImportFlashcards() {
    openModal({
      title: "Import Fun Fact dari Excel",
      body: `
        <div class="callout" style="margin-bottom:16px;font-size:13px">
          Kolom: <b>emoji</b> | <b>front</b> | <b>back1</b> | <b>back2</b> | <b>back3</b>
        </div>
        <div class="file-drop" id="df">
          <div class="fi">📄</div>
          <div class="ft">Klik atau drop file Excel</div>
          <div class="fs">.xlsx</div>
          <input id="ffile" type="file" accept=".xlsx,.xls" hidden>
        </div>
        <div class="hint" id="fstatus" style="margin-top:10px">Belum ada file</div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Import", cls: "btn-red", onClick: async (close) => {
          const file = $("#ffile").files[0];
          if (!file) return alert("Pilih file dulu");
          const fd = new FormData();
          fd.append("file", file);
          try {
            const r = await API.call("/upload/excel/flashcards/import", { method: "POST", body: fd, raw: true });
            UI.toast(r.count === 0 ? "⚠️" : "✅", `${r.count} kartu diimport`);
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: () => {
        const drop = $("#df"), input = $("#ffile");
        drop.onclick = () => input.click();
        input.onchange = () => { if (input.files[0]) $("#fstatus").textContent = input.files[0].name; };
      }
    });
  }

  function modalFlashcard(fc = null) {
    const isEdit = !!fc;
    openModal({
      title: isEdit ? "Edit Kartu" : "Tambah Kartu",
      body: `
        <div class="form-row">
          <label>Emoji</label>
          <input id="fe" type="text" value="${fc?.emoji || "💡"}" maxlength="4">
        </div>
        <div class="form-row">
          <label>Judul Depan</label>
          <input id="ff" type="text" value="${UI.esc(fc?.front || "")}">
        </div>
        <div class="form-row">
          <label>Isi Belakang <small>(satu baris = satu poin)</small></label>
          <textarea id="fb" rows="4">${(fc?.back || []).join("\n")}</textarea>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: isEdit ? "Simpan" : "Tambah", cls: "btn-red", onClick: async (close) => {
          const emoji = $("#fe").value.trim() || "💡";
          const front = $("#ff").value.trim();
          const back = $("#fb").value.split("\n").map((s) => s.trim()).filter(Boolean);
          if (!front) return alert("Judul wajib");
          try {
            if (isEdit) {
              await API.call(`/flashcards/${fc.id}`, { method: "PUT", body: { emoji, front, back } });
            } else {
              const id = "fc_" + Date.now();
              await API.call("/flashcards", { method: "POST", body: { id, emoji, front, back } });
            }
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  async function viewBadges() {
    const badges = await API.call("/badges/admin/list");
    const rows = badges.map((b) => {
      const pct = b.total_users ? Math.round((b.earned_count / b.total_users) * 100) : 0;
      return `<tr>
        <td style="width:60px;font-size:26px;text-align:center">${b.emoji || "🏅"}</td>
        <td>
          <strong>${UI.esc(b.title)}</strong>
          <div style="font-size:12px;color:var(--muted);margin-top:4px">
            ID: <code style="background:rgba(255,255,255,.06);padding:2px 6px;border-radius:4px">${UI.esc(b.id)}</code>
          </div>
        </td>
        <td>
          <span style="display:inline-block;padding:3px 10px;border-radius:999px;background:rgba(59,64,214,.15);font-size:12px;font-weight:700">
            ${UI.esc(b.type)}
          </span>
        </td>
        <td style="text-align:center">${b.threshold}</td>
        <td>
          <div style="font-size:13px">${b.earned_count} / ${b.total_users} user</div>
          <div class="mini-bar" style="margin-top:5px"><i style="width:${pct}%"></i></div>
          <small style="color:var(--muted)">${pct}%</small>
        </td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-act="edit-badge" data-id="${UI.esc(b.id)}">✏️</button>
            <button class="btn btn-ghost btn-sm" data-act="badge-owners" data-id="${UI.esc(b.id)}" data-title="${UI.esc(b.title)}">👥</button>
            <button class="btn btn-danger btn-sm" data-act="del-badge" data-id="${UI.esc(b.id)}" data-title="${UI.esc(b.title)}" data-count="${b.earned_count}">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    return `
      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
          <div>
            <h2>Kelola Badge</h2>
            <div class="sub" style="margin-bottom:0">${badges.length} badge • tambah, edit, atau hapus badge</div>
          </div>
          <button class="btn btn-red btn-sm" data-act="add-badge">➕ Tambah Badge</button>
        </div>
        <table class="data-table" style="margin-top:18px">
          <thead>
            <tr>
              <th style="width:60px">Emoji</th>
              <th>Judul</th>
              <th>Type</th>
              <th style="text-align:center">Threshold</th>
              <th>Diperoleh</th>
              <th style="width:180px"></th>
            </tr>
          </thead>
          <tbody>${rows || `<tr><td colspan="6"><div class="admin-empty">Belum ada badge</div></td></tr>`}</tbody>
        </table>
      </div>`;
  }

  function modalBadge(badge = null) {
    const isEdit = !!badge;
    const typeOptions = [
      ["modules", "Modul Selesai"],
      ["streak", "Hari Beruntun"],
      ["chapter", "Chapter Selesai"],
      ["perfectQuiz", "Nilai Sempurna Kuis"],
      ["flashcards", "Fun Fact Dibuka"],
      ["allModules", "Semua Modul Selesai"]
    ];

    openModal({
      title: isEdit ? "Edit Badge" : "Tambah Badge",
      body: `
        <div class="form-row">
          <label>ID Badge <small>(unik, tanpa spasi)</small></label>
          <input id="bgId" type="text" value="${UI.esc(badge?.id || "")}" ${isEdit ? "disabled" : ""} placeholder="misal: rocket-star">
        </div>
        <div class="form-row">
          <label>Emoji</label>
          <input id="bgEmoji" type="text" value="${UI.esc(badge?.emoji || "🏅")}" maxlength="4">
        </div>
        <div class="form-row">
          <label>Judul Badge</label>
          <input id="bgTitle" type="text" value="${UI.esc(badge?.title || "")}">
        </div>
        <div class="form-row">
          <label>Deskripsi <small>(opsional)</small></label>
          <input id="bgDesc" type="text" value="${UI.esc(badge?.descr || badge?.desc || "")}">
        </div>
        <div class="form-row">
          <label>Type Kondisi</label>
          <select id="bgType">
            ${typeOptions.map(([v, l]) =>
              `<option value="${v}" ${badge?.type === v ? "selected" : ""}>${l} (${v})</option>`
            ).join("")}
          </select>
        </div>
        <div class="form-row">
          <label>Threshold</label>
          <input id="bgThreshold" type="number" min="1" value="${badge?.threshold || 1}">
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: isEdit ? "Simpan" : "Tambah", cls: "btn-red", onClick: async (close) => {
          const id = $("#bgId").value.trim();
          const emoji = $("#bgEmoji").value.trim() || "🏅";
          const title = $("#bgTitle").value.trim();
          const desc = $("#bgDesc").value.trim();
          const type = $("#bgType").value;
          const threshold = +$("#bgThreshold").value || 1;
          if (!id || !title) return alert("ID dan Judul wajib diisi");
          try {
            if (isEdit) {
              await API.call(`/badges/admin/${encodeURIComponent(id)}`, {
                method: "PUT",
                body: { emoji, title, desc, type, threshold }
              });
            } else {
              await API.call("/badges/admin", {
                method: "POST",
                body: { id, emoji, title, desc, type, threshold }
              });
            }
            close(); await refresh();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  async function modalBadgeOwners(badgeId, badgeTitle) {
    let owners = [];
    try {
      owners = await API.call(`/badges/admin/${encodeURIComponent(badgeId)}/owners`);
    } catch (e) { alert("Gagal memuat: " + e.message); return; }

    const list = owners.length
      ? owners.map((u) => `
          <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;border-bottom:1px solid var(--line)">
            <div>
              <div style="font-weight:700">${UI.esc(u.name)}</div>
              <div style="color:var(--muted);font-size:12px">${UI.esc(u.email)}</div>
            </div>
            <div style="font-size:11.5px;color:var(--muted)">
              ${new Date(u.earned_at).toLocaleDateString("id-ID")}
            </div>
          </div>`).join("")
      : `<div class="admin-empty" style="padding:30px">Belum ada user yang dapat badge ini.</div>`;

    openModal({
      title: `👥 Pemilik Badge: ${badgeTitle}`,
      body: `
        <div style="margin-bottom:12px;color:var(--muted);font-size:13px">
          ${owners.length} user sudah memperoleh badge ini
        </div>
        <div style="max-height:50vh;overflow:auto;border:1px solid var(--line);border-radius:12px">
          ${list}
        </div>`,
      actions: [{ label: "Tutup", cls: "btn-ghost" }]
    });
  }

  async function viewUsers() {
    const users = await API.call("/progress/admin/all");

    const stats = (() => {
      const total = users.length;
      const admins = users.filter((u) => u.role === "admin").length;
      const active = users.filter((u) => {
        if (!u.last_active) return false;
        const d = new Date(u.last_active);
        const days = (Date.now() - d.getTime()) / 86400000;
        return days <= 7;
      }).length;
      return { total, admins, active };
    })();

    const rows = users.map((u) => {
      const pct = u.modules_total ? Math.round((u.modules_done / u.modules_total) * 100) : 0;
      const isAdmin = u.role === "admin";
      const roleBadge = isAdmin
        ? `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(255,200,61,.15);border:1px solid rgba(255,200,61,.4);color:var(--gold);font-size:10.5px;font-weight:800;letter-spacing:.06em">ADMIN</span>`
        : `<span style="display:inline-block;padding:2px 8px;border-radius:999px;background:rgba(59,64,214,.15);border:1px solid rgba(59,64,214,.4);color:#a8adff;font-size:10.5px;font-weight:800;letter-spacing:.06em">USER</span>`;

      return `<tr>
        <td>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="width:34px;height:34px;border-radius:50%;background:${isAdmin ? "var(--gold)" : "var(--blue)"};display:grid;place-items:center;font-family:var(--font-d);font-weight:700;font-size:13px;color:${isAdmin ? "#2a1a00" : "#fff"};flex:none">
              ${UI.initials(u.name)}
            </div>
            <div style="min-width:0">
              <div style="font-weight:700">${UI.esc(u.name)}</div>
              <div style="color:var(--muted);font-size:12px">${UI.esc(u.email)}</div>
            </div>
          </div>
        </td>
        <td>${roleBadge}</td>
        <td>
          <div class="mini-bar"><i style="width:${pct}%"></i></div>
          <small style="color:var(--muted)">${u.modules_done}/${u.modules_total} • ${pct}%</small>
        </td>
        <td>⭐ ${u.xp}</td>
        <td>🔥 ${u.streak}</td>
        <td>🧠 ${u.quizzes_passed}</td>
        <td><small style="color:var(--muted)">${u.last_active || "-"}</small></td>
        <td>
          <div class="row-actions">
            <button class="btn btn-ghost btn-sm" data-act="edit-user" data-id="${u.id}" title="Edit user">✏️</button>
            <button class="btn btn-ghost btn-sm" data-act="reset-pw" data-id="${u.id}" data-name="${UI.esc(u.name)}" title="Reset password">🔑</button>
            <button class="btn btn-danger btn-sm" data-act="del-user" data-id="${u.id}" data-name="${UI.esc(u.name)}" title="Hapus user">🗑️</button>
          </div>
        </td>
      </tr>`;
    }).join("");

    return `
      <div class="admin-stats" style="margin-bottom:20px">
        <div class="admin-stat"><div class="num">${stats.total}</div><div class="lbl">Total User</div></div>
        <div class="admin-stat"><div class="num">${stats.admins}</div><div class="lbl">Admin</div></div>
        <div class="admin-stat"><div class="num">${stats.total - stats.admins}</div><div class="lbl">User Biasa</div></div>
        <div class="admin-stat"><div class="num" style="color:var(--green)">${stats.active}</div><div class="lbl">Aktif 7 Hari Terakhir</div></div>
      </div>

      <div class="admin-card">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:16px">
          <div>
            <h2 style="margin-bottom:2px">Kelola User</h2>
            <div class="sub" style="margin:0">${users.length} user terdaftar</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <button class="btn btn-ghost btn-sm" data-act="dl-template" data-type="users">📄 Template Excel</button>
            <button class="btn btn-ghost btn-sm" data-act="import-users">📥 Import Massal</button>
            <button class="btn btn-red btn-sm" data-act="add-user">➕ Tambah User</button>
          </div>
        </div>
        <div style="overflow-x:auto">
          <table class="data-table">
            <thead><tr>
              <th>User</th>
              <th style="width:90px">Role</th>
              <th style="width:150px">Progress</th>
              <th style="width:70px">XP</th>
              <th style="width:70px">Streak</th>
              <th style="width:90px">Kuis</th>
              <th style="width:110px">Aktif</th>
              <th style="width:130px"></th>
            </tr></thead>
            <tbody>${rows || `<tr><td colspan="8"><div class="admin-empty">Belum ada user</div></td></tr>`}</tbody>
          </table>
        </div>
      </div>`;
  }

  function modalAddUser() {
    openModal({
      title: "➕ Tambah User Baru",
      body: `
        <div class="form-row">
          <label>Nama Lengkap</label>
          <input id="nuName" type="text" placeholder="misal: Budi Santoso" autocomplete="off">
        </div>
        <div class="form-row">
          <label>Email Kantor</label>
          <input id="nuEmail" type="email" placeholder="nama@cimory.com" autocomplete="off">
          <div class="hint">Harus unik, tidak boleh sama dengan user lain.</div>
        </div>
        <div class="form-row">
          <label>Password Awal</label>
          <input id="nuPassword" type="text" placeholder="minimal 6 karakter" autocomplete="off">
          <div class="hint">Beri tahu user password ini — mereka bisa ganti sendiri setelah login.</div>
        </div>
        <div class="form-row">
          <label>Role</label>
          <select id="nuRole">
            <option value="user">User biasa</option>
            <option value="admin">Admin</option>
          </select>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Tambah User", cls: "btn-red", onClick: async (close) => {
          const name = $("#nuName").value.trim();
          const email = $("#nuEmail").value.trim().toLowerCase();
          const password = $("#nuPassword").value;
          const role = $("#nuRole").value;

          if (!name || name.length < 2) return alert("Nama minimal 2 karakter");
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return alert("Email tidak valid");
          if (!password || password.length < 6) return alert("Password minimal 6 karakter");

          try {
            await API.call("/progress/admin/users", {
              method: "POST",
              body: { name, email, password, role }
            });
            UI.toast("✅", "User ditambahkan", `${name} (${role})`);
            close();
            await refresh();
          } catch (e) { alert(e.message); }
        }}
      ],
      onMount: () => {
        $("#nuName").focus();
        ["nuName", "nuEmail", "nuPassword"].forEach((id) => {
          $("#" + id).addEventListener("keydown", (e) => {
            if (e.key === "Enter") $("[data-mact='1']").click();
          });
        });
      }
    });
  }

  function modalEditUser(user) {
    openModal({
      title: "✏️ Edit User",
      body: `
        <div class="form-row">
          <label>Nama Lengkap</label>
          <input id="euName" type="text" value="${UI.esc(user.name)}">
        </div>
        <div class="form-row">
          <label>Email <small>(tidak bisa diubah)</small></label>
          <input type="email" value="${UI.esc(user.email)}" disabled>
        </div>
        <div class="form-row">
          <label>Role</label>
          <select id="euRole">
            <option value="user" ${user.role === "user" ? "selected" : ""}>User biasa</option>
            <option value="admin" ${user.role === "admin" ? "selected" : ""}>Admin</option>
          </select>
        </div>
        <div class="hint" style="margin-top:-4px">
          Untuk ganti password, gunakan tombol 🔑 Reset Password.
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Simpan", cls: "btn-red", onClick: async (close) => {
          const name = $("#euName").value.trim();
          const role = $("#euRole").value;
          if (!name || name.length < 2) return alert("Nama minimal 2 karakter");
          try {
            await API.call(`/progress/admin/users/${user.id}`, {
              method: "PUT",
              body: { name, role }
            });
            UI.toast("✅", "User diperbarui");
            close();
            await refresh();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  function modalImportUsers() {
    openModal({
      title: "📥 Import User Massal",
      body: `
        <div class="callout" style="margin-bottom:16px;font-size:13px">
          <b>Format kolom:</b> <code>name</code> | <code>email</code> | <code>password</code><br>
          Baris pertama = header. Baris berikutnya = data user.<br>
          Password <b>otomatis di-hash</b> saat import.
          <div style="margin-top:10px">
            <button class="btn btn-ghost btn-sm" data-act="dl-template" data-type="users" type="button" style="pointer-events:auto">
              📄 Download Template Excel
            </button>
          </div>
        </div>

        <div class="form-row">
          <label>Password Default <small>(opsional — untuk user yang kolom password-nya kosong)</small></label>
          <input id="impDefaultPw" type="text" placeholder="misal: cimory2026" autocomplete="off">
          <div class="hint">Kalau diisi, user dengan password kosong akan pakai password ini.</div>
        </div>

        <div class="file-drop" id="du">
          <div class="fi">📄</div>
          <div class="ft">Klik atau drop file Excel di sini</div>
          <div class="fs">Format .xlsx • maks 10 MB</div>
          <input id="ufile" type="file" accept=".xlsx,.xls" hidden>
        </div>
        <div class="hint" id="ustatus" style="margin-top:10px">Belum ada file</div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Import Sekarang", cls: "btn-red", onClick: async (close) => {
          const file = $("#ufile").files[0];
          if (!file) return alert("Pilih file dulu");
          if (!confirm("Yakin import user dari file ini? Email yang sudah ada akan dilewati.")) return;

          const fd = new FormData();
          fd.append("file", file);
          const defaultPw = $("#impDefaultPw").value.trim();
          if (defaultPw) fd.append("defaultPassword", defaultPw);

          const btn = $("[data-mact='1']");
          btn.disabled = true;
          btn.textContent = "Mengimport…";

          try {
            const r = await API.call("/upload/excel/users/import", {
              method: "POST",
              body: fd,
              raw: true
            });

            const errList = (r.errors || []).slice(0, 15).map((e) =>
              `<li style="color:#ff9a9a;font-size:12.5px">Baris ${e.row} (${UI.esc(e.email)}): ${UI.esc(e.reason)}</li>`
            ).join("");
            const more = (r.errors || []).length > 15
              ? `<li style="color:var(--muted);font-size:12px">…dan ${r.errors.length - 15} error lain.</li>`
              : "";

            close();
            if (r.created > 0) {
              UI.confetti(120);
            }
            UI.toast(
              r.created > 0 ? "✅" : "⚠️",
              `${r.created} user diimport`,
              r.skipped > 0 ? `${r.skipped} dilewati (email sudah ada)` : ""
            );

            openModal({
              title: "Hasil Import User",
              body: `
                <div class="admin-stats" style="grid-template-columns:repeat(3,1fr);margin-bottom:16px">
                  <div class="admin-stat"><div class="num" style="color:var(--green)">${r.created || 0}</div><div class="lbl">Berhasil Dibuat</div></div>
                  <div class="admin-stat"><div class="num" style="color:var(--gold)">${r.skipped || 0}</div><div class="lbl">Dilewati (Duplikat)</div></div>
                  <div class="admin-stat"><div class="num" style="color:var(--red)">${(r.errors || []).length}</div><div class="lbl">Error</div></div>
                </div>
                ${(r.errors || []).length
                  ? `<div style="margin-top:14px">
                      <div style="font-weight:700;margin-bottom:8px;color:#ff9a9a">Daftar Error:</div>
                      <ul style="margin:0;padding-left:20px">${errList}${more}</ul>
                    </div>`
                  : `<div style="color:var(--green);text-align:center;padding:20px;font-weight:700">🎉 Semua user berhasil diimport tanpa error!</div>`}
              `,
              actions: [{ label: "Tutup", cls: "btn-red" }]
            });

            await refresh();
          } catch (e) {
            btn.disabled = false;
            btn.textContent = "Import Sekarang";
            alert("Gagal import: " + e.message);
          }
        }}
      ],
      onMount: () => {
        const drop = $("#du"), input = $("#ufile");
        drop.onclick = () => input.click();
        input.onchange = () => {
          if (input.files[0]) {
            $("#ustatus").textContent = input.files[0].name + " (" +
              Math.round(input.files[0].size / 1024) + " KB)";
          }
        };
        drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("drag"); });
        drop.addEventListener("dragleave", () => drop.classList.remove("drag"));
        drop.addEventListener("drop", (e) => {
          e.preventDefault(); drop.classList.remove("drag");
          if (e.dataTransfer.files[0]) {
            input.files = e.dataTransfer.files;
            $("#ustatus").textContent = e.dataTransfer.files[0].name;
          }
        });
      }
    });
  }
  function modalResetPassword(user) {
    openModal({
      title: "Reset Password — " + user.name,
      body: `
        <div class="form-row">
          <label>Password Baru</label>
          <input id="rpw" type="text" placeholder="Minimal 6 karakter">
          <div class="hint">Kasih tahu user password barunya supaya mereka bisa login.</div>
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Reset", cls: "btn-red", onClick: async (close) => {
          const newPassword = $("#rpw").value.trim();
          if (newPassword.length < 6) return alert("Minimal 6 karakter");
          try {
            await API.call(`/progress/admin/users/${user.id}/reset-password`, { method: "POST", body: { newPassword } });
            UI.toast("🔑", "Password direset", user.name + " → " + newPassword);
            close();
          } catch (e) { alert(e.message); }
        }}
      ]
    });
  }

  /* =========================================================
    REPORTS — Admin
    ========================================================= */
  async function viewReports() {
    const reports = await API.call("/reports/admin/all");

    const header = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:18px;flex-wrap:wrap">
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn btn-red" data-act="add-report">➕ Tambah Report</button>
          <button class="btn btn-ghost" data-act="import-reports">📥 Import dari Excel</button>
        </div>
        <div class="hint" style="margin:0">${reports.length} report</div>
      </div>`;

    if (!reports.length) {
      return header + `
        <div class="admin-empty">
          <div class="em">📊</div>
          <h2 style="margin:10px 0 6px;color:var(--text)">Belum Ada Report</h2>
          <p>Embed dashboard Power BI biar bisa diakses user tertentu.</p>
        </div>`;
    }

    const cards = reports.map((r) => {
      const inactive = !r.is_active;
      return `<div class="admin-card" style="${inactive ? "opacity:.55" : ""}">
        <div style="display:flex;align-items:flex-start;gap:16px;flex-wrap:wrap">
          <div style="width:60px;height:60px;border-radius:16px;background:linear-gradient(135deg,#3B40D6,#61176b);display:grid;place-items:center;font-size:28px;flex:none">
            ${UI.esc(r.icon || "📊")}
          </div>
          <div style="flex:1;min-width:220px">
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:4px">
              <h2 style="margin:0">${UI.esc(r.title)}</h2>
              ${inactive ? `<span class="badge-off">⚪ NONAKTIF</span>` : `<span class="badge-live">🟢 AKTIF</span>`}
            </div>
            <div class="sub" style="margin:0 0 6px">${UI.esc(r.description || "Tanpa deskripsi")}</div>
            <div style="font-size:12.5px;color:var(--muted);font-weight:600">
              🔗 <code>${UI.esc(r.slug)}</code> •
              🔐 ${r.access_count} user punya akses •
              👁️ ${r.view_count}× dibuka
            </div>
          </div>
          <div class="row-actions" style="flex:none">
            <button class="btn btn-ghost btn-sm" data-act="report-access" data-id="${r.id}" data-title="${UI.esc(r.title)}">🔐 Set Akses</button>
            <button class="btn btn-ghost btn-sm" data-act="report-analytics" data-id="${r.id}" data-title="${UI.esc(r.title)}">📈 Analytics</button>
            <button class="btn btn-ghost btn-sm" data-act="edit-report" data-id="${r.id}">✏️</button>
            <button class="btn btn-ghost btn-sm" data-act="toggle-report" data-id="${r.id}">${inactive ? "▶️ Aktifkan" : "⏸️ Nonaktifkan"}</button>
            <button class="btn btn-danger btn-sm" data-act="del-report" data-id="${r.id}" data-title="${UI.esc(r.title)}">🗑️</button>
          </div>
        </div>
      </div>`;
    }).join("");

    return header + cards;
  }

  function modalReport(report = null) {
    const isEdit = !!report;

    const autoSlug = (t) => String(t || "")
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 60);

    openModal({
      title: isEdit ? "✏️ Edit Report" : "➕ Tambah Report Baru",
      body: `
        <div class="form-row">
          <label>Judul Report</label>
          <input id="rpTitle" type="text" value="${UI.esc(report?.title || "")}" placeholder="misal: Sales Dashboard">
        </div>
        <div class="form-row">
          <label>Slug <small>(untuk URL, otomatis dari judul)</small></label>
          <input id="rpSlug" type="text" value="${UI.esc(report?.slug || "")}" ${isEdit ? "" : ""} placeholder="sales-dashboard">
          <div class="hint">Hanya huruf kecil, angka, dan tanda minus (-).</div>
        </div>
        <div class="form-row">
          <label>Deskripsi <small>(opsional)</small></label>
          <textarea id="rpDesc" placeholder="Deskripsi singkat...">${UI.esc(report?.description || "")}</textarea>
        </div>
        <div class="form-row">
          <label>Icon (emoji)</label>
          <input id="rpIcon" type="text" value="${UI.esc(report?.icon || "📊")}" maxlength="4">
        </div>
        <div class="form-row">
          <label>Embed URL Power BI</label>
          <textarea id="rpUrl" placeholder="https://app.powerbi.com/view?r=... atau paste full iframe code" style="min-height:80px">${UI.esc(report?.embed_url || "")}</textarea>
          <div class="hint">
            Paste link atau full iframe code dari Power BI.<br>
            Kalau iframe, sistem otomatis ambil <code>src</code>-nya.
          </div>
        </div>
        <div class="form-row">
          <label>Urutan</label>
          <input id="rpOrder" type="number" value="${report?.sort_order || 0}">
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: isEdit ? "Simpan" : "Tambah", cls: "btn-red", onClick: async (close, btn) => {
          const title = $("#rpTitle").value.trim();
          const slug = $("#rpSlug").value.trim().toLowerCase();
          const description = $("#rpDesc").value.trim();
          const icon = $("#rpIcon").value.trim() || "📊";
          const embedUrl = $("#rpUrl").value.trim();
          const sort_order = +$("#rpOrder").value || 0;

          if (!title || !slug || !embedUrl) return alert("Judul, slug, dan embed URL wajib");

          btn.disabled = true;
          btn.textContent = "Menyimpan…";

          try {
            if (isEdit) {
              await API.call(`/reports/admin/${report.id}`, {
                method: "PUT",
                body: { title, description, embedUrl, icon, sort_order }
              });
              UI.toast("✅", "Report diperbarui");
            } else {
              await API.call("/reports/admin", {
                method: "POST",
                body: { slug, title, description, embedUrl, icon, sort_order }
              });
              UI.toast("✅", "Report ditambahkan");
            }
            close();
            await refresh();
          } catch (e) {
            btn.disabled = false;
            btn.textContent = isEdit ? "Simpan" : "Tambah";
            alert(e.message);
          }
        }}
      ],
      onMount: () => {
        // Auto-slug dari judul (hanya kalau slug masih kosong)
        if (!isEdit) {
          const t = $("#rpTitle");
          const s = $("#rpSlug");
          t.addEventListener("input", () => {
            if (!s.dataset.touched) s.value = autoSlug(t.value);
          });
          s.addEventListener("input", () => { s.dataset.touched = "1"; });
        }
        $("#rpTitle").focus();
      }
    });
  }

  async function modalReportAccess(reportId, reportTitle) {
    let data;
    try {
      data = await API.call(`/reports/admin/${reportId}/access`);
    } catch (e) {
      alert("Gagal load akses: " + e.message);
      return;
    }

    const users = data.users || [];

    const userRow = (u) => `
      <label class="access-row" data-name="${UI.esc(u.name.toLowerCase())}" data-email="${UI.esc(u.email.toLowerCase())}">
        <input type="checkbox" value="${u.id}" ${u.granted ? "checked" : ""}>
        <div style="flex:1;min-width:0">
          <div style="font-weight:700;font-size:14px">${UI.esc(u.name)}</div>
          <div style="color:var(--muted);font-size:12px">${UI.esc(u.email)}</div>
        </div>
      </label>`;

    openModal({
      title: `🔐 Akses Report: ${UI.esc(reportTitle)}`,
      body: `
        <div class="hint" style="margin-bottom:12px">
          Pilih user yang boleh lihat report ini. User lain nggak akan lihat menu ini di sidebar mereka.
        </div>
        <div class="form-row" style="margin-bottom:12px">
          <input id="raSearch" type="text" placeholder="🔍 Cari nama / email..." autocomplete="off">
        </div>
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
          <button class="btn btn-ghost btn-sm" type="button" id="raSelectAll">✓ Pilih Semua</button>
          <button class="btn btn-ghost btn-sm" type="button" id="raClearAll">✗ Kosongkan</button>
          <div style="flex:1"></div>
          <div style="font-size:12.5px;font-weight:700;color:var(--gold)">
            Terpilih: <span id="raCount">0</span>
          </div>
        </div>
        <div id="raList" style="max-height:45vh;overflow:auto;border:1px solid var(--line);border-radius:12px;background:rgba(0,0,0,.15);padding:4px">
          ${users.length ? users.map(userRow).join("") : `<div class="admin-empty" style="padding:30px">Belum ada user</div>`}
        </div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Simpan Akses", cls: "btn-red", onClick: async (close, btn) => {
          const checked = $$("#raList input[type='checkbox']:checked").map((c) => +c.value);
          btn.disabled = true;
          btn.textContent = "Menyimpan…";
          try {
            const r = await API.call(`/reports/admin/${reportId}/access`, {
              method: "POST",
              body: { userIds: checked }
            });
            UI.toast("✅", "Akses disimpan", `${r.granted} user`);
            close();
            await refresh();
          } catch (e) {
            btn.disabled = false;
            btn.textContent = "Simpan Akses";
            alert(e.message);
          }
        }}
      ],
      onMount: () => {
        const updateCount = () => {
          const n = $$("#raList input[type='checkbox']:checked").length;
          $("#raCount").textContent = n;
        };
        updateCount();

        // Checkbox change
        $("#raList").addEventListener("change", updateCount);

        // Search
        $("#raSearch").addEventListener("input", (e) => {
          const q = e.target.value.toLowerCase().trim();
          $$(".access-row").forEach((row) => {
            const match = !q ||
              row.dataset.name.includes(q) ||
              row.dataset.email.includes(q);
            row.style.display = match ? "" : "none";
          });
        });

        // Select all (hanya yang visible)
        $("#raSelectAll").addEventListener("click", () => {
          $$(".access-row").forEach((row) => {
            if (row.style.display !== "none") {
              row.querySelector("input[type='checkbox']").checked = true;
            }
          });
          updateCount();
        });

        // Clear all (hanya yang visible)
        $("#raClearAll").addEventListener("click", () => {
          $$(".access-row").forEach((row) => {
            if (row.style.display !== "none") {
              row.querySelector("input[type='checkbox']").checked = false;
            }
          });
          updateCount();
        });
      }
    });
  }

  async function modalReportAnalytics(reportId, reportTitle) {
    let data;
    try {
      data = await API.call(`/reports/admin/${reportId}/analytics`);
    } catch (e) {
      alert("Gagal load analytics: " + e.message);
      return;
    }

    const body = `
      <div class="admin-stats" style="grid-template-columns:repeat(2,1fr);margin-bottom:16px">
        <div class="admin-stat"><div class="num">${data.total}</div><div class="lbl">Total Views</div></div>
        <div class="admin-stat"><div class="num">${data.uniqueUsers}</div><div class="lbl">User Unik</div></div>
      </div>
      <div style="font-weight:700;margin-bottom:10px">Top Viewer</div>
      ${data.topUsers.length ? `
        <table class="data-table">
          <thead><tr><th>#</th><th>Nama</th><th>Views</th><th>Terakhir</th></tr></thead>
          <tbody>
            ${data.topUsers.map((u, i) => `
              <tr>
                <td>${i + 1}</td>
                <td><strong>${UI.esc(u.name)}</strong><br><small style="color:var(--muted)">${UI.esc(u.email)}</small></td>
                <td>${u.views}×</td>
                <td><small style="color:var(--muted)">${new Date(u.last_view).toLocaleString("id-ID")}</small></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      ` : `<div class="admin-empty" style="padding:30px">Belum ada yang buka report ini.</div>`}
    `;

    openModal({
      title: `📈 Analytics: ${UI.esc(reportTitle)}`,
      body,
      actions: [{ label: "Tutup", cls: "btn-ghost" }]
    });
  }

  /* =========================================================
    IMPORT REPORTS dari Excel
    ========================================================= */
  function modalImportReports() {
    openModal({
      title: "📥 Import Reports dari Excel",
      body: `
        <div class="hint" style="margin-bottom:16px">
          Upload file Excel dengan kolom: <code>title</code>, <code>slug</code> (opsional),
          <code>description</code>, <code>embed_url</code>, <code>icon</code>,
          <code>sort_order</code>, <code>access_emails</code>.
          <br><br>
          <button type="button" id="irDownload" style="color:var(--gold);font-weight:700;background:none;border:0;cursor:pointer;padding:0;font-family:inherit;font-size:14px">
            ⬇️ Download template Excel
          </button>
        </div>
        <div class="form-row">
          <label>File Excel (.xlsx)</label>
          <input type="file" id="irFile" accept=".xlsx,.xls">
        </div>
        <div id="irResult" style="margin-top:16px"></div>`,
      actions: [
        { label: "Batal", cls: "btn-ghost" },
        { label: "Import", cls: "btn-red", onClick: async (close, btn) => {
          const fileInput = $("#irFile");
          if (!fileInput.files || !fileInput.files[0]) {
            return alert("Pilih file Excel dulu");
          }

          const formData = new FormData();
          formData.append("file", fileInput.files[0]);

          btn.disabled = true;
          btn.textContent = "Mengimport…";

          try {
            const token = localStorage.getItem("csa_token") || "";
            const res = await fetch("/api/upload/excel/reports/import", {
              method: "POST",
              headers: { "Authorization": `Bearer ${token}` },
              body: formData
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Gagal import");

            const errList = (data.errors || []).length
              ? `<div style="margin-top:12px;padding:12px;background:rgba(237,29,36,.1);border:1px solid rgba(237,29,36,.3);border-radius:12px">
                  <b style="color:#ff8a8a">⚠️ ${data.errors.length} error:</b>
                  <ul style="margin:8px 0 0 20px;font-size:13px;color:#ffc9cb">
                    ${data.errors.slice(0, 5).map((e) => `<li>${UI.esc(e.title || "-")}: ${UI.esc(e.reason)}</li>`).join("")}
                    ${data.errors.length > 5 ? `<li>...dan ${data.errors.length - 5} lainnya</li>` : ""}
                  </ul>
                </div>`
              : "";

            $("#irResult").innerHTML = `
              <div style="padding:12px 16px;background:rgba(63,191,49,.12);border:1px solid rgba(63,191,49,.4);border-radius:12px">
                <b style="color:var(--green)">✅ ${data.created} report berhasil dibuat</b>
                ${data.skipped ? `<div style="margin-top:4px;font-size:13px">${data.skipped} dilewati</div>` : ""}
              </div>
              ${errList}`;

            btn.textContent = "Selesai ✓";
            setTimeout(async () => {
              close();
              await refresh();
            }, 1500);
          } catch (e) {
            btn.disabled = false;
            btn.textContent = "Import";
            alert(e.message);
          }
        }}
      ],
      onMount: () => {
        $("#irDownload")?.addEventListener("click", async () => {
          const btn = $("#irDownload");
          const originalText = btn.textContent;
          btn.textContent = "⏳ Downloading…";
          btn.disabled = true;

          try {
            const token = localStorage.getItem("csa_token") || "";
            const res = await fetch("/api/upload/excel/template/reports", {
              headers: { "Authorization": `Bearer ${token}` }
            });

            if (!res.ok) {
              if (res.status === 401) throw new Error("Sesi habis, login ulang dulu");
              if (res.status === 403) throw new Error("Kamu bukan admin");
              throw new Error(`Gagal download (status ${res.status})`);
            }

            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "template-reports.xlsx";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1000);

            btn.textContent = "✅ Berhasil didownload";
            setTimeout(() => {
              btn.textContent = originalText;
              btn.disabled = false;
            }, 1500);
          } catch (e) {
            alert(e.message);
            btn.textContent = originalText;
            btn.disabled = false;
          }
        });
      }
    });
  }
  function bindEvents() {
    if (bindEvents._done) return;
    bindEvents._done = true;

    document.body.addEventListener("click", async (e) => {
      const el = e.target.closest("[data-act]");
      if (!el) return;
      const act = el.dataset.act;
      const id = el.dataset.id;
      const chId = el.dataset.ch;

      switch (act) {
        case "goto-monthly":
          location.hash = "/monthly"; render();
          break;
        case "goto-leaderboard":
          location.hash = "/leaderboard"; render();
          break;
        case "add-chapter": modalChapter(); break;
        case "edit-chapter": modalChapter(cache.chapters.find((c) => c.id === id)); break;
        case "del-chapter":
          if (confirm("Hapus chapter ini? Semua modul & kuisnya ikut terhapus.")) {
            await API.call(`/chapters/${id}`, { method: "DELETE" });
            await refresh();
          } break;
        case "add-module": modalModule(id); break;
        case "edit-module":
          modalModule(chId, cache.chapters.find((c) => c.id === chId).modules.find((m) => m.id === id));
          break;
        case "del-module":
          if (confirm("Hapus modul ini?")) {
            await API.call(`/chapters/modules/${id}`, { method: "DELETE" });
            await refresh();
          } break;
        case "upload-video":
          modalUploadVideo(cache.chapters.find((c) => c.id === chId).modules.find((m) => m.id === id));
          break;
        case "import-quiz": modalImportQuiz(chId); break;
        case "view-quiz": modalViewQuiz(chId); break;
        case "del-quiz":
          if (confirm("Hapus kuis chapter ini?")) {
            const q = cache.quizzes.find((x) => x.chapterId === chId);
            if (q) await API.call(`/quizzes/${q.id}`, { method: "DELETE" });
            await refresh();
          } break;
        case "add-monthly": modalMonthlyCreate(); break;
        case "edit-monthly": modalMonthlyEdit(cache.monthly.find((x) => x.id === +id)); break;
        case "import-monthly": modalMonthlyImport(cache.monthly.find((x) => x.id === +id)); break;
        case "view-monthly-participants": modalMonthlyParticipants(cache.monthly.find((x) => x.id === +id)); break;
        case "toggle-monthly":
          await API.call(`/monthly-quiz/admin/${id}/toggle-active`, { method: "POST" });
          await refresh();
          break;
        case "del-monthly":
          if (confirm("Hapus quiz bulanan ini? Semua attempt-nya ikut hilang.")) {
            await API.call(`/monthly-quiz/admin/${id}`, { method: "DELETE" });
            await refresh();
          } break;
        case "dl-template": {
          const type = el.dataset.type;
          const names = {
            quiz: "template-quiz.xlsx",
            flashcards: "template-flashcards.xlsx",
            "monthly-quiz": "template-quiz.xlsx"
          };
          await downloadWithAuth(
            `/api/upload/excel/template/${type}`,
            names[type] || `template-${type}.xlsx`
          );
          break;
        }
        case "import-reports":
          modalImportReports();
          break;
        case "import-flashcards": modalImportFlashcards(); break;
        case "add-flashcard": modalFlashcard(); break;
        case "edit-flashcard": modalFlashcard(cache.flashcards.find((f) => f.id === id)); break;
        case "del-flashcard":
          if (confirm("Hapus kartu ini?")) {
            await API.call(`/flashcards/${id}`, { method: "DELETE" });
            await refresh();
          } break;
        case "add-badge": modalBadge(); break;
        case "edit-badge": {
          const all = await API.call("/badges/admin/list");
          const b = all.find((x) => x.id === id);
          if (b) modalBadge(b);
          break;
        }
        case "badge-owners":
          modalBadgeOwners(id, el.dataset.title || id);
          break;
        case "del-badge": {
          const count = +el.dataset.count || 0;
          const badgeTitle = el.dataset.title || id;
          if (count === 0) {
            if (confirm(`Hapus badge "${badgeTitle}"?`)) {
              await API.call(`/badges/admin/${encodeURIComponent(id)}`, { method: "DELETE" });
              await refresh();
            }
          } else {
            if (confirm(`⚠️ Badge "${badgeTitle}" sudah didapat oleh ${count} user.\n\nKalau dihapus, badge ini akan HILANG dari semua user tersebut.\n\nYakin mau hapus paksa?`)) {
              await API.call(`/badges/admin/${encodeURIComponent(id)}?force=1`, { method: "DELETE" });
              await refresh();
            }
          }
          break;
        }
        case "reset-pw": modalResetPassword({ id: +id, name: el.dataset.name }); break;
        case "del-user":
          if (confirm(`Hapus user "${el.dataset.name}"? Semua progressnya ikut hilang.`)) {
            await API.call(`/progress/admin/users/${id}`, { method: "DELETE" });
            await refresh();
          } break;
        
        case "add-user":
          modalAddUser();
          break;
        case "edit-user": {
          const all = await API.call("/progress/admin/all");
          const u = all.find((x) => x.id === +id);
          if (u) modalEditUser(u);
          break;
        }
        case "import-users":
          modalImportUsers();
          break;
        case "add-report":
          modalReport();
          break;
        case "edit-report": {
          const all = await API.call("/reports/admin/all");
          const r = all.find((x) => x.id === +id);
          if (r) modalReport(r);
          break;
        }
        case "del-report":
          if (confirm(`Hapus report "${el.dataset.title}"?`)) {
            await API.call(`/reports/admin/${id}`, { method: "DELETE" });
            await refresh();
          }
          break;
        case "toggle-report": {
          const all = await API.call("/reports/admin/all");
          const r = all.find((x) => x.id === +id);
          if (r) {
            await API.call(`/reports/admin/${id}`, {
              method: "PUT",
              body: { is_active: !r.is_active }
            });
            await refresh();
          }
          break;
        }
        case "report-access":
          await modalReportAccess(+id, el.dataset.title || "Report");
          break;
        case "report-analytics":
          await modalReportAnalytics(+id, el.dataset.title || "Report");
          break;
        case "lb-refresh":
          await render();
          break;
        case "lb-edit-prizes":
          await modalPrizes(lbMonth);
          break;
        case "lb-edit-announcement":
          await modalAnnouncement(lbMonth);
          break;
        case "lb-generate-winners":
          await modalGenerateWinners(lbMonth);
          break;
        case "lb-winners-popup-setting":
          await modalWinnersPopupSetting(lbMonth);
          break;
        case "lb-view-analytics":
          await modalPopupAnalytics(lbMonth);
          break;
      }
    });

    document.body.addEventListener("change", async (e) => {
      if (e.target.id === "lbMonthSelect") {
        lbMonth = e.target.value;
        await render();
      }
    });
  }

  async function refresh() {
    await loadContent();
    await render();
  }

  async function render() {
    if (!root || !admin) return;
    const hash = location.hash.slice(1) || "/";
    const view = hash === "/" ? "dashboard" : hash.slice(1);

    let inner = "";
    try {
      if (view === "dashboard")        inner = await viewDashboard();
      else if (view === "chapters")    inner = viewChapters();
      else if (view === "quiz")        inner = viewQuiz();
      else if (view === "monthly")     inner = viewMonthly();
      else if (view === "flashcards")  inner = viewFlashcards();
      else if (view === "badges")      inner = await viewBadges();
      else if (view === "users")       inner = await viewUsers();
      else if (view === "leaderboard") inner = await viewLeaderboardNew();
      else if (view === "reports")     inner = await viewReports();  
      else inner = await viewDashboard();
    } catch (e) {
      inner = `<div class="admin-empty"><div class="em">⚠️</div>Gagal load: ${UI.esc(e.message)}</div>`;
    }

    root.innerHTML = shell(view, inner);
    bindShell();
  }

  async function mount(user) {
    admin = user;
    root = document.getElementById("app");
    if (!root) return;
    if (!loaded) {
      try { await loadContent(); } catch (e) { console.error(e); }
    }
    bindEvents();
    await render();
    if (!mount._hasHash) {
      mount._hasHash = true;
      window.addEventListener("hashchange", () => { if (admin) render(); });
    }
  }

  function unmount() {
    admin = null;
    loaded = false;
    root = null;
  }

  return { mount, unmount };
})();