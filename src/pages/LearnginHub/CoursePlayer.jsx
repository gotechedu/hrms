import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Lock,
  Play,
  Video,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Clock,
  Sparkles,
  Download,
  BookOpen,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { lmsApi } from '../../Service/lmsApi';

export default function CoursePlayer() {
  const { enrollmentId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [activeModuleIndex, setActiveModuleIndex] = useState(0);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    if (enrollmentId) {
      loadPlayerData();
    }
  }, [enrollmentId]);

  const loadPlayerData = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getCoursePlayer(enrollmentId);
      if (res && res.curriculum) {
        setData(res);

        // Find first unlocked incomplete lesson or default to first lesson
        let foundLesson = null;
        for (const mod of res.curriculum) {
          for (const les of mod.lessons || []) {
            if (les.isUnlocked && !les.isCompleted) {
              foundLesson = les;
              break;
            }
          }
          if (foundLesson) break;
        }

        if (!foundLesson && res.curriculum[0]?.lessons?.[0]) {
          foundLesson = res.curriculum[0].lessons[0];
        }

        setCurrentLesson(foundLesson);
      } else {
        toast.error('Could not load course player');
      }
    } catch (err) {
      console.error('Failed to load course player:', err);
      toast.error(err.message || 'Failed to open course player');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLesson = (lesson) => {
    if (!lesson.isUnlocked) {
      toast.error('🔒 Complete the previous lesson to unlock this content.');
      return;
    }
    setCurrentLesson(lesson);
  };

  const handleMarkComplete = async () => {
    if (!currentLesson) return;
    try {
      setMarkingComplete(true);
      const res = await lmsApi.markLessonComplete(enrollmentId, currentLesson._id, {
        watchTimeSeconds: 1800,
      });

      toast.success('🎉 Lesson completed! Progress updated.');

      // Reload player data and auto advance
      const refreshRes = await lmsApi.getCoursePlayer(enrollmentId);
      if (refreshRes && refreshRes.curriculum) {
        setData(refreshRes);

        // Find next lesson
        let foundNext = false;
        let nextLesson = null;
        for (const mod of refreshRes.curriculum) {
          for (const les of mod.lessons || []) {
            if (foundNext && les.isUnlocked) {
              nextLesson = les;
              break;
            }
            if (les._id === currentLesson._id) {
              foundNext = true;
            }
          }
          if (nextLesson) break;
        }

        if (nextLesson) {
          setCurrentLesson(nextLesson);
        } else if (res.isCourseCompleted) {
          toast.success('🏆 Congratulations! You have completed the entire course curriculum!');
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark lesson complete');
    } finally {
      setMarkingComplete(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 text-slate-900">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-xs font-semibold text-slate-500">Loading LMS Learning Path...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.course) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-6 text-slate-900 text-center">
        <h2 className="text-lg font-bold">Course enrollment not found</h2>
        <button
          onClick={() => navigate('/learninghub')}
          className="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
        >
          Return to Learning Hub
        </button>
      </div>
    );
  }

  const { course, batch, enrollment, curriculum } = data;

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
      {/* Top Player Header Bar */}
      <header className="flex h-16 items-center justify-between border-b border-slate-200/90 bg-white px-6 shadow-2xs z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/learninghub')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4 text-slate-500" />
            <span>Dashboard</span>
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block" />

          <div>
            <h1 className="font-heading text-sm sm:text-base font-extrabold text-slate-900 line-clamp-1">
              {course.title}
            </h1>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-1.5 py-0.5 rounded text-[10px]">
                {batch?.batchCode || 'COHORT'}
              </span>
              <span>•</span>
              <span>{batch?.name || 'Class Cohort'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress widget */}
          <div className="hidden sm:flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 shadow-2xs">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Progress</span>
              <span className="font-mono text-xs font-extrabold text-emerald-600">
                {enrollment?.progressPercentage || 0}%
              </span>
            </div>
            <div className="w-24 bg-slate-200 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${enrollment?.progressPercentage || 0}%` }}
              />
            </div>
          </div>

          {enrollment?.certificateEligible && (
            <span className="hidden md:inline-flex items-center gap-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 px-3 py-1.5 text-xs font-bold shadow-2xs">
              <Award className="h-4 w-4 text-amber-600" />
              <span>Certificate Eligible</span>
            </span>
          )}
        </div>
      </header>

      {/* Main Dual-Pane Learning Stage */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT PANE: CURRICULUM SYLLABUS NAVIGATION */}
        <aside className="w-80 sm:w-96 flex-shrink-0 border-r border-slate-200/90 bg-white flex flex-col overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/70">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
              Course Structure
            </span>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs font-extrabold text-slate-900">
                {curriculum.length} Modules •{' '}
                {curriculum.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
              </span>
              <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded px-2 py-0.5">
                {enrollment?.completedLessonsCount || 0} Completed
              </span>
            </div>
          </div>

          {/* Modules List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {curriculum.map((mod, mIdx) => (
              <div key={mod._id} className="bg-white">
                {/* Module Bar */}
                <div
                  onClick={() => setActiveModuleIndex(activeModuleIndex === mIdx ? -1 : mIdx)}
                  className="flex items-center justify-between p-3.5 cursor-pointer bg-slate-50/50 hover:bg-slate-100/70 transition select-none border-b border-slate-100"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-[11px] font-mono font-bold text-blue-700 border border-blue-200">
                      {mIdx + 1}
                    </span>
                    <div>
                      <h4 className="font-heading text-xs font-bold text-slate-900 line-clamp-1">
                        {mod.title}
                      </h4>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {mod.completedCount || 0} / {mod.lessonsCount || 0} done
                      </span>
                    </div>
                  </div>
                  {activeModuleIndex === mIdx ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                  )}
                </div>

                {/* Module Lessons */}
                {activeModuleIndex === mIdx && (
                  <div className="divide-y divide-slate-100 bg-white">
                    {(mod.lessons || []).map((les) => {
                      const isCurrent = currentLesson?._id === les._id;
                      return (
                        <div
                          key={les._id}
                          onClick={() => handleSelectLesson(les)}
                          className={`flex items-center justify-between px-4 py-3 cursor-pointer transition ${
                            isCurrent
                              ? 'bg-blue-50/90 border-l-4 border-blue-600 text-blue-950 font-bold shadow-2xs'
                              : les.isUnlocked
                              ? 'hover:bg-slate-50 text-slate-700'
                              : 'opacity-50 cursor-not-allowed text-slate-400 bg-slate-50/30'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {les.isCompleted ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            ) : les.isUnlocked ? (
                              <div
                                className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${
                                  isCurrent ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'
                                }`}
                              />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                            )}

                            <div>
                              <p
                                className={`text-xs ${
                                  isCurrent ? 'font-black text-blue-950' : 'font-medium text-slate-800'
                                } line-clamp-1`}
                              >
                                {les.title}
                              </p>
                              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 font-mono">
                                <span>{les.duration}</span>
                                <span>•</span>
                                <span className="capitalize">{les.contentType}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* RIGHT PANE: MAIN LESSON VIEWER STAGE */}
        <main className="flex-1 flex flex-col overflow-hidden bg-slate-50/70">
          {currentLesson ? (
            <div className="flex-1 flex flex-col overflow-y-auto">
              {/* Media Player Header */}
              <div className="p-6 border-b border-slate-200/90 bg-white shadow-2xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded">
                      Lesson Stage
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
                      {currentLesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 font-medium">
                      Estimated Duration: {currentLesson.duration} • Format: <span className="capitalize font-bold text-slate-700">{currentLesson.contentType}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleMarkComplete}
                      disabled={markingComplete || currentLesson.isCompleted}
                      className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold transition shadow-sm cursor-pointer ${
                        currentLesson.isCompleted
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/20 active:scale-98'
                      }`}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{currentLesson.isCompleted ? 'Completed ✓' : 'Mark as Complete'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Lesson Media Viewer Frame */}
              <div className="p-6 sm:p-8 flex-1 space-y-6 max-w-5xl w-full mx-auto">
                {currentLesson.contentType === 'video' ? (
                  <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-black border border-slate-200 shadow-xl">
                    {currentLesson.videoUrl &&
                    (currentLesson.videoUrl.includes('youtube.com') ||
                      currentLesson.videoUrl.includes('youtu.be')) ? (
                      <iframe
                        src={
                          currentLesson.videoUrl.includes('watch?v=')
                            ? currentLesson.videoUrl.replace('watch?v=', 'embed/')
                            : currentLesson.videoUrl
                        }
                        title={currentLesson.title}
                        className="h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : currentLesson.videoUrl ? (
                      <video
                        src={currentLesson.videoUrl}
                        controls
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-slate-400 bg-slate-900">
                        <Video className="h-12 w-12 text-slate-500 mb-2" />
                        <p className="text-xs">No video URL attached to this lesson yet.</p>
                      </div>
                    )}
                  </div>
                ) : currentLesson.contentType === 'pdf' ? (
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-8 text-center space-y-4 shadow-2xs">
                    <div className="h-16 w-16 mx-auto rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                      <FileText className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900">Lesson Document & PDF Handbook</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Review this essential architectural handbook and lab guidelines before continuing.
                    </p>
                    {currentLesson.documentUrl && (
                      <a
                        href={currentLesson.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white transition shadow-sm shadow-emerald-600/20"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PDF Document</span>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="rounded-3xl border border-slate-200/90 bg-white p-8 space-y-4 shadow-2xs">
                    <h3 className="font-heading text-lg font-extrabold text-slate-900">Lecture Documentation</h3>
                    <div className="prose max-w-none text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap bg-slate-50 p-5 rounded-2xl border border-slate-200">
                      {currentLesson.contentBody || 'No text content available for this lesson.'}
                    </div>
                  </div>
                )}

                {/* Lesson Description & Objectives */}
                {currentLesson.description && (
                  <div className="rounded-2xl border border-slate-200/90 bg-white p-5 space-y-2 shadow-2xs">
                    <h4 className="font-heading text-xs font-bold text-slate-900 uppercase tracking-wider">
                      About this Lesson
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentLesson.description}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-slate-400">
              <p className="text-xs font-medium">Select an unlocked lesson from the curriculum sidebar to begin.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
