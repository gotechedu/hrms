import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Calendar,
  Layers,
  Search,
  Filter,
  Check,
  X,
  RefreshCw,
  Eye,
  Trash2,
  Edit2,
  User,
  Users,
} from 'lucide-react';
import { timesheetApi } from '../../Service';
import notify from '../../utils/toast';

export default function TimeSheets() {
  const { user } = useSelector((state) => state.auth);

  // Role permissions
  const userRole = (user?.role || 'employee').toLowerCase();
  const permissions = user?.permissions || [];
  const isSuperadmin = userRole === 'superadmin';
  const canManageTimesheets =
    isSuperadmin ||
    permissions.includes('projects') ||
    ['admin', 'hr', 'manager', 'teamlead'].includes(userRole);

  const [activeTab, setActiveTab] = useState('my'); // 'my' | 'roster'
  const [loading, setLoading] = useState(true);

  // Data states
  const [myTimesheets, setMyTimesheets] = useState([]);
  const [orgTimesheets, setOrgTimesheets] = useState([]);
  const [orgMetrics, setOrgMetrics] = useState({});

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Helper to get current Monday
  const getCurrentMonday = () => {
    const d = new Date();
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    return monday.toISOString().split('T')[0];
  };

  const initialForm = {
    weekStartDate: getCurrentMonday(),
    project: 'Enterprise School ERP & SIS',
    client: 'St. Xavier Academy',
    taskCategory: 'Development',
    dailyHours: { mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0 },
    billableHours: 40,
    description: '',
    status: 'Submitted',
  };

  const [form, setForm] = useState(initialForm);

  // Fetch data
  const fetchMyData = async () => {
    try {
      const res = await timesheetApi.getMyTimesheets();
      const data = res.data || res;
      setMyTimesheets(data.timesheets || []);
    } catch (err) {
      console.error('Failed to load my timesheets:', err);
    }
  };

  const fetchOrgData = async () => {
    if (!canManageTimesheets) return;
    try {
      const res = await timesheetApi.getAllTimesheets({
        status: statusFilter,
        project: projectFilter,
      });
      const data = res.data || res;
      setOrgTimesheets(data.timesheets || []);
      setOrgMetrics(data.metrics || {});
    } catch (err) {
      console.error('Failed to load org timesheets:', err);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    await fetchMyData();
    if (canManageTimesheets) {
      await fetchOrgData();
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, [statusFilter, projectFilter]);

  // Compute total hours dynamically in form
  const totalFormHours = Object.values(form.dailyHours || {}).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const handleHourChange = (day, val) => {
    const num = Math.max(0, Math.min(24, Number(val) || 0));
    const newDaily = { ...form.dailyHours, [day]: num };
    const newTotal = Object.values(newDaily).reduce((sum, v) => sum + (Number(v) || 0), 0);
    setForm({
      ...form,
      dailyHours: newDaily,
      billableHours: newTotal,
    });
  };

  // Submit / Update
  const handleSubmitTimesheet = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        await timesheetApi.updateTimesheet(editingId, form);
        notify.success('Timesheet updated successfully!');
      } else {
        await timesheetApi.createTimesheet(form);
        notify.success('Weekly timesheet submitted for approval!');
      }
      setIsModalOpen(false);
      setEditingId(null);
      setForm(initialForm);
      fetchMyData();
      if (canManageTimesheets) fetchOrgData();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save timesheet');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timesheet entry?')) return;
    try {
      await timesheetApi.deleteTimesheet(id);
      notify.success('Timesheet deleted successfully');
      fetchMyData();
      if (canManageTimesheets) fetchOrgData();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to delete timesheet');
    }
  };

  // Approve / Reject status
  const handleStatusUpdate = async (id, status) => {
    try {
      await timesheetApi.updateTimesheetStatus(id, status);
      notify.success(`Timesheet ${status.toLowerCase()} successfully!`);
      fetchOrgData();
      fetchMyData();
    } catch (err) {
      notify.error(err.response?.data?.message || 'Failed to update approval status');
    }
  };

  // Personal Totals
  const myTotalLogged = myTimesheets.reduce((sum, t) => sum + (t.totalHours || 0), 0);
  const myTotalBillable = myTimesheets.reduce((sum, t) => sum + (t.billableHours || 0), 0);
  const myApprovedCount = myTimesheets.filter((t) => t.status === 'Approved').length;

  // Filtered Roster
  const filteredOrgList = orgTimesheets.filter((t) => {
    const q = searchTerm.toLowerCase();
    const name = (t.employee?.name || t.user?.name || '').toLowerCase();
    const proj = (t.project || '').toLowerCase();
    const client = (t.client || '').toLowerCase();
    return name.includes(q) || proj.includes(q) || client.includes(q);
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <FileSpreadsheet size={13} /> Project Hours & Billing
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Timesheets & Sprint Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log weekly billable sprint hours, client project allocations, and manager approvals.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadAll}
            title="Refresh Timesheets"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Log Weekly Hours</span>
          </button>
        </div>
      </div>

      {/* Summary Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Logged Hours (Personal)
          </span>
          <p className="font-heading text-3xl font-black text-slate-900 mt-2">
            {myTotalLogged.toFixed(1)} hrs
          </p>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">
            ✓ Across {myTimesheets.length} Weekly Submissions
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Billable Client Utilization
          </span>
          <p className="font-heading text-3xl font-black text-blue-600 mt-2">
            {myTotalLogged > 0 ? Math.round((myTotalBillable / myTotalLogged) * 100) : 100}%
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">
            {myTotalBillable.toFixed(1)} Billable / {(myTotalLogged - myTotalBillable).toFixed(1)} Internal
          </span>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approved Submissions
          </span>
          <p className="font-heading text-3xl font-black text-emerald-600 mt-2">
            {myApprovedCount} / {myTimesheets.length}
          </p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Manager Compliance Verified</span>
        </div>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'my'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User size={14} /> My Weekly Logs ({myTimesheets.length})
        </button>

        {canManageTimesheets && (
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users size={14} /> Team & Org Approvals ({orgTimesheets.length})
          </button>
        )}
      </div>

      {/* ================= TAB 1: MY TIMESHEETS ================= */}
      {activeTab === 'my' && (
        <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              My Timesheet History
            </h3>
            <span className="text-xs font-mono text-slate-400">{myTimesheets.length} Entries</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Week Starting</th>
                  <th className="px-4 py-3.5">Project & Client</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5 text-center">Mon-Sun Breakdown</th>
                  <th className="px-4 py-3.5 text-center">Total Hours</th>
                  <th className="px-4 py-3.5 text-center">Billable</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {myTimesheets.map((item) => (
                  <tr key={item._id || item.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4 font-bold font-mono text-slate-900">
                      {item.weekStartDate}
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-bold text-slate-900">{item.project}</div>
                      <div className="text-[11px] text-slate-400">{item.client}</div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                        {item.taskCategory}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1 font-mono text-[11px]">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold" title="Mon">
                          {item.dailyHours?.mon || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold" title="Tue">
                          {item.dailyHours?.tue || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold" title="Wed">
                          {item.dailyHours?.wed || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold" title="Thu">
                          {item.dailyHours?.thu || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold" title="Fri">
                          {item.dailyHours?.fri || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-400" title="Sat">
                          {item.dailyHours?.sat || 0}
                        </span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-400" title="Sun">
                          {item.dailyHours?.sun || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-bold text-slate-900">
                      {item.totalHours} hrs
                    </td>
                    <td className="px-4 py-4 text-center font-mono font-semibold text-blue-600">
                      {item.billableHours} hrs
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {item.status !== 'Approved' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(item._id || item.id);
                              setForm({
                                weekStartDate: item.weekStartDate,
                                project: item.project,
                                client: item.client,
                                taskCategory: item.taskCategory,
                                dailyHours: item.dailyHours || initialForm.dailyHours,
                                billableHours: item.billableHours || item.totalHours,
                                description: item.description || '',
                                status: item.status,
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-blue-600 transition cursor-pointer"
                            title="Edit Timesheet"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item._id || item.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                            title="Delete Timesheet"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}

                {myTimesheets.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-10 text-center text-slate-400 font-medium">
                      No timesheets logged yet. Click "Log Weekly Hours" to log your first sprint!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ORGANIZATION APPROVALS (MANAGERS/HR/ADMIN) ================= */}
      {activeTab === 'roster' && canManageTimesheets && (
        <div className="space-y-6">
          {/* Org Search & Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative max-w-sm w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee, project, client..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Submitted">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Org Timesheets Roster Table */}
          <div className="rounded-3xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-4 py-4">Week Starting</th>
                    <th className="px-4 py-4">Project & Client</th>
                    <th className="px-4 py-4 text-center">Total Hours</th>
                    <th className="px-4 py-4 text-center">Billable</th>
                    <th className="px-4 py-4">Status</th>
                    <th className="px-4 py-4 text-right">Approval Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredOrgList.map((item) => (
                    <tr key={item._id || item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                            {(item.employee?.name || item.user?.name || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {item.employee?.name || item.user?.name}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">{item.user?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 font-mono font-bold text-slate-900">{item.weekStartDate}</td>
                      <td className="px-4 py-4">
                        <div className="font-bold text-slate-900">{item.project}</div>
                        <div className="text-[11px] text-slate-400">{item.client}</div>
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-bold text-slate-900">
                        {item.totalHours} hrs
                      </td>
                      <td className="px-4 py-4 text-center font-mono font-semibold text-blue-600">
                        {item.billableHours} hrs
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold ${
                            item.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : item.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {item.status === 'Submitted' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(item._id || item.id, 'Approved')}
                              className="rounded-lg bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleStatusUpdate(item._id || item.id, 'Rejected')}
                              className="rounded-lg border border-slate-200 px-3 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] font-mono text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}

                  {filteredOrgList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No timesheet submissions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOG WEEKLY HOURS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">
                {editingId ? 'Edit Weekly Timesheet' : 'Log Weekly Project Sprint Hours'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitTimesheet} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Week Starting (Mon) *</label>
                  <input
                    type="date"
                    required
                    value={form.weekStartDate}
                    onChange={(e) => setForm({ ...form, weekStartDate: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Task Category</label>
                  <select
                    value={form.taskCategory}
                    onChange={(e) => setForm({ ...form, taskCategory: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Development">Development</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Code Review & Architecture">Code Review & Architecture</option>
                    <option value="Sprint Planning & Meetings">Sprint Planning & Meetings</option>
                    <option value="DevOps & Cloud Infrastructure">DevOps & Cloud Infrastructure</option>
                    <option value="Client Support & Training">Client Support & Training</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Project Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Enterprise School ERP & SIS"
                    value={form.project}
                    onChange={(e) => setForm({ ...form, project: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Account</label>
                  <input
                    type="text"
                    placeholder="e.g. Internal GoTechEdu"
                    value={form.client}
                    onChange={(e) => setForm({ ...form, client: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Day-by-Day Hours Input */}
              <div className="rounded-2xl bg-slate-50 p-3.5 border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-700 uppercase text-[11px]">Daily Hours Breakdown</span>
                  <span className="font-mono font-bold text-blue-600">Total: {totalFormHours} hrs</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((day) => (
                    <div key={day}>
                      <label className="block text-[10px] font-bold uppercase text-slate-500 mb-1">
                        {day}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="24"
                        value={form.dailyHours[day] || 0}
                        onChange={(e) => handleHourChange(day, e.target.value)}
                        className="h-9 w-full rounded-lg border border-slate-200 bg-white text-center font-mono font-bold text-slate-800 focus:border-blue-500 focus:outline-none text-xs"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Billable Hours</label>
                <input
                  type="number"
                  min="0"
                  max="168"
                  value={form.billableHours}
                  onChange={(e) => setForm({ ...form, billableHours: Number(e.target.value) })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Sprint Notes / Summary</label>
                <textarea
                  rows={2}
                  placeholder="Key deliverables, tickets completed, blockers resolved..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Timesheet' : 'Submit Timesheet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
