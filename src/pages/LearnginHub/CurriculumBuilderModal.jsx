import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Plus,
  Trash2,
  Edit2,
  Video,
  FileText,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle2,
  Lock,
  Eye,
  Clock,
  Sparkles,
  ArrowUp,
  ArrowDown,
  FileCode,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { lmsApi } from '../../Service/lmsApi';

export default function CurriculumBuilderModal({ course, isOpen, onClose, onCurriculumUpdated }) {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState({});

  // Module Modal State
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    duration: '1 Week',
    learningObjectives: '',
  });

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);
  const [lessonForm, setLessonForm] = useState({
    title: '',
    description: '',
    duration: '30 mins',
    contentType: 'video',
    videoUrl: '',
    contentBody: '',
    documentUrl: '',
    externalUrl: '',
    isPreview: false,
    isRequired: true,
  });

  useEffect(() => {
    if (course?._id && isOpen) {
      loadCurriculum();
    }
  }, [course, isOpen]);

  const loadCurriculum = async () => {
    try {
      setLoading(true);
      const res = await lmsApi.getCurriculum(course._id);
      if (res && res.curriculum) {
        setModules(res.curriculum);
        // Expand all modules by default
        const exp = {};
        res.curriculum.forEach((m) => {
          exp[m._id] = true;
        });
        setExpandedModules(exp);
      }
    } catch (err) {
      console.error('Failed to load curriculum:', err);
      toast.error('Failed to load curriculum modules');
    } finally {
      setLoading(false);
    }
  };

  const toggleModuleExpand = (modId) => {
    setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
  };

  // --- Module Actions ---
  const handleOpenModuleModal = (mod = null) => {
    if (mod) {
      setEditingModule(mod);
      setModuleForm({
        title: mod.title,
        description: mod.description || '',
        duration: mod.duration || '1 Week',
        learningObjectives: (mod.learningObjectives || []).join('\n'),
      });
    } else {
      setEditingModule(null);
      setModuleForm({
        title: '',
        description: '',
        duration: '1 Week',
        learningObjectives: '',
      });
    }
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      toast.error('Module title is required');
      return;
    }

    try {
      const payload = {
        courseId: course._id,
        title: moduleForm.title.trim(),
        description: moduleForm.description,
        duration: moduleForm.duration,
        learningObjectives: moduleForm.learningObjectives
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean),
      };

      if (editingModule) {
        await lmsApi.updateModule(editingModule._id, payload);
        toast.success('Module updated successfully');
      } else {
        await lmsApi.createModule(payload);
        toast.success('Module created successfully');
      }

      setIsModuleModalOpen(false);
      loadCurriculum();
      if (onCurriculumUpdated) onCurriculumUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to save module');
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Delete this module and all its lessons?')) return;
    try {
      await lmsApi.deleteModule(modId);
      toast.success('Module deleted');
      loadCurriculum();
      if (onCurriculumUpdated) onCurriculumUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete module');
    }
  };

  // --- Lesson Actions ---
  const handleOpenLessonModal = (moduleId, lesson = null) => {
    setSelectedModuleId(moduleId);
    if (lesson) {
      setEditingLesson(lesson);
      setLessonForm({
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.duration || '30 mins',
        contentType: lesson.contentType || 'video',
        videoUrl: lesson.videoUrl || '',
        contentBody: lesson.contentBody || '',
        documentUrl: lesson.documentUrl || '',
        externalUrl: lesson.externalUrl || '',
        isPreview: !!lesson.isPreview,
        isRequired: lesson.isRequired !== undefined ? !!lesson.isRequired : true,
      });
    } else {
      setEditingLesson(null);
      setLessonForm({
        title: '',
        description: '',
        duration: '30 mins',
        contentType: 'video',
        videoUrl: '',
        contentBody: '',
        documentUrl: '',
        externalUrl: '',
        isPreview: false,
        isRequired: true,
      });
    }
    setIsLessonModalOpen(true);
  };

  const handleSaveLesson = async (e) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) {
      toast.error('Lesson title is required');
      return;
    }

    try {
      const payload = {
        courseId: course._id,
        moduleId: selectedModuleId,
        title: lessonForm.title.trim(),
        description: lessonForm.description,
        duration: lessonForm.duration,
        contentType: lessonForm.contentType,
        videoUrl: lessonForm.videoUrl,
        contentBody: lessonForm.contentBody,
        documentUrl: lessonForm.documentUrl,
        externalUrl: lessonForm.externalUrl,
        isPreview: lessonForm.isPreview,
        isRequired: lessonForm.isRequired,
      };

      if (editingLesson) {
        await lmsApi.updateLesson(editingLesson._id, payload);
        toast.success('Lesson updated successfully');
      } else {
        await lmsApi.createLesson(payload);
        toast.success('Lesson created successfully');
      }

      setIsLessonModalOpen(false);
      loadCurriculum();
      if (onCurriculumUpdated) onCurriculumUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to save lesson');
    }
  };

  const handleDeleteLesson = async (lessonId) => {
    if (!window.confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await lmsApi.deleteLesson(lessonId);
      toast.success('Lesson deleted');
      loadCurriculum();
      if (onCurriculumUpdated) onCurriculumUpdated();
    } catch (err) {
      toast.error(err.message || 'Failed to delete lesson');
    }
  };

  if (!isOpen || !course) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
      <div className="flex h-[90vh] w-full max-w-5xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                LMS Curriculum Authoring Studio
              </span>
              <h2 className="font-heading text-lg font-extrabold text-slate-900">
                {course.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenModuleModal()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Module</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {loading ? (
            <div className="py-20 text-center text-slate-400">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              <p className="mt-3 text-xs font-medium text-slate-500">Loading course curriculum...</p>
            </div>
          ) : modules.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs">
              <BookOpen className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No Curriculum Modules Yet</h3>
              <p className="mt-1 text-xs text-slate-500">
                Start structuring this course by adding your first learning module.
              </p>
              <button
                onClick={() => handleOpenModuleModal()}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-sm shadow-blue-500/20"
              >
                <Plus className="h-4 w-4" />
                <span>Create First Module</span>
              </button>
            </div>
          ) : (
            modules.map((mod, modIdx) => (
              <div
                key={mod._id}
                className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition hover:border-blue-300"
              >
                {/* Module Header Bar */}
                <div className="flex items-center justify-between bg-slate-50/80 px-5 py-4 border-b border-slate-100">
                  <div
                    onClick={() => toggleModuleExpand(mod._id)}
                    className="flex flex-1 items-center gap-3 cursor-pointer select-none"
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-xs font-mono font-bold text-blue-700 border border-blue-200">
                      {modIdx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading text-sm font-extrabold text-slate-900">
                          {mod.title}
                        </h4>
                        <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-mono text-slate-600 font-bold">
                          {mod.duration || '1 Week'}
                        </span>
                        <span className="rounded-md bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-bold">
                          {(mod.lessons || []).length} lessons
                        </span>
                      </div>
                      {mod.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {mod.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenLessonModal(mod._id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition cursor-pointer"
                      title="Add Lesson"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add Lesson</span>
                    </button>
                    <button
                      onClick={() => handleOpenModuleModal(mod)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer"
                      title="Edit Module"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteModule(mod._id)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                      title="Delete Module"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => toggleModuleExpand(mod._id)}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                    >
                      {expandedModules[mod._id] ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Lessons Accordion Content */}
                {expandedModules[mod._id] && (
                  <div className="divide-y divide-slate-100 bg-white p-2">
                    {(mod.lessons || []).length === 0 ? (
                      <div className="py-6 text-center text-xs text-slate-400 font-medium">
                        No lessons in this module yet.{' '}
                        <button
                          onClick={() => handleOpenLessonModal(mod._id)}
                          className="font-bold text-blue-600 hover:underline cursor-pointer"
                        >
                          Add the first lesson
                        </button>
                      </div>
                    ) : (
                      (mod.lessons || []).map((les, lesIdx) => (
                        <div
                          key={les._id}
                          className="flex items-center justify-between rounded-xl px-4 py-3 hover:bg-slate-50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600 text-xs border border-slate-200">
                              {les.contentType === 'video' ? (
                                <Video className="h-4 w-4 text-blue-600" />
                              ) : les.contentType === 'pdf' ? (
                                <FileText className="h-4 w-4 text-emerald-600" />
                              ) : les.contentType === 'document' ? (
                                <FileCode className="h-4 w-4 text-purple-600" />
                              ) : (
                                <ExternalLink className="h-4 w-4 text-cyan-600" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-mono font-bold text-slate-400">
                                  {modIdx + 1}.{lesIdx + 1}
                                </span>
                                <span className="text-xs font-bold text-slate-900">
                                  {les.title}
                                </span>
                                {les.isPreview && (
                                  <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                                    FREE PREVIEW
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-medium">
                                <span>{les.duration}</span>
                                <span>•</span>
                                <span className="capitalize">{les.contentType}</span>
                                {les.videoUrl && (
                                  <>
                                    <span>•</span>
                                    <span className="text-blue-600 truncate max-w-xs font-mono text-[10px]">
                                      {les.videoUrl}
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleOpenLessonModal(mod._id, les)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition cursor-pointer shadow-2xs"
                              title="Edit Lesson"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteLesson(les._id)}
                              className="rounded-lg border border-slate-200 bg-white p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer shadow-2xs"
                              title="Delete Lesson"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 flex items-center justify-between text-xs text-slate-500">
          <span>
            Total Modules: <strong className="text-slate-900">{modules.length}</strong> • Total Lessons:{' '}
            <strong className="text-slate-900">
              {modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)}
            </strong>
          </span>
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* MODAL: CREATE / EDIT MODULE */}
      {isModuleModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button
                onClick={() => setIsModuleModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveModule} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Advanced Event Loop & Async Architecture"
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Week / 10 Hours"
                    value={moduleForm.duration}
                    onChange={(e) => setModuleForm({ ...moduleForm, duration: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Module Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What will students learn in this module?"
                  value={moduleForm.description}
                  onChange={(e) =>
                    setModuleForm({ ...moduleForm, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModuleModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition"
                >
                  {editingModule ? 'Save Changes' : 'Create Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE / EDIT LESSON */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-heading text-base font-extrabold text-slate-900">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button
                onClick={() => setIsLessonModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleSaveLesson} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Microtasks, Macrotasks & libuv Threads"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Content Type
                  </label>
                  <select
                    value={lessonForm.contentType}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, contentType: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  >
                    <option value="video">Video Lecture</option>
                    <option value="pdf">PDF Document</option>
                    <option value="document">Source Code / Lab Guide</option>
                    <option value="text">Rich Text / Article</option>
                    <option value="external_link">External Lab Link</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Estimated Duration
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 45 mins"
                    value={lessonForm.duration}
                    onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {lessonForm.contentType === 'video' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Video Stream URL (YouTube, Vimeo, or MP4)
                  </label>
                  <input
                    type="url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={lessonForm.videoUrl}
                    onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                  />
                </div>
              )}

              {(lessonForm.contentType === 'pdf' || lessonForm.contentType === 'document') && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Document / PDF URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://.../handbook.pdf"
                    value={lessonForm.documentUrl}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, documentUrl: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                  />
                </div>
              )}

              {lessonForm.contentType === 'text' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Lesson Content (Markdown or Rich Text)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Write detailed lesson instructions..."
                    value={lessonForm.contentBody}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, contentBody: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                  />
                </div>
              )}

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lessonForm.isPreview}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, isPreview: e.target.checked })
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Free Public Preview (Unlocked without enrollment)
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lessonForm.isRequired}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, isRequired: e.target.checked })
                    }
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-700">
                    Required for Course Completion
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLessonModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition"
                >
                  {editingLesson ? 'Save Changes' : 'Add Lesson'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
