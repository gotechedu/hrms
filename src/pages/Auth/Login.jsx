import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, ArrowRight, AlertCircle, Sparkles, ShieldCheck } from 'lucide-react';
import { loginUser, clearAuthError } from '../../redux/slices/authSlice';

const DEMO_QUICK_FILLS = [
  { label: 'Superadmin', email: 'admin@gmail.com', password: 'admin123', roleBadge: '👑 Superadmin' },
  { label: 'HR Admin', email: 'vikram.sharma@gotechedu.com', password: 'Password@123', roleBadge: '💼 HR Head' },
  { label: 'Manager', email: 'priya.nair@gotechedu.com', password: 'Password@123', roleBadge: '📊 Manager' },
  { label: 'Dev Staff', email: 'aarav.patel@gotechedu.com', password: 'Password@123', roleBadge: '💻 Employee' },
];

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@gmail.com',
    password: 'admin123',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    // Only send email & password; backend automatically identifies role and profile
    const result = await dispatch(
      loginUser({
        email: formData.email,
        password: formData.password,
      })
    );

    if (loginUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  const handleQuickFill = (item) => {
    setFormData({
      email: item.email,
      password: item.password,
    });
    dispatch(clearAuthError());
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative ambient background orbs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-100/80 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-100/80 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Brand Logo */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 font-heading font-black text-2xl tracking-tight">
          GT
        </div>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          GoTech<span className="text-blue-600">Edu</span> HRMS
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Enterprise Human Resource & Workforce Intelligence Platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60">
          {/* Header text */}
          <div className="mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-heading text-lg font-bold text-slate-900">Sign In to Workstation</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your corporate credentials. Roles and permissions are automatically authenticated.
            </p>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {/* Clean Form - Email & Password ONLY */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="name@gotechedu.com"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600">
                  Password
                </label>
                <Link
                  to="/auth/forgot-password"
                  className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-700 active:scale-98 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Portal</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Pre-fill Chips */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500" /> Quick Demo Fill:
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {DEMO_QUICK_FILLS.map((item) => (
                <button
                  key={item.email}
                  type="button"
                  onClick={() => handleQuickFill(item)}
                  className="flex flex-col items-start rounded-xl border border-slate-200 bg-slate-50/80 p-2 text-left hover:border-blue-400 hover:bg-blue-50/60 transition group cursor-pointer"
                >
                  <span className="text-[11px] font-bold text-slate-800 group-hover:text-blue-700">
                    {item.roleBadge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 truncate w-full">
                    {item.email}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
          <ShieldCheck size={14} className="text-emerald-500" />
          <span>Encrypted Gateway • Automatic RBAC Role Determination</span>
        </div>
      </div>
    </div>
  );
}
