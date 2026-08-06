import '../components/ui.css';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {actions ? <div className="header-stats">{actions}</div> : null}
    </div>
  );
}

export function StatCard({ label, value, hint, color }) {
  return (
    <div className="ui-stat-card">
      <div className="ui-stat-label">{label}</div>
      <div className="ui-stat-value" style={color ? { color } : undefined}>{value}</div>
      {hint ? <div className="ui-stat-hint">{hint}</div> : null}
    </div>
  );
}

export function StatusBadge({ status }) {
  const key = String(status || 'unknown').toLowerCase();
  return <span className={`ui-badge ${key}`}>{key}</span>;
}

export function EmptyState({ message = 'Nothing to show yet' }) {
  return <div className="ui-empty">{message}</div>;
}

export function PeriodSelect({ value, onChange }) {
  return (
    <div className="ui-tabs">
      {[7, 30, 90].map((d) => (
        <button
          key={d}
          type="button"
          className={`ui-tab ${value === d ? 'active' : ''}`}
          onClick={() => onChange(d)}
        >
          {d}d
        </button>
      ))}
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div className="ui-chart-card">
      <h3>{title}</h3>
      {children}
    </div>
  );
}

export function Modal({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div className="ui-modal-mask" onClick={onClose}>
      <div className="ui-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ui-modal-hd">
          <h2>{title}</h2>
          <button type="button" className="ui-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ui-modal-body">{children}</div>
        {actions ? <div className="ui-modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export function Drawer({ open, title, onClose, children, actions }) {
  if (!open) return null;
  return (
    <div className="ui-modal-mask" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div className="ui-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="ui-drawer-hd">
          <h2>{title}</h2>
          <button type="button" className="ui-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className="ui-drawer-body">{children}</div>
        {actions ? <div className="ui-modal-actions">{actions}</div> : null}
      </div>
    </div>
  );
}

export function formatDate(value) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatINR(value) {
  const n = Number(value) || 0;
  return `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}
