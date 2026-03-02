import { useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'ID/Cards', 'Keys', 'Bags', 'Jewelry', 'Sports', 'Other'];
const BUILDINGS = ['Main Building', 'Library', 'Science Block', 'Arts Block', 'Cafeteria', 'Sports Complex', 'Hostel A', 'Hostel B', 'Admin Block', 'Other'];

export default function ItemForm({ initialData = {}, onSubmit, loading }) {
  const [form, setForm] = useState({
    title: '', description: '', category: '', type: 'lost',
    building: '', area: '', locationDesc: '', dateLostFound: '',
    tags: '', contactEmail: '', contactPhone: '',
    ...initialData,
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(initialData.images?.map(i => i.url) || []);

  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(prev => [...prev, ...files].slice(0, 4));
    const newPreviews = files.map(f => URL.createObjectURL(f));
    setPreviews(prev => [...prev, ...newPreviews].slice(0, 4));
  };

  const removeImage = (idx) => {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    images.forEach(img => fd.append('images', img));
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Type *</label>
          <div className="flex gap-3">
            {['lost', 'found'].map(t => (
              <label key={t} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${form.type === t ? (t === 'lost' ? 'border-red-500 bg-red-50 text-red-700' : 'border-emerald-500 bg-emerald-50 text-emerald-700') : 'border-slate-200 hover:border-slate-300'}`}>
                <input type="radio" name="type" value={t} checked={form.type === t} onChange={handleChange} className="sr-only" />
                <span>{t === 'lost' ? '🔴' : '🟢'}</span>
                <span className="font-semibold capitalize">{t}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
          <select name="category" value={form.category} onChange={handleChange} required className="input-field">
            <option value="">Select category…</option>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required maxLength={100} placeholder="e.g. Blue AirPods Pro case" className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4} maxLength={1000} placeholder="Describe the item in detail — color, brand, distinguishing marks…" className="input-field resize-none" />
        <p className="text-xs text-slate-400 mt-1">{form.description.length}/1000</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Building *</label>
          <select name="building" value={form.building} onChange={handleChange} required className="input-field">
            <option value="">Select building…</option>
            {BUILDINGS.map(b => <option key={b}>{b}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Area / Floor</label>
          <input name="area" value={form.area} onChange={handleChange} placeholder="e.g. 2nd floor, Room 204" className="input-field" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Date {form.type === 'lost' ? 'Lost' : 'Found'} *</label>
        <input type="date" name="dateLostFound" value={form.dateLostFound} onChange={handleChange} required max={new Date().toISOString().split('T')[0]} className="input-field" />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Photos (up to 4)</label>
        <div className="flex gap-3 flex-wrap">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center">
                <FiX size={10} />
              </button>
            </div>
          ))}
          {previews.length < 4 && (
            <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
              <FiUpload size={18} className="text-slate-400" />
              <span className="text-xs text-slate-400 mt-1">Add</span>
              <input type="file" accept="image/*" multiple onChange={handleImages} className="sr-only" />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma-separated)</label>
        <input name="tags" value={form.tags} onChange={handleChange} placeholder="e.g. blue, apple, leather" className="input-field" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Email</label>
          <input type="email" name="contactEmail" value={form.contactEmail} onChange={handleChange} placeholder="your@email.com" className="input-field" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Phone</label>
          <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} placeholder="+1 (555) 000-0000" className="input-field" />
        </div>
      </div>

      <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
        {loading ? 'Submitting…' : 'Submit Posting'}
      </button>
    </form>
  );
}
