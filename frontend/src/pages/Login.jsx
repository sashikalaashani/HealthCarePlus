import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../auth";
import Icon from "../components/Icon";
import { ErrorBox, Logo } from "../components/ui";

export default function Login() {
    const { user, login } = useAuth();
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [show, setShow] = useState(false);
    const [remember, setRemember] = useState(true);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    if (user) return <Navigate to={homeFor(user.role)} replace />;

    const submit = async (e) => {
        e.preventDefault();
        setError(""); setBusy(true);
        try {
            const u = await login(email, password, remember);
            nav(homeFor(u.role), { replace: true });
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };

    return (
        <div className="auth-page">
            <form className="auth-card" onSubmit={submit}>
                <Logo />
                <h1 className="auth-title">Welcome Back!</h1>
                <p className="muted center">Sign in to access your account and continue to better healthcare.</p>
                <ErrorBox error={error} />
                <label>Email Address
                    <input type="email" required autoComplete="email" placeholder="example@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <label>Password
                    <span className="input-wrap">
                        <input type={show ? "text" : "password"} required autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label={show ? "Hide password" : "Show password"}><Icon name="eye" /></button>
                    </span>
                </label>
                <div className="row between">
                    <label className="check"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>
                    <span className="muted small" title="Password reset is not implemented in the backend yet">Forgot password? (not available yet)</span>
                </div>
                <button className="btn primary block" disabled={busy}>{busy ? "Signing in…" : "Login"}</button>
                <div className="or">OR</div>
                <button type="button" className="btn outline block" disabled title="Google sign-in is not implemented in the backend yet">Continue with Google (coming soon)</button>
                <button type="button" className="btn outline block" disabled title="Microsoft sign-in is not implemented in the backend yet">Continue with Microsoft (coming soon)</button>
                <p className="center small">Don't have an account? <Link to="/signup">Sign up</Link></p>
            </form>
        </div>
    );
}
