import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { adminAPI } from '../api/admin';
import {
  ChartCard,
  EmptyState,
  formatDate,
  formatINR,
  PageHeader,
  PeriodSelect,
  StatCard,
  StatusBadge,
} from '../components/ui';

const STATUS_COLORS = {
  pending: '#F59E0B',
  accepted: '#3B82F6',
  started: '#8B5CF6',
  completed: '#22C55E',
  cancelled: '#EF4444',
};

const CHART_COLORS = ['#8B5CF6', '#22C55E', '#3B82F6', '#F59E0B', '#EC4899', '#14B8A6'];

function Dashboard() {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [legacy, setLegacy] = useState(null);
  const [overview, setOverview] = useState(null);
  const [hourly, setHourly] = useState([]);
  const [tripTypes, setTripTypes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [daily, setDaily] = useState([]);
  const [recent, setRecent] = useState([]);

  const load = useCallback(async () => {
    try {
      setError('');
      const results = await Promise.allSettled([
        adminAPI.getStats(),
        adminAPI.getAnalyticsOverview(days),
        adminAPI.getHourlyDistribution(days),
        adminAPI.getTripTypeAnalytics(days),
        adminAPI.getVehicleCategoryAnalytics(days),
        adminAPI.getRevenueForecast(),
        adminAPI.getRecentRides({ limit: 8 }),
      ]);

      const value = (i, fallback = null) =>
        results[i].status === 'fulfilled' ? results[i].value : fallback;

      const stats = value(0);
      const ov = value(1);
      const hour = value(2, { hourly_distribution: [] });
      const trips = value(3, { trip_types: [] });
      const cats = value(4, { vehicle_categories: [] });
      const forecast = value(5, { daily_data: [] });
      const recentRes = value(6, { rides: [] });

      const failed = results
        .map((r, i) => (r.status === 'rejected' ? i : null))
        .filter((i) => i != null);
      // Overview is required for the main cards; others can fail soft
      if (results[1].status === 'rejected') {
        const err = results[1].reason;
        setError(err?.response?.data?.detail || err?.message || 'Failed to load dashboard analytics');
      } else if (failed.length > 0) {
        setError('');
      }

      setLegacy(stats);
      setOverview(ov);
      const hourlyRows = Array.from({ length: 24 }, (_, h) => {
        const hit = (hour?.hourly_distribution || []).find((row) => Number(row.hour) === h);
        return {
          hour: `${String(h).padStart(2, '0')}:00`,
          rides: hit?.ride_count || 0,
          revenue: hit?.total_revenue || 0,
        };
      });
      setHourly(hourlyRows);
      setTripTypes(
        (trips?.trip_types || []).map((t) => ({
          name: t.trip_type || 'unknown',
          rides: t.ride_count,
          revenue: t.total_revenue,
        }))
      );
      setVehicles(
        (cats?.vehicle_categories || []).map((t) => ({
          name: t.vehicle_category || 'unknown',
          rides: t.ride_count,
          revenue: t.total_revenue,
        }))
      );
      setDaily(
        (forecast?.daily_data || []).map((d) => ({
          date: String(d.date || '').slice(5),
          revenue: d.revenue,
          rides: d.ride_count,
        }))
      );
      setRecent(recentRes?.rides || []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err?.response?.data?.detail || 'Failed to load dashboard analytics');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    setLoading(true);
    load();
    const id = setInterval(load, 60000);
    return () => clearInterval(id);
  }, [load]);

  const statusData = useMemo(() => {
    const map = overview?.rides_by_status || {};
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [overview]);

  if (loading && !overview) {
    return (
      <div className="page-container">
        <div className="loading">Loading insights…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Dashboard"
        subtitle="Live platform insights from completed bookings"
        actions={
          <>
            <PeriodSelect value={days} onChange={setDays} />
            <button type="button" className="ui-btn ui-btn-primary" onClick={load}>
              Refresh
            </button>
          </>
        }
      />

      {lastUpdated && (
        <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: -12, marginBottom: 16 }}>
          Updated {lastUpdated.toLocaleTimeString('en-IN')} · auto-refresh every 60s
        </p>
      )}

      {error && (
        <div className="error-box">
          {error}{' '}
          <button type="button" className="ui-btn" onClick={load} style={{ marginLeft: 8 }}>
            Retry
          </button>
        </div>
      )}

      <div className="ui-stat-grid">
        <StatCard label="Users" value={legacy?.total_users ?? '—'} hint="All-time accounts" />
        <StatCard label="Drivers" value={legacy?.total_drivers ?? '—'} hint="Registered captains" />
        <StatCard label="Rides" value={overview?.total_rides ?? 0} hint={`Last ${days} days`} />
        <StatCard label="Revenue" value={formatINR(overview?.total_revenue)} color="#22C55E" hint={`Last ${days} days`} />
        <StatCard label="Completion" value={`${overview?.completion_rate ?? 0}%`} color="#8B5CF6" />
        <StatCard label="Avg fare" value={formatINR(overview?.average_fare)} color="#F59E0B" />
        <StatCard label="Active" value={overview?.active_rides ?? 0} color="#3B82F6" />
        <StatCard label="Cancelled" value={overview?.cancelled_rides ?? 0} color="#EF4444" />
      </div>

      <div className="ui-chart-grid">
        <ChartCard title="Revenue & rides (last 30 days)">
          {daily.length === 0 ? (
            <EmptyState message="No completed rides in the last 30 days" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={daily}>
                <defs>
                  <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#8B5CF6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" fill="url(#revFill)" name="Revenue" />
                <Area type="monotone" dataKey="rides" stroke="#22C55E" fill="transparent" name="Rides" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Rides by status">
          {statusData.length === 0 ? (
            <EmptyState message="No ride status data" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name] || '#64748B'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {statusData.map((s) => (
              <span key={s.name} className={`ui-badge ${s.name}`}>
                {s.name}: {s.value}
              </span>
            ))}
          </div>
        </ChartCard>

        <ChartCard title={`Hourly demand (${days}d)`}>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={hourly}>
              <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
              <XAxis dataKey="hour" stroke="#64748B" fontSize={10} interval={3} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
              />
              <Bar dataKey="rides" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Vehicle mix (completed)">
          {vehicles.length === 0 ? (
            <EmptyState message="No vehicle category data" />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={vehicles} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis type="category" dataKey="name" stroke="#64748B" fontSize={11} width={70} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Bar dataKey="rides" radius={[0, 4, 4, 0]}>
                  {vehicles.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      {tripTypes.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <ChartCard title="Trip type mix">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tripTypes}>
                <CartesianGrid stroke="#334155" strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{ background: '#1E293B', border: '1px solid #334155', borderRadius: 8 }}
                />
                <Bar dataKey="rides" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Rides" />
                <Bar dataKey="revenue" fill="#8B5CF6" radius={[4, 4, 0, 0]} name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      )}

      <div className="ops-layout" style={{ marginBottom: 24 }}>
        <div className="dash-side">
          <h3>Recent rides</h3>
          {recent.length === 0 ? (
            <EmptyState message="No recent rides" />
          ) : (
            recent.map((ride) => (
              <div key={ride.id} className="recent-row">
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                  <strong style={{ fontSize: 13 }}>{ride.vehicle_category || 'Ride'}</strong>
                  <StatusBadge status={ride.status} />
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {(ride.pickup_location || 'Pickup').slice(0, 42)}
                  {ride.dropoff_location ? ` → ${(ride.dropoff_location || '').slice(0, 28)}` : ''}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  {formatINR(ride.fare)} · {formatDate(ride.created_at)}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <h3 style={{ marginBottom: 12, fontSize: 14 }}>Quick actions</h3>
          <div className="quick-links">
            <Link className="quick-link" to="/active-rides">
              <h4>Active rides</h4>
              <p>Live map of trips in progress</p>
            </Link>
            <Link className="quick-link" to="/drivers">
              <h4>Driver KYC</h4>
              <p>Approve pending captain documents</p>
            </Link>
            <Link className="quick-link" to="/pricing">
              <h4>Pricing</h4>
              <p>Update fares and vehicle rates</p>
            </Link>
            <Link className="quick-link" to="/driver-locations">
              <h4>Driver map</h4>
              <p>See online captains on the map</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
