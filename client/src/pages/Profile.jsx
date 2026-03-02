import { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '', phone: user?.phone || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await axios.put('/api/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
    setSavingPw(true);
    try {
      await axios.put('/api/auth/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-12 sm:px-6 space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-slate-500 mt-1">Manage your profile and security settings</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <p className="font-semibold text-slate-800">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full font-medium capitalize mt-1 inline-block">{user?.role}</span>
          </div>
        </div>
        <form onSubmit={handleProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Full Name</label>
            <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Department</label>
            <input value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} className="input-field" placeholder="e.g. Computer Science" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
            <input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="input-field" placeholder="+1 (555) 000-0000" />
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full py-2.5">{saving ? 'Saving…' : 'Save Changes'}</button>
        </form>
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Change Password</h2>
        <form onSubmit={handlePassword} className="space-y-4">
          {[
            { key: 'currentPassword', label: 'Current Password' },
            { key: 'newPassword', label: 'New Password' },
            { key: 'confirm', label: 'Confirm New Password' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">{f.label}</label>
              <input type="password" value={pwForm[f.key]} onChange={e => setPwForm(p => ({ ...p, [f.key]: e.target.value }))} required className="input-field" placeholder="••••••••" />
            </div>
          ))}
          <button type="submit" disabled={savingPw} className="btn-primary w-full py-2.5">{savingPw ? 'Updating…' : 'Update Password'}</button>
        </form>
      </div>
    </div>
  );
}
