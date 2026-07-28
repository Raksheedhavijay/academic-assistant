import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, User, Mail, Lock, ShieldCheck, UserCheck, GraduationCap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Signup() {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    semester: 6,
    section: 'A'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await signup(formData);
      if (res.success) {
        setShowOtpScreen(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass-panel p-8 rounded-3xl border border-white/20 dark:border-slate-800/60 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Create Portal Account</h2>
          <p className="text-xs text-slate-400">Academic Assistant AI Agent Registration</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        {showOtpScreen ? (
          <div className="text-center space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-success/20 text-success border border-success/30 flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold">Email Verification</h3>
            <p className="text-xs text-slate-300">Enter the 6-digit OTP code sent to your email.</p>
            <input
              type="text"
              maxLength={6}
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value)}
              placeholder="123456"
              className="glass-input text-center text-xl font-bold tracking-widest w-48 mx-auto block"
            />
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="py-2.5 px-6 rounded-xl gradient-btn text-xs font-semibold"
            >
              Verify & Launch Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Select Account Role</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { role: 'student', label: 'Student', icon: GraduationCap },
                  { role: 'staff', label: 'Staff', icon: UserCheck },
                  { role: 'admin', label: 'Admin', icon: ShieldCheck }
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = formData.role === item.role;
                  return (
                    <button
                      key={item.role}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: item.role })}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                        isSelected
                          ? 'bg-primary text-white border-primary shadow-md'
                          : 'bg-slate-800/40 text-slate-400 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Radha Raman"
                className="w-full glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="radha@academic.edu"
                className="w-full glass-input text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full glass-input text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {formData.role === 'student' ? 'Roll Number' : 'Staff ID'}
                </label>
                <input
                  type="text"
                  name="rollNumber"
                  value={formData.rollNumber}
                  onChange={handleChange}
                  placeholder={formData.role === 'student' ? '21CSE045' : 'STF101'}
                  className="w-full glass-input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-btn flex items-center justify-center space-x-2 text-sm font-semibold mt-4"
            >
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Sign In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
