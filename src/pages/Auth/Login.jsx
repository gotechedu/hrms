import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Eye, EyeOff, Lock, Mail, Shield, CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import { login } from '../../redux/slices/authSlice';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('HR Administrator');
  const [formData, setFormData] = useState({
    email: 'vikram.sharma@gotechedu.com',
    password: '••••••••••••',
    rememberMe: true,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login({ email: formData.email, role }));
    navigate('/');
  };

  const handleQuickDemo = (demoRole) => {
    setRole(demoRole);
    const email = demoRole === 'HR Administrator' ? 'vikram.sharma@gotechedu.com' : 'aarav.patel@gotechedu.com';
    setFormData((prev) => ({ ...prev, email }));
    dispatch(login({ email, role: demoRole }));
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative ambient background orbs */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        {/* Logo */}
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 font-heading font-black text-2xl">
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
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4.5">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Portal Access Level
              </label>
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100/80 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setRole('HR Administrator');
                    setFormData((p) => ({ ...p, email: 'vikram.sharma@gotechedu.com' }));
                  }}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    role === 'HR Administrator'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👑 HR Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRole('Employee');
                    setFormData((p) => ({ ...p, email: 'aarav.patel@gotechedu.com' }));
                  }}
                  className={`rounded-lg py-2 text-xs font-bold transition-all ${
                    role === 'Employee'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👤 Employee
                </button>
              </div>
            </div>

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
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Enter your security password"
                  className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember this workstation</span>
              </label>

              <Link
                to="/auth/forgot-password"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-98"
            >
              <span>Sign In to Dashboard</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 block mb-2.5">
              1-Click Demo Environments
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('HR Administrator')}
                className="rounded-xl border border-blue-200 bg-blue-50/60 py-2 px-2.5 text-[11px] font-bold text-blue-700 hover:bg-blue-100/70 transition"
              >
                Log In as HR Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('Employee')}
                className="rounded-xl border border-slate-200 bg-slate-50 py-2 px-2.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100 transition"
              >
                Log In as Employee
              </button>
            </div>
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-4 font-mono text-[11px]">
          <span className="flex items-center gap-1 text-slate-500">
            <Shield size={13} className="text-emerald-500" /> SOC 2 Type II
          </span>
          <span>•</span>
          <span className="text-slate-500">256-Bit SSL Encryption</span>
        </div>
      </div>
    </div>
  );
}
