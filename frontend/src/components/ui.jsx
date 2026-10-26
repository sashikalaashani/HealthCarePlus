import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./Icon";
import { STATUS, initials } from "../format";

export const Logo = ({ to = "/" }) => (
    <Link to={to} className="logo">
        <span className="logo-mark"><Icon name="cross" size={16} /></span>
        <span>HealthCare<b>Plus</b></span>
    </Link>
);

export const Badge = ({ status }) => {
    const [label, tone] = STATUS[status] || [status, "grey"];
    return <span className={`badge ${tone}`}>{label}</span>;
};

export const Avatar = ({ name, size = 44 }) => (
    <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.36 }}>{initials(name)}</span>
);

export const Spinner = ({ text = "Loading…" }) => <div className="muted pad">{text}</div>;
export const ErrorBox = ({ error }) => (error ? <div className="alert error" role="alert">{error}</div> : null);
export const Empty = ({ children }) => <div className="empty">{children}</div>;

export function Modal({ title, onClose, children }) {
    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <h3>{title}</h3>
                    <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
                </div>
                {children}
            </div>
        </div>
    );
}

export const Tabs = ({ tabs, value, onChange }) => (
    <div className="tabs" role="tablist">
        {tabs.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={value === k} className={value === k ? "active" : ""} onClick={() => onChange(k)}>{label}</button>
        ))}
    </div>
);

export const StatCard = ({ icon, label, value, tone = "blue" }) => (
    <div className="stat-card">
        <span className={`stat-icon ${tone}`}><Icon name={icon} /></span>
        <div><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
    </div>
);

// Simple async-loading hook: { data, error, loading, reload }
export function useFetch(fn, deps = []) {
    const [state, setState] = useState({ data: null, error: "", loading: true });
    const run = useCallback(() => {
        setState((s) => ({ ...s, loading: true, error: "" }));
        return fn().then((data) => setState({ data, error: "", loading: false }))
            .catch((e) => setState({ data: null, error: e.message, loading: false }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
    useEffect(() => { run(); }, [run]);
    return { ...state, reload: run };
}
