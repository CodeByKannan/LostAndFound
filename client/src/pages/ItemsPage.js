import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/items/ItemCard';
import './ItemsPage.css';

const CATEGORIES = [
  'All', 'Electronics', 'Clothing', 'Books & Stationery', 'ID & Cards',
  'Keys', 'Jewelry & Accessories', 'Bags & Wallets', 'Sports Equipment', 'Other'
];

const ItemsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const type = searchParams.get('type') || '';
  const category = searchParams.get('category') || '';
  const page = Number(searchParams.get('page') || 1);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort: '-createdAt' });
      if (type) params.set('type', type);
      if (category) params.set('category', category);
      if (search) params.set('search', search);

      const { data } = await api.get(`/items?${params}`);
      setItems(data.items);
      setPagination(data.pagination);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [type, category, page, search]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const setFilter = (key, value) => {
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilter('search', search);
  };

  return (
    <div className="items-page">
      <div className="container">
        <div className="items-header">
          <h1>Browse Items</h1>
          <p className="items-subtitle">{pagination.total || 0} items found</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <form onSubmit={handleSearch} className="search-form">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search items..."
              className="search-input"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          <div className="filter-buttons">
            <button onClick={() => setFilter('type', '')} className={`filter-btn ${!type ? 'active' : ''}`}>All</button>
            <button onClick={() => setFilter('type', 'lost')} className={`filter-btn filter-lost ${type === 'lost' ? 'active-lost' : ''}`}>😟 Lost</button>
            <button onClick={() => setFilter('type', 'found')} className={`filter-btn filter-found ${type === 'found' ? 'active-found' : ''}`}>😊 Found</button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="category-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
              className={`cat-tab ${(cat === 'All' ? !category : category === cat) ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex-center" style={{ padding: '4rem' }}><div className="spinner" /></div>
        ) : items.length > 0 ? (
          <>
            <div className="items-grid">
              {items.map(item => <ItemCard key={item._id} item={item} />)}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setFilter('page', page - 1)}
                  className="page-btn"
                >← Prev</button>
                <span className="page-info">Page {page} of {pagination.pages}</span>
                <button
                  disabled={page === pagination.pages}
                  onClick={() => setFilter('page', page + 1)}
                  className="page-btn"
                >Next →</button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state" style={{ padding: '4rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemsPage;
