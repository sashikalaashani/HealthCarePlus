import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth, homeFor } from "../auth";
import Icon from "../components/Icon";
import { ErrorBox, Logo } from "../components/ui";

const ROLES = [
    ["patient", "Patient", "Book appointments and manage records", "user"],
    ["doctor", "Doctor", "Manage appointments and patients", "heart"],
    ["admin", "Admin", "Manage system and users", "shield"]
];

export default function Signup() {
    const { user, register } = useAuth();
    const nav = useNavigate();
    const [f, setF] = useState({ role: "patient", name: "", email: "", password: "", confirm: "", specialization: "", terms: false });
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

    if (user) return <Navigate to={homeFor(user.role)} replace />;

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        if (f.password.length < 8) return setError("Password must be at least 8 characters");
        if (f.password !== f.confirm) return setError("Passwords do not match");
        if (!f.terms) return setError("Please accept the Terms and Privacy Policy");
        setBusy(true);
        try {
            const u = await register({ name: f.name, email: f.email, password: f.password, role: f.role, specialization: f.specialization });
            nav(homeFor(u.role), { replace: true });
        } catch (err) { setError(err.message); } finally { setBusy(false); }
    };

    return (
        <div className="auth-page">
            <form className="auth-card wide" onSubmit={submit}>
                <Logo />
                <h1 className="auth-title">Create Account</h1>
                <p className="muted center">Join HealthCarePlus and take control of your healthcare journey.</p>
                <div className="role-cards">
                    {ROLES.map(([k, label, desc, icon]) => {
                        const locked = k === "admin";
                        return (
                            <button type="button" key={k} disabled={locked} className={`role-card${f.role === k ? " selected" : ""}`}
                                onClick={() => setF({ ...f, role: k })} title={locked ? "Admin accounts are created by the system owner" : undefined}>
                                <Icon name={icon} /><strong>{label}</strong><small>{locked ? "Invite only" : desc}</small>
                            </button>
                        );
                    })}
                </div>
                <ErrorBox error={error} />
                <div className="form-grid">
                    <label>Full Name<input required placeholder="Enter your full name" value={f.name} onChange={set("name")} /></label>
                    <label>Email Address<input type="email" required placeholder="example@gmail.com" value={f.email} onChange={set("email")} /></label>
                    <label>Password
                        <span className="input-wrap"><input type={show ? "text" : "password"} required minLength={8} placeholder="Create a password" value={f.password} onChange={set("password")} />
                            <button type="button" className="icon-btn" onClick={() => setShow(!show)} aria-label="Toggle password visibility"><Icon name="eye" /></button></span>
                    </label>
                    <label>Confirm Password<input type={show ? "text" : "password"} required placeholder="Confirm your password" value={f.confirm} onChange={set("confirm")} /></label>
                    {f.role === "doctor" && <label className="span2">Specialization<input placeholder="e.g. Cardiologist" value={f.specialization} onChange={set("specialization")} /></label>}
                </div>
                {f.role === "doctor" && <p className="muted small">Doctor accounts are reviewed by an administrator before appearing in appointment booking.</p>}
                <label className="check"><input type="checkbox" checked={f.terms} onChange={set("terms")} /> I agree to the Terms and Privacy Policy</label>
                <button className="btn primary block" disabled={busy}>{busy ? "Creating…" : "Sign Up"}</button>
                <p className="center small">Already have an account? <Link to="/login">Login</Link></p>
            </form>
        </div>
    );
}
