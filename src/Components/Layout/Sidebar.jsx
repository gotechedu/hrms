import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  LayoutDashboard,
  MessageSquare,
  MessagesSquare,
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
  ChevronDown,
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

import usePermissions from "../../utils/usePermissions";

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { sidebarCollapsed, mobileSidebarOpen } = useSelector(
    (state) => state.ui,
  );
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, isSuperAdmin, role } = usePermissions();

  // Collapsible section state with localStorage persistence
  const [collapsedSections, setCollapsedSections] = useState(() => {
    try {
      const saved = localStorage.getItem("hrms_sidebar_collapsed_sections");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleSection = (groupName) => {
    setCollapsedSections((prev) => {
      const updated = {
        ...prev,
        [groupName]: !prev[groupName],
      };
      try {
        localStorage.setItem(
          "hrms_sidebar_collapsed_sections",
          JSON.stringify(updated)
        );
      } catch {
        // ignore storage errors
      }
      return updated;
    });
  };

  // Live Auto-Refresh: Listen for matrix & role updates
  useEffect(() => {
    const handlePermissionsUpdated = () => {
      dispatch(fetchCurrentUser());
    };

    window.addEventListener(
      "gotech_permissions_updated",
      handlePermissionsUpdated,
    );
    window.addEventListener("focus", handlePermissionsUpdated);

    return () => {
      window.removeEventListener(
        "gotech_permissions_updated",
        handlePermissionsUpdated,
      );
      window.removeEventListener("focus", handlePermissionsUpdated);
    };
  }, [dispatch]);

  const checkItemPermission = (item) => {
    if (isSuperAdmin) return true;
    if (!item.permission) return true;
    const keys = Array.isArray(item.permission) ? item.permission : [item.permission];
    return keys.some((k) => hasPermission(k));
  };

  let rawNavSections = [];

  if (role === 'trainee') {
    rawNavSections = [
      {
        group: 'My Learning Space',
        items: [
          {
            name: 'My Learning Hub',
            path: '/learninghub',
            icon: GraduationCap,
          },
          {
            name: 'Live Lectures',
            path: '/learninghub',
            icon: Clock,
          },
        ],
      },
      {
        group: 'Community & Ethics',
        items: [
          {
            name: 'Peer Discussions',
            path: '/discussions',
            icon: MessagesSquare,
          },
          {
            name: 'Policy & Grievance',
            path: '/accusations',
            icon: ShieldAlert,
          },
          {
            name: 'Student Profile',
            path: '/profile',
            icon: User,
          },
        ],
      },
    ];
  } else if (role === 'trainer') {
    rawNavSections = [
      {
        group: 'Trainer Portal',
        items: [
          {
            name: 'Instructor Hub',
            path: '/learninghub',
            icon: LayoutDashboard,
          },
          {
            name: 'Cohort Batches',
            path: '/learninghub/batches',
            icon: Users,
          },
        ],
      },
      {
        group: 'Operations',
        items: [
          {
            name: 'Attendance & Leaves',
            path: '/attendance',
            icon: Clock,
            permission: ['manage_attandance', 'manage_attendance', 'add_attendance', 'view_attendance'],
          },
          {
            name: 'Task Board',
            path: '/tasks',
            icon: CheckSquare,
            permission: ['manage_task', 'view_task'],
          },
          {
            name: 'Team Discussions',
            path: '/discussions',
            icon: MessagesSquare,
          },
          {
            name: 'Trainer Profile',
            path: '/profile',
            icon: User,
          },
        ],
      },
    ];
  } else {
    rawNavSections = [
      {
        group: 'Main Overview',
        items: [
          {
            name: 'Dashboard',
            path: '/dashboard',
            icon: LayoutDashboard,
            permission: null,
          },
          {
            name: 'Employee Directory',
            path: '/employees',
            icon: Users,
            permission: ['manage_employee', 'view_employee', 'create_employee'],
          },
        ],
      },
      {
        group: 'Operations & Work',
        items: [
          {
            name: 'Attendance & Leaves',
            path: '/attendance',
            icon: Clock,
            permission: ['manage_attandance', 'manage_attendance', 'add_attendance', 'view_attendance'],
          },
          {
            name: 'Timesheets',
            path: '/timesheets',
            icon: FileSpreadsheet,
            permission: ['manage_timesheet', 'view_timesheet', 'add_timesheet'],
          },
          {
            name: 'Projects',
            path: '/projects',
            icon: FolderKanban,
            permission: ['manage_project', 'view_project', 'create_project', 'add_project'],
          },
          {
            name: 'Task Board',
            path: '/tasks',
            icon: CheckSquare,
            permission: ['manage_task', 'view_task', 'add_task'],
          },
          {
            name: 'Holiday Calendar',
            path: '/holidays',
            icon: CalendarDays,
            permission: ['manage_holiday', 'view_holiday'],
          },
          {
            name: 'Team Discussions',
            path: '/discussions',
            icon: MessagesSquare,
            permission: null,
          },
        ],
      },
      {
        group: 'Finance & Payroll',
        items: [
          {
            name: 'Payroll Dashboard',
            path: '/payroll',
            icon: DollarSign,
            permission: ['manage_payroll', 'view_payroll'],
          },
          {
            name: 'Employee Payroll',
            path: '/payroll/org-employees',
            icon: Users,
            permission: ['manage_payroll', 'view_payroll'],
          },
          {
            name: 'Student Stipends',
            path: '/payroll/students',
            icon: GraduationCap,
            permission: ['manage_payroll', 'view_payroll'],
          },
          {
            name: 'IT Solutions Payroll',
            path: '/payroll/it-solutions',
            icon: Building2,
            permission: ['manage_payroll', 'view_payroll'],
          },
        ],
      },
      {
        group: 'Talent & Growth',
        items: [
          {
            name: 'Learning Hub',
            path: '/learninghub',
            icon: GraduationCap,
            permission: ['manage_learninghub', 'view_learninghub'],
          },
          {
            name: 'Cohort Batches',
            path: '/learninghub/batches',
            icon: Users,
            permission: ['manage_learninghub', 'manage_batches'],
          },
          {
            name: 'Career Postings',
            path: '/careerpost',
            icon: Briefcase,
            permission: ['manage_career', 'view_career'],
          },
          {
            name: 'Applications',
            path: '/applications',
            icon: UserCheck,
            permission: ['manage_career', 'manage_applications'],
          },
          {
            name: 'Client Inquiries',
            path: '/contacts',
            icon: MessageSquare,
            permission: ['manage_contacts', 'manage_contact', 'view_contacts'],
          },
          {
            name: 'Grievances & Policy',
            path: '/accusations',
            icon: ShieldAlert,
            permission: null,
          },
          {
            name: 'Company Bulletins',
            path: '/blogs',
            icon: Newspaper,
            permission: ['manage_blogs', 'view_blogs'],
          },
        ],
      },
      {
        group: 'Administration & System',
        items: [
          {
            name: 'System Settings',
            path: '/settings',
            icon: Settings,
            permission: ['manage_settings', 'settings'],
          },
          {
            name: 'Roles & Privileges',
            path: '/settings/roles',
            icon: Shield,
            permission: ['manage_roles', 'roles_permissions'],
          },
          {
            name: 'Permission Matrix',
            path: '/settings/permissions',
            icon: Sliders,
            permission: ['manage_permissions', 'roles_permissions'],
          },
          {
            name: 'Recycle Bin',
            path: '/recycle-bin',
            icon: Trash2,
            permission: ['manage_recycle_bin', 'recycle_bin', 'view_recycle_bin'],
          },
        ],
      },
    ];
  }

  const navSections = rawNavSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => checkItemPermission(item)),
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
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/90 bg-white transition-all duration-300 shadow-xs ${
          sidebarCollapsed ? "w-20" : "w-64 sm:w-72"
        } ${
          mobileSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-5">
          <Link
            to="/dashboard"
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
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {navSections.map((section, idx) => {
            const isCollapsed =
              !sidebarCollapsed && Boolean(collapsedSections[section.group]);
            const isSectionActive = section.items.some((item) =>
              item.path === "/dashboard"
                ? location.pathname === "/dashboard"
                : location.pathname.startsWith(item.path)
            );

            return (
              <div key={section.group || idx} className="space-y-1">
                {!sidebarCollapsed ? (
                  <button
                    type="button"
                    onClick={() => toggleSection(section.group)}
                    aria-expanded={!isCollapsed}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-slate-700 hover:bg-slate-100/70 transition-all cursor-pointer select-none group/sec"
                  >
                    <div className="flex items-center gap-1.5 overflow-hidden">
                      <span className="truncate">{section.group}</span>
                      {isSectionActive && isCollapsed && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600 animate-pulse"
                          title="Active page inside"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-slate-400 group-hover/sec:text-slate-600">
                      {isCollapsed && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          {section.items.length}
                        </span>
                      )}
                      <ChevronDown
                        size={13}
                        className={`transition-transform duration-200 ${
                          isCollapsed
                            ? "-rotate-90 text-slate-400"
                            : "rotate-0 text-slate-400 group-hover/sec:text-slate-600"
                        }`}
                      />
                    </div>
                  </button>
                ) : (
                  <div className="h-px bg-slate-100 my-2" />
                )}

                {/* Section Items */}
                {(!isCollapsed || sidebarCollapsed) && (
                  <div className="space-y-1 transition-all duration-200">
                    {section.items.map((item) => {
                      const Icon = item.icon;
                      const isActive =
                        item.path === "/dashboard"
                          ? location.pathname === "/dashboard"
                          : location.pathname.startsWith(item.path);

                      return (
                        <Link
                          key={item.name}
                          to={item.path}
                          onClick={handleNavClick}
                          title={sidebarCollapsed ? item.name : undefined}
                          className={`group relative flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-150 ${
                            isActive
                              ? "bg-blue-50/90 text-blue-700 font-bold shadow-2xs"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          <div
                            className={`flex h-5 w-5 shrink-0 items-center justify-center transition-transform group-hover:scale-110 ${
                              isActive
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
                                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold ${
                                    isActive
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
                )}
              </div>
            );
          })}
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
