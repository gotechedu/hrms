import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  CheckSquare,
  Plus,
  Kanban,
  List,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  MoveRight,
} from 'lucide-react';
import { addTask, updateTaskStatus, deleteTask, setViewMode, setFilterPriority } from '../../redux/slices/taskSlice';
import Modal from '../../Components/Common/Modal';

const columns = [
  { id: 'To Do', title: 'To Do', color: 'border-slate-300 bg-slate-100 text-slate-700' },
  { id: 'In Progress', title: 'In Progress', color: 'border-blue-300 bg-blue-50 text-blue-700' },
  { id: 'Review', title: 'Review & QA', color: 'border-purple-300 bg-purple-50 text-purple-700' },
  { id: 'Done', title: 'Done / Completed', color: 'border-emerald-300 bg-emerald-50 text-emerald-700' },
];

export default function Tasks() {
  const dispatch = useDispatch();
  const { tasks, viewMode, filterPriority } = useSelector((state) => state.tasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    project: 'Enterprise School ERP',
    assignee: 'Priya Sundaram',
    priority: 'High',
    deadline: '2025-06-05',
  });

  const filteredTasks = tasks.filter((t) => {
    if (filterPriority === 'All') return true;
    return t.priority === filterPriority;
  });

  const handleCreateTask = (e) => {
    e.preventDefault();
    dispatch(addTask(form));
    setIsModalOpen(false);
    setForm({
      title: '',
      project: 'Enterprise School ERP',
      assignee: 'Priya Sundaram',
      priority: 'High',
      deadline: '2025-06-05',
    });
  };

  const getNextStatus = (current) => {
    if (current === 'To Do') return 'In Progress';
    if (current === 'In Progress') return 'Review';
    if (current === 'Review') return 'Done';
    return 'Done';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            <CheckSquare size={13} /> Sprint Workflow Engine
          </span>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
            Task & Sprint Board
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Agile Kanban sprint tracking across cross-functional engineering pods
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => dispatch(setViewMode('kanban'))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Kanban size={14} /> Kanban
            </button>
            <button
              type="button"
              onClick={() => dispatch(setViewMode('list'))}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'list' ? 'bg-blue-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List size={14} /> List
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/25 transition hover:opacity-95 active:scale-95"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Priority Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mr-1">
          Priority:
        </span>
        {['All', 'Urgent', 'High', 'Medium', 'Normal'].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => dispatch(setFilterPriority(p))}
            className={`rounded-full px-3.5 py-1 text-xs font-bold transition-all ${
              filterPriority === p
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* View: Kanban Columns */}
      {viewMode === 'kanban' ? (
        <div className="grid gap-5 lg:grid-cols-4 items-start">
          {columns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);

            return (
              <div
                key={col.id}
                className="rounded-3xl border border-slate-200/90 bg-slate-100/60 p-4 min-h-[520px] flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <span className="font-heading text-sm font-bold text-slate-900">{col.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-xs font-bold text-slate-700 shadow-2xs">
                      {colTasks.length}
                    </span>
                  </div>

                  {/* Tasks in Column */}
                  <div className="mt-3.5 space-y-3">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs transition-all hover:border-blue-300 hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono font-bold text-blue-600">
                            {task.project}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              task.priority === 'Urgent'
                                ? 'bg-rose-50 text-rose-700'
                                : task.priority === 'High'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="mt-2 font-heading text-xs font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500">
                          <span className="font-mono">{task.deadline}</span>
                          <span className="font-semibold text-slate-700">{task.assignee.split(' ')[0]}</span>
                        </div>

                        {/* Quick Move Action */}
                        {task.status !== 'Done' && (
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                updateTaskStatus({
                                  id: task.id,
                                  status: getNextStatus(task.status),
                                })
                              )
                            }
                            className="mt-2.5 w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-50 py-1.5 text-[10px] font-bold text-blue-600 hover:bg-blue-50 transition border border-slate-100"
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
                <tr className="border-b border-slate-100 text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3">Task ID</th>
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
                  <tr key={t.id} className="hover:bg-slate-50/60">
                    <td className="py-3 font-mono font-bold text-slate-800">{t.id}</td>
                    <td className="py-3 font-semibold text-slate-900 max-w-xs">{t.title}</td>
                    <td className="py-3 text-slate-600">{t.project}</td>
                    <td className="py-3 text-slate-900 font-medium">{t.assignee}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold">
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-slate-500">{t.deadline}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-[10px] font-bold">
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => dispatch(deleteTask(t.id))}
                        className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Sprint Action Item"
        subtitle="Assign tasks with priority and target resolution dates"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Task Headline *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Implement Webhook Dispatcher for Payment Events"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Project *
              </label>
              <select
                value={form.project}
                onChange={(e) => setForm({ ...form, project: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Enterprise School ERP">Enterprise School ERP</option>
                <option value="Autonomous Legal Contract Analyzer">Autonomous Legal Contract Analyzer</option>
                <option value="Multi-Cloud Kubernetes">Multi-Cloud Kubernetes</option>
                <option value="FinTech SOC 2">FinTech SOC 2</option>
              </select>
            </div>

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
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Assignee *
              </label>
              <input
                type="text"
                required
                value={form.assignee}
                onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
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
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
