import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  UserCheck,
  Plus,
  Search,
  Star,
  Mail,
  Phone,
  Briefcase,
  FileText,
  Trash2,
  ChevronRight,
} from 'lucide-react';
import { addCandidate, updateCandidateStage, deleteCandidate, setSelectedStage } from '../../redux/slices/applicationSlice';
import Modal from '../../Components/Common/Modal';

const stages = ['All', 'Applied', 'Screening', 'Technical Round 2', 'Offer Sent'];

export default function Applications() {
  const dispatch = useDispatch();
  const { candidates, selectedStage } = useSelector((state) => state.applications);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Senior Next.js Full-Stack Architect',
    department: 'Engineering',
    experience: '3 Years',
    currentCompany: 'Tech Corp India',
    expectedCTC: '₹18 LPA',
    noticePeriod: '30 Days',
  });

  const filteredCandidates = candidates.filter((c) => {
    if (selectedStage === 'All') return true;
    return c.stage === selectedStage;
  });

  const handleAddCandidate = (e) => {
    e.preventDefault();
    dispatch(addCandidate(form));
    setIsModalOpen(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'Senior Next.js Full-Stack Architect',
      department: 'Engineering',
      experience: '3 Years',
      currentCompany: 'Tech Corp India',
      expectedCTC: '₹18 LPA',
      noticePeriod: '30 Days',
    });
  };

  const getNextStage = (current) => {
    if (current === 'Applied') return 'Screening';
    if (current === 'Screening') return 'Technical Round 2';
    if (current === 'Technical Round 2') return 'Offer Sent';
    return 'Offer Sent';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-cyan-700">
            <UserCheck size={13} /> Talent Acquisition & Hiring
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Job Candidate Pipeline
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Recruitment pipeline, applicant evaluation metrics, and offer status
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>Add Applicant</span>
        </button>
      </div>

      {/* Stage Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mr-1">
          Hiring Stage:
        </span>
        {stages.map((stage) => (
          <button
            key={stage}
            type="button"
            onClick={() => dispatch(setSelectedStage(stage))}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              selectedStage === stage
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {stage}
          </button>
        ))}
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filteredCandidates.map((c) => (
          <div
            key={c.id}
            className="group rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:border-blue-300 hover:shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-slate-400">{c.id}</span>
                <span
                  className={`rounded-full px-3 py-0.5 text-[11px] font-bold ${
                    c.stage === 'Offer Sent'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : c.stage === 'Technical Round 2'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {c.stage}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {c.name}
                  </h3>
                  <p className="text-xs font-semibold text-blue-700">{c.role}</p>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-1 text-xs font-bold text-amber-700 border border-amber-100">
                  <Star size={12} className="fill-amber-400 text-amber-400" />
                  <span>{c.rating}</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs rounded-2xl bg-slate-50 p-3 border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Experience</span>
                  <span className="font-semibold text-slate-900">{c.experience}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Current Org</span>
                  <span className="font-semibold text-slate-900 truncate block">{c.currentCompany}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Notice Period</span>
                  <span className="font-semibold text-slate-900">{c.noticePeriod}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block text-[10px] uppercase">Expected CTC</span>
                  <span className="font-semibold text-slate-900 font-mono">{c.expectedCTC}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Mail size={12} /> {c.email}
                </span>
                <span className="flex items-center gap-1">
                  <Phone size={12} /> {c.phone}
                </span>
              </div>
            </div>

            <div className="mt-5 border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">Applied: {c.appliedDate}</span>

              <div className="flex items-center gap-2">
                {c.stage !== 'Offer Sent' && (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateCandidateStage({
                          id: c.id,
                          stage: getNextStage(c.stage),
                        })
                      )
                    }
                    className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
                  >
                    Advance to {getNextStage(c.stage)} →
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => dispatch(deleteCandidate(c.id))}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Candidate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Recruitment Candidate"
        subtitle="Manually enter profile details for sourcing or referral applicant"
      >
        <form onSubmit={handleAddCandidate} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Candidate Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tanvi Agarwal"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                required
                placeholder="tanvi.a@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Applied Role *
              </label>
              <input
                type="text"
                required
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Total Relevant Experience
              </label>
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Expected CTC
              </label>
              <input
                type="text"
                value={form.expectedCTC}
                onChange={(e) => setForm({ ...form, expectedCTC: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
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
              Add Applicant
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
