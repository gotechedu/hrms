import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Mail,
  ArrowLeft,
  CheckCircle2,
  KeyRound,
  Lock,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import {
  requestForgotPassword,
  resetPasswordWithOtp,
  resetForgotState,
  clearAuthError,
} from "../../redux/slices/authSlice";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    loading,
    error,
    forgotPasswordSuccess,
    resetPasswordSuccess,
    demoOtp,
  } = useSelector((state) => state.auth);

  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearAuthError());

    const result = await dispatch(requestForgotPassword(email));
    if (requestForgotPassword.fulfilled.match(result)) {
      if (result.payload?.otp) {
        setOtp(result.payload.otp);
      }
      setStep(2);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError("");
    if (newPassword.length < 6) {
      setLocalError("Password must be at least 6 characters long.");
      return;
    }
    dispatch(clearAuthError());

    const result = await dispatch(
      resetPasswordWithOtp({
        email,
        otp: otp.trim(),
        newPassword,
      }),
    );

    if (resetPasswordWithOtp.fulfilled.match(result)) {
      setStep(3);
    }
  };

  const handleBackToSignIn = () => {
    dispatch(resetForgotState());
    navigate("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative ambient background */}
      <div className="absolute -left-20 -top-20 h-96 w-96 rounded-full bg-blue-100/80 blur-3xl pointer-events-none" />
      <div className="absolute -right-20 -bottom-20 h-96 w-96 rounded-full bg-cyan-100/80 blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center p-2 rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-200/80 mb-1">
          <img
            src="/icons.png"
            alt="GoTechEdu Logo"
            className="h-14 w-14 object-contain rounded-xl"
          />
        </div>
        <h2 className="mt-4 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Reset Workstation Password
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Verify your identity with a secure one-time verification token
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl shadow-slate-200/60">
          {/* Error Message Box */}
          {(error || localError) && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 animate-fadeIn">
              <AlertCircle
                size={16}
                className="text-rose-500 shrink-0 mt-0.5"
              />
              <span className="font-medium">{error || localError}</span>
            </div>
          )}

          {/* STEP 1: Enter Email */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Corporate Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@gotechedu.com"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                  We will issue a 6-digit authentication token valid for 15
                  minutes.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Dispatching Token...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Verification Token</span>
                    <ArrowRight size={16} />
                  </>
                )}
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

          {/* STEP 2: Enter OTP & New Password */}
          {step === 2 && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-4 animate-fadeIn"
            >
              <div className="rounded-xl bg-blue-50 p-3 text-xs text-blue-900 border border-blue-200 flex items-start gap-2">
                <ShieldCheck
                  size={16}
                  className="text-blue-600 shrink-0 mt-0.5"
                />
                <div>
                  <span>
                    Token dispatched for <strong>{email}</strong>.
                  </span>
                  {demoOtp && (
                    <span className="block mt-1 font-mono text-blue-700 font-bold">
                      Code: {demoOtp}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  6-Digit Verification Token
                </label>
                <div className="relative">
                  <KeyRound
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="e.g. 543210"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono tracking-widest text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  New Workstation Password
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    size={16}
                  />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 shadow-2xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/20"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-98 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Updating Credentials...</span>
                  </>
                ) : (
                  <span>Confirm New Password</span>
                )}
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 transition cursor-pointer"
                >
                  <ArrowLeft size={14} /> Change Email
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: Success State */}
          {step === 3 && (
            <div className="text-center space-y-4 animate-fadeIn">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-lg font-heading font-bold text-slate-900">
                Password Reset Successful
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your login credentials have been securely updated in the
                directory database.
              </p>
              <button
                type="button"
                onClick={handleBackToSignIn}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 py-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
              >
                Sign In With New Password →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
