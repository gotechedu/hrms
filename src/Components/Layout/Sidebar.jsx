import React, { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Clock,
  CalendarDays,
  FolderKanban,
  CheckSquare,
  FileSpreadsheet,
  UserCheck,
  ShieldAlert,
  Newspaper,
  User,
  GraduationCap,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LogOut,
  Building2,
  Shield,
  Settings,
  DollarSign,
  Trash2,
  Sliders,
} from "lucide-react";
import {
  toggleSidebar,
  setMobileSidebarOpen,
} from "../../redux/slices/uiSlice";
import { logoutUser, fetchCurrentUser } from "../../redux/slices/authSlice";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector(
    (state) => state.ui,
  );
  const { user } = useSelector((state) => state.auth);

  // Live Auto-Refresh: Listen for matrix & role updates
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      dispatch(fetchCurrentUser());
    };

    window.addEventListener("gotech_permissions_updated", handlePermissionsUpdated);
    window.addEventListener("focus", handlePermissionsUpdated);

    return () => {
      window.removeEventListener("gotech_permissions_updated", handlePermissionsUpdated);
      window.removeEventListener("focus", handlePermissionsUpdated);
    };
  }, [dispatch]);

  const role = (user?.role || "employee").toLowerCase();
  const isSuperadmin = role === "superadmin";
  const permissions = user?.permissions || [];

  const hasPermission = (permissionKeys) => {
    if (isSuperadmin) return true;
    if (!permissionKeys) return true;
    const keys = Array.isArray(permissionKeys) ? permissionKeys : [permissionKeys];
    return keys.some((k) => permissions.includes(k));
  };

  const navSections = [
    {
      group: "Main Overview",
      items: [
        {
          name: "Dashboard",
          path: "/",
          icon: LayoutDashboard,
          permission: ["manage_dashboard"],
        },
        {
          name: "Employee Directory",
          path: "/employees",
          icon: Users,
          permission: ["manage_employee"],
        },
      ],
    },
    {
      group: "Operations & Work",
      items: [
        {
          name: "Attendance & Leaves",
          path: "/attendance",
          icon: Clock,
          permission: ["manage_attandance", "manage_attendance"],
        },
        {
          name: "Timesheets",
          path: "/timesheets",
          icon: FileSpreadsheet,
          permission: ["manage_timesheet"],
        },
        {
          name: "Projects",
          path: "/projects",
          icon: FolderKanban,
          badge: "4",
          permission: ["manage_project"],
        },
        {
          name: "Task Board",
          path: "/tasks",
          icon: CheckSquare,
          badge: "5",
          permission: ["manage_task"],
        },
        {
          name: "Holiday Calendar",
          path: "/holidays",
          icon: CalendarDays,
          permission: ["manage_holiday"],
        },
      ],
    },
    // {
    //   group: "Finance & Payroll",
    //   items: [
    //     {
    //       name: "Payroll Central",
    //       path: "/payroll",
    //       icon: DollarSign,
    //       permission: ["manage_payroll", "payroll"],
    //     },
    //     {
    //       name: "Org Employees",
    //       path: "/payroll/org-employees",
    //       icon: Building2,
    //       permission: ["manage_payroll", "payroll"],
    //     },
    //     {
    //       name: "Students / Interns",
    //       path: "/payroll/students",
    //       icon: GraduationCap,
    //       permission: ["manage_payroll", "payroll"],
    //     },
    //     {
    //       name: "IT Solutions",
    //       path: "/payroll/it-solutions",
    //       icon: Briefcase,
    //       permission: ["manage_payroll", "payroll"],
    //     },
    //   ],
    // },
    {
      group: "Talent & Growth",
      items: [
        {
          name: "Learning Hub",
          path: "/learninghub",
          icon: GraduationCap,
          permission: ["manage_learninghub"],
        },
        {
          name: "Career Postings",
          path: "/careerpost",
          icon: Briefcase,
          permission: ["manage_career"],
        },
        {
          name: "Applications",
          path: "/applications",
          icon: UserCheck,
          permission: ["manage_career"],
        },
        {
          name: "Grievances & Policy",
          path: "/accusations",
          icon: ShieldAlert,
          permission: ["manage_career"],
        },
        {
          name: "Company Bulletins",
          path: "/blogs",
          icon: Newspaper,
          permission: ["manage_blogs"],
        },
      ],
    },
    {
      group: "Administration & System",
      items: [
        {
          name: "System Settings",
          path: "/settings",
          icon: Settings,
          permission: ["manage_settings", "settings", "roles_permissions"],
        },
        {
          name: "Recycle Bin",
          path: "/recycle-bin",
          icon: Trash2,
          permission: ["manage_recycle_bin", "recycle_bin"],
        },
      ],
    },
  ]
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => hasPermission(item.permission)),
    }))
    .filter((section) => section.items.length > 0);

  const handleNavClick = () => {
    if (mobileSidebarOpen) {
      dispatch(setMobileSidebarOpen(false));
    }
  };

  const userAvatar =
    user?.employeeProfile?.avatar ||
    user?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || "User")}`;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={() => dispatch(setMobileSidebarOpen(false))}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 shadow-xs ${sidebarCollapsed ? "w-20" : "w-64 sm:w-72"
          } ${mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/"
            onClick={handleNavClick}
            className="flex items-center gap-3 overflow-hidden transition-transform active:scale-95"
          >
            <img
              src="/icons.png"
              alt="GoTechEdu"
              className="h-10 w-10 shrink-0 object-contain rounded-xl shadow-xs"
            />
            {!sidebarCollapsed && (
              <div className="flex flex-col">
                <span className="font-heading text-base font-extrabold tracking-tight text-slate-900">
                  GoTech<span className="text-blue-600">Edu</span>
                </span>
                <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                  Enterprise HRMS
                </span>
              </div>
            )}
          </Link>

          {/* Desktop Toggle Button */}
          <button
            type="button"
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar collapse"
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
          >
            {sidebarCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>

        {/* Navigation List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx}>
              {!sidebarCollapsed && (
                <p className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {section.group}
                </p>
              )}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.path === "/"
                      ? location.pathname === "/"
                      : location.pathname.startsWith(item.path);

                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      onClick={handleNavClick}
                      title={sidebarCollapsed ? item.name : undefined}
                      className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${isActive
                        ? "bg-blue-50/90 text-blue-700 font-bold shadow-2xs"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                    >
                      <div
                        className={`flex h-5 w-5 shrink-0 items-center justify-center transition-transform group-hover:scale-110 ${isActive
                          ? "text-blue-600"
                          : "text-slate-400 group-hover:text-slate-600"
                          }`}
                      >
                        <Icon size={18} />
                      </div>

                      {!sidebarCollapsed && (
                        <div className="flex flex-1 items-center justify-between overflow-hidden">
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${isActive
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-600 group-hover:bg-slate-200"
                                }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Active Indicator Strip */}
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-blue-600" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Footer Card */}
        {user && (
          <Link to="/profile" onClick={handleNavClick} className="block">
            <div className="border-t border-slate-100 p-3 bg-slate-50/70">
              <div className="flex items-center gap-3">
                <img
                  src={userAvatar}
                  alt={user?.name || "User"}
                  className="h-9 w-9 shrink-0 rounded-xl border border-slate-200 object-cover bg-white"
                />
                {!sidebarCollapsed && (
                  <div className="flex flex-1 flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {user?.name}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-blue-600 uppercase truncate">
                      {user?.role}
                    </span>
                  </div>
                )}
                {!sidebarCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      dispatch(logoutUser());
                    }}
                    title="Logout"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-200/80 hover:text-rose-600 transition cursor-pointer"
                  >
                    <LogOut size={16} />
                  </button>
                )}
              </div>
            </div>
          </Link>
        )}
      </aside>
    </>
  );
}
