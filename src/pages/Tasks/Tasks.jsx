import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  Trash2,
  MoveRight,
  Loader2,
  Search,
  User,
  Folder,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  fetchTasks,
  addTaskAsync,
  updateTaskStatusAsync,
  deleteTaskAsync,
  setViewMode,
  setFilterPriority,
} from "../../redux/slices/taskSlice";
import { projectApi } from "../../Service/projectApi";
import { employeeApi } from "../../Service/employeeApi";
import Modal from "../../Components/Common/Modal";
import usePermissions from "../../utils/usePermissions";

const columns = [
  {
    id: "To Do",
    title: "To Do",
    color: "border-slate-300 bg-slate-100/70 text-slate-700",
  },
  {
    id: "In Progress",
    title: "In Progress",
    color: "border-blue-300 bg-blue-50/70 text-blue-700",
  },
  {
    id: "Review",
    title: "Review & QA",
    color: "border-purple-300 bg-purple-50/70 text-purple-700",
  },
  {
    id: "Done",
    title: "Done / Completed",
    color: "border-emerald-300 bg-emerald-50/70 text-emerald-700",
  },
];

export default function Tasks() {
  const dispatch = useDispatch();
  const { tasks, viewMode, filterPriority, loading } = useSelector(
    (state) => state.tasks,
  );
  const { hasPermission, can, isSuperAdmin, user } = usePermissions();
  const canAddTask =
    isSuperAdmin ||
    can('create', 'task') ||
    hasPermission('manage_task') ||
    hasPermission('add_task') ||
    hasPermission('create_tasks');
  const canEditTask =
    isSuperAdmin ||
    can('edit', 'task') ||
    hasPermission('manage_task') ||
    hasPermission('edit_task') ||
    hasPermission('edit_tasks');
  const canDeleteTask =
    isSuperAdmin ||
    can('delete', 'task') ||
    hasPermission('manage_task') ||
    hasPermission('delete_task') ||
    hasPermission('delete_tasks');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Dynamic dropdown options fetched from real DB
  const [dbProjects, setDbProjects] = useState([]);
  const [dbEmployees, setDbEmployees] = useState([]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    project: "",
    projectName: "",
    assignee: "",
    assigneeName: "",
    priority: "High",
    deadline: "",
    estimatedHours: 8,
  });

  useEffect(() => {
    dispatch(fetchTasks());
    loadFormDependencies();
  }, [dispatch]);

  const loadFormDependencies = async () => {
    try {
      const [projRes, empRes] = await Promise.all([
        projectApi.getProjects(),
        employeeApi.getEmployees(),
      ]);
      setDbProjects(projRes.data || projRes.projects || []);
      setDbEmployees(empRes.employees || empRes.data || []);
    } catch (err) {
      console.error("Failed to load form options:", err);
    }
  };

  const handleProjectSelect = (e) => {
    const projId = e.target.value;
    if (!projId || projId === "general") {
      setForm({
        ...form,
        project: "",
        projectName: "General Project",
      });
      return;
    }
    const selected = dbProjects.find(
      (p) => String(p._id || p.id) === String(projId),
    );
    setForm({
      ...form,
      project: selected?._id || projId,
      projectName: selected
        ? selected.name
        : e.target.selectedOptions[0]?.text || "General Project",
    });
  };

  const handleAssigneeSelect = (e) => {
    const empId = e.target.value;
    if (!empId || empId === "unassigned") {
      setForm({
        ...form,
        assignee: "",
        assigneeName: "Unassigned",
      });
      return;
    }
    const selected = dbEmployees.find(
      (emp) => String(emp._id || emp.id || emp.employeeId) === String(empId),
    );
    const fullName = selected
      ? `${selected.firstName || ""} ${selected.lastName || ""}`.trim()
      : e.target.selectedOptions[0]?.text || "Unassigned";
    setForm({
      ...form,
      assignee: selected?._id || empId,
      assigneeName: fullName,
    });
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.title || !form.deadline) return;
    setSubmitting(true);
    try {
      await dispatch(addTaskAsync(form)).unwrap();
      setIsModalOpen(false);
      setForm({
        title: "",
        description: "",
        project: "",
        projectName: "",
        assignee: "",
        assigneeName: "",
        priority: "High",
        deadline: "",
        estimatedHours: 8,
      });
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const getNextStatus = (current) => {
    if (current === "To Do") return "In Progress";
    if (current === "In Progress") return "Review";
    if (current === "Review") return "Done";
    return "Done";
  };

  const handleAdvanceStatus = (id, currentStatus) => {
    const nextStatus = getNextStatus(currentStatus);
    dispatch(updateTaskStatusAsync({ id, status: nextStatus }));
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this sprint task?")) {
      dispatch(deleteTaskAsync(id));
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesPriority =
      filterPriority === "All" || t.priority === filterPriority;
    const matchesSearch =
      (t.title && t.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.project &&
        t.project.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.assignee &&
        t.assignee.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesPriority && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-fadeIn p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center bg-white p-6 rounded-3xl border border-slate-200/80 shadow-2xs">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <CheckSquare size={14} /> Agile Kanban Engine
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Task & Sprint Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time sprint tracking across engineering pods, deliverables, and
            cross-functional teams
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => dispatch(setViewMode("kanban"))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "kanban"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              type="button"
              onClick={() => dispatch(setViewMode("list"))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === "list"
                  ? "bg-blue-600 text-white shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <List size={14} /> List
            </button>
          </div>

          {canAddTask && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95 cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          )}
        </div>
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
            placeholder="Search task title, project, assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <span className="text-xs font-mono font-bold uppercase text-slate-400 mr-2">
            Priority:
          </span>
          {["All", "Urgent", "High", "Medium", "Normal"].map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => dispatch(setFilterPriority(p))}
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
                filterPriority === p
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban / List Board */}
      {loading ? (
        <div className="grid gap-5 lg:grid-cols-4 items-start">
          {columns.map((col) => (
            <div
              key={col.id}
              className="rounded-3xl border border-slate-200/80 bg-slate-100/60 p-4 min-h-[450px] animate-pulse space-y-3"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="h-4 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-6 bg-slate-200 rounded-full" />
              </div>
              {[1, 2].map((k) => (
                <div key={k} className="h-32 rounded-2xl bg-white p-4 shadow-2xs border border-slate-200/60 space-y-2">
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                  <div className="h-4 w-32 bg-slate-200 rounded" />
                  <div className="h-3 w-24 bg-slate-100 rounded mt-4" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : viewMode === "kanban" ? (
        <div className="grid gap-5 lg:grid-cols-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-3xl border border-slate-200/80 bg-slate-100/60 p-4 min-h-[500px] flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-heading text-sm font-bold text-slate-900">
                      {col.title}
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-0.5 font-mono text-xs font-bold text-slate-700 shadow-2xs border border-slate-200">
                      {colTasks.length}
                    </span>
                  </div>

                  <div className="mt-3.5 space-y-3">
                    {colTasks.map((task) => (
                      <div
                        key={task._id || task.id}
                        className="group rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-blue-600 truncate max-w-[130px]">
                            {task.project || "General"}
                          </span>
                          <div className="flex items-center gap-1">
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                task.priority === "Urgent"
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : task.priority === "High"
                                    ? "bg-amber-50 text-amber-700 border border-amber-200"
                                    : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              {task.priority}
                            </span>
                            {canDeleteTask && (
                              <button
                                type="button"
                                onClick={() => handleDelete(task._id || task.id)}
                                className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                                title="Delete task"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        <h4 className="mt-2 font-heading text-xs font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                          <span className="font-mono flex items-center gap-1 text-slate-600">
                            <Clock size={11} /> {task.deadline}
                          </span>
                          <span
                            className="font-semibold text-slate-700 truncate max-w-[100px]"
                            title={task.assignee}
                          >
                            👤{" "}
                            {task.assignee
                              ? task.assignee.split(" ")[0]
                              : "Unassigned"}
                          </span>
                        </div>

                        {task.status !== "Done" && (canEditTask || task.assignee === user?.name) && (
                          <button
                            type="button"
                            onClick={() =>
                              handleAdvanceStatus(
                                task._id || task.id,
                                task.status,
                              )
                            }
                            className="mt-2.5 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 border border-slate-200/80 transition cursor-pointer"
                          >
                            <span>Advance to {getNextStatus(task.status)}</span>
                            <MoveRight size={11} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Task Key</th>
                  <th className="pb-3">Title</th>
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Assignee</th>
                  <th className="pb-3">Priority</th>
                  <th className="pb-3">Due Date</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((t) => (
                  <tr key={t._id || t.id} className="hover:bg-slate-50/60">
                    <td className="py-3.5 font-mono font-bold text-slate-800">
                      {t.taskId || t.id}
                    </td>
                    <td className="py-3.5 font-semibold text-slate-900 max-w-xs">
                      {t.title}
                    </td>
                    <td className="py-3.5 text-slate-600 font-medium">
                      {t.project}
                    </td>
                    <td className="py-3.5 text-slate-900 font-medium">
                      {t.assignee}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          t.priority === "Urgent"
                            ? "bg-rose-50 text-rose-700"
                            : t.priority === "High"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-slate-500">
                      {t.deadline}
                    </td>
                    <td className="py-3.5">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      {canDeleteTask && (
                        <button
                          type="button"
                          onClick={() => handleDelete(t._id || t.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          title="Delete task"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal Form with Dynamic DB Populated Dropdowns */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Sprint Task"
        subtitle="Assign tasks with dynamic project binding and employee allocation"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Task Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Row Level Security in DB / Configure Kubernetes Node Auto-scaler"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Linked Project (Dynamic DB)
              </label>
              <select
                value={
                  form.project ||
                  (form.projectName === "General Project" ? "general" : "")
                }
                onChange={handleProjectSelect}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select Project from System DB</option>
                <option value="general">
                  📁 General Project / Internal Task
                </option>
                {dbProjects.map((p) => (
                  <option
                    key={p._id || p.id || p.projectId}
                    value={p._id || p.id}
                  >
                    {p.name} ({p.projectId || "PRJ"})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Assignee Employee (Dynamic DB)
              </label>
              <select
                value={
                  form.assignee ||
                  (form.assigneeName === "Unassigned" ? "unassigned" : "")
                }
                onChange={handleAssigneeSelect}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="">Select Employee from System DB</option>
                <option value="unassigned">👤 Unassigned / Open Task</option>
                {dbEmployees.map((emp) => (
                  <option
                    key={emp._id || emp.id || emp.employeeId}
                    value={emp._id || emp.id}
                  >
                    {emp.name} —{" "}
                    {emp.designation || emp.department || emp.employeeId}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Priority *
              </label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Due Date *
              </label>
              <input
                type="date"
                required
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Est. Hours
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={form.estimatedHours}
                onChange={(e) =>
                  setForm({ ...form, estimatedHours: Number(e.target.value) })
                }
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Task Details & Specifications
            </label>
            <textarea
              rows={3}
              placeholder="Provide technical execution details and context..."
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
              <span>Create Sprint Task</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
