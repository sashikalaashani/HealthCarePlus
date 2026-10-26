import { useState } from "react";
import { api, qs } from "../api";
import { fmtDate } from "../format";
import Icon from "../components/Icon";
import { Empty, ErrorBox, Modal, Spinner, Tabs, useFetch } from "../components/ui";

const TABS = [["consultation", "Consultations"], ["test", "Test Results"], ["document", "Documents"], ["", "All Records"]];

export default function Records() {
    const [type, setType] = useState("consultation");
    const [q, setQ] = useState("");
    const [view, setView] = useState(null);
    const { data, error, loading } = useFetch(() => api(`/api/records${qs({ type, q })}`), [type, q]);

    return (
        <>
            <h1 className="page-title">Medical Records</h1>
            <div className="search wide"><Icon name="search" size={16} /><input placeholder="Search records…" value={q} onChange={(e) => setQ(e.target.value)} /></div>
            <Tabs tabs={TABS} value={type} onChange={setType} />
            <ErrorBox error={error} />
            {loading ? <Spinner /> : !data?.length ? (
                <Empty>{type === "document" ? "No documents yet. Document uploads are not available in the backend yet." : "No records found."}</Empty>
            ) : (
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Date</th><th>Doctor</th><th>Reason / Diagnosis</th><th>Notes</th><th>Actions</th></tr></thead>
                        <tbody>
                            {data.map((r) => (
                                <tr key={r.id}>
                                    <td>{fmtDate(r.date)}</td><td>{r.doctor?.name}</td><td>{r.reason}</td><td className="clip">{r.notes}</td>
                                    <td><button className="btn outline sm" onClick={() => setView(r)}>View</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {view && (
                <Modal title="Medical Record" onClose={() => setView(null)}>
                    <dl className="dl">
                        <dt>Date</dt><dd>{fmtDate(view.date)}</dd>
                        <dt>Type</dt><dd>{view.type}</dd>
                        <dt>Doctor</dt><dd>{view.doctor?.name}</dd>
                        <dt>Reason / Diagnosis</dt><dd>{view.reason || "—"}</dd>
                        <dt>Notes</dt><dd>{view.notes || "—"}</dd>
                    </dl>
                </Modal>
            )}
        </>
    );
}
