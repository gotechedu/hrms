import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Users,
  Clock,
  FolderKanban,
  UserCheck,
  Calendar,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Plus,
  Play,
  Pause,
} from 'lucide-react';
import StatCard from '../../Components/Common/StatCard';
import { toggleClockInOut } from '../../redux/slices/attendanceSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees } = useSelector((state) => state.employee);
  const { projects } = useSelector((state) => state.projects);
  const { tasks } = useSelector((state) => state.tasks);
  const { candidates } = useSelector((state) => state.applications);
  const { isCheckedIn, lastCheckInTime, leaveBalances } = useSelector((state) => state.attendance);
  const { holidays } = useSelector((state) => state.holidays);

  const activeEmployeesCount = employees.filter((e) => e.status === 'Active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done').length;
  const nextHoliday = holidays[0] || { name: 'Independence Day', date: '15 Aug 2025' };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
              <Sparkles size={12} /> Enterprise Workforce Command Center
            </span>
            <h1 className="mt-2 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Good day, {user?.name.split(' ')[0]} 👋
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl leading-relaxed">
              {user?.role === 'HR Administrator'
                ? `You have ${activeEmployeesCount} active personnel on shift today. 3 leave applications require managerial sign-off.`
                : `Your daily working log is live. You have ${pendingTasks} active sprint deliverables due this week.`}
            </p>
          </div>

          {/* Quick Action Widget */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleClockInOut())}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition shadow-lg ${
                isCheckedIn
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              }`}
            >
              {isCheckedIn ? <Pause size={16} /> : <Play size={16} />}
              <span>{isCheckedIn ? 'Clock Out Shift' : 'Clock In Shift'}</span>
            </button>

            <Link
              to="/attendance"
              className="inline-flex items-center gap-1.5 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
            >
              <span>Apply Leave</span>
              <ArrowUpRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Stat Cards Grid */}
      <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workforce"
          value={employees.length}
          change="+12.5%"
          isPositive={true}
          period="vs last quarter"
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          badgeText="Active Org"
        />
        <StatCard
          title="Today's Attendance"
          value="96.4%"
          change="+2.1%"
          isPositive={true}
          period="5 on approved leave"
          icon={Clock}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          badgeText="Live Biometric"
        />
        <StatCard
          title="Active Projects"
          value={projects.length}
          change="+1 New"
          isPositive={true}
          period="On track for Q2"
          icon={FolderKanban}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          badgeText="100% SLA"
        />
        <StatCard
          title="Talent Pipeline"
          value={candidates.length}
          change="2 Offers Sent"
          isPositive={true}
          period="Active applicants"
          icon={UserCheck}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          badgeText="Hiring"
        />
      </div>

      {/* Main Grid: Projects & Leave / Shift Summary */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left 8 Cols: Project Progress & Recent Activity */}
        <div className="lg:col-span-8 space-y-6">
          {/* Active Enterprise Projects */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Active Client Deliverables
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Milestone pacing across software, AI & cloud infrastructure
                </p>
              </div>
              <Link
                to="/projects"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                View All Projects →
              </Link>
            </div>

            <div className="mt-5 space-y-4">
              {projects.slice(0, 3).map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50 hover:border-slate-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600">
                        {proj.category}
                      </span>
                      <h3 className="font-heading text-sm font-bold text-slate-900 mt-0.5">
                        {proj.name}
                      </h3>
                      <p className="text-xs text-slate-500">Client: {proj.client}</p>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="font-mono text-xs font-bold text-slate-900">
                        {proj.progress}% Completed
                      </span>
                      <p className="text-[11px] text-slate-400">Due {proj.deadline}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                      style={{ width: `${proj.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Sprint Tasks */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="font-heading text-lg font-bold text-slate-900">
                  Priority Sprint Tasks
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assigned engineering & operational action items
                </p>
              </div>
              <Link
                to="/tasks"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
              >
                Open Kanban Board →
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {tasks.slice(0, 4).map((task) => (
                <div key={task.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span
                      className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        task.priority === 'Urgent'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : task.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {task.priority}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">{task.title}</p>
                      <p className="text-[11px] text-slate-500">{task.project}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    {task.deadline}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Leave Balances, Shift Live Box & Calendar */}
        <div className="lg:col-span-4 space-y-6">
          {/* Shift Punch Live Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">
                Shift Telemetry
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
              </span>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
              <span className="text-[11px] text-slate-500 uppercase font-semibold">Today's First Punch</span>
              <p className="font-heading text-2xl font-black text-slate-900 mt-1">
                {isCheckedIn ? lastCheckInTime : '09:00 AM'}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">General Day Shift (09:00 AM – 06:00 PM)</p>
            </div>

            {/* Leave Balance Counter */}
            <div className="mt-5">
              <span className="text-xs font-bold text-slate-900 block mb-2.5">
                Annual Leave Balances
              </span>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-blue-50/70 p-2.5 border border-blue-100">
                  <span className="block font-heading text-base font-extrabold text-blue-700">
                    {leaveBalances.casual.available}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Casual</span>
                </div>
                <div className="rounded-xl bg-emerald-50/70 p-2.5 border border-emerald-100">
                  <span className="block font-heading text-base font-extrabold text-emerald-700">
                    {leaveBalances.medical.available}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Medical</span>
                </div>
                <div className="rounded-xl bg-purple-50/70 p-2.5 border border-purple-100">
                  <span className="block font-heading text-base font-extrabold text-purple-700">
                    {leaveBalances.privilege.available}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Privilege</span>
                </div>
              </div>
            </div>
          </div>

          {/* Next Public Holiday Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="font-heading text-sm font-bold text-slate-900">Upcoming Holiday</h3>
            </div>

            <div className="mt-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 p-4 border border-blue-100">
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[9px] font-bold uppercase text-white">
                {nextHoliday.type || 'Public Holiday'}
              </span>
              <h4 className="mt-2 font-heading text-base font-bold text-slate-900">
                {nextHoliday.name}
              </h4>
              <p className="text-xs font-semibold text-blue-700 mt-0.5">
                📅 {nextHoliday.date} ({nextHoliday.day || 'Scheduled'})
              </p>
            </div>

            <Link
              to="/holidays"
              className="mt-4 block text-center text-xs font-bold text-slate-600 hover:text-blue-600"
            >
              View Full 2025 Calendar →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
