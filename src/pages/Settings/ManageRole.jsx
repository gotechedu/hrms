import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Shield,
  Plus,
  ChevronLeft,
  CheckCircle2,
  Lock,
  Edit2,
  Trash2,
  ArrowUpRight,
  X,
  Search,
  RefreshCw,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import { rolePermissionApi } from '../../Service';
import { useDispatch } from 'react-redux';
import { fetchCurrentUser } from '../../redux/slices/authSlice';
import notify from '../../utils/toast';

const BADGE_COLOR_PRESETS = [
  { label: 'Cyan Accent', value: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { label: 'Indigo Purple', value: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { label: 'Emerald Green', value: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { label: 'Amber Orange', value: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Rose Red', value: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'Sky Blue', value: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Slate Neutral', value: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function ManageRole() {
  const dispatch = useDispatch();
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    permissions: ['attendance', 'courses'],
  });

  // Fetch roles and available permissions from backend
  const fetchRolesData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [rolesRes, permsRes] = await Promise.all([
        rolePermissionApi.getRoles(),
        rolePermissionApi.getPermissions(),
      ]);

      setRoles(rolesRes.data?.roles || rolesRes.roles || []);
      setAllPermissions(permsRes.data?.permissions || permsRes.permissions || []);
    } catch (err) {
      console.error('Failed to load roles/permissions:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to load roles from server.';
      setError(msg);
      notify.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRolesData();
  }, []);

  // Handle Add Role Submit
  const handleAddRole = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      notify.warning('Role title cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await rolePermissionApi.createRole(formData);
      notify.success(response.data?.message || `Role '${formData.name}' created successfully!`);
      dispatch(fetchCurrentUser());
      window.dispatchEvent(new Event('gotech_permissions_updated'));
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        description: '',
        badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
        permissions: ['attendance', 'courses'],
      });
      fetchRolesData();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to create role');
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      badgeColor: role.badgeColor || 'bg-slate-50 text-slate-700 border-slate-200',
      permissions: role.permissions || [],
    });
    setIsEditModalOpen(true);
  };

  // Handle Edit Role Submit
  const handleEditRole = async (e) => {
    e.preventDefault();
    if (!editingRole || !formData.name.trim()) {
      notify.warning('Role title cannot be empty.');
      return;
    }

    try {
      setSubmitting(true);
      const response = await rolePermissionApi.updateRole(editingRole.slug || editingRole.id, formData);
      notify.success(response.data?.message || `Role '${formData.name}' updated successfully!`);
      dispatch(fetchCurrentUser());
      window.dispatchEvent(new Event('gotech_permissions_updated'));
      setIsEditModalOpen(false);
      setEditingRole(null);
      fetchRolesData();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to update role');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Delete Role
  const handleDeleteRole = async (role) => {
    if (role.isSystem) {
      notify.warning('System core roles cannot be deleted.');
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to permanently delete the custom role '${role.name}'? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await rolePermissionApi.deleteRole(role.slug || role.id);
      notify.success(res.data?.message || `Role '${role.name}' was successfully deleted.`);
      fetchRolesData();
    } catch (err) {
      notify.error(err.response?.data?.message || err.message || 'Failed to delete role');
    }
  };

  // Toggle permission in form
  const toggleFormPermission = (slug) => {
    setFormData((prev) => {
      const exists = prev.permissions.includes(slug);
      return {
        ...prev,
        permissions: exists
          ? prev.permissions.filter((p) => p !== slug)
          : [...prev.permissions, slug],
      };
    });
  };

  // Filtered Roles
  const filteredRoles = roles.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.slug?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Users size={18} />
            </div>
            Manage Roles & Access Hierarchy
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define organizational roles, configure custom job responsibilities, and control access boundaries.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={fetchRolesData}
            title="Refresh Roles"
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <Link
            to="/settings/permissions"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition shadow-2xs"
          >
            <Shield size={15} className="text-blue-600" /> Permission Matrix
          </Link>
          <button
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
                permissions: ['attendance', 'courses'],
              });
              setIsAddModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition cursor-pointer"
          >
            <Plus size={16} /> Create Custom Role
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
            onClick={fetchRolesData}
            className="underline text-rose-700 hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by role title, slug, or scope..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-xs font-medium text-slate-800 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Loading Skeleton */}
      {loading && roles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl border border-slate-100 bg-white p-5 animate-pulse">
              <div className="h-5 w-32 bg-slate-200 rounded-md mb-4"></div>
              <div className="h-3 w-full bg-slate-100 rounded mb-2"></div>
              <div className="h-3 w-4/5 bg-slate-100 rounded mb-6"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        /* Role Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRoles.map((r) => {
            const isSystemRole = Boolean(r.isSystem);
            const badgeClass = r.badgeColor || 'bg-slate-50 text-slate-700 border-slate-200';

            return (
              <div
                key={r.slug || r.id}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition duration-200 hover:shadow-md hover:border-slate-300 flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold font-mono uppercase tracking-wide ${badgeClass}`}
                    >
                      {r.name}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isSystemRole ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                          <Lock size={11} /> System Core
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            onClick={() => openEditModal(r)}
                            title="Edit Role Details"
                            className="p-1 rounded-md text-slate-400 hover:bg-slate-100 hover:text-blue-600 transition cursor-pointer"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(r)}
                            title="Delete Custom Role"
                            className="p-1 rounded-md text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Slug identifier */}
                  <div className="mt-1.5">
                    <span className="text-[10px] font-mono text-slate-400 font-medium">
                      role: <span className="text-slate-600 font-semibold">{r.slug || r.id}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="mt-2.5 text-xs text-slate-600 leading-relaxed min-h-[38px]">
                    {r.description || 'No specific description provided for this organizational role.'}
                  </p>

                  {/* Permissions count preview */}
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                    <KeyRound size={12} className="text-blue-500" />
                    <span>
                      {r.slug === 'superadmin' ? 'Universal Root Access' : `${r.permissions?.length || 0} Modules Granted`}
                    </span>
                  </div>
                </div>

                {/* Footer Bar */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
                    <span className="font-mono text-slate-600 font-semibold">
                      {r.userCount || 0} Assigned User{r.userCount === 1 ? '' : 's'}
                    </span>
                  </div>
                  <Link
                    to="/settings/permissions"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Permissions Matrix <ArrowUpRight size={13} />
                  </Link>
                </div>
              </div>
            );
          })}

          {filteredRoles.length === 0 && (
            <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
              <Users size={32} className="mx-auto text-slate-300 mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No roles match your search</h3>
              <p className="text-xs text-slate-400 mt-1">Try searching for a different keyword or create a new custom role.</p>
            </div>
          )}
        </div>
      )}

      {/* ================= ADD ROLE MODAL ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Plus size={16} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Create New Organizational Role
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddRole} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead Technical Recruiter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain duties, authority level, and responsibilities..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                />
              </div>

              {/* Badge Theme Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Role Tag Badge Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BADGE_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeColor: preset.value })}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition cursor-pointer ${
                        formData.badgeColor === preset.value
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full border ${preset.value.split(' ')[0]}`} />
                      <span className="text-[11px] font-bold text-slate-700">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Initial Permission Assignment */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Initial Module Permissions ({formData.permissions.length} granted)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  {allPermissions.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.slug);
                    return (
                      <label
                        key={perm.slug}
                        className="flex items-center gap-2.5 text-xs text-slate-700 font-medium cursor-pointer hover:text-slate-900"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFormPermission(perm.slug)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <span>{perm.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">({perm.module})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT ROLE MODAL ================= */}
      {isEditModalOpen && editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <Edit2 size={16} />
                </div>
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Edit Role: {editingRole.name}
                </h3>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditRole} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Role Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-10 w-full rounded-xl border border-slate-200 px-3.5 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Role Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 font-medium text-slate-800 focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">Role Tag Badge Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {BADGE_COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setFormData({ ...formData, badgeColor: preset.value })}
                      className={`flex items-center gap-2 rounded-xl border p-2 text-left transition cursor-pointer ${
                        formData.badgeColor === preset.value
                          ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className={`inline-block h-3 w-3 rounded-full border ${preset.value.split(' ')[0]}`} />
                      <span className="text-[11px] font-bold text-slate-700">{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-md shadow-blue-600/30 transition disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
