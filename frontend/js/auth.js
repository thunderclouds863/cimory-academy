const Auth = (() => {
  const allowed = () => [
  "cimory.com", "cimorygroup.com", "kanzler.co.id", "macroprima.co.id",
  "gmail.com", "googlemail.com", "yahoo.com", "yahoo.co.id",
  "outlook.com", "hotmail.com", "live.com", "icloud.com", "me.com"
];

function validateEmail(email) {
  email = (email || "").trim().toLowerCase();
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!ok) return { ok: false, msg: "Format email belum benar." };

  const domain = email.split("@")[1];
  if (!allowed().includes(domain)) {
    return { ok: false, msg: `Domain email belum diizinkan. Kontak IT kalau emailmu tidak bisa dipakai.` };
  }
  return { ok: true, email };
}

  async function signIn(email, password) {
    const v = validateEmail(email);
    if (!v.ok) return v;
    if (!password) return { ok: false, msg: "Password wajib diisi" };

    try {
      const { token, user } = await API.call("/auth/login", {
        method: "POST",
        body: { email: v.email, password }
      });

      if (!token) return { ok: false, msg: "Server tidak mengirim token" };

      API.setToken(token);
      Store.setSession(user);   

      return { ok: true, user };
    } catch (e) {
      return { ok: false, msg: e.message };
    }
  }

  function signOut() {
    API.setToken("");
    Store.clearSession();
    localStorage.removeItem("csa_popup_shown");   
  }

  return { validateEmail, signIn, signOut, allowed };
})();