import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound, Lock, ShieldCheck } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState('vikram.sharma@gotechedu.com');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleRequestOtp = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-100/70 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/25 font-heading font-black text-2xl">
          GT
        </div>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Workstation Password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Verify your corporate identity to securely regain portal access
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/50">
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gotechedu.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  We will send a 6-digit authentication token to this address.
                </p>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
              >
                Send Verification OTP →
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-blue-600 transition"
                >
                  <ArrowLeft size={14} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-fadeIn">
              <div className="rounded-xl bg-blue-50/80 p-3 text-xs text-blue-800 border border-blue-100 flex items-start gap-2">
                <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                <span>Verification code sent to <strong>{email}</strong>. (Demo Code: <strong>889214</strong>)</span>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  6-Digit Verification Token
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 889214"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 font-mono text-sm tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Security Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter min 8 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700"
              >
                Confirm & Update Password →
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="py-6 text-center animate-fadeIn space-y-4">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900">
                Password Reset Successfully!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
                Your credentials have been securely updated. You can now sign in with your new password.
              </p>
              <button
                type="button"
                onClick={() => navigate('/auth/login')}
                className="w-full rounded-xl bg-blue-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition"
              >
                Proceed to Sign In →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
