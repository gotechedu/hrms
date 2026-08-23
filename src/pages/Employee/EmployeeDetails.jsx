import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  CreditCard,
  PhoneCall,
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Edit2,
  RefreshCw,
  Sparkles,
  Award,
  Layers,
  UserCheck,
} from 'lucide-react';
import { employeeApi } from '../../Service';
import { updateExistingEmployee } from '../../redux/slices/employeeSlice';

export default function EmployeeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const userRole = (user?.role || '').toLowerCase();
  const canEdit = ['superadmin', 'admin', 'hr', 'manager'].includes(userRole);

  const fetchEmployeeData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await employeeApi.getEmployeeById(id);
      if (res && res.employee) {
        setEmployee(res.employee);
        setEditFormData(res.employee);
      } else {
        setError('Employee record not found.');
      }
    } catch (err) {
      console.error('Fetch Employee Details Error:', err);
      setError(err.message || 'Failed to retrieve employee profile from backend.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchEmployeeData();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await dispatch(
        updateExistingEmployee({
          id: employee._id || employee.employeeId,
          data: editFormData,
        })
      );
      if (updateExistingEmployee.fulfilled.match(res)) {
        setIsEditModalOpen(false);
        fetchEmployeeData();
      }
    } catch (err) {
      console.error('Update Error:', err);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-fadeIn">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">Fetching employee dossier from backend...</p>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs animate-fadeIn max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Unable to Load Employee Record</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'Record does not exist in directory.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ← Back to Directory
          </button>
          <button
            type="button"
            onClick={fetchEmployeeData}
            className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
          >
            Retry Request
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl =
    employee.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(employee.name)}`;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/employees')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Directory
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchEmployeeData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          {canEdit && (
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
            >
              <Edit2 size={13} />
              <span>Edit Record</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative">
              <img
                src={avatarUrl}
                alt={employee.name}
                className="h-24 w-24 rounded-3xl object-cover border-2 border-blue-500 shadow-md bg-slate-50"
              />
              <span
                className={`absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full text-white text-[10px] border-2 border-white font-bold ${
                  employee.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              >
                ✓
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {employee.name}
                </h1>
                <span className="rounded-md bg-slate-100 px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700 border border-slate-200">
                  {employee.employeeId}
                </span>
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-blue-700 border border-blue-100">
                  {employee.role}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 mt-1">
                {employee.designation || employee.role} • <span className="text-slate-500">{employee.department}</span>
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> {employee.email}
                </span>
                {employee.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={13} className="text-slate-400" /> {employee.phone}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400" /> {employee.location || 'Gurugram, HQ'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-100">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                employee.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              Status: {employee.status}
            </span>
            <span className="font-mono text-xs font-bold text-slate-700">
              Type: {employee.type || 'Full-Time'}
            </span>
          </div>
        </div>
      </div>

      {/* Structured Details Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Employment & Organizational Role */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Briefcase size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Employment & Organization</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Employee ID</span>
              <span className="font-bold text-slate-900 font-mono">{employee.employeeId}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Department Allocation</span>
              <span className="font-bold text-slate-900">{employee.department}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Designation Title</span>
              <span className="font-bold text-blue-600">{employee.designation || 'Team Member'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">RBAC Role Access</span>
              <span className="font-bold text-purple-700 uppercase font-mono">{employee.role}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Employment Type</span>
              <span className="font-bold text-slate-900">{employee.type || 'Full-Time'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">Joining Date</span>
              <span className="font-bold text-slate-900">
                {employee.joiningDate ? new Date(employee.joiningDate).toLocaleDateString('en-GB') : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Compensation & Statutory Bank Records */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <CreditCard size={18} className="text-emerald-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Payroll & Bank Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Annual CTC Package</span>
              <span className="font-bold text-slate-900 font-mono">{employee.salary || 'Confidential'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Account Holder</span>
              <span className="font-bold text-slate-900">{employee.bankDetails?.accountHolder || employee.name}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Bank Name</span>
              <span className="font-bold text-slate-900">{employee.bankDetails?.bankName || 'HDFC Bank Ltd'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Account Number</span>
              <span className="font-bold text-slate-900 font-mono">{employee.bankDetails?.accountNumber || '918230918230'}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">IFSC Code</span>
              <span className="font-bold text-slate-900 font-mono">{employee.bankDetails?.ifscCode || 'HDFC0001234'}</span>
            </div>
          </div>
        </div>

        {/* Card 3: Contact & Emergency Information */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <PhoneCall size={18} className="text-amber-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Contact & Emergency Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Work Email</span>
              <span className="font-bold text-blue-600">{employee.email}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Phone Number</span>
              <span className="font-bold text-slate-900">{employee.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Emergency Contact</span>
              <span className="font-bold text-slate-900">
                {employee.emergencyContact?.name || 'Primary Guardian'} ({employee.emergencyContact?.relation || 'Family'})
              </span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">Emergency Phone</span>
              <span className="font-bold text-slate-900">{employee.emergencyContact?.phone || '+91 99000 11223'}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Technical Skills & Specialization */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Sparkles size={18} className="text-cyan-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Skills & Specializations</h3>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {(employee.skills && employee.skills.length > 0
              ? employee.skills
              : ['Full-Stack Engineering', 'Node.js', 'React.js', 'MongoDB', 'System Architecture', 'Cloud Deployment']
            ).map((skill, index) => (
              <span
                key={index}
                className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <h3 className="font-heading text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              Edit Employee Dossier
            </h3>

            <form onSubmit={handleUpdate} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.name || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Work Email
                  </label>
                  <input
                    type="email"
                    value={editFormData.email || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editFormData.designation || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    value={editFormData.department || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editFormData.status || 'Active'}
                    onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="On Leave">On Leave</option>
                    <option value="Probation">Probation</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={editFormData.phone || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Salary (CTC)
                  </label>
                  <input
                    type="text"
                    value={editFormData.salary || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, salary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
