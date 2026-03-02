import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-icon">🔍</span>
          <span className="brand-text">Campus<span className="brand-highlight">L&F</span></span>
        </Link>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          <span className={menuOpen ? 'bar open' : 'bar'} />
          <span className={menuOpen ? 'bar open' : 'bar'} />
          <span className={menuOpen ? 'bar open' : 'bar'} />
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/items" className={`nav-link ${isActive('/items')}`} onClick={() => setMenuOpen(false)}>Browse Items</Link>
          <Link to="/items?type=lost" className="nav-link" onClick={() => setMenuOpen(false)}>Lost</Link>
          <Link to="/items?type=found" className="nav-link" onClick={() => setMenuOpen(false)}>Found</Link>

          {user ? (
            <>
              <Link to="/post" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>+ Post Item</Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {isAdmin && <Link to="/admin" className={`nav-link nav-admin ${isActive('/admin')}`} onClick={() => setMenuOpen(false)}>Admin</Link>}
              <div className="nav-user">
                <Link to="/profile" className="nav-avatar" onClick={() => setMenuOpen(false)}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user.name.charAt(0).toUpperCase()}</span>}
                </Link>
                <button onClick={handleLogout} className="btn btn-outline btn-sm">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm" onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
