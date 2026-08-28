import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  Layers,
  Sparkles,
  Clock,
  Award,
  CheckCircle2,
  Trash2,
  Edit2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowUpRight,
  List,
  LayoutGrid,
  UserCheck,
} from 'lucide-react';
import { courseApi } from '../../Service';

export default function LearningHub() {
  const { user } = useSelector((state) => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  // Candidate Enrollment State
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const initialCandidateForm = {
    courseTitle: '',
    studentName: '',
    email: '',
    phone: '',
    collegeOrCompany: '',
    qualification: 'B.Tech / MCA / BCA',
    batch: 'Current Cohort 2026',
    feesStatus: 'Unpaid',
    feesAmount: 0,
    experienceLevel: 'Student / Fresher',
    learningGoal: 'Career Transition / Upskilling',
    modePreference: 'Live Online Labs',
    status: 'Pending',
    notes: '',
  };
  const [candidateForm, setCandidateForm] = useState(initialCandidateForm);

  const userRole = (user?.role || '').toLowerCase();
  const canManage = ['superadmin', 'admin', 'hr', 'manager'].includes(userRole);

  const initialForm = {
    title: '',
    category: 'Development',
    duration: '16 Weeks',
    mode: 'Live Online + Capstone Labs',
    level: 'Beginner to Advanced',
    badge: 'Popular',
    description: '',
    techStack: 'React, Next.js, Node.js, TypeScript',
    modules: 'Module 1: Foundations\nModule 2: Advanced Architecture\nModule 3: Capstone Deployment',
    careerOutcome: 'Full-Stack Software Engineer (₹8L – ₹18L PA)',
    price: 'Free & Industry Sponsored',
    status: 'Active',
  };
  const [form, setForm] = useState(initialForm);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await courseApi.getCourses({
        category: selectedCategory,
        search: searchQuery,
      });
      if (res && res.courses) {
        setCourses(res.courses);
      }
    } catch (err) {
      console.error('Fetch Courses Error:', err);
      setError(err.message || 'Failed to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await courseApi.updateCourse(editingCourse._id, form);
      } else {
        await courseApi.createCourse(form);
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      setForm(initialForm);
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Error saving course');
    }
  };

  const handleDelete = async (id, title) => {
    if (window.confirm(`Are you sure you want to delete course '${title}'?`)) {
      try {
        await courseApi.deleteCourse(id);
        fetchCourses();
      } catch (err) {
        alert(err.message || 'Error deleting course');
      }
    }
  };

  const handleEnrollCandidate = async (e) => {
    e.preventDefault();
    try {
      await courseApi.submitCourseApplication(candidateForm);
      setIsCandidateModalOpen(false);
      setCandidateForm(initialCandidateForm);
      alert('Student candidate enrolled successfully into course!');
      fetchCourses();
    } catch (err) {
      alert(err.message || 'Error enrolling candidate');
    }
  };

  const openEditModal = (c) => {
    setEditingCourse(c);
    setForm({
      ...c,
      techStack: Array.isArray(c.techStack) ? c.techStack.join(', ') : c.techStack,
      modules: Array.isArray(c.modules) ? c.modules.join('\n') : c.modules,
    });
    setIsModalOpen(true);
  };

  const categories = ['All', 'Development', 'AI & Data', 'Cloud & DevOps', 'Cybersecurity', 'Marketing'];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <GraduationCap size={13} /> Tech Stacks & Academy Engine
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Learning Hub Curriculum
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Create and maintain enterprise tech stack programs published live to the official student portal
          </p>
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCandidateForm(initialCandidateForm);
                setIsCandidateModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-blue-200 px-4 py-2.5 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50 transition cursor-pointer"
            >
              <UserCheck size={16} />
              <span>Enroll Candidate</span>
            </button>

            <Link
              to="/applications"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <span>View Candidates</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setEditingCourse(null);
                setForm(initialForm);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Publish Tech Stack</span>
            </button>
          </div>
        )}
      </div>

      {/* Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400">Total Curriculums</span>
          <p className="text-xl font-heading font-black text-slate-900 mt-1">{courses.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600">Active Offerings</span>
          <p className="text-xl font-heading font-black text-emerald-600 mt-1">
            {courses.filter((c) => c.status === 'Active').length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-600">Sync Engine</span>
          <p className="text-xs font-bold text-blue-700 uppercase mt-2 font-mono">Live MongoDB</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-600">Official Portal</span>
          <p className="text-xs font-bold text-purple-700 uppercase mt-2 font-mono">/learninghub</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search programs by title, tech stack, or description..."
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

            {/* Category Pills */}
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster / Table / Cards */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs text-slate-500 font-mono">Loading curriculum catalog from database...</p>
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
          <BookOpen size={36} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Learning Programs Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Publish Tech Stack" above to create a new bootcamp curriculum.
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
                  <th className="py-3.5 px-5">Program Title & Stack</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration & Mode</th>
                  <th className="py-3.5 px-4">Level</th>
                  <th className="py-3.5 px-4">Target Career</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {courses.map((course) => (
                  <tr key={course._id} className="hover:bg-slate-50/80 transition group">
                    <td className="py-3.5 px-5">
                      <div className="min-w-0 max-w-xs sm:max-w-sm">
                        <Link
                          to={`/learninghub/${course._id}`}
                          className="font-bold text-slate-900 group-hover:text-blue-600 transition block truncate text-xs sm:text-sm"
                        >
                          {course.title}
                        </Link>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {(course.techStack || []).slice(0, 3).map((t, idx) => (
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
                        {course.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{course.duration}</span>
                      <span className="text-[10px] text-slate-400 block truncate">{course.mode}</span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600 font-medium">{course.level}</td>

                    <td className="py-3.5 px-4 text-blue-600 font-semibold truncate max-w-[140px]">
                      {course.careerOutcome}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {course.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/learninghub/${course._id}`}
                          className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                        >
                          View Syllabus
                        </Link>

                        {canManage && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(course)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                              title="Edit Program"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(course._id, course.title)}
                              className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                              title="Delete Program"
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
          {courses.map((course) => (
            <div
              key={course._id}
              className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-blue-700 border border-blue-100">
                    {course.category}
                  </span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    {course.badge || 'Popular'}
                  </span>
                </div>

                <h3 className="mt-4 font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                  <Link to={`/learninghub/${course._id}`}>{course.title}</Link>
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {course.description}
                </p>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {(course.techStack || []).map((t, idx) => (
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
                    <span className="text-slate-400 font-mono">Duration</span>
                    <span className="font-bold">{course.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-mono">Mode</span>
                    <span className="font-bold">{course.mode}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="text-slate-400 font-mono">Target Career</span>
                    <span className="font-bold text-blue-600 truncate max-w-[170px]">{course.careerOutcome}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-slate-100 pt-3.5 flex items-center justify-between">
                <Link
                  to={`/learninghub/${course._id}`}
                  className="text-xs font-bold text-blue-600 hover:underline"
                >
                  View Details →
                </Link>

                {canManage && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEditModal(course)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer"
                      title="Edit Program"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(course._id, course.title)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Program"
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
                {editingCourse ? 'Edit Learning Curriculum' : 'Publish New Learning Tech Stack'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Program Title *
                </label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Full-Stack Next.js & React Engineering"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
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
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="16 Weeks"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Level
                  </label>
                  <input
                    type="text"
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    placeholder="Beginner to Advanced"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Tech Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={form.techStack}
                  onChange={(e) => setForm({ ...form, techStack: e.target.value })}
                  placeholder="Next.js, React, TypeScript, Tailwind CSS, Node.js"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Program Overview / Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Comprehensive description of the curriculum and capstone labs..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Career Outcome Target
                  </label>
                  <input
                    type="text"
                    value={form.careerOutcome}
                    onChange={(e) => setForm({ ...form, careerOutcome: e.target.value })}
                    placeholder="Frontend Engineer (₹8L – ₹18L PA)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Pricing / Sponsorship
                  </label>
                  <input
                    type="text"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="Free & Industry Sponsored"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
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
                  {editingCourse ? 'Save Changes' : 'Publish to Portal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enroll Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Enroll Student Candidate
                </h3>
                <p className="text-xs text-slate-500">
                  Register student or professional for Learning Hub cohort.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCandidateModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEnrollCandidate} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ananya Roy"
                    value={candidateForm.studentName}
                    onChange={(e) => setCandidateForm({ ...candidateForm, studentName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="ananya@gmail.com"
                    value={candidateForm.email}
                    onChange={(e) => setCandidateForm({ ...candidateForm, email: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98765 43210"
                    value={candidateForm.phone}
                    onChange={(e) => setCandidateForm({ ...candidateForm, phone: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrolling For Program *</label>
                  <select
                    required
                    value={candidateForm.courseTitle}
                    onChange={(e) => setCandidateForm({ ...candidateForm, courseTitle: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="">Select Tech Stack Program</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c.title}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cohort Batch</label>
                  <input
                    type="text"
                    placeholder="e.g. Cohort Alpha 2026"
                    value={candidateForm.batch}
                    onChange={(e) => setCandidateForm({ ...candidateForm, batch: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">College / Organization</label>
                  <input
                    type="text"
                    placeholder="IIT Delhi / Infosys"
                    value={candidateForm.collegeOrCompany}
                    onChange={(e) => setCandidateForm({ ...candidateForm, collegeOrCompany: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fees Status</label>
                  <select
                    value={candidateForm.feesStatus}
                    onChange={(e) => setCandidateForm({ ...candidateForm, feesStatus: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Scholarship">Scholarship / Free</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Learning Mode</label>
                  <select
                    value={candidateForm.modePreference}
                    onChange={(e) => setCandidateForm({ ...candidateForm, modePreference: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Live Online Labs">Live Online Labs</option>
                    <option value="Hybrid Campus">Hybrid Campus</option>
                    <option value="Self-Paced Mentorship">Self-Paced Mentorship</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCandidateModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/30 hover:opacity-95 transition"
                >
                  Confirm Enrollment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
