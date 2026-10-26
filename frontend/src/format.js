const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function fmtDate(s) {
    if (!s) return "";
    const [y, m, d] = s.split("-").map(Number);
    return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}

export function fmt12(t) {
    if (!t) return "";
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
}

export function ago(iso) {
    const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)} min ago`;
    if (s < 86400) return `${Math.floor(s / 3600)} hours ago`;
    return `${Math.floor(s / 86400)} day${s >= 172800 ? "s" : ""} ago`;
}

export const ymd = (d) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const initials = (name = "") => name.replace(/^Dr\.?\s+/i, "").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

export const STATUS = {
    confirmed: ["Confirmed", "green"],
    scheduled: ["Scheduled", "blue"],
    checked_in: ["Checked In", "green"],
    waiting: ["Waiting", "amber"],
    completed: ["Completed", "grey"],
    cancelled: ["Cancelled", "red"]
};
