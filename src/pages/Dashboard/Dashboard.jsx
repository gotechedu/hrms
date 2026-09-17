import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, Navigate } from 'react-router-dom';
import {
  Users,
  Clock,
  FolderKanban,
  UserCheck,
  Calendar,
  ArrowUpRight,
  Sparkles,
  Play,
  Pause,
  Shield,
  Briefcase,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Layers,
  MessageSquare,
  BookOpen,
  Settings,
  Loader2,
} from 'lucide-react';
import StatCard from '../../Components/Common/StatCard';
import { fetchEmployeeStats, fetchEmployees } from '../../redux/slices/employeeSlice';
import { fetchProjects } from '../../redux/slices/projectSlice';
import { fetchTasks } from '../../redux/slices/taskSlice';
import { fetchHolidays } from '../../redux/slices/holidaySlice';
import { attendanceApi } from '../../Service';
import notify from '../../utils/toast';
import usePermissions from '../../utils/usePermissions';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { employees, stats } = useSelector((state) => state.employee || { employees: [], stats: null });
  const { projects } = useSelector((state) => state.projects || { projects: [] });
  const { tasks } = useSelector((state) => state.tasks || { tasks: [] });
  const { candidates } = useSelector((state) => state.applications || { candidates: [] });
  const { holidays } = useSelector((state) => state.holidays || { holidays: [] });

  const { hasPermission, can, isSuperAdmin, role: currentRole } = usePermissions();
  const role = (currentRole || user?.role || 'employee').toLowerCase();
  const isSuperadmin = isSuperAdmin;

  // Dynamic Capability Flags
  const canViewEmployees = isSuperadmin || hasPermission('view_employee') || hasPermission('manage_employee') || hasPermission('employee');
  const canViewProjects = isSuperadmin || hasPermission('view_projects') || hasPermission('view_project') || hasPermission('projects');
  const canViewTasks = isSuperadmin || hasPermission('view_tasks') || hasPermission('view_task') || hasPermission('tasks');
  const canViewAttendance = isSuperadmin || hasPermission('attendance') || hasPermission('manage_attendance') || hasPermission('add_attendance');
  const canViewCandidates = isSuperadmin || hasPermission('careerpost') || hasPermission('manage_careers');
  const canViewTimesheets = isSuperadmin || hasPermission('timesheet') || hasPermission('manage_timesheet');
  const canViewHolidays = isSuperadmin || hasPermission('holiday') || hasPermission('manage_holiday');
  const canViewLearningHub = isSuperadmin || hasPermission('learninghub') || hasPermission('manage_learning_hub');
  const canViewSettings = isSuperadmin || hasPermission('settings') || hasPermission('manage_settings');

  // Trainee redirect
  if (role === 'trainee') {
    return <Navigate to="/learninghub" replace />;
  }

  const canViewDashboard = isSuperadmin || hasPermission('manage_dashboard') || hasPermission('view_dashboard');

  if (!canViewDashboard) {
    if (canViewEmployees) return <Navigate to="/employees" replace />;
    if (canViewAttendance) return <Navigate to="/attendance" replace />;
    if (canViewTimesheets) return <Navigate to="/timesheets" replace />;
    if (canViewProjects) return <Navigate to="/projects" replace />;
    if (canViewLearningHub) return <Navigate to="/learninghub" replace />;
    if (canViewCandidates) return <Navigate to="/careerpost" replace />;
  }

  // Loading States
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [livePunchStatus, setLivePunchStatus] = useState(null);
  const [punchLoading, setPunchLoading] = useState(false);

  // Live Shift Punch Query
  useEffect(() => {
    if (canViewAttendance) {
      attendanceApi
        .getTodayStatus()
        .then((res) => {
          const data = res.data || res;
          setLivePunchStatus(data);
        })
        .catch(() => {});
    }
  }, [canViewAttendance]);

  // Fetch permitted modules on mount
  useEffect(() => {
    const promises = [];
    if (canViewEmployees) {
      promises.push(dispatch(fetchEmployeeStats()));
      promises.push(dispatch(fetchEmployees()));
    }
    if (canViewProjects) {
      promises.push(dispatch(fetchProjects()));
    }
    if (canViewTasks) {
      promises.push(dispatch(fetchTasks()));
    }
    if (canViewHolidays) {
      promises.push(dispatch(fetchHolidays({ year: new Date().getFullYear().toString() })));
    }

    Promise.allSettled(promises).finally(() => {
      setLoadingDashboard(false);
    });
  }, [dispatch, canViewEmployees, canViewProjects, canViewTasks, canViewHolidays]);

  // Handle Real Clock In / Out
  const handlePunchToggle = async () => {
    try {
      setPunchLoading(true);
      if (livePunchStatus?.isCheckedIn) {
        const res = await attendanceApi.clockOut();
        notify.success(res.data?.message || 'Clocked out of shift successfully!');
        setLivePunchStatus((prev) => ({
          ...prev,
          isCheckedIn: false,
          checkOutTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      } else {
        const res = await attendanceApi.clockIn();
        notify.success(res.data?.message || 'Clocked in to shift successfully!');
        setLivePunchStatus((prev) => ({
          ...prev,
          isCheckedIn: true,
          checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
      }
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Shift punch operation failed');
    } finally {
      setPunchLoading(false);
    }
  };

  const activeEmployeesCount = stats?.active || employees.filter((e) => e.status === 'Active').length;
  const pendingTasks = tasks.filter((t) => t.status !== 'Done').length;
  const nextHoliday = holidays && holidays.length > 0 ? holidays[0] : null;
  const isCheckedIn = Boolean(livePunchStatus?.isCheckedIn);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn pb-10">
      {/* Dynamic Role-Based Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 p-6 sm:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 h-full w-96 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-400/20 via-blue-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-md">
                <Sparkles size={12} /> {user?.name || 'Authorized Member'}
              </span>
              <span className="rounded-md bg-cyan-500/20 border border-cyan-400/30 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 uppercase">
                {role.replace(/_/g, ' ')} PORTAL
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Associate'} 👋
            </h1>

            <p className="mt-1.5 text-xs sm:text-sm text-blue-200 max-w-xl leading-relaxed">
              {canViewEmployees &&
                `Organization overview: ${activeEmployeesCount} active personnel on shift. Directory and role-based privileges active.`}
              {!canViewEmployees && canViewProjects &&
                `Active initiatives workspace: ${projects.length} portfolio deliverables and sprint items assigned.`}
              {!canViewEmployees && !canViewProjects &&
                `Your authorized workspace is ready. Access the verified modules corresponding to your assigned role privileges.`}
            </p>
          </div>

          {/* Quick Action Shift Controls */}
          {canViewAttendance && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={punchLoading}
                onClick={handlePunchToggle}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold uppercase tracking-wider transition shadow-lg cursor-pointer disabled:opacity-50 ${
                  isCheckedIn
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30'
                    : 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                }`}
              >
                {punchLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : isCheckedIn ? (
                  <Pause size={16} />
                ) : (
                  <Play size={16} />
                )}
                <span>{isCheckedIn ? 'Clock Out Shift' : 'Clock In Shift'}</span>
              </button>

              <Link
                to="/attendance"
                className="inline-flex items-center gap-1.5 rounded-2xl bg-white/10 border border-white/20 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md transition hover:bg-white/20"
              >
                <span>Attendance Log</span>
                <ArrowUpRight size={15} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          DYNAMIC PERMISSION-BASED METRIC STAT CARDS
         ========================================================================= */}
      {loadingDashboard ? (
        /* Skeleton Stat Cards */
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs animate-pulse flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-8 w-8 bg-slate-200 rounded-xl" />
              </div>
              <div className="h-7 w-16 bg-slate-300 rounded mt-2" />
              <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {canViewEmployees && (
            <>
              <StatCard
                title="Total Workforce"
                value={stats?.total || employees.length}
                change={employees.length > 0 ? `${employees.length} Personnel` : 'No Personnel'}
                isPositive={true}
                period="registered"
                icon={Users}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
                badgeText="Directory"
              />
              <StatCard
                title="Active on Shift"
                value={activeEmployeesCount}
                change="On Duty"
                isPositive={true}
                period="today"
                icon={Clock}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
                badgeText="Real-time"
              />
            </>
          )}

          {canViewProjects && (
            <StatCard
              title="Active Projects"
              value={projects.length}
              change={projects.length > 0 ? `${projects.length} Total` : 'No Projects'}
              isPositive={true}
              period="portfolio"
              icon={FolderKanban}
              iconBg="bg-indigo-50"
              iconColor="text-indigo-600"
              badgeText="Deliverables"
            />
          )}

          {canViewTasks && (
            <StatCard
              title="Sprint Tasks"
              value={pendingTasks}
              change={pendingTasks > 0 ? `${pendingTasks} In Progress` : 'All Done'}
              isPositive={true}
              period="active sprint"
              icon={CheckSquare}
              iconBg="bg-cyan-50"
              iconColor="text-cyan-600"
              badgeText="Queue"
            />
          )}

          {canViewAttendance && (
            <StatCard
              title="Shift Status"
              value={isCheckedIn ? 'Checked In' : 'Checked Out'}
              change={
                isCheckedIn
                  ? `Since ${livePunchStatus?.checkInTime || 'Current Shift'}`
                  : 'Ready to Punch'
              }
              isPositive={isCheckedIn}
              period="today"
              icon={Clock}
              iconBg={isCheckedIn ? 'bg-emerald-50' : 'bg-amber-50'}
              iconColor={isCheckedIn ? 'text-emerald-600' : 'text-amber-600'}
              badgeText="Biometric"
            />
          )}

          {canViewCandidates && (
            <StatCard
              title="Open Applicants"
              value={candidates.length}
              change={candidates.length > 0 ? `${candidates.length} Total` : 'Pipeline Clear'}
              isPositive={true}
              period="recruitment"
              icon={UserCheck}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
              badgeText="Careers"
            />
          )}

          {canViewHolidays && (
            <StatCard
              title="Next Holiday"
              value={nextHoliday ? nextHoliday.name : 'No Upcoming Holiday'}
              change={nextHoliday ? nextHoliday.date : 'Official Calendar'}
              isPositive={true}
              period="scheduled"
              icon={Award}
              iconBg="bg-rose-50"
              iconColor="text-rose-600"
              badgeText="Upcoming"
            />
          )}
        </div>
      )}

      {/* =========================================================================
          DYNAMIC MAIN DASHBOARD SECTIONS
         ========================================================================= */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Main Activities & Tables */}
        <div className="space-y-6 lg:col-span-2">
          {/* Section 1: Live Personnel Roster (Guarded by Employee Permission) */}
          {canViewEmployees && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Workforce Personnel
                  </h3>
                  <p className="text-xs text-slate-400">Live directory verified with backend API</p>
                </div>
                <Link
                  to="/employees"
                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                >
                  View Full Roster <ArrowUpRight size={14} />
                </Link>
              </div>

              {loadingDashboard ? (
                <div className="space-y-3 mt-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 animate-pulse">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-200" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-28 bg-slate-200 rounded" />
                          <div className="h-2.5 w-20 bg-slate-100 rounded" />
                        </div>
                      </div>
                      <div className="h-5 w-14 bg-slate-100 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : employees.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No employee records found in database.
                </div>
              ) : (
                <div className="mt-4 divide-y divide-slate-100">
                  {employees.slice(0, 5).map((emp) => (
                    <div
                      key={emp.employeeId || emp._id}
                      className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            emp.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name || 'User')}`
                          }
                          alt={emp.name}
                          className="h-10 w-10 rounded-xl border border-slate-200 object-cover bg-slate-50"
                        />
                        <div>
                          <h4 className="font-heading text-xs sm:text-sm font-bold text-slate-900">{emp.name}</h4>
                          <p className="text-[11px] text-slate-400">
                            {emp.designation || emp.role} •{' '}
                            <span className="font-mono text-blue-600">{emp.department || 'General'}</span>
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
              )}
            </div>
          )}

          {/* Section 2: Active Projects & Sprint Deliverables (Guarded by Project/Task Permission) */}
          {(canViewProjects || canViewTasks) && (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Active Projects & Sprint Portfolio
                  </h3>
                  <p className="text-xs text-slate-400">Synchronized deliverables from backend API</p>
                </div>
                {canViewProjects && (
                  <Link
                    to="/projects"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                  >
                    View All <ArrowUpRight size={14} />
                  </Link>
                )}
              </div>

              {loadingDashboard ? (
                <div className="grid gap-3 sm:grid-cols-2 mt-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-50 p-4 animate-pulse border border-slate-100">
                      <div className="h-3 w-20 bg-slate-200 rounded mb-3" />
                      <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
                      <div className="h-2.5 w-full bg-slate-200 rounded mt-4" />
                    </div>
                  ))}
                </div>
              ) : projects.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No active project initiatives found.
                </div>
              ) : (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {projects.slice(0, 4).map((proj) => (
                    <div
                      key={proj._id || proj.id || proj.projectId}
                      className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-mono font-bold text-blue-700">
                            {proj.category || 'Initiative'}
                          </span>
                          <span className="text-[11px] font-mono text-emerald-600 font-bold">
                            {proj.progress || 0}% Complete
                          </span>
                        </div>
                        <h4 className="font-heading text-sm font-bold text-slate-900 line-clamp-1">{proj.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          Client: {proj.client || 'Internal Initiative'}
                        </p>
                      </div>

                      <div className="mt-3 h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, proj.progress || 0)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right 1 Col: Session Identity & Permitted Workspaces */}
        <div className="space-y-6">
          {/* Active Session Identity Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="text-center">
              <div className="relative inline-block">
                <img
                  src={
                    user?.employeeProfile?.avatar ||
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'User')}`
                  }
                  alt={user?.name}
                  className="h-20 w-20 rounded-3xl border-2 border-blue-600 object-cover p-0.5 mx-auto bg-slate-50 shadow-md"
                />
                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
              </div>
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">{user?.name}</h3>
              <p className="text-xs font-mono text-blue-600">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-[11px] font-bold text-blue-700 capitalize">
                <Shield size={12} /> {role.replace(/_/g, ' ')}
              </div>
            </div>

            <div className="mt-5 space-y-2 rounded-2xl bg-slate-50 p-3.5 text-xs border border-slate-100">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">User ID</span>
                <span className="font-bold text-slate-900 font-mono">
                  {user?.employeeProfile?.employeeId || user?._id?.slice(-6) || 'AUTH'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Department</span>
                <span className="font-bold text-slate-900">
                  {user?.employeeProfile?.department || user?.department || 'General'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-mono">Access Level</span>
                <span className="font-bold text-slate-900 font-mono uppercase">
                  {isSuperadmin ? 'Universal Root' : 'Role-Governed'}
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

          {/* Dynamic Shortcut Launchpad (Only links the user has permission to view) */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">
              Permitted Workspaces
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {canViewTasks && (
                <Link
                  to="/tasks"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-cyan-300 hover:bg-cyan-50/50 transition group"
                >
                  <CheckSquare size={16} className="text-cyan-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-cyan-700">Task Board</span>
                </Link>
              )}

              {canViewTimesheets && (
                <Link
                  to="/timesheets"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-indigo-300 hover:bg-indigo-50/50 transition group"
                >
                  <FileSpreadsheet size={16} className="text-indigo-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-700">Timesheets</span>
                </Link>
              )}

              {canViewAttendance && (
                <Link
                  to="/attendance"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-emerald-300 hover:bg-emerald-50/50 transition group"
                >
                  <Clock size={16} className="text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">Attendance</span>
                </Link>
              )}

              {canViewProjects && (
                <Link
                  to="/projects"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition group"
                >
                  <FolderKanban size={16} className="text-blue-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Projects</span>
                </Link>
              )}

              {canViewHolidays && (
                <Link
                  to="/holidays"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-rose-300 hover:bg-rose-50/50 transition group"
                >
                  <Calendar size={16} className="text-rose-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-rose-700">Holidays</span>
                </Link>
              )}

              {canViewLearningHub && (
                <Link
                  to="/learninghub"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-purple-300 hover:bg-purple-50/50 transition group"
                >
                  <BookOpen size={16} className="text-purple-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-purple-700">Learning Hub</span>
                </Link>
              )}

              {canViewSettings && (
                <Link
                  to="/settings"
                  className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-slate-300 hover:bg-slate-100/50 transition group"
                >
                  <Settings size={16} className="text-slate-600" />
                  <span className="text-xs font-bold text-slate-700 group-hover:text-slate-900">Settings</span>
                </Link>
              )}

              <Link
                to="/chat"
                className="flex items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-3 hover:border-blue-300 hover:bg-blue-50/50 transition group"
              >
                <MessageSquare size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-700 group-hover:text-blue-700">Team Chat</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
