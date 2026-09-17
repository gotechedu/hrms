import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Briefcase,
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  ChevronRight,
  X,
  AlertCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { jobApi, applicationApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();

  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const userRole = (role || user?.role || '').toLowerCase();
  const canManage =
    isSuperAdmin ||
    hasPermission('manage_career') ||
    hasPermission('manage_careers') ||
    hasPermission('careerpost') ||
    can('manage', 'careerpost') ||
    can('edit', 'careerpost');

  const fetchJobData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await jobApi.getJobById(id);
      if (res && res.job) {
        setJob(res.job);
        setEditForm({
          ...res.job,
          tags: Array.isArray(res.job.tags) ? res.job.tags.join(', ') : res.job.tags,
          requirements: Array.isArray(res.job.requirements) ? res.job.requirements.join('\n') : res.job.requirements,
        });

        // Fetch candidate applications for this specific job role
        const appRes = await applicationApi.getJobApplications({
          search: res.job.title,
        });
        if (appRes && appRes.applications) {
          setApplicants(appRes.applications);
        }
      } else {
        setError('Job opening record not found.');
      }
    } catch (err) {
      console.error('Fetch Job Error:', err);
      setError(err.message || 'Failed to retrieve job details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchJobData();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await jobApi.updateJob(job._id, editForm);
      setIsEditModalOpen(false);
      fetchJobData();
    } catch (err) {
      alert(err.message || 'Error updating job');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete job vacancy '${job.title}'?`)) {
      try {
        await jobApi.deleteJob(job._id);
        navigate('/careerpost');
      } catch (err) {
        alert(err.message || 'Error deleting job vacancy');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-fadeIn">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">Loading career position dossier...</p>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs animate-fadeIn max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Job Opening Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This career vacancy does not exist in the database.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/careerpost')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ← Back to Career Openings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/careerpost')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Openings
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchJobData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          {canManage && (
            <>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-700 transition shadow-sm cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Vacancy</span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-100 transition cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-blue-700 border border-blue-100">
                {job.department}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  job.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {job.status}
              </span>
              <span className="rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {job.type || 'Full-Time'}
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              {job.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
              {job.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(job.tags || []).map((t, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
            <span className="text-xl font-heading font-black text-slate-900 font-mono">
              {job.salary || '₹12L – ₹20L PA'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Total Applicants: <strong className="text-slate-900">{applicants.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Structured Details Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Job Specs */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Briefcase size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Position Specifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Work Location</span>
              <span className="font-bold text-slate-900">{job.location}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Experience Required</span>
              <span className="font-bold text-slate-900">{job.experience}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Department</span>
              <span className="font-bold text-blue-600">{job.department}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">Compensation Budget</span>
              <span className="font-bold text-emerald-600">{job.salary}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Requirements */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <FileText size={18} className="text-purple-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Role Requirements & Qualifications</h3>
          </div>

          <ul className="space-y-2 text-xs">
            {(job.requirements && job.requirements.length > 0
              ? job.requirements
              : ['Strong CS fundamentals', 'Experience in production web architecture', 'Clean code and automated testing']
            ).map((req, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-blue-600 font-bold font-mono shrink-0">✓</span>
                <span className="font-semibold text-slate-800">{req}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <UserCheck size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Candidate Pipeline for this Role</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-mono font-bold text-slate-600">
            {applicants.length} Candidates
          </span>
        </div>

        {applicants.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            No candidate applications received for this job vacancy yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Candidate Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">Experience</th>
                  <th className="py-3 px-4">Expected CTC</th>
                  <th className="py-3 px-4">Hiring Stage</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {applicants.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{app.name}</td>
                    <td className="py-3 px-4 text-blue-600">{app.email}</td>
                    <td className="py-3 px-4 text-slate-600">{app.phone}</td>
                    <td className="py-3 px-4 text-slate-700">{app.experience}</td>
                    <td className="py-3 px-4 font-mono font-semibold">{app.expectedCTC || 'Negotiable'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          app.stage === 'Hired'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : app.stage === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {app.stage}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/applications/${app._id}`}
                        className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                      >
                        Dossier →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">Edit Career Position</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.title || ''}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Department
                  </label>
                  <select
                    value={editForm.department || 'Engineering'}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Status
                  </label>
                  <select
                    value={editForm.status || 'Active'}
                    onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
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
                    Salary (CTC)
                  </label>
                  <input
                    type="text"
                    value={editForm.salary || ''}
                    onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Experience Requirement
                  </label>
                  <input
                    type="text"
                    value={editForm.experience || ''}
                    onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.tags || ''}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Job Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="mt-6 flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
