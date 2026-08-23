import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CalendarDays,
  Plus,
  Calendar,
  Sparkles,
  Sun,
  PartyPopper,
  Trash2,
} from 'lucide-react';
import { addHoliday, deleteHoliday } from '../../redux/slices/holidaySlice';
import Modal from '../../Components/Common/Modal';

export default function Holiday() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { holidays } = useSelector((state) => state.holidays);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    date: '',
    day: 'Friday',
    type: 'Public Holiday',
    isOptional: false,
  });

  const handleAdd = (e) => {
    e.preventDefault();
    dispatch(addHoliday(form));
    setIsModalOpen(false);
    setForm({
      name: '',
      date: '',
      day: 'Friday',
      type: 'Public Holiday',
      isOptional: false,
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-700">
            <CalendarDays size={13} /> Official Calendar Schedule
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Company Holidays 2025
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Official non-working days, mandatory national observances, and optional festival leaves
          </p>
        </div>

        {user?.role === 'HR Administrator' && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
          >
            <Plus size={16} />
            <span>Add Holiday</span>
          </button>
        )}
      </div>

      {/* Highlights Banner */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-cyan-50 to-indigo-50/50 p-6 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20 text-xl">
            🎉
          </div>
          <div>
            <h3 className="font-heading text-base font-bold text-slate-900">
              Total Approved Holidays: 12 Days (Calendar Year 2025)
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              Includes 3 extended 3-day long weekends (Good Friday, Independence Day, Diwali).
            </p>
          </div>
        </div>
      </div>

      {/* Holiday Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {holidays.map((h) => (
          <div
            key={h.id}
            className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    h.type === 'National Holiday'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : h.isOptional
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {h.type}
                </span>

                {user?.role === 'HR Administrator' && (
                  <button
                    type="button"
                    onClick={() => dispatch(deleteHoliday(h.id))}
                    className="p-1 text-slate-300 hover:text-rose-600 transition"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>

              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                {h.name}
              </h3>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-blue-600">📅 {h.date}</span>
              <span className="font-semibold text-slate-500">{h.day}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Holiday Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Company Holiday"
        subtitle="Publish a new festival or national observance on the annual calendar"
      >
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Holiday Occasion *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Eid-ul-Adha (Bakrid)"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Day of Week *
              </label>
              <select
                value={form.day}
                onChange={(e) => setForm({ ...form, day: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
                <option value="Sunday">Sunday</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Classification *
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            >
              <option value="Public Holiday">Public Holiday</option>
              <option value="National Holiday">National Holiday</option>
              <option value="Restricted Holiday">Restricted / Optional Holiday</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Add to Calendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
