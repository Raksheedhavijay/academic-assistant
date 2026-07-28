import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, User, Lock, Bell, Globe } from 'lucide-react';
import API from '../../services/api';

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.put(`/users/${user.id || user._id}`, { name, department, phone });
      if (data.success) {
        updateUserProfile({ name, department, phone });
        setMessage('✅ Profile updated successfully!');
      }
    } catch (err) {
      alert('Failed to update profile');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gradient-text">System & Account Settings</h1>
        <p className="text-xs text-slate-400">Manage dark/light theme, profile details, and security options.</p>
      </div>

      {message && <div className="p-3 rounded-xl bg-success/20 text-success text-xs font-semibold">{message}</div>}

      {/* Theme Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Appearance Theme</h3>
          <p className="text-xs text-slate-400">Switch between dark mode and light mode aesthetics.</p>
        </div>
        <button
          onClick={toggleTheme}
          className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold flex items-center space-x-2 shadow-md"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          <span>{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
        </button>
      </div>

      {/* Profile Card */}
      <div className="glass-card p-6 rounded-3xl border border-white/10">
        <h3 className="font-bold text-base text-slate-900 dark:text-white mb-4">User Profile Details</h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 mb-1">Full Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Department</label>
            <input type="text" value={department} onChange={e => setDepartment(e.target.value)} className="w-full glass-input" />
          </div>
          <div>
            <label className="block text-slate-400 mb-1">Phone Number</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full glass-input" />
          </div>
          <button type="submit" className="px-5 py-2.5 rounded-xl gradient-btn font-semibold">
            Save Profile Changes
          </button>
        </form>
      </div>
    </div>
  );
}
