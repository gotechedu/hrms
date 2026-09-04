import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  MessageSquare,
  Search,
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Trash2,
  FileText,
  DollarSign,
  Building2,
  RefreshCw,
  List,
  LayoutGrid,
  Plus,
  X,
  Send,
  User,
  Shield,
  Briefcase,
  ExternalLink,
  MessageCircle,
} from "lucide-react";
import { contactApi } from "../../Service";
import toast from "react-hot-toast";

const STATUS_CONFIG = {
  New: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200", dot: "bg-blue-500" },
  Contacted: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200", dot: "bg-purple-500" },
  "In Discussion": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", dot: "bg-amber-500" },
  "Proposal Sent": { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200", dot: "bg-indigo-500" },
  Converted: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500" },
  Closed: { bg: "bg-slate-100", text: "text-slate-600", border: "border-slate-200", dot: "bg-slate-400" },
};

const SERVICES_OPTIONS = [
  "All",
  "Enterprise Software (ERP/CRM/POS)",
  "AI Solutions & Autonomous Agents",
  "Cloud Infrastructure & DevOps",
  "Cybersecurity & Zero-Trust Defense",
  "Tech Training & Corporate Upskilling",
  "Digital Growth & Performance Marketing",
];

const BUDGET_OPTIONS = [
  "All",
  "<$10,000",
  "$10,000 – $50,000",
  "$50,000 – $100,000+",
  "Enterprise Retainer",
];

export default function Contacts() {
  const { user } = useSelector((state) => state.auth);

  // Inquiries List State
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedService, setSelectedService] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'

  // Quick Stats
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    inDiscussion: 0,
    converted: 0,
  });

  // Selected Detail Modal
  const [activeInquiry, setActiveInquiry] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);

  // Manual Lead Creation Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    service: "Enterprise Software (ERP/CRM/POS)",
    budget: "$10,000 – $50,000",
    message: "",
    status: "New",
    priority: "Medium",
    note: "",
  });

  const userRole = (user?.role || "").toLowerCase();
  const canManage = ["superadmin", "admin", "hr", "manager"].includes(userRole);

  const fetchStats = async () => {
    try {
      const res = await contactApi.getStats();
      if (res && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error("Failed to load inquiry stats:", err);
    }
  };

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await contactApi.getInquiries({
        status: selectedStatus,
        service: selectedService,
        search,
      });
      if (res && res.inquiries) {
        setInquiries(res.inquiries);
      }
    } catch (err) {
      console.error("Failed to fetch inquiries:", err);
      toast.error(err.message || "Failed to load client inquiries");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
    fetchStats();
  }, [selectedStatus, selectedService]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInquiries();
    fetchStats();
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInquiries();
  };

  const handleStatusChange = async (inquiryId, newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await contactApi.updateInquiry(inquiryId, { status: newStatus });
      if (res && res.inquiry) {
        toast.success(`Inquiry status updated to ${newStatus}`);
        setInquiries((prev) =>
          prev.map((item) => (item._id === inquiryId ? { ...item, status: newStatus } : item))
        );
        if (activeInquiry && activeInquiry._id === inquiryId) {
          setActiveInquiry((prev) => ({ ...prev, status: newStatus }));
        }
        fetchStats();
      }
    } catch (err) {
      console.error("Error updating status:", err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !activeInquiry) return;
    try {
      setSubmittingNote(true);
      const res = await contactApi.updateInquiry(activeInquiry._id, { note: noteText.trim() });
      if (res && res.inquiry) {
        toast.success("Follow-up note logged");
        setActiveInquiry(res.inquiry);
        setInquiries((prev) =>
          prev.map((item) => (item._id === activeInquiry._id ? res.inquiry : item))
        );
        setNoteText("");
      }
    } catch (err) {
      console.error("Error adding note:", err);
      toast.error(err.message || "Failed to append follow-up note");
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Move this consultation inquiry to the Recycle Bin?")) return;

    try {
      await contactApi.deleteInquiry(id);
      toast.success("Inquiry moved to Universal Recycle Bin");
      setInquiries((prev) => prev.filter((item) => item._id !== id));
      if (activeInquiry && activeInquiry._id === id) {
        setActiveInquiry(null);
      }
      fetchStats();
    } catch (err) {
      console.error("Error deleting inquiry:", err);
      toast.error(err.message || "Failed to delete inquiry");
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await contactApi.createManualInquiry(createForm);
      if (res && res.inquiry) {
        toast.success("New client inquiry registered successfully!");
        setIsCreateModalOpen(false);
        setCreateForm({
          fullName: "",
          email: "",
          phone: "",
          company: "",
          service: "Enterprise Software (ERP/CRM/POS)",
          budget: "$10,000 – $50,000",
          message: "",
          status: "New",
          priority: "Medium",
          note: "",
        });
        fetchInquiries();
        fetchStats();
      }
    } catch (err) {
      console.error("Error registering lead:", err);
      toast.error(err.message || "Failed to register lead");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* =====================================================
          PAGE HEADER & ACTIONS
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Client Consultations & Leads
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              Live Pipeline
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Real-time consultation requests and enterprise project inquiries submitted via GoTechEdu Official Portal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
            title="Refresh Inquiries"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? "animate-spin text-blue-600" : ""}`} />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Log Client Lead
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          METRIC KPI CARDS
      ====================================================== */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {/* Total Inquiries */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
              Total Inquiries
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-900">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-slate-500">All recorded portal briefs</p>
        </div>

        {/* New / Action Required */}
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600">
              New / Pending
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-700">{stats.new}</p>
          <p className="mt-0.5 text-[11px] text-blue-600/80">Requires architect review</p>
        </div>

        {/* In Discussion */}
        <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50/40 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-600">
              In Discussion
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700">{stats.inDiscussion}</p>
          <p className="mt-0.5 text-[11px] text-amber-600/80">Discovery & scoping active</p>
        </div>

        {/* Converted */}
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-600">
              Converted Deals
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{stats.converted}</p>
          <p className="mt-0.5 text-[11px] text-emerald-600/80">Contracts & sprints closed</p>
        </div>
      </div>

      {/* =====================================================
          FILTER, SEARCH & VIEW CONTROLS
      ====================================================== */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by client name, email, phone, company, or scope keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
          </form>

          {/* Filters & View Modes */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Service Filter */}
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            >
              {SERVICES_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt === "All" ? "All Solution Tracks" : opt}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "table"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-semibold transition ${
                  viewMode === "grid"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          {["All", "New", "Contacted", "In Discussion", "Proposal Sent", "Converted", "Closed"].map(
            (status) => {
              const active = selectedStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                    active
                      ? "bg-slate-900 text-white shadow-2xs"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200/60"
                  }`}
                >
                  {status !== "All" && STATUS_CONFIG[status] && (
                    <span className={`h-2 w-2 rounded-full ${STATUS_CONFIG[status].dot}`} />
                  )}
                  {status}
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* =====================================================
          CONTENT: TABLE VIEW OR GRID VIEW
      ====================================================== */}
      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
          <p className="mt-3 text-xs font-semibold text-slate-500">Loading consultation records...</p>
        </div>
      ) : inquiries.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
            <MessageSquare className="h-6 w-6" />
          </div>
          <h3 className="mt-3 text-base font-bold text-slate-900">No Inquiries Found</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            {search || selectedStatus !== "All" || selectedService !== "All"
              ? "No records match your active search or filter criteria. Try resetting filters."
              : "No client consultation requests have arrived yet. Submissions from the official website contact page will appear here immediately."}
          </p>
          {(search || selectedStatus !== "All" || selectedService !== "All") && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedStatus("All");
                setSelectedService("All");
              }}
              className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3.5 pl-4 pr-3">Client & Company</th>
                  <th className="px-3 py-3.5">Contact Details</th>
                  <th className="px-3 py-3.5">Service Requested</th>
                  <th className="px-3 py-3.5">Est. Budget</th>
                  <th className="px-3 py-3.5">Status</th>
                  <th className="px-3 py-3.5">Submitted</th>
                  <th className="py-3.5 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {inquiries.map((inq) => {
                  const statusStyle = STATUS_CONFIG[inq.status] || STATUS_CONFIG.New;
                  const initial = (inq.fullName || "C").charAt(0).toUpperCase();

                  return (
                    <tr
                      key={inq._id}
                      onClick={() => setActiveInquiry(inq)}
                      className="hover:bg-slate-50/80 cursor-pointer transition"
                    >
                      {/* Client Info */}
                      <td className="py-3 pl-4 pr-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-2xs text-xs">
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block hover:text-blue-600 transition">
                              {inq.fullName}
                            </span>
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-slate-400" />
                              {inq.company || "Individual / Independent"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Channels */}
                      <td className="px-3 py-3">
                        <div className="space-y-0.5">
                          <a
                            href={`mailto:${inq.email}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-800 hover:text-blue-600 transition flex items-center gap-1 text-[11px]"
                          >
                            <Mail className="h-3 w-3 text-slate-400" />
                            {inq.email}
                          </a>
                          <a
                            href={`tel:${inq.phone}`}
                            onClick={(e) => e.stopPropagation()}
                            className="text-slate-600 hover:text-emerald-600 transition flex items-center gap-1 text-[11px]"
                          >
                            <Phone className="h-3 w-3 text-slate-400" />
                            {inq.phone}
                          </a>
                        </div>
                      </td>

                      {/* Service */}
                      <td className="px-3 py-3">
                        <span className="inline-block max-w-[180px] truncate rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-800" title={inq.service}>
                          {inq.service}
                        </span>
                      </td>

                      {/* Budget */}
                      <td className="px-3 py-3">
                        <span className="font-mono font-bold text-slate-800 text-xs">
                          {inq.budget || "Not Specified"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={inq.status}
                          onChange={(e) => handleStatusChange(inq._id, e.target.value)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border} focus:outline-none cursor-pointer`}
                        >
                          {Object.keys(STATUS_CONFIG).map((st) => (
                            <option key={st} value={st} className="bg-white text-slate-900">
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* Submitted Date */}
                      <td className="px-3 py-3 text-[11px] text-slate-500 whitespace-nowrap">
                        {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Action Triggers */}
                      <td className="py-3 pl-3 pr-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setActiveInquiry(inq)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 transition"
                            title="View Full Scope"
                          >
                            <FileText className="h-4 w-4" />
                          </button>

                          <a
                            href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition"
                            title="Direct WhatsApp"
                          >
                            <MessageCircle className="h-4 w-4" />
                          </a>

                          {canManage && (
                            <button
                              type="button"
                              onClick={(e) => handleDelete(inq._id, e)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                              title="Delete to Recycle Bin"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* CARD GRID VIEW */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {inquiries.map((inq) => {
            const statusStyle = STATUS_CONFIG[inq.status] || STATUS_CONFIG.New;
            const initial = (inq.fullName || "C").charAt(0).toUpperCase();

            return (
              <div
                key={inq._id}
                onClick={() => setActiveInquiry(inq)}
                className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs hover:shadow-sm hover:border-slate-300 transition cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 font-bold text-white shadow-2xs text-sm">
                        {initial}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition">
                          {inq.fullName}
                        </h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {inq.company || "Independent"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                      {inq.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Track:</span>
                      <span className="font-semibold text-slate-800 truncate">{inq.service}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-mono text-[10px] uppercase">Budget:</span>
                      <span className="font-mono font-bold text-blue-600">{inq.budget}</span>
                    </div>
                  </div>

                  <div className="mt-3.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 line-clamp-3 leading-relaxed border border-slate-100">
                    "{inq.message}"
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(inq.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`mailto:${inq.email}`}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                      title="Send Mail"
                    >
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                    <a
                      href={`tel:${inq.phone}`}
                      className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
                      title="Call Client"
                    >
                      <Phone className="h-3.5 w-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setActiveInquiry(inq)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      title="View Details"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =====================================================
          INQUIRY DETAIL MODAL
      ====================================================== */}
      {activeInquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-lg shadow-sm">
                  {(activeInquiry.fullName || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeInquiry.fullName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Building2 className="h-3 w-3" />
                    {activeInquiry.company || "Independent Enterprise Client"}
                    <span className="text-slate-300">•</span>
                    <span>Received {new Date(activeInquiry.createdAt).toLocaleString("en-IN")}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Pipeline Stage:
                </span>
                <select
                  value={activeInquiry.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(activeInquiry._id, e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {Object.keys(STATUS_CONFIG).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Direct Communication Action Triggers */}
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeInquiry.phone}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-emerald-700 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call Client
                </a>

                <a
                  href={`mailto:${activeInquiry.email}?subject=GoTechEdu%20Consultation%20Follow-up%20-%20${encodeURIComponent(
                    activeInquiry.service
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Send Email
                </a>

                <a
                  href={`https://wa.me/${activeInquiry.phone.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Inquiry Scope & Meta Details */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Target Technical Solution
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">{activeInquiry.service}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Estimated Project Budget
                </p>
                <p className="mt-1 text-sm font-bold text-blue-600 font-mono">
                  {activeInquiry.budget || "Not Specified"}
                </p>
              </div>
            </div>

            {/* Scope Message */}
            <div className="mt-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Client Project Brief & Architecture Scope
              </p>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {activeInquiry.message}
              </div>
            </div>

            {/* Internal Staff Notes & Audit Log */}
            <div className="mt-6 pt-4 border-t border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                Staff Follow-up Notes ({activeInquiry.adminNotes?.length || 0})
              </h4>

              {/* Note List */}
              <div className="space-y-2 max-h-40 overflow-y-auto mb-3">
                {activeInquiry.adminNotes && activeInquiry.adminNotes.length > 0 ? (
                  activeInquiry.adminNotes.map((nt, idx) => (
                    <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                        <span className="font-bold text-slate-700">{nt.author || "Staff"}</span>
                        <span>{new Date(nt.createdAt).toLocaleString("en-IN")}</span>
                      </div>
                      <p className="text-slate-800">{nt.note}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No staff remarks logged yet.</p>
                )}
              </div>

              {/* Add Note Input */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Record an internal follow-up remark, call summary, or NDA status..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddNote();
                  }}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 py-2 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  disabled={submittingNote || !noteText.trim()}
                  onClick={handleAddNote}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition flex items-center gap-1"
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </button>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              {canManage && (
                <button
                  type="button"
                  onClick={() => handleDelete(activeInquiry._id)}
                  className="rounded-xl border border-red-200 text-red-600 px-4 py-2 text-xs font-bold hover:bg-red-50 transition flex items-center gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Move to Recycle Bin
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveInquiry(null)}
                className="ml-auto rounded-xl bg-slate-100 px-5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          MANUAL LEAD REGISTRATION MODAL
      ====================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Log Offline Consultation Lead</h3>
                <p className="text-xs text-slate-500">Record direct telephone or exhibition client inquiries.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Verma"
                  value={createForm.fullName}
                  onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    value={createForm.email}
                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Infotech Pvt Ltd"
                    value={createForm.company}
                    onChange={(e) => setCreateForm({ ...createForm, company: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                    Budget Scope
                  </label>
                  <select
                    value={createForm.budget}
                    onChange={(e) => setCreateForm({ ...createForm, budget: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
                  >
                    {BUDGET_OPTIONS.filter((b) => b !== "All").map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Primary Solution Area
                </label>
                <select
                  value={createForm.service}
                  onChange={(e) => setCreateForm({ ...createForm, service: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 bg-white focus:border-blue-600 focus:outline-none"
                >
                  {SERVICES_OPTIONS.filter((s) => s !== "All").map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1">
                  Project Scope & Brief *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Summary of client's requirements, timelines, and current tech stack..."
                  value={createForm.message}
                  onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  {creating ? "Saving..." : "Save Inquiry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
