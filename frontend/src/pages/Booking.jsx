import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { api, qs } from "../api";
import { fmt12, fmtDate, ymd } from "../format";
import Icon from "../components/Icon";
import { Avatar, Badge, Empty, ErrorBox, Spinner, useFetch } from "../components/ui";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Calendar({ value, onPick }) {
    const today = ymd(new Date());
    const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
    const first = cursor.getDay();
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)];
    const title = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });
    const move = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));
    return (
        <div className="calendar">
            <div className="row between">
                <button className="icon-btn" onClick={() => move(-1)} aria-label="Previous month"><Icon name="chevronL" /></button>
                <strong>{title}</strong>
                <button className="icon-btn" onClick={() => move(1)} aria-label="Next month"><Icon name="chevronR" /></button>
            </div>
            <div className="cal-grid">
                {DAYS.map((d) => <span key={d} className="cal-dow">{d}</span>)}
                {cells.map((d, i) => {
                    if (!d) return <span key={`e${i}`} />;
                    const s = ymd(new Date(cursor.getFullYear(), cursor.getMonth(), d));
                    return <button key={s} disabled={s < today} className={`cal-day${s === value ? " selected" : ""}`} onClick={() => onPick(s)}>{d}</button>;
                })}
            </div>
        </div>
    );
}

