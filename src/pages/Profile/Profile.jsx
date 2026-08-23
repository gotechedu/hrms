import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  User,
  Building2,
  CreditCard,
  PhoneCall,
  FileCheck,
  Edit2,
  Mail,
  Phone,
  MapPin,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  X,
  RefreshCw,
} from 'lucide-react';
import { authApi } from '../../Service';
import { fetchCurrentUser } from '../../redux/slices/authSlice';

export default function Profile() {
  const dispatch = useDispatch();
  const { user: authUser } = useSelector((state) => state.auth);

  const [userData, setUserData] = useState(authUser || {});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('personal');

  // Change Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordStatus, setPasswordStatus] = useState({ loading: false, error: null, success: null });

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res && res.user) {
        setUserData(res.user);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordStatus({ loading: true, error: null, success: null });

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus({ loading: false, error: 'New password and confirm password do not match.', success: null });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordStatus({ loading: false, error: 'New password must be at least 6 characters long.', success: null });
      return;
    }

    try {
      const res = await authApi.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordStatus({
        loading: false,
        error: null,
        success: res.message || 'Password changed successfully!',
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordStatus({ loading: false, error: null, success: null });
      }, 2500);
    } catch (err) {
      setPasswordStatus({
        loading: false,
        error: err.message || 'Failed to update password. Verify your current password.',
        success: null,
      });
    }
  };

  const emp = userData?.employeeProfile || {};
  const roleName = (userData?.role || 'employee').toUpperCase();
  const avatarUrl =
    emp.avatar ||
    userData?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userData?.name || 'User')}`;

  const tabs = [
    { id: 'personal', name: 'Personal & Contact', icon: User },
    { id: 'employment', name: 'Employment & Role', icon: Building2 },
    { id: 'payroll', name: 'Bank & Statutory', icon: CreditCard },
    { id: 'emergency', name: 'Emergency Contacts', icon: PhoneCall },
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Profile Hero Header Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={userData?.name}
                className="h-22 w-22 rounded-3xl object-cover border-2 border-blue-500 shadow-md bg-slate-50"
              />
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px] border-2 border-white font-bold">
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {userData?.name || 'User'}
                </h1>
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700 border border-blue-100">
                  {emp.employeeId || 'GTE-1000'}
                </span>
                <span className="rounded-md bg-purple-50 px-2.5 py-0.5 font-mono text-xs font-bold text-purple-700 border border-purple-100">
                  {roleName}
                </span>
              </div>

              <p className="text-xs font-semibold text-blue-600 mt-1">
                {emp.designation || 'Team Member'} • <span className="text-slate-500">{emp.department || 'Operations'}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" /> {userData?.email}
                </span>
                {emp.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> {emp.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400" /> {emp.location || 'Gurugram, HQ'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={loadProfileData}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
              title="Refresh profile details"
            >
              <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition shadow-sm cursor-pointer"
            >
              <KeyRound size={13} />
              <span>Change Password</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 border-b border-slate-200/90 pb-2 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: Personal & Contact */}
      {activeTab === 'personal' && (
        <div className="grid gap-6 md:grid-cols-2 animate-fadeIn">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Personal Information
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Full Legal Name</span>
                <span className="font-bold text-slate-900">{userData?.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Corporate Email</span>
                <span className="font-bold text-blue-600">{userData?.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Contact Phone</span>
                <span className="font-bold text-slate-900">{emp.phone || '+91 98111 22334'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Account Status</span>
                <span className="font-bold text-emerald-600 uppercase font-mono">{userData?.status || 'Active'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-mono">Primary Work Location</span>
                <span className="font-bold text-slate-900">{emp.location || 'Gurugram, HQ'}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Security & Session
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Assigned Role</span>
                <span className="font-bold text-purple-700 uppercase font-mono">{userData?.role}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Last Portal Sign-In</span>
                <span className="font-bold text-slate-900 font-mono">
                  {userData?.lastLogin ? new Date(userData.lastLogin).toLocaleString() : 'Active Session'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Password Protection</span>
                <span className="font-bold text-emerald-600">Bcrypt Hashed (256-bit)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-mono">Account Created</span>
                <span className="font-bold text-slate-900 font-mono">
                  {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-GB') : 'Verified'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Employment & Role */}
      {activeTab === 'employment' && (
        <div className="grid gap-6 md:grid-cols-2 animate-fadeIn">
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Organizational Specifications
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Company ID</span>
                <span className="font-bold text-slate-900 font-mono">{emp.employeeId || 'GTE-1000'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Department Allocation</span>
                <span className="font-bold text-slate-900">{emp.department || 'Engineering'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Position / Title</span>
                <span className="font-bold text-blue-600">{emp.designation || 'Specialist'}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Employment Type</span>
                <span className="font-bold text-slate-900">{emp.type || 'Full-Time'}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-mono">Official Joining Date</span>
                <span className="font-bold text-slate-900">
                  {emp.joiningDate ? new Date(emp.joiningDate).toLocaleDateString('en-GB') : '15 Jan 2022'}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
              Competencies & Skills
            </h3>
            <div className="flex flex-wrap gap-2 pt-2">
              {(emp.skills && emp.skills.length > 0
                ? emp.skills
                : ['Full-Stack Development', 'React', 'Node.js', 'MongoDB', 'Enterprise RBAC Architecture']
              ).map((skill, i) => (
                <span
                  key={i}
                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Bank & Statutory */}
      {activeTab === 'payroll' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs animate-fadeIn max-w-2xl">
          <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Disbursement & Statutory Details
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Compensation (CTC)</span>
              <span className="font-bold text-slate-900 font-mono">{emp.salary || 'Competitive'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Account Holder</span>
              <span className="font-bold text-slate-900">{emp.bankDetails?.accountHolder || userData?.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Bank Name</span>
              <span className="font-bold text-slate-900">{emp.bankDetails?.bankName || 'HDFC Bank Ltd'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Account Number</span>
              <span className="font-bold text-slate-900 font-mono">{emp.bankDetails?.accountNumber || '918230918230'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">IFSC Code</span>
              <span className="font-bold text-slate-900 font-mono">{emp.bankDetails?.ifscCode || 'HDFC0001234'}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Emergency Contacts */}
      {activeTab === 'emergency' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs animate-fadeIn max-w-2xl">
          <h3 className="font-heading text-base font-bold text-slate-900 border-b border-slate-100 pb-3 mb-4">
            Emergency Contacts
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Primary Contact Name</span>
              <span className="font-bold text-slate-900">{emp.emergencyContact?.name || 'Primary Guardian'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Relationship</span>
              <span className="font-bold text-slate-900">{emp.emergencyContact?.relation || 'Family'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">Emergency Phone</span>
              <span className="font-bold text-slate-900">{emp.emergencyContact?.phone || '+91 99000 11223'}</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">Change Workstation Password</h3>
              <button
                type="button"
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setPasswordStatus({ loading: false, error: null, success: null });
                }}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {passwordStatus.error && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
                <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
                <span>{passwordStatus.error}</span>
              </div>
            )}

            {passwordStatus.success && (
              <div className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-700">
                <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{passwordStatus.success}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordStatus.loading}
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
                >
                  {passwordStatus.loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
