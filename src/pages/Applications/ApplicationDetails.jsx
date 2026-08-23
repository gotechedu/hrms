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
} from 'lucide-react';
import { applicationApi, courseApi } from '../../Service';

export default function ApplicationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [application, setApplication] = useState(null);
  const [appType, setAppType] = useState('job'); // 'job' | 'course'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(4);

  const userRole = (user?.role || '').toLowerCase();
  const canManage = ['superadmin', 'admin', 'hr', 'manager'].includes(userRole);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Attempt fetching from job applications first
      try {
        const res = await applicationApi.getJobApplications({ search: id });
        const found = res?.applications?.find((a) => a._id === id);
        if (found) {
          setApplication(found);
          setAppType('job');
          setNotes(found.notes || '');
          setRating(found.rating || 4);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Attempt fetching from course applications
      try {
        const resCourse = await courseApi.getCourseApplications({ search: id });
        const foundCourse = resCourse?.applications?.find((a) => a._id === id);
        if (foundCourse) {
          setApplication(foundCourse);
          setAppType('course');
          setNotes(foundCourse.notes || '');
          setLoading(false);
          return;
        }
      } catch (e) {}

      setError('Application record could not be found.');
    } catch (err) {
      console.error('Fetch App Details Error:', err);
      setError(err.message || 'Failed to load applicant details.');
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
        await applicationApi.updateJobApplicationStage(application._id, { stage: newStage, notes, rating });
      } else {
        await courseApi.updateCourseApplicationStatus(application._id, { status: newStage, notes });
      }
      fetchApplicationData();
    } catch (err) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to remove this application?')) {
      try {
        if (appType === 'job') {
          await applicationApi.deleteJobApplication(application._id);
        } else {
          await courseApi.deleteCourseApplication(application._id);
        }
        navigate('/applications');
      } catch (err) {
        alert(err.message || 'Error deleting application');
      }
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center animate-fadeIn">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        <p className="mt-4 font-mono text-xs font-bold text-slate-500">Retrieving applicant dossier from backend...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-2xs animate-fadeIn max-w-lg mx-auto my-12">
        <AlertCircle size={40} className="mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">{error || 'This application does not exist in the candidate roster.'}</p>
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            ← Back to Applications
          </button>
        </div>
      </div>
    );
  }

  const applicantName = application.name || application.studentName;
  const applicantTitle = application.jobTitle || application.courseTitle;
  const currentStatus = application.stage || application.status;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition shadow-2xs cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Applications
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchApplicationData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            <RefreshCw size={13} />
            <span>Refresh</span>
          </button>

          {canManage && (
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-rose-600 hover:bg-rose-100 transition cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {/* Hero Banner Card */}
      <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white font-heading font-black text-2xl shadow-md">
              {applicantName.substring(0, 2).toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                  {applicantName}
                </h1>
                <span className="rounded-md bg-blue-50 px-2.5 py-0.5 font-mono text-xs font-bold text-blue-700 border border-blue-100">
                  {applicantTitle}
                </span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    ['Hired', 'Enrolled', 'Approved'].includes(currentStatus)
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : currentStatus === 'Rejected'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {currentStatus}
                </span>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail size={13} className="text-slate-400" /> {application.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={13} className="text-slate-400" /> {application.phone}
                </span>
                <span className="flex items-center gap-1 font-mono text-slate-400">
                  <Calendar size={13} /> Applied: {new Date(application.createdAt).toLocaleDateString('en-GB')}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Stage Action Controls */}
          {canManage && (
            <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
              {appType === 'job' ? (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Screening')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Screening
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Technical Round 2')}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    Tech Round 2
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Offer Sent')}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Offer Sent
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Hired')}
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Hire
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Rejected')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Approved')}
                    className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Enrolled')}
                    className="rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 cursor-pointer"
                  >
                    Enroll Student
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStage('Rejected')}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 cursor-pointer"
                  >
                    Reject
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Structured Details Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Card 1: Applicant Profile Data */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
            <UserCheck size={18} className="text-blue-600" />
            <h3 className="font-heading text-base font-bold text-slate-900">Applicant Dossier Details</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Target Position / Program</span>
              <span className="font-bold text-slate-900">{applicantTitle}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-mono">Experience / Background</span>
              <span className="font-bold text-slate-900">{application.experience || application.experienceLevel}</span>
            </div>
            {application.currentCompany && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Current Employer</span>
                <span className="font-bold text-slate-900">{application.currentCompany}</span>
              </div>
            )}
            {application.expectedCTC && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Expected Compensation (CTC)</span>
                <span className="font-bold text-emerald-600 font-mono">{application.expectedCTC}</span>
              </div>
            )}
            {application.noticePeriod && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Notice Period</span>
                <span className="font-bold text-slate-900">{application.noticePeriod}</span>
              </div>
            )}
            {application.collegeOrCompany && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">University / Company</span>
                <span className="font-bold text-slate-900">{application.collegeOrCompany}</span>
              </div>
            )}
            {application.modePreference && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500 font-mono">Batch Preference</span>
                <span className="font-bold text-purple-700">{application.modePreference}</span>
              </div>
            )}
            {application.portfolioUrl && (
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500 font-mono">Portfolio / Profile</span>
                <a
                  href={application.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  View Link <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Cover Letter / Goal & Evaluation Notes */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4">
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3">
              <FileText size={18} className="text-purple-600" />
              <h3 className="font-heading text-base font-bold text-slate-900">
                {appType === 'job' ? 'Candidate Cover Statement' : 'Student Learning Objective'}
              </h3>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              "{application.coverLetter || application.learningGoal || 'No additional statement provided with application.'}"
            </p>
          </div>

          {/* HR Internal Notes */}
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1.5">
              HR Review Notes & Assessment
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add evaluation notes, interview feedback, or salary discussion notes..."
              className="w-full rounded-2xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => handleUpdateStage(currentStatus)}
                className="rounded-xl bg-slate-900 px-4 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition cursor-pointer"
              >
                Save Review Notes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