export default function Booking() {
    const [params] = useSearchParams();
    const rescheduleId = params.get("reschedule");
    const nav = useNavigate();

    const [q, setQ] = useState(params.get("q") || "");
    const [spec, setSpec] = useState("");
    const [hosp, setHosp] = useState("");
    const [doctor, setDoctor] = useState(null);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [slots, setSlots] = useState(null);
    const [step, setStep] = useState(1);
    const [reason, setReason] = useState("");
    const [error, setError] = useState("");
    const [msg, setMsg] = useState("");
    const [busy, setBusy] = useState(false);

    const specs = useFetch(() => api("/api/doctors/specializations"));
    const hospitals = useFetch(() => api("/api/public/hospitals"));
    const doctors = useFetch(() => api(`/api/doctors${qs({ q, specialization: spec, hospital: hosp })}`), [q, spec, hosp]);
    const mine = useFetch(() => api("/api/appointments?upcoming=true"));

    // Reschedule mode: preselect the doctor of the appointment being moved.
    const target = useMemo(() => mine.data?.find((a) => a.id === rescheduleId), [mine.data, rescheduleId]);
    useEffect(() => {
        if (target && doctors.data) setDoctor((d) => d || doctors.data.find((x) => x.id === target.doctor.id) || null);
    }, [target, doctors.data]);

    useEffect(() => { setDoctor(null); setDate(""); setTime(""); setStep(1); }, [rescheduleId]);

    useEffect(() => {
        setTime(""); setSlots(null);
        if (!doctor || !date) return;
        api(`/api/doctors/${doctor.id}/slots?date=${date}`).then((r) => setSlots(r.slots)).catch((e) => setError(e.message));
    }, [doctor, date]);

    const confirm = async () => {
        setError(""); setBusy(true);
        try {
            if (target) await api(`/api/appointments/${target.id}/reschedule`, { method: "PATCH", body: { date, time } });
            else await api("/api/appointments", { method: "POST", body: { doctorId: doctor.id, date, time, reason } });
            setMsg(target ? "Appointment rescheduled." : "Appointment booked and confirmed!");
            setStep(1); setDate(""); setTime(""); setReason(""); setDoctor(null);
            mine.reload();
            if (target) nav("/patient/appointments", { replace: true });
        } catch (e) { setError(e.message); setStep(2); } finally { setBusy(false); }
    };

    const cancel = async (id) => {
        if (!window.confirm("Cancel this appointment?")) return;
        try { await api(`/api/appointments/${id}/cancel`, { method: "PATCH" }); setMsg("Appointment cancelled."); mine.reload(); }
        catch (e) { setError(e.message); }
    };

    const steps = ["Select Doctor", "Choose Date & Time", "Confirm"];

    return (
        <>
            <h1 className="page-title">{target ? "Reschedule Appointment" : "Book an Appointment"}</h1>
            <div className="steps">
                {steps.map((s, i) => <div key={s} className={`step${step === i + 1 ? " on" : ""}${step > i + 1 ? " done" : ""}`}><span>{i + 1}</span>{s}</div>)}
            </div>
            {msg && <div className="alert ok" role="status">{msg}</div>}
            <ErrorBox error={error} />

            {step < 3 && (
                <div className="grid-book">
                    <section>
                        <div className="filters">
                            <div className="search"><Icon name="search" size={16} /><input placeholder="Search doctor, specialization…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
                            <select value={spec} onChange={(e) => setSpec(e.target.value)} aria-label="Specialization">
                                <option value="">All Specializations</option>{specs.data?.map((s) => <option key={s}>{s}</option>)}
                            </select>
                            <select value={hosp} onChange={(e) => setHosp(e.target.value)} aria-label="Hospital">
                                <option value="">All Hospitals</option>{hospitals.data?.map((h) => <option key={h._id} value={h._id}>{h.name}</option>)}
                            </select>
                        </div>
                        {doctors.loading ? <Spinner /> : doctors.error ? <ErrorBox error={doctors.error} /> :
                            doctors.data.length === 0 ? <Empty>No doctors match your search.</Empty> :
                                doctors.data.map((d) => (
                                    <button key={d.id} disabled={!!target} className={`doc-card${doctor?.id === d.id ? " selected" : ""}`} onClick={() => { setDoctor(d); setStep(2); }}>
                                        <Avatar name={d.name} size={52} />
                                        <div className="grow left"><strong>{d.name}</strong><div className="muted small">{d.specialization}</div>
                                            <div className="muted small">★ {d.rating ? d.rating.toFixed(1) : "New"}{d.reviewCount ? ` (${d.reviewCount} reviews)` : ""}</div>
                                            <div className="muted small">{d.hospital ? `${d.hospital.name}${d.hospital.city ? " - " + d.hospital.city : ""}` : "Hospital not assigned"}</div></div>
                                    </button>
                                ))}
                    </section>
                    <section className="card">
                        {!doctor ? <Empty>Select a doctor to see available dates.</Empty> : (
                            <>
                                <div className="row gap mb"><Avatar name={doctor.name} size={36} /><strong>{doctor.name}</strong></div>
                                <div className="grid2 tight">
                                    <div><h4>Select Date</h4><Calendar value={date} onPick={(d) => { setDate(d); setStep(2); }} /></div>
                                    <div><h4>Available Time Slots</h4>
                                        {!date ? <p className="muted small">Pick a date first.</p> : slots === null ? <Spinner /> :
                                            slots.length === 0 ? <p className="muted small">No free slots on {fmtDate(date)}.</p> :
                                                <div className="slots">{slots.map((t) => <button key={t} className={`slot${time === t ? " selected" : ""}`} onClick={() => setTime(t)}>{fmt12(t)}</button>)}</div>}
                                    </div>
                                </div>
                                <button className="btn primary block mt" disabled={!date || !time} onClick={() => setStep(3)}>Continue to Confirm <Icon name="arrow" size={16} /></button>
                            </>
                        )}
                    </section>
                </div>
            )}

            {step === 3 && doctor && (
                <section className="card narrow">
                    <h3>Confirm {target ? "New Time" : "Appointment"}</h3>
                    <div className="summary">
                        <div><span>Doctor</span><strong>{doctor.name}</strong></div>
                        <div><span>Specialization</span><strong>{doctor.specialization}</strong></div>
                        <div><span>Date</span><strong>{fmtDate(date)}</strong></div>
                        <div><span>Time</span><strong>{fmt12(time)}</strong></div>
                    </div>
                    {!target && <label>Reason for visit (optional)<textarea rows={3} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} /></label>}
                    <div className="row gap mt">
                        <button className="btn outline grow" onClick={() => setStep(2)}>Back</button>
                        <button className="btn primary grow" disabled={busy} onClick={confirm}>{busy ? "Saving…" : target ? "Confirm Reschedule" : "Confirm Booking"}</button>
                    </div>
                </section>
            )}

            <h2 className="section-title">Your Upcoming Appointments</h2>
            {mine.loading ? <Spinner /> : mine.data?.length === 0 ? <Empty>You have no upcoming appointments.</Empty> : (
                <div className="list">
                    {mine.data?.map((a) => (
                        <div key={a.id} className="list-row">
                            <Avatar name={a.doctor.name} size={40} />
                            <div className="grow"><strong>{a.doctor.name}</strong> <span className="muted small">{a.doctor.specialization}</span>
                                <div className="muted small">{fmtDate(a.date)} · {fmt12(a.time)}</div></div>
                            <Badge status={a.status} />
                            <Link className="btn outline sm" to={`/patient/appointments?reschedule=${a.id}`}>Reschedule</Link>
                            <button className="btn danger sm" onClick={() => cancel(a.id)}>Cancel</button>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
