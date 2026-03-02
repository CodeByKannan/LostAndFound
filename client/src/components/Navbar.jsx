import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import { FiSearch, FiBell, FiMenu, FiX, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (user) {
      axios.get('/api/users/notifications')
        .then(res => setUnreadCount(res.data.filter(n => !n.isRead).length))
        .catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  const navLinks = [
    { to: '/items?type=lost', label: 'Lost Items' },
    { to: '/items?type=found', label: 'Found Items' },
    { to: '/post', label: 'Post Item' },
  ];

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm' : 'bg-white'} border-b border-slate-100`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-xl text-slate-900">
            <span className="text-2xl">🔍</span>
            <span>Campus <span className="text-primary-600">L&F</span></span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className="text-sm font-medium text-slate-600 hover:text-primary-600 transition-colors">{l.label}</Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <Link to="/items" className="hidden sm:flex items-center gap-1.5 text-slate-500 hover:text-primary-600 transition-colors">
              <FiSearch size={18} />
            </Link>

            {user ? (
              <>
                <Link to="/dashboard" className="relative text-slate-500 hover:text-primary-600 transition-colors">
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>

                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 rounded-xl px-3 py-1.5 hover:bg-slate-100 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">{user.name?.split(' ')[0]}</span>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-lg border border-slate-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <Link to="/dashboard" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <FiUser size={15} /> Dashboard
                      </Link>
                      <Link to="/profile" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <FiSettings size={15} /> Settings
                      </Link>
                      {user.role === 'admin' && (
                        <Link to="/admin" onClick={() => setDropdownOpen(false)} className="flex items-center gap-2.5 px-4 py-2 text-sm text-primary-600 hover:bg-slate-50 transition-colors">
                          🛡️ Admin Panel
                        </Link>
                      )}
                      <hr className="my-1 border-slate-100" />
                      <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                        <FiLogOut size={15} /> Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm py-2 px-4">Sign in</Link>
                <Link to="/register" className="btn-primary text-sm py-2 px-4">Sign up</Link>
              </div>
            )}

            <button className="md:hidden text-slate-600" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-slate-700 hover:text-primary-600 py-1">{l.label}</Link>
          ))}
        </div>
      )}
    </nav>
  );
}
