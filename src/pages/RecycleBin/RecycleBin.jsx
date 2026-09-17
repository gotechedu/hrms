import React, { useState, useEffect } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Users,
  Briefcase,
  UserCheck,
  GraduationCap,
  DollarSign,
  Newspaper,
  Layers,
} from 'lucide-react';
import { recycleBinApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';

const ENTITY_FILTERS = [
  { id: 'All', label: 'All Deleted Items', icon: Layers },
  { id: 'employee', label: 'Employees', icon: Users },
  { id: 'job', label: 'Career Posts', icon: Briefcase },
  { id: 'jobApplication', label: 'Job Candidates', icon: UserCheck },
  { id: 'course', label: 'Courses', icon: GraduationCap },
  { id: 'courseApplication', label: 'Course Candidates', icon: GraduationCap },
  { id: 'payroll', label: 'Payroll Records', icon: DollarSign },
  { id: 'blog', label: 'Bulletins / Blogs', icon: Newspaper },
];

export default function RecycleBin() {
  const { hasPermission, can, isSuperAdmin, role } = usePermissions();

  const canRestore =
    isSuperAdmin ||
    hasPermission('manage_recycle_bin') ||
    hasPermission('restore_recycle_bin') ||
    can('restore', 'recycle_bin') ||
    can('edit', 'recycle_bin');

  const canPurge =
    isSuperAdmin ||
    hasPermission('manage_recycle_bin') ||
    hasPermission('delete_recycle_bin') ||
    can('delete', 'recycle_bin');

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionMessage, setActionMessage] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchTrashItems = async () => {
    try {
      setLoading(true);
      const res = await recycleBinApi.getDeletedItems({
        type: selectedType,
        search: searchQuery,
      });
      if (res && res.items) {
        setItems(res.items);
      }
    } catch (err) {
      console.error('Fetch Trash Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrashItems();
  }, [selectedType]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrashItems();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleRestore = async (type, id, title) => {
    if (!window.confirm(`Restore "${title}" back to active database?`)) return;
    try {
      setActionMessage(null);
      setActionError(null);
      await recycleBinApi.restoreItem(type, id);
      setActionMessage(`Successfully restored "${title}"!`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchTrashItems();
    } catch (err) {
      setActionError(err.message || 'Failed to restore item');
    }
  };

  const handlePermanentDelete = async (type, id, title) => {
    if (
      !window.confirm(
        `PERMANENT DESTRUCTION WARNING:\n"${title}" will be permanently removed from MongoDB with zero recovery option. Proceed?`
      )
    )
      return;
    try {
      setActionMessage(null);
      setActionError(null);
      await recycleBinApi.permanentDelete(type, id);
      setActionMessage(`Permanently deleted "${title}"`);
      setTimeout(() => setActionMessage(null), 4000);
      fetchTrashItems();
    } catch (err) {
      setActionError(err.message || 'Failed to permanently delete item');
    }
  };

  const handleEmptyBin = async () => {
    if (
      !window.confirm(
        `EMPTY RECYCLE BIN:\nAre you sure you want to permanently purge all ${items.length} soft-deleted records across all modules? This cannot be undone.`
      )
    )
      return;
    try {
      await recycleBinApi.emptyRecycleBin();
      setActionMessage('Recycle Bin has been completely emptied.');
      setTimeout(() => setActionMessage(null), 4000);
      fetchTrashItems();
    } catch (err) {
      setActionError(err.message || 'Failed to empty recycle bin');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-rose-950 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-mono font-semibold text-rose-300 backdrop-blur-md">
              <Trash2 size={14} className="text-rose-400" />
              UNIVERSAL SYSTEM RECOVERY VAULT
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight">
              Enterprise Recycle Bin
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Restore soft-deleted employee records, job candidates, course candidates, payroll entries, and blogs, or purge them permanently.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {items.length > 0 && canPurge && (
              <button
                onClick={handleEmptyBin}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500 transition cursor-pointer"
              >
                <AlertTriangle size={15} />
                Empty Recycle Bin
              </button>
            )}
            <button
              onClick={fetchTrashItems}
              title="Refresh"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition backdrop-blur-md"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-bold text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-600" />
          {actionMessage}
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-800 animate-fadeIn">
          <AlertCircle size={16} className="text-rose-600" />
          {actionError}
        </div>
      )}

      {/* Main Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs overflow-hidden">
        {/* Filter Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-100 px-6 py-4 gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
            {ENTITY_FILTERS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedType(tab.id)}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer shrink-0 ${
                    selectedType === tab.id
                      ? 'bg-rose-50 text-rose-700 font-extrabold border border-rose-200 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={14} className={selectedType === tab.id ? 'text-rose-600' : 'text-slate-400'} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input
              type="text"
              placeholder="Search in trash..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-52 sm:w-64 rounded-xl border border-slate-200 pl-9 pr-3 text-xs focus:border-rose-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Trash Records Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Record Title & Details</th>
                <th className="px-6 py-3.5">Module Type</th>
                <th className="px-6 py-3.5">Deleted Timestamp</th>
                <th className="px-6 py-3.5 text-right">Recovery Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center text-slate-400">
                    <RefreshCw className="mx-auto mb-2 animate-spin text-rose-600" size={24} />
                    Scanning recycle vault...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-14 text-center text-slate-400">
                    <CheckCircle2 className="mx-auto mb-2 text-emerald-500" size={32} />
                    <span className="font-bold text-slate-700 block text-sm">Recycle Bin is Empty</span>
                    <span className="text-xs text-slate-400">No deleted items found in this section.</span>
                  </td>
                </tr>
              ) : (
                items.map((row) => (
                  <tr key={`${row.entityType}-${row._id}`} className="hover:bg-slate-50/60 transition">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900 text-sm">{row.title}</span>
                        {row.subtitle && (
                          <span className="text-[11px] font-mono text-slate-400">{row.subtitle}</span>
                        )}
                        <span className="text-[10px] font-mono text-slate-300">ID: {row._id}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 text-[11px] font-bold font-mono">
                        {row.typeLabel}
                      </span>
                    </td>

                    <td className="px-6 py-4 font-mono text-slate-500 text-[11px]">
                      {new Date(row.deletedAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {canRestore && (
                          <button
                            onClick={() => handleRestore(row.entityType, row._id, row.title)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                          >
                            <RotateCcw size={13} />
                            Restore
                          </button>
                        )}
                        {canPurge && (
                          <button
                            onClick={() => handlePermanentDelete(row.entityType, row._id, row.title)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition shadow-2xs cursor-pointer"
                          >
                            <Trash2 size={13} />
                            Purge
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
