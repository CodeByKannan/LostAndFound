import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiPackage, FiBell, FiFileText, FiCheck } from 'react-icons/fi';

const tabs = [
  { id: 'postings', label: 'My Postings', icon: FiPackage },
  { id: 'claims', label: 'My Claims', icon: FiFileText },
  { id: 'notifications', label: 'Notifications', icon: FiBell },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('postings');
  const [postings, setPostings] = useState([]);
  const [claims, setClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [receivedClaims, setReceivedClaims] = useState({});

  useEffect(() => {
    axios.get('/api/items/user/mine').then(r => setPostings(r.data));
    axios.get('/api/claims/mine').then(r => setClaims(r.data));
    axios.get('/api/users/notifications').then(r => setNotifications(r.data));
  }, []);

  const loadReceivedClaims = async (itemId) => {
    if (receivedClaims[itemId]) return;
    const { data } = await axios.get(`/api/claims/item/${itemId}`);
    setReceivedClaims(prev => ({ ...prev, [itemId]: data }));
  };

  const reviewClaim = async (claimId, status) => {
    try {
      await axios.patch(`/api/claims/${claimId}/review`, { status });
      toast.success(`Claim ${status}`);
      // Refresh
      const { data: items } = await axios.get('/api/items/user/mine');
      setPostings(items);
      setReceivedClaims({});
    } catch { toast.error('Failed to update claim'); }
  };

  const markNotificationsRead = async () => {
    await axios.patch('/api/users/notifications/read');
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const statusColor = { pending: 'text-amber-600 bg-amber-50', approved: 'text-emerald-600 bg-emerald-50', rejected: 'text-red-600 bg-red-50' };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, {user?.name?.split(' ')[0]}!</p>
      </div>

      <div className="flex gap-2 mb-8 border-b border-slate-200">
        {tabs.map(t => {
          const Icon = t.icon;
          const unread = t.id === 'notifications' ? notifications.filter(n => !n.isRead).length : 0;
          return (
            <button key={t.id} onClick={() => { setTab(t.id); if (t.id === 'notifications') markNotificationsRead(); }}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.id ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-600 hover:text-slate-900'}`}>
              <Icon size={16} />
              {t.label}
              {unread > 0 && <span className="ml-1 w-5 h-5 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center">{unread}</span>}
            </button>
          );
        })}
      </div>

      {tab === 'postings' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Your Postings ({postings.length})</h2>
            <Link to="/post" className="btn-primary text-sm py-2 px-4">+ New Posting</Link>
          </div>
          {postings.length === 0 ? (
            <div className="card p-10 text-center text-slate-500">
              <p className="text-3xl mb-2">📭</p>
              <p>You haven't posted anything yet.</p>
              <Link to="/post" className="btn-primary inline-block mt-4 text-sm">Post an Item</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {postings.map(item => (
                <div key={item._id} className="card p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                      {item.images?.[0] ? <img src={item.images[0].url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>{item.type}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${item.status === 'active' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>{item.status}</span>
                      </div>
                      <Link to={`/items/${item._id}`} className="font-semibold text-slate-800 hover:text-primary-600 mt-1 block truncate">{item.title}</Link>
                      <p className="text-xs text-slate-400 mt-0.5">{new Date(item.createdAt).toLocaleDateString()}</p>
                    </div>
                    {item.type === 'found' && item.status === 'active' && (
                      <button onClick={() => loadReceivedClaims(item._id)}
                        className="text-xs text-primary-600 font-medium hover:underline flex-shrink-0">View claims</button>
                    )}
                  </div>
                  {receivedClaims[item._id] && (
                    <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
                      {receivedClaims[item._id].length === 0 ? <p className="text-xs text-slate-400">No claims yet.</p> : receivedClaims[item._id].map(c => (
                        <div key={c._id} className="bg-slate-50 rounded-xl p-3">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-slate-700">{c.claimedBy?.name}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{c.message}</p>
                            </div>
                            {c.status === 'pending' && (
                              <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => reviewClaim(c._id, 'approved')} className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700">Approve</button>
                                <button onClick={() => reviewClaim(c._id, 'rejected')} className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700">Reject</button>
                              </div>
                            )}
                            {c.status !== 'pending' && <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[c.status]}`}>{c.status}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'claims' && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-4">Claims You've Submitted ({claims.length})</h2>
          {claims.length === 0 ? (
            <div className="card p-10 text-center text-slate-500"><p className="text-3xl mb-2">📋</p><p>You haven't submitted any claims.</p></div>
          ) : (
            <div className="space-y-3">
              {claims.map(c => (
                <div key={c._id} className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex-shrink-0 overflow-hidden">
                    {c.item?.images?.[0] ? <img src={c.item.images[0].url} className="w-full h-full object-cover" alt="" /> : <div className="w-full h-full flex items-center justify-center">📦</div>}
                  </div>
                  <div className="flex-1">
                    <Link to={`/items/${c.item?._id}`} className="font-semibold text-slate-800 hover:text-primary-600 text-sm">{c.item?.title}</Link>
                    <p className="text-xs text-slate-500 mt-0.5">Submitted {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-xs px-3 py-1.5 rounded-full font-semibold ${statusColor[c.status]}`}>{c.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'notifications' && (
        <div>
          <h2 className="font-semibold text-slate-800 mb-4">Notifications ({notifications.length})</h2>
          {notifications.length === 0 ? (
            <div className="card p-10 text-center text-slate-500"><p className="text-3xl mb-2">🔔</p><p>No notifications yet.</p></div>
          ) : (
            <div className="space-y-2">
              {notifications.map(n => (
                <div key={n._id} className={`card p-4 flex gap-3 ${!n.isRead ? 'border-l-4 border-primary-500' : ''}`}>
                  <div className="text-2xl flex-shrink-0">
                    {n.type === 'claim_approved' ? '🎉' : n.type === 'claim_rejected' ? '❌' : n.type === 'item_match' ? '✨' : '🔔'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{n.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
