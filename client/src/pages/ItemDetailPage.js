import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './ItemDetailPage.css';

const ItemDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimProof, setClaimProof] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);
  const [showClaimForm, setShowClaimForm] = useState(false);

  useEffect(() => {
    api.get(`/items/${id}`)
      .then(({ data }) => { setItem(data.item); setLoading(false); })
      .catch(() => { toast.error('Item not found'); navigate('/items'); });
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this item?')) return;
    try {
      await api.delete(`/items/${id}`);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch { toast.error('Failed to delete item'); }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setClaimLoading(true);
    try {
      await api.post('/claims', { itemId: id, message: claimMessage, proofDescription: claimProof });
      toast.success('Claim submitted successfully!');
      setShowClaimForm(false);
      setClaimMessage(''); setClaimProof('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally { setClaimLoading(false); }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}><div className="spinner" /></div>;
  if (!item) return null;

  const isOwner = user && item.postedBy?._id === user._id;
  const canClaim = user && !isOwner && item.status === 'active';

  return (
    <div className="item-detail-page">
      <div className="container">
        <div className="breadcrumb">
          <Link to="/items">← Back to Items</Link>
        </div>

        <div className="item-detail-grid">
          {/* Images */}
          <div className="item-images">
            {item.images && item.images.length > 0 ? (
              <>
                <div className="main-image">
                  <img src={item.images[activeImage]?.url} alt={item.title} />
                  <span className={`badge badge-${item.type} type-overlay`}>{item.type}</span>
                </div>
                {item.images.length > 1 && (
                  <div className="image-thumbnails">
                    {item.images.map((img, i) => (
                      <div key={i} className={`thumb ${activeImage === i ? 'active' : ''}`} onClick={() => setActiveImage(i)}>
                        <img src={img.url} alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image-placeholder">
                <span>📦</span>
                <p>No images provided</p>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="item-details">
            <div className="detail-header">
              <div className="detail-badges">
                <span className={`badge badge-${item.type}`}>{item.type}</span>
                <span className={`badge badge-${item.status}`}>{item.status}</span>
              </div>
              <h1 className="detail-title">{item.title}</h1>
            </div>

            <div className="detail-meta">
              <div className="meta-item"><span className="meta-key">📂 Category</span><span>{item.category}</span></div>
              <div className="meta-item"><span className="meta-key">📅 Date</span><span>{format(new Date(item.dateLostOrFound), 'MMMM d, yyyy')}</span></div>
              {item.color && <div className="meta-item"><span className="meta-key">🎨 Color</span><span>{item.color}</span></div>}
              {item.brand && <div className="meta-item"><span className="meta-key">🏷️ Brand</span><span>{item.brand}</span></div>}
              {item.location?.building && <div className="meta-item"><span className="meta-key">📍 Building</span><span>{item.location.building}</span></div>}
              {item.location?.area && <div className="meta-item"><span className="meta-key">📍 Area</span><span>{item.location.area}</span></div>}
              {item.location?.description && <div className="meta-item"><span className="meta-key">📍 Details</span><span>{item.location.description}</span></div>}
            </div>

            <div className="detail-description">
              <h3>Description</h3>
              <p>{item.description}</p>
            </div>

            {item.tags && item.tags.length > 0 && (
              <div className="detail-tags">
                {item.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
              </div>
            )}

            <div className="detail-poster">
              <div className="poster-avatar">{item.postedBy?.name?.charAt(0)}</div>
              <div>
                <p className="poster-name">Posted by {item.postedBy?.name}</p>
                <p className="poster-info">{item.postedBy?.department} • {format(new Date(item.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="detail-actions">
              {isOwner ? (
                <>
                  <Link to={`/items/${id}/edit`} className="action-btn action-edit">✏️ Edit</Link>
                  <button onClick={handleDelete} className="action-btn action-delete">🗑️ Delete</button>
                  <Link to={`/dashboard?tab=claims&item=${id}`} className="action-btn action-secondary">👁️ View Claims</Link>
                </>
              ) : canClaim ? (
                <button onClick={() => setShowClaimForm(!showClaimForm)} className="action-btn action-claim">
                  {item.type === 'lost' ? '🙋 I Found This!' : '🙋 This is Mine!'}
                </button>
              ) : !user ? (
                <Link to="/login" className="action-btn action-claim">Login to Claim</Link>
              ) : null}
            </div>

            {/* Claim Form */}
            {showClaimForm && (
              <div className="claim-form-container">
                <h3>Submit a Claim</h3>
                <form onSubmit={handleClaim} className="claim-form">
                  <textarea
                    value={claimMessage}
                    onChange={e => setClaimMessage(e.target.value)}
                    required
                    placeholder="Explain why you believe this is your item or that you found it..."
                    rows={3}
                    className="form-input"
                  />
                  <textarea
                    value={claimProof}
                    onChange={e => setClaimProof(e.target.value)}
                    placeholder="Describe any proof of ownership (optional)"
                    rows={2}
                    className="form-input"
                  />
                  <div className="claim-actions">
                    <button type="submit" disabled={claimLoading} className="claim-submit-btn">
                      {claimLoading ? 'Submitting...' : 'Submit Claim'}
                    </button>
                    <button type="button" onClick={() => setShowClaimForm(false)} className="claim-cancel-btn">Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetailPage;
