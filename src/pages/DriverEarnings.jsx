import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminAPI } from '../api/admin';
import { ChartCard, EmptyState, formatINR, PageHeader, StatusBadge } from '../components/ui';

function DriverEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('month');
  const [search, setSearch] = useState('');

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDriverEarnings();
      setEarnings(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEarnings();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = earnings;
    if (q) {
      rows = rows.filter((d) =>
        [d.name, d.phone].some((v) => String(v || '').toLowerCase().includes(q))
      );
    }
    return [...rows].sort((a, b) => (b[sortBy]?.earnings || 0) - (a[sortBy]?.earnings || 0));
  }, [earnings, search, sortBy]);

  const totals = useMemo(() => ({
    today: earnings.reduce((s, d) => s + (d.today?.earnings || 0), 0),
    week: earnings.reduce((s, d) => s + (d.week?.earnings || 0), 0),
    month: earnings.reduce((s, d) => s + (d.month?.earnings || 0), 0),
    total: earnings.reduce((s, d) => s + (d.total?.earnings || 0), 0),
  }), [earnings]);

  const chartData = filtered.slice(0, 10).map((d) => ({
    name: (d.name || 'Driver').split(' ')[0],
    earnings: d[sortBy]?.earnings || 0,
  }));

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading earnings…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Driver Earnings"
        subtitle="Leaderboard and period totals across active captains"
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#F59E0B' }}>{formatINR(totals.today)}</span>
              <span className="stat-text">Today</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#3B82F6' }}>{formatINR(totals.week)}</span>
              <span className="stat-text">Week</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#22C55E' }}>{formatINR(totals.month)}</span>
              <span className="stat-text">Month</span>
            </div>
            <div className="header-stat">
              <span className="stat-number">{formatINR(totals.total)}</span>
              <span className="stat-text">All time</span>
            </div>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      <div className="ui-toolbar">
        <input
          className="ui-search"
          placeholder="Search driver…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ui-tabs">
          {[
            ['today', 'Today'],
            ['week', 'Week'],
            ['month', 'Month'],
            ['total', 'All time'],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`ui-tab ${sortBy === key ? 'active' : ''}`}
              onClick={() => setSortBy(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="ui-btn" onClick={loadEarnings}>Refresh</button>
      </div>

      <div style={{ marginBottom: 20 }}>
        <ChartCard title={`Top drivers by ${sortBy}`}>
          {chartData.length === 0 ? (
            <EmptyState message="No earnings yet" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                  formatter={(v) => formatINR(v)}
                />
                <Bar dataKey="earnings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Today</th>
              <th>Week</th>
              <th>Month</th>
              <th>All time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No earnings data</td>
              </tr>
            ) : (
              filtered.map((driver, idx) => (
                <tr key={driver.driver_id}>
                  <td style={{ color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{(driver.name || '?').charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{driver.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{driver.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge status={driver.is_online ? 'online' : 'offline'} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatINR(driver.today.earnings)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.today.rides} rides</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{formatINR(driver.week.earnings)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.week.rides} rides</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#4ADE80' }}>{formatINR(driver.month.earnings)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.month.rides} rides</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{formatINR(driver.total.earnings)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{driver.total.rides} rides</div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DriverEarnings;
