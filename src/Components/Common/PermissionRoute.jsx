import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ShieldAlert, ArrowLeft, LayoutDashboard, Lock } from 'lucide-react';
import usePermissions from '../../utils/usePermissions';

/**
 * Enterprise Production-Grade Route Guard
 * Enforces Role-Based Access Control and Granular Permissions at the route level.
 *
 * Props:
 * - permission: string | string[] - Single or array of permission slugs (e.g. 'manage_payroll', ['view_employee', 'manage_employee'])
 * - anyPermissions: string[] - User must have at least ONE of these
 * - allPermissions: string[] - User must have ALL of these
 * - role: string | string[] - Required user role(s) (e.g. ['superadmin', 'admin'])
 * - action: string - Action name ('view', 'create', 'edit', 'delete')
 * - feature: string - Module name ('project', 'employee', 'payroll')
 * - children: React.ReactNode - Route element to render if authorized
 */
export default function PermissionRoute({
  permission,
  anyPermissions,
  allPermissions,
  role: requiredRole,
  action,
  feature,
  fallbackTo = '/dashboard',
  children,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    user,
    role: userRole,
    isSuperAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    can,
  } = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Superadmin always bypasses all route guards
  if (isSuperAdmin) {
    return children;
  }

  let isAuthorized = true;
  let reason = '';

  // 1. Check required role(s)
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole)
      ? requiredRole.map((r) => String(r).toLowerCase().trim())
      : [String(requiredRole).toLowerCase().trim()];

    if (!allowedRoles.includes(userRole)) {
      isAuthorized = false;
      reason = `Required role: [${allowedRoles.join(', ')}]`;
    }
  }

  // 2. Check action on feature (e.g. action="view", feature="project")
  if (isAuthorized && action && feature) {
    if (!can(action, feature)) {
      isAuthorized = false;
      reason = `Required capability: ${action} on ${feature}`;
    }
  }

  // 3. Check single or array of permission keys
  if (isAuthorized && permission) {
    const perms = Array.isArray(permission) ? permission : [permission];
    const hasAny = perms.some((p) => hasPermission(p));
    if (!hasAny) {
      isAuthorized = false;
      reason = `Required permission: [${perms.join(', ')}]`;
    }
  }

  // 4. Check anyPermissions list
  if (isAuthorized && anyPermissions && anyPermissions.length > 0) {
    if (!hasAnyPermission(anyPermissions)) {
      isAuthorized = false;
      reason = `Requires at least one of: [${anyPermissions.join(', ')}]`;
    }
  }

  // 5. Check allPermissions list
  if (isAuthorized && allPermissions && allPermissions.length > 0) {
    if (!hasAllPermissions(allPermissions)) {
      isAuthorized = false;
      reason = `Requires all of: [${allPermissions.join(', ')}]`;
    }
  }

  // If authorized, grant access
  if (isAuthorized) {
    return children;
  }

  // Access Denied / 403 Production Screen
  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center relative overflow-hidden">
        {/* Subtle decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative">
          {/* Icon Badge */}
          <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200/70 flex items-center justify-center text-rose-600 shadow-sm mb-5">
            <ShieldAlert size={32} />
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 mb-3">
            <Lock size={12} /> 403 • Access Restricted
          </span>

          <h2 className="text-xl sm:text-2xl font-heading font-extrabold text-slate-900 tracking-tight">
            Restricted System Area
          </h2>

          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Your current assigned role (
            <span className="font-semibold text-slate-800 uppercase">
              {userRole || 'employee'}
            </span>
            ) lacks the operational clearance or permissions required to view this module.
          </p>

          {reason && (
            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 text-left truncate">
              <span className="text-slate-400 font-bold block mb-0.5 uppercase tracking-wider">
                Policy Check:
              </span>
              {reason}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition active:scale-95 cursor-pointer shadow-xs"
            >
              <ArrowLeft size={14} />
              <span>Go Back</span>
            </button>

            <button
              type="button"
              onClick={() => navigate(fallbackTo)}
              className="w-full sm:w-1/2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition active:scale-95 cursor-pointer shadow-md shadow-blue-500/20"
            >
              <LayoutDashboard size={14} />
              <span>Dashboard</span>
            </button>
          </div>

          <p className="mt-5 text-[11px] text-slate-400">
            If you need clearance for this area, please contact your System Administrator.
          </p>
        </div>
      </div>
    </div>
  );
}
