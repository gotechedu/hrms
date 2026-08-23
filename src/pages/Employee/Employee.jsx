import React, { useState } from 'react';
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
} from 'lucide-react';
import {
  addEmployee,
  deleteEmployee,
  updateEmployee,
  setSearchQuery,
  setSelectedDepartment,
  setSelectedStatus,
} from '../../redux/slices/employeeSlice';
import Modal from '../../Components/Common/Modal';

const departments = [
  'All',
  'Engineering',
  'AI & Data Science',
  'Cloud & DevOps',
  'Cybersecurity',
  'Marketing & Growth',
  'People Operations & HR',
];

export default function Employee() {
  const dispatch = useDispatch();
  const { employees, searchQuery, selectedDepartment, selectedStatus } = useSelector(
    (state) => state.employee
  );

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEmployeeDetail, setSelectedEmployeeDetail] = useState(null);

  // New Employee Form State
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Engineering',
    role: '',
    type: 'Full-Time',
    salary: '₹18,00,000 PA',
    location: 'Gurugram, HQ',
  });

  const filteredEmployees = employees.filter((emp) => {
    // Department
    if (selectedDepartment !== 'All' && emp.department !== selectedDepartment) {
      return false;
    }
    // Status
    if (selectedStatus !== 'All' && emp.status !== selectedStatus) {
      return false;
    }
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = emp.name.toLowerCase().includes(q);
      const matchRole = emp.role.toLowerCase().includes(q);
      const matchEmail = emp.email.toLowerCase().includes(q);
      const matchDept = emp.department.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchEmail && !matchDept) {
        return false;
      }
    }
    return true;
  });

  const handleAddEmployee = (e) => {
    e.preventDefault();
    dispatch(addEmployee(newEmployee));
    setIsAddModalOpen(false);
    setNewEmployee({
      name: '',
      email: '',
      phone: '',
      department: 'Engineering',
      role: '',
      type: 'Full-Time',
      salary: '₹18,00,000 PA',
      location: 'Gurugram, HQ',
    });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this employee record?')) {
      dispatch(deleteEmployee(id));
      if (selectedEmployeeDetail?.id === id) {
        setSelectedEmployeeDetail(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600">
            <Users size={13} /> Personnel Intelligence
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Employee Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage organization roster, department allocations, and compensation records
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, role, email, or department..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Department Select */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedDepartment}
              onChange={(e) => dispatch(setSelectedDepartment(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={(e) => dispatch(setSelectedStatus(e.target.value))}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employee Cards Grid */}
      <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filteredEmployees.map((emp) => (
          <div
            key={emp.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              {/* Header Badge */}
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  {emp.id}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    emp.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {emp.status}
                </span>
              </div>

              {/* Avatar & Title */}
              <div className="mt-4 flex items-center gap-3.5">
                <img
                  src={emp.avatar}
                  alt={emp.name}
                  className="h-13 w-13 rounded-2xl border border-slate-200 object-cover shadow-2xs"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-base font-bold text-slate-900 truncate group-hover:text-blue-600 transition">
                    {emp.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-600 truncate">{emp.role}</p>
                  <p className="text-[11px] text-slate-400 truncate">{emp.department}</p>
                </div>
              </div>

              {/* Meta Specs */}
              <div className="mt-4 space-y-2 rounded-2xl bg-slate-50 p-3 text-xs border border-slate-100">
                <div className="flex items-center gap-2 text-slate-600 truncate">
                  <Mail size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{emp.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{emp.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{emp.location}</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-slate-900">
                {emp.salary}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedEmployeeDetail(emp)}
                  className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                >
                  View File
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(emp.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                  title="Remove Employee"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Personnel"
        subtitle="Complete employee profile setup and system credentials"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Maya Ranganathan"
                value={newEmployee.name}
                onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Corporate Email *
              </label>
              <input
                type="email"
                required
                placeholder="maya.r@gotechedu.com"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Primary Phone *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 00112"
                value={newEmployee.phone}
                onChange={(e) => setNewEmployee({ ...newEmployee, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Department *
              </label>
              <select
                value={newEmployee.department}
                onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                {departments.filter((d) => d !== 'All').map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Designation / Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Python Architect"
                value={newEmployee.role}
                onChange={(e) => setNewEmployee({ ...newEmployee, role: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Annual Compensation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. ₹22,00,000 PA"
                value={newEmployee.salary}
                onChange={(e) => setNewEmployee({ ...newEmployee, salary: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Work Location & Modality
            </label>
            <input
              type="text"
              placeholder="e.g. Gurugram HQ / Hybrid"
              value={newEmployee.location}
              onChange={(e) => setNewEmployee({ ...newEmployee, location: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Save Employee Record
            </button>
          </div>
        </form>
      </Modal>

      {/* Employee Detail Drawer Modal */}
      {selectedEmployeeDetail && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedEmployeeDetail(null)}
          title={`Employee Dossier: ${selectedEmployeeDetail.name}`}
          subtitle={`ID: ${selectedEmployeeDetail.id} • ${selectedEmployeeDetail.role}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 rounded-2xl bg-blue-50/70 p-4 border border-blue-100">
              <img
                src={selectedEmployeeDetail.avatar}
                alt={selectedEmployeeDetail.name}
                className="h-16 w-16 rounded-2xl object-cover border border-slate-200 shadow-xs"
              />
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  {selectedEmployeeDetail.name}
                </h3>
                <p className="text-xs font-semibold text-blue-700">{selectedEmployeeDetail.role}</p>
                <p className="text-xs text-slate-500">{selectedEmployeeDetail.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Work Email</span>
                <span className="font-semibold text-slate-900">{selectedEmployeeDetail.email}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Contact Phone</span>
                <span className="font-semibold text-slate-900">{selectedEmployeeDetail.phone}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Date of Joining</span>
                <span className="font-semibold text-slate-900">{selectedEmployeeDetail.joinDate}</span>
              </div>
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                <span className="text-slate-400 uppercase font-bold block text-[10px]">Compensation Band</span>
                <span className="font-semibold text-slate-900">{selectedEmployeeDetail.salary}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
