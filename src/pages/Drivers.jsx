import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import './Users.css';

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, active, blocked

  useEffect(() => {
    loadDrivers();
  }, []);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDrivers();
      setDrivers(data);
      setError('');
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (driverId) => {
    try {
      setActionLoading(driverId);
      await adminAPI.unblockDriver(driverId);
      await loadDrivers();
      setSelectedDriver(null);
    } catch (err) {
      alert('Failed to approve driver');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBlock = async (driverId) => {
    if (!confirm('Are you sure you want to block/deactivate this driver?')) return;
    try {
      setActionLoading(driverId);
      await adminAPI.blockDriver(driverId);
      await loadDrivers();
      setSelectedDriver(null);
    } catch (err) {
      alert('Failed to block driver');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (driverId) => {
    try {
      setActionLoading(driverId);
      await adminAPI.unblockDriver(driverId);
      await loadDrivers();
    } catch (err) {
      alert('Failed to unblock driver');
    } finally {
      setActionLoading(null);
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

  const filteredDrivers = drivers.filter(d => {
    if (filter === 'pending') return !d.is_active;
    if (filter === 'active') return d.is_active;
    if (filter === 'blocked') return !d.is_active && d.is_verified;
    return true;
  });

  const pendingCount = drivers.filter(d => !d.is_active).length;
  const onlineDrivers = drivers.filter(d => d.is_online && d.is_active).length;

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading drivers...</div>
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
          <h1>Drivers</h1>
          <p>Manage driver accounts and approvals</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number">{drivers.length}</span>
            <span className="stat-text">Total</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#F59E0B'}}>{pendingCount}</span>
            <span className="stat-text">Pending</span>
          </div>
          <div className="header-stat">
            <span className="stat-number" style={{color: '#22C55E'}}>{onlineDrivers}</span>
            <span className="stat-text">Online</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{display: 'flex', gap: '8px', marginBottom: '20px'}}>
        {['all', 'pending', 'active'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: filter === f ? '2px solid #6366F1' : '1px solid #E0E0E0',
              backgroundColor: filter === f ? '#EEF2FF' : '#fff',
              color: filter === f ? '#4F46E5' : '#666',
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {f} {f === 'pending' && pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        ))}
      </div>

      {/* Driver Detail Modal */}
      {selectedDriver && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '24px',
            maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
              <h2 style={{margin: 0}}>Driver Details</h2>
              <button onClick={() => setSelectedDriver(null)} style={{
                background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666'
              }}>✕</button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px'}}>
              <div><strong>Name:</strong> {selectedDriver.name}</div>
              <div><strong>Phone:</strong> {selectedDriver.phone}</div>
              <div><strong>Email:</strong> {selectedDriver.email || 'N/A'}</div>
              <div><strong>Vehicle:</strong> {selectedDriver.vehicle_number || 'N/A'}</div>
              <div><strong>Vehicle Type:</strong> {selectedDriver.vehicle_type || 'N/A'}</div>
              <div><strong>Joined:</strong> {formatDate(selectedDriver.created_at)}</div>
              <div>
                <strong>Status: </strong>
                <span style={{
                  padding: '2px 8px', borderRadius: '4px',
                  backgroundColor: selectedDriver.is_active ? '#D1FAE5' : '#FEF3C7',
                  color: selectedDriver.is_active ? '#065F46' : '#92400E',
                  fontWeight: 600, fontSize: '12px'
                }}>
                  {selectedDriver.is_active ? 'Active' : 'Pending Approval'}
                </span>
              </div>
            </div>

            {/* Documents Section */}
            <h3 style={{marginBottom: '12px', color: '#333'}}>Documents</h3>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
              <div>
                <p style={{fontWeight: 600, marginBottom: '8px', color: '#555'}}>Driving License</p>
                {selectedDriver.license_document ? (
                  <img
                    src={selectedDriver.license_document}
                    alt="License"
                    style={{width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0'}}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '160px', backgroundColor: '#F5F5F5',
                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#999', border: '1px dashed #CCC'
                  }}>Not uploaded</div>
                )}
              </div>
              <div>
                <p style={{fontWeight: 600, marginBottom: '8px', color: '#555'}}>Aadhar Card</p>
                {selectedDriver.aadhar_document ? (
                  <img
                    src={selectedDriver.aadhar_document}
                    alt="Aadhar"
                    style={{width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #E0E0E0'}}
                  />
                ) : (
                  <div style={{
                    width: '100%', height: '160px', backgroundColor: '#F5F5F5',
                    borderRadius: '8px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: '#999', border: '1px dashed #CCC'
                  }}>Not uploaded</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{display: 'flex', gap: '12px'}}>
              {!selectedDriver.is_active ? (
                <button
                  onClick={() => handleApprove(selectedDriver.id)}
                  disabled={actionLoading === selectedDriver.id}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#10B981', color: '#fff', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  {actionLoading === selectedDriver.id ? 'Approving...' : '✓ Approve & Activate'}
                </button>
              ) : (
                <button
                  onClick={() => handleBlock(selectedDriver.id)}
                  disabled={actionLoading === selectedDriver.id}
                  style={{
                    flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                    backgroundColor: '#EF4444', color: '#fff', fontWeight: 600,
                    fontSize: '14px', cursor: 'pointer'
                  }}
                >
                  {actionLoading === selectedDriver.id ? 'Blocking...' : '✕ Block / Deactivate'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drivers Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Vehicle</th>
              <th>Documents</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDrivers.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No drivers found</td>
              </tr>
            ) : (
              filteredDrivers.map((driver) => (
                <tr key={driver.id} onClick={() => setSelectedDriver(driver)} style={{cursor: 'pointer'}}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{driver.name.charAt(0).toUpperCase()}</div>
                      <span>{driver.name}</span>
                    </div>
                  </td>
                  <td>{driver.phone}</td>
                  <td>
                    {driver.vehicle_number ? (
                      <div>
                        <div style={{fontWeight: 500}}>{driver.vehicle_number}</div>
                        <div style={{fontSize: '12px', color: '#94A3B8'}}>{driver.vehicle_type || 'N/A'}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td>
                    <div style={{display: 'flex', gap: '4px'}}>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: driver.license_document ? '#D1FAE5' : '#FEE2E2',
                        color: driver.license_document ? '#065F46' : '#991B1B'
                      }}>
                        {driver.license_document ? 'License ✓' : 'License ✕'}
                      </span>
                      <span style={{
                        padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: driver.aadhar_document ? '#D1FAE5' : '#FEE2E2',
                        color: driver.aadhar_document ? '#065F46' : '#991B1B'
                      }}>
                        {driver.aadhar_document ? 'Aadhar ✓' : 'Aadhar ✕'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${driver.is_active ? 'active' : 'pending'}`}>
                      {driver.is_active ? 'Active' : 'Pending'}
                    </span>
                    {driver.is_active && driver.is_online && (
                      <span className="status-badge online" style={{marginLeft: '4px'}}>Online</span>
                    )}
                  </td>
                  <td>{formatDate(driver.created_at)}</td>
                  <td>
                    {driver.is_active ? (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBlock(driver.id); }}
                        disabled={actionLoading === driver.id}
                        className="action-button danger"
                      >
                        {actionLoading === driver.id ? '...' : 'Block'}
                      </button>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleApprove(driver.id); }}
                        disabled={actionLoading === driver.id}
                        className="action-button success"
                      >
                        {actionLoading === driver.id ? '...' : 'Approve'}
                      </button>
                    )}
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

export default Drivers;
