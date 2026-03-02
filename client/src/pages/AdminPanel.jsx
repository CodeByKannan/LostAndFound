import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('stats');

  useEffect(() => {
    axios.get('/api/users/admin/stats').then(r => setStats(r.data)).catch(() => {});
    axios.get('/api/users').then(r => setUsers(r.data)).catch(() => {});
  }, []);

  const changeRole = async (userId, role) => {
    try {
      await axios.patch(`/api/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role } : u));
      toast.success('Role updated');
    } catch { toast.error('Failed'); }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900 mb-2">Admin Panel</h1>
      <p className="text-slate-500 mb-8">Manage users and view platform statistics</p>

      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {['stats', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px capitalize transition-colors ${tab === t ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-600'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'stats' && stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Total Items', value: stats.totalItems, emoji: '📋' },
            { label: 'Active Lost', value: stats.lostItems, emoji: '🔴' },
            { label: 'Active Found', value: stats.foundItems, emoji: '🟢' },
            { label: 'Resolved', value: stats.resolvedItems, emoji: '✅' },
            { label: 'Total Users', value: stats.totalUsers, emoji: '👥' },
            { label: 'Total Claims', value: stats.totalClaims, emoji: '📝' },
          ].map(s => (
            <div key={s.label} className="card p-5 text-center">
              <p className="text-3xl mb-2">{s.emoji}</p>
              <p className="font-display text-3xl font-bold text-slate-900">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Name', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-slate-600 text-xs uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                  <td className="px-4 py-3 text-slate-500">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.role === 'admin' ? 'bg-purple-50 text-purple-700' : u.role === 'staff' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <select value={u.role} onChange={e => changeRole(u._id, e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500">
                      <option value="student">student</option>
                      <option value="staff">staff</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
