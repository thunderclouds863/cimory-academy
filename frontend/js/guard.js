const Guard = (() => {
  let overlayEl = null;
  let active = false;
  let hideTimer = null;
  let focusPollTimer = null;
  let idleTimer = null;
  let lastFocusAt = Date.now();
  let hadFocus = true;
  let lastUserActivity = Date.now();
  let lastIdleWarn = 0;

  const GUARD_DURATION_MS   = 15 * 1000;        
  const POLL_INTERVAL_MS    = 200;              
  const IDLE_THRESHOLD_MS   = 60 * 1000;        
  const IDLE_WARN_COOLDOWN  = 2 * 60 * 1000;   

  const isTarget = () => {
    const h = (location.hash || "").slice(1);
    return /^\/learn\/.+/.test(h) || /^\/quiz\/.+/.test(h);
  };

  function ensureOverlay() {
    if (overlayEl && document.body.contains(overlayEl)) return overlayEl;
    overlayEl = document.getElementById("screenshot-guard-overlay");
    if (!overlayEl) {
      overlayEl = document.createElement("div");
      overlayEl.id = "screenshot-guard-overlay";
      document.body.appendChild(overlayEl);
    }
    return overlayEl;
  }

  function escHtml(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function show(reason = "Aktivitas tidak diizinkan terdeteksi") {
    if (!isTarget()) return;
    ensureOverlay();

    const u = (typeof Store !== "undefined" && Store.user && Store.user()) || { name: "User", email: "" };
    const nameEsc  = escHtml(u.name  || "User");
    const emailEsc = escHtml(u.email || "");

    if (active) {
      const sub = overlayEl.querySelector(".sg-sub");
      if (sub) sub.textContent = reason;
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, GUARD_DURATION_MS);
      return;
    }

    overlayEl.innerHTML = `
      <div class="sg-box">
        <div class="sg-icon">🛡️</div>
        <h2 class="sg-title">Konten Dilindungi</h2>
        <p class="sg-sub">${escHtml(reason)}</p>
        <div class="sg-user">
          ${nameEsc}
          <small>${emailEsc}</small>
        </div>
        <div class="sg-warn">
          ⚠️ Aktivitas screenshot / screen-record pada halaman ini <b>tercatat oleh sistem</b>.<br>
          Konten dilindungi hak cipta Cimory Group.
        </div>
        <div class="sg-hint">
          Overlay ini akan hilang sendiri dalam <b>15 detik</b>. Ata Refersh (CTRL + R) jika overlay tidak hilang. Tapi setiap kali kamu
          screenshot / record lagi, overlay akan <b>muncul lagi</b>.
        </div>
      </div>`;
    overlayEl.classList.add("show");
    active = true;

    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, GUARD_DURATION_MS);
  }

  function hide() {
    ensureOverlay();
    overlayEl.classList.remove("show");
    active = false;
    clearTimeout(hideTimer);
  }

  function onKeyDown(e) {
    if (!isTarget()) return;
    const k = (e.key || "").toLowerCase();

    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (k === "p" || k === "s")) {
      e.preventDefault();
      show("Print / Save halaman diblokir");
      return;
    }
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && k === "s") {
      e.preventDefault();
      show("Screenshot shortcut terdeteksi");
      return;
    }
    if (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(e.key)) {
      e.preventDefault();
      show("Screenshot macOS terdeteksi");
      return;
    }
    if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.keyCode === 44) {
      try { navigator.clipboard.writeText(""); } catch {}
      show("PrintScreen terdeteksi");
      return;
    }
  }

  function onKeyUp(e) {
    if (!isTarget()) return;
    if (e.key === "PrintScreen" || e.code === "PrintScreen" || e.keyCode === 44) {
      try { navigator.clipboard.writeText(""); } catch {}
      show("PrintScreen terdeteksi");
    }
  }

  function onBlur() {
    if (!isTarget()) return;
    lastFocusAt = Date.now();
    show("Perpindahan fokus terdeteksi");
  }

  function onVisibilityChange() {
    if (!isTarget()) return;
    if (document.hidden) show("Berpindah tab / minimize terdeteksi");
  }

  function startFocusPolling() {
    if (focusPollTimer) return;
    focusPollTimer = setInterval(() => {
      if (!isTarget()) { hadFocus = document.hasFocus(); return; }
      const nowFocus = document.hasFocus();
      if (hadFocus && !nowFocus) {
        lastFocusAt = Date.now();
        show("Screen recorder terdeteksi");
      }
      hadFocus = nowFocus;
    }, POLL_INTERVAL_MS);
  }

  function onContextMenu(e) { if (isTarget()) e.preventDefault(); }
  function onSelectStart(e) { if (isTarget()) e.preventDefault(); }
  function onDragStart(e)   { if (isTarget()) e.preventDefault(); }

  function resetActivity() { lastUserActivity = Date.now(); }

  function startIdleWatch() {
    ["mousemove", "keydown", "scroll", "click", "touchstart"].forEach((evt) => {
      document.addEventListener(evt, resetActivity, { passive: true });
    });

    if (idleTimer) return;
    idleTimer = setInterval(() => {
      if (!isTarget()) return;
      const idleMs = Date.now() - lastUserActivity;
      const video = document.getElementById("moduleVideo");
      const videoPlaying = video && !video.paused && !video.ended;

      if (videoPlaying && idleMs > IDLE_THRESHOLD_MS) {
        const now = Date.now();
        if (now - lastIdleWarn < IDLE_WARN_COOLDOWN) return;
        lastIdleWarn = now;
        lastUserActivity = now;
        if (typeof UI !== "undefined" && UI.toast) {
          UI.toast("🛡️", "Konten dilindungi",
            "Aktivitas rekam layar tidak diizinkan di halaman ini.");
        }
      }
    }, 5000);
  }

  function install() {
    ensureOverlay();
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibilityChange);
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("selectstart", onSelectStart);
    document.addEventListener("dragstart", onDragStart);

    startFocusPolling();
    startIdleWatch();

    window.addEventListener("hashchange", () => {
      if (!isTarget() && active) hide();
    });
  }

  function forceHide() { hide(); }

  return { install, show, hide: forceHide, isTarget };
})();