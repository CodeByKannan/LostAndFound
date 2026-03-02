import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './AdminPage.css';

const AdminPage = () => {
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [claims, setClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/users/stats'),
      api.get('/users'),
      api.get('/claims')
    ]).then(([s, u, c]) => {
      setStats(s.data);
      setUsers(u.data.users);
      setClaims(c.data.claims);
    }).catch(() => toast.error('Failed to load admin data'))
    .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed to update role'); }
  };

  const handleClaimUpdate = async (claimId, status) => {
    try {
      await api.put(`/claims/${claimId}`, { status });
      setClaims(prev => prev.map(c => c._id === claimId ? { ...c, status } : c));
      toast.success(`Claim ${status}`);
    } catch { toast.error('Failed to update claim'); }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>⚙️ Admin Panel</h1>
          <p>Manage users, claims, and monitor site activity</p>
        </div>

        <div className="admin-tabs">
          {['stats', 'users', 'claims'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`admin-tab ${activeTab === tab ? 'active' : ''}`}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div className="stats-grid-admin">
            {[
              { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
              { label: 'Total Items', value: stats.totalItems, icon: '📦' },
              { label: 'Lost (Active)', value: stats.lostItems, icon: '😟' },
              { label: 'Found (Active)', value: stats.foundItems, icon: '😊' },
              { label: 'Reunited', value: stats.resolvedItems, icon: '✅' },
            ].map(s => (
              <div key={s.label} className="admin-stat-card">
                <span className="admin-stat-icon">{s.icon}</span>
                <span className="admin-stat-number">{s.value}</span>
                <span className="admin-stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Change Role</th></tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-active">{u.role}</span></td>
                    <td>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                    <td>
                      <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="role-select">
                        <option value="student">Student</option>
                        <option value="staff">Staff</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="dash-table-wrap">
            <table className="dash-table">
              <thead>
                <tr><th>Item</th><th>Claimant</th><th>Status</th><th>Submitted</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {claims.map(c => (
                  <tr key={c._id}>
                    <td>{c.item?.title || '—'}</td>
                    <td>{c.claimant?.name || '—'}</td>
                    <td><span className={`badge badge-${c.status === 'approved' ? 'found' : c.status === 'rejected' ? 'lost' : 'active'}`}>{c.status}</span></td>
                    <td>{format(new Date(c.createdAt), 'MMM d, yyyy')}</td>
                    <td className="action-cell">
                      {c.status === 'pending' && (
                        <>
                          <button onClick={() => handleClaimUpdate(c._id, 'approved')} className="tbl-btn tbl-edit">Approve</button>
                          <button onClick={() => handleClaimUpdate(c._id, 'rejected')} className="tbl-btn tbl-delete">Reject</button>
                        </>
                      )}
                      {c.status !== 'pending' && <span style={{ fontSize: '0.8rem', color: 'var(--gray-400)' }}>Resolved</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
