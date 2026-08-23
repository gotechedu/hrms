import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  Search,
  Bell,
  MessageSquare,
  CheckCircle2,
  Clock,
  LogOut,
  User,
  Shield,
  Briefcase,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { toggleMobileSidebar, toggleNotifications, markAllNotificationsRead } from '../../redux/slices/uiSlice';
import { toggleClockInOut } from '../../redux/slices/attendanceSlice';
import { switchRole, logout } from '../../redux/slices/authSlice';
import { Link } from 'react-router-dom';

export default function Header() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { isCheckedIn, lastCheckInTime } = useSelector((state) => state.attendance);
  const { notifications, showNotificationsDropdown } = useSelector((state) => state.ui);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/90 bg-white/95 px-4 sm:px-6 lg:px-8 backdrop-blur-md shadow-2xs">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        {/* Mobile Hamburger */}
        <button
          type="button"
          onClick={() => dispatch(toggleMobileSidebar())}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="relative max-w-xs sm:max-w-sm md:max-w-md w-full hidden sm:block">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="Search employees, projects, tickets... (Ctrl + K)"
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition"
          />
        </div>
      </div>

      {/* Right: Actions & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Quick Punch Attendance Widget */}
        <button
          type="button"
          onClick={() => dispatch(toggleClockInOut())}
          className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold uppercase tracking-wider transition shadow-2xs ${
            isCheckedIn
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              : 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
          }`}
          title={isCheckedIn ? `Checked In since ${lastCheckInTime}` : 'Click to Clock In'}
        >
          <span className={`h-2 w-2 rounded-full ${isCheckedIn ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className="hidden md:inline">{isCheckedIn ? 'Clocked In' : 'Clocked Out'}</span>
          <span className="font-mono text-[11px] font-normal text-slate-500 hidden sm:inline">
            {isCheckedIn ? `(${lastCheckInTime})` : ''}
          </span>
        </button>

        {/* Role Switcher Demo Pill */}
        <div className="hidden lg:flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs">
          <button
            type="button"
            onClick={() => dispatch(switchRole('HR Administrator'))}
            className={`rounded-lg px-2.5 py-1 font-bold text-[11px] transition ${
              user?.role === 'HR Administrator'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            HR Admin
          </button>
          <button
            type="button"
            onClick={() => dispatch(switchRole('Employee'))}
            className={`rounded-lg px-2.5 py-1 font-bold text-[11px] transition ${
              user?.role === 'Employee'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Employee
          </button>
        </div>

        {/* Chat / Messaging Workspace Notification Button */}
        <Link
          to="/chat"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition"
          title="Open Squad Chat & Messaging Workspace"
        >
          <MessageSquare size={18} />
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-xs">
            3
          </span>
        </Link>

        {/* Notifications Button & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => dispatch(toggleNotifications())}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotificationsDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl z-50 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="font-heading text-sm font-bold text-slate-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(markAllNotificationsRead())}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2.5 max-h-80 overflow-y-auto">
                {/* Direct Chat Notification Card */}
                <Link
                  to="/chat"
                  onClick={() => dispatch(toggleNotifications())}
                  className="block rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs transition hover:bg-blue-100/70"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-blue-900 flex items-center gap-1.5">
                      <MessageSquare size={13} className="text-blue-600" /> Priya Sundaram & #engineering
                    </span>
                    <span className="text-[10px] font-mono text-blue-600 font-bold shrink-0">3 Unread</span>
                  </div>
                  <p className="mt-1 text-blue-700 leading-relaxed text-[11px]">
                    "Hi Vikram, could you check my submitted leave application for next Monday?"
                  </p>
                  <span className="mt-2 inline-block font-bold text-[10px] text-blue-700 underline">
                    Open Chat Application →
                  </span>
                </Link>

                {notifications.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl p-3 text-xs transition border ${
                      item.unread
                        ? 'border-blue-100 bg-blue-50/50'
                        : 'border-slate-100 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">{item.time}</span>
                    </div>
                    <p className="mt-1 text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-xl border border-slate-200 p-1.5 hover:bg-slate-50 transition"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="h-7 w-7 rounded-lg object-cover"
            />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">{user?.name}</span>
              <span className="text-[9px] font-semibold text-blue-600 uppercase tracking-wider">{user?.role}</span>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-fadeIn"
              onClick={() => setProfileDropdownOpen(false)}
            >
              <div className="border-b border-slate-100 p-3">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">
                  {user?.role}
                </span>
              </div>

              <div className="p-1 space-y-0.5">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <User size={15} className="text-slate-400" />
                  <span>My Profile & Settings</span>
                </Link>
                <Link
                  to="/attendance"
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  <Clock size={15} className="text-slate-400" />
                  <span>Leave & Attendance</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 p-1 pt-1.5">
                <button
                  type="button"
                  onClick={() => dispatch(logout())}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
