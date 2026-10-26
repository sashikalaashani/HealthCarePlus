import { useState } from "react";
import { api } from "../api";
import { fmtDate } from "../format";
import Icon from "../components/Icon";
import { Empty, ErrorBox, Modal, Spinner, Tabs, useFetch } from "../components/ui";

export default function Prescriptions() {
    const [tab, setTab] = useState("active");
    const [view, setView] = useState(null);
    const { data, error, loading } = useFetch(() => api(`/api/prescriptions?status=${tab}`), [tab]);

    return (
        <>
            <h1 className="page-title">My Prescriptions</h1>
            <p className="muted">View and manage your prescriptions.</p>
            <Tabs tabs={[["active", "Current"], ["completed", "Past"]]} value={tab} onChange={setTab} />
            <ErrorBox error={error} />
            {loading ? <Spinner /> : !data?.length ? <Empty>No {tab === "active" ? "current" : "past"} prescriptions.</Empty> : (
                <div className="list">
                    {data.map((p) => (
                        <div key={p.id} className="card rx">
                            <span className="stat-icon blue"><Icon name="file" /></span>
                            <div className="grow"><strong>{p.doctor?.name}</strong><div className="muted small">{fmtDate(p.date)}</div></div>
                            <ul className="rx-items">
                                {p.items.map((i, n) => <li key={n}><strong>{i.name}</strong>{(i.dosage || i.frequency) && <span className="muted small"> — {[i.dosage, i.frequency].filter(Boolean).join(", ")}</span>}</li>)}
                            </ul>
                            <span className={`badge ${p.status === "active" ? "green" : "blue"}`}>{p.status === "active" ? "Active" : "Completed"}</span>
                            <button className="btn outline sm" onClick={() => setView(p)}>View</button>
                        </div>
                    ))}
                </div>
            )}
            {view && (
                <Modal title="Prescription" onClose={() => setView(null)}>
                    <dl className="dl"><dt>Doctor</dt><dd>{view.doctor?.name}</dd><dt>Date</dt><dd>{fmtDate(view.date)}</dd></dl>
                    <table><thead><tr><th>Medicine</th><th>Dosage</th><th>Frequency</th></tr></thead>
                        <tbody>{view.items.map((i, n) => <tr key={n}><td>{i.name}</td><td>{i.dosage || "—"}</td><td>{i.frequency || "—"}</td></tr>)}</tbody></table>
                </Modal>
            )}
        </>
    );
}
