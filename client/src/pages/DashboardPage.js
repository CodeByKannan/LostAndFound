import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myItems, setMyItems] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/items/user/my-items'),
      api.get('/claims/my-claims')
    ]).then(([items, claims]) => {
      setMyItems(items.data.items);
      setMyClaims(claims.data.claims);
    }).catch(() => toast.error('Failed to load data'))
    .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      setMyItems(prev => prev.filter(i => i._id !== id));
      toast.success('Item deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <div>
            <h1>My Dashboard</h1>
            <p>Welcome back, {user.name}!</p>
          </div>
          <Link to="/post" className="post-btn">+ Post New Item</Link>
        </div>

        <div className="dash-stats">
          <div className="dash-stat"><span className="dash-stat-num">{myItems.length}</span><span>Posted</span></div>
          <div className="dash-stat"><span className="dash-stat-num">{myItems.filter(i => i.type === 'lost').length}</span><span>Lost</span></div>
          <div className="dash-stat"><span className="dash-stat-num">{myItems.filter(i => i.type === 'found').length}</span><span>Found</span></div>
          <div className="dash-stat"><span className="dash-stat-num">{myClaims.length}</span><span>Claims</span></div>
        </div>

        <div className="dash-tabs">
          <button onClick={() => setActiveTab('items')} className={`dash-tab ${activeTab === 'items' ? 'active' : ''}`}>My Items ({myItems.length})</button>
          <button onClick={() => setActiveTab('claims')} className={`dash-tab ${activeTab === 'claims' ? 'active' : ''}`}>My Claims ({myClaims.length})</button>
        </div>

        {activeTab === 'items' && (
          <div className="dash-table-wrap">
            {myItems.length === 0 ? (
              <div className="empty-dash">
                <p>You haven't posted any items yet.</p>
                <Link to="/post">Post your first item →</Link>
              </div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Item</th><th>Type</th><th>Category</th><th>Status</th><th>Date</th><th>Views</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myItems.map(item => (
                    <tr key={item._id}>
                      <td><Link to={`/items/${item._id}`} className="item-link">{item.title}</Link></td>
                      <td><span className={`badge badge-${item.type}`}>{item.type}</span></td>
                      <td>{item.category}</td>
                      <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                      <td>{format(new Date(item.dateLostOrFound), 'MMM d, yyyy')}</td>
                      <td>{item.views}</td>
                      <td className="action-cell">
                        <Link to={`/items/${item._id}/edit`} className="tbl-btn tbl-edit">Edit</Link>
                        <button onClick={() => handleDelete(item._id)} className="tbl-btn tbl-delete">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="dash-table-wrap">
            {myClaims.length === 0 ? (
              <div className="empty-dash"><p>You haven't submitted any claims yet.</p></div>
            ) : (
              <table className="dash-table">
                <thead>
                  <tr><th>Item</th><th>Item Type</th><th>Claim Status</th><th>Submitted</th></tr>
                </thead>
                <tbody>
                  {myClaims.map(claim => (
                    <tr key={claim._id}>
                      <td><Link to={`/items/${claim.item?._id}`} className="item-link">{claim.item?.title || 'Deleted'}</Link></td>
                      <td>{claim.item?.type ? <span className={`badge badge-${claim.item.type}`}>{claim.item.type}</span> : '—'}</td>
                      <td><span className={`badge badge-${claim.status === 'approved' ? 'found' : claim.status === 'rejected' ? 'lost' : 'active'}`}>{claim.status}</span></td>
                      <td>{format(new Date(claim.createdAt), 'MMM d, yyyy')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
