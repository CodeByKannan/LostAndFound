import React, { useState } from 'react';
import './ItemForm.css';

const CATEGORIES = [
  'Electronics', 'Clothing', 'Books & Stationery', 'ID & Cards',
  'Keys', 'Jewelry & Accessories', 'Bags & Wallets', 'Sports Equipment', 'Other'
];

const BUILDINGS = [
  'Main Building', 'Science Block', 'Library', 'Cafeteria',
  'Sports Complex', 'Auditorium', 'Hostel A', 'Hostel B', 'Parking Lot', 'Other'
];

const ItemForm = ({ initialData = {}, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'lost',
    category: initialData.category || '',
    dateLostOrFound: initialData.dateLostOrFound
      ? new Date(initialData.dateLostOrFound).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    color: initialData.color || '',
    brand: initialData.brand || '',
    tags: initialData.tags?.join(', ') || '',
    locationBuilding: initialData.location?.building || '',
    locationArea: initialData.location?.area || '',
    locationDescription: initialData.location?.description || ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(
    initialData.images?.map(i => i.url) || []
  );

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();

    Object.entries(formData).forEach(([key, val]) => {
      if (!key.startsWith('location')) fd.append(key, val);
    });

    const location = {
      building: formData.locationBuilding,
      area: formData.locationArea,
      description: formData.locationDescription
    };
    fd.append('location', JSON.stringify(location));

    const tags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    fd.append('tags', JSON.stringify(tags));

    images.forEach(img => fd.append('images', img));

    onSubmit(fd);
  };

  return (
    <form className="item-form" onSubmit={handleSubmit}>
      {/* Type toggle */}
      <div className="form-group">
        <label className="form-label">Item Type *</label>
        <div className="type-toggle">
          {['lost', 'found'].map(t => (
            <button
              key={t}
              type="button"
              className={`type-btn ${formData.type === t ? 'active-' + t : ''}`}
              onClick={() => setFormData(prev => ({ ...prev, type: t }))}
            >
              {t === 'lost' ? '😟 I Lost Something' : '😊 I Found Something'}
            </button>
          ))}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Title *</label>
          <input
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="form-input"
            placeholder="e.g., Black Laptop Bag"
            maxLength={150}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Category *</label>
          <select name="category" value={formData.category} onChange={handleChange} required className="form-input">
            <option value="">Select category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description *</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          className="form-input form-textarea"
          placeholder="Describe the item in detail (color, size, distinguishing features...)"
          rows={4}
          maxLength={2000}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Date {formData.type === 'lost' ? 'Lost' : 'Found'} *</label>
          <input
            type="date"
            name="dateLostOrFound"
            value={formData.dateLostOrFound}
            onChange={handleChange}
            required
            className="form-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Color</label>
          <input name="color" value={formData.color} onChange={handleChange} className="form-input" placeholder="e.g., Black" />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Brand / Make</label>
          <input name="brand" value={formData.brand} onChange={handleChange} className="form-input" placeholder="e.g., Apple, Samsung" />
        </div>
        <div className="form-group">
          <label className="form-label">Tags</label>
          <input name="tags" value={formData.tags} onChange={handleChange} className="form-input" placeholder="tag1, tag2, tag3" />
        </div>
      </div>

      <div className="form-section-title">📍 Location</div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Building</label>
          <select name="locationBuilding" value={formData.locationBuilding} onChange={handleChange} className="form-input">
            <option value="">Select building</option>
            {BUILDINGS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Area / Floor</label>
          <input name="locationArea" value={formData.locationArea} onChange={handleChange} className="form-input" placeholder="e.g., 2nd Floor, Room 201" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Location Details</label>
        <input name="locationDescription" value={formData.locationDescription} onChange={handleChange} className="form-input" placeholder="Near the water cooler, left side..." />
      </div>

      <div className="form-section-title">📷 Images (up to 5)</div>
      <div className="form-group">
        <label className="form-input file-input-label">
          <span>Choose Images</span>
          <input type="file" multiple accept="image/*" onChange={handleImages} style={{ display: 'none' }} />
        </label>
        {previews.length > 0 && (
          <div className="image-previews">
            {previews.map((src, i) => (
              <div key={i} className="image-preview">
                <img src={src} alt={`preview ${i + 1}`} />
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn-submit" disabled={loading}>
        {loading ? 'Submitting...' : '✅ Submit Item'}
      </button>
    </form>
  );
};

export default ItemForm;
