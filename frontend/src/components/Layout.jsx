import { useEffect, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";
import Icon from "./Icon";
import { Avatar, Logo } from "./ui";

// Only routes that exist and have backend support are links. Others are shown disabled so the
// design is preserved without pretending those pages work.
const NAV = {
    patient: [
        ["Dashboard", "dashboard", "/patient"],
        ["My Appointments", "calendar", "/patient/appointments"],
        ["Medical Records", "file", "/patient/records"],
        ["Prescriptions", "pill", "/patient/prescriptions"],
        ["Notifications", "bell", "/notifications"],
        ["Profile", "user", null]
    ],
    doctor: [
        ["Dashboard", "dashboard", "/doctor"],
        ["My Appointments", "calendar", null],
        ["Patients", "users", null],
        ["Prescriptions", "pill", null],
        ["Medical Records", "file", null],
        ["Notifications", "bell", "/notifications"],
        ["Profile", "user", null]
    ],
    admin: [
        ["Dashboard", "dashboard", "/admin"],
        ["User Management", "users", null],
        ["Appointments", "calendar", null],
        ["Reports", "chart", null],
        ["Notifications", "bell", "/notifications"],
        ["System Settings", "settings", null]
    ]
};

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const nav = useNavigate();
    const { pathname } = useLocation();
    const [unread, setUnread] = useState(0);
    const [q, setQ] = useState("");

    useEffect(() => {
        api("/api/notifications").then((r) => setUnread(r.unread)).catch(() => {});
    }, [pathname]);

    const roleLabel = { patient: "Patient", doctor: "Doctor", admin: "Admin" }[user.role];
    const search = (e) => { e.preventDefault(); nav(`/patient/appointments?q=${encodeURIComponent(q)}`); };

    return (
        <div className="shell">
            <aside className="sidebar">
                <Logo to={`/${user.role === "patient" ? "patient" : user.role}`} />
                <nav>
                    {NAV[user.role].map(([label, icon, to]) =>
                        to ? (
                            <NavLink key={label} to={to} end className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}>
                                <Icon name={icon} /> {label}
                            </NavLink>
                        ) : (
                            <span key={label} className="nav-item disabled" title="Not available yet">
                                <Icon name={icon} /> {label}
                            </span>
                        )
                    )}
                </nav>
            </aside>
            <div className="main">
                <header className="topbar">
                    {user.role === "patient" ? (
                        <form className="search" onSubmit={search}>
                            <Icon name="search" size={16} />
                            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search doctors, hospitals, specializations…" aria-label="Search doctors" />
                        </form>
                    ) : <div />}
                    <div className="topbar-right">
                        <button className="icon-btn bell" onClick={() => nav("/notifications")} aria-label={`Notifications (${unread} unread)`}>
                            <Icon name="bell" />{unread > 0 && <span className="dot">{unread > 9 ? "9+" : unread}</span>}
                        </button>
                        <div className="usermenu">
                            <Avatar name={user.name} size={36} />
                            <div className="who"><strong>{user.name}</strong><small>{roleLabel}</small></div>
                            <button className="icon-btn" onClick={() => { logout(); nav("/login"); }} aria-label="Log out" title="Log out"><Icon name="logout" /></button>
                        </div>
                    </div>
                </header>
                <main className="content">{children}</main>
            </div>
        </div>
    );
}
