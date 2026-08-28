import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  Shield,
  Save,
  CheckCircle2,
  ChevronLeft,
  RefreshCw,
  Lock,
  Sliders,
  Check,
  X,
  Plus,
  Search,
  AlertCircle,
  HelpCircle,
  FolderLock,
  Layers,
} from 'lucide-react';
import { rolePermissionApi } from '../../Service';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import notify from '../../utils/toast';

export default function ManagePermission() {
  const dispatch = useDispatch();
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [matrix, setMatrix] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModuleFilter, setSelectedModuleFilter] = useState('ALL');

  // Add Custom Permission Modal
  const [isAddPermModalOpen, setIsAddPermModalOpen] = useState(false);
  const [submittingPerm, setSubmittingPerm] = useState(false);
  const [newPermData, setNewPermData] = useState({
    name: '',
    slug: '',
    module: 'Operations',
    description: '',
  });

  const fetchMatrixData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await rolePermissionApi.getPermissionMatrix();
      const data = res.data || res;
      setRoles(data.roles || []);
      setPermissions(data.permissions || []);
      setMatrix(data.matrix || {});
    } catch (err) {
      console.error('Failed to load permission matrix:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to fetch permission matrix';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatrixData();
  }, []);

  // Toggle single permission for a role
  const togglePermission = (roleSlug, permSlug) => {
    if (roleSlug === 'superadmin') {
      notify.warning('Super Admin has universal unrestricted access.');
      return;
    }

    setMatrix((prev) => {
      const currentRoleMatrix = prev[roleSlug] || {};
      return {
        ...prev,
        [roleSlug]: {
          ...currentRoleMatrix,
          [permSlug]: !currentRoleMatrix[permSlug],
        },
      };
    });
  };

  // Toggle all permissions for a role
  const toggleAllForRole = (roleSlug, stateToSet) => {
    if (roleSlug === 'superadmin') {
      notify.warning('Super Admin cannot be modified.');
      return;
    }

    setMatrix((prev) => {
      const updatedRole = {};
      permissions.forEach((p) => {
        updatedRole[p.slug] = stateToSet;
      });
      return {
        ...prev,
        [roleSlug]: updatedRole,
      };
    });
    notify.info(`${stateToSet ? 'Granted' : 'Revoked'} all modules for role '${roleSlug}'.`);
  };

  // Save complete matrix
  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await rolePermissionApi.updatePermissionMatrix(matrix);
      notify.success(res.data?.message || 'Permission matrix saved and enforced across all roles!');
      // Immediately refresh logged-in user session in Redux
      dispatch(fetchCurrentUser());
      window.dispatchEvent(new Event('gotech_permissions_updated'));
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to save permissions');
    } finally {
      setSaving(false);
    }
  };

  // Create custom permission handler
  const handleCreatePermission = async (e) => {
    e.preventDefault();
    if (!newPermData.name.trim()) {
      notify.warning('Capability name cannot be empty.');
      return;
    }

    try {
      setSubmittingPerm(true);
      const res = await rolePermissionApi.createPermission(newPermData);
      notify.success(res.data?.message || `Permission '${newPermData.name}' registered successfully!`);
      setIsAddPermModalOpen(false);
      setNewPermData({ name: '', slug: '', module: 'Operations', description: '' });
      fetchMatrixData();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to create permission');
    } finally {
      setSubmittingPerm(false);
    }
  };

  // Unique Modules for filtering
  const uniqueModules = ['ALL', ...Array.from(new Set(permissions.map((p) => p.module || 'General')))];

  // Filtered Permissions
  const filteredPermissions = permissions.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.module?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModuleFilter === 'ALL' || p.module === selectedModuleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/settings"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600 mb-1 transition"
          >
            <ChevronLeft size={14} /> Back to Settings
          </Link>
          <h1 className="font-heading text-2xl font-black tracking-tight text-slate-900 flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Shield size={18} />
            </div>
            Granular Permission Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Toggle feature access and management authority across role levels in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchMatrixData}
            title="Refresh Matrix"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/settings/roles"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            <Sliders size={15} /> Manage Roles
          </Link>
          <button
            onClick={() => setIsAddPermModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
          >
            <Plus size={15} className="text-blue-600" /> Add Capability
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
          >
            <Save size={15} />
            {saving ? 'Updating...' : 'Save Matrix'}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            {error}
          </div>
          <button
            onClick={fetchMatrixData}
            className="underline text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Filter capabilities or modules..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Module Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {uniqueModules.map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModuleFilter(mod)}
              className={`rounded-lg px-3 py-1.5 text-[11px] font-bold whitespace-nowrap transition cursor-pointer ${
                selectedModuleFilter === mod
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mod}
            </button>
          ))}
        </div>
      </div>

      {/* Permission Table */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-12 text-center">
          <RefreshCw size={28} className="mx-auto text-blue-600 animate-spin mb-3" />
          <p className="text-xs font-bold text-slate-600">Loading Permission Matrix & Access Levels...</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-white font-mono uppercase tracking-wider font-bold">
                <tr>
                  <th className="px-6 py-4 min-w-[280px]">
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-blue-400" />
                      <span>Module / Capability</span>
                    </div>
                  </th>
                  {roles.map((r) => (
                    <th key={r.slug || r.id} className="px-4 py-4 text-center min-w-[120px]">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-[11px] font-bold">{r.name}</span>
                        {r.slug !== 'superadmin' && (
                          <div className="flex items-center gap-1 text-[9px] font-normal normal-case opacity-70 hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => toggleAllForRole(r.slug, true)}
                              className="text-emerald-400 hover:underline cursor-pointer"
                            >
                              All
                            </button>
                            <span>/</span>
                            <button
                              type="button"
                              onClick={() => toggleAllForRole(r.slug, false)}
                              className="text-rose-400 hover:underline cursor-pointer"
                            >
                              None
                            </button>
                          </div>
                        )}
                        {r.slug === 'superadmin' && (
                          <span className="text-[9px] text-amber-400 font-mono flex items-center gap-0.5">
                            <Lock size={9} /> Full Root
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPermissions.map((mod) => (
                  <tr key={mod.slug || mod.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{mod.name}</span>
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500">
                            {mod.module}
                          </span>
                        </div>
                        {mod.description && (
                          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{mod.description}</p>
                        )}
                      </div>
                    </td>
                    {roles.map((r) => {
                      const roleSlug = r.slug || r.id;
                      const hasAccess = roleSlug === 'superadmin' || Boolean(matrix[roleSlug]?.[mod.slug]);
                      const isLocked = roleSlug === 'superadmin';

                      return (
                        <td key={roleSlug} className="px-4 py-4 text-center">
                          <button
                            type="button"
                            disabled={isLocked}
                            onClick={() => togglePermission(roleSlug, mod.slug)}
                            title={
                              isLocked
                                ? 'Superadmin always has unrestricted access'
                                : `${hasAccess ? 'Revoke' : 'Grant'} access for ${r.name}`
                            }
                            className={`inline-flex h-7 w-7 items-center justify-center rounded-lg transition ${
                              hasAccess
                                ? 'bg-emerald-500 text-white shadow-xs shadow-emerald-500/30 hover:bg-emerald-600'
                                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                            } ${isLocked ? 'opacity-80 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {hasAccess ? <Check size={14} /> : <X size={14} />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {filteredPermissions.length === 0 && (
                  <tr>
                    <td colSpan={roles.length + 1} className="py-12 text-center text-slate-400 font-medium">
                      No capability or module matched your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Matrix Footer Action Info */}
          <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-md bg-emerald-500 text-white text-[10px]">
                  <Check size={10} />
                </span>
                <span>Permission Granted</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-flex h-4 w-4 items-center justify-center rounded-md bg-slate-200 text-slate-500 text-[10px]">
                  <X size={10} />
                </span>
                <span>Access Restrict</span>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition disabled:opacity-50 cursor-pointer"
            >
              <Save size={14} />
              {saving ? 'Saving Changes...' : 'Save Matrix'}
            </button>
          </div>
        </div>
      )}

      {/* ================= ADD PERMISSION MODAL ================= */}
      {isAddPermModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <FolderLock size={16} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Register New System Capability
                </h3>
              </div>
              <button
                onClick={() => setIsAddPermModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreatePermission} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Module Category <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. employee, attendance, payroll, projects"
                  value={newPermData.module}
                  onChange={(e) => setNewPermData({ ...newPermData, module: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Permission Key / Action <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. create_employee, manage_attendance, approve_leaves"
                  value={newPermData.permission || newPermData.slug || ''}
                  onChange={(e) =>
                    setNewPermData({
                      ...newPermData,
                      permission: e.target.value,
                      slug: e.target.value,
                    })
                  }
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 font-mono text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Display Name / Label <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Create Employee Record"
                  value={newPermData.name}
                  onChange={(e) => setNewPermData({ ...newPermData, name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Briefly state what this permission allows users to perform..."
                  value={newPermData.description}
                  onChange={(e) => setNewPermData({ ...newPermData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddPermModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPerm}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingPerm ? 'Registering...' : 'Register Permission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
