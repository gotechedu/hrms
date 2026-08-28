import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
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
  Shield,
  Briefcase,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Layers,
  MessageSquare,
} from 'lucide-react';
import StatCard from '../../Components/Common/StatCard';
import { toggleClockInOut } from '../../redux/slices/attendanceSlice';
import { fetchEmployeeStats, fetchEmployees } from '../../redux/slices/employeeSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees, stats } = useSelector((state) => state.employee);
  const { projects } = useSelector((state) => state.projects || { projects: [] });
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  const { candidates } = useSelector((state) => state.applications || { candidates: [] });
  const { isCheckedIn, lastCheckInTime, leaveBalances } = useSelector((state) => state.attendance);
  const { holidays } = useSelector((state) => state.holidays || { holidays: [] });

  const role = (user?.role || 'employee').toLowerCase();
  const isSuperadmin = role === 'superadmin';
  const permissions = user?.permissions || [];
  const isAdminOrHr = isSuperadmin || ['admin', 'hr'].includes(role);
  const isManagerOrLead = ['manager', 'teamlead'].includes(role);
  const isEmployeeOrIntern = ['employee', 'intern'].includes(role);

  // If user doesn't have manage_dashboard and is not superadmin, route them to their permitted module
  if (!isSuperadmin && !permissions.includes('manage_dashboard')) {
    if (permissions.includes('manage_employee')) {
      return <Navigate to="/employees" replace />;
    }
    if (permissions.includes('manage_attandance') || permissions.includes('manage_attendance')) {
      return <Navigate to="/attendance" replace />;
    }
    if (permissions.includes('manage_timesheet')) {
      return <Navigate to="/timesheets" replace />;
    }
    if (permissions.includes('manage_project')) {
      return <Navigate to="/projects" replace />;
    }
    if (permissions.includes('manage_learninghub')) {
      return <Navigate to="/learninghub" replace />;
    }
    if (permissions.includes('manage_career')) {
      return <Navigate to="/careerpost" replace />;
    }
    if (permissions.includes('manage_blogs')) {
      return <Navigate to="/blogs" replace />;
    }
  }

  useEffect(() => {
    dispatch(fetchEmployeeStats());
    dispatch(fetchEmployees());
  }, [dispatch]);

  const activeEmployeesCount = stats?.active || employees.filter((e) => e.status === 'Active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done').length;
  const nextHoliday = (holidays && holidays[0]) || { name: 'Independence Day', date: '15 Aug 2026' };

  // Role display label
  const roleDisplayNames = {
    superadmin: '🛡️ Super Administrator (Full System Owner)',
    admin: '👑 System Administrator',
    hr: '💼 HR Administrator',
    manager: '📊 Engineering Manager',
    teamlead: '⚡ Technical Team Lead',
    employee: '💻 Full-Stack Specialist',
    intern: '🎓 Graduate AI Intern',
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-10">
      {/* Dynamic Role-Based Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
                <Sparkles size={12} /> {roleDisplayNames[role] || 'Workforce Command Center'}
              </span>
              <span className="rounded-md bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                {role.toUpperCase()} PORTAL
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Associate'} 👋
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              {isAdminOrHr &&
                `Organization overview: ${activeEmployeesCount} active personnel on shift. Full directory management and compliance control active.`}
              {isManagerOrLead &&
                `Sprint leadership console: Direct reporting team active. ${pendingTasks} sprint tasks and deliverables scheduled for this cycle.`}
              {isEmployeeOrIntern &&
                `Personal workspace: Your attendance shift log is active. You have ${pendingTasks} active sprint deliverables due this week.`}
            </p>
          </div>

          {/* Quick Action Widget */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => dispatch(toggleClockInOut())}
              className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition shadow-lg cursor-pointer ${
                isCheckedIn
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                  : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
              }`}
            >
              {isCheckedIn ? <Pause size={16} /> : <Play size={16} />}
              <span>{isCheckedIn ? 'Clock Out Shift' : 'Clock In Shift'}</span>
            </button>

            {isAdminOrHr ? (
              <Link
                to="/employees"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <span>Directory</span>
                <ArrowUpRight size={15} />
              </Link>
            ) : (
              <Link
                to="/attendance"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <span>Apply Leave</span>
                <ArrowUpRight size={15} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          ROLE-BASED METRIC STAT CARDS
         ========================================================================= */}
      {isAdminOrHr && (
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Workforce"
            value={stats?.total || employees.length}
            change="+8.5%"
            isPositive={true}
            period="vs last quarter"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            badgeText="Enterprise Roster"
          />
          <StatCard
            title="Active on Shift"
            value={stats?.active || activeEmployeesCount}
            change="+2.4%"
            isPositive={true}
            period="today"
            icon={Clock}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            badgeText="Real-time"
          />
          <StatCard
            title="Active Projects"
            value={projects.length || 4}
            change="+1 New"
            isPositive={true}
            period="this month"
            icon={FolderKanban}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            badgeText="All Depts"
          />
          <StatCard
            title="Open Applicants"
            value={candidates.length || 6}
            change="3 Screened"
            isPositive={true}
            period="pipeline"
            icon={UserCheck}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            badgeText="Recruitment"
          />
        </div>
      )}

      {isManagerOrLead && (
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Team Members"
            value={employees.filter((e) => e.department === (user?.employeeProfile?.department || 'Engineering')).length || 4}
            change="100% Active"
            isPositive={true}
            period="assigned"
            icon={Users}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            badgeText="Direct Reports"
          />
          <StatCard
            title="Sprint Deliverables"
            value={pendingTasks || 8}
            change="84% Velocity"
            isPositive={true}
            period="sprint 24"
            icon={CheckSquare}
            iconBg="bg-cyan-50"
            iconColor="text-cyan-600"
            badgeText="In Progress"
          />
          <StatCard
            title="Active Projects"
            value={projects.length || 3}
            change="On Track"
            isPositive={true}
            period="milestones"
            icon={FolderKanban}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            badgeText="Managed"
          />
          <StatCard
            title="Pending Sign-Offs"
            value="2"
            change="Timesheets"
            isPositive={false}
            period="awaiting"
            icon={FileSpreadsheet}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            badgeText="Action Req."
          />
        </div>
      )}

      {isEmployeeOrIntern && (
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Shift Status"
            value={isCheckedIn ? 'Checked In' : 'Checked Out'}
            change={isCheckedIn ? `Since ${lastCheckInTime}` : 'Shift Offline'}
            isPositive={isCheckedIn}
            period="today"
            icon={Clock}
            iconBg={isCheckedIn ? 'bg-emerald-50' : 'bg-amber-50'}
            iconColor={isCheckedIn ? 'text-emerald-600' : 'text-amber-600'}
            badgeText="Biometric"
          />
          <StatCard
            title="Assigned Tasks"
            value={pendingTasks || 5}
            change="2 Due Today"
            isPositive={true}
            period="my queue"
            icon={CheckSquare}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            badgeText="Priority"
          />
          <StatCard
            title="Leave Balance"
            value={`${leaveBalances?.casual || 12} Days`}
            change="Paid Leave"
            isPositive={true}
            period="available"
            icon={Calendar}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
            badgeText="Annual Quota"
          />
          <StatCard
            title="Next Holiday"
            value={nextHoliday.name}
            change={nextHoliday.date}
            isPositive={true}
            period="official"
            icon={Award}
            iconBg="bg-rose-50"
            iconColor="text-rose-600"
            badgeText="Upcoming"
          />
        </div>
      )}

      {/* =========================================================================
          ROLE-SPECIFIC MAIN DASHBOARD SECTIONS
         ========================================================================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Activities & Tables */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Recent Personnel / Team Roster */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  {isAdminOrHr ? 'Live Workforce Roster' : isManagerOrLead ? 'My Department Members' : 'Squad Colleagues'}
                </h3>
                <p className="text-xs text-slate-400">Synchronized directly with backend API</p>
              </div>
              <Link
                to="/employees"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View Full Roster <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {employees.slice(0, 5).map((emp) => (
                <div key={emp.employeeId || emp._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        emp.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`
                      }
                      alt={emp.name}
                      className="h-10 w-10 rounded-xl border border-slate-200 object-cover bg-slate-50"
                    />
                    <div>
                      <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900">{emp.name}</h4>
                      <p className="text-[11px] text-slate-400">
                        {emp.designation || emp.role} • <span className="font-mono text-blue-600">{emp.department}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase rounded-md bg-slate-100 px-2 py-0.5 text-slate-600">
                      {emp.role}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Active Projects & Sprint Deliverables */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-base font-bold text-slate-900">Active Sprint Initiatives</h3>
                <p className="text-xs text-slate-400">Current quarter key technical roadmap milestones</p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
              >
                View All <ArrowUpRight size={14} />
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700">
                    Engineering
                  </span>
                  <span className="text-[11px] font-mono text-emerald-600 font-bold">85% Complete</span>
                </div>
                <h4 className="font-heading text-sm font-bold text-slate-900">Core HRMS RBAC Engine</h4>
                <p className="text-xs text-slate-500 mt-1">Multi-tenant role-based authentication and directory API</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-700">
                    AI Research
                  </span>
                  <span className="text-[11px] font-mono text-blue-600 font-bold">60% Complete</span>
                </div>
                <h4 className="font-heading text-sm font-bold text-slate-900">GenAI Talent Matcher</h4>
                <p className="text-xs text-slate-500 mt-1">Resume intelligence & automated candidate scoring LLM</p>
                <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Tools & Role Widget Panel */}
        <div className="space-y-6">
          {/* Active Session Identity Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={
                    user?.employeeProfile?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                  }
                  alt={user?.name}
                  className="h-20 w-20 rounded-3xl border-2 border-blue-600 object-cover p-0.5 mx-auto bg-slate-50 shadow-md"
                />
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs font-mono text-blue-600">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700">
                <Shield size={12} /> {roleDisplayNames[role]}
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Employee ID</span>
                <span className="font-bold text-slate-900 font-mono">
                  {user?.employeeProfile?.employeeId || 'GTE-1001'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Department</span>
                <span className="font-bold text-slate-900">
                  {user?.employeeProfile?.department || 'People Operations'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-mono">Work Station</span>
                <span className="font-bold text-slate-900">
                  {user?.employeeProfile?.location || 'Gurugram, HQ'}
                </span>
              </div>
            </div>

            <Link
              to="/profile"
              className="mt-4 block w-full text-center rounded-xl bg-slate-900 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
            >
              Manage My Profile
            </Link>
          </div>

          {/* Quick Shortcut Launchpad */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Role Workspaces
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <MessageSquare size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Team Chat</span>
              </Link>
              <Link
                to="/tasks"
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-cyan-300 hover:bg-cyan-50/50 transition group"
              >
                <CheckSquare size={16} className="text-cyan-600" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-700">Task Board</span>
              </Link>
              <Link
                to="/timesheets"
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
              >
                <FileSpreadsheet size={16} className="text-indigo-600" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">Timesheets</span>
              </Link>
              <Link
                to="/holidays"
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-rose-300 hover:bg-rose-50/50 transition group"
              >
                <Calendar size={16} className="text-rose-600" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-rose-700">Holidays</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
