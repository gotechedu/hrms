import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  ArrowUpRight,
  List,
  LayoutGrid,
} from 'lucide-react';
import { jobApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function CareerPost() {
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const userRole = (role || user?.role || '').toLowerCase();
  const canManage =
    isSuperAdmin ||
    hasPermission('manage_career') ||
    hasPermission('manage_careers') ||
    hasPermission('careerpost') ||
    can('manage', 'careerpost') ||
    can('create', 'careerpost');

  const initialForm = {
    title: '',
    department: 'Engineering',
    type: 'Full-Time',
    location: 'Gurugram, HQ / Remote',
    experience: '2–4 Years',
    salary: '₹12L – ₹20L PA',
    tags: 'React, Next.js, Node.js, TypeScript',
    description: '',
    requirements: '2+ years production experience\nStrong CS fundamentals and system design\nClean code and unit testing',
    status: 'Active',
  };
  const [form, setForm] = useState(initialForm);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobApi.getJobs({
        department: selectedDept,
        search: searchQuery,
      });
      if (res && res.jobs) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.error('Fetch Jobs Error:', err);
      setError(err.message || 'Failed to load career postings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedDept]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobs();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (editingJob) {
        await jobApi.updateJob(editingJob._id, form);
      } else {
        await jobApi.createJob(form);
      }
      setIsModalOpen(false);
      setEditingJob(null);
      setForm(initialForm);
      fetchJobs();
    } catch (err) {
      alert(err.message || 'Error saving job opening');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete job posting '${title}'?`)) {
      try {
        await jobApi.deleteJob(id);
        fetchJobs();
      } catch (err) {
        alert(err.message || 'Error deleting job opening');
      }
    }
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setForm({
      ...job,
      tags: Array.isArray(job.tags) ? job.tags.join(', ') : job.tags,
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements,
    });
    setIsModalOpen(true);
  };

  const departments = ['All', 'Engineering', 'AI & Data', 'Cloud & DevOps', 'Cybersecurity', 'Marketing', 'People Operations & HR'];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <Briefcase size={13} /> Recruitment & Talent Openings
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Career Job Openings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Post and manage job positions displayed live on the official website career portal
          </p>
        </div>

        {canManage && (
          <button
            type="button"
            onClick={() => {
              setEditingJob(null);
              setForm(initialForm);
              setIsModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>Post New Opening</span>
          </button>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Openings</span>
          <p className="text-xl font-heading font-black text-slate-900 mt-1">{jobs.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">Active Roles</span>
          <p className="text-xl font-heading font-black text-emerald-600 mt-1">
            {jobs.filter((j) => j.status === 'Active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-600">Official Portal</span>
          <p className="text-xs font-bold text-blue-700 uppercase mt-2 font-mono">/career</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-600">Candidate Pipeline</span>
          <Link to="/applications" className="text-xs font-bold text-purple-700 underline mt-2 block">
            Review Applications →
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search job postings by role, department, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
            />
          </div>

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
                title="Table View"
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
                title="Grid View"
              >
                <LayoutGrid size={14} />
                <span className="hidden sm:inline">Grid</span>
              </button>
            </div>

            {departments.map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedDept === dept
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster / Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500 font-mono">Loading active job vacancies...</p>
        </div>
      ) : jobs.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <Briefcase size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Job Openings Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Post New Opening" above to create career opportunities.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        /* =========================================================================
           1. CORPORATE TABLE VIEW
           ========================================================================= */
        <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-5">Position Title & Tags</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Experience</th>
                  <th className="py-3.5 px-4">CTC Budget</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {jobs.map((job) => (
                  <tr key={job._id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-5">
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <Link
                          to={`/careerpost/${job._id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition block truncate text-xs sm:text-sm"
                        >
                          {job.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(job.tags || []).slice(0, 3).map((t, idx) => (
                            <span
                              key={idx}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-mono font-semibold text-slate-600"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-blue-700 border border-blue-100">
                        {job.department}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-semibold">{job.type || 'Full-Time'}</td>

                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px] truncate max-w-[130px]">
                      {job.location}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">{job.experience}</td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{job.salary}</td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          job.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/careerpost/${job._id}`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        >
                          View Dossier
                        </Link>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(job)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                              title="Edit Opening"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(job._id, job.title)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Opening"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* =========================================================================
           2. CARDS GRID VIEW
           ========================================================================= */
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div
              key={job._id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-blue-700 border border-blue-100">
                    {job.department}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      job.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  <Link to={`/careerpost/${job._id}`}>{job.title}</Link>
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {job.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(job.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="rounded-lg bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-700"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-4 space-y-1.5 rounded-2xl bg-slate-50 p-3 text-xs border border-slate-100">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-mono">Location</span>
                    <span className="font-bold">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-mono">Experience</span>
                    <span className="font-bold">{job.experience}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-mono">Type</span>
                    <span className="font-bold">{job.type}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <Link
                  to={`/careerpost/${job._id}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Details →
                </Link>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(job)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                      title="Edit Job"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(job._id, job.title)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Job"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">
                {editingJob ? 'Edit Career Opening' : 'Post New Career Opportunity'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveJob} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Job Position Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Senior Frontend Engineer"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Department *
                  </label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Marketing">Marketing</option>
                    <option value="People Operations & HR">People Operations & HR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Employment Type
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Active">Active</option>
                    <option value="Closed">Closed</option>
                    <option value="Draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Work Location
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Gurugram, HQ / Remote"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Experience Requirement
                  </label>
                  <input
                    type="text"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    placeholder="2–4 Years"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Salary Compensation (CTC)
                  </label>
                  <input
                    type="text"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: e.target.value })}
                    placeholder="₹12L – ₹20L PA"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="React, Next.js, TypeScript, Docker"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Role overview, team expectations, and core mission..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Requirements & Qualifications (one per line)
                </label>
                <textarea
                  rows={2}
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  placeholder="2+ years experience in React & TypeScript..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 cursor-pointer"
                >
                  {editingJob ? 'Save Changes' : 'Post to Official Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
