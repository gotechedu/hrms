import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  GraduationCap,
  BookOpen,
  Video,
  Clock,
  CheckCircle2,
  Calendar,
  Award,
  ChevronRight,
  ExternalLink,
  ClipboardList,
  AlertCircle,
  FileText,
  Upload,
  Play,
  Lock,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { lmsApi } from '../../Service/lmsApi';

export default function TraineeLearningHub() {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses' | 'classes' | 'assignments' | 'assessments' | 'attendance' | 'certificates'
  
  const [enrollments, setEnrollments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Submit Assignment Modal
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submitForm, setSubmitForm] = useState({
    linkUrl: '',
    fileUrl: '',
    fileName: '',
    textContent: '',
  });

  // Quiz Taking Modal
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  useEffect(() => {
    loadTraineeDashboard();
  }, []);

  const loadTraineeDashboard = async () => {
    try {
      setLoading(true);
      const [enrRes, classRes, assignRes, assessRes, attRes, certRes] = await Promise.all([
        lmsApi.getMyEnrollments(),
        lmsApi.getClasses(),
        lmsApi.getAssignments(),
        lmsApi.getAssessments(),
        lmsApi.getMyAttendance(),
        lmsApi.getCertificates(),
      ]);

      if (enrRes?.enrollments) setEnrollments(enrRes.enrollments);
      if (classRes?.classes) setClasses(classRes.classes);
      if (assignRes?.assignments) setAssignments(assignRes.assignments);
      if (assessRes?.assessments) setAssessments(assessRes.assessments);
      if (attRes) setAttendanceData(attRes);
      if (certRes?.certificates) setCertificates(certRes.certificates);
    } catch (err) {
      console.error('Failed to load trainee data:', err);
      toast.error('Failed to retrieve learning portal data');
    } finally {
      setLoading(false);
    }
  };

  // --- Assignment Submission ---
  const handleOpenSubmit = (assign) => {
    setSelectedAssignment(assign);
    setSubmitForm({
      linkUrl: assign.mySubmission?.linkUrl || '',
      fileUrl: assign.mySubmission?.fileUrl || '',
      fileName: assign.mySubmission?.fileName || '',
      textContent: assign.mySubmission?.textContent || '',
    });
    setIsSubmitModalOpen(true);
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!submitForm.linkUrl && !submitForm.fileUrl && !submitForm.textContent) {
      toast.error('Please provide a repository link, file URL, or written solution');
      return;
    }

    try {
      await lmsApi.submitAssignment(selectedAssignment._id, submitForm);
      toast.success('Assignment submitted successfully!');
      setIsSubmitModalOpen(false);
      loadTraineeDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to submit assignment');
    }
  };

  // --- Quiz Attempt ---
  const handleStartQuiz = async (quiz) => {
    try {
      const res = await lmsApi.getAssessmentById(quiz._id);
      if (res?.assessment) {
        setActiveQuiz(res.assessment);
        setQuizAnswers({});
        setQuizResult(null);
        setIsQuizModalOpen(true);
      }
    } catch (err) {
      toast.error('Failed to start assessment');
    }
  };

  const handleSubmitQuiz = async () => {
    if (!activeQuiz) return;
    try {
      setSubmittingQuiz(true);
      const formattedAnswers = Object.entries(quizAnswers).map(([qId, val]) => ({
        questionId: qId,
        selectedOptionIndex: typeof val === 'number' ? val : undefined,
        textAnswer: typeof val === 'string' ? val : undefined,
      }));

      const res = await lmsApi.submitAssessmentAttempt(activeQuiz._id, {
        answers: formattedAnswers,
      });

      if (res?.result) {
        setQuizResult(res.result);
        loadTraineeDashboard();
      }
    } catch (err) {
      toast.error(err.message || 'Failed to submit quiz attempt');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const nextUpcomingClass = classes.find((c) => new Date(c.sessionDate) >= new Date());

  return (
    <div className="space-y-6 font-sans">
      {/* Trainee Welcome Header */}
      <div className="rounded-3xl border border-slate-200/90 bg-gradient-to-r from-blue-50/90 via-indigo-50/50 to-white p-6 sm:p-8 relative overflow-hidden shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100/70 border border-blue-200 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5 text-blue-600" />
              Trainee Learning Space
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Welcome back, {user?.name || 'Learner'}!
            </h1>
            <p className="text-xs text-slate-500 max-w-xl mt-1">
              Track your coursework, join live mentor lectures, advance lessons, and earn certified industry credentials.
            </p>
          </div>

          {/* Next class card preview */}
          {nextUpcomingClass && (
            <div className="rounded-2xl border border-blue-200/90 bg-white/95 p-4 max-w-sm shadow-xs backdrop-blur-md">
              <span className="text-[10px] font-mono uppercase tracking-wider text-blue-700 font-bold block">
                Next Live Session
              </span>
              <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
                {nextUpcomingClass.title}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 font-medium">
                {new Date(nextUpcomingClass.sessionDate).toLocaleDateString()} at {nextUpcomingClass.startTime}
              </p>
              {nextUpcomingClass.meetingUrl && (
                <a
                  href={nextUpcomingClass.meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
                >
                  <Video className="h-3.5 w-3.5" />
                  <span>Join Class Meeting</span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-slate-400 block">Enrolled Courses</span>
          <span className="font-heading text-2xl font-black text-slate-900 mt-1 block">
            {enrollments.length}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-emerald-600 block">Live Classes</span>
          <span className="font-heading text-2xl font-black text-emerald-600 mt-1 block">
            {classes.length}
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-purple-600 block">Attendance Score</span>
          <span className="font-heading text-2xl font-black text-purple-600 mt-1 block">
            {attendanceData?.stats?.overallPercentage ?? 100}%
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <span className="text-[11px] font-mono font-bold uppercase text-amber-600 block">Certificates Earned</span>
          <span className="font-heading text-2xl font-black text-amber-600 mt-1 block">
            {certificates.length}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-bold overflow-x-auto">
        {[
          { key: 'courses', label: `My Courses (${enrollments.length})`, icon: BookOpen },
          { key: 'classes', label: `Live Classes (${classes.length})`, icon: Video },
          { key: 'assignments', label: `Assignments (${assignments.length})`, icon: ClipboardList },
          { key: 'assessments', label: `Assessments (${assessments.length})`, icon: Award },
          { key: 'attendance', label: `Attendance`, icon: Calendar },
          { key: 'certificates', label: `Certificates (${certificates.length})`, icon: GraduationCap },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 border-b-2 whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                isActive
                  ? 'border-blue-600 text-blue-700 bg-blue-50/40'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: MY COURSES */}
      {activeTab === 'courses' && (
        <div className="space-y-4">
          {enrollments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500 font-medium">
              You do not have any active course enrollments yet.{' '}
              <a
                href="https://gotechedu.com/learninghub"
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 hover:underline font-bold"
              >
                Browse Course Catalog
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrollments.map((enr) => {
                const course = enr.course || {};
                const batch = enr.batch || {};
                return (
                  <div
                    key={enr._id}
                    className="flex flex-col rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4 hover:border-blue-300 hover:shadow-md transition"
                  >
                    {/* Header Image or Category */}
                    <div className="relative h-36 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                      {course.image ? (
                        <img
                          src={course.image}
                          alt={course.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg p-4 text-center">
                          {course.title}
                        </div>
                      )}
                      <span className="absolute top-2.5 right-2.5 rounded-full bg-white/95 backdrop-blur-xs px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200 shadow-2xs">
                        {batch.batchCode || 'COHORT'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase text-blue-600 font-bold block">
                        {course.category || 'Professional Track'}
                      </span>
                      <h3 className="font-heading text-sm font-extrabold text-slate-900 line-clamp-1">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                        Batch: {batch.name || 'Current Cohort'}
                      </p>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 py-2 border-t border-b border-slate-100">
                      <div className="flex justify-between text-xs text-slate-500 font-medium">
                        <span>Course Progress</span>
                        <span className="font-mono font-bold text-slate-900">
                          {enr.progressPercentage || 0}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                          style={{ width: `${enr.progressPercentage || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-1 flex items-center justify-between">
                      <button
                        onClick={() => navigate(`/learninghub/player/${enr._id}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer active:scale-98"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>Continue Learning</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE CLASSES */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {classes.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500 font-medium">
              No live classes scheduled at this time.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c) => (
                <div
                  key={c._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-5 space-y-3 shadow-2xs hover:border-blue-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                        {c.batch?.name || 'Cohort'}
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1">{c.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                    </div>
                    <span className="rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 text-[10px] font-bold">
                      {c.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 py-2.5 border-t border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-blue-600" />
                      <span>{new Date(c.sessionDate).toLocaleDateString()}</span>
                      <span>•</span>
                      <Clock className="h-3.5 w-3.5 text-purple-600" />
                      <span>
                        {c.startTime} — {c.endTime}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    {c.meetingUrl ? (
                      <a
                        href={c.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm shadow-blue-500/20"
                      >
                        <Video className="h-3.5 w-3.5" />
                        <span>Join Live Classroom</span>
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 font-medium">Meeting link will be shared prior to class</span>
                    )}

                    {c.recordingUrl && (
                      <a
                        href={c.recordingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-purple-600 hover:underline inline-flex items-center gap-1"
                      >
                        <span>View Recording</span>
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

      {/* TAB 3: ASSIGNMENTS */}
      {activeTab === 'assignments' && (
        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500 font-medium">
              No assignments published yet for your courses.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((a) => {
                const sub = a.mySubmission;
                return (
                  <div
                    key={a._id}
                    className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs space-y-3.5 hover:border-purple-300 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-md">
                          {a.course?.title || 'Coursework'}
                        </span>
                        <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1">{a.title}</h4>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          sub?.status === 'Graded'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sub?.status === 'Submitted'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {sub?.status || 'Not Submitted'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">{a.instructions || a.description}</p>

                    <div className="text-xs text-slate-500 py-2.5 border-t border-b border-slate-100 flex items-center justify-between font-medium">
                      <span>Due: {new Date(a.dueDate).toLocaleDateString()}</span>
                      <span>Max Marks: {a.maxMarks}</span>
                    </div>

                    {sub?.marksObtained !== undefined && sub?.marksObtained !== null && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 text-xs">
                        <div className="flex justify-between font-bold text-emerald-800">
                          <span>Grade Awarded:</span>
                          <span>{sub.marksObtained} / {a.maxMarks}</span>
                        </div>
                        {sub.feedback && (
                          <p className="mt-1 text-[11px] text-emerald-900/80 italic">
                            Trainer Feedback: "{sub.feedback}"
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleOpenSubmit(a)}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition cursor-pointer"
                      >
                        {sub ? 'Resubmit / Edit Solution' : 'Submit Solution'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ASSESSMENTS */}
      {activeTab === 'assessments' && (
        <div className="space-y-4">
          {assessments.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500 font-medium">
              No assessments published yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assessments.map((quiz) => (
                <div
                  key={quiz._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-3.5 shadow-2xs hover:border-purple-300 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                        {quiz.type || 'Quiz'}
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900 mt-1">{quiz.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1">{quiz.description}</p>
                    </div>
                    {quiz.hasPassed && (
                      <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold">
                        PASSED ({quiz.bestScore}%)
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-500 py-2.5 border-t border-b border-slate-100 flex items-center justify-between font-medium">
                    <span>Duration: {quiz.durationMinutes} mins</span>
                    <span>Passing: {quiz.passingPercentage}%</span>
                    <span>Attempts: {quiz.attemptsCount || 0}</span>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 transition cursor-pointer"
                    >
                      {quiz.hasPassed ? 'Retake Quiz' : 'Start Assessment'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 space-y-4 shadow-2xs">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Your Live Lecture Attendance Records</h3>
              <p className="text-xs text-slate-500">Attendance is marked during live video lecture sessions.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              Overall: {attendanceData?.stats?.overallPercentage ?? 100}%
            </span>
          </div>

          {(attendanceData?.records || []).length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">
              No class attendance records logged yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {attendanceData.records.map((r) => (
                <div key={r._id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{r.classSession?.title || 'Class Session'}</span>
                    <span className="text-slate-400 text-[11px]">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                      r.status === 'Present'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : r.status === 'Late'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: CERTIFICATES */}
      {activeTab === 'certificates' && (
        <div className="space-y-4">
          {certificates.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-xs text-slate-500 font-medium">
              No certificates issued yet. Complete all lessons and assessments in a course to qualify for graduation.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {certificates.map((cert) => (
                <div
                  key={cert._id}
                  className="rounded-3xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 p-6 space-y-4 shadow-2xs hover:border-emerald-300 hover:shadow-md transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold uppercase block">
                        Verified Credential
                      </span>
                      <h4 className="font-heading text-sm font-extrabold text-slate-900">{cert.courseTitle}</h4>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 py-2.5 border-t border-b border-slate-100 font-medium">
                    <div>Recipient: <strong className="text-slate-900">{cert.traineeName}</strong></div>
                    <div>Certificate ID: <span className="font-mono text-blue-700 font-bold">{cert.certificateId}</span></div>
                    <div>Issue Date: {new Date(cert.issueDate).toLocaleDateString()}</div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`https://gotechedu.com/verify/${cert.verificationCode}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                    >
                      <span>Public Verification Link</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                    <button
                      onClick={() => window.print()}
                      className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm shadow-emerald-600/20 cursor-pointer transition"
                    >
                      Print Diploma
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: SUBMIT ASSIGNMENT */}
      {isSubmitModalOpen && selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                Submit Solution: {selectedAssignment.title}
              </h3>
              <button onClick={() => setIsSubmitModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  GitHub Repository or Live Demo URL
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/your-name/project-solution"
                  value={submitForm.linkUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, linkUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Cloud File Attachment URL (Google Drive, Dropbox, ZIP, or PDF)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/..."
                  value={submitForm.fileUrl}
                  onChange={(e) => setSubmitForm({ ...submitForm, fileUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Notes & Approach Explanation
                </label>
                <textarea
                  rows={4}
                  placeholder="Explain your architectural decisions and how to test your solution..."
                  value={submitForm.textContent}
                  onChange={(e) => setSubmitForm({ ...submitForm, textContent: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition"
                >
                  Submit for Evaluation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: TAKE QUIZ */}
      {isQuizModalOpen && activeQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-700">
                  {activeQuiz.type || 'Knowledge Assessment'}
                </span>
                <h3 className="font-heading text-base font-extrabold text-slate-900">{activeQuiz.title}</h3>
              </div>
              <button onClick={() => setIsQuizModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
              {quizResult ? (
                <div className="text-center py-8 space-y-4">
                  <div
                    className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center text-3xl font-bold ${
                      quizResult.isPassed
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {quizResult.isPassed ? '✓' : '✕'}
                  </div>
                  <h3 className="font-heading text-xl font-extrabold text-slate-900">
                    {quizResult.isPassed ? 'Assessment Passed!' : 'Assessment Not Passed'}
                  </h3>
                  <p className="text-sm text-slate-600">
                    You scored <strong className="text-slate-900">{quizResult.score}</strong> out of{' '}
                    <strong className="text-slate-900">{quizResult.totalPoints}</strong> ({quizResult.percentage}%).
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Passing Threshold: {quizResult.passingPercentage}%
                  </p>
                </div>
              ) : (
                (activeQuiz.questions || []).map((q, idx) => (
                  <div key={q._id || idx} className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-xs font-mono font-bold text-purple-700">
                        {idx + 1}
                      </span>
                      <p className="text-sm font-bold text-slate-900">{q.questionText}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      {(q.options || []).map((opt, optIdx) => (
                        <label
                          key={opt._id || optIdx}
                          className={`flex items-center gap-3 rounded-xl border p-3 cursor-pointer text-xs transition ${
                            quizAnswers[q._id] === optIdx
                              ? 'border-purple-600 bg-purple-50 text-purple-950 font-bold shadow-2xs'
                              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question_${q._id}`}
                            checked={quizAnswers[q._id] === optIdx}
                            onChange={() => setQuizAnswers({ ...quizAnswers, [q._id]: optIdx })}
                            className="text-purple-600 focus:ring-purple-500"
                          />
                          <span>{opt.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex justify-end gap-3 text-xs">
              <button
                onClick={() => setIsQuizModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-slate-700 font-bold hover:bg-slate-50 transition cursor-pointer"
              >
                Close
              </button>
              {!quizResult && (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={submittingQuiz}
                  className="rounded-xl bg-purple-600 px-6 py-2 font-bold text-white hover:bg-purple-700 shadow-sm shadow-purple-500/20 cursor-pointer transition disabled:opacity-50"
                >
                  {submittingQuiz ? 'Grading...' : 'Submit Answers'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
