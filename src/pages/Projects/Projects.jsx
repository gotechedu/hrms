import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  FolderKanban,
  Plus,
  Trash2,
  Loader2,
  Search,
  Users,
  CheckCircle2,
  Clock,
  TrendingUp,
  Tag,
} from "lucide-react";
import {
  fetchProjects,
  addProjectAsync,
  updateProjectProgressAsync,
  deleteProjectAsync,
  setFilterStatus,
} from "../../redux/slices/projectSlice";
import { employeeApi } from "../../Service/employeeApi";
import Modal from "../../Components/Common/Modal";
import usePermissions from "../../utils/usePermissions";

export default function Projects() {
  const dispatch = useDispatch();
  const { projects, filterStatus, loading } = useSelector(
    (state) => state.projects,
  );
  const { hasPermission, can, isSuperAdmin } = usePermissions();
  const canAddProject = isSuperAdmin || can('create', 'project') || hasPermission('manage_project') || hasPermission('add_project');
  const canEditProject = isSuperAdmin || can('edit', 'project') || hasPermission('manage_project') || hasPermission('edit_project') || hasPermission('edit_projects');
  const canDeleteProject = isSuperAdmin || can('delete', 'project') || hasPermission('manage_project');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic system employees for Lead Architect dropdown
  const [dbEmployees, setDbEmployees] = useState([]);

  const [form, setForm] = useState({
    name: "",
    client: "",
    category: "Full-Stack Web & Mobile",
    lead: "",
    leadName: "",
    budget: "",
    startDate: "",
    deadline: "",
    tagsInput: "",
    description: "",
  });

  useEffect(() => {
    dispatch(fetchProjects());
    loadEmployees();
  }, [dispatch]);

  const loadEmployees = async () => {
    try {
      const res = await employeeApi.getEmployees();
      setDbEmployees(res.employees || res.data || []);
    } catch (err) {
      console.error("Failed to load employees for project lead dropdown:", err);
    }
  };

  const handleLeadSelect = (e) => {
    const empId = e.target.value;
    if (!empId) {
      setForm({ ...form, lead: "", leadName: "" });
      return;
    }
    const selected = dbEmployees.find(
      (emp) => String(emp._id || emp.id || emp.employeeId) === String(empId),
    );
    const fullName = selected
      ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim()
      : e.target.selectedOptions[0]?.text || "";
    setForm({
      ...form,
      lead: selected?._id || empId,
      leadName: fullName,
    });
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!form.name || !form.client || !form.deadline) return;
    setSubmitting(true);
    try {
      const tags = form.tagsInput
        ? form.tagsInput
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : [];
      await dispatch(
        addProjectAsync({
          name: form.name,
          client: form.client,
          category: form.category,
          lead: form.lead,
          leadName: form.leadName,
          budget: form.budget,
          startDate: form.startDate,
          deadline: form.deadline,
          tags,
          description: form.description,
        }),
      ).unwrap();
      setIsModalOpen(false);
      setForm({
        name: "",
        client: "",
        category: "Full-Stack Web & Mobile",
        lead: "",
        leadName: "",
        budget: "",
        startDate: "",
        deadline: "",
        tagsInput: "",
        description: "",
      });
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleIncrementProgress = (id, currentProgress) => {
    const newProgress = Math.min(100, currentProgress + 5);
    dispatch(updateProjectProgressAsync({ id, progress: newProgress }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this project?")) {
      dispatch(deleteProjectAsync(id));
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = filterStatus === "All" || p.status === filterStatus;
    const matchesSearch =
      (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.client && p.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.lead && p.lead.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 border border-purple-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-purple-700">
            <FolderKanban size={14} /> Portfolio & Client Systems
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Projects & Deliverables Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Monitor engineering squad assignments, milestone delivery pace, tech
            stacks, and budget velocity
          </p>
        </div>

        {canAddProject && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search project name, client, architect..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["All", "In Progress", "Review & QA", "Completed"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => dispatch(setFilterStatus(status))}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                filterStatus === status
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-24 bg-slate-200 rounded-full" />
              </div>
              <div className="h-5 w-48 bg-slate-300 rounded" />
              <div className="h-3.5 w-32 bg-slate-100 rounded" />
              <div className="h-16 rounded-2xl bg-slate-50 p-4 border border-slate-100" />
            </div>
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-12 text-center">
          <FolderKanban size={40} className="mx-auto text-slate-300 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            No Projects Found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No active project deliverables match your search criteria.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {filteredProjects.map((proj) => {
            const isDone = proj.status === "Completed" || proj.progress === 100;
            const isReview = proj.status === "Review & QA";

            return (
              <div
                key={proj._id || proj.id || proj.projectId}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-400">
                      {proj.projectId || proj.id}
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          isDone
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : isReview
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        {proj.status}
                      </span>
                      {canDeleteProject && (
                        <button
                          type="button"
                          onClick={() => handleDelete(proj._id || proj.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                          title="Delete Project"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h2 className="mt-3 font-heading text-lg sm:text-xl font-bold text-slate-900 group-hover:text-blue-600 transition">
                    {proj.name}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Client:{" "}
                    <strong className="text-slate-800">{proj.client}</strong>
                  </p>

                  {/* Progress Bar */}
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-2">
                      <span>Milestone Delivery Velocity</span>
                      <span className="font-mono text-blue-600">
                        {proj.progress}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                        style={{ width: `${proj.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Lead Architect & Budget Specs */}
                  <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 uppercase font-bold text-[10px] block">
                        Lead Architect
                      </span>
                      <span className="font-semibold text-slate-900 truncate block">
                        👤 {proj.leadName || proj.lead || "Assigned Lead"}
                      </span>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-2.5 border border-slate-100">
                      <span className="text-slate-400 uppercase font-bold text-[10px] block">
                        Allocated Budget
                      </span>
                      <span className="font-semibold text-slate-900 font-mono block">
                        {proj.budget}
                      </span>
                    </div>
                  </div>

                  {/* Tech Stack Tags */}
                  {proj.tags && proj.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {proj.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-600 border border-slate-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-6 border-t border-slate-100 pt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    Deadline:{" "}
                    <strong className="text-slate-900 font-mono">
                      {proj.deadline}
                    </strong>
                  </span>

                  {!isDone && canEditProject && (
                    <button
                      type="button"
                      onClick={() =>
                        handleIncrementProgress(
                          proj._id || proj.id,
                          proj.progress,
                        )
                      }
                      className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-200 border border-slate-200 transition cursor-pointer"
                    >
                      +5% Progress
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Project Modal Form with Dynamic Lead Architect Select */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Initialize New Project Deliverable"
        subtitle="Specify enterprise client, allocated lead architect from system DB, and target deadline"
      >
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Autonomous AI Supply Chain Engine / School ERP Platform"
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
                placeholder="e.g. Lexis Nexis Global / Delhi Public School"
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
                <option value="Full-Stack Web & Mobile">
                  Full-Stack Web & Mobile
                </option>
                <option value="GenAI & Multi-Agent">GenAI & Multi-Agent</option>
                <option value="Cloud DevOps">Cloud DevOps</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Enterprise ERP">Enterprise ERP</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Lead Architect (Dynamic Employee DB)
              </label>
              <select
                value={form.lead}
                onChange={handleLeadSelect}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select Employee from System DB</option>
                {dbEmployees.map((emp) => (
                  <option
                    key={emp._id || emp.id || emp.employeeId}
                    value={emp._id || emp.id}
                  >
                    {emp.name} — {emp.designation || emp.department}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Allocated Budget
              </label>
              <input
                type="text"
                placeholder="e.g. ₹50,00,000"
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
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
              placeholder="Next.js, Python, PostgreSQL, AWS EKS"
              value={form.tagsInput}
              onChange={(e) => setForm({ ...form, tagsInput: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Scope Description & Objectives
            </label>
            <textarea
              rows={2}
              placeholder="Brief summary of project scope, SLA requirements, and key deliverables..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
