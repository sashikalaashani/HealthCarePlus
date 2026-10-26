import { useState } from "react";
import { api } from "../api";
import { fmt12, fmtDate } from "../format";
import { Avatar, Badge, Empty, ErrorBox, Modal, Spinner, StatCard, useFetch } from "../components/ui";

const NEXT = [["checked_in", "Check in"], ["waiting", "Waiting"], ["completed", "Complete"]];

function PrescribeModal({ appt, onClose, onDone }) {
    const [items, setItems] = useState([{ name: "", dosage: "", frequency: "" }]);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const upd = (i, k, v) => setItems(items.map((it, n) => (n === i ? { ...it, [k]: v } : it)));
    const save = async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try { await api("/api/prescriptions", { method: "POST", body: { patientId: appt.patient.id, items } }); onDone("Prescription added."); }
        catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    return (
        <Modal title={`Prescription for ${appt.patient.name}`} onClose={onClose}>
            <form onSubmit={save}>
                <ErrorBox error={error} />
                {items.map((it, i) => (
                    <div key={i} className="form-grid three">
                        <input required placeholder="Medicine" value={it.name} onChange={(e) => upd(i, "name", e.target.value)} />
                        <input placeholder="Dosage (e.g. 500mg)" value={it.dosage} onChange={(e) => upd(i, "dosage", e.target.value)} />
                        <input placeholder="Frequency (e.g. Twice a day)" value={it.frequency} onChange={(e) => upd(i, "frequency", e.target.value)} />
                    </div>
                ))}
                <div className="row gap mt">
                    <button type="button" className="btn outline" onClick={() => setItems([...items, { name: "", dosage: "", frequency: "" }])}>+ Add medicine</button>
                    <button className="btn primary grow" disabled={busy}>{busy ? "Saving…" : "Save prescription"}</button>
                </div>
            </form>
        </Modal>
    );
}

function RecordModal({ appt, onClose, onDone }) {
    const [f, setF] = useState({ type: "consultation", reason: "", notes: "" });
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);
    const save = async (e) => {
        e.preventDefault(); setError(""); setBusy(true);
        try { await api("/api/records", { method: "POST", body: { ...f, patientId: appt.patient.id, appointmentId: appt.id } }); onDone("Medical record added."); }
        catch (err) { setError(err.message); } finally { setBusy(false); }
    };
    return (
        <Modal title={`Medical record for ${appt.patient.name}`} onClose={onClose}>
            <form onSubmit={save}>
                <ErrorBox error={error} />
                <label>Type<select value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="consultation">Consultation</option><option value="test">Test result</option></select></label>
                <label>Reason / Diagnosis<input required value={f.reason} onChange={(e) => setF({ ...f, reason: e.target.value })} /></label>
                <label>Notes<textarea rows={3} value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></label>
                <button className="btn primary block mt" disabled={busy}>{busy ? "Saving…" : "Save record"}</button>
            </form>
        </Modal>
    );
}

export default function DoctorDashboard() {
    const { data, error, loading, reload } = useFetch(() => api("/api/doctors/me/dashboard"));
    const [modal, setModal] = useState(null); // { kind, appt }
    const [msg, setMsg] = useState("");
    const [err2, setErr2] = useState("");

    const setStatus = async (id, status) => {
        setErr2("");
        try { await api(`/api/appointments/${id}/status`, { method: "PATCH", body: { status } }); reload(); } catch (e) { setErr2(e.message); }
    };
    const done = (m) => { setModal(null); setMsg(m); reload(); };

    if (loading) return <Spinner />;
    if (error) return <ErrorBox error={error} />;
    const { doctor, stats, appointments, today } = data;

    return (
        <>
            <h1 className="page-title">Welcome {doctor.name}!</h1>
            <p className="muted">Here's your schedule and patient overview. · {fmtDate(today)}</p>
            {!doctor.verified && <div className="alert warn">Your account is awaiting administrator verification. Patients can't book you until you're verified.</div>}
            {msg && <div className="alert ok" role="status">{msg}</div>}
            <ErrorBox error={err2} />
            <div className="grid3">
                <StatCard icon="calendar" label="Today's Appointments" value={stats.todaysAppointments} />
                <StatCard icon="users" label="Total Patients" value={stats.totalPatients} tone="green" />
                <StatCard icon="file" label="Pending Reports" value={stats.pendingReports} tone="amber" />
            </div>
            <section className="card">
                <h3>Today's Appointments</h3>
                {appointments.length === 0 ? <Empty>No appointments today.</Empty> : (
                    <div className="list">
                        {appointments.map((a) => (
                            <div key={a.id} className="list-row wrap">
                                <span className="time">{fmt12(a.time)}</span>
                                <Avatar name={a.patient.name} size={36} />
                                <div className="grow"><strong>{a.patient.name}</strong><div className="muted small">{a.reason || "General consultation"}</div></div>
                                <Badge status={a.status} />
                                <div className="row gap">
                                    {NEXT.filter(([s]) => s !== a.status).map(([s, l]) => <button key={s} className="btn outline sm" onClick={() => setStatus(a.id, s)}>{l}</button>)}
                                    <button className="btn primary sm" onClick={() => setModal({ kind: "rx", appt: a })}>Prescribe</button>
                                    <button className="btn outline sm" onClick={() => setModal({ kind: "rec", appt: a })}>Add record</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
            {modal?.kind === "rx" && <PrescribeModal appt={modal.appt} onClose={() => setModal(null)} onDone={done} />}
            {modal?.kind === "rec" && <RecordModal appt={modal.appt} onClose={() => setModal(null)} onDone={done} />}
        </>
    );
}
