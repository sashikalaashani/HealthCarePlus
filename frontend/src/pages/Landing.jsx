import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth, homeFor } from "../auth";
import Icon from "../components/Icon";
import { Avatar, Logo, useFetch } from "../components/ui";

const fmtCount = (n) => (n === undefined ? "—" : n >= 1000 ? `${Math.floor(n / 100) / 10}K+` : n);

export default function Landing() {
    const { user } = useAuth();
    const stats = useFetch(() => api("/api/public/stats"));
    const doctors = useFetch(() => api("/api/doctors"));
    const s = stats.data || {};
    const scroll = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

    return (
        <div className="landing">
            <header className="land-nav">
                <Logo />
                <nav className="land-links">
                    <a href="#top" onClick={(e) => { e.preventDefault(); scroll("top"); }}>Home</a>
                    <a href="#services" onClick={(e) => { e.preventDefault(); scroll("services"); }}>Services</a>
                    <a href="#doctors" onClick={(e) => { e.preventDefault(); scroll("doctors"); }}>Doctors</a>
                    <a href="#about" onClick={(e) => { e.preventDefault(); scroll("about"); }}>About</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); scroll("contact"); }}>Contact</a>
                </nav>
                <div className="row gap">
                    {user ? <Link className="btn primary" to={homeFor(user.role)}>Go to dashboard</Link> : <>
                        <Link className="btn outline" to="/login">Login</Link>
                        <Link className="btn primary" to="/signup">Sign Up</Link>
                    </>}
                </div>
            </header>

            <section id="top" className="hero">
                <div className="hero-text">
                    <span className="chip"><Icon name="heart" size={14} /> YOUR HEALTH, OUR PRIORITY</span>
                    <h1>Better Care,<br />Healthier Lives</h1>
                    <p>A modern healthcare management system connecting patients, doctors and hospitals for a better healthcare experience.</p>
                    <div className="row gap">
                        <Link to={user?.role === "patient" ? "/patient/appointments" : "/signup"} className="btn primary lg">Book an Appointment <Icon name="arrow" size={16} /></Link>
                        <button className="btn outline lg" onClick={() => scroll("services")}>Explore Services</button>
                    </div>
                </div>
                <div className="hero-art" aria-hidden="true">
                    <div className="hero-circle"><Icon name="cross" size={120} /></div>
                    <div className="hero-card"><Icon name="shield" size={22} /><div><strong>Your Health</strong><br />Our Priority</div></div>
                </div>
            </section>

            <section className="stat-strip">
                {[
                    ["users", fmtCount(s.doctors), "Specialist Doctors"],
                    ["heart", fmtCount(s.patients), "Registered Patients"],
                    ["building", fmtCount(s.hospitals), "Partner Hospitals"],
                    ["clock", "24/7", "Online Booking"]
                ].map(([icon, v, l]) => (
                    <div key={l} className="strip-item"><span className="stat-icon blue"><Icon name={icon} /></span><div><strong>{v}</strong><small>{l}</small></div></div>
                ))}
            </section>

            <section id="services" className="land-section">
                <h2>Services</h2>
                <div className="grid3">
                    {[
                        ["calendar", "Book Appointments", "Find a specialist, pick a time slot and confirm in a few clicks."],
                        ["file", "Medical Records", "Consultations and test results kept together and always available."],
                        ["pill", "Prescriptions", "View current and past prescriptions from your doctors."]
                    ].map(([i, t, d]) => (
                        <div key={t} className="card"><span className="stat-icon blue"><Icon name={i} /></span><h3>{t}</h3><p className="muted">{d}</p></div>
                    ))}
                </div>
            </section>

            <section id="doctors" className="land-section">
                <h2>Our Doctors</h2>
                {doctors.loading ? <p className="muted">Loading…</p> : doctors.error ? <p className="muted">Doctors are unavailable right now.</p> :
                    doctors.data.length === 0 ? <p className="muted">No doctors are listed yet.</p> :
                        <div className="grid3">
                            {doctors.data.slice(0, 6).map((d) => (
                                <div key={d.id} className="card row gap"><Avatar name={d.name} size={52} />
                                    <div><strong>{d.name}</strong><div className="muted">{d.specialization}</div><small className="muted">{d.hospital?.name}</small></div></div>
                            ))}
                        </div>}
            </section>

            <section id="about" className="land-section">
                <h2>About</h2>
                <p className="muted narrow">HealthCarePlus brings patients, doctors and hospital administrators onto one platform: online appointment booking, digital medical records, prescriptions and timely notifications.</p>
            </section>
            <footer id="contact" className="land-footer">© {new Date().getFullYear()} HealthCarePlus · Contact: support@healthcareplus.example</footer>
        </div>
    );
}
