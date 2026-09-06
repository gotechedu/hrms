import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  FileText,
  Award,
  BookOpen,
  Plus,
  Search,
  ExternalLink,
  ChevronRight,
  ClipboardList,
  AlertCircle,
  Sparkles,
  X,
  Send,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { lmsApi } from '../../Service/lmsApi';

export default function TrainerHub() {
  const [activeTab, setActiveTab] = useState('batches'); // 'batches' | 'classes' | 'attendance' | 'assignments'
  const [dashboardStats, setDashboardStats] = useState(null);
  const [batches, setBatches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Class Scheduling Modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [classForm, setClassForm] = useState({
    title: '',
    batchId: '',
    sessionDate: '',
    startTime: '19:30',
    endTime: '21:30',
    meetingProvider: 'Google Meet',
    meetingUrl: '',
    description: '',
  });

  // Attendance Marking State
  const [selectedClassForAttendance, setSelectedClassForAttendance] = useState(null);
  const [attendanceRoster, setAttendanceRoster] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  // Assignment Grading Modal
  const [selectedAssignmentForGrading, setSelectedAssignmentForGrading] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradingForm, setGradingForm] = useState({ marksObtained: 90, feedback: '', status: 'Graded' });

  // Create Assignment Modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    instructions: '',
    courseId: '',
    batchId: '',
    dueDate: '',
    maxMarks: 100,
    passingMarks: 50,
  });

  useEffect(() => {
    loadTrainerData();
  }, []);

  const loadTrainerData = async () => {
    try {
      setLoading(true);
      const [statsRes, batchesRes, classesRes, assignRes] = await Promise.all([
        lmsApi.getTrainerDashboardStats(),
        lmsApi.getBatches(),
        lmsApi.getClasses(),
        lmsApi.getAssignments(),
      ]);

      if (statsRes) setDashboardStats(statsRes);
      if (batchesRes?.batches) setBatches(batchesRes.batches);
      if (classesRes?.classes) setClasses(classesRes.classes);
      if (assignRes?.assignments) setAssignments(assignRes.assignments);
    } catch (err) {
      console.error('Failed to load trainer data:', err);
      toast.error('Failed to load instructor dashboard');
    } finally {
      setLoading(false);
    }
  };

  // --- Class Scheduling ---
  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!classForm.title || !classForm.batchId || !classForm.sessionDate) {
      toast.error('Please enter class title, batch, and date');
      return;
    }

    try {
      await lmsApi.createClass(classForm);
      toast.success('Live class scheduled successfully!');
      setIsClassModalOpen(false);
      loadTrainerData();
    } catch (err) {
      toast.error(err.message || 'Failed to schedule class');
    }
  };

  // --- Attendance ---
  const handleOpenAttendance = async (classSession) => {
    setSelectedClassForAttendance(classSession);
    try {
      setLoadingAttendance(true);
      const res = await lmsApi.getClassAttendance(classSession._id);
      if (res?.roster) {
        setAttendanceRoster(
          res.roster.map((r) => ({
            traineeId: r.trainee._id,
            name: r.trainee.name,
            email: r.trainee.email,
            status: r.attendance?.status === 'Unmarked' ? 'Present' : r.attendance?.status || 'Present',
            remarks: r.attendance?.remarks || '',
          }))
        );
      }
    } catch (err) {
      toast.error('Failed to load class attendance');
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassForAttendance) return;
    try {
      await lmsApi.markClassAttendance({
        classId: selectedClassForAttendance._id,
        attendanceRecords: attendanceRoster,
      });
      toast.success('Attendance recorded and student metrics updated!');
      setSelectedClassForAttendance(null);
    } catch (err) {
      toast.error(err.message || 'Failed to submit attendance');
    }
  };

  // --- Grading ---
  const handleViewSubmissions = async (assignment) => {
    setSelectedAssignmentForGrading(assignment);
    try {
      setLoadingSubmissions(true);
      const res = await lmsApi.getAssignmentSubmissions(assignment._id);
      if (res?.submissions) {
        setSubmissions(res.submissions);
      }
    } catch (err) {
      toast.error('Failed to load student submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (e) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    try {
      await lmsApi.gradeSubmission(gradingSubmission._id, gradingForm);
      toast.success('Grade and feedback submitted to student!');
      setGradingSubmission(null);
      // Reload submissions
      handleViewSubmissions(selectedAssignmentForGrading);
    } catch (err) {
      toast.error(err.message || 'Failed to grade submission');
    }
  };

  // --- Create Assignment ---
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!assignmentForm.title || !assignmentForm.batchId || !assignmentForm.dueDate) {
      toast.error('Please enter title, batch, and due date');
      return;
    }
    const matchedBatch = batches.find((b) => b._id === assignmentForm.batchId);
    try {
      await lmsApi.createAssignment({
        ...assignmentForm,
        courseId: matchedBatch?.course?._id || matchedBatch?.course,
      });
      toast.success('Assignment created!');
      setIsAssignmentModalOpen(false);
      loadTrainerData();
    } catch (err) {
      toast.error(err.message || 'Failed to create assignment');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-md">
            Trainer & Instructor Workspace
          </span>
          <h2 className="font-heading text-xl font-extrabold text-slate-900 mt-1">
            Instructor Command Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your assigned cohorts, schedule live lectures, take attendance, and evaluate coursework.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setClassForm((prev) => ({ ...prev, batchId: batches[0]?._id || '' }));
              setIsClassModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/20 cursor-pointer"
          >
            <Video className="h-4 w-4" />
            <span>Schedule Class</span>
          </button>
          <button
            onClick={() => {
              setAssignmentForm((prev) => ({ ...prev, batchId: batches[0]?._id || '' }));
              setIsAssignmentModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 transition shadow-sm shadow-purple-500/20 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>New Assignment</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">Assigned Batches</span>
          <span className="font-heading text-2xl font-black text-slate-900 mt-1 block">
            {dashboardStats?.stats?.activeBatchesCount ?? batches.length}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-blue-600 block">Total Trainees</span>
          <span className="font-heading text-2xl font-black text-blue-600 mt-1 block">
            {dashboardStats?.stats?.totalTrainees ?? 0}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600 block">Upcoming Classes</span>
          <span className="font-heading text-2xl font-black text-emerald-600 mt-1 block">
            {classes.filter((c) => new Date(c.sessionDate) >= new Date()).length}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-600 block">Pending Grading</span>
          <span className="font-heading text-2xl font-black text-amber-600 mt-1 block">
            {dashboardStats?.stats?.pendingSubmissionsCount ?? 0}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold">
        <button
          onClick={() => setActiveTab('batches')}
          className={`px-5 py-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'batches'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Assigned Batches ({batches.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`px-5 py-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'classes'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Live Class Sessions ({classes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`px-5 py-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'assignments'
              ? 'border-blue-600 text-blue-700 bg-blue-50/40'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Assignments & Grading ({assignments.length})</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED BATCHES */}
      {activeTab === 'batches' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((b) => (
            <div
              key={b._id}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-4 hover:border-blue-300 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                    {b.batchCode}
                  </span>
                  <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1.5">{b.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-1 font-medium">{b.course?.title}</p>
                </div>
                <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                  {b.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3.5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>
                    {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-purple-600" />
                  <span>
                    {(b.scheduleDays || []).join(', ')} • {b.startTime} - {b.endTime}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-emerald-600" />
                  <span>
                    {b.enrolledCount || 0} / {b.capacity} Trainees Enrolled
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => {
                    setClassForm((prev) => ({ ...prev, batchId: b._id }));
                    setIsClassModalOpen(true);
                  }}
                  className="rounded-xl bg-blue-50 text-blue-700 border border-blue-200 px-3.5 py-1.5 text-xs font-bold hover:bg-blue-100 transition cursor-pointer"
                >
                  Schedule Class
                </button>
                {b.meetingLink && (
                  <a
                    href={b.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline transition"
                  >
                    <span>Meeting Room</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: LIVE CLASSES */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Scheduled Live Class Sessions
            </h3>
            <button
              onClick={() => setIsClassModalOpen(true)}
              className="rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer"
            >
              + Add Class Session
            </button>
          </div>

          {classes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 text-xs">
              No classes scheduled yet. Click "Schedule Class" to book a live session.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c) => (
                <div
                  key={c._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3.5 hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        {c.batch?.name || 'Cohort'}
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1.5">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.description || 'Live interactive class'}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1.5 py-3 border-t border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span>{new Date(c.sessionDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <Clock className="h-3.5 w-3.5 text-purple-600" />
                      <span>
                        {c.startTime} — {c.endTime}
                      </span>
                    </div>
                    {c.meetingUrl && (
                      <div className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5 text-emerald-600" />
                        <a
                          href={c.meetingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline truncate"
                        >
                          {c.meetingUrl}
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleOpenAttendance(c)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 px-3.5 py-1.5 text-xs font-bold hover:bg-emerald-100 transition cursor-pointer"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Attendance</span>
                    </button>

                    {c.meetingUrl && (
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
                      >
                        <span>Join Session</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ASSIGNMENTS & GRADING */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
              Coursework & Submissions Inbox
            </h3>
            <button
              onClick={() => setIsAssignmentModalOpen(true)}
              className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 cursor-pointer"
            >
              + Create Assignment
            </button>
          </div>

          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500 text-xs">
              No assignments created yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3.5 hover:border-purple-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {a.batch?.name || a.course?.title || 'Coursework'}
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1.5">{a.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{a.description}</p>
                    </div>
                    <span className="rounded-full bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {a.maxMarks} Marks
                    </span>
                  </div>

                  <div className="text-xs text-slate-500 flex items-center gap-3 py-2.5 border-t border-b border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-amber-600" />
                      <span className="font-medium">Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                    </div>
                    <span>•</span>
                    <span className="font-medium">Pass: {a.passingMarks} Marks</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={() => handleViewSubmissions(a)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition cursor-pointer shadow-sm shadow-blue-500/20"
                    >
                      <ClipboardList className="h-3.5 w-3.5" />
                      <span>Review Submissions</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SCHEDULE CLASS */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                Schedule Live Class Lecture
              </h3>
              <button onClick={() => setIsClassModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Class Topic / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asynchronous Microtasks & Event Loop Architecture"
                  value={classForm.title}
                  onChange={(e) => setClassForm({ ...classForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Select Cohort Batch *
                </label>
                <select
                  required
                  value={classForm.batchId}
                  onChange={(e) => setClassForm({ ...classForm, batchId: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                >
                  <option value="">-- Choose Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.batchCode})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={classForm.sessionDate}
                    onChange={(e) => setClassForm({ ...classForm, sessionDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="19:30"
                    value={classForm.startTime}
                    onChange={(e) => setClassForm({ ...classForm, startTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Time
                  </label>
                  <input
                    type="text"
                    placeholder="21:30"
                    value={classForm.endTime}
                    onChange={(e) => setClassForm({ ...classForm, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Live Meeting URL (Google Meet / Zoom)
                </label>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={classForm.meetingUrl}
                  onChange={(e) => setClassForm({ ...classForm, meetingUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Agenda / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Brief summary of lecture topics..."
                  value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsClassModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition"
                >
                  Schedule Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ATTENDANCE ROSTER */}
      {selectedClassForAttendance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="flex h-[80vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700">
                  Learning Attendance Registry
                </span>
                <h3 className="font-heading text-base font-extrabold text-slate-900">
                  {selectedClassForAttendance.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Date: {new Date(selectedClassForAttendance.sessionDate).toLocaleDateString()} • Mark status for each trainee
                </p>
              </div>
              <button
                onClick={() => setSelectedClassForAttendance(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
              {loadingAttendance ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                  <p className="mt-3 text-xs font-medium text-slate-500">Loading class attendance roster...</p>
                </div>
              ) : attendanceRoster.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-medium">
                  No enrolled trainees found in this batch cohort.
                </div>
              ) : (
                attendanceRoster.map((item, idx) => (
                  <div
                    key={item.traineeId}
                    className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-2xs"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs block">{item.name}</span>
                      <span className="text-[11px] text-slate-500">{item.email}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {['Present', 'Absent', 'Late', 'Excused'].map((st) => (
                        <button
                          key={st}
                          type="button"
                          onClick={() => {
                            const updated = [...attendanceRoster];
                            updated[idx].status = st;
                            setAttendanceRoster(updated);
                          }}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
                            item.status === st
                              ? st === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : st === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-amber-500 text-white shadow-sm'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex items-center justify-between text-xs bg-slate-50/80">
              <span className="text-slate-600 font-medium">
                Present: <strong className="text-slate-900">{attendanceRoster.filter((r) => r.status === 'Present').length}</strong> / {attendanceRoster.length}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedClassForAttendance(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAttendance}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer transition"
                >
                  Save Attendance
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSIONS INBOX & GRADING */}
      {selectedAssignmentForGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="flex h-[85vh] w-full max-w-3xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                  Submissions Review & Evaluation
                </span>
                <h3 className="font-heading text-base font-extrabold text-slate-900">
                  {selectedAssignmentForGrading.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedAssignmentForGrading(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
              {loadingSubmissions ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium">
                  No submissions submitted yet by trainees.
                </div>
              ) : (
                submissions.map((sub) => (
                  <div
                    key={sub._id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-xs block">
                          {sub.trainee?.name || 'Trainee'}
                        </span>
                        <span className="text-[11px] text-slate-500">{sub.trainee?.email}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          sub.status === 'Graded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub.status}
                        {sub.marksObtained !== null && sub.marksObtained !== undefined
                          ? ` • ${sub.marksObtained} / ${selectedAssignmentForGrading.maxMarks}`
                          : ''}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 py-1 space-y-1.5">
                      {sub.linkUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px] font-mono font-bold">LINK:</span>
                          <a
                            href={sub.linkUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 hover:underline truncate font-medium"
                          >
                            {sub.linkUrl}
                          </a>
                        </div>
                      )}
                      {sub.fileUrl && (
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 text-[10px] font-mono font-bold">ATTACHMENT:</span>
                          <a
                            href={sub.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-emerald-600 hover:underline font-medium"
                          >
                            {sub.fileName || 'Download File'}
                          </a>
                        </div>
                      )}
                      {sub.textContent && (
                        <p className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 font-mono">
                          {sub.textContent}
                        </p>
                      )}
                      {sub.feedback && (
                        <p className="text-[11px] text-purple-700 bg-purple-50 border border-purple-100 rounded-lg p-2 italic">
                          Feedback: "{sub.feedback}"
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setGradingSubmission(sub);
                          setGradingForm({
                            marksObtained: sub.marksObtained ?? 85,
                            feedback: sub.feedback || 'Well structured implementation. Great attention to error handling.',
                            status: 'Graded',
                          });
                        }}
                        className="rounded-xl bg-purple-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 cursor-pointer"
                      >
                        {sub.status === 'Graded' ? 'Update Grade' : 'Grade Submission'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SUBMISSION GRADING DIALOG */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading text-sm font-extrabold text-slate-900">
                Grade {gradingSubmission.trainee?.name}'s Submission
              </h3>
              <button onClick={() => setGradingSubmission(null)} className="rounded-xl p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmission} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Marks Obtained (Out of {selectedAssignmentForGrading?.maxMarks || 100}) *
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedAssignmentForGrading?.maxMarks || 100}
                  required
                  value={gradingForm.marksObtained}
                  onChange={(e) =>
                    setGradingForm({ ...gradingForm, marksObtained: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-purple-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Feedback & Recommendations
                </label>
                <textarea
                  rows={3}
                  value={gradingForm.feedback}
                  onChange={(e) =>
                    setGradingForm({ ...gradingForm, feedback: e.target.value })
                  }
                  placeholder="Provide constructive feedback to the learner..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 cursor-pointer transition"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE ASSIGNMENT */}
      {isAssignmentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                Create Course Assignment
              </h3>
              <button onClick={() => setIsAssignmentModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Assignment Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Build an Omnichannel WebSocket Chat Server"
                  value={assignmentForm.title}
                  onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Cohort Batch *
                  </label>
                  <select
                    required
                    value={assignmentForm.batchId}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, batchId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none shadow-2xs"
                  >
                    <option value="">-- Choose Batch --</option>
                    {batches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Submission Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={assignmentForm.dueDate}
                    onChange={(e) => setAssignmentForm({ ...assignmentForm, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-purple-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Problem Statement & Instructions
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide specifications, github repo requirements, or rubric..."
                  value={assignmentForm.instructions}
                  onChange={(e) =>
                    setAssignmentForm({ ...assignmentForm, instructions: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAssignmentModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-purple-600 px-5 py-2 font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 cursor-pointer transition"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
