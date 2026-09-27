const UI = (() => {
  const IMG = {
    logo:   "assets/logo-cimory.png",
    happy:  "assets/mascot-tomyum.png",
    oops:   "assets/mascot-baksobowy.png"
  };

  const esc = (s) => (s == null ? "" : String(s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])));

  const initials = (name) => (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  const icons = {
    home:   '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10v10h14V10"/>',
    learn:  '<path d="M4 5h11a2 2 0 0 1 2 2v13"/><path d="M4 5v14h11"/><path d="M20 7v13H9"/>',
    quiz:   '<circle cx="12" cy="12" r="9"/><path d="M9.2 9a3 3 0 1 1 4.3 3c-.9.6-1.5 1.1-1.5 2.2"/><circle cx="12" cy="17.5" r=".6" fill="currentColor"/>',
    fun:    '<rect x="3" y="6" width="18" height="13" rx="2.5"/><path d="M3 10h18"/><path d="M8 15h4"/>',
    badge:  '<circle cx="12" cy="9" r="5"/><path d="M8.5 13 7 21l5-2 5 2-1.5-8"/>',
    logout: '<path d="M15 4h4v16h-4"/><path d="M11 8l-4 4 4 4"/><path d="M7 12h9"/>',
    play:   '<path d="M8 5v14l11-7z" fill="currentColor" stroke="none"/>',
    clock:  '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    check:  '<path d="M4 12l5 5L20 6"/>',
    arrow:  '<path d="M9 6l6 6-6 6"/>',
    arrowLeft: '<path d="M15 6l-6 6 6 6"/>',
    menu:   '<path d="M4 7h16M4 12h16M4 17h16"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 14l3-3 4 4 5-6"/>'
  };
  const icon = (name, size = 22) =>
    `<svg class="ic" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ""}</svg>`;

  function ring(pct, size = 52) {
    const r = size / 2 - 5, c = 2 * Math.PI * r, off = c * (1 - pct / 100);
    return `<div class="ring" style="width:${size}px;height:${size}px">
      <svg width="${size}" height="${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="rgba(255,255,255,.12)" stroke-width="5" fill="none"/>
        <circle cx="${size / 2}" cy="${size / 2}" r="${r}" stroke="var(--green)" stroke-width="5" fill="none"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}"/>
      </svg><span class="rtxt">${pct}%</span></div>`;
  }

  const COLORS = ["#ED1D24", "#FFC83D", "#3fbf31", "#3B40D6", "#ff8a3d", "#ffffff"];
  function confetti(n = 120) {
    const box = document.getElementById("confetti");
    for (let i = 0; i < n; i++) {
      const b = document.createElement("i");
      b.className = "confetti-bit";
      b.style.left = Math.random() * 100 + "vw";
      b.style.background = COLORS[i % COLORS.length];
      b.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
      b.style.animationDelay = Math.random() * 0.4 + "s";
      b.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(b);
      setTimeout(() => b.remove(), 4200);
    }
  }

  let toastTimer;
  function toast(emoji, title, desc) {
    let t = document.querySelector(".toast");
    if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
    t.innerHTML = `<div class="te">${emoji}</div><div><div class="tt">${esc(title)}</div>${desc ? `<div class="td">${esc(desc)}</div>` : ""}</div>`;
    requestAnimationFrame(() => t.classList.add("show"));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3200);
  }

  function celebrateBadges(list) {
    if (!list || !list.length) return;
    list.forEach((b, i) => setTimeout(() => {
      confetti(80);
      toast(b.emoji || "🏅", "Badge baru: " + b.title + "!", b.descr || b.desc || "");
    }, i * 900));
  }

  const GRADS = [
    "linear-gradient(140deg,#3a0f14,#7a121b)",
    "linear-gradient(140deg,#1a1c56,#3B40D6)",
    "linear-gradient(140deg,#2b1160,#61176b)",
    "linear-gradient(140deg,#123f2a,#2f9a24)",
    "linear-gradient(140deg,#4a2c07,#c98a12)"
  ];
  const grad = (i) => GRADS[i % GRADS.length];

  function nowStamp() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${String(d.getFullYear()).slice(-2)} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  function userTag(user) {
    if (!user) return "Guest";
    return `${user.name || "User"} • ${user.email || ""}`.trim();
  }

  return {
    esc, initials, icon, ring, confetti, toast, celebrateBadges, grad, IMG,
    nowStamp, userTag
  };
})();