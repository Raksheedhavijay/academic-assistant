import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, Mail, KeyRound, ArrowRight } from 'lucide-react';
import API from '../../services/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const { data } = await API.post('/auth/forgot-password', { email });
      if (data.success) {
        setMessage(data.message);
        setTimeout(() => {
          navigate(`/reset-password?email=${encodeURIComponent(email)}`);
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Email not found.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950 text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/20 dark:border-slate-800/60 shadow-2xl"
      >
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/30">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold gradient-text">Forgot Password</h2>
          <p className="text-xs text-slate-400">Enter your registered email to receive an OTP code.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-danger/20 border border-danger/40 text-danger text-xs font-medium">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-success/20 border border-success/40 text-success text-xs font-medium">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@academic.edu"
                className="w-full glass-input pl-10 text-xs sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl gradient-btn flex items-center justify-center space-x-2 text-sm font-semibold"
          >
            <span>{loading ? 'Sending OTP...' : 'Generate Reset OTP'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Remember password?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
