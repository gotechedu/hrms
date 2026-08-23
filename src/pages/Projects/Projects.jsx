import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  FolderKanban,
  Plus,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  Tag,
} from 'lucide-react';
import { addProject, updateProjectProgress, setFilterStatus } from '../../redux/slices/projectSlice';
import Modal from '../../Components/Common/Modal';

export default function Projects() {
  const dispatch = useDispatch();
  const { projects, filterStatus } = useSelector((state) => state.projects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    name: '',
    client: '',
    category: 'Full-Stack Web & Mobile',
    lead: 'Priya Sundaram',
    budget: '₹35,00,000',
    deadline: '2025-08-30',
    tagsInput: 'React, Node.js, PostgreSQL',
  });

  const filteredProjects = projects.filter((p) => {
    if (filterStatus === 'All') return true;
    return p.status === filterStatus;
  });

  const handleCreateProject = (e) => {
    e.preventDefault();
    const tags = form.tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
    dispatch(
      addProject({
        name: form.name,
        client: form.client,
        category: form.category,
        lead: form.lead,
        budget: form.budget,
        deadline: form.deadline,
        tags,
      })
    );
    setIsModalOpen(false);
    setForm({
      name: '',
      client: '',
      category: 'Full-Stack Web & Mobile',
      lead: 'Priya Sundaram',
      budget: '₹35,00,000',
      deadline: '2025-08-30',
      tagsInput: 'React, Node.js, PostgreSQL',
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
            <FolderKanban size={13} /> Portfolio & Deliverables
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Client Projects & Systems
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor engineering squad assignments, budgets, and milestone delivery pace
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {['All', 'In Progress', 'Review & QA', 'Completed'].map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => dispatch(setFilterStatus(status))}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              filterStatus === status
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid gap-5 sm:grid-cols-2">
        {filteredProjects.map((proj) => (
          <div
            key={proj.id}
            className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[11px] font-bold text-slate-400">
                  {proj.id}
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-[11px] font-bold ${
                    proj.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : proj.status === 'Review & QA'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {proj.status}
                </span>
              </div>

              <h2 className="mt-3 font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                {proj.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Enterprise Client: <strong>{proj.client}</strong></p>

              {/* Progress Metric */}
              <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                  <span>Milestone Velocity</span>
                  <span className="font-mono text-blue-600">{proj.progress}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 transition-all duration-500"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </div>

              {/* Specs & Team */}
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Lead Architect</span>
                  <span className="font-semibold text-slate-900 truncate block">{proj.lead}</span>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                  <span className="text-slate-400 uppercase font-bold text-[10px] block">Allocated Budget</span>
                  <span className="font-semibold text-slate-900 font-mono block">{proj.budget}</span>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {proj.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Target Deadline: <strong className="text-slate-900">{proj.deadline}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateProjectProgress({
                        id: proj.id,
                        progress: Math.min(100, proj.progress + 5),
                      })
                    )
                  }
                  className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                >
                  +5% Progress
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Project Deliverable"
        subtitle="Specify enterprise client, allocated engineering pod, and delivery target"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous AI Supply Chain Engine"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Client Organization *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Global Freight Logistics Ltd"
                value={form.client}
                onChange={(e) => setForm({ ...form, client: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Category Track *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Full-Stack Web & Mobile">Full-Stack Web & Mobile</option>
                <option value="GenAI & Multi-Agent">GenAI & Multi-Agent</option>
                <option value="Cloud DevOps">Cloud DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Budget Allocation
              </label>
              <input
                type="text"
                placeholder="e.g. ₹50,00,000"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Target Deadline *
              </label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Tech Stack Tags (comma separated)
            </label>
            <input
              type="text"
              placeholder="Next.js, Python, PostgreSQL, AWS"
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
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
              className="rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700"
            >
              Create Project
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
