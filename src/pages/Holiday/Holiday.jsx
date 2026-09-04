import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CalendarDays,
  Plus,
  Trash2,
  Search,
  Filter,
  Loader2,
  Calendar as CalendarIcon,
  Tag,
  CheckCircle2,
  Info,
  Pencil,
} from 'lucide-react';
import {
  fetchHolidays,
  addHolidayAsync,
  updateHolidayAsync,
  deleteHolidayAsync,
  setSelectedYear,
} from '../../redux/slices/holidaySlice';
import Modal from '../../Components/Common/Modal';

export default function Holiday() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { holidays, selectedYear, loading } = useSelector((state) => state.holidays);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const [form, setForm] = useState({
    name: '',
    date: '',
    day: 'Monday',
    type: 'Public Holiday',
    isOptional: false,
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  // Role and permission check
  const userRole = (user?.role || '').toLowerCase();
  const permissions = user?.permissions || [];
  const canManage =
    userRole === 'admin' ||
    userRole === 'superadmin' ||
    userRole === 'hr' ||
    userRole === 'manager' ||
    user?.role === 'HR Administrator' ||
    user?.role === 'System Administrator' ||
    user?.role === 'CEO / Executive' ||
    permissions.includes('manage_holiday');

  useEffect(() => {
    dispatch(fetchHolidays({ year: selectedYear, type: selectedType, search: searchTerm }));
  }, [dispatch, selectedYear]);

  const handleDateChange = (e) => {
    const val = e.target.value;
    if (val) {
      const d = new Date(val);
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const dayName = days[d.getDay()];
      setForm({ ...form, date: val, day: dayName });
    } else {
      setForm({ ...form, date: val });
    }
  };

  const handleOpenAdd = () => {
    setEditingHoliday(null);
    setForm({
      name: '',
      date: '',
      day: 'Monday',
      type: 'Public Holiday',
      isOptional: false,
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (h) => {
    setEditingHoliday(h);
    setForm({
      name: h.name || '',
      date: h.date || '',
      day: h.day || 'Monday',
      type: h.type || 'Public Holiday',
      isOptional: Boolean(h.isOptional),
      description: h.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.date) return;
    setSubmitting(true);
    try {
      if (editingHoliday) {
        await dispatch(
          updateHolidayAsync({
            id: editingHoliday._id || editingHoliday.id,
            holidayData: form,
          })
        ).unwrap();
      } else {
        await dispatch(addHolidayAsync(form)).unwrap();
      }
      setIsModalOpen(false);
      setEditingHoliday(null);
      setForm({
        name: '',
        date: '',
        day: 'Monday',
        type: 'Public Holiday',
        isOptional: false,
        description: '',
      });
    } catch (err) {
      console.error('Failed to save holiday:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to remove this holiday from the schedule?')) {
      dispatch(deleteHolidayAsync(id));
    }
  };

  const filteredHolidays = holidays.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || h.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            <CalendarDays size={14} /> Official Corporate Calendar
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Company Holidays & Observances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Official non-working national observances, regional festival leaves, and restricted holidays
          </p>
        </div>

        {canManage ? (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition hover:shadow-xl hover:opacity-95 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Holiday</span>
          </button>
        ) : null}
      </div>

      {/* Stats Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/80 via-cyan-50/50 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 text-lg">
              📅
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Total Holidays ({selectedYear})</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">{holidays.length} Scheduled Days</h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50/80 via-pink-50/50 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-600 text-white shadow-md shadow-rose-500/20 text-lg">
              🏛️
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">National Observances</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">
                {holidays.filter((h) => h.type === 'National Holiday').length} Mandatory
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-white p-5 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20 text-lg">
              ✨
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500 block">Restricted / Optional</span>
              <h3 className="font-heading text-xl font-bold text-slate-900">
                {holidays.filter((h) => h.isOptional || h.type === 'Restricted Holiday').length} Optional Leaves
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search holiday occasion..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-1.5">
            <Filter size={14} className="text-slate-400" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
            >
              <option value="All">All Classifications</option>
              <option value="Public Holiday">Public Holiday</option>
              <option value="National Holiday">National Holiday</option>
              <option value="Restricted Holiday">Restricted / Optional</option>
            </select>
          </div>

          <select
            value={selectedYear}
            onChange={(e) => dispatch(setSelectedYear(e.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-600 focus:outline-none"
          >
            <option value="2025">Year 2025</option>
            <option value="2026">Year 2026</option>
          </select>
        </div>
      </div>

      {/* Holidays Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
          <p className="text-xs font-medium">Syncing holiday calendar from backend...</p>
        </div>
      ) : filteredHolidays.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <CalendarIcon size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Holidays Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No holidays match your current filter parameters. Adjust search terms or add a new observance.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredHolidays.map((h) => {
            const isNational = h.type === 'National Holiday';
            const isRestricted = h.isOptional || h.type === 'Restricted Holiday';

            return (
              <div
                key={h._id || h.id}
                className="group relative rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-blue-300 hover:shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${
                        isNational
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : isRestricted
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {h.type}
                    </span>

                    {canManage && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(h)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="Edit Holiday"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(h._id || h.id)}
                          className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Remove Holiday"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <h3 className="mt-3 font-heading text-base font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {h.name}
                  </h3>

                  {h.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2">{h.description}</p>
                  )}
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-mono font-bold text-blue-600">
                    <CalendarIcon size={13} />
                    <span>{h.date}</span>
                  </div>
                  <span className="font-semibold text-slate-600 rounded-lg bg-slate-100 px-2.5 py-0.5">
                    {h.day}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Holiday Professional Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingHoliday(null);
        }}
        title={editingHoliday ? "Edit Company Holiday" : "Schedule Company Holiday"}
        subtitle={
          editingHoliday
            ? "Update festival, national observance, or optional leave schedule"
            : "Publish a new festival, national observance, or optional leave on the corporate calendar"
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Holiday Occasion Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eid-ul-Adha (Bakrid) / Independence Day"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Observance Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={handleDateChange}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Day of Week (Auto-Calculated)
              </label>
              <input
                type="text"
                readOnly
                value={form.day}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Classification Category *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Public Holiday">Public Holiday (General Leave)</option>
              <option value="National Holiday">National Holiday (Mandatory Closed)</option>
              <option value="Restricted Holiday">Restricted / Optional Holiday</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Notes / Governance Description
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Applicable across all regional development centers"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              type="checkbox"
              id="isOptional"
              checked={form.isOptional}
              onChange={(e) => setForm({ ...form, isOptional: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isOptional" className="text-xs text-slate-700 font-medium cursor-pointer">
              Mark as Optional / Floating Holiday (Employee can choose from list)
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                setEditingHoliday(null);
              }}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition cursor-pointer"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>{editingHoliday ? 'Save Changes' : 'Add to Calendar'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
