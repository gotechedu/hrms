import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Calendar,
  Clock,
  Video,
  Search,
  Filter,
  Trash2,
  Edit2,
  X,
  Sparkles,
  ExternalLink,
  GraduationCap,
  ChevronRight,
  Shield,
  UserCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { lmsApi } from '../../Service/lmsApi';
import { courseApi } from '../../Service/courseApi';

export default function BatchManager() {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Create / Edit Batch Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const initialBatchForm = {
    name: '',
    batchCode: '',
    courseId: '',
    trainers: [],
    startDate: '',
    endDate: '',
    capacity: 30,
    mode: 'Online',
    scheduleDays: ['Monday', 'Wednesday', 'Friday'],
    startTime: '19:30',
    endTime: '21:30',
    timezone: 'Asia/Kolkata',
    meetingProvider: 'Google Meet',
    meetingLink: '',
    status: 'Upcoming',
    notes: '',
  };
  const [batchForm, setBatchForm] = useState(initialBatchForm);

  // Trainees Roster Drawer Modal
  const [isRosterOpen, setIsRosterOpen] = useState(false);
  const [selectedBatchForRoster, setSelectedBatchForRoster] = useState(null);
  const [rosterTrainees, setRosterTrainees] = useState([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [batchRes, courseRes, trainerRes] = await Promise.all([
        lmsApi.getBatches(),
        courseApi.getCourses(),
        lmsApi.getTrainers(),
      ]);

      if (batchRes?.batches) setBatches(batchRes.batches);
      if (courseRes?.courses) setCourses(courseRes.courses);
      if (trainerRes?.trainers) setTrainers(trainerRes.trainers);
    } catch (err) {
      console.error('Failed to load batches:', err);
      toast.error('Failed to retrieve cohort batches');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (b = null) => {
    if (b) {
      setEditingBatch(b);
      setBatchForm({
        name: b.name,
        batchCode: b.batchCode,
        courseId: b.course?._id || b.course,
        trainers: (b.trainers || []).map((t) => (t._id ? t._id : t)),
        startDate: b.startDate ? new Date(b.startDate).toISOString().split('T')[0] : '',
        endDate: b.endDate ? new Date(b.endDate).toISOString().split('T')[0] : '',
        capacity: b.capacity || 30,
        mode: b.mode || 'Online',
        scheduleDays: b.scheduleDays || ['Monday', 'Wednesday', 'Friday'],
        startTime: b.startTime || '19:30',
        endTime: b.endTime || '21:30',
        timezone: b.timezone || 'Asia/Kolkata',
        meetingProvider: b.meetingProvider || 'Google Meet',
        meetingLink: b.meetingLink || '',
        status: b.status || 'Upcoming',
        notes: b.notes || '',
      });
    } else {
      setEditingBatch(null);
      setBatchForm({
        ...initialBatchForm,
        courseId: courses[0]?._id || '',
        trainers: trainers[0]?._id ? [trainers[0]._id] : [],
      });
    }
    setIsModalOpen(true);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (!batchForm.name || !batchForm.batchCode || !batchForm.courseId) {
      toast.error('Please fill in batch name, code, and course');
      return;
    }

    try {
      if (editingBatch) {
        await lmsApi.updateBatch(editingBatch._id, batchForm);
        toast.success('Batch updated successfully');
      } else {
        await lmsApi.createBatch(batchForm);
        toast.success('Batch created successfully');
      }

      setIsModalOpen(false);
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to save batch');
    }
  };

  const handleDeleteBatch = async (batchId) => {
    if (!window.confirm('Delete this batch cohort?')) return;
    try {
      await lmsApi.deleteBatch(batchId);
      toast.success('Batch removed');
      loadInitialData();
    } catch (err) {
      toast.error(err.message || 'Failed to delete batch');
    }
  };

  const handleOpenRoster = async (batch) => {
    setSelectedBatchForRoster(batch);
    setIsRosterOpen(true);
    try {
      setLoadingRoster(true);
      const res = await lmsApi.getBatchTrainees(batch._id);
      if (res?.trainees) {
        setRosterTrainees(res.trainees);
      }
    } catch (err) {
      toast.error('Failed to load batch student roster');
    } finally {
      setLoadingRoster(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      (b.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.batchCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.course?.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const toggleDay = (day) => {
    setBatchForm((prev) => {
      const exists = prev.scheduleDays.includes(day);
      return {
        ...prev,
        scheduleDays: exists
          ? prev.scheduleDays.filter((d) => d !== day)
          : [...prev.scheduleDays, day],
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-heading text-xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <span>Cohort Batches & Allocations</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-mono font-bold text-blue-700 border border-blue-200">
              {batches.length} Active
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage live cohorts, assign trainers, configure class timings, and monitor student capacity.
          </p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Cohort</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search cohort name, batch code, or course title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-44 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Upcoming">Upcoming</option>
          <option value="Active">Active / In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Draft">Draft</option>
        </select>
      </div>

      {/* Batches Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs font-medium text-slate-500">Loading cohort batches...</p>
        </div>
      ) : filteredBatches.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900">No Cohort Batches Found</h3>
          <p className="mt-1 text-xs text-slate-500">
            Create your first batch to start scheduling live classes and enrolling trainees.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 cursor-pointer shadow-sm shadow-blue-500/20"
          >
            <Plus className="h-4 w-4" />
            <span>Create Batch</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBatches.map((b) => {
            const capacityRatio = b.capacity > 0 ? Math.min(100, Math.round(((b.enrolledCount || 0) / b.capacity) * 100)) : 0;
            return (
              <div
                key={b._id}
                className="flex flex-col rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:shadow-md hover:border-blue-300 relative overflow-hidden"
              >
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded-md">
                      {b.batchCode}
                    </span>
                    <h3 className="font-heading text-sm font-extrabold text-slate-900 mt-1.5 line-clamp-1">
                      {b.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1 font-medium">
                      {b.course?.title || 'Unassigned Course'}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      b.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'Upcoming'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
                  >
                    {b.status}
                  </span>
                </div>

                {/* Cohort Details */}
                <div className="space-y-2 py-3.5 border-t border-b border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-blue-600" />
                    <span>
                      {new Date(b.startDate).toLocaleDateString()} — {new Date(b.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-purple-600" />
                    <span>
                      {(b.scheduleDays || []).slice(0, 3).join(', ')} • {b.startTime} - {b.endTime}
                    </span>
                  </div>
                  {b.meetingLink && (
                    <div className="flex items-center gap-2">
                      <Video className="h-3.5 w-3.5 text-emerald-600" />
                      <a
                        href={b.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-[200px]"
                      >
                        {b.meetingLink}
                      </a>
                    </div>
                  )}
                </div>

                {/* Trainers & Capacity */}
                <div className="pt-3 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Trainer(s)</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      {(b.trainers || []).length > 0 ? (
                        b.trainers.map((t) => (
                          <span
                            key={t._id || t}
                            className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-xs font-semibold text-slate-700"
                          >
                            {t.name || 'Assigned'}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">No trainer assigned</span>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">Enrolled</span>
                    <span className="font-mono text-xs font-extrabold text-slate-900">
                      {b.enrolledCount || 0} / {b.capacity}
                    </span>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="w-full bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden mt-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      capacityRatio >= 90 ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${capacityRatio}%` }}
                  />
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => handleOpenRoster(b)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 transition cursor-pointer"
                  >
                    <UserCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>View Roster</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenModal(b)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-blue-400 hover:text-blue-600 transition cursor-pointer bg-white"
                      title="Edit Batch"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteBatch(b._id)}
                      className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:border-rose-400 hover:text-rose-600 transition cursor-pointer bg-white"
                      title="Delete Batch"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL: CREATE / EDIT BATCH */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-5">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  Cohort Lifecycle Management
                </span>
                <h3 className="font-heading text-lg font-extrabold text-slate-900">
                  {editingBatch ? 'Edit Batch Cohort' : 'Create New Batch Cohort'}
                </h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBatch} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Cohort Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MERN Stack 2026 Cohort-A"
                    value={batchForm.name}
                    onChange={(e) => setBatchForm({ ...batchForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unique Batch Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MERN-2026-A"
                    value={batchForm.batchCode}
                    onChange={(e) => setBatchForm({ ...batchForm, batchCode: e.target.value.toUpperCase() })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none uppercase font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Select Course *
                  </label>
                  <select
                    required
                    value={batchForm.courseId}
                    onChange={(e) => setBatchForm({ ...batchForm, courseId: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  >
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Assign Primary Trainer
                  </label>
                  <select
                    value={batchForm.trainers[0] || ''}
                    onChange={(e) =>
                      setBatchForm({
                        ...batchForm,
                        trainers: e.target.value ? [e.target.value] : [],
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  >
                    <option value="">-- Select Trainer --</option>
                    {trainers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.startDate}
                    onChange={(e) => setBatchForm({ ...batchForm, startDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    End Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={batchForm.endDate}
                    onChange={(e) => setBatchForm({ ...batchForm, endDate: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Max Capacity (Students)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={batchForm.capacity}
                    onChange={(e) => setBatchForm({ ...batchForm, capacity: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>
              </div>

              {/* Schedule Days */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  Schedule Days
                </label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => {
                    const isSelected = batchForm.scheduleDays.includes(day);
                    return (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`rounded-lg px-3 py-1 text-xs font-bold transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="text"
                    placeholder="19:30"
                    value={batchForm.startTime}
                    onChange={(e) => setBatchForm({ ...batchForm, startTime: e.target.value })}
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
                    value={batchForm.endTime}
                    onChange={(e) => setBatchForm({ ...batchForm, endTime: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Delivery Mode
                  </label>
                  <select
                    value={batchForm.mode}
                    onChange={(e) => setBatchForm({ ...batchForm, mode: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  >
                    <option value="Online">Live Online</option>
                    <option value="Offline">In-Person Campus</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Meeting Provider
                  </label>
                  <select
                    value={batchForm.meetingProvider}
                    onChange={(e) =>
                      setBatchForm({ ...batchForm, meetingProvider: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                  >
                    <option value="Google Meet">Google Meet</option>
                    <option value="Zoom">Zoom Video</option>
                    <option value="Microsoft Teams">Microsoft Teams</option>
                    <option value="Custom">Custom Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Live Meeting Link
                  </label>
                  <input
                    type="url"
                    placeholder="https://meet.google.com/..."
                    value={batchForm.meetingLink}
                    onChange={(e) => setBatchForm({ ...batchForm, meetingLink: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Batch Status
                </label>
                <select
                  value={batchForm.status}
                  onChange={(e) => setBatchForm({ ...batchForm, status: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none shadow-2xs"
                >
                  <option value="Upcoming">Upcoming (Enrollment Open)</option>
                  <option value="Active">Active (In Session)</option>
                  <option value="Completed">Completed</option>
                  <option value="Draft">Draft</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 shadow-sm shadow-blue-500/20 cursor-pointer transition"
                >
                  {editingBatch ? 'Save Changes' : 'Create Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROSTER MODAL: VIEW ENROLLED TRAINEES */}
      {isRosterOpen && selectedBatchForRoster && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fadeIn">
          <div className="flex h-[80vh] w-full max-w-4xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700">
                  Enrolled Students Roster
                </span>
                <h3 className="font-heading text-lg font-extrabold text-slate-900">
                  {selectedBatchForRoster.name} ({selectedBatchForRoster.batchCode})
                </h3>
              </div>
              <button onClick={() => setIsRosterOpen(false)} className="rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingRoster ? (
                <div className="py-20 text-center text-slate-400">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="mt-3 text-xs font-medium text-slate-500">Fetching students roster...</p>
                </div>
              ) : rosterTrainees.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-medium">
                  No trainees enrolled in this batch yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-bold">
                        <th className="py-3 px-4">Trainee Name</th>
                        <th className="py-3 px-4">Email & Phone</th>
                        <th className="py-3 px-4">Enrollment #</th>
                        <th className="py-3 px-4">Learning Progress</th>
                        <th className="py-3 px-4">Attendance</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {rosterTrainees.map((item) => (
                        <tr key={item.enrollmentId} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {item.trainee?.name || 'Student'}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            <div>{item.trainee?.email}</div>
                            <div className="text-[11px] text-slate-400">{item.trainee?.phone || '—'}</div>
                          </td>
                          <td className="py-3 px-4 font-mono text-blue-700 font-semibold text-[11px]">
                            {item.enrollmentNumber}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-100 border border-slate-200 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${item.progressPercentage || 0}%` }}
                                />
                              </div>
                              <span className="font-mono text-[11px] text-slate-700 font-bold">
                                {item.progressPercentage || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono text-purple-700 font-bold">
                            {item.attendancePercentage || 0}%
                          </td>
                          <td className="py-3 px-4">
                            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-slate-100 px-6 py-4 flex justify-between items-center text-xs text-slate-500 bg-slate-50/50">
              <span>
                Total Students in Roster:{' '}
                <strong className="text-slate-900">{rosterTrainees.length}</strong>
              </span>
              <button
                onClick={() => setIsRosterOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
