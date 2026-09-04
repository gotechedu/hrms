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
  Image as ImageIcon,
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
          techStack: Array.isArray(res.course.techStack) ? res.course.techStack.join(', ') : (res.course.techStack || ''),
          modules: Array.isArray(res.course.modules) ? res.course.modules.join('\n') : (res.course.modules || ''),
          whatYouWillLearn: Array.isArray(res.course.whatYouWillLearn) ? res.course.whatYouWillLearn.join('\n') : (res.course.whatYouWillLearn || ''),
          prerequisites: Array.isArray(res.course.prerequisites) ? res.course.prerequisites.join('\n') : (res.course.prerequisites || ''),
          image: res.course.image || res.course.previewImage || res.course.thumbnail || res.course.bannerImage || '',
          heroTagline: res.course.heroTagline || '',
          totalHours: res.course.totalHours || '',
          lecturesCount: res.course.lecturesCount || '',
          nextBatchDate: res.course.nextBatchDate || '',
          originalPrice: res.course.originalPrice || '',
          discountedPrice: res.course.discountedPrice || '',
          emiStartsAt: res.course.emiStartsAt || '',
          averageSalaryHike: res.course.averageSalaryHike || '',
          rating: res.course.rating || 4.9,
          reviewsCount: res.course.reviewsCount || 0,
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
      const payload = {
        ...editForm,
        originalPrice: editForm.originalPrice ? Number(editForm.originalPrice) : undefined,
        discountedPrice: editForm.discountedPrice ? Number(editForm.discountedPrice) : undefined,
        rating: editForm.rating ? Number(editForm.rating) : undefined,
        reviewsCount: editForm.reviewsCount ? Number(editForm.reviewsCount) : undefined,
      };
      await courseApi.updateCourse(course._id, payload);
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
      <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="grid md:grid-cols-3 gap-6 p-6 sm:p-8">
          {/* Visual Column */}
          <div className="relative h-52 md:h-full min-h-[190px] w-full overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
            {course.image || course.previewImage || course.thumbnail || course.bannerImage ? (
              <img
                src={course.image || course.previewImage || course.thumbnail || course.bannerImage}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white text-4xl font-extrabold">
                💻
              </div>
            )}
            {course.badge && (
              <span className="absolute top-3 left-3 rounded-full bg-slate-900/80 backdrop-blur-xs px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
                {course.badge}
              </span>
            )}
          </div>

          {/* Details Column */}
          <div className="md:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold uppercase text-blue-700 border border-blue-100">
                  {course.category}
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
                {course.rating && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200 flex items-center gap-1">
                    ★ {course.rating} ({course.reviewsCount || 120}+ reviews)
                  </span>
                )}
              </div>

              <h1 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                {course.title}
              </h1>
              {course.heroTagline && (
                <p className="mt-1 text-sm font-semibold text-blue-600">
                  {course.heroTagline}
                </p>
              )}
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                {course.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {(course.techStack || []).map((tech, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-slate-100 px-2.5 py-0.5 text-xs font-mono font-semibold text-slate-700 border border-slate-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Pricing / Enrollment strip */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-baseline gap-2">
                {course.discountedPrice ? (
                  <>
                    <span className="text-2xl font-heading font-black text-slate-900 font-mono">
                      ₹{Number(course.discountedPrice).toLocaleString('en-IN')}
                    </span>
                    {course.originalPrice && course.originalPrice > course.discountedPrice && (
                      <span className="text-sm text-slate-400 line-through font-mono">
                        ₹{Number(course.originalPrice).toLocaleString('en-IN')}
                      </span>
                    )}
                    {course.emiStartsAt && (
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        EMI: {course.emiStartsAt}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-xl font-heading font-black text-emerald-600 font-mono">
                    {course.price || 'Free Sponsored'}
                  </span>
                )}
              </div>

              <div className="text-xs font-mono font-bold text-slate-500">
                Enrolled Students: <strong className="text-slate-900">{enrolledStudents.length}</strong>
              </div>
            </div>
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
            {course.totalHours && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Total Hours</span>
                <span className="font-bold text-slate-900">{course.totalHours}</span>
              </div>
            )}
            {course.lecturesCount && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Lectures</span>
                <span className="font-bold text-slate-900">{course.lecturesCount}</span>
              </div>
            )}
            {course.nextBatchDate && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Next Batch Starts</span>
                <span className="font-bold text-blue-600">{course.nextBatchDate}</span>
              </div>
            )}
            {course.averageSalaryHike && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Average Salary Hike</span>
                <span className="font-bold text-emerald-600">{course.averageSalaryHike}</span>
              </div>
            )}
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

        {/* Card 3: What You Will Learn */}
        {course.whatYouWillLearn && course.whatYouWillLearn.length > 0 && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <CheckCircle2 size={18} className="text-emerald-600" />
              <h3 className="font-heading text-base font-bold text-slate-900">Key Learning Outcomes</h3>
            </div>
            <ul className="space-y-2 text-xs">
              {course.whatYouWillLearn.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Card 4: Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
              <Sparkles size={18} className="text-amber-600" />
              <h3 className="font-heading text-base font-bold text-slate-900">Program Prerequisites</h3>
            </div>
            <ul className="space-y-2 text-xs">
              {course.prerequisites.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2 text-slate-700">
                  <span className="text-amber-500 font-bold shrink-0">•</span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
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
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {enrolledStudents.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      <Link to={`/applications/${app._id}`} className="hover:text-blue-600 hover:underline">
                        {app.studentName}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-blue-600">{app.email}</td>
                    <td className="py-3 px-4 text-slate-600">{app.phone}</td>
                    <td className="py-3 px-4 text-slate-500">{app.collegeOrCompany || 'Fresher'}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        to={`/applications/${app._id}`}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
                      >
                        View Details →
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

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Hero Tagline
                </label>
                <input
                  type="text"
                  value={editForm.heroTagline || ''}
                  onChange={(e) => setEditForm({ ...editForm, heroTagline: e.target.value })}
                  placeholder="e.g. Master modern web development with production deployments"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Image URL & Live Preview */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Course Cover Image URL
                </label>
                <div className="flex gap-3 items-start">
                  <div className="flex-1">
                    <input
                      type="url"
                      value={editForm.image || ''}
                      onChange={(e) => setEditForm({ ...editForm, image: e.target.value })}
                      placeholder="https://images.unsplash.com/... or custom URL"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-mono"
                    />
                  </div>
                  <div className="h-12 w-20 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                    {editForm.image ? (
                      <img
                        src={editForm.image}
                        alt="Preview"
                        className="h-full w-full object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    ) : (
                      <ImageIcon size={18} className="text-slate-300" />
                    )}
                  </div>
                </div>
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
                    Level
                  </label>
                  <input
                    type="text"
                    value={editForm.level || ''}
                    onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Hours, Lectures, Next Batch */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Total Hours
                  </label>
                  <input
                    type="text"
                    value={editForm.totalHours || ''}
                    onChange={(e) => setEditForm({ ...editForm, totalHours: e.target.value })}
                    placeholder="80+ Hours"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Lectures Count
                  </label>
                  <input
                    type="text"
                    value={editForm.lecturesCount || ''}
                    onChange={(e) => setEditForm({ ...editForm, lecturesCount: e.target.value })}
                    placeholder="64 Lectures"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Next Batch Date
                  </label>
                  <input
                    type="text"
                    value={editForm.nextBatchDate || ''}
                    onChange={(e) => setEditForm({ ...editForm, nextBatchDate: e.target.value })}
                    placeholder="e.g. 15th Oct, 2026"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Pricing, EMI, Salary Hike */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Discounted Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.discountedPrice || ''}
                    onChange={(e) => setEditForm({ ...editForm, discountedPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Original MRP Price (₹)
                  </label>
                  <input
                    type="number"
                    value={editForm.originalPrice || ''}
                    onChange={(e) => setEditForm({ ...editForm, originalPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    EMI Option
                  </label>
                  <input
                    type="text"
                    value={editForm.emiStartsAt || ''}
                    onChange={(e) => setEditForm({ ...editForm, emiStartsAt: e.target.value })}
                    placeholder="₹2,500/mo"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Badge Tag
                  </label>
                  <input
                    type="text"
                    value={editForm.badge || ''}
                    onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}
                    placeholder="Popular / Bestseller"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Rating (1-5)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={editForm.rating || ''}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
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
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  What Students Will Learn (one per line)
                </label>
                <textarea
                  rows={3}
                  value={editForm.whatYouWillLearn || ''}
                  onChange={(e) => setEditForm({ ...editForm, whatYouWillLearn: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Prerequisites (one per line)
                </label>
                <textarea
                  rows={2}
                  value={editForm.prerequisites || ''}
                  onChange={(e) => setEditForm({ ...editForm, prerequisites: e.target.value })}
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
