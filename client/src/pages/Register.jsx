import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🔍</span>
          <h1 className="font-display text-3xl font-bold text-slate-900 mt-3">Create account</h1>
          <p className="text-slate-500 mt-2">Join your campus Lost & Found community</p>
        </div>
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { name: 'name', label: 'Full Name *', type: 'text', placeholder: 'Jane Smith', required: true },
              { name: 'email', label: 'Email *', type: 'email', placeholder: 'jane@university.edu', required: true },
              { name: 'password', label: 'Password *', type: 'password', placeholder: '6+ characters', required: true },
              { name: 'department', label: 'Department', type: 'text', placeholder: 'Computer Science' },
              { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+1 (555) 000-0000' },
            ].map(f => (
              <div key={f.name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.name]} onChange={e => setForm(p => ({ ...p, [f.name]: e.target.value }))} required={f.required} className="input-field" placeholder={f.placeholder} />
              </div>
            ))}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-2">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
