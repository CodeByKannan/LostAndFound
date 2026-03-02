import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">🔍</div>
          <h1>Welcome Back</h1>
          <p>Sign in to your Campus L&F account</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="form-input" placeholder="you@university.edu" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} required className="form-input" placeholder="••••••••" />
          </div>
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">Don't have an account? <Link to="/register">Sign Up</Link></p>
      </div>
    </div>
  );
};

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', studentId: '', department: '', phone: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-icon">✨</div>
          <h1>Create Account</h1>
          <p>Join the Campus Lost & Found community</p>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input value={form.name} onChange={set('name')} required className="form-input" placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input type="email" value={form.email} onChange={set('email')} required className="form-input" placeholder="you@university.edu" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Password *</label>
              <input type="password" value={form.password} onChange={set('password')} required className="form-input" placeholder="Min 6 characters" />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password *</label>
              <input type="password" value={form.confirmPassword} onChange={set('confirmPassword')} required className="form-input" placeholder="Repeat password" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Student ID</label>
              <input value={form.studentId} onChange={set('studentId')} className="form-input" placeholder="e.g., STU2024001" />
            </div>
            <div className="form-group">
              <label className="form-label">Department</label>
              <input value={form.department} onChange={set('department')} className="form-input" placeholder="e.g., Computer Science" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input value={form.phone} onChange={set('phone')} className="form-input" placeholder="+1 555 000 0000" />
          </div>
          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p className="auth-footer">Already have an account? <Link to="/login">Sign In</Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
