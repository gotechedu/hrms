import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  DollarSign,
  Plus,
  Search,
  Filter,
  Download,
  FileText,
  Trash2,
  RefreshCw,
  CheckCircle2,
  Clock,
  ChevronLeft,
  Users,
  Shield,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { payrollApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function OrgEmployeePayRol() {
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
  const [monthFilter, setMonthFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState(null);

  const initialForm = {
    category: 'org-employee',
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    roleDesignation: 'Software Engineer',
    department: 'Engineering',
    month: 'August 2026',
    year: 2026,
    basicSalary: 55000,
    hra: 22000,
    da: 6000,
    specialAllowance: 9000,
    performanceBonus: 0,
    pfDeduction: 6600,
    taxDeduction: 4500,
    leaveDeduction: 0,
    otherDeductions: 0,
    paymentStatus: 'Pending',
    paymentMethod: 'Direct Bank Transfer',
    remarks: 'Monthly salary disbursement',
  };
  const [formData, setFormData] = useState(initialForm);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const res = await payrollApi.getPayrolls({
        category: 'org-employee',
        paymentStatus: statusFilter,
        month: monthFilter,
        search: searchQuery,
      });
      if (res && res.payrolls) {
        setPayrolls(res.payrolls);
      }
    } catch (err) {
      console.error('Fetch Org Payroll Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [statusFilter, monthFilter]);

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
      alert(err.message || 'Failed to create employee payroll');
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
    if (!window.confirm('Move this payroll record to Recycle Bin?')) return;
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

  const totalGrossDisbursed = payrolls
    .filter((p) => p.paymentStatus === 'Paid')
    .reduce((sum, p) => sum + (p.netSalary || 0), 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Breadcrumb & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 transition"
          >
            <ChevronLeft size={14} /> Back to Payroll Central
          </Link>
          <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Building2 size={18} />
            </div>
            Organization Employee Payroll
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise salary ledger, compensation breakdown & statutory compliance (PF / TDS).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canCreatePayroll && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition cursor-pointer"
            >
              <Plus size={16} /> Add Salary Entry
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

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Total Org Payout</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(totalGrossDisbursed)}
          </p>
          <p className="mt-1 text-xs text-blue-600 font-semibold">Active monthly payroll run</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Salaried Staff</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {payrolls.length} Records
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">Permanent full-time workforce</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <span className="text-xs font-mono font-bold uppercase text-slate-400">Statutory Tax & PF</span>
          <p className="mt-2 font-heading text-2xl font-black text-slate-900">
            {formatCurrency(
              payrolls.reduce((sum, p) => sum + (p.pfDeduction || 0) + (p.taxDeduction || 0), 0)
            )}
          </p>
          <p className="mt-1 text-xs text-slate-500 font-medium">EPF & IT TDS deducted</p>
        </div>
      </div>

      {/* Table & Filtering */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search employee name, ID, role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-60 sm:w-72 rounded-xl border border-slate-200 pl-9 pr-3 text-xs focus:border-blue-600 focus:outline-none"
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
                <th className="px-6 py-3.5">Employee Name & Role</th>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Basic + Allowances</th>
                <th className="px-6 py-3.5">PF & Tax TDS</th>
                <th className="px-6 py-3.5">Net Salary</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 animate-spin text-blue-600" size={24} />
                    Loading employee payroll records...
                  </td>
                </tr>
              ) : payrolls.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No org employee payroll records found.
                  </td>
                </tr>
              ) : (
                payrolls.map((row) => {
                  const gross =
                    Number(row.basicSalary || 0) +
                    Number(row.hra || 0) +
                    Number(row.da || 0) +
                    Number(row.specialAllowance || 0) +
                    Number(row.performanceBonus || 0);

                  const deductions =
                    Number(row.pfDeduction || 0) +
                    Number(row.taxDeduction || 0) +
                    Number(row.leaveDeduction || 0);

                  return (
                    <tr key={row._id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-4">
                        <span className="font-bold text-slate-900 text-sm block">
                          {row.recipientName}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 block">
                          {row.payrollId || row._id.slice(-6)} • {row.recipientEmail}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {row.roleDesignation} ({row.department})
                        </span>
                      </td>

                      <td className="px-6 py-4 font-mono font-semibold text-slate-600">
                        {row.month}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-slate-900">
                          {formatCurrency(gross)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Basic: {formatCurrency(row.basicSalary)} | HRA: {formatCurrency(row.hra)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-mono font-semibold text-rose-600">
                          -{formatCurrency(deductions)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          PF: {formatCurrency(row.pfDeduction)} | TDS: {formatCurrency(row.taxDeduction)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-heading font-black text-slate-900 text-sm">
                          {formatCurrency(row.netSalary)}
                        </span>
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
                          <button
                            onClick={() => setSelectedPayslip(row)}
                            title="Generate Payslip"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
                          >
                            <FileText size={15} />
                          </button>
                          {canDeletePayroll && (
                            <button
                              onClick={() => handleDelete(row._id)}
                              title="Delete"
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">
                Add Org Employee Salary Record
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:outline-none"
                    placeholder="e.g. Aditi Sharma"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Email *</label>
                  <input
                    type="email"
                    required
                    value={formData.recipientEmail}
                    onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:outline-none"
                    placeholder="aditi@gotechedu.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation</label>
                  <input
                    type="text"
                    value={formData.roleDesignation}
                    onChange={(e) => setFormData({ ...formData, roleDesignation: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Month *</label>
                  <input
                    type="text"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
                <span className="font-bold text-slate-900 block text-xs">Compensation Details (₹)</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block">Basic Pay</label>
                    <input
                      type="number"
                      value={formData.basicSalary}
                      onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">HRA (40%)</label>
                    <input
                      type="number"
                      value={formData.hra}
                      onChange={(e) => setFormData({ ...formData, hra: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block">DA / Allowances</label>
                    <input
                      type="number"
                      value={formData.specialAllowance}
                      onChange={(e) => setFormData({ ...formData, specialAllowance: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-slate-200 px-2 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-rose-500 block">PF (12%)</label>
                    <input
                      type="number"
                      value={formData.pfDeduction}
                      onChange={(e) => setFormData({ ...formData, pfDeduction: Number(e.target.value) })}
                      className="h-8 w-full rounded-lg border border-rose-200 px-2 font-mono text-rose-600 bg-rose-50"
                    />
                  </div>
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
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30"
                >
                  Create Salary Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
