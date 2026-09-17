import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
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
  RefreshCw,
  Globe,
  MapPin,
  Check,
  X,
  Users,
  ShieldCheck,
  Search,
} from 'lucide-react';
import { attendanceApi } from '../../Service';
import notify from '../../utils/toast';
import usePermissions from '../../utils/usePermissions';

export default function Attandance() {
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();
  const userRole = role || (user?.role || 'employee').toLowerCase();
  const canManageAttendance =
    isSuperAdmin ||
    hasPermission('manage_attendance') ||
    hasPermission('manage_attandance') ||
    can('manage', 'attendance');

  // Active View Tab: 'my' (Personal) | 'roster' (Company-wide) | 'leaves' (Leave Requests)
  const [activeTab, setActiveTab] = useState('my');

  // Punch State
  const [todayRecord, setTodayRecord] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [punching, setPunching] = useState(false);
  const [elapsedTimer, setElapsedTimer] = useState('0h 0m 0s');
  const [liveCurrentTime, setLiveCurrentTime] = useState(new Date());

  // Real-time clock tick
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setLiveCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockInterval);
  }, []);

  // Personal Logs & Leaves
  const [myLogs, setMyLogs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Organization Roster State (For HR / Admins / Managers)
  const [orgRoster, setOrgRoster] = useState([]);
  const [orgMetrics, setOrgMetrics] = useState({});
  const [rosterDate, setRosterDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Apply Leave Modal
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [submittingLeave, setSubmittingLeave] = useState(false);
  const [leaveForm, setLeaveForm] = useState({
    type: 'Casual Leave',
    from: '',
    to: '',
    days: 1,
    reason: '',
  });

  // Fetch today status & personal logs on mount
  const fetchTodayStatus = async () => {
    try {
      const res = await attendanceApi.getTodayStatus();
      const data = res.data || res;
      setIsCheckedIn(Boolean(data.isCheckedIn));
      setTodayRecord(data.record || null);
    } catch (err) {
      console.error('Failed to get today punch status:', err);
    }
  };

  const fetchMyLogs = async () => {
    try {
      const res = await attendanceApi.getMyAttendance();
      const data = res.data || res;
      setMyLogs(data.records || []);
    } catch (err) {
      console.error('Failed to load attendance logs:', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      const res = await attendanceApi.getLeaveRequests();
      const data = res.data || res;
      setLeaveRequests(data.leaves || []);
    } catch (err) {
      console.error('Failed to load leave requests:', err);
    }
  };

  const fetchOrgRoster = async () => {
    if (!canManageAttendance) return;
    try {
      setLoading(true);
      const res = await attendanceApi.getAllAttendance({
        date: rosterDate,
        status: statusFilter,
      });
      const data = res.data || res;
      setOrgRoster(data.records || []);
      setOrgMetrics(data.metrics || {});
    } catch (err) {
      console.error('Failed to load org attendance roster:', err);
    } finally {
      setLoading(false);
    }
  };

  const initData = async () => {
    setLoading(true);
    await Promise.all([fetchTodayStatus(), fetchMyLogs(), fetchLeaves()]);
    if (canManageAttendance) {
      await fetchOrgRoster();
    }
    setLoading(false);
  };

  useEffect(() => {
    initData();
  }, [rosterDate, statusFilter]);

  // Live Timer when user is clocked in
  useEffect(() => {
    let interval = null;
    if (isCheckedIn && todayRecord?.clockIn) {
      const clockInTime = new Date(todayRecord.clockIn).getTime();

      const updateTimer = () => {
        const diffMs = Math.max(0, Date.now() - clockInTime);
        const totalSec = Math.floor(diffMs / 1000);
        const hrs = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        setElapsedTimer(`${hrs}h ${mins}m ${secs}s`);
      };

      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
      setElapsedTimer('0h 0m 0s');
    }
    return () => clearInterval(interval);
  }, [isCheckedIn, todayRecord]);

  // Handle Punch In / Punch Out
  const handleTogglePunch = async () => {
    try {
      setPunching(true);
      if (isCheckedIn) {
        // Clock Out
        const res = await attendanceApi.clockOut();
        const data = res.data || res;
        notify.success(data.message || 'Clock-out recorded successfully!');
        setIsCheckedIn(false);
        setTodayRecord(data.record);
      } else {
        // Clock In
        const res = await attendanceApi.clockIn();
        const data = res.data || res;
        notify.success(data.message || 'Clock-in recorded successfully!');
        setIsCheckedIn(true);
        setTodayRecord(data.record);
      }
      fetchMyLogs();
      if (canManageAttendance) fetchOrgRoster();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to record punch');
    } finally {
      setPunching(false);
    }
  };

  // Submit Leave Request
  const handleApplyLeave = async (e) => {
    e.preventDefault();
    if (!leaveForm.from || !leaveForm.to) {
      notify.warning('Please select start and end dates.');
      return;
    }

    try {
      setSubmittingLeave(true);
      const res = await attendanceApi.applyLeave(leaveForm);
      notify.success(res.data?.message || res.message || 'Leave application submitted!');
      setIsLeaveModalOpen(false);
      setLeaveForm({ type: 'Casual Leave', from: '', to: '', days: 1, reason: '' });
      fetchLeaves();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to submit leave');
    } finally {
      setSubmittingLeave(false);
    }
  };

  // Approve / Reject Leave
  const handleLeaveStatusUpdate = async (id, status) => {
    try {
      const res = await attendanceApi.updateLeaveStatus(id, status);
      notify.success(res.data?.message || `Leave ${status.toLowerCase()} successfully!`);
      fetchLeaves();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update leave');
    }
  };

  // Filtered Roster
  const filteredOrgRoster = orgRoster.filter((r) => {
    const q = searchTerm.toLowerCase();
    const name = (r.employee?.name || r.user?.name || '').toLowerCase();
    const email = (r.user?.email || '').toLowerCase();
    const empId = (r.employee?.employeeId || '').toLowerCase();
    const ip = (r.ipAddress || '').toLowerCase();
    return name.includes(q) || email.includes(q) || empId.includes(q) || ip.includes(q);
  });

  // Dynamic leave quotas calculated from real leave requests
  const casualUsed = leaveRequests
    .filter((l) => l.status === 'Approved' && l.type?.toLowerCase().includes('casual'))
    .reduce((sum, l) => sum + (Number(l.days) || 1), 0);
  const medicalUsed = leaveRequests
    .filter((l) => l.status === 'Approved' && (l.type?.toLowerCase().includes('sick') || l.type?.toLowerCase().includes('medical')))
    .reduce((sum, l) => sum + (Number(l.days) || 1), 0);
  const privilegeUsed = leaveRequests
    .filter((l) => l.status === 'Approved' && l.type?.toLowerCase().includes('privilege'))
    .reduce((sum, l) => sum + (Number(l.days) || 1), 0);
  const compUsed = leaveRequests
    .filter((l) => l.status === 'Approved' && l.type?.toLowerCase().includes('compensatory'))
    .reduce((sum, l) => sum + (Number(l.days) || 1), 0);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Clock size={13} /> Time & Attendance Telemetry
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Attendance & Work Telemetry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time biometric shift verification, live work timer, and leave balances.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={initData}
            title="Refresh Attendance Data"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            type="button"
            onClick={() => setIsLeaveModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Role-Based Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('my')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'my'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <User size={14} /> My Punch Console
        </button>

        {canManageAttendance && (
          <button
            type="button"
            onClick={() => setActiveTab('roster')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
              activeTab === 'roster'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Users size={14} /> Organization Roster (Live)
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer ${
            activeTab === 'leaves'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <CalendarDays size={14} /> Leave Requests ({leaveRequests.length})
        </button>
      </div>

      {/* ================= TAB 1: PERSONAL PUNCH CONSOLE ================= */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Shift Punch Console & Live Metrics */}
          <div className="grid gap-6 lg:grid-cols-12 items-stretch">
            {/* Punching Card */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                    Shift Punch Console
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
                  <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3.5 py-1 text-xs font-bold text-slate-700 font-mono mb-2">
                    <Calendar size={13} className="text-blue-600" />
                    <span>
                      {liveCurrentTime.toLocaleDateString('en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-blue-600 font-black">
                      {liveCurrentTime.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400 font-mono block mt-1">
                    {isCheckedIn ? 'Live Shift Duration Elapsed' : "Today's Work Status"}
                  </span>
                  <div className="font-heading text-4xl sm:text-5xl font-black text-slate-900 mt-1">
                    {isCheckedIn ? elapsedTimer : todayRecord ? todayRecord.totalHours : '0h 0m'}
                  </div>

                  {todayRecord?.clockIn && (
                    <div className="mt-3 flex items-center justify-center gap-4 text-xs font-medium text-slate-600">
                      <div>
                        Clock In: <span className="font-bold text-slate-900 font-mono">
                          {new Date(todayRecord.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {todayRecord.clockOut && (
                        <div>
                          Clock Out: <span className="font-bold text-slate-900 font-mono">
                            {new Date(todayRecord.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-100 px-3 py-1 text-[11px] font-mono text-slate-500">
                    <Globe size={12} className="text-blue-500" />
                    <span>Captured IP: </span>
                    <span className="font-bold text-slate-700">{todayRecord?.ipAddress || '127.0.0.1'}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  disabled={punching}
                  onClick={handleTogglePunch}
                  className={`w-full inline-flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs sm:text-sm font-bold uppercase tracking-wider text-white shadow-lg transition active:scale-98 cursor-pointer disabled:opacity-50 ${
                    isCheckedIn
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                  }`}
                >
                  {isCheckedIn ? <Pause size={18} /> : <Play size={18} />}
                  <span>{punching ? 'Processing...' : isCheckedIn ? 'Punch Out & End Shift' : 'Punch In & Start Shift'}</span>
                </button>
              </div>
            </div>

            {/* Leave Balance Quotas */}
            <div className="lg:col-span-6 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs flex flex-col justify-between">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400 block mb-4">
                  Annual Paid Time Off Quotas
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Casual Leave</span>
                    <div className="mt-1 text-2xl font-black text-slate-900">{Math.max(0, 12 - casualUsed)} Days</div>
                    <span className="text-[10px] text-slate-400 font-medium">{casualUsed} of 12 utilized</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Sick & Medical</span>
                    <div className="mt-1 text-2xl font-black text-slate-900">{Math.max(0, 10 - medicalUsed)} Days</div>
                    <span className="text-[10px] text-slate-400 font-medium">{medicalUsed} of 10 utilized</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Privilege Leave</span>
                    <div className="mt-1 text-2xl font-black text-slate-900">{Math.max(0, 15 - privilegeUsed)} Days</div>
                    <span className="text-[10px] text-slate-400 font-medium">{privilegeUsed} of 15 utilized</span>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    <span className="text-[11px] font-bold text-slate-500 uppercase">Compensatory Off</span>
                    <div className="mt-1 text-2xl font-black text-slate-900">{Math.max(0, 4 - compUsed)} Days</div>
                    <span className="text-[10px] text-slate-400 font-medium">{compUsed} of 4 utilized</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Need extended medical or personal time?</span>
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Submit Leave Application →
                </button>
              </div>
            </div>
          </div>

          {/* Personal Punch History Table */}
          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock size={16} className="text-blue-600" />
                Personal Punch History
              </h3>
              <span className="text-xs font-mono text-slate-400">{myLogs.length} Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-mono uppercase tracking-wider font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-4 py-3.5">Clock In</th>
                    <th className="px-4 py-3.5">Clock Out</th>
                    <th className="px-4 py-3.5">Total Worked</th>
                    <th className="px-4 py-3.5">IP Address</th>
                    <th className="px-4 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-3.5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3.5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3.5"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3.5"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-3.5"><div className="h-4 w-20 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-3.5"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                      </tr>
                    ))
                  ) : (
                    myLogs.map((log) => {
                      const inTime = log.clockIn
                        ? new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—';
                      const outTime = log.clockOut
                        ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : log.clockIn
                        ? 'In Progress'
                        : '—';

                      return (
                        <tr key={log._id || log.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-3.5 font-bold font-mono text-slate-900">{log.date}</td>
                          <td className="px-4 py-3.5 font-mono text-emerald-600 font-semibold">{inTime}</td>
                          <td className="px-4 py-3.5 font-mono text-slate-600">{outTime}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                            {log.totalHours || '0h 0m'}
                          </td>
                          <td className="px-4 py-4 font-mono text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                          <td className="px-4 py-3.5">
                            <span
                              className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                                log.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : log.status === 'Late'
                                  ? 'bg-amber-50 text-amber-700'
                                  : log.status === 'Half Day'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {!loading && myLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                        No punch logs recorded yet. Use the punch console above to record your shift!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: ORGANIZATION ROSTER (MANAGERS / HR / ADMIN) ================= */}
      {activeTab === 'roster' && canManageAttendance && (
        <div className="space-y-6">
          {/* Summary Metric Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-slate-500">Total Punches Today</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{orgMetrics.totalPunches || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-emerald-600">On-Time Present</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{orgMetrics.totalPresent || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-amber-600">Late Punches</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{orgMetrics.totalLate || 0}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <span className="text-[11px] font-bold uppercase text-blue-600">Active Shifts Live</span>
              <div className="text-2xl font-black text-blue-600 mt-1">{orgMetrics.activeShifts || 0}</div>
            </div>
          </div>

          {/* Roster Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="relative max-w-sm w-full">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by employee name, email, IP..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={rosterDate}
                onChange={(e) => setRosterDate(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-medium text-slate-800 focus:border-blue-500 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>

          {/* Organization Roster Table */}
          <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white font-mono uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-6 py-4">Employee</th>
                    <th className="px-4 py-4">Department</th>
                    <th className="px-4 py-4">Clock In</th>
                    <th className="px-4 py-4">Clock Out</th>
                    <th className="px-4 py-4">Worked Duration</th>
                    <th className="px-4 py-4">Client IP Address</th>
                    <th className="px-4 py-4">Shift Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {loading ? (
                    [1, 2, 3, 4].map((i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-200" />
                            <div className="space-y-1">
                              <div className="h-4 w-28 bg-slate-200 rounded" />
                              <div className="h-2.5 w-20 bg-slate-100 rounded" />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-16 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-14 bg-slate-200 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                        <td className="px-4 py-4"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                      </tr>
                    ))
                  ) : (
                    filteredOrgRoster.map((r) => {
                      const inTime = r.clockIn
                        ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—';
                      const outTime = r.clockOut
                        ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : 'In Progress';

                      return (
                        <tr key={r._id || r.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                                {(r.employee?.name || r.user?.name || 'U').charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{r.employee?.name || r.user?.name}</div>
                                <div className="text-[11px] font-mono text-slate-400">{r.user?.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-medium text-slate-600">
                            {r.employee?.department || 'General'}
                          </td>
                          <td className="px-4 py-4 font-mono text-emerald-600 font-semibold">{inTime}</td>
                          <td className="px-4 py-4 font-mono text-slate-600">{outTime}</td>
                          <td className="px-4 py-4 font-mono font-bold text-slate-900">{r.totalHours || '0h 0m'}</td>
                          <td className="px-4 py-4 font-mono text-slate-500">{r.ipAddress || '127.0.0.1'}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold ${
                                r.status === 'Present'
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : r.status === 'Late'
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {r.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}

                  {filteredOrgRoster.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400 font-medium">
                        No attendance punches recorded for this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: LEAVE REQUESTS ================= */}
      {activeTab === 'leaves' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays size={16} className="text-blue-600" />
              Leave Applications ({leaveRequests.length})
            </h3>
            <button
              type="button"
              onClick={() => setIsLeaveModalOpen(true)}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-500 cursor-pointer"
            >
              + Apply Leave
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Applicant</th>
                  <th className="px-4 py-3.5">Leave Type</th>
                  <th className="px-4 py-3.5">Duration</th>
                  <th className="px-4 py-3.5">Days</th>
                  <th className="px-4 py-3.5">Reason</th>
                  <th className="px-4 py-3.5">Status</th>
                  {canManageAttendance && <th className="px-4 py-3.5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {loading ? (
                  [1, 2, 3, 4].map((i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-3.5"><div className="h-4 w-28 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-20 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-24 bg-slate-100 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-12 bg-slate-200 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-4 w-32 bg-slate-100 rounded" /></td>
                      <td className="px-4 py-3.5"><div className="h-5 w-16 bg-slate-100 rounded-full" /></td>
                      {canManageAttendance && (
                        <td className="px-4 py-3.5 text-right"><div className="h-6 w-24 bg-slate-200 rounded-lg ml-auto" /></td>
                      )}
                    </tr>
                  ))
                ) : (
                  leaveRequests.map((leave) => (
                    <tr key={leave._id || leave.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-3.5 font-bold text-slate-900">
                        {leave.employee?.name || leave.user?.name || user?.name}
                      </td>
                      <td className="px-4 py-3.5 font-medium text-slate-700">{leave.type}</td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">
                        {leave.from} → {leave.to}
                      </td>
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-900">{leave.days} day(s)</td>
                      <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">{leave.reason || 'Personal'}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-bold ${
                            leave.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : leave.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {leave.status}
                        </span>
                      </td>
                      {canManageAttendance && (
                        <td className="px-4 py-3.5 text-right">
                          {leave.status === 'Pending Review' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleLeaveStatusUpdate(leave._id || leave.id, 'Approved')}
                                className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-500 transition cursor-pointer"
                              >
                                Approve
                              </button>
                              <button
                                type="button"
                                onClick={() => handleLeaveStatusUpdate(leave._id || leave.id, 'Rejected')}
                                className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-mono">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                )}

                {leaveRequests.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-400 font-medium">
                      No leave requests filed yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL: APPLY FOR LEAVE ================= */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">Apply For Time Off / Leave</h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={leaveForm.type}
                  onChange={(e) => setLeaveForm({ ...leaveForm, type: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                >
                  <option value="Casual Leave">Casual Leave (9 days remaining)</option>
                  <option value="Sick Leave">Medical / Sick Leave (9 days remaining)</option>
                  <option value="Privilege Leave">Privilege / Annual Leave (11 days remaining)</option>
                  <option value="Compensatory Off">Compensatory Off (4 days remaining)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">From Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.from}
                    onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">To Date *</label>
                  <input
                    type="date"
                    required
                    value={leaveForm.to}
                    onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })}
                    className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Total Days</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={leaveForm.days}
                  onChange={(e) => setLeaveForm({ ...leaveForm, days: Number(e.target.value) })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  rows={2}
                  placeholder="Explain reason for leave..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingLeave}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingLeave ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
