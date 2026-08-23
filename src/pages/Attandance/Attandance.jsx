import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Clock,
  Calendar,
  Plus,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  FileText,
  User,
  Sparkles,
} from 'lucide-react';
import { toggleClockInOut, applyLeave, updateLeaveStatus } from '../../redux/slices/attendanceSlice';
import Modal from '../../Components/Common/Modal';

export default function Attandance() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isCheckedIn, lastCheckInTime, leaveBalances, logs, leaveRequests } = useSelector(
    (state) => state.attendance
  );

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    from: '',
    to: '',
    days: 1,
    reason: '',
  });

  const handleApplyLeave = (e) => {
    e.preventDefault();
    dispatch(applyLeave(leaveForm));
    setIsLeaveModalOpen(false);
    setLeaveForm({
      type: 'Casual Leave',
      from: '',
      to: '',
      days: 1,
      reason: '',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Clock size={13} /> Time & Attendance Telemetry
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Attendance & Leave Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time biometric shift verification, time off balances, and vacation planning
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsLeaveModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>Apply For Leave</span>
        </button>
      </div>

      {/* Clock In / Out Banner & Leave Quotas */}
      <div className="grid gap-6 lg:grid-cols-12 items-stretch">
        {/* Left 5 cols: Interactive Shift Punch Console */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                Workstation Session
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                  isCheckedIn
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                  }`}
                />
                {isCheckedIn ? 'Shift In Progress' : 'Workstation Idle'}
              </span>
            </div>

            <div className="mt-6 text-center">
              <span className="text-xs text-slate-400 font-mono">Today's Clock-in Timestamp</span>
              <div className="font-heading text-4xl sm:text-5xl font-black text-slate-900 mt-1">
                {isCheckedIn ? lastCheckInTime : '09:02 AM'}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Assigned Shift: General Day (09:00 AM – 06:00 PM IST)
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={() => dispatch(toggleClockInOut())}
              className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg transition active:scale-98 ${
                isCheckedIn
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              {isCheckedIn ? <Pause size={18} /> : <Play size={18} />}
              <span>{isCheckedIn ? 'Clock Out Workstation' : 'Clock In Workstation'}</span>
            </button>
          </div>
        </div>

        {/* Right 7 cols: Leave Balances Cards */}
        <div className="lg:col-span-7 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Annual Leave Portfolio
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Available quota balance for calendar year 2025
            </p>

            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-blue-700">
                  {leaveBalances.casual.available}
                </span>
                <span className="block text-[11px] font-bold text-slate-700 mt-1">Casual Leave</span>
                <span className="text-[10px] text-slate-400 font-mono">3 / 12 used</span>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-emerald-700">
                  {leaveBalances.medical.available}
                </span>
                <span className="block text-[11px] font-bold text-slate-700 mt-1">Medical Leave</span>
                <span className="text-[10px] text-slate-400 font-mono">1 / 10 used</span>
              </div>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 text-center">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-purple-700">
                  {leaveBalances.privilege.available}
                </span>
                <span className="block text-[11px] font-bold text-slate-700 mt-1">Privilege Leave</span>
                <span className="text-[10px] text-slate-400 font-mono">4 / 15 used</span>
              </div>

              <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-center">
                <span className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-700">
                  {leaveBalances.compensatory.available}
                </span>
                <span className="block text-[11px] font-bold text-slate-700 mt-1">Comp-Off</span>
                <span className="text-[10px] text-slate-400 font-mono">0 / 4 used</span>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-slate-50 p-3.5 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Next Encashment Window: <strong>December 2025</strong></span>
            <span className="text-blue-600 font-bold">Policy Guide →</span>
          </div>
        </div>
      </div>

      {/* Leave Application History & Requests */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Leave Requests & Approvals
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Recent time-off applications and manager reviews
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Request ID</th>
                <th className="pb-3">Leave Type</th>
                <th className="pb-3">Dates</th>
                <th className="pb-3">Days</th>
                <th className="pb-3">Reason</th>
                <th className="pb-3">Status</th>
                {user?.role === 'HR Administrator' && <th className="pb-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {leaveRequests.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-bold text-slate-800">{item.id}</td>
                  <td className="py-3 font-semibold text-slate-900">{item.type}</td>
                  <td className="py-3 text-slate-600 font-mono">{item.from} to {item.to}</td>
                  <td className="py-3 font-bold text-slate-900">{item.days} Day(s)</td>
                  <td className="py-3 text-slate-600 max-w-xs truncate">{item.reason}</td>
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        item.status === 'Approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  {user?.role === 'HR Administrator' && (
                    <td className="py-3 text-right">
                      {item.status === 'Pending Review' ? (
                        <div className="inline-flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => dispatch(updateLeaveStatus({ id: item.id, status: 'Approved' }))}
                            className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => dispatch(updateLeaveStatus({ id: item.id, status: 'Rejected' }))}
                            className="rounded-lg bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-100"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">Processed</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Daily Attendance Logs Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="font-heading text-lg font-bold text-slate-900">
              Biometric Punch & Activity History
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified daily gate logs and automated work hour records
            </p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                <th className="pb-3">Date</th>
                <th className="pb-3">Check In</th>
                <th className="pb-3">Check Out</th>
                <th className="pb-3">Working Duration</th>
                <th className="pb-3">Verification Source</th>
                <th className="pb-3 text-right">Day Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60">
                  <td className="py-3 font-mono font-semibold text-slate-900">{log.date}</td>
                  <td className="py-3 font-mono text-slate-700">{log.checkIn}</td>
                  <td className="py-3 font-mono text-slate-700">{log.checkOut}</td>
                  <td className="py-3 font-mono font-bold text-slate-900">{log.workingHours}</td>
                  <td className="py-3 text-slate-500">{log.mode}</td>
                  <td className="py-3 text-right">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        log.status === 'Present'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : log.status === 'Late'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Leave Modal */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Submit Leave Application"
        subtitle="Specify leave classification, date window, and coverage details"
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Leave Classification *
            </label>
            <select
              value={leaveForm.type}
              onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Casual Leave">Casual Leave (9 days remaining)</option>
              <option value="Medical Leave">Medical Leave (9 days remaining)</option>
              <option value="Privilege Leave">Privilege Leave (11 days remaining)</option>
              <option value="Compensatory Off">Compensatory Off (4 days remaining)</option>
            </select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.from}
                onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                value={leaveForm.to}
                onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Total Business Days *
            </label>
            <input
              type="number"
              min="1"
              max="30"
              required
              value={leaveForm.days}
              onChange={(e) => setLeaveForm({ ...leaveForm, days: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Reason / Project Handover Details *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Provide reason and backup teammate during absence..."
              value={leaveForm.reason}
              onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Submit Application
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
