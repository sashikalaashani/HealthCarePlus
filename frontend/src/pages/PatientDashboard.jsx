import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import { fmt12, fmtDate } from "../format";
import Icon from "../components/Icon";
import { Avatar, Badge, ErrorBox, Spinner, StatCard, useFetch } from "../components/ui";

export default function PatientDashboard() {
    const { user } = useAuth();
    const nav = useNavigate();
    const { data, error, loading } = useFetch(() => api("/api/patients/me/dashboard"));
    if (loading) return <Spinner />;
    if (error) return <ErrorBox error={error} />;
    const { stats, nextAppointment: next } = data;

    return (
        <>
            <h1 className="page-title">Welcome back, {user.name.split(" ")[0]}!</h1>
            <p className="muted">Here's an overview of your health and upcoming appointments.</p>
            <div className="grid4">
                <StatCard icon="calendar" label="Upcoming Appointments" value={stats.upcomingAppointments} />
                <StatCard icon="file" label="Medical Records" value={stats.medicalRecords} tone="green" />
                <StatCard icon="pill" label="Prescriptions" value={stats.prescriptions} tone="amber" />
                <StatCard icon="bell" label="Notifications" value={stats.notifications} tone="red" />
            </div>
            <div className="grid2">
                <section className="card">
                    <h3>Next Appointment</h3>
                    {next ? (
                        <>
                            <div className="row gap">
                                <Avatar name={next.doctor.name} size={56} />
                                <div className="grow">
                                    <strong>{next.doctor.name}</strong> <Badge status={next.status} />
                                    <div className="muted">{next.doctor.specialization}</div>
                                    <div className="muted">{next.doctor.hospital}</div>
                                    <div className="muted small"><Icon name="clock" size={13} /> {fmtDate(next.date)} {fmt12(next.time)}</div>
                                </div>
                            </div>
                            <div className="row gap mt">
                                <button className="btn outline grow" onClick={() => nav("/patient/appointments")}>View Details</button>
                                <button className="btn primary grow" onClick={() => nav(`/patient/appointments?reschedule=${next.id}`)}>Reschedule</button>
                            </div>
                        </>
                    ) : (
                        <div className="empty">No upcoming appointments. <Link to="/patient/appointments">Book one now</Link></div>
                    )}
                </section>
                <section className="card">
                    <h3>Quick Actions</h3>
                    <div className="quick">
                        {[
                            ["calendar", "Book Appointment", "/patient/appointments"],
                            ["file", "View Medical Records", "/patient/records"],
                            ["pill", "My Prescriptions", "/patient/prescriptions"],
                            ["search", "Find a Doctor", "/patient/appointments"]
                        ].map(([i, l, to]) => (
                            <Link key={l} to={to} className="quick-item"><span className="stat-icon blue"><Icon name={i} /></span>{l}</Link>
                        ))}
                    </div>
                </section>
            </div>
        </>
    );
}
