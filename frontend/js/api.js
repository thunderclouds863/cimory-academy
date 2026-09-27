const API = (() => {
  const BASE = () => (window.CIMORY_CONFIG?.API_BASE || "/api");
  const TOKEN_KEY = "csa_token";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  }
  function setToken(t) {
    if (t) localStorage.setItem(TOKEN_KEY, t);
    else localStorage.removeItem(TOKEN_KEY);
  }

  async function call(path, opts = {}) {
    const { method = "GET", body, raw = false, headers: extraHeaders = {} } = opts;
    const headers = { ...extraHeaders };
    const token = getToken();
    if (token) headers["Authorization"] = "Bearer " + token;

    let payload;
    if (body instanceof FormData) {
      payload = body;
    } else if (body !== undefined && body !== null) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }

    const url = BASE() + path;
    let res;
    try {
      res = await fetch(url, { method, headers, body: payload });
    } catch (e) {
      throw new Error("Tidak bisa konek ke server. Cek koneksi / server.");
    }

    if (res.status === 401) {
      setToken("");
      localStorage.removeItem("csa_session");
      throw new Error("Sesi habis, silakan login ulang.");
    }

    let data = null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const msg = (data && (data.error || data.message)) || res.statusText || "Request gagal";
      throw new Error(msg);
    }

    return data;
  }

  return { call, getToken, setToken };
})();