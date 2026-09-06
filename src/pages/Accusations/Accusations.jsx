import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  ShieldAlert,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Lock,
  MessageSquare,
  ShieldCheck,
  FileText,
  Clock,
  UserCheck,
  Users,
  Search,
  Filter,
  Eye,
  Edit3,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  HelpCircle,
  Activity,
  History,
  Scale,
  Building,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { policyApi, grievanceApi } from '../../Service';
import Modal from '../../Components/Common/Modal';

const categories = [
  'All',
  'Workplace Environment',
  'Payroll & Overtime',
  'Equipment & Infrastructure',
  'Code of Conduct & Ethics',
  'Remote Work & Security',
  'Disciplinary Framework',
];

export default function Accusations() {
  const { user } = useSelector((state) => state.auth);

  // Active Main Tab: 'policies' | 'grievances' | 'charter'
  const [activeTab, setActiveTab] = useState('policies');

  // Policy States
  const [policies, setPolicies] = useState([]);
  const [policyMetrics, setPolicyMetrics] = useState({ total: 0, orgWide: 0, roleBased: 0 });
  const [selectedPolicyCategory, setSelectedPolicyCategory] = useState('All');
  const [selectedPolicyScope, setSelectedPolicyScope] = useState('All');
  const [policySearch, setPolicySearch] = useState('');
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  // Grievance States
  const [grievances, setGrievances] = useState([]);
  const [grievanceMetrics, setGrievanceMetrics] = useState({
    total: 0,
    resolved: 0,
    inProgress: 0,
    resolutionRate: '100%',
    avgArbitrationDays: '4.2 Days',
  });
  const [selectedGrievanceCategory, setSelectedGrievanceCategory] = useState('All');
  const [selectedGrievanceSeverity, setSelectedGrievanceSeverity] = useState('All');
  const [grievanceSearch, setGrievanceSearch] = useState('');
  const [loadingGrievances, setLoadingGrievances] = useState(true);

  // Modals
  const [isFileGrievanceOpen, setIsFileGrievanceOpen] = useState(false);
  const [isPolicyReaderOpen, setIsPolicyReaderOpen] = useState(false);
  const [isPolicyEditorOpen, setIsPolicyEditorOpen] = useState(false);
  const [isArbitrationOpen, setIsArbitrationOpen] = useState(false);

  // Selected for modals
  const [activePolicyModal, setActivePolicyModal] = useState(null);
  const [activeGrievanceModal, setActiveGrievanceModal] = useState(null);

  // Grievance Form
  const [grievanceForm, setGrievanceForm] = useState({
    subject: '',
    category: 'Workplace Environment',
    severity: 'Medium',
    statement: '',
    isAnonymous: false,
    filerDepartment: user?.department || 'Engineering',
  });

  // Policy Form
  const [policyForm, setPolicyForm] = useState({
    policyCode: '',
    title: '',
    category: 'Workplace Environment',
    scope: 'Org-Wide',
    targetRoles: 'Developer, Engineer, Designer',
    version: 'v1.0',
    summary: '',
    clauses: [
      { clauseNumber: '1.1', heading: 'Primary Directive', text: '', isMandatory: true },
    ],
    attachmentUrl: '',
    requiresAcknowledgement: true,
  });

  // Arbitration Form
  const [arbitrationForm, setArbitrationForm] = useState({
    status: 'Under Investigation',
    assignedOfficerName: 'HR Ethics Ombudsman',
    assignedOfficerRole: 'Compliance Lead',
    actionTaken: 'Arbitration hearing scheduled',
    notes: '',
    resolutionOutcome: '',
  });

  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const userRole = (user?.role || 'Employee').toLowerCase();
  const isAdminOrHr = ['admin', 'superadmin', 'hr', 'ethics', 'manager'].some((r) =>
    userRole.includes(r)
  );

  // Fetch Policies
  const fetchPolicies = async () => {
    try {
      setLoadingPolicies(true);
      const res = await policyApi.getPolicies({
        category: selectedPolicyCategory,
        scope: selectedPolicyScope,
        search: policySearch,
      });
      if (res && res.policies) {
        setPolicies(res.policies);
        if (res.metrics) setPolicyMetrics(res.metrics);
      }
    } catch (err) {
      console.warn('Failed to load policies:', err);
    } finally {
      setLoadingPolicies(false);
    }
  };

  // Fetch Grievances
  const fetchGrievances = async () => {
    try {
      setLoadingGrievances(true);
      const res = await grievanceApi.getGrievances({
        category: selectedGrievanceCategory,
        severity: selectedGrievanceSeverity,
        search: grievanceSearch,
      });
      if (res && res.grievances) {
        setGrievances(res.grievances);
        if (res.metrics) setGrievanceMetrics(res.metrics);
      }
    } catch (err) {
      console.warn('Failed to load grievances:', err);
    } finally {
      setLoadingGrievances(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, [selectedPolicyCategory, selectedPolicyScope, policySearch]);

  useEffect(() => {
    fetchGrievances();
  }, [selectedGrievanceCategory, selectedGrievanceSeverity, grievanceSearch]);

  // Handle File Grievance
  const handleFileGrievanceSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...grievanceForm,
        filerName: grievanceForm.isAnonymous
          ? 'Anonymous Whistleblower (Protected)'
          : (user?.name || 'Confidential Employee'),
        filerEmail: grievanceForm.isAnonymous ? '' : (user?.email || ''),
      };

      const res = await grievanceApi.fileGrievance(payload);
      if (res.success) {
        showToast('Grievance registered and encrypted under Whistleblower Protection!');
        setIsFileGrievanceOpen(false);
        setGrievanceForm({
          subject: '',
          category: 'Workplace Environment',
          severity: 'Medium',
          statement: '',
          isAnonymous: false,
          filerDepartment: user?.department || 'Engineering',
        });
        fetchGrievances();
      }
    } catch (err) {
      alert(err.message || 'Error filing grievance');
    }
  };

  // Handle Save Policy
  const handleSavePolicySubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...policyForm,
        targetRoles:
          policyForm.scope === 'Role-Based'
            ? policyForm.targetRoles.split(',').map((r) => r.trim()).filter(Boolean)
            : [],
      };

      if (policyForm._id) {
        await policyApi.updatePolicy(policyForm._id, payload);
        showToast('Policy updated successfully');
      } else {
        await policyApi.createPolicy(payload);
        showToast('Policy published to organization repository');
      }

      setIsPolicyEditorOpen(false);
      fetchPolicies();
    } catch (err) {
      alert(err.message || 'Error saving policy');
    }
  };

  // Handle Policy Acknowledgment
  const handleAcknowledgePolicy = async (policyId) => {
    try {
      await policyApi.acknowledgePolicy(policyId, {
        userName: user?.name,
        userRole: user?.role,
      });
      showToast('Thank you! Compliance sign-off recorded.');
      fetchPolicies();
      if (activePolicyModal && activePolicyModal._id === policyId) {
        setIsPolicyReaderOpen(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to acknowledge policy');
    }
  };

  // Handle Arbitration Submit
  const handleArbitrationSubmit = async (e) => {
    e.preventDefault();
    if (!activeGrievanceModal) return;
    try {
      const payload = {
        status: arbitrationForm.status,
        actionTaken: arbitrationForm.actionTaken,
        notes: arbitrationForm.notes,
        resolutionOutcome: arbitrationForm.resolutionOutcome,
        assignedOfficer: {
          name: arbitrationForm.assignedOfficerName,
          role: arbitrationForm.assignedOfficerRole,
        },
      };

      await grievanceApi.updateArbitration(activeGrievanceModal._id, payload);
      showToast('Arbitration audit log updated successfully');
      setIsArbitrationOpen(false);
      fetchGrievances();
    } catch (err) {
      alert(err.message || 'Error recording arbitration');
    }
  };

  // Check if current user acknowledged a policy
  const hasUserAcknowledged = (policy) => {
    if (!policy || !policy.acknowledgedBy) return false;
    const userId = user?._id || user?.id;
    return policy.acknowledgedBy.some(
      (a) => (a.userId && a.userId === userId) || (a.userName && a.userName === user?.name)
    );
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl animate-slideDown">
          <ShieldCheck size={16} className="text-emerald-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-700">
              <ShieldAlert size={13} /> Workplace Ethics & Disciplinary
            </span>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-700">
              Zero-Retaliation Whistleblower Code
            </span>
          </div>
          <h1 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Grievances & Policy Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5 max-w-3xl leading-relaxed">
            Confidential incident logging, workplace grievance arbitration, and resolution audit trails
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isAdminOrHr && (
            <button
              type="button"
              onClick={() => {
                setPolicyForm({
                  policyCode: `POL-${Math.floor(100 + Math.random() * 900)}`,
                  title: '',
                  category: 'Workplace Environment',
                  scope: 'Org-Wide',
                  targetRoles: 'Developer, Engineer, Designer',
                  version: 'v1.0',
                  summary: '',
                  clauses: [
                    { clauseNumber: '1.1', heading: 'Directive Scope', text: '', isMandatory: true },
                  ],
                  attachmentUrl: '',
                  requiresAcknowledgement: true,
                });
                setIsPolicyEditorOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            >
              <Plus size={15} />
              <span>Publish Policy</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsFileGrievanceOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/25 transition hover:opacity-95 active:scale-95"
          >
            <ShieldAlert size={15} />
            <span>File Confidential Grievance</span>
          </button>
        </div>
      </div>

      {/* Whistleblower & Ethical Protection Guarantee Charter Box */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-white p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Lock size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Whistleblower & Ethical Protection Guarantee
                </h3>
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                All submitted grievances are strictly encrypted and reviewed by the designated Ethics Committee.
                Submissions can be made anonymously with zero retaliation risk. Protected by internal anti-reprisal covenants and statutory fair-arbitration standards.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('charter')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-slate-200 px-3.5 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition shadow-2xs"
            >
              <BookOpen size={14} />
              <span>Read Legal Charter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Corporate Policies
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <FileText size={15} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{policyMetrics.total || policies.length}</p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            <strong className="text-blue-600 font-bold">{policyMetrics.orgWide}</strong> Org-Wide •{' '}
            <strong className="text-violet-600 font-bold">{policyMetrics.roleBased}</strong> Role-Based
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Resolution Rate
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={15} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">
            {grievanceMetrics.resolutionRate || '100%'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">
            <strong className="text-emerald-700 font-bold">{grievanceMetrics.resolved}</strong> disputes closed
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Active Inquiries
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
              <Clock size={15} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{grievanceMetrics.inProgress || 0}</p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">Under arbitration hearing</p>
        </div>

        <div className="rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Avg Turnaround
            </span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Scale size={15} />
            </div>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-indigo-700">
            {grievanceMetrics.avgArbitrationDays || '4.2 Days'}
          </p>
          <p className="mt-0.5 text-[11px] font-medium text-slate-500">Ombudsman hearing response</p>
        </div>
      </div>

      {/* Main Module Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1.5 shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveTab('policies')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === 'policies'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <FileText size={15} />
          <span>Company Policies & Directives ({policies.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('grievances')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === 'grievances'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert size={15} />
          <span>Confidential Grievances & Arbitration ({grievances.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('charter')}
          className={`hidden sm:flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold transition-all ${
            activeTab === 'charter'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Scale size={15} />
          <span>Ethics Ombudsman Charter</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: COMPANY POLICIES & DIRECTIVES
         ========================================================================= */}
      {activeTab === 'policies' && (
        <div className="space-y-4">
          {/* Filter Bar: Scope + Category + Search */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Scope Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-fit">
                {['All', 'Org-Wide', 'Role-Based'].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setSelectedPolicyScope(sc)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                      selectedPolicyScope === sc
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {sc === 'All' ? 'All Scopes' : sc === 'Org-Wide' ? 'Org-Wide (All Employees)' : 'Role-Specific Directives'}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search policy code or keywords..."
                  value={policySearch}
                  onChange={(e) => setPolicySearch(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedPolicyCategory(cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    selectedPolicyCategory === cat
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Policies Grid */}
          {loadingPolicies ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-56 rounded-3xl border border-slate-200 bg-white p-6 animate-pulse" />
              ))}
            </div>
          ) : policies.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <FileText size={32} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                No Corporate Policies Found
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                No policy documents match your role visibility or filter criteria.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {policies.map((p) => {
                const isAcked = hasUserAcknowledged(p);
                return (
                  <div
                    key={p._id}
                    className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5.5 shadow-2xs transition hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <span className="font-mono text-xs font-bold text-slate-500">
                          {p.policyCode}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              p.scope === 'Org-Wide'
                                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                                : 'bg-violet-50 text-violet-700 border border-violet-200'
                            }`}
                          >
                            {p.scope === 'Org-Wide' ? 'Org-Wide' : 'Role-Based'}
                          </span>
                          <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                            {p.version}
                          </span>
                        </div>
                      </div>

                      {/* Title & Category */}
                      <h3 className="mt-3 font-heading text-base font-bold text-slate-900 group-hover:text-blue-600 transition line-clamp-2">
                        {p.title}
                      </h3>

                      <span className="mt-1.5 inline-block rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                        {p.category}
                      </span>

                      {/* Summary */}
                      <p className="mt-2.5 text-xs text-slate-600 leading-relaxed line-clamp-3">
                        {p.summary}
                      </p>

                      {/* Target Roles Pill (if Role-Based) */}
                      {p.scope === 'Role-Based' && p.targetRoles && p.targetRoles.length > 0 && (
                        <div className="mt-3 rounded-xl bg-violet-50/60 p-2 text-[10px] border border-violet-100">
                          <span className="text-violet-800 font-bold block uppercase tracking-wider">
                            Applicable Roles:
                          </span>
                          <span className="text-violet-900 font-medium truncate block">
                            {p.targetRoles.join(', ')}
                          </span>
                        </div>
                      )}

                      {/* Clause Preview Count */}
                      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                        <CheckCircle2 size={13} className="text-emerald-500" />
                        <span>{p.clauses?.length || 0} Governing Directives & Clauses</span>
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        {isAcked ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <CheckCircle2 size={13} /> Acknowledged
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                            <AlertCircle size={13} /> Sign-off Pending
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isAdminOrHr && (
                          <button
                            type="button"
                            onClick={() => {
                              setPolicyForm({
                                ...p,
                                targetRoles: Array.isArray(p.targetRoles) ? p.targetRoles.join(', ') : '',
                              });
                              setIsPolicyEditorOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Edit Policy"
                          >
                            <Edit3 size={14} />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setActivePolicyModal(p);
                            setIsPolicyReaderOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 transition shadow-2xs"
                        >
                          <span>Review Clauses</span>
                          <ChevronRight size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 2: CONFIDENTIAL GRIEVANCES & RESOLUTION AUDIT TRAILS
         ========================================================================= */}
      {activeTab === 'grievances' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Filter Category:
              </span>
              {['All', 'Workplace Environment', 'Payroll & Overtime', 'Equipment & Infrastructure', 'Code of Conduct & Ethics'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedGrievanceCategory(cat)}
                  className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all ${
                    selectedGrievanceCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-60">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search case ID or keywords..."
                value={grievanceSearch}
                onChange={(e) => setGrievanceSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          {/* Grievance Cards List */}
          {loadingGrievances ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="h-44 rounded-3xl border border-slate-200 bg-white p-6 animate-pulse" />
              ))}
            </div>
          ) : grievances.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
              <ShieldCheck size={32} className="mx-auto text-slate-300" />
              <h3 className="mt-3 font-heading text-base font-bold text-slate-900">
                No Grievances Logged
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your records reflect zero active complaints or ethical disputes.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {grievances.map((item) => (
                <div
                  key={item._id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xs transition hover:border-blue-300 hover:shadow-md"
                >
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-400">
                        {item.grievanceId}
                      </span>

                      {item.isAnonymous ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                          <Lock size={10} /> Anonymous Whistleblower
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700">
                          {item.filerName} ({item.filerDepartment})
                        </span>
                      )}

                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          item.severity === 'High' || item.severity === 'Critical / Urgent'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : item.severity === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.severity} Severity
                      </span>

                      <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-blue-700 border border-blue-100">
                        {item.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                          item.status === 'Resolved' || item.status === 'Action Taken' || item.status === 'Closed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Arbitration Hearing'
                            ? 'bg-violet-50 text-violet-700 border border-violet-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {item.status === 'Resolved' && <CheckCircle2 size={12} />}
                        {item.status}
                      </span>

                      {isAdminOrHr && (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveGrievanceModal(item);
                            setArbitrationForm({
                              status: item.status,
                              assignedOfficerName: item.assignedOfficer?.name || 'HR Ethics Ombudsman',
                              assignedOfficerRole: item.assignedOfficer?.role || 'Arbitration Lead',
                              actionTaken: '',
                              notes: '',
                              resolutionOutcome: item.resolutionOutcome || '',
                            });
                            setIsArbitrationOpen(true);
                          }}
                          className="rounded-xl border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                        >
                          Arbitrate
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Incident Subject & Statement */}
                  <h3 className="mt-3.5 font-heading text-base font-bold text-slate-900">
                    {item.subject}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                    {item.statement}
                  </p>

                  {/* Resolution Outcome Callout */}
                  {item.resolutionOutcome && (
                    <div className="mt-4 rounded-2xl bg-emerald-50/80 p-3.5 text-xs border border-emerald-200/70">
                      <span className="font-bold text-emerald-800 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                        <CheckCircle2 size={14} /> Arbitration Resolution Outcome
                      </span>
                      <p className="text-emerald-900 mt-1 font-medium leading-relaxed">
                        {item.resolutionOutcome}
                      </p>
                    </div>
                  )}

                  {/* Resolution Audit Trail Timeline */}
                  {item.auditTrail && item.auditTrail.length > 0 && (
                    <div className="mt-5 rounded-2xl bg-slate-50/80 p-4 border border-slate-100">
                      <h4 className="font-heading text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                        <History size={13} /> Resolution Audit Trail & Arbitration Logs
                      </h4>
                      <div className="space-y-3 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                        {item.auditTrail.map((log, idx) => (
                          <div key={idx} className="relative pl-6 text-xs">
                            <span className="absolute left-1 top-1.5 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-blue-600 ring-4 ring-white" />
                            <div className="flex flex-wrap items-center gap-2 text-slate-500 text-[11px]">
                              <strong className="text-slate-800 font-bold">{log.action}</strong>
                              <span>• by <strong className="text-slate-700">{log.actionBy}</strong></span>
                              <span>• {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                              <span className="rounded bg-slate-200/80 px-1.5 py-0.2 font-mono text-[9px] font-bold text-slate-700">
                                {log.stage}
                              </span>
                            </div>
                            {log.notes && (
                              <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px]">
                                {log.notes}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Officer Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span>
                      Ethics Officer:{' '}
                      <strong className="text-slate-700">
                        {item.assignedOfficer?.name || 'HR Ethics Committee'}
                      </strong>
                    </span>
                    <span>
                      Registered: {new Date(item.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: ETHICS OMBUDSMAN CHARTER
         ========================================================================= */}
      {activeTab === 'charter' && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs space-y-6">
          <div>
            <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
              Corporate Governance Code
            </span>
            <h2 className="mt-2 font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
              GoTechEdu Ethics & Whistleblower Charter
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
              Every employee, contractor, and collaborator has the unconditional right to transparent, neutral, and retaliation-free dispute arbitration.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h4 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                1. Absolute Non-Retaliation Safe Harbor
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Whistleblowers reporting policy breaches, fiscal discrepancies, or hostile conduct are shielded under corporate bylaws. Any adverse employment actions taken against a reporting party result in immediate disciplinary dismissal of the retaliator.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h4 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <Scale size={18} className="text-blue-600" />
                2. Neutral Multi-Stage Arbitration
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                Disputes undergo 4-tier objective review: Incident Intake &rarr; Neutral Ombudsman Review &rarr; Collaborative Hearing &rarr; Formal Resolution & Remediation. All stages produce immutable audit logs.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h4 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <Lock size={18} className="text-indigo-600" />
                3. Anonymous Cryptographic Filing
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                If an employee elects anonymous submission, their session tokens and user IDs are sanitized before database storage. The Ethics Committee evaluates evidence strictly based on merit without knowing the filer identity.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 border border-slate-100">
              <h4 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-2">
                <Users size={18} className="text-violet-600" />
                4. POSH & Workplace Safety Committee
              </h4>
              <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                A presiding Internal Complaints Committee (ICC) featuring independent external advisors arbitrates all sensitive workplace behavior and harassment incidents under statutory regulations.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 1: FILE CONFIDENTIAL GRIEVANCE
         ========================================================================= */}
      <Modal
        isOpen={isFileGrievanceOpen}
        onClose={() => setIsFileGrievanceOpen(false)}
        title="File Confidential Workplace Grievance"
        subtitle="Your report is encrypted and routed directly to the HR Ethics Ombudsman"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleFileGrievanceSubmit} className="space-y-4">
          {/* Whistleblower Anonymous Toggle */}
          <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-heading text-xs font-bold text-slate-900 flex items-center gap-1.5 cursor-pointer">
                  <Lock size={14} className="text-blue-600" />
                  Whistleblower Mode (Submit Anonymously)
                </label>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Masks your identity from all peers and management. Zero retaliation guaranteed.
                </p>
              </div>
              <input
                type="checkbox"
                checked={grievanceForm.isAnonymous}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, isAnonymous: e.target.checked })}
                className="h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Grievance Headline / Subject *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Overtime calculation discrepancy for weekend shift"
              value={grievanceForm.subject}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, subject: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={grievanceForm.category}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Workplace Environment">Workplace Environment</option>
                <option value="Payroll & Overtime">Payroll & Overtime</option>
                <option value="Equipment & Infrastructure">Equipment & Infrastructure</option>
                <option value="Code of Conduct & Ethics">Code of Conduct & Ethics</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Severity Level *
              </label>
              <select
                value={grievanceForm.severity}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, severity: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Low">Low (Informational / Suggestion)</option>
                <option value="Medium">Medium (Requires Review)</option>
                <option value="High">High (Urgent Escalation)</option>
                <option value="Critical / Urgent">Critical / Immediate Action</option>
              </select>
            </div>
          </div>

          {!grievanceForm.isAnonymous && (
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Department
              </label>
              <input
                type="text"
                value={grievanceForm.filerDepartment}
                onChange={(e) => setGrievanceForm({ ...grievanceForm, filerDepartment: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Detailed Incident Statement & Evidence *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Describe the incident, involved dates, key details, or recommendations for resolution..."
              value={grievanceForm.statement}
              onChange={(e) => setGrievanceForm({ ...grievanceForm, statement: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsFileGrievanceOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-gradient-to-r from-rose-600 to-red-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-rose-500/25 hover:opacity-95 transition"
            >
              Submit Confidential Report
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 2: POLICY READER & COMPLIANCE ACKNOWLEDGMENT
         ========================================================================= */}
      <Modal
        isOpen={isPolicyReaderOpen}
        onClose={() => setIsPolicyReaderOpen(false)}
        title={activePolicyModal?.title || 'Corporate Policy Document'}
        subtitle={`${activePolicyModal?.policyCode} • Version ${activePolicyModal?.version} • Effective ${activePolicyModal?.effectiveDate}`}
        maxWidth="max-w-3xl"
      >
        {activePolicyModal && (
          <div className="space-y-5">
            {/* Meta tags */}
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 border border-blue-200">
                {activePolicyModal.category}
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                Scope: {activePolicyModal.scope}
              </span>
              {activePolicyModal.scope === 'Role-Based' && (
                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-bold text-violet-700">
                  Target: {activePolicyModal.targetRoles?.join(', ')}
                </span>
              )}
            </div>

            {/* Synopsis */}
            <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Executive Synopsis
              </h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {activePolicyModal.summary}
              </p>
            </div>

            {/* Clauses List */}
            <div className="space-y-3">
              <h4 className="font-heading text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen size={16} className="text-blue-600" />
                Governing Directives & Clauses
              </h4>
              {activePolicyModal.clauses?.map((c, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200/90 bg-white p-4 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700">
                      Clause {c.clauseNumber}: {c.heading}
                    </span>
                    {c.isMandatory && (
                      <span className="rounded bg-rose-50 px-2 py-0.5 text-[9px] font-bold text-rose-700 border border-rose-100 uppercase">
                        Mandatory
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {c.text}
                  </p>
                </div>
              ))}
            </div>

            {/* Acknowledgment Sign-off Box */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                {hasUserAcknowledged(activePolicyModal) ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                    <CheckCircle2 size={16} />
                    <span>You have acknowledged and signed this policy</span>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Acknowledgment confirms you understand and adhere to these directives.
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPolicyReaderOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Close
                </button>
                {!hasUserAcknowledged(activePolicyModal) && (
                  <button
                    type="button"
                    onClick={() => handleAcknowledgePolicy(activePolicyModal._id)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
                  >
                    <CheckCircle2 size={14} />
                    <span>Acknowledge & Sign</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* =========================================================================
          MODAL 3: PUBLISH / EDIT POLICY (ADMIN / HR)
         ========================================================================= */}
      <Modal
        isOpen={isPolicyEditorOpen}
        onClose={() => setIsPolicyEditorOpen(false)}
        title={policyForm._id ? 'Edit Corporate Policy' : 'Publish New Corporate Policy'}
        subtitle="Manage company bylaws, guidelines, and role-specific compliance directives"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSavePolicySubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Policy Code *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. POL-ETH-001"
                value={policyForm.policyCode}
                onChange={(e) => setPolicyForm({ ...policyForm, policyCode: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none uppercase"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Version
              </label>
              <input
                type="text"
                placeholder="e.g. v2.1"
                value={policyForm.version}
                onChange={(e) => setPolicyForm({ ...policyForm, version: e.target.value })}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 font-mono focus:border-blue-600 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Policy Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Workplace Conduct, Anti-Harassment & Whistleblower Code"
              value={policyForm.title}
              onChange={(e) => setPolicyForm({ ...policyForm, title: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Category *
              </label>
              <select
                value={policyForm.category}
                onChange={(e) => setPolicyForm({ ...policyForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
              >
                <option value="Workplace Environment">Workplace Environment</option>
                <option value="Payroll & Overtime">Payroll & Overtime</option>
                <option value="Equipment & Infrastructure">Equipment & Infrastructure</option>
                <option value="Code of Conduct & Ethics">Code of Conduct & Ethics</option>
                <option value="Remote Work & Security">Remote Work & Security</option>
                <option value="Disciplinary Framework">Disciplinary Framework</option>
                <option value="General Policy">General Policy</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
                Scope (Org vs Role-Based) *
              </label>
              <select
                value={policyForm.scope}
                onChange={(e) => setPolicyForm({ ...policyForm, scope: e.target.value })}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-semibold"
              >
                <option value="Org-Wide">Org-Wide (Visible to All Employees)</option>
                <option value="Role-Based">Role-Based (Restricted to Target Roles)</option>
              </select>
            </div>
          </div>

          {policyForm.scope === 'Role-Based' && (
            <div className="rounded-xl bg-violet-50/70 p-3.5 border border-violet-200/70">
              <label className="block text-[11px] font-mono font-bold uppercase text-violet-800 mb-1">
                Target Roles (comma-separated) *
              </label>
              <input
                type="text"
                placeholder="e.g. Manager, TeamLead, HR, Developer, Lead"
                value={policyForm.targetRoles}
                onChange={(e) => setPolicyForm({ ...policyForm, targetRoles: e.target.value })}
                className="w-full rounded-xl border border-violet-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-violet-600 focus:outline-none"
              />
              <p className="text-[10px] text-violet-600 mt-1">
                Only employees holding these active roles will see this policy in their HRMS portal.
              </p>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Executive Summary *
            </label>
            <textarea
              rows={3}
              required
              placeholder="High-level overview of this policy and its objective..."
              value={policyForm.summary}
              onChange={(e) => setPolicyForm({ ...policyForm, summary: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsPolicyEditorOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-blue-600 transition shadow-2xs"
            >
              {policyForm._id ? 'Update Policy' : 'Publish Policy'}
            </button>
          </div>
        </form>
      </Modal>

      {/* =========================================================================
          MODAL 4: ARBITRATION AUDIT RECORD (HR / ETHICS COMMITTEE)
         ========================================================================= */}
      <Modal
        isOpen={isArbitrationOpen}
        onClose={() => setIsArbitrationOpen(false)}
        title="Arbitrate Grievance & Update Audit Trail"
        subtitle={`Case ID: ${activeGrievanceModal?.grievanceId} • ${activeGrievanceModal?.subject}`}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleArbitrationSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Update Case Status *
            </label>
            <select
              value={arbitrationForm.status}
              onChange={(e) => setArbitrationForm({ ...arbitrationForm, status: e.target.value })}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 focus:border-blue-600 focus:outline-none font-semibold"
            >
              <option value="Submitted">Submitted (Initial Intake)</option>
              <option value="Under Investigation">Under Investigation</option>
              <option value="Arbitration Hearing">Arbitration Hearing in Progress</option>
              <option value="Action Taken">Action Taken (Interim Remedy)</option>
              <option value="Resolved">Resolved (Settled & Closed)</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Arbitration Action / Milestone *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Conducted neutral mediation hearing with both parties"
              value={arbitrationForm.actionTaken}
              onChange={(e) => setArbitrationForm({ ...arbitrationForm, actionTaken: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Investigator & Hearing Notes
            </label>
            <textarea
              rows={3}
              placeholder="Evidence reviewed, stakeholder interviews, findings..."
              value={arbitrationForm.notes}
              onChange={(e) => setArbitrationForm({ ...arbitrationForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono font-bold uppercase text-slate-600 mb-1">
              Resolution Outcome & Final Settlement (if resolved)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Overtime credit reconciled and approved. Disciplinary warning issued to involved party..."
              value={arbitrationForm.resolutionOutcome}
              onChange={(e) => setArbitrationForm({ ...arbitrationForm, resolutionOutcome: e.target.value })}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:outline-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsArbitrationOpen(false)}
              className="rounded-xl border border-slate-300 px-5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-blue-600 px-6 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              Append Audit Trail & Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
