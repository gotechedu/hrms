import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Users,
  GraduationCap,
  Briefcase,
  ChevronRight,
  RefreshCw,
  Eye,
  Trash2,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Send,
  X,
} from 'lucide-react';
import { payrollApi, employeeApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function PayRol() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
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

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'org-employee' | 'student' | 'it-solution'
  const [payrolls, setPayrolls] = useState([]);
  const [stats, setStats] = useState({
    totalDisbursed: 0,
    pendingPayout: 0,
    processingPayout: 0,
    paidCount: 0,
    pendingCount: 0,
    totalRecords: 0,
    categoryBreakdown: { orgEmployee: 0, student: 0, itSolution: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [monthFilter, setMonthFilter] = useState('All');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // New Payroll Form State
  const initialForm = {
    category: 'org-employee',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    roleDesignation: '',
    department: 'Engineering',
    month: 'August 2026',
    year: 2026,
    basicSalary: 45000,
    hra: 18000,
    da: 5000,
    specialAllowance: 7000,
    performanceBonus: 0,
    pfDeduction: 5400,
    taxDeduction: 3500,
    leaveDeduction: 0,
    otherDeductions: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'Direct Bank Transfer',
    studentBatch: 'Batch Alpha 2026',
    contractProject: 'Enterprise Cloud ERP',
    remarks: '',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [listRes, statsRes] = await Promise.all([
        payrollApi.getPayrolls({
          category: activeTab === 'all' ? 'All' : activeTab,
          paymentStatus: statusFilter,
          month: monthFilter,
          search: searchQuery,
        }),
        payrollApi.getPayrollStats(),
      ]);

      if (listRes && listRes.payrolls) {
        setPayrolls(listRes.payrolls);
      }
      if (statsRes && statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err) {
      console.error('Fetch Payroll Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, statusFilter, monthFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleCreatePayroll = async (e) => {
    e.preventDefault();
    try {
      setIsProcessing(true);
      await payrollApi.createPayroll(formData);
      setIsAddModalOpen(false);
      setFormData(initialForm);
      await fetchData();
    } catch (err) {
      alert(err.message || 'Error creating payroll entry');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await payrollApi.updatePaymentStatus(id, { paymentStatus: newStatus });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update payment status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Move this payroll record to Recycle Bin?')) return;
    try {
      await payrollApi.deletePayroll(id);
      fetchData();
    } catch (err) {
      alert(err.message || 'Error removing payroll record');
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
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-mono font-semibold text-blue-300 backdrop-blur-md">
              <DollarSign size={14} className="text-blue-400" />
              FINANCIAL DISBURSEMENTS & SALARY HUB
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Payroll Central
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Automated disbursement, multi-stream salary management for Permanent Employees, Trainees & Interns, and IT Solution Contractors.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {canCreatePayroll && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 transition active:scale-95 cursor-pointer"
              >
                <Plus size={16} />
                Process New Payroll
              </button>
            )}
            <button
              onClick={fetchData}
              title="Refresh"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metrics Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Disbursed</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(stats.totalDisbursed)}
          </p>
          <p className="mt-1 text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <TrendingUp size={12} /> {stats.paidCount} Completed Payouts
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Pending Approvals</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Clock size={18} />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(stats.pendingPayout)}
          </p>
          <p className="mt-1 text-xs text-amber-600 font-semibold">
            {stats.pendingCount} Pending Transactions
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Processing Queue</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <RefreshCw size={18} className="animate-spin text-blue-600" />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(stats.processingPayout)}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-semibold">In Bank Gateway Queue</p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Beneficiaries</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Users size={18} />
            </div>
          </div>
          <p className="mt-3 font-heading text-2xl font-black text-slate-900">
            {stats.totalRecords}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            Permanent, Students & Vendors
          </p>
        </div>
      </div>

      {/* Stream Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/payroll/org-employees"
          className="group relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-blue-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Building2 size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 group-hover:translate-x-1 transition">
              Manage <ArrowUpRight size={14} />
            </span>
          </div>
          <h3 className="mt-4 font-heading text-base font-extrabold text-slate-900">
            Org Employee Payroll
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Full-time staff salary breakdown (Basic, HRA, DA, PF, TDS & Tax Slabs).
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-400">Disbursed:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatCurrency(stats.categoryBreakdown?.orgEmployee)}
            </span>
          </div>
        </Link>

        <Link
          to="/payroll/students"
          className="group relative overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
              <GraduationCap size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:translate-x-1 transition">
              Manage <ArrowUpRight size={14} />
            </span>
          </div>
          <h3 className="mt-4 font-heading text-base font-extrabold text-slate-900">
            Student & Intern Payroll
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Cohort stipends, college trainees, performance allowances & scholarships.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-400">Disbursed:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatCurrency(stats.categoryBreakdown?.student)}
            </span>
          </div>
        </Link>

        <Link
          to="/payroll/it-solutions"
          className="group relative overflow-hidden rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50/60 to-white p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-purple-300"
        >
          <div className="flex items-start justify-between">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Briefcase size={20} />
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 group-hover:translate-x-1 transition">
              Manage <ArrowUpRight size={14} />
            </span>
          </div>
          <h3 className="mt-4 font-heading text-base font-extrabold text-slate-900">
            IT Solutions & Vendors
          </h3>
          <p className="mt-1 text-xs text-slate-500">
            Contract developers, freelance consultants, project deliverables & TDS 194J.
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
            <span className="text-slate-400">Disbursed:</span>
            <span className="font-bold text-slate-800 font-mono">
              {formatCurrency(stats.categoryBreakdown?.itSolution)}
            </span>
          </div>
        </Link>
      </div>

      {/* Main Table & Filter Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto">
            {[
              { id: 'all', label: 'All Disbursements', count: payrolls.length },
              { id: 'org-employee', label: 'Org Employees' },
              { id: 'student', label: 'Students / Interns' },
              { id: 'it-solution', label: 'IT Solutions' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-xs sm:text-sm font-bold transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search recipient, email, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-52 sm:w-64 rounded-xl border border-slate-200 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Failed">Failed</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 font-mono uppercase tracking-wider text-slate-400 font-bold">
              <tr>
                <th className="px-6 py-3.5">Payroll ID & Recipient</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Gross & Deductions</th>
                <th className="px-6 py-3.5">Net Pay</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 animate-spin text-blue-600" size={24} />
                    Loading payroll registry...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <AlertCircle className="mx-auto mb-2 text-slate-300" size={32} />
                    No payroll entries found matching the filter criteria.
                  </td>
                </tr>
              ) : (
                payrolls.map((row) => {
                  const categoryBadge =
                    row.category === 'student'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.category === 'it-solution'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200';

                  const statusBadge =
                    row.paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : row.paymentStatus === 'Processing'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : row.paymentStatus === 'Failed'
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200';

                  const gross =
                    Number(row.basicSalary || 0) +
                    Number(row.hra || 0) +
                    Number(row.da || 0) +
                    Number(row.specialAllowance || 0) +
                    Number(row.performanceBonus || 0);

                  const deductions =
                    Number(row.pfDeduction || 0) +
                    Number(row.taxDeduction || 0) +
                    Number(row.leaveDeduction || 0) +
                    Number(row.otherDeductions || 0);

                  return (
                    <tr key={row._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 text-sm">
                            {row.recipientName}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {row.payrollId || row._id.slice(-8)} • {row.recipientEmail}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {row.roleDesignation} ({row.department})
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase font-mono ${categoryBadge}`}
                        >
                          {row.category}
                        </span>
                        {row.studentBatch && (
                          <div className="text-[10px] text-slate-400 mt-1">{row.studentBatch}</div>
                        )}
                        {row.contractProject && (
                          <div className="text-[10px] text-slate-400 mt-1">{row.contractProject}</div>
                        )}
                      </td>

                      <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                        {row.month}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs font-mono">
                          <span className="text-slate-800">Gross: {formatCurrency(gross)}</span>
                          <span className="text-rose-600 text-[11px]">
                            Ded: -{formatCurrency(deductions)}
                          </span>
                        </div>
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
                          className={`rounded-lg border px-2.5 py-1 text-xs font-bold focus:outline-none ${canManagePayroll ? 'cursor-pointer' : 'cursor-not-allowed opacity-80'} ${statusBadge}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Processing">Processing</option>
                          <option value="Paid">Paid</option>
                          <option value="Failed">Failed</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPayslip(row)}
                            title="View / Download Payslip"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <FileText size={15} />
                          </button>
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
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Payroll Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Process New Salary / Stipend Record
                </h3>
                <p className="text-xs text-slate-500">
                  Calculate and disburse payroll for employees, students, or IT solutions.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePayroll} className="mt-5 space-y-4 text-xs">
              {/* Category Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Payroll Category *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'org-employee', label: 'Org Employee' },
                    { id: 'student', label: 'Student / Intern' },
                    { id: 'it-solution', label: 'IT Solution / Vendor' },
                  ].map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setFormData({ ...formData, category: cat.id })}
                      className={`rounded-xl border py-2 text-center font-bold transition cursor-pointer ${
                        formData.category === cat.id
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Verma"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@gotechedu.com"
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.recipientPhone}
                    onChange={(e) => setFormData({ ...formData, recipientPhone: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role / Designation</label>
                  <input
                    type="text"
                    placeholder="e.g. Senior Frontend Dev"
                    value={formData.roleDesignation}
                    onChange={(e) => setFormData({ ...formData, roleDesignation: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    placeholder="Engineering"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Month & Category Specific */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Disbursement Month *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. August 2026"
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                  />
                </div>

                {formData.category === 'student' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Student Batch / Cohort</label>
                    <input
                      type="text"
                      placeholder="e.g. AI-ML Batch 2026"
                      value={formData.studentBatch}
                      onChange={(e) => setFormData({ ...formData, studentBatch: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                ) : formData.category === 'it-solution' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Project Milestone / Contract</label>
                    <input
                      type="text"
                      placeholder="e.g. ERP Cloud Module Phase 2"
                      value={formData.contractProject}
                      onChange={(e) => setFormData({ ...formData, contractProject: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      className="h-9 w-full rounded-xl border border-slate-200 px-3 font-medium focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Direct Bank Transfer">Direct Bank Transfer</option>
                      <option value="UPI">UPI</option>
                      <option value="Cheque">Cheque</option>
                      <option value="NEFT/RTGS">NEFT/RTGS</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Financial Breakdowns */}
              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                <span className="font-bold text-slate-900 block text-xs">
                  Salary / Stipend Component Breakdown (₹)
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Basic / Base Rate *</label>
                    <input
                      type="number"
                      required
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">HRA</label>
                    <input
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">DA / Special Allow.</label>
                    <input
                      type="number"
                      value={formData.specialAllowance}
                      onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Performance Bonus</label>
                    <input
                      type="number"
                      value={formData.performanceBonus}
                      onChange={(e) => setFormData({ ...formData, performanceBonus: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60">
                  <div>
                    <label className="block text-[11px] text-rose-600 mb-0.5">PF Deduction</label>
                    <input
                      type="number"
                      value={formData.pfDeduction}
                      onChange={(e) => setFormData({ ...formData, pfDeduction: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-rose-200 px-2 font-mono text-rose-700 bg-rose-50/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-rose-600 mb-0.5">Tax / TDS Deduction</label>
                    <input
                      type="number"
                      value={formData.taxDeduction}
                      onChange={(e) => setFormData({ ...formData, taxDeduction: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-rose-200 px-2 font-mono text-rose-700 bg-rose-50/40"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-rose-600 mb-0.5">Other Deductions</label>
                    <input
                      type="number"
                      value={formData.otherDeductions}
                      onChange={(e) => setFormData({ ...formData, otherDeductions: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-rose-200 px-2 font-mono text-rose-700 bg-rose-50/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50"
                >
                  {isProcessing ? 'Processing...' : 'Save & Calculate Net Pay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip View Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-2xl my-8 border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-heading font-black">
                  GT
                </div>
                <div>
                  <h4 className="font-heading text-base font-extrabold text-slate-900">
                    GoTechEdu Official Payslip
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                    Disbursement Slip • {selectedPayslip.month}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                    Employee / Recipient
                  </span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedPayslip.recipientName}</span>
                  <span className="text-slate-500 text-[11px]">{selectedPayslip.recipientEmail}</span>
                  <span className="text-slate-500 text-[11px] block">{selectedPayslip.roleDesignation}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px] uppercase font-mono font-bold">
                    Payroll ID
                  </span>
                  <span className="font-mono font-bold text-slate-900 text-xs block">
                    {selectedPayslip.payrollId || selectedPayslip._id}
                  </span>
                  <span className="text-slate-500 text-[11px] block mt-1">
                    Status: <span className="font-bold text-emerald-600">{selectedPayslip.paymentStatus}</span>
                  </span>
                  <span className="text-slate-400 text-[10px] block">
                    Method: {selectedPayslip.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Earnings vs Deductions Table */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-3.5 space-y-2">
                  <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block border-b border-emerald-200 pb-1">
                    Earnings
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Basic Salary:</span>
                    <span className="font-mono font-semibold">{formatCurrency(selectedPayslip.basicSalary)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">HRA:</span>
                    <span className="font-mono font-semibold">{formatCurrency(selectedPayslip.hra)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">DA / Special Allow:</span>
                    <span className="font-mono font-semibold">{formatCurrency(selectedPayslip.specialAllowance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Bonus / Incentive:</span>
                    <span className="font-mono font-semibold">{formatCurrency(selectedPayslip.performanceBonus)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-3.5 space-y-2">
                  <span className="font-bold text-rose-800 text-[11px] uppercase tracking-wider block border-b border-rose-200 pb-1">
                    Deductions
                  </span>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Provident Fund:</span>
                    <span className="font-mono font-semibold text-rose-600">-{formatCurrency(selectedPayslip.pfDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax / TDS:</span>
                    <span className="font-mono font-semibold text-rose-600">-{formatCurrency(selectedPayslip.taxDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Leave Deduction:</span>
                    <span className="font-mono font-semibold text-rose-600">-{formatCurrency(selectedPayslip.leaveDeduction)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Other Deductions:</span>
                    <span className="font-mono font-semibold text-rose-600">-{formatCurrency(selectedPayslip.otherDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net Payout Banner */}
              <div className="flex items-center justify-between rounded-xl bg-slate-900 p-4 text-white">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                    Net Take-Home Pay
                  </span>
                  <span className="text-xs text-slate-300">Directly transferred to bank account</span>
                </div>
                <span className="font-heading text-2xl font-black text-emerald-400">
                  {formatCurrency(selectedPayslip.netSalary)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                <Download size={14} /> Print / Download PDF
              </button>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-500 transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
