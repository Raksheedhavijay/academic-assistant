import React, { useState, useEffect } from 'react';
import { Users, Shield, Trash2, UserPlus, CheckCircle2 } from 'lucide-react';
import API from '../../services/api';

export default function AdminPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/users');
      if (data.success) setUsers(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold gradient-text">Admin User Management</h1>
        <p className="text-xs text-slate-400">Control system access, assign roles, and manage registered faculty and students.</p>
      </div>

      <div className="glass-card p-6 rounded-3xl border border-white/10 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-700 text-[11px] font-bold uppercase text-slate-400">
              <th className="pb-3">Name</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Role</th>
              <th className="pb-3">ID / Roll</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-xs">
            {users.map(u => (
              <tr key={u._id} className="hover:bg-slate-800/40">
                <td className="py-3 font-semibold text-slate-100">{u.name}</td>
                <td className="py-3 text-slate-400">{u.email}</td>
                <td className="py-3">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] uppercase ${
                    u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : u.role === 'staff' ? 'bg-teal-500/20 text-teal-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="py-3 font-mono text-slate-400">{u.rollNumber || u.staffId || 'N/A'}</td>
                <td className="py-3">
                  <button onClick={() => handleDeleteUser(u._id)} className="text-danger hover:underline">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
