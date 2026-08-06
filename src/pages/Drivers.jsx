import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../api/admin';
import { API_BASE_URL } from '../config';
import { Drawer, formatDate, Modal, PageHeader, StatusBadge } from '../components/ui';

function mediaUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//i.test(path) || path.startsWith('data:')) return path;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`;
}

function driverBucket(d) {
  if (!d.is_active && !d.is_verified) return 'pending';
  if (!d.is_active && d.is_verified) return 'blocked';
  if (d.is_active) return 'active';
  return 'pending';
}

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getDrivers();
      setDrivers(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const counts = useMemo(() => ({
    all: drivers.length,
    pending: drivers.filter((d) => driverBucket(d) === 'pending').length,
    active: drivers.filter((d) => driverBucket(d) === 'active').length,
    blocked: drivers.filter((d) => driverBucket(d) === 'blocked').length,
    online: drivers.filter((d) => d.is_online && d.is_active).length,
  }), [drivers]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return drivers.filter((d) => {
      if (filter !== 'all' && driverBucket(d) !== filter) return false;
      if (!q) return true;
      return [d.name, d.phone, d.vehicle_number, d.email]
        .some((v) => String(v || '').toLowerCase().includes(q));
    });
  }, [drivers, filter, search]);

  const openDriver = async (driver) => {
    setSelected(driver);
    try {
      const detail = await adminAPI.getDriver(driver.id);
      setSelected(detail);
    } catch {
      // keep list data
    }
  };

  const runConfirm = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(true);
      if (confirmAction.type === 'block') await adminAPI.blockDriver(confirmAction.id);
      else await adminAPI.unblockDriver(confirmAction.id);
      setConfirmAction(null);
      setSelected(null);
      await loadDrivers();
    } catch {
      setError('Driver action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading drivers…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Drivers"
        subtitle="KYC review, approvals, and account controls"
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number">{counts.all}</span>
              <span className="stat-text">Total</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#F59E0B' }}>{counts.pending}</span>
              <span className="stat-text">Pending KYC</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#22C55E' }}>{counts.online}</span>
              <span className="stat-text">Online</span>
            </div>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      <div className="ui-toolbar">
        <input
          className="ui-search"
          placeholder="Search name, phone, vehicle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ui-tabs">
          {[
            ['all', `All (${counts.all})`],
            ['pending', `Pending (${counts.pending})`],
            ['active', `Active (${counts.active})`],
            ['blocked', `Blocked (${counts.blocked})`],
          ].map(([key, label]) => (
            <button
              key={key}
              type="button"
              className={`ui-tab ${filter === key ? 'active' : ''}`}
              onClick={() => setFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <button type="button" className="ui-btn" onClick={loadDrivers}>Refresh</button>
      </div>

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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="empty-state">No drivers match your filters</td>
              </tr>
            ) : (
              filtered.map((driver) => {
                const bucket = driverBucket(driver);
                return (
                  <tr key={driver.id} className="clickable" onClick={() => openDriver(driver)}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar-small">{(driver.name || '?').charAt(0).toUpperCase()}</div>
                        <span>{driver.name}</span>
                      </div>
                    </td>
                    <td>{driver.phone}</td>
                    <td>
                      {driver.vehicle_number ? (
                        <div>
                          <div style={{ fontWeight: 500 }}>{driver.vehicle_number}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                            {driver.vehicle_type || 'N/A'}
                          </div>
                        </div>
                      ) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        <span className={`ui-badge ${driver.license_document ? 'active' : 'blocked'}`}>
                          License
                        </span>
                        <span className={`ui-badge ${driver.aadhar_document ? 'active' : 'blocked'}`}>
                          Aadhar
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={bucket === 'pending' ? 'pending' : bucket === 'blocked' ? 'blocked' : 'active'} />
                      {driver.is_active && driver.is_online ? (
                        <span className="ui-badge online" style={{ marginLeft: 4 }}>online</span>
                      ) : null}
                    </td>
                    <td>{formatDate(driver.created_at)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      {driver.is_active ? (
                        <button
                          type="button"
                          className="action-button danger"
                          onClick={() => setConfirmAction({ type: 'block', id: driver.id, name: driver.name })}
                        >
                          Block
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="action-button success"
                          onClick={() => setConfirmAction({ type: 'approve', id: driver.id, name: driver.name })}
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!selected}
        title={selected?.name || 'Driver'}
        onClose={() => setSelected(null)}
        actions={
          selected ? (
            selected.is_active ? (
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => setConfirmAction({ type: 'block', id: selected.id, name: selected.name })}
              >
                Block driver
              </button>
            ) : (
              <button
                type="button"
                className="ui-btn ui-btn-success"
                onClick={() => setConfirmAction({ type: 'approve', id: selected.id, name: selected.name })}
              >
                Approve & activate
              </button>
            )
          ) : null
        }
      >
        {selected && (
          <>
            <div className="ui-meta" style={{ marginBottom: 16 }}>
              <div className="ui-meta-row"><span>Phone</span><span>{selected.phone}</span></div>
              <div className="ui-meta-row"><span>Email</span><span>{selected.email || '—'}</span></div>
              <div className="ui-meta-row"><span>Vehicle</span><span>{selected.vehicle_number || '—'} · {selected.vehicle_type || '—'}</span></div>
              <div className="ui-meta-row"><span>Verified</span><span>{selected.is_verified ? 'Yes' : 'No'}</span></div>
              <div className="ui-meta-row"><span>Joined</span><span>{formatDate(selected.created_at)}</span></div>
            </div>
            <h3 style={{ fontSize: 14, marginBottom: 8 }}>Documents</h3>
            <div className="form-grid">
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Driving license</div>
                {selected.license_document ? (
                  <img className="doc-preview" src={mediaUrl(selected.license_document)} alt="License" />
                ) : (
                  <div className="ui-empty" style={{ padding: 24 }}>Not uploaded</div>
                )}
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Aadhar</div>
                {selected.aadhar_document ? (
                  <img className="doc-preview" src={mediaUrl(selected.aadhar_document)} alt="Aadhar" />
                ) : (
                  <div className="ui-empty" style={{ padding: 24 }}>Not uploaded</div>
                )}
              </div>
            </div>
          </>
        )}
      </Drawer>

      <Modal
        open={!!confirmAction}
        title={confirmAction?.type === 'block' ? 'Block driver?' : 'Approve driver?'}
        onClose={() => setConfirmAction(null)}
        actions={
          <>
            <button type="button" className="ui-btn" onClick={() => setConfirmAction(null)}>Cancel</button>
            <button
              type="button"
              className={`ui-btn ${confirmAction?.type === 'block' ? 'ui-btn-danger' : 'ui-btn-success'}`}
              disabled={actionLoading}
              onClick={runConfirm}
            >
              {actionLoading ? 'Working…' : 'Confirm'}
            </button>
          </>
        }
      >
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {confirmAction?.type === 'block'
            ? `Deactivate ${confirmAction?.name || 'this driver'}?`
            : `Approve and activate ${confirmAction?.name || 'this driver'}?`}
        </p>
      </Modal>
    </div>
  );
}

export default Drivers;
