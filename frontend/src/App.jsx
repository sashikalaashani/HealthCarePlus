import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth, homeFor } from "./auth";
import Layout from "./components/Layout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PatientDashboard from "./pages/PatientDashboard";
import Booking from "./pages/Booking";
import Records from "./pages/Records";
import Prescriptions from "./pages/Prescriptions";
import Notifications from "./pages/Notifications";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Gate: must be signed in (and optionally have one of the given roles).
function Protected({ roles, children }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="center-screen">Loading…</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to={homeFor(user.role)} replace />;
    return <Layout>{children}</Layout>;
}

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route path="/patient" element={<Protected roles={["patient"]}><PatientDashboard /></Protected>} />
            <Route path="/patient/appointments" element={<Protected roles={["patient"]}><Booking /></Protected>} />
            <Route path="/patient/records" element={<Protected roles={["patient"]}><Records /></Protected>} />
            <Route path="/patient/prescriptions" element={<Protected roles={["patient"]}><Prescriptions /></Protected>} />
            <Route path="/notifications" element={<Protected><Notifications /></Protected>} />

            <Route path="/doctor" element={<Protected roles={["doctor"]}><DoctorDashboard /></Protected>} />
            <Route path="/admin" element={<Protected roles={["admin"]}><AdminDashboard /></Protected>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
