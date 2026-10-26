import { useState } from "react";
import { api } from "../api";
import { ago } from "../format";
import Icon from "../components/Icon";
import { Empty, ErrorBox, Spinner, StatCard, useFetch } from "../components/ui";

const ACT_ICON = { patient_registered: ["user", "blue"], doctor_registered: ["heart", "amber"], appointment_booked: ["calendar", "green"], prescription_added: ["file", "blue"] };

function Chart({ data }) {
    const max = Math.max(5, ...data.map((m) => m.appointments));
    const step = Math.ceil(max / 4);
    const top = step * 4;
    return (
        <div className="chart" role="img" aria-label="Appointments and completed appointments per month">
            <div className="y-axis">{[4, 3, 2, 1, 0].map((i) => <span key={i}>{i * step}</span>)}</div>
            <div className="bars">
                {data.map((m) => (
                    <div key={m.key} className="bar-group">
                        <div className="bar-pair">
                            <span className="bar a" style={{ height: `${(m.appointments / top) * 100}%` }} title={`${m.appointments} appointments`} />
                            <span className="bar c" style={{ height: `${(m.completed / top) * 100}%` }} title={`${m.completed} completed`} />
                        </div>
                        <small>{m.label}</small>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const stats = useFetch(() => api("/api/admin/stats"));
    const acts = useFetch(() => api("/api/admin/activities"));
    const docs = useFetch(() => api("/api/admin/users?role=doctor"));
    const [err, setErr] = useState("");

    const verify = async (id) => {
        setErr("");
        try { await api(`/api/admin/doctors/${id}/verify`, { method: "PATCH", body: { verified: true } }); docs.reload(); } catch (e) { setErr(e.message); }
    };
    const pending = docs.data?.filter((u) => u.doctor && !u.doctor.verified) || [];

    if (stats.loading) return <Spinner />;
    if (stats.error) return <ErrorBox error={stats.error} />;
    const t = stats.data.totals;

    return (
        <>
            <h1 className="page-title">System Administration</h1>
            <p className="muted">Manage users, appointments and system activities.</p>
            <div className="grid4">
                <StatCard icon="users" label="Total Users" value={t.users} />
                <StatCard icon="heart" label="Doctors" value={t.doctors} tone="green" />
                <StatCard icon="user" label="Patients" value={t.patients} tone="purple" />
                <StatCard icon="calendar" label="Appointments" value={t.appointments} tone="amber" />
            </div>
            <div className="grid-admin">
                <section className="card">
                    <div className="row between"><h3>Appointments Overview</h3>
                        <span className="legend"><i className="a" /> Appointments <i className="c" /> Completed</span></div>
                    <Chart data={stats.data.overview} />
                </section>
                <section className="card">
                    <h3>Recent Activities</h3>
                    {acts.loading ? <Spinner /> : !acts.data?.length ? <Empty>No activity yet.</Empty> : (
                        <div className="list">
                            {acts.data.map((a) => {
                                const [icon, tone] = ACT_ICON[a.type] || ["bell", "blue"];
                                return <div key={a._id} className="list-row"><span className={`stat-icon ${tone}`}><Icon name={icon} /></span>
                                    <div className="grow"><strong>{a.title}</strong><div className="muted small">{a.detail}</div></div><span className="muted small">{ago(a.createdAt)}</span></div>;
                            })}
                        </div>
                    )}
                </section>
            </div>
            <section className="card">
                <h3>Doctors Awaiting Verification</h3>
                <ErrorBox error={err || docs.error} />
                {docs.loading ? <Spinner /> : pending.length === 0 ? <Empty>No doctors are waiting for verification.</Empty> : (
                    <div className="list">{pending.map((u) => (
                        <div key={u.id} className="list-row"><div className="grow"><strong>{u.name}</strong><div className="muted small">{u.email}</div></div>
                            <button className="btn primary sm" onClick={() => verify(u.doctor.id)}>Verify</button></div>
                    ))}</div>
                )}
            </section>
        </>
    );
}
