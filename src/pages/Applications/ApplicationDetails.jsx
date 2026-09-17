import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  UserCheck,
  ArrowLeft,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit2,
  RefreshCw,
  FileText,
  Star,
  ExternalLink,
  Building2,
  Award,
  DollarSign,
  AlertCircle,
  Printer,
  ShieldCheck,
  CreditCard,
  Percent,
  CheckSquare,
  BookOpen,
  Send,
} from 'lucide-react';
import { applicationApi, courseApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();

  const [application, setApplication] = useState(null);
  const [appType, setAppType] = useState('job'); // 'job' | 'course'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(4);
  const [progress, setProgress] = useState(0);
  const [certificateIssued, setCertificateIssued] = useState(false);
  const [feesStatus, setFeesStatus] = useState('Unpaid');
  const [feesAmount, setFeesAmount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({});

  const userRole = (role || user?.role || '').toLowerCase();
  const canManage =
    isSuperAdmin ||
    hasPermission('manage_applications') ||
    hasPermission('manage_career') ||
    hasPermission('manage_learninghub') ||
    hasPermission('careerpost') ||
    can('manage', 'applications') ||
    can('edit', 'applications');

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Try direct GET /api/job-applications/:id
      try {
        const resJob = await applicationApi.getJobApplicationById(id);
        if (resJob && resJob.application) {
          const found = resJob.application;
          setApplication(found);
          setAppType('job');
          setNotes(found.notes || '');
          setRating(found.rating || 4);
          setEditForm(found);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 2. Try direct GET /api/course-applications/:id
      try {
        const resCourse = await courseApi.getCourseApplicationById(id);
        if (resCourse && resCourse.application) {
          const foundCourse = resCourse.application;
          setApplication(foundCourse);
          setAppType('course');
          setNotes(foundCourse.notes || '');
          setProgress(foundCourse.progressPercentage || 0);
          setCertificateIssued(!!foundCourse.certificateIssued);
          setFeesStatus(foundCourse.feesStatus || 'Unpaid');
          setFeesAmount(foundCourse.feesAmount || 0);
          setEditForm(foundCourse);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 3. Fallback: Search all job applications
      try {
        const resAllJob = await applicationApi.getJobApplications();
        const foundJob = resAllJob?.applications?.find((a) => a._id === id);
        if (foundJob) {
          setApplication(foundJob);
          setAppType('job');
          setNotes(foundJob.notes || '');
          setRating(foundJob.rating || 4);
          setEditForm(foundJob);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // 4. Fallback: Search all course applications
      try {
        const resAllCourse = await courseApi.getCourseApplications();
        const foundCourseAll = resAllCourse?.applications?.find((a) => a._id === id);
        if (foundCourseAll) {
          setApplication(foundCourseAll);
          setAppType('course');
          setNotes(foundCourseAll.notes || '');
          setProgress(foundCourseAll.progressPercentage || 0);
          setCertificateIssued(!!foundCourseAll.certificateIssued);
          setFeesStatus(foundCourseAll.feesStatus || 'Unpaid');
          setFeesAmount(foundCourseAll.feesAmount || 0);
          setEditForm(foundCourseAll);
          setLoading(false);
          return;
        }
      } catch (e) {}

      setError('Candidate record could not be found in the system roster.');
    } catch (err) {
      console.error('Fetch Candidate Details Error:', err);
      setError(err.message || 'Failed to load candidate details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchApplicationData();
    }
  }, [id]);

  const handleUpdateStage = async (newStage) => {
    try {
      if (appType === 'job') {
        await applicationApi.updateJobApplicationStage(application._id, {
          stage: newStage,
          notes,
          rating,
        });
      } else {
        await courseApi.updateCourseApplicationStatus(application._id, {
          status: newStage,
          notes,
          progressPercentage: progress,
          certificateIssued,
          feesStatus,
          feesAmount,
        });
      }
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error updating candidate stage');
    }
  };

  const handleQuickSaveNotes = async () => {
    try {
      if (appType === 'job') {
        await applicationApi.updateJobApplicationStage(application._id, { notes, rating });
      } else {
        await courseApi.updateCourseApplicationStatus(application._id, {
          notes,
          progressPercentage: progress,
          certificateIssued,
          feesStatus,
          feesAmount,
        });
      }
      alert('Candidate evaluation notes saved successfully!');
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error saving notes');
    }
  };

  const handleToggleCertificate = async () => {
    const nextState = !certificateIssued;
    setCertificateIssued(nextState);
    try {
      await courseApi.updateCourseApplicationStatus(application._id, {
        certificateIssued: nextState,
      });
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error updating certificate status');
    }
  };

  const handleUpdateProgress = async (newVal) => {
    setProgress(newVal);
    try {
      await courseApi.updateCourseApplicationStatus(application._id, {
        progressPercentage: newVal,
      });
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error updating progress');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      if (appType === 'job') {
        await applicationApi.updateJobApplicationStage(application._id, editForm);
      } else {
        await courseApi.updateCourseApplicationStatus(application._id, editForm);
      }
      setIsEditModalOpen(false);
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error updating candidate profile');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete candidate '${applicantName}'?`)) {
      try {
        if (appType === 'job') {
          await applicationApi.deleteJobApplication(application._id);
        } else {
          await courseApi.deleteCourseApplication(application._id);
        }
        navigate('/applications');
      } catch (err) {
        alert(err.message || 'Error deleting candidate application');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-fadeIn">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">Retrieving full candidate profile & records...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs animate-fadeIn max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Candidate File Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This candidate does not exist in the active roster.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ← Back to Candidate Directory
          </button>
        </div>
      </div>
    );
  }

  const applicantName = application.name || application.studentName || 'Unnamed Candidate';
  const applicantTitle = application.jobTitle || application.courseTitle || 'Unassigned Role';
  const currentStatus = application.stage || application.status || 'Pending';
  const categoryOrDept = application.department || application.courseCategory || 'Engineering';

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Applications Roster
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <Printer size={13} />
            <span>Print Dossier</span>
          </button>

          <button
            type="button"
            onClick={fetchApplicationData}
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
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-blue-700 hover:bg-blue-100 transition cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-100 transition cursor-pointer"
              >
                <Trash2 size={13} />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Candidate Banner Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            {/* Initials Avatar Badge */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white font-heading font-black text-2xl shadow-md border-2 border-white">
              {applicantName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {applicantName}
                </h1>
                
                {/* Candidate Type Badge */}
                <span className={`rounded-full px-3 py-0.5 text-xs font-extrabold uppercase tracking-wider ${
                  appType === 'course' ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                  {appType === 'course' ? '🎓 Course Candidate' : '💼 Job Candidate'}
                </span>

                {/* Status Pill */}
                <span
                  className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${
                    ['Hired', 'Enrolled', 'Approved', 'Completed'].includes(currentStatus)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : currentStatus === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentStatus}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="font-semibold text-sm text-slate-700">{applicantTitle}</span>
                <span className="text-slate-300">•</span>
                <span className="text-xs text-slate-500 font-mono font-medium">{categoryOrDept}</span>
              </div>

              {/* Quick Contact & Dates */}
              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <a href={`mailto:${application.email}`} className="flex items-center gap-1 hover:text-blue-600 transition font-medium">
                  <Mail size={13} className="text-slate-400" /> {application.email}
                </a>
                <a href={`tel:${application.phone}`} className="flex items-center gap-1 hover:text-blue-600 transition font-medium">
                  <Phone size={13} className="text-slate-400" /> {application.phone}
                </a>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <Calendar size={13} /> Applied: {new Date(application.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Rating & Quick Actions */}
          <div className="flex flex-col items-start md:items-end gap-3 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            {/* Star Rating */}
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">Rating:</span>
              <div className="flex text-amber-400 cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => {
                      setRating(star);
                      if (canManage) handleQuickSaveNotes();
                    }}
                    className={`text-lg transition hover:scale-125 ${star <= rating ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-xs font-bold text-slate-700 font-mono">({rating}/5)</span>
            </div>

            {/* Stage Quick Action Buttons */}
            {canManage && (
              <div className="flex flex-wrap items-center gap-2">
                {appType === 'job' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Screening')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Screening' ? 'bg-amber-500 text-white border-amber-600' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      Screening
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Technical Round 2')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Technical Round 2' ? 'bg-indigo-600 text-white border-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
                    >
                      Tech Round
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Offer Sent')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Offer Sent' ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                    >
                      Offer Sent
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Hired')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Hired' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      Hire Candidate
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Rejected')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Rejected' ? 'bg-rose-600 text-white border-rose-700' : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      Reject
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Approved')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Approved' ? 'bg-blue-600 text-white border-blue-700' : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'}`}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Enrolled')}
                      className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Enrolled' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'}`}
                    >
                      Enroll Student
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Completed')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Completed' ? 'bg-purple-600 text-white border-purple-700' : 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'}`}
                    >
                      Mark Completed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateStage('Rejected')}
                      className={`rounded-xl border px-3 py-1.5 text-xs font-bold cursor-pointer transition ${currentStatus === 'Rejected' ? 'bg-rose-600 text-white border-rose-700' : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'}`}
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Details Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Detailed Dossier & Profile Data */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck size={18} className="text-blue-600" />
              <h3 className="font-heading text-base font-bold text-slate-900">Candidate Information Dossier</h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-slate-400 uppercase">
              ID: {application._id.substring(application._id.length - 8)}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Candidate Name</span>
              <span className="font-bold text-slate-900">{applicantName}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Email Address</span>
              <span className="font-bold text-blue-600">{application.email}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Phone Number</span>
              <span className="font-bold text-slate-900">{application.phone}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Target Position / Program</span>
              <span className="font-bold text-slate-900">{applicantTitle}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Experience / Background</span>
              <span className="font-bold text-slate-900">{application.experience || application.experienceLevel || 'Fresher / Entry Level'}</span>
            </div>

            {application.qualification && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Qualification / Degree</span>
                <span className="font-bold text-slate-900">{application.qualification}</span>
              </div>
            )}

            {(application.currentCompany || application.collegeOrCompany) && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">University / Employer</span>
                <span className="font-bold text-slate-900">{application.currentCompany || application.collegeOrCompany}</span>
              </div>
            )}

            {appType === 'job' && application.expectedCTC && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Expected CTC</span>
                <span className="font-bold text-emerald-600 font-mono">{application.expectedCTC}</span>
              </div>
            )}

            {appType === 'job' && application.noticePeriod && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Notice Period</span>
                <span className="font-bold text-slate-900">{application.noticePeriod}</span>
              </div>
            )}

            {appType === 'course' && application.batch && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Cohort / Batch</span>
                <span className="font-bold text-purple-700">{application.batch}</span>
              </div>
            )}

            {appType === 'course' && application.modePreference && (
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Mode Preference</span>
                <span className="font-bold text-indigo-700">{application.modePreference}</span>
              </div>
            )}

            {/* Resume & Portfolio Links */}
            <div className="pt-2 flex flex-wrap gap-2">
              {application.resumeUrl ? (
                <a
                  href={application.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-3.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                >
                  <FileText size={14} /> View Resume Document <ExternalLink size={12} />
                </a>
              ) : (
                <span className="text-slate-400 font-mono text-[11px] italic">No resume attached</span>
              )}

              {application.portfolioUrl && (
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-purple-50 border border-purple-200 px-3.5 py-1.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition"
                >
                  <ExternalLink size={14} /> View Portfolio / Profile
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: Course Financials & Progress OR Job Specifics */}
        <div className="space-y-6">
          {appType === 'course' ? (
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard size={18} className="text-emerald-600" />
                  <h3 className="font-heading text-base font-bold text-slate-900">Fees & Learning Progress</h3>
                </div>

                <span className={`rounded-full px-3 py-0.5 text-xs font-extrabold ${
                  feesStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  Fees: {feesStatus}
                </span>
              </div>

              {/* Fee Amount & Payment Status Control */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold">Course Fee Amount</span>
                  <span className="font-heading font-black text-lg text-slate-900">₹{feesAmount.toLocaleString('en-IN')}</span>
                </div>

                {canManage && (
                  <div>
                    <span className="text-slate-400 block text-[10px] font-mono uppercase font-bold mb-1">Update Fee Status</span>
                    <select
                      value={feesStatus}
                      onChange={(e) => {
                        setFeesStatus(e.target.value);
                        courseApi.updateCourseApplicationStatus(application._id, { feesStatus: e.target.value });
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Payment Receipt Gateway Details (if exists) */}
              {application.paymentDetails && (application.paymentDetails.razorpayPaymentId || application.paymentDetails.razorpayOrderId) && (
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-3.5 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-800 font-bold font-mono">
                    <ShieldCheck size={14} /> Razorpay Online Transaction Receipt
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1">
                    <div>
                      <span className="text-slate-400 block font-mono">Payment ID</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">{application.paymentDetails.razorpayPaymentId || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Order ID</span>
                      <span className="font-mono font-bold text-slate-900 truncate block">{application.paymentDetails.razorpayOrderId || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Learning Progress Slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <BookOpen size={14} className="text-purple-600" /> Learning Progress:
                  </span>
                  <span className="font-mono font-black text-sm text-purple-700">{progress}%</span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
                  <div
                    className="bg-gradient-to-r from-blue-600 via-purple-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {canManage && (
                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Set Progress:</span>
                    {[0, 25, 50, 75, 100].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => handleUpdateProgress(val)}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-mono font-bold transition cursor-pointer ${
                          progress === val ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Certificate Issued Control */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900 block">Certificate Status</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {certificateIssued ? 'Official Certificate Issued to Student' : 'Not Issued Yet'}
                  </span>
                </div>

                {canManage && (
                  <button
                    type="button"
                    onClick={handleToggleCertificate}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition cursor-pointer ${
                      certificateIssued
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Award size={14} />
                    <span>{certificateIssued ? 'Certificate Issued ✓' : 'Issue Certificate 🎓'}</span>
                  </button>
                )}
              </div>
            </div>
          ) : null}

          {/* Statement / Cover Letter Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-2">
              <FileText size={18} className="text-purple-600" />
              <h3 className="font-heading text-base font-bold text-slate-900">
                {appType === 'job' ? 'Candidate Cover Statement' : 'Student Learning Objective'}
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic font-medium">
              "{application.coverLetter || application.learningGoal || 'No additional cover statement provided with application.'}"
            </p>
          </div>

          {/* HR Review Notes & Evaluation Notes Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-base font-bold text-slate-900">HR Review & Evaluation Notes</h3>
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Internal</span>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Record evaluation feedback, interview scores, salary expectations, or batch notes..."
              className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />

            {canManage && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleQuickSaveNotes}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <Send size={12} />
                  <span>Save Review Notes</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT CANDIDATE PROFILE MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-bold text-slate-900">Edit Candidate Profile</h3>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="mt-4 space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.name || editForm.studentName || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value, studentName: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={editForm.email || ''}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Target Title */}
              <div>
                <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                  Target Title / Program *
                </label>
                <input
                  type="text"
                  required
                  value={editForm.jobTitle || editForm.courseTitle || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, jobTitle: e.target.value, courseTitle: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Experience & University */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    Experience / Level
                  </label>
                  <input
                    type="text"
                    value={editForm.experience || editForm.experienceLevel || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        experience: e.target.value,
                        experienceLevel: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                    College / Company
                  </label>
                  <input
                    type="text"
                    value={editForm.currentCompany || editForm.collegeOrCompany || ''}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        currentCompany: e.target.value,
                        collegeOrCompany: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Course-specific edits */}
              {appType === 'course' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                      Fees Status
                    </label>
                    <select
                      value={editForm.feesStatus || 'Unpaid'}
                      onChange={(e) => setEditForm({ ...editForm, feesStatus: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="Unpaid">Unpaid</option>
                      <option value="Paid">Paid</option>
                      <option value="Partial">Partial</option>
                      <option value="Scholarship">Scholarship</option>
                      <option value="Waived">Waived</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                      Course Fee (₹)
                    </label>
                    <input
                      type="number"
                      value={editForm.feesAmount || 0}
                      onChange={(e) => setEditForm({ ...editForm, feesAmount: Number(e.target.value) })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>
                </div>
              )}

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
                  Save Profile Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
