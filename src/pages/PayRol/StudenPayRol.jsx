import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  DollarSign,
  Plus,
  Search,
  Download,
  FileText,
  Trash2,
  RefreshCw,
  ChevronLeft,
  Users,
  Award,
  Calendar,
  X,
} from 'lucide-react';
import { payrollApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function StudenPayRol() {
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();

  const canManagePayroll =
    isSuperAdmin ||
    hasPermission('manage_payroll') ||
    can('manage', 'payroll');

  const canCreatePayroll =
    isSuperAdmin ||
    hasPermission('manage_payroll') ||
    hasPermission('create_payroll') ||
    can('create', 'payroll');

  const canDeletePayroll =
    isSuperAdmin ||
    hasPermission('manage_payroll') ||
    hasPermission('delete_payroll') ||
    can('delete', 'payroll');

  const [payrolls, setPayrolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const initialForm = {
    category: 'student',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    roleDesignation: 'Graduate Engineering Trainee / Intern',
    department: 'Full-Stack Labs',
    studentBatch: 'Summer Cohort 2026',
    month: 'August 2026',
    year: 2026,
    basicSalary: 18000,
    hra: 0,
    da: 0,
    specialAllowance: 2000, // Attendance / Mentorship allowance
    performanceBonus: 2500, // Milestone project bonus
    pfDeduction: 0,
    taxDeduction: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'UPI',
    remarks: 'Monthly learning stipend + Capstone incentive',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await payrollApi.getPayrolls({
        category: 'student',
        paymentStatus: statusFilter,
        search: searchQuery,
      });
      if (res && res.payrolls) {
        setPayrolls(res.payrolls);
      }
    } catch (err) {
      console.error('Fetch Student Payroll Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await payrollApi.createPayroll(formData);
      setIsAddModalOpen(false);
      setFormData(initialForm);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Failed to create student stipend');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await payrollApi.updatePaymentStatus(id, { paymentStatus: status });
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this stipend entry to Recycle Bin?')) return;
    try {
      await payrollApi.deletePayroll(id);
      fetchRecords();
    } catch (err) {
      alert(err.message || 'Error deleting record');
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 mb-1 transition"
          >
            <ChevronLeft size={14} /> Back to Payroll Central
          </Link>
          <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <GraduationCap size={18} />
            </div>
            Student & Trainee Stipend Payroll
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Cohort stipends, bootcamp allowances, internship scholarships & performance payouts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreatePayroll && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:bg-emerald-500 transition cursor-pointer"
            >
              <Plus size={16} /> Disburse Student Stipend
            </button>
          )}
          <button
            onClick={fetchRecords}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Stipends Disbursed</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(
              payrolls
                .filter((p) => p.paymentStatus === 'Paid')
                .reduce((sum, p) => sum + (p.netSalary || 0), 0)
            )}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold">Live cohort trainees</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Active Trainees</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {payrolls.length} Interns
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Enrolled across active batches</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Performance Incentives</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(
              payrolls.reduce((sum, p) => sum + (p.performanceBonus || 0), 0)
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Capstone milestone rewards</p>
        </div>
      </div>

      {/* Main Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search student, batch, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 sm:w-72 rounded-xl border border-slate-200 pl-9 pr-3 text-xs focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Student / Intern</th>
                <th className="px-6 py-3.5">Cohort Batch</th>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Base Stipend</th>
                <th className="px-6 py-3.5">Milestone Bonus</th>
                <th className="px-6 py-3.5">Net Payout</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 animate-spin text-emerald-600" size={24} />
                    Loading student stipend records...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    No student stipend records found.
                  </td>
                </tr>
              ) : (
                payrolls.map((row) => (
                  <tr key={row._id} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 text-sm block">
                        {row.recipientName}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {row.recipientEmail}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {row.roleDesignation}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[11px] font-bold">
                        {row.studentBatch || 'General Cohort'}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                      {row.month}
                    </td>

                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {formatCurrency(row.basicSalary)}
                    </td>

                    <td className="px-6 py-4 font-mono font-semibold text-emerald-600">
                      +{formatCurrency(row.performanceBonus)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-heading font-black text-slate-900 text-sm">
                        {formatCurrency(row.netSalary)}
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono">
                        via {row.paymentMethod}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        disabled={!canManagePayroll}
                        value={row.paymentStatus}
                        onChange={(e) => handleStatusChange(row._id, e.target.value)}
                        className={`rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-bold focus:outline-none ${canManagePayroll ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'}`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Paid">Paid</option>
                        <option value="Failed">Failed</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canDeletePayroll && (
                          <button
                            onClick={() => handleDelete(row._id)}
                            title="Move to Recycle Bin"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Disburse Student / Intern Stipend
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Nair"
                  value={formData.recipientName}
                  onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                  className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="priya@college.edu"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cohort Batch</label>
                  <input
                    type="text"
                    value={formData.studentBatch}
                    onChange={(e) => setFormData({ ...formData, studentBatch: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Base Stipend (₹) *</label>
                  <input
                    type="number"
                    required
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Incentive / Bonus (₹)</label>
                  <input
                    type="number"
                    value={formData.performanceBonus}
                    onChange={(e) => setFormData({ ...formData, performanceBonus: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30"
                >
                  Save Stipend Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
