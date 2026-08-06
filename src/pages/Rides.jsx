import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../api/admin';
import { Drawer, formatDate, formatINR, PageHeader, StatusBadge } from '../components/ui';

function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState(null);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getRecentRides({
        limit: 200,
        status: status || undefined,
      });
      setRides(data?.rides || []);
      setError('');
    } catch {
      setError('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRides();
  }, [status]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rides;
    return rides.filter((r) =>
      [r.id, r.pickup_location, r.dropoff_location, r.vehicle_category, r.trip_type, r.status]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [rides, search]);

  const stats = useMemo(() => {
    const active = rides.filter((r) => ['pending', 'accepted', 'started'].includes(r.status)).length;
    const completed = rides.filter((r) => r.status === 'completed').length;
    const revenue = rides
      .filter((r) => r.status === 'completed')
      .reduce((sum, r) => sum + (Number(r.fare) || 0), 0);
    return { active, completed, revenue, total: rides.length };
  }, [rides]);

  if (loading && rides.length === 0) {
    return (
      <div className="page-container">
        <div className="loading">Loading rides…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Rides"
        subtitle="Enhanced booking history with live status filters"
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-text">Listed</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#22C55E' }}>{stats.active}</span>
              <span className="stat-text">Active</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#F59E0B' }}>{formatINR(stats.revenue)}</span>
              <span className="stat-text">Revenue</span>
            </div>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      <div className="ui-toolbar">
        <input
          className="ui-search"
          placeholder="Search pickup, drop, vehicle, id…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ui-tabs">
          {[
            ['', 'All'],
            ['pending', 'Pending'],
            ['accepted', 'Accepted'],
            ['started', 'Started'],
            ['completed', 'Completed'],
            ['cancelled', 'Cancelled'],
          ].map(([key, label]) => (
            <button
              key={label}
              type="button"
              className={`ui-tab ${status === key ? 'active' : ''}`}
              onClick={() => setStatus(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="ui-btn" onClick={loadRides}>Refresh</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ride</th>
              <th>Route</th>
              <th>Vehicle</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No rides found</td>
              </tr>
            ) : (
              filtered.map((ride) => (
                <tr key={ride.id} className="clickable" onClick={() => setSelected(ride)}>
                  <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                    {String(ride.id).slice(0, 8)}…
                  </td>
                  <td>
                    <div style={{ maxWidth: 260 }}>
                      <div style={{ fontSize: 13 }}>{(ride.pickup_location || 'Pickup').slice(0, 48)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        → {(ride.dropoff_location || 'Drop').slice(0, 48)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{ride.vehicle_category || '—'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ride.trip_type || ''}</div>
                  </td>
                  <td style={{ fontWeight: 600, color: '#A78BFA' }}>{formatINR(ride.fare)}</td>
                  <td><StatusBadge status={ride.status} /></td>
                  <td>{formatDate(ride.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Drawer open={!!selected} title="Ride details" onClose={() => setSelected(null)}>
        {selected && (
          <div className="ui-meta">
            <div className="ui-meta-row"><span>ID</span><span style={{ fontFamily: 'monospace' }}>{selected.id}</span></div>
            <div className="ui-meta-row"><span>Status</span><span><StatusBadge status={selected.status} /></span></div>
            <div className="ui-meta-row"><span>Fare</span><span>{formatINR(selected.fare)}</span></div>
            <div className="ui-meta-row"><span>Distance</span><span>{selected.distance_km != null ? `${Number(selected.distance_km).toFixed(1)} km` : '—'}</span></div>
            <div className="ui-meta-row"><span>Vehicle</span><span>{selected.vehicle_category || '—'}</span></div>
            <div className="ui-meta-row"><span>Trip type</span><span>{selected.trip_type || '—'}</span></div>
            <div className="ui-meta-row"><span>Pickup</span><span>{selected.pickup_location || '—'}</span></div>
            <div className="ui-meta-row"><span>Drop</span><span>{selected.dropoff_location || '—'}</span></div>
            <div className="ui-meta-row"><span>Created</span><span>{formatDate(selected.created_at)}</span></div>
            <div className="ui-meta-row"><span>Started</span><span>{formatDate(selected.started_at)}</span></div>
            <div className="ui-meta-row"><span>Completed</span><span>{formatDate(selected.completed_at)}</span></div>
          </div>
        )}
      </Drawer>
    </div>
  );
}

export default Rides;
