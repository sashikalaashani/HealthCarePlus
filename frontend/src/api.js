// Thin fetch wrapper for the existing Express API. Token is a JWT issued by POST /api/auth/login.
const BASE = import.meta.env.VITE_API_URL || "";
const KEY = "hcp_token";

export const tokenStore = {
    get: () => { try { return localStorage.getItem(KEY) || sessionStorage.getItem(KEY); } catch { return null; } },
    set: (t, remember = true) => {
        try {
            tokenStore.clear();
            (remember ? localStorage : sessionStorage).setItem(KEY, t);
        } catch { /* storage unavailable */ }
    },
    clear: () => { try { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } catch { /* ignore */ } }
};

export async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
    if (body !== undefined) headers["Content-Type"] = "application/json";

    let res;
    try {
        res = await fetch(`${BASE}${path}`, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
    } catch {
        throw new Error("Cannot reach the server. Is the backend running?");
    }
    let data = null;
    try { data = await res.json(); } catch { /* empty body */ }
    if (!res.ok) {
        if (res.status === 401 && token) window.dispatchEvent(new Event("hcp:unauthorized"));
        throw new Error(data?.message || `Request failed (${res.status})`);
    }
    return data;
}

export const qs = (params) => {
    const p = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v) p.set(k, v); });
    const s = p.toString();
    return s ? `?${s}` : "";
};
