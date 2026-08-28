import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  UserCheck,
  GraduationCap,
  Briefcase,
  Search,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Trash2,
  FileText,
  DollarSign,
  Building2,
  RefreshCw,
  Award,
  List,
  LayoutGrid,
  Plus,
  X,
} from 'lucide-react';
import { applicationApi, courseApi, jobApi } from '../../Service';

export default function Applications() {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs' | 'learning'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Job Applications State
  const [jobApplications, setJobApplications] = useState([]);
  const [selectedJobStage, setSelectedJobStage] = useState('All');
  const [jobSearch, setJobSearch] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(true);

  // Learning Hub Applications State
  const [courseApplications, setCourseApplications] = useState([]);
  const [selectedCourseStatus, setSelectedCourseStatus] = useState('All');
  const [courseSearch, setCourseSearch] = useState('');
  const [loadingCourses, setLoadingCourses] = useState(true);

  // Candidate Registration Modals State
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false);
  const [isAddCourseModalOpen, setIsAddCourseModalOpen] = useState(false);
  const [availableJobs, setAvailableJobs] = useState([]);
  const [availableCourses, setAvailableCourses] = useState([]);

  const initialJobForm = {
    jobTitle: '',
    department: 'Engineering',
    name: '',
    email: '',
    phone: '',
    experience: '1–3 Years',
    currentCompany: '',
    expectedCTC: '₹12L PA',
    noticePeriod: '30 Days',
    resumeUrl: '',
    portfolioUrl: '',
    coverLetter: '',
    stage: 'Applied',
    rating: 4,
    notes: '',
  };
  const [jobForm, setJobForm] = useState(initialJobForm);

  const initialCourseForm = {
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
  const [courseForm, setCourseForm] = useState(initialCourseForm);

  const userRole = (user?.role || '').toLowerCase();
  const canManage = ['superadmin', 'admin', 'hr', 'manager'].includes(userRole);

  const fetchJobApps = async () => {
    try {
      setLoadingJobs(true);
      const res = await applicationApi.getJobApplications({
        stage: selectedJobStage,
        search: jobSearch,
      });
      if (res && res.applications) {
        setJobApplications(res.applications);
      }
    } catch (err) {
      console.error('Fetch Job Apps Error:', err);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchCourseApps = async () => {
    try {
      setLoadingCourses(true);
      const res = await courseApi.getCourseApplications({
        status: selectedCourseStatus,
        search: courseSearch,
      });
      if (res && res.applications) {
        setCourseApplications(res.applications);
      }
    } catch (err) {
      console.error('Fetch Course Apps Error:', err);
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchJobApps();
  }, [selectedJobStage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchJobApps();
    }, 300);
    return () => clearTimeout(timer);
  }, [jobSearch]);

  useEffect(() => {
    fetchCourseApps();
  }, [selectedCourseStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourseApps();
    }, 300);
    return () => clearTimeout(timer);
  }, [courseSearch]);

  useEffect(() => {
    // Pre-fetch active jobs & courses for the Add Candidate modal select options
    const fetchOptions = async () => {
      try {
        const [jobsRes, coursesRes] = await Promise.all([
          jobApi.getJobs({ status: 'Active' }),
          courseApi.getCourses({ status: 'Active' }),
        ]);
        if (jobsRes && jobsRes.jobs) setAvailableJobs(jobsRes.jobs);
        if (coursesRes && coursesRes.courses) setAvailableCourses(coursesRes.courses);
      } catch (e) {
        console.error('Fetch modal options error:', e);
      }
    };
    fetchOptions();
  }, []);

  const handleCreateJobCandidate = async (e) => {
    e.preventDefault();
    try {
      await applicationApi.submitJobApplication(jobForm);
      setIsAddJobModalOpen(false);
      setJobForm(initialJobForm);
      fetchJobApps();
    } catch (err) {
      alert(err.message || 'Error registering job candidate');
    }
  };

  const handleCreateCourseCandidate = async (e) => {
    e.preventDefault();
    try {
      await courseApi.submitCourseApplication(courseForm);
      setIsAddCourseModalOpen(false);
      setCourseForm(initialCourseForm);
      fetchCourseApps();
    } catch (err) {
      alert(err.message || 'Error enrolling student candidate');
    }
  };

  const handleAdvanceJobStage = async (id, currentStage) => {
    const nextStages = {
      Applied: 'Screening',
      Screening: 'Technical Round 2',
      'Technical Round 2': 'Offer Sent',
      'Offer Sent': 'Hired',
    };
    const next = nextStages[currentStage] || 'Hired';
    try {
      await applicationApi.updateJobApplicationStage(id, { stage: next });
      fetchJobApps();
    } catch (err) {
      alert(err.message || 'Error updating stage');
    }
  };

  const handleRejectJob = async (id) => {
    try {
      await applicationApi.updateJobApplicationStage(id, { stage: 'Rejected' });
      fetchJobApps();
    } catch (err) {
      alert(err.message || 'Error updating stage');
    }
  };

  const handleDeleteJobApp = async (id, name) => {
    if (window.confirm(`Delete candidate application for ${name}?`)) {
      try {
        await applicationApi.deleteJobApplication(id);
        fetchJobApps();
      } catch (err) {
        alert(err.message || 'Error deleting application');
      }
    }
  };

  const handleUpdateCourseStatus = async (id, status) => {
    try {
      await courseApi.updateCourseApplicationStatus(id, { status });
      fetchCourseApps();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDeleteCourseApp = async (id, name) => {
    if (window.confirm(`Delete student application for ${name}?`)) {
      try {
        await courseApi.deleteCourseApplication(id);
        fetchCourseApps();
      } catch (err) {
        alert(err.message || 'Error deleting application');
      }
    }
  };

  const jobStages = ['All', 'Applied', 'Screening', 'Technical Round 2', 'Offer Sent', 'Hired', 'Rejected'];
  const courseStatuses = ['All', 'Pending', 'Screening', 'Approved', 'Enrolled', 'Rejected'];

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <UserCheck size={13} /> Official Website Applications Gateway
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Talent & Student Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review job applicants from the official careers portal and student inquiries from the Learning Hub
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeTab === 'jobs' ? (
            <button
              type="button"
              onClick={() => setIsAddJobModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition cursor-pointer"
            >
              <Plus size={15} /> Add Job Candidate
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddCourseModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition cursor-pointer"
            >
              <Plus size={15} /> Enroll Course Candidate
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              fetchJobApps();
              fetchCourseApps();
            }}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Main Mode Tabs & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('jobs')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Briefcase size={15} />
            <span>Job Candidate Applications</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
              {jobApplications.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('learning')}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition cursor-pointer ${
              activeTab === 'learning'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <GraduationCap size={15} />
            <span>Learning Hub Course Enrollments</span>
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-mono font-bold">
              {courseApplications.length}
            </span>
          </button>
        </div>

        {/* View Switcher */}
        <div className="flex items-center self-start sm:self-auto rounded-xl border border-slate-200 bg-slate-50 p-0.5">
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
            <span>Table</span>
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
            <span>Grid</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          TAB 1: JOB CANDIDATE APPLICATIONS
         ========================================================================= */}
      {activeTab === 'jobs' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Stage Filters & Search */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search applicants by name, role, email, phone..."
                  value={jobSearch}
                  onChange={(e) => setJobSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {jobStages.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedJobStage(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedJobStage === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Applications View */}
          {loadingJobs ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-xs text-slate-500 font-mono">Fetching candidate submissions from database...</p>
            </div>
          ) : jobApplications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <UserCheck size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Candidate Applications</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Applications submitted from the official careers portal will appear here in real-time.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5">Candidate Name</th>
                      <th className="py-3.5 px-4">Role Position</th>
                      <th className="py-3.5 px-4">Contact (Email/Phone)</th>
                      <th className="py-3.5 px-4">Experience & CTC</th>
                      <th className="py-3.5 px-4">Hiring Stage</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {jobApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          <Link to={`/applications/${app._id}`} className="hover:text-blue-600 transition">
                            {app.name}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-blue-700 border border-blue-100">
                            {app.jobTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-blue-600 block">{app.email}</span>
                          <span className="text-slate-400 text-[10px] block">{app.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 block font-semibold">{app.experience}</span>
                          <span className="text-slate-400 text-[10px] font-mono block">
                            CTC: {app.expectedCTC || 'Negotiable'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
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
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/applications/${app._id}`}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            >
                              Dossier
                            </Link>

                            {canManage && (
                              <>
                                {app.stage !== 'Hired' && app.stage !== 'Rejected' && (
                                  <button
                                    type="button"
                                    onClick={() => handleAdvanceJobStage(app._id, app.stage)}
                                    className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-blue-700 transition"
                                  >
                                    Advance
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteJobApp(app._id, app.name)}
                                  className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition"
                                  title="Delete"
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
            /* GRID VIEW */
            <div className="grid gap-4">
              {jobApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 font-heading font-black text-white text-base shadow-sm">
                      {app.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/applications/${app._id}`}
                          className="font-heading text-base font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {app.name}
                        </Link>
                        <span className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-blue-700 border border-blue-100">
                          {app.jobTitle}
                        </span>
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
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-slate-400" /> {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" /> {app.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={12} className="text-slate-400" /> Exp: {app.experience}
                        </span>
                        {app.expectedCTC && (
                          <span className="flex items-center gap-1 font-mono font-semibold text-slate-700">
                            CTC: {app.expectedCTC}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <Link
                      to={`/applications/${app._id}`}
                      className="rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                    >
                      View Dossier →
                    </Link>

                    {canManage && (
                      <>
                        {app.stage !== 'Hired' && app.stage !== 'Rejected' && (
                          <button
                            type="button"
                            onClick={() => handleAdvanceJobStage(app._id, app.stage)}
                            className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                          >
                            Advance Stage
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteJobApp(app._id, app.name)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: LEARNING HUB COURSE ENROLLMENTS
         ========================================================================= */}
      {activeTab === 'learning' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Status Filters & Search */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center justify-between">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search student applications by name, course, email..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {courseStatuses.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedCourseStatus(st)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
                      selectedCourseStatus === st
                        ? 'bg-blue-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Course Applications View */}
          {loadingCourses ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-xs text-slate-500 font-mono">Fetching student admissions from database...</p>
            </div>
          ) : courseApplications.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs">
              <GraduationCap size={36} className="mx-auto text-slate-300 mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Course Enrollments Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Students applying for courses on the official website Learning Hub will show up here.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200/90 bg-slate-50/80 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500">
                      <th className="py-3.5 px-5">Student Name</th>
                      <th className="py-3.5 px-4">Applied Tech Stack</th>
                      <th className="py-3.5 px-4">Contact (Email/Phone)</th>
                      <th className="py-3.5 px-4">Background & Mode</th>
                      <th className="py-3.5 px-4">Admission Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {courseApplications.map((app) => (
                      <tr key={app._id} className="hover:bg-slate-50/80 transition group">
                        <td className="py-3.5 px-5 font-bold text-slate-900">
                          <Link to={`/applications/${app._id}`} className="hover:text-blue-600 transition">
                            {app.studentName}
                          </Link>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="rounded-md bg-purple-50 px-2 py-0.5 font-mono text-[10px] font-bold text-purple-700 border border-purple-100">
                            {app.courseTitle}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-blue-600 block">{app.email}</span>
                          <span className="text-slate-400 text-[10px] block">{app.phone}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 block font-semibold">{app.collegeOrCompany || 'Fresher'}</span>
                          <span className="text-slate-400 text-[10px] font-mono block">{app.modePreference}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              app.status === 'Enrolled' || app.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              to={`/applications/${app._id}`}
                              className="rounded-lg bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-100 transition cursor-pointer"
                            >
                              Dossier
                            </Link>

                            {canManage && (
                              <>
                                {app.status !== 'Enrolled' && (
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateCourseStatus(app._id, 'Enrolled')}
                                    className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700 transition"
                                  >
                                    Enroll
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCourseApp(app._id, app.studentName)}
                                  className="rounded-lg border border-slate-200 p-1 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition"
                                  title="Delete"
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
            /* GRID VIEW */
            <div className="grid gap-4">
              {courseApplications.map((app) => (
                <div
                  key={app._id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 font-heading font-black text-white text-base shadow-sm">
                      {app.studentName.substring(0, 2).toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/applications/${app._id}`}
                          className="font-heading text-base font-bold text-slate-900 hover:text-blue-600 transition"
                        >
                          {app.studentName}
                        </Link>
                        <span className="rounded-md bg-purple-50 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-700 border border-purple-100">
                          {app.courseTitle}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            app.status === 'Enrolled' || app.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : app.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {app.status}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Mail size={12} className="text-slate-400" /> {app.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone size={12} className="text-slate-400" /> {app.phone}
                        </span>
                        {app.collegeOrCompany && (
                          <span className="flex items-center gap-1">
                            <Building2 size={12} className="text-slate-400" /> {app.collegeOrCompany}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                    <Link
                      to={`/applications/${app._id}`}
                      className="rounded-xl bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100 transition"
                    >
                      View Dossier →
                    </Link>

                    {canManage && (
                      <>
                        {app.status !== 'Enrolled' && (
                          <button
                            type="button"
                            onClick={() => handleUpdateCourseStatus(app._id, 'Enrolled')}
                            className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                          >
                            Enroll Student
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteCourseApp(app._id, app.studentName)}
                          className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-rose-600 transition"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Job Candidate Modal */}
      {isAddJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Register Job Candidate Application
                </h3>
                <p className="text-xs text-slate-500">
                  Enter candidate details into the talent acquisition pipeline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddJobModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateJobCandidate} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Candidate Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Sharma"
                    value={jobForm.name}
                    onChange={(e) => setJobForm({ ...jobForm, name: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="vikram@example.com"
                    value={jobForm.email}
                    onChange={(e) => setJobForm({ ...jobForm, email: e.target.value })}
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
                    value={jobForm.phone}
                    onChange={(e) => setJobForm({ ...jobForm, phone: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Applying For Job Opening *</label>
                  <input
                    type="text"
                    required
                    list="jobs-datalist"
                    placeholder="e.g. Full-Stack Developer"
                    value={jobForm.jobTitle}
                    onChange={(e) => setJobForm({ ...jobForm, jobTitle: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                  <datalist id="jobs-datalist">
                    {availableJobs.map((j) => (
                      <option key={j._id} value={j.title} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <select
                    value={jobForm.department}
                    onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="AI & Data Science">AI & Data Science</option>
                    <option value="Cloud & DevOps">Cloud & DevOps</option>
                    <option value="Product & Design">Product & Design</option>
                    <option value="Marketing & Growth">Marketing & Growth</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Experience</label>
                  <input
                    type="text"
                    placeholder="e.g. 3 Years"
                    value={jobForm.experience}
                    onChange={(e) => setJobForm({ ...jobForm, experience: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Expected CTC</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹15L PA"
                    value={jobForm.expectedCTC}
                    onChange={(e) => setJobForm({ ...jobForm, expectedCTC: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Notice Period</label>
                  <input
                    type="text"
                    placeholder="e.g. 30 Days"
                    value={jobForm.noticePeriod}
                    onChange={(e) => setJobForm({ ...jobForm, noticePeriod: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Resume / CV Link URL</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={jobForm.resumeUrl}
                    onChange={(e) => setJobForm({ ...jobForm, resumeUrl: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Portfolio / LinkedIn URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    value={jobForm.portfolioUrl}
                    onChange={(e) => setJobForm({ ...jobForm, portfolioUrl: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Initial Pipeline Stage</label>
                  <select
                    value={jobForm.stage}
                    onChange={(e) => setJobForm({ ...jobForm, stage: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Screening">Screening</option>
                    <option value="Technical Round 2">Technical Round 2</option>
                    <option value="Offer Sent">Offer Sent</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Internal Notes / Feedback</label>
                  <input
                    type="text"
                    placeholder="HR Screening comments..."
                    value={jobForm.notes}
                    onChange={(e) => setJobForm({ ...jobForm, notes: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddJobModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
                >
                  Register Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Course Candidate Modal */}
      {isAddCourseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">
                  Enroll Course Student Candidate
                </h3>
                <p className="text-xs text-slate-500">
                  Register candidate for Learning Hub programs and industry cohorts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddCourseModalOpen(false)}
                className="h-8 w-8 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCourseCandidate} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aarav Patel"
                    value={courseForm.studentName}
                    onChange={(e) => setCourseForm({ ...courseForm, studentName: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="aarav@gmail.com"
                    value={courseForm.email}
                    onChange={(e) => setCourseForm({ ...courseForm, email: e.target.value })}
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
                    value={courseForm.phone}
                    onChange={(e) => setCourseForm({ ...courseForm, phone: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrolling For Course *</label>
                  <input
                    type="text"
                    required
                    list="courses-datalist"
                    placeholder="e.g. Full-Stack Web Development"
                    value={courseForm.courseTitle}
                    onChange={(e) => setCourseForm({ ...courseForm, courseTitle: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                  <datalist id="courses-datalist">
                    {availableCourses.map((c) => (
                      <option key={c._id} value={c.title} />
                    ))}
                  </datalist>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Cohort Batch</label>
                  <input
                    type="text"
                    placeholder="Fall 2026 Batch"
                    value={courseForm.batch}
                    onChange={(e) => setCourseForm({ ...courseForm, batch: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualification</label>
                  <input
                    type="text"
                    placeholder="B.Tech / MCA / BCA"
                    value={courseForm.qualification}
                    onChange={(e) => setCourseForm({ ...courseForm, qualification: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fees Status</label>
                  <select
                    value={courseForm.feesStatus}
                    onChange={(e) => setCourseForm({ ...courseForm, feesStatus: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Partial">Partial</option>
                    <option value="Unpaid">Unpaid</option>
                    <option value="Scholarship">Scholarship / Free</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Fees Amount (₹)</label>
                  <input
                    type="number"
                    value={courseForm.feesAmount}
                    onChange={(e) => setCourseForm({ ...courseForm, feesAmount: Number(e.target.value) })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Learning Mode</label>
                  <select
                    value={courseForm.modePreference}
                    onChange={(e) => setCourseForm({ ...courseForm, modePreference: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Live Online Labs">Live Online Labs</option>
                    <option value="Hybrid Campus">Hybrid Campus</option>
                    <option value="Self-Paced Mentorship">Self-Paced Mentorship</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Enrollment Status</label>
                  <select
                    value={courseForm.status}
                    onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                    className="h-9 w-full rounded-xl border border-slate-200 px-3 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Screening">Screening</option>
                    <option value="Approved">Approved</option>
                    <option value="Enrolled">Enrolled</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddCourseModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-bold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-md shadow-blue-600/30 hover:bg-blue-500 transition"
                >
                  Enroll Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
