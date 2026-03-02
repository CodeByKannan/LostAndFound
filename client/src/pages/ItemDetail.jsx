import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';
import { FiMapPin, FiCalendar, FiUser, FiMail, FiPhone, FiEdit2, FiTrash2, FiCheckCircle } from 'react-icons/fi';

export default function ItemDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claimMsg, setClaimMsg] = useState('');
  const [claimProof, setClaimProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  useEffect(() => {
    axios.get(`/api/items/${id}`)
      .then(r => setItem(r.data))
      .catch(() => toast.error('Item not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this posting?')) return;
    try {
      await axios.delete(`/api/items/${id}`);
      toast.success('Item deleted');
      navigate('/dashboard');
    } catch { toast.error('Failed to delete'); }
  };

  const handleResolve = async () => {
    try {
      const { data } = await axios.patch(`/api/items/${id}/resolve`);
      setItem(data);
      toast.success('Marked as resolved!');
    } catch { toast.error('Failed to update'); }
  };

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('itemId', id);
      fd.append('message', claimMsg);
      fd.append('proofDescription', claimProof);
      await axios.post('/api/claims', fd);
      setClaimSubmitted(true);
      toast.success('Claim submitted! The poster will be notified.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit claim');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center items-center min-h-[50vh]"><div className="animate-spin w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!item) return <div className="text-center py-20 text-slate-500">Item not found.</div>;

  const isOwner = user?._id === item.postedBy?._id;
  const isLost = item.type === 'lost';

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
      <Link to="/items" className="text-sm text-slate-500 hover:text-primary-600 mb-6 inline-flex items-center gap-1">← Back to listings</Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Images */}
        <div className="lg:col-span-3">
          <div className="card overflow-hidden mb-3">
            {item.images?.length > 0 ? (
              <img src={item.images[imgIdx].url} alt={item.title} className="w-full h-80 object-cover" />
            ) : (
              <div className="w-full h-80 bg-slate-100 flex items-center justify-center text-7xl">
                {{'Electronics':'📱','Books':'📚','Keys':'🔑','Bags':'🎒','Clothing':'👕','ID/Cards':'🪪','Jewelry':'💍','Sports':'⚽'}[item.category] || '📦'}
              </div>
            )}
          </div>
          {item.images?.length > 1 && (
            <div className="flex gap-2">
              {item.images.map((img, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${imgIdx === i ? 'border-primary-500' : 'border-transparent'}`}>
                  <img src={img.url} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="card p-5 mt-5">
            <h3 className="font-semibold text-slate-800 mb-3">Description</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{item.description}</p>
            {item.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags.map(t => <span key={t} className="bg-slate-100 text-slate-600 text-xs px-2.5 py-1 rounded-full">#{t}</span>)}
              </div>
            )}
          </div>
        </div>

        {/* Details + Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <span className={isLost ? 'badge-lost' : 'badge-found'}>{isLost ? '🔴 Lost' : '🟢 Found'}</span>
              {item.status !== 'active' && <span className="badge-resolved capitalize">{item.status}</span>}
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900 mb-1">{item.title}</h1>
            <p className="text-sm text-slate-500 mb-4">{item.category}</p>

            <div className="space-y-2.5 text-sm text-slate-600">
              <div className="flex items-center gap-2"><FiMapPin size={15} className="text-slate-400 flex-shrink-0" />{item.location?.building}{item.location?.area ? `, ${item.location.area}` : ''}</div>
              <div className="flex items-center gap-2"><FiCalendar size={15} className="text-slate-400 flex-shrink-0" />{new Date(item.dateLostFound).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              <div className="flex items-center gap-2"><FiUser size={15} className="text-slate-400 flex-shrink-0" />Posted by {item.postedBy?.name}</div>
            </div>

            {/* Contact */}
            {item.status === 'active' && (item.contactInfo?.email || item.contactInfo?.phone) && (
              <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</p>
                {item.contactInfo.email && <a href={`mailto:${item.contactInfo.email}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FiMail size={14} />{item.contactInfo.email}</a>}
                {item.contactInfo.phone && <a href={`tel:${item.contactInfo.phone}`} className="flex items-center gap-2 text-sm text-primary-600 hover:underline"><FiPhone size={14} />{item.contactInfo.phone}</a>}
              </div>
            )}
          </div>

          {/* Owner actions */}
          {isOwner && (
            <div className="card p-4 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Manage Posting</p>
              <Link to={`/items/${id}/edit`} className="btn-secondary w-full text-sm text-center flex items-center justify-center gap-2">
                <FiEdit2 size={14} /> Edit Posting
              </Link>
              {item.status === 'active' && (
                <button onClick={handleResolve} className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                  <FiCheckCircle size={14} /> Mark as Resolved
                </button>
              )}
              <button onClick={handleDelete} className="btn-danger w-full text-sm flex items-center justify-center gap-2">
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          )}

          {/* Claim form — only for found items and non-owners */}
          {!isOwner && item.type === 'found' && item.status === 'active' && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-1">Is this yours?</h3>
              <p className="text-xs text-slate-500 mb-4">Submit a claim and the poster will review it.</p>
              {claimSubmitted ? (
                <div className="text-center py-4 text-emerald-600"><FiCheckCircle size={24} className="mx-auto mb-2" /><p className="font-semibold text-sm">Claim submitted!</p></div>
              ) : (
                <form onSubmit={handleClaim} className="space-y-3">
                  <textarea value={claimMsg} onChange={e => setClaimMsg(e.target.value)} required placeholder="Describe why this item is yours…" rows={3} className="input-field resize-none text-sm" />
                  <textarea value={claimProof} onChange={e => setClaimProof(e.target.value)} placeholder="Any proof? Serial number, distinct marks…" rows={2} className="input-field resize-none text-sm" />
                  <button type="submit" disabled={submitting} className="btn-primary w-full text-sm py-2.5">
                    {submitting ? 'Submitting…' : 'Submit Claim'}
                  </button>
                  {!user && <p className="text-xs text-slate-500 text-center">You need to <Link to="/login" className="text-primary-600 underline">sign in</Link> to claim.</p>}
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
