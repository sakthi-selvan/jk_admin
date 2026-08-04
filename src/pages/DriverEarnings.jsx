import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import './Users.css';

function DriverEarnings() {
  const [earnings, setEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('month');

  useEffect(() => {
    loadEarnings();
  }, []);

  const loadEarnings = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDriverEarnings();
      setEarnings(data);
      setError('');
    } catch (err) {
      setError('Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  };

  const sortedEarnings = [...earnings].sort((a, b) => {
    return b[sortBy].earnings - a[sortBy].earnings;
  });

  const totalToday = earnings.reduce((sum, d) => sum + d.today.earnings, 0);
  const totalWeek = earnings.reduce((sum, d) => sum + d.week.earnings, 0);
  const totalMonth = earnings.reduce((sum, d) => sum + d.month.earnings, 0);
  const totalAll = earnings.reduce((sum, d) => sum + d.total.earnings, 0);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading earnings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-box">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Driver Earnings</h1>
          <p>Revenue breakdown by driver</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number" style={{color: '#F59E0B'}}>₹{totalToday.toFixed(0)}</span>
            <span className="stat-text">Today</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#3B82F6'}}>₹{totalWeek.toFixed(0)}</span>
            <span className="stat-text">This Week</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#10B981'}}>₹{totalMonth.toFixed(0)}</span>
            <span className="stat-text">This Month</span>
          </div>
        </div>
      </div>

      {/* Sort Tabs */}
      <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
        {['today', 'week', 'month', 'total'].map(period => (
          <button
            key={period}
            onClick={() => setSortBy(period)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: sortBy === period ? '2px solid #6366F1' : '1px solid #E0E0E0',
              backgroundColor: sortBy === period ? '#EEF2FF' : '#fff',
              color: sortBy === period ? '#4F46E5' : '#666',
              fontWeight: sortBy === period ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {period === 'total' ? 'All Time' : period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'Today'}
          </button>
        ))}
      </div>

      {/* Earnings Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Driver</th>
              <th>Status</th>
              <th>Today</th>
              <th>This Week</th>
              <th>This Month</th>
              <th>All Time</th>
            </tr>
          </thead>
          <tbody>
            {sortedEarnings.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No earnings data</td>
              </tr>
            ) : (
              sortedEarnings.map((driver, idx) => (
                <tr key={driver.driver_id}>
                  <td style={{fontWeight: 600, color: '#999'}}>{idx + 1}</td>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{driver.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={{fontWeight: 500}}>{driver.name}</div>
                        <div style={{fontSize: '12px', color: '#94A3B8'}}>{driver.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${driver.is_online ? 'online' : 'offline'}`}>
                      {driver.is_online ? 'Online' : 'Offline'}
                    </span>
                  </td>
                  <td>
                    <div style={{fontWeight: 600}}>₹{driver.today.earnings}</div>
                    <div style={{fontSize: '11px', color: '#94A3B8'}}>{driver.today.rides} rides</div>
                  </td>
                  <td>
                    <div style={{fontWeight: 600}}>₹{driver.week.earnings}</div>
                    <div style={{fontSize: '11px', color: '#94A3B8'}}>{driver.week.rides} rides</div>
                  </td>
                  <td>
                    <div style={{fontWeight: 600, color: '#10B981'}}>₹{driver.month.earnings}</div>
                    <div style={{fontSize: '11px', color: '#94A3B8'}}>{driver.month.rides} rides</div>
                  </td>
                  <td>
                    <div style={{fontWeight: 700}}>₹{driver.total.earnings}</div>
                    <div style={{fontSize: '11px', color: '#94A3B8'}}>{driver.total.rides} rides</div>
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
