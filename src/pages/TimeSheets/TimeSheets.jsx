import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FileSpreadsheet,
  Plus,
  CheckCircle2,
  Clock,
  Briefcase,
  AlertCircle,
  Calendar,
} from 'lucide-react';
import { addTimesheet, updateTimesheetStatus } from '../../redux/slices/timesheetSlice';
import Modal from '../../Components/Common/Modal';

export default function TimeSheets() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { timesheets } = useSelector((state) => state.timesheets);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    week: 'Current Week',
    project: 'Enterprise School ERP & SIS',
    client: 'St. Xavier Academy',
    mon: 8, tue: 8, wed: 8, thu: 8, fri: 8, sat: 0, sun: 0,
    billable: 38,
  });

  const handleSubmitTimesheet = (e) => {
    e.preventDefault();
    const totalHours =
      Number(form.mon) +
      Number(form.tue) +
      Number(form.wed) +
      Number(form.thu) +
      Number(form.fri) +
      Number(form.sat) +
      Number(form.sun);

    dispatch(
      addTimesheet({
        ...form,
        totalHours,
      })
    );
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <FileSpreadsheet size={13} /> Project Hours & Billing
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Timesheets & Work Logs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log weekly billable sprint hours, client project allocations, and manager approvals
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>Log Weekly Hours</span>
        </button>
      </div>

      {/* Summary Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            This Week's Logged Hours
          </span>
          <p className="font-heading text-3xl font-extrabold text-slate-900 mt-2">40.0 hrs</p>
          <span className="text-xs text-emerald-600 font-bold mt-1 inline-block">✓ 100% Target Met</span>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Billable Client Utilization
          </span>
          <p className="font-heading text-3xl font-extrabold text-blue-600 mt-2">92.5%</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">37.0 Billable / 3.0 Internal</span>
        </div>

        <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            Approval Compliance
          </span>
          <p className="font-heading text-3xl font-extrabold text-emerald-600 mt-2">Approved</p>
          <span className="text-xs text-slate-400 mt-1 inline-block">Signed by Principal Architect</span>
        </div>
      </div>

      {/* Timesheets List Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Weekly Timesheet Submission Archive
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of daily hour distribution across sprints
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Timesheet ID</th>
                <th className="pb-3">Week Period</th>
                <th className="pb-3">Project / Client</th>
                <th className="pb-3 text-center">Mon</th>
                <th className="pb-3 text-center">Tue</th>
                <th className="pb-3 text-center">Wed</th>
                <th className="pb-3 text-center">Thu</th>
                <th className="pb-3 text-center">Fri</th>
                <th className="pb-3 text-center font-bold text-slate-900">Total</th>
                <th className="pb-3">Status</th>
                {user?.role === 'HR Administrator' && <th className="pb-3 text-right">Review</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {timesheets.map((ts) => (
                <tr key={ts.id} className="hover:bg-slate-50/60">
                  <td className="py-3.5 font-mono font-bold text-slate-800">{ts.id}</td>
                  <td className="py-3.5 font-medium text-slate-900">{ts.week}</td>
                  <td className="py-3.5">
                    <p className="font-semibold text-slate-900">{ts.project}</p>
                    <p className="text-[11px] text-slate-400">{ts.client}</p>
                  </td>
                  <td className="py-3.5 text-center font-mono">{ts.mon}h</td>
                  <td className="py-3.5 text-center font-mono">{ts.tue}h</td>
                  <td className="py-3.5 text-center font-mono">{ts.wed}h</td>
                  <td className="py-3.5 text-center font-mono">{ts.thu}h</td>
                  <td className="py-3.5 text-center font-mono">{ts.fri}h</td>
                  <td className="py-3.5 text-center font-mono font-extrabold text-blue-600">
                    {ts.totalHours}h
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        ts.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : ts.status === 'Submitted'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {ts.status}
                    </span>
                  </td>
                  {user?.role === 'HR Administrator' && (
                    <td className="py-3.5 text-right">
                      {ts.status === 'Submitted' && (
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(updateTimesheetStatus({ id: ts.id, status: 'Approved' }))
                          }
                          className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
                        >
                          Approve
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Timesheet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Log Weekly Project Hours"
        subtitle="Enter daily hours spent on assigned deliverables"
      >
        <form onSubmit={handleSubmitTimesheet} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Project Track *
            </label>
            <select
              value={form.project}
              onChange={(e) => setForm({ ...form, project: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Enterprise School ERP & SIS">Enterprise School ERP & SIS</option>
              <option value="Autonomous AI Legal Copilot">Autonomous AI Legal Copilot</option>
              <option value="Multi-Cloud Kubernetes Migration">Multi-Cloud Kubernetes Migration</option>
              <option value="FinTech SOC 2 Security Audit">FinTech SOC 2 Security Audit</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1.5">
              Daily Hours Distribution (Mon - Fri)
            </label>
            <div className="grid grid-cols-5 gap-2 text-center text-xs">
              {['mon', 'tue', 'wed', 'thu', 'fri'].map((day) => (
                <div key={day}>
                  <span className="block text-[10px] font-mono font-bold uppercase text-slate-500 mb-1">
                    {day}
                  </span>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="14"
                    value={form[day]}
                    onChange={(e) => setForm({ ...form, [day]: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 py-2 text-center text-xs font-mono font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Billable Client Hours Estimate
            </label>
            <input
              type="number"
              step="0.5"
              value={form.billable}
              onChange={(e) => setForm({ ...form, billable: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Submit Timesheet
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
