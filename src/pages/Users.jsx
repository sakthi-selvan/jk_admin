import { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';
import './Users.css';

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers();
      setUsers(data);
      setError('');
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlock = async (userId) => {
    if (!confirm('Are you sure you want to block this user?')) return;

    try {
      setActionLoading(userId);
      await adminAPI.blockUser(userId);
      await loadUsers();
    } catch (err) {
      alert('Failed to block user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnblock = async (userId) => {
    try {
      setActionLoading(userId);
      await adminAPI.unblockUser(userId);
      await loadUsers();
    } catch (err) {
      alert('Failed to unblock user');
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

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading users...</div>
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
          <h1>Users</h1>
          <p>Manage customer accounts</p>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="stat-number">{users.length}</span>
            <span className="stat-text">Total Users</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small">{user.name.charAt(0).toUpperCase()}</div>
                      <span>{user.name}</span>
                    </div>
                  </td>
                  <td>{user.phone}</td>
                  <td>{user.email || '-'}</td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'active' : 'blocked'}`}>
                      {user.is_active ? 'Active' : 'Blocked'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td>
                    {user.is_active ? (
                      <button
                        onClick={() => handleBlock(user.id)}
                        disabled={actionLoading === user.id}
                        className="action-button danger"
                      >
                        {actionLoading === user.id ? 'Blocking...' : 'Block'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleUnblock(user.id)}
                        disabled={actionLoading === user.id}
                        className="action-button success"
                      >
                        {actionLoading === user.id ? 'Unblocking...' : 'Unblock'}
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

export default Users;
