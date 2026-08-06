import { useEffect, useMemo, useState } from 'react';
import { adminAPI } from '../api/admin';
import { Drawer, EmptyState, formatDate, Modal, PageHeader, StatusBadge } from '../components/ui';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [selected, setSelected] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(Array.isArray(data) ? data : []);
      setError('');
    } catch {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let rows = users.filter((u) => {
      if (filter === 'active' && !u.is_active) return false;
      if (filter === 'blocked' && u.is_active) return false;
      if (!q) return true;
      return [u.name, u.phone, u.email].some((v) => String(v || '').toLowerCase().includes(q));
    });
    rows = [...rows].sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return rows;
  }, [users, search, filter, sortKey, sortDir]);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const openUser = async (user) => {
    setSelected(user);
    try {
      const detail = await adminAPI.getUser(user.id);
      setSelected(detail);
    } catch {
      // keep list row data
    }
  };

  const runConfirm = async () => {
    if (!confirmAction) return;
    try {
      setActionLoading(true);
      if (confirmAction.type === 'block') await adminAPI.blockUser(confirmAction.id);
      else await adminAPI.unblockUser(confirmAction.id);
      setConfirmAction(null);
      setSelected(null);
      await loadUsers();
    } catch {
      setError('Action failed. Try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading users…</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <PageHeader
        title="Users"
        subtitle="Search, filter, and manage customer accounts"
        actions={
          <>
            <div className="header-stat">
              <span className="stat-number">{users.length}</span>
              <span className="stat-text">Total</span>
            </div>
            <div className="header-stat">
              <span className="stat-number" style={{ color: '#22C55E' }}>
                {users.filter((u) => u.is_active).length}
              </span>
              <span className="stat-text">Active</span>
            </div>
          </>
        }
      />

      {error && <div className="error-box">{error}</div>}

      <div className="ui-toolbar">
        <input
          className="ui-search"
          placeholder="Search name, phone, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="ui-tabs">
          {[
            ['all', 'All'],
            ['active', 'Active'],
            ['blocked', 'Blocked'],
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
        <button type="button" className="ui-btn" onClick={loadUsers}>
          Refresh
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th className="sortable" onClick={() => toggleSort('name')}>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th className="sortable" onClick={() => toggleSort('created_at')}>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No users match your filters</td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="clickable" onClick={() => openUser(user)}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{(user.name || '?').charAt(0).toUpperCase()}</div>
                      <span>{user.name || '—'}</span>
                    </div>
                  </td>
                  <td>{user.phone}</td>
                  <td>{user.email || '—'}</td>
                  <td>
                    <StatusBadge status={user.is_active ? 'active' : 'blocked'} />
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {user.is_active ? (
                      <button
                        type="button"
                        className="action-button danger"
                        onClick={() => setConfirmAction({ type: 'block', id: user.id, name: user.name })}
                      >
                        Block
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="action-button success"
                        onClick={() => setConfirmAction({ type: 'unblock', id: user.id, name: user.name })}
                      >
                        Unblock
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!selected}
        title={selected?.name || 'User'}
        onClose={() => setSelected(null)}
        actions={
          selected ? (
            selected.is_active ? (
              <button
                type="button"
                className="ui-btn ui-btn-danger"
                onClick={() => setConfirmAction({ type: 'block', id: selected.id, name: selected.name })}
              >
                Block user
              </button>
            ) : (
              <button
                type="button"
                className="ui-btn ui-btn-success"
                onClick={() => setConfirmAction({ type: 'unblock', id: selected.id, name: selected.name })}
              >
                Unblock user
              </button>
            )
          ) : null
        }
      >
        {selected ? (
          <div className="ui-meta">
            <div className="ui-meta-row"><span>Phone</span><span>{selected.phone}</span></div>
            <div className="ui-meta-row"><span>Email</span><span>{selected.email || '—'}</span></div>
            <div className="ui-meta-row"><span>Status</span><span><StatusBadge status={selected.is_active ? 'active' : 'blocked'} /></span></div>
            <div className="ui-meta-row"><span>Verified</span><span>{selected.is_verified ? 'Yes' : 'No'}</span></div>
            <div className="ui-meta-row"><span>Gender</span><span>{selected.gender || '—'}</span></div>
            <div className="ui-meta-row"><span>Age</span><span>{selected.age || '—'}</span></div>
            <div className="ui-meta-row"><span>Joined</span><span>{formatDate(selected.created_at)}</span></div>
          </div>
        ) : (
          <EmptyState />
        )}
      </Drawer>

      <Modal
        open={!!confirmAction}
        title={confirmAction?.type === 'block' ? 'Block user?' : 'Unblock user?'}
        onClose={() => setConfirmAction(null)}
        actions={
          <>
            <button type="button" className="ui-btn" onClick={() => setConfirmAction(null)}>
              Cancel
            </button>
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
            ? `Block ${confirmAction?.name || 'this user'} from booking rides?`
            : `Restore access for ${confirmAction?.name || 'this user'}?`}
        </p>
      </Modal>
    </div>
  );
}

export default Users;
