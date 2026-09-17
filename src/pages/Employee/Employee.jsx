import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Users,
  Search,
  Plus,
  Filter,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Trash2,
  Edit2,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Shield,
  AlertCircle,
  X,
  Building2,
  UserCheck,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  fetchEmployees,
  fetchDepartments,
  fetchEmployeeStats,
  createNewEmployee,
  updateExistingEmployee,
  removeEmployee,
  setSearchQuery,
  setSelectedDepartment,
  setSelectedStatus,
  setSelectedRole,
  clearActionMessage,
} from '../../redux/slices/employeeSlice';
import Modal from '../../Components/Common/Modal';
import { rolePermissionApi } from '../../Service';
import notify from '../../utils/toast';
import usePermissions from '../../utils/usePermissions';

const DEFAULT_ROLES_LIST = [
  { value: 'admin', label: 'Admin (System)' },
  { value: 'hr', label: 'HR Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'teamlead', label: 'Team Lead' },
  { value: 'employee', label: 'Employee' },
  { value: 'intern', label: 'Intern' },
];

const EMPLOYEE_TYPES = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Remote'];
const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave', 'Probation', 'Terminated'];

export default function Employee() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role: currentRole } = usePermissions();
  const {
    employees,
    departments,
    stats,
    searchQuery,
    selectedDepartment,
    selectedStatus,
    selectedRole,
    loading,
    error,
    actionSuccessMessage,
  } = useSelector((state) => state.employee);

  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES_LIST);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Dynamic role permissions
  const userRole = currentRole || (user?.role || '').toLowerCase();
  const isSuperadmin = isSuperAdmin;
  const canManageEmployees =
    isSuperadmin ||
    can('create', 'employee') ||
    hasPermission('manage_employee') ||
    hasPermission('create_employee') ||
    hasPermission('add_employee');
  const canEditEmployees =
    isSuperadmin ||
    can('edit', 'employee') ||
    hasPermission('manage_employee') ||
    hasPermission('edit_employee');
  const canDeleteEmployees =
    isSuperadmin ||
    can('delete', 'employee') ||
    hasPermission('manage_employee') ||
    hasPermission('delete_employee');

  // New Employee Form State
  const initialNewEmployee = {
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: 'employee',
    designation: '',
    type: 'Full-Time',
    status: 'Active',
    salary: '',
    location: '',
    password: '',
  };
  const [newEmployee, setNewEmployee] = useState(initialNewEmployee);

  // Fetch on mount
  useEffect(() => {
    dispatch(fetchEmployees());
    dispatch(fetchDepartments());
    dispatch(fetchEmployeeStats());

    // Fetch dynamic roles list from backend
    rolePermissionApi.getRoles()
      .then((res) => {
        const roles = res.data?.roles || res.roles || [];
        if (roles.length > 0) {
          setAvailableRoles(
            roles.map((r) => ({
              value: r.slug || r.id,
              label: r.name,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn('Failed to fetch dynamic roles:', err);
      });
  }, [dispatch]);

  // Refetch when filters change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(
        fetchEmployees({
          search: searchQuery,
          department: selectedDepartment,
          status: selectedStatus,
          role: selectedRole,
        })
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, searchQuery, selectedDepartment, selectedStatus, selectedRole]);

  // Handle Add Employee Submit
  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const res = await dispatch(createNewEmployee(newEmployee));
    if (createNewEmployee.fulfilled.match(res)) {
      setIsAddModalOpen(false);
      setNewEmployee(initialNewEmployee);
      dispatch(fetchEmployeeStats());
      setTimeout(() => dispatch(clearActionMessage()), 4000);
    }
  };

  // Handle Edit Employee Submit
  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const targetId = editingEmployee._id || editingEmployee.id || editingEmployee.employeeId;
    const res = await dispatch(
      updateExistingEmployee({
        id: targetId,
        data: editingEmployee,
      })
    );
    if (updateExistingEmployee.fulfilled.match(res)) {
      setIsEditModalOpen(false);
      setEditingEmployee(null);
      dispatch(fetchEmployeeStats());
      setTimeout(() => dispatch(clearActionMessage()), 4000);
    }
  };

  // Handle Delete
  const handleDelete = async (emp) => {
    const targetId = emp._id || emp.id || emp.employeeId;
    if (window.confirm(`Are you sure you want to remove ${emp.name} (${emp.employeeId || emp.id})?`)) {
      const res = await dispatch(removeEmployee(targetId));
      if (removeEmployee.fulfilled.match(res)) {
        if (selectedEmployeeDetail?.employeeId === emp.employeeId || selectedEmployeeDetail?._id === emp._id) {
          setSelectedEmployeeDetail(null);
        }
        dispatch(fetchEmployeeStats());
        setTimeout(() => dispatch(clearActionMessage()), 4000);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-xs font-bold text-emerald-700 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-2xl bg-rose-500/10 border border-rose-500/30 p-4 text-xs font-bold text-rose-700 animate-fadeIn">
          <AlertCircle size={16} className="text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Users size={13} /> Personnel Directory & RBAC Management
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage enterprise organization roster, role allocations, and workforce compensation records
          </p>
        </div>

        {canManageEmployees && (
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New Employee</span>
          </button>
        )}
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Workforce</span>
          <p className="text-xl font-heading font-black text-slate-900 mt-1">{stats?.total || employees.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">Active Personnel</span>
          <p className="text-xl font-heading font-black text-emerald-600 mt-1">{stats?.active || employees.filter(e => e.status === 'Active').length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-600">On Leave / Away</span>
          <p className="text-xl font-heading font-black text-amber-600 mt-1">{stats?.onLeave || 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-600">Your Access Level</span>
          <p className="text-xs font-bold text-blue-700 uppercase mt-2 font-mono">{userRole || 'Employee'}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, role, email, designation, or ID..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Filter Dropdowns & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Corporate Table View"
              >
                <List size={14} />
                <span className="hidden sm:inline">Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-600 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Cards Grid View"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => dispatch(setSelectedDepartment(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={selectedRole}
              onChange={(e) => dispatch(setSelectedRole(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Roles</option>
              {availableRoles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => dispatch(setSelectedStatus(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Probation">Probation</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton / Empty State */}
      {loading && employees.length === 0 ? (
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-200" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-slate-200 rounded" />
                    <div className="h-2.5 w-24 bg-slate-100 rounded" />
                  </div>
                </div>
                <div className="h-4 w-20 bg-slate-200 rounded hidden sm:block" />
                <div className="h-4 w-28 bg-slate-100 rounded hidden md:block" />
                <div className="h-5 w-16 bg-slate-100 rounded-md hidden lg:block" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
                <div className="h-4 w-20 bg-slate-100 rounded hidden sm:block" />
                <div className="h-6 w-16 bg-slate-200 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ) : employees.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <Users size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Employees Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or department filters to view records.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* =========================================================================
           1. CORPORATE TABLE FORM VIEW
           ========================================================================= */
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Staff Member</th>
                  <th className="py-3.5 px-4">Employee ID</th>
                  <th className="py-3.5 px-4">Designation & Department</th>
                  <th className="py-3.5 px-4">Role Access</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {employees.map((emp) => {
                  const empRole = emp.role || 'employee';
                  const avatarUrl =
                    emp.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`;

                  return (
                    <tr key={emp.employeeId || emp._id || emp.id} className="hover:bg-slate-50/80 transition group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={avatarUrl}
                            alt={emp.name}
                            className="h-10 w-10 rounded-xl object-cover border border-slate-200 shadow-2xs bg-slate-50 shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="font-bold text-slate-900 group-hover:text-blue-600 transition block truncate">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">{emp.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-700">
                        {emp.employeeId || emp.id}
                      </td>

                      {/* Designation & Department */}
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800 block truncate">{emp.designation || empRole}</span>
                        <span className="text-[11px] text-slate-400 block truncate">{emp.department}</span>
                      </td>

                      {/* Role Access */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-blue-700 border border-blue-100">
                          {empRole}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            emp.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : emp.status === 'On Leave'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {emp.status}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {emp.location || 'Gurugram, HQ'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            to={`/employees/${emp.employeeId || emp._id || emp.id}`}
                            className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                          >
                            View File
                          </Link>

                          {canEditEmployees && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingEmployee(emp);
                                setIsEditModalOpen(true);
                              }}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                              title="Edit Employee"
                            >
                              <Edit2 size={13} />
                            </button>
                          )}

                          {canDeleteEmployees && (
                            <button
                              type="button"
                              onClick={() => handleDeleteEmployee(emp._id || emp.employeeId, emp.name)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Employee Cards Grid */
        <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {employees.map((emp) => {
            const empRole = emp.role || 'employee';
            return (
              <div
                key={emp.employeeId || emp._id || emp.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div>
                  {/* Header Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-slate-400">
                        {emp.employeeId || emp.id}
                      </span>
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-blue-600 border border-blue-100">
                        {empRole}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        emp.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : emp.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </div>

                  {/* Avatar & Title */}
                  <div className="mt-4 flex items-center gap-3.5">
                    <img
                      src={
                        emp.avatar ||
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(emp.name)}`
                      }
                      alt={emp.name}
                      className="h-13 w-13 rounded-2xl border border-slate-200 object-cover shadow-2xs bg-slate-50"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-heading text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                        {emp.name}
                      </h3>
                      <p className="text-xs font-semibold text-blue-600 truncate">{emp.designation || emp.role}</p>
                      <p className="text-[11px] text-slate-400 truncate">{emp.department}</p>
                    </div>
                  </div>

                  {/* Meta Specs */}
                  <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-xs border border-slate-100">
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{emp.email}</span>
                    </div>
                    {emp.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone size={13} className="text-slate-400 shrink-0" />
                        <span>{emp.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{emp.location || 'Gurugram, HQ'}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {emp.salary || 'Competitive'}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/employees/${emp.employeeId || emp._id || emp.id}`}
                      className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                    >
                      View File
                    </Link>

                    {canEditEmployees && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEmployee({ ...emp });
                          setIsEditModalOpen(true);
                        }}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                        title="Edit Employee"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    {canManageEmployees && (
                      <button
                        type="button"
                        onClick={() => handleDelete(emp)}
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: ADD NEW EMPLOYEE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Add New Organization Employee</h3>
                <p className="text-xs text-slate-500">Creates profile & auto-generates linked user credentials</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newEmployee.name}
                    onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                    placeholder="e.g. Rahul Mehta"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Work Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmployee.email}
                    onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                    placeholder="rahul.m@gotechedu.com"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Assigned Role *
                  </label>
                  <select
                    value={newEmployee.role}
                    onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Department *
                  </label>
                  <select
                    value={newEmployee.department}
                    onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {departments
                      .filter((d) => d !== 'All')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={newEmployee.type}
                    onChange={(e) => setNewEmployee({ ...newEmployee, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {EMPLOYEE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Designation Title
                  </label>
                  <input
                    type="text"
                    value={newEmployee.designation}
                    onChange={(e) => setNewEmployee({ ...newEmployee, designation: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={newEmployee.phone}
                    onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Compensation (CTC / PA)
                  </label>
                  <input
                    type="text"
                    value={newEmployee.salary}
                    onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                    placeholder="₹18,00,000 PA"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Default Portal Password
                  </label>
                  <input
                    type="text"
                    value={newEmployee.password}
                    onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                    placeholder="Password@123"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Work Location Hub
                  </label>
                  <input
                    type="text"
                    value={newEmployee.location}
                    onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
                    placeholder="e.g. Gurugram, HQ / Bangalore Hub"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Technical Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newEmployee.skills || ''}
                    onChange={(e) => setNewEmployee({ ...newEmployee, skills: e.target.value })}
                    placeholder="React, Node.js, TypeScript, Docker"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Emergency Contact & Banking Sub-Sections */}
              <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100 space-y-3">
                <span className="text-[11px] font-mono font-bold uppercase text-slate-500 block">
                  Banking & Direct Deposit (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="Bank Name (e.g. HDFC Bank)"
                      value={newEmployee.bankName || ''}
                      onChange={(e) => setNewEmployee({ ...newEmployee, bankName: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={newEmployee.accountNumber || ''}
                      onChange={(e) => setNewEmployee({ ...newEmployee, accountNumber: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="IFSC Code"
                      value={newEmployee.ifscCode || ''}
                      onChange={(e) => setNewEmployee({ ...newEmployee, ifscCode: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
                >
                  {loading ? 'Creating...' : 'Create Employee Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {isEditModalOpen && editingEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Edit Employee Record: {editingEmployee.name}
                </h3>
                <p className="text-xs font-mono text-slate-500">{editingEmployee.employeeId || editingEmployee.id}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingEmployee(null);
                }}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateEmployee} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.name || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editingEmployee.email || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Role Access
                  </label>
                  <select
                    value={editingEmployee.role || 'employee'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {availableRoles.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    value={editingEmployee.department || 'Engineering'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {departments
                      .filter((d) => d !== 'All')
                      .map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editingEmployee.status || 'Active'}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    {EMPLOYEE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Designation
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.designation || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, designation: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Salary Compensation
                  </label>
                  <input
                    type="text"
                    value={editingEmployee.salary || ''}
                    onChange={(e) => setEditingEmployee({ ...editingEmployee, salary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW EMPLOYEE PROFILE DETAILS */}
      {selectedEmployeeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={
                    selectedEmployeeDetail.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedEmployeeDetail.name)}`
                  }
                  alt={selectedEmployeeDetail.name}
                  className="h-16 w-16 rounded-2xl border border-slate-200 object-cover shadow-sm bg-slate-50"
                />
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{selectedEmployeeDetail.name}</h3>
                  <p className="text-xs font-semibold text-blue-600">{selectedEmployeeDetail.designation || selectedEmployeeDetail.role}</p>
                  <span className="inline-block mt-1 font-mono text-[11px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {selectedEmployeeDetail.employeeId || selectedEmployeeDetail.id}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEmployeeDetail(null)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-100 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Role Classification</span>
                <span className="font-bold text-slate-900 uppercase font-mono">{selectedEmployeeDetail.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Department</span>
                <span className="font-bold text-slate-900">{selectedEmployeeDetail.department}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Work Email</span>
                <span className="font-bold text-blue-600">{selectedEmployeeDetail.email}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Phone Number</span>
                <span className="font-bold text-slate-900">{selectedEmployeeDetail.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Employment Type</span>
                <span className="font-bold text-slate-900">{selectedEmployeeDetail.type || 'Full-Time'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-mono">Status</span>
                <span className="font-bold text-emerald-600">{selectedEmployeeDetail.status}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-mono">Annual Salary</span>
                <span className="font-bold text-slate-900 font-mono">{selectedEmployeeDetail.salary || 'Confidential'}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedEmployeeDetail(null)}
                className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white hover:bg-slate-800 transition"
              >
                Close File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
