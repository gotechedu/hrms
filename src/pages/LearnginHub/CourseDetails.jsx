import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  ArrowLeft,
  BookOpen,
  Layers,
  Clock,
  Award,
  DollarSign,
  CheckCircle2,
  Edit2,
  Trash2,
  Users,
  RefreshCw,
  Sparkles,
  ChevronRight,
  X,
  AlertCircle,
} from 'lucide-react';
import { courseApi } from '../../Service';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const userRole = (user?.role || '').toLowerCase();
  const canManage = ['superadmin', 'admin', 'hr', 'manager'].includes(userRole);

  const fetchCourseData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseApi.getCourseById(id);
      if (res && res.course) {
        setCourse(res.course);
        setEditForm({
          ...res.course,
          techStack: Array.isArray(res.course.techStack) ? res.course.techStack.join(', ') : res.course.techStack,
          modules: Array.isArray(res.course.modules) ? res.course.modules.join('\n') : res.course.modules,
        });

        // Also fetch enrolled student applications for this course
        const appRes = await courseApi.getCourseApplications({
          search: res.course.title,
        });
        if (appRes && appRes.applications) {
          setEnrolledStudents(appRes.applications);
        }
      } else {
        setError('Course curriculum record not found.');
      }
    } catch (err) {
      console.error('Fetch Course Error:', err);
      setError(err.message || 'Failed to retrieve course details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await courseApi.updateCourse(course._id, editForm);
      setIsEditModalOpen(false);
      fetchCourseData();
    } catch (err) {
      alert(err.message || 'Error updating course');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete course '${course.title}'?`)) {
      try {
        await courseApi.deleteCourse(course._id);
        navigate('/learninghub');
      } catch (err) {
        alert(err.message || 'Error deleting course');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-fadeIn">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">Loading curriculum dossier from backend...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs animate-fadeIn max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Curriculum Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This learning program does not exist in the database.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/learninghub')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ← Back to Learning Hub
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
          onClick={() => navigate('/learninghub')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Learning Catalog
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchCourseData}
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
                <span>Edit Program</span>
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
                {course.category}
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                {course.badge || 'Popular'}
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                  course.status === 'Active'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                Status: {course.status}
              </span>
            </div>

            <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              {course.title}
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed max-w-3xl">
              {course.description}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(course.techStack || []).map((tech, idx) => (
                <span
                  key={idx}
                  className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-mono font-semibold text-slate-700 border border-slate-200"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex md:flex-col items-center md:items-end justify-between gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 shrink-0">
            <span className="text-xl font-heading font-black text-emerald-600 font-mono">
              {course.price || 'Free Sponsored'}
            </span>
            <span className="text-xs font-mono font-bold text-slate-500">
              Enrolled Students: <strong className="text-slate-900">{enrolledStudents.length}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Structured Details Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Curriculum Specifications */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <BookOpen size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Curriculum Specifications</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Program Duration</span>
              <span className="font-bold text-slate-900">{course.duration}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Delivery Mode</span>
              <span className="font-bold text-slate-900">{course.mode}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Experience Level</span>
              <span className="font-bold text-blue-600">{course.level}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-500 font-mono">Target Career Outcome</span>
              <span className="font-bold text-emerald-600">{course.careerOutcome}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Syllabus Modules Breakdown */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <Layers size={18} className="text-purple-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Syllabus Modules Breakdown</h3>
          </div>

          <ul className="space-y-2 text-xs">
            {(course.modules && course.modules.length > 0
              ? course.modules
              : ['Core Fundamentals', 'Advanced Architecture', 'Production Capstone Labs']
            ).map((mod, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-purple-600 font-bold font-mono shrink-0">0{idx + 1}.</span>
                <span className="font-semibold text-slate-800">{mod}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Enrolled Student Applications Table */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Users size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Enrolled Student Inquiries</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-mono font-bold text-slate-600">
            {enrolledStudents.length} Applicants
          </span>
        </div>

        {enrolledStudents.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs font-mono">
            No student enrollment applications received for this curriculum yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-mono font-bold uppercase text-slate-500">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Phone</th>
                  <th className="py-3 px-4">College / Background</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {enrolledStudents.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">{app.studentName}</td>
                    <td className="py-3 px-4 text-blue-600">{app.email}</td>
                    <td className="py-3 px-4 text-slate-600">{app.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{app.collegeOrCompany || 'Fresher'}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {app.status}
                      </span>
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
              <h3 className="font-heading text-lg font-bold text-slate-900">Edit Learning Curriculum</h3>
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
                  Program Title *
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
                    Category
                  </label>
                  <select
                    value={editForm.category || 'Development'}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Development">Development</option>
                    <option value="AI & Data">AI & Data</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Cybersecurity">Cybersecurity</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={editForm.duration || ''}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
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
                    <option value="Draft">Draft</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.techStack || ''}
                  onChange={(e) => setEditForm({ ...editForm, techStack: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={editForm.description || ''}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Syllabus Modules (one per line)
                </label>
                <textarea
                  rows={3}
                  value={editForm.modules || ''}
                  onChange={(e) => setEditForm({ ...editForm, modules: e.target.value })}
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
