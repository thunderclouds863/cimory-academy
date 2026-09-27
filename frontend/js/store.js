const Store = (() => {
  let cache = {
    chapters: [],
    flashcards: [],
    badges: [],
    quizzes: [],
    progress: { completed: [], quiz: {}, flashcards: [], xp: 0, streak: 0 },
    leaderboard: {
      progress: [],
      monthly: [],
      monthlyMeta: { monthKey: null, title: null },
      winners: [],
      prizes: [],
      progressMeta: { monthKey: null, monthLabel: null }
    },
    monthlyQuiz: { current: null, archive: [] },
    popups: []
  };

  const user = () => {
    try { return JSON.parse(localStorage.getItem("csa_session") || "null"); }
    catch { return null; }
  };
  const isLoggedIn = () => !!user();
  const setSession = (u) => {
    if (u) localStorage.setItem("csa_session", JSON.stringify(u));
    else localStorage.removeItem("csa_session");
  };
  const clearSession = () => localStorage.removeItem("csa_session");

  async function bootstrap() {
    const [chapters, flashcards, badges, quizzes, progress] = await Promise.all([
      API.call("/v2/chapters"),
      API.call("/flashcards"),
      API.call("/badges"),
      API.call("/quizzes"),
      API.call("/progress/me")
    ]);
    cache = { ...cache, chapters, flashcards, badges, quizzes, progress };
  }

  async function loadLeaderboard(period = null) {
    const qs = period ? `?period=${encodeURIComponent(period)}` : "";

    const [progressRaw, monthlyRaw] = await Promise.all([
      API.call("/leaderboard/progress" + qs).catch(() => ({ list: [] })),
      API.call("/leaderboard/quiz-monthly" + (period ? `?month=${encodeURIComponent(period)}` : "")).catch(() => [])
    ]);

    const progressArr = Array.isArray(progressRaw?.list) ? progressRaw.list : [];
    const winnersArr  = Array.isArray(progressRaw?.winners) ? progressRaw.winners : [];
    const prizesArr   = Array.isArray(progressRaw?.prizes) ? progressRaw.prizes : [];
    const periodKey   = progressRaw?.period || period;
    const periodLabel = progressRaw?.periodLabel || null;

    let monthlyArr = [];
    let monthlyMeta = { monthKey: null, title: null };
    if (Array.isArray(monthlyRaw)) {
      monthlyArr = monthlyRaw;
    } else if (monthlyRaw && Array.isArray(monthlyRaw.list)) {
      monthlyArr = monthlyRaw.list;
      monthlyMeta = { monthKey: monthlyRaw.monthKey, title: monthlyRaw.title };
    }

    cache.leaderboard = {
      progress: progressArr,
      monthly: monthlyArr,
      monthlyMeta,
      winners: winnersArr,
      prizes: prizesArr,
      progressMeta: { monthKey: periodKey, monthLabel: periodLabel }
    };
    return cache.leaderboard;
  }

  async function loadMyPopup() {
    try {
      const r = await API.call("/leaderboard/my-popup");
      cache.popups = Array.isArray(r?.popups) ? r.popups : [];
      return cache.popups;
    } catch (e) {
      console.warn("Gagal load popup:", e.message);
      cache.popups = [];
      return [];
    }
  }

  async function markPopupSeen(popupKey) {
    try {
      await API.call("/leaderboard/mark-seen", {
        method: "POST",
        body: { popupKey }
      });
    } catch (e) {
      console.warn("Gagal mark popup seen:", e.message);
    }
  }

  async function loadMonthlyQuiz() {
    const [current, archive] = await Promise.all([
      API.call("/monthly-quiz/current"),
      API.call("/monthly-quiz/archive")
    ]);
    cache.monthlyQuiz = {
      current,
      archive: Array.isArray(archive) ? archive : []
    };
    return cache.monthlyQuiz;
  }

  const chapters = () => cache.chapters;
  const flashcards = () => cache.flashcards;
  const badgesDef = () => cache.badges;
  const quizzes = () => cache.quizzes;
  const leaderboard = () => cache.leaderboard;
  const monthlyQuiz = () => cache.monthlyQuiz;
  const popups = () => cache.popups;
  const allModules = () =>
    cache.chapters.flatMap((c) => c.modules.map((m) => ({ ...m, chapterId: c.id, chapterTitle: c.title })));
  const findModule = (id) => allModules().find((m) => m.id === id);
  const quizFor = (chapterId) => cache.quizzes.find((q) => q.chapterId === chapterId);
  const isDone = (id) => cache.progress.completed.includes(id);
  const hasBadge = (id) => (cache.badges.find((b) => b.id === id) || {}).owned;

  function chapterProgress(ch) {
    const total = ch.modules.length;
    const done = ch.modules.filter((m) => isDone(m.id)).length;
    return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
  }

  function overall() {
    const mods = allModules();
    const done = mods.filter((m) => isDone(m.id)).length;
    const badgeOwned = cache.badges.filter((b) => b.owned).length;
    return {
      done, total: mods.length,
      pct: mods.length ? Math.round((done / mods.length) * 100) : 0,
      xp: cache.progress.xp, streak: cache.progress.streak,
      badges: badgeOwned, badgeTotal: cache.badges.length,
      flashSeen: cache.progress.flashcards.length, flashTotal: cache.flashcards.length
    };
  }

  function continueModule() {
    const mods = allModules();
    return mods.find((m) => !isDone(m.id)) || mods[mods.length - 1] || null;
  }

  function isModuleUnlocked(moduleId) {
    const mod = findModule(moduleId);
    if (!mod) return false;
    const ch = chapters().find((c) => c.id === mod.chapterId);
    if (!ch) return false;
    const idx = ch.modules.findIndex((m) => m.id === moduleId);
    if (idx <= 0) return true;
    return isDone(ch.modules[idx - 1].id);
  }

  function isChapterUnlocked(chapterId) {
    const ch = chapters().find((c) => c.id === chapterId);
    if (!ch) return false;
    const sorted = [...chapters()].sort((a, b) => a.no - b.no);
    const idx = sorted.findIndex((c) => c.id === chapterId);
    if (idx <= 0) return true;
    const prev = sorted[idx - 1];
    return chapterProgress(prev).pct === 100;
  }

  async function completeModule(id) {
    const r = await API.call(`/progress/modules/${id}/complete`, { method: "POST" });
    if (!cache.progress.completed.includes(id)) cache.progress.completed.push(id);
    cache.progress.xp += r.gained || 0;
    if (r.newBadges?.length) await refreshBadges();
    return r;
  }

  async function refreshBadges() {
    cache.badges = await API.call("/badges");
  }

  async function seeFlashcard(id) {
    if (cache.progress.flashcards.includes(id)) return { newBadges: [] };
    const r = await API.call(`/flashcards/${id}/view`, { method: "POST" });
    cache.progress.flashcards.push(id);
    if (r.newBadges?.length) await refreshBadges();
    return r;
  }

  async function recordQuiz(chapterId, answers, durationSec) {
    const r = await API.call(`/quizzes/${chapterId}/submit`, {
      method: "POST",
      body: { answers, durationSec }
    });
    cache.progress.xp += r.gainedXp || 0;
    cache.progress = await API.call("/progress/me");
    if (r.newBadges?.length) await refreshBadges();
    return r;
  }

  async function updateModuleDuration(moduleId, durationSec) {
    try {
      const r = await API.call(`/chapters/modules/${moduleId}/duration`, {
        method: "POST",
        body: { durationSec }
      });
      const mod = findModule(moduleId);
      if (mod) { mod.durationSec = r.durationSec; mod.duration = r.duration; }
      return r;
    } catch (e) {
      console.warn("Gagal update durasi:", e.message);
      return null;
    }
  }

  async function loadWinners(period = null) {
    const qs = period ? `?period=${encodeURIComponent(period)}` : "";
    return await API.call("/leaderboard/winners" + qs);
  }

  async function loadLeaderboardChapter(chapterId = null) {
    const qs = chapterId ? `?chapterId=${encodeURIComponent(chapterId)}` : "";
    return await API.call("/leaderboard/quiz-chapter" + qs);
  }

  const quizResult = (chapterId) => cache.progress.quiz[chapterId];

  return {
    bootstrap, loadLeaderboard, loadMonthlyQuiz, loadLeaderboardChapter, loadWinners,
    loadMyPopup, markPopupSeen,
    setSession, clearSession, user, isLoggedIn,
    chapters, flashcards, badgesDef, quizzes, leaderboard, monthlyQuiz, popups,
    allModules, findModule, quizFor,
    isDone, hasBadge, chapterProgress, overall, continueModule,
    isModuleUnlocked, isChapterUnlocked,
    completeModule, seeFlashcard, recordQuiz, quizResult, refreshBadges,
    updateModuleDuration,
    getProgress: () => cache.progress
  };
})();