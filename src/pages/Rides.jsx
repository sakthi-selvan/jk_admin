import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import './Users.css';

function Rides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRides();
  }, []);

  const loadRides = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getRides();
      setRides(data);
      setError('');
    } catch (err) {
      setError('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'Pending',
      'ACCEPTED': 'Accepted',
      'STARTED': 'In Progress',
      'COMPLETED': 'Completed',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading rides...</div>
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

  const activeRides = rides.filter(r => ['PENDING', 'ACCEPTED', 'STARTED'].includes(r.status)).length;
  const completedRides = rides.filter(r => r.status === 'COMPLETED').length;
  const totalRevenue = rides
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + (r.fare || 0), 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Rides</h1>
          <p>Monitor all ride activities</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number">{rides.length}</span>
            <span className="stat-text">Total Rides</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#22C55E'}}>{activeRides}</span>
            <span className="stat-text">Active</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#6366F1'}}>{completedRides}</span>
            <span className="stat-text">Completed</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#F59E0B'}}>₹{totalRevenue.toFixed(0)}</span>
            <span className="stat-text">Revenue</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ride ID</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {rides.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No rides found</td>
              </tr>
            ) : (
              rides.map((ride) => (
                <tr key={ride.id}>
                  <td>
                    <div style={{fontFamily: 'monospace', fontSize: '13px'}}>
                      {ride.id.substring(0, 8)}...
                    </div>
                  </td>
                  <td>
                    <div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {ride.pickup_address}
                    </div>
                  </td>
                  <td>
                    <div style={{maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                      {ride.dropoff_address}
                    </div>
                  </td>
                  <td>
                    <span style={{fontWeight: 600, color: '#8B5CF6'}}>
                      ₹{ride.fare?.toFixed(2) || '0.00'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${ride.status.toLowerCase()}`}>
                      {getStatusLabel(ride.status)}
                    </span>
                  </td>
                  <td>{formatDate(ride.created_at)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Rides;
