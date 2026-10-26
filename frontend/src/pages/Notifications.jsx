import { useState } from "react";
import { api } from "../api";
import { ago } from "../format";
import Icon from "../components/Icon";
import { Empty, ErrorBox, Spinner, Tabs, useFetch } from "../components/ui";

const TABS = [["", "All"], ["appointment", "Appointments"], ["prescription", "Prescriptions"], ["general", "General"]];
const ICON = { appointment: ["calendar", "green"], prescription: ["file", "blue"], general: ["bell", "amber"] };

export default function Notifications() {
    const [type, setType] = useState("");
    const { data, error, loading, reload } = useFetch(() => api(`/api/notifications${type ? `?type=${type}` : ""}`), [type]);
    const [err2, setErr2] = useState("");

    const markRead = async (n) => {
        if (n.read) return;
        try { await api(`/api/notifications/${n._id}/read`, { method: "PATCH" }); reload(); } catch (e) { setErr2(e.message); }
    };
    const markAll = async () => {
        try { await api("/api/notifications/read-all", { method: "PATCH" }); reload(); } catch (e) { setErr2(e.message); }
    };

    return (
        <>
            <div className="row between">
                <div><h1 className="page-title">Notifications</h1><p className="muted">Stay updated with your appointments and health information.</p></div>
                {data?.unread > 0 && <button className="btn outline" onClick={markAll}>Mark all as read</button>}
            </div>
            <Tabs tabs={TABS} value={type} onChange={setType} />
            <ErrorBox error={error || err2} />
            {loading ? <Spinner /> : !data?.items.length ? <Empty>You're all caught up.</Empty> : (
                <div className="list">
                    {data.items.map((n) => {
                        const [icon, tone] = ICON[n.type] || ICON.general;
                        return (
                            <button key={n._id} className={`list-row notif${n.read ? "" : " unread"}`} onClick={() => markRead(n)}>
                                <span className={`stat-icon ${tone}`}><Icon name={icon} /></span>
                                <div className="grow left"><strong>{n.title}</strong><div className="muted small">{n.message}</div></div>
                                <span className="muted small">{ago(n.createdAt)}</span>
                                {!n.read && <span className="unread-dot" aria-label="Unread" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </>
    );
}
