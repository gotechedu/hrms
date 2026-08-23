import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';
import { addAccusation, updateAccusationStatus, setSelectedCategory } from '../../redux/slices/accusationSlice';
import Modal from '../../Components/Common/Modal';

const categories = ['All', 'Workplace Environment', 'Payroll & Overtime', 'Equipment & Infrastructure'];

export default function Accusations() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { accusations, selectedCategory } = useSelector((state) => state.accusations);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    subject: '',
    category: 'Workplace Environment',
    filedBy: 'Confidential Employee',
    department: 'Engineering',
    severity: 'Medium',
    summary: '',
  });

  const filteredAccusations = accusations.filter((a) => {
    if (selectedCategory === 'All') return true;
    return a.category === selectedCategory;
  });

  const handleFileGrievance = (e) => {
    e.preventDefault();
    dispatch(addAccusation(form));
    setIsModalOpen(false);
    setForm({
      subject: '',
      category: 'Workplace Environment',
      filedBy: 'Confidential Employee',
      department: 'Engineering',
      severity: 'Medium',
      summary: '',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
            <ShieldAlert size={13} /> Workplace Ethics & Disciplinary
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Grievances & Policy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Confidential incident logging, workplace grievance arbitration, and resolution audit trails
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>File Confidential Grievance</span>
        </button>
      </div>

      {/* Security Privacy Notice */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-2xs flex items-start gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
          <Lock size={20} />
        </div>
        <div>
          <h3 className="font-heading text-sm font-bold text-slate-900">
            Whistleblower & Ethical Protection Guarantee
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
            All submitted grievances are strictly encrypted and reviewed by the designated Ethics Committee.
            Submissions can be made anonymously with zero retaliation risk.
          </p>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => dispatch(setSelectedCategory(cat))}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grievance Cards List */}
      <div className="space-y-4">
        {filteredAccusations.map((item) => (
          <div
            key={item.id}
            className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-blue-300 hover:shadow-md"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-xs font-bold text-slate-400">{item.id}</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    item.severity === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : item.severity === 'Medium'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.severity} Severity
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600">
                  {item.category}
                </span>
              </div>

              <span
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                  item.status === 'Resolved' || item.status === 'Action Taken'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {item.status === 'Resolved' && <CheckCircle2 size={12} />}
                {item.status}
              </span>
            </div>

            <h3 className="mt-3 font-heading text-base font-bold text-slate-900">{item.subject}</h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{item.summary}</p>

            {item.resolutionNotes && (
              <div className="mt-4 rounded-2xl bg-emerald-50/70 p-3 text-xs border border-emerald-100">
                <span className="font-bold text-emerald-800 block text-[11px]">
                  Resolution Outcome:
                </span>
                <span className="text-emerald-900 mt-0.5 block">{item.resolutionNotes}</span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
              <span>Filed by: <strong className="text-slate-700">{item.filedBy}</strong> ({item.department})</span>
              <span>Assigned: <strong className="text-slate-700">{item.assignedTo}</strong> • {item.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* File Grievance Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File Confidential Workplace Grievance"
        subtitle="Your report is encrypted and routed directly to the HR ethics committee"
      >
        <form onSubmit={handleFileGrievance} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Grievance Headline / Issue *
            </label>
            <input
              type="text"
              required
              placeholder="Brief description of the concern"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Workplace Environment">Workplace Environment</option>
                <option value="Payroll & Overtime">Payroll & Overtime</option>
                <option value="Equipment & Infrastructure">Equipment & Infrastructure</option>
                <option value="General Policy">General Policy</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Severity Level *
              </label>
              <select
                value={form.severity}
                onChange={(e) => setForm({ ...form, severity: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Low">Low (Informational)</option>
                <option value="Medium">Medium (Requires Review)</option>
                <option value="High">High (Immediate Action)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Detailed Incident Statement & Evidence *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the incident, dates, involved parties, or suggestions for resolution..."
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
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
              className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/25 hover:bg-rose-700"
            >
              Submit Confidential Report
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
