import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './ItemCard.css';

const CATEGORY_ICONS = {
  'Electronics': '💻',
  'Clothing': '👕',
  'Books & Stationery': '📚',
  'ID & Cards': '🪪',
  'Keys': '🔑',
  'Jewelry & Accessories': '💍',
  'Bags & Wallets': '👜',
  'Sports Equipment': '⚽',
  'Other': '📦'
};

const ItemCard = ({ item }) => {
  const icon = CATEGORY_ICONS[item.category] || '📦';
  const hasImage = item.images && item.images.length > 0;

  return (
    <Link to={`/items/${item._id}`} className="item-card">
      <div className="item-card-image">
        {hasImage ? (
          <img src={item.images[0].url} alt={item.title} loading="lazy" />
        ) : (
          <div className="item-card-placeholder">
            <span>{icon}</span>
          </div>
        )}
        <span className={`badge badge-${item.type} item-type-badge`}>{item.type}</span>
      </div>

      <div className="item-card-body">
        <div className="item-card-header">
          <span className="item-category">{icon} {item.category}</span>
          <span className={`badge badge-${item.status}`}>{item.status}</span>
        </div>
        <h3 className="item-title">{item.title}</h3>
        <p className="item-description">{item.description}</p>

        <div className="item-meta">
          {item.location?.building && (
            <span className="item-meta-item">📍 {item.location.building}</span>
          )}
          <span className="item-meta-item">
            📅 {format(new Date(item.dateLostOrFound), 'MMM d, yyyy')}
          </span>
        </div>

        <div className="item-footer">
          <span className="item-poster">by {item.postedBy?.name || 'Unknown'}</span>
          <span className="item-views">👁 {item.views || 0}</span>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
