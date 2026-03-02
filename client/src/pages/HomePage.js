import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ItemCard from '../components/items/ItemCard';
import './HomePage.css';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻' }, { name: 'Clothing', icon: '👕' },
  { name: 'Books & Stationery', icon: '📚' }, { name: 'ID & Cards', icon: '🪪' },
  { name: 'Keys', icon: '🔑' }, { name: 'Bags & Wallets', icon: '👜' }
];

const HomePage = () => {
  const [recentItems, setRecentItems] = useState([]);
  const [stats, setStats] = useState({ lost: 0, found: 0, resolved: 0 });
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/items?limit=6&sort=-createdAt').then(({ data }) => setRecentItems(data.items)).catch(() => {});
    Promise.all([
      api.get('/items?type=lost&limit=1'),
      api.get('/items?type=found&limit=1'),
      api.get('/items?status=claimed&limit=1')
    ]).then(([lost, found, resolved]) => {
      setStats({
        lost: lost.data.pagination?.total || 0,
        found: found.data.pagination?.total || 0,
        resolved: resolved.data.pagination?.total || 0
      });
    }).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/items?search=${encodeURIComponent(search)}`);
  };

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Lost Something? <br /><span>We're Here to Help.</span></h1>
            <p className="hero-subtitle">Report lost items, browse found items, and connect with your campus community.</p>
            <form onSubmit={handleSearch} className="hero-search">
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search for lost or found items..."
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn">🔍 Search</button>
            </form>
            <div className="hero-actions">
              <Link to="/items?type=lost" className="hero-btn hero-btn-danger">😟 Lost Items</Link>
              <Link to="/items?type=found" className="hero-btn hero-btn-success">😊 Found Items</Link>
              <Link to="/post" className="hero-btn hero-btn-primary">+ Post Item</Link>
            </div>
          </div>
        </div>
        <div className="hero-bg-shapes">
          <div className="shape shape-1" />
          <div className="shape shape-2" />
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-card">
            <span className="stat-icon">😟</span>
            <span className="stat-number">{stats.lost}</span>
            <span className="stat-label">Lost Items</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">😊</span>
            <span className="stat-number">{stats.found}</span>
            <span className="stat-label">Found Items</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <span className="stat-number">{stats.resolved}</span>
            <span className="stat-label">Items Reunited</span>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Browse by Category</h2>
          <div className="categories-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.name} to={`/items?category=${encodeURIComponent(cat.name)}`} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Items */}
      <section className="section section-bg">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recent Posts</h2>
            <Link to="/items" className="view-all-link">View all →</Link>
          </div>
          {recentItems.length > 0 ? (
            <div className="items-grid">
              {recentItems.map(item => <ItemCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>No items posted yet. Be the first!</p>
              <Link to="/post" className="btn-primary-link">Post an Item</Link>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container cta-inner">
          <h2>Found something on campus?</h2>
          <p>Post it here and help someone get their belongings back!</p>
          <Link to="/post" className="cta-btn">Post a Found Item</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
