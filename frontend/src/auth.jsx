import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "./api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const homeFor = (role) => ({ patient: "/patient", doctor: "/doctor", admin: "/admin" }[role] || "/");

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(!!tokenStore.get());

    const logout = useCallback(() => { tokenStore.clear(); setUser(null); }, []);

    useEffect(() => {
        if (!tokenStore.get()) return;
        api("/api/auth/me").then((r) => setUser(r.user)).catch(() => tokenStore.clear()).finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        window.addEventListener("hcp:unauthorized", logout);
        return () => window.removeEventListener("hcp:unauthorized", logout);
    }, [logout]);

    const login = async (email, password, remember) => {
        const r = await api("/api/auth/login", { method: "POST", body: { email, password } });
        tokenStore.set(r.token, remember);
        setUser(r.user);
        return r.user;
    };

    const register = async (payload) => {
        const r = await api("/api/auth/register", { method: "POST", body: payload });
        tokenStore.set(r.token, true);
        setUser(r.user);
        return r.user;
    };

    return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
