import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', phone: user?.phone || '',
    department: user?.department || '', studentId: user?.studentId || ''
  });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfile(form);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmNew) { toast.error('New passwords do not match'); return; }
    setPassLoading(true);
    try {
      await api.put('/auth/change-password', { currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed!');
      setPassForm({ currentPassword: '', newPassword: '', confirmNew: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setPassLoading(false); }
  };

  return (
    <div className="profile-page">
      <div className="container">
        <h1 className="profile-title">My Profile</h1>

        <div className="profile-grid">
          {/* Info card */}
          <div className="profile-card profile-info-card">
            <div className="profile-avatar">
              {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <span>{user?.name?.charAt(0)}</span>}
            </div>
            <div className="profile-name">{user?.name}</div>
            <div className="profile-email">{user?.email}</div>
            <div className="profile-role">{user?.role}</div>
          </div>

          <div className="profile-forms">
            {/* Edit profile form */}
            <div className="profile-card">
              <h2>Edit Profile</h2>
              <form onSubmit={handleProfile} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="form-input" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Student ID</label>
                    <input value={form.studentId} onChange={e => setForm({...form, studentId: e.target.value})} className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="form-input" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <input value={form.department} onChange={e => setForm({...form, department: e.target.value})} className="form-input" />
                </div>
                <button type="submit" disabled={loading} className="profile-save-btn">
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            </div>

            {/* Change password */}
            <div className="profile-card">
              <h2>Change Password</h2>
              <form onSubmit={handlePassword} className="profile-form">
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input type="password" value={passForm.currentPassword} onChange={e => setPassForm({...passForm, currentPassword: e.target.value})} className="form-input" required />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input type="password" value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})} className="form-input" required minLength={6} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input type="password" value={passForm.confirmNew} onChange={e => setPassForm({...passForm, confirmNew: e.target.value})} className="form-input" required />
                </div>
                <button type="submit" disabled={passLoading} className="profile-save-btn">
                  {passLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
