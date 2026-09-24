import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  ArrowLeft,
  Mail,
  Phone,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  DollarSign,
  Send,
  MessageCircle,
  Shield,
  BookOpen,
  Laptop,
  Check,
  ExternalLink,
  Copy,
  RefreshCw,
  QrCode,
  UserCheck,
  Sparkles,
  Info,
  X,
  Plus,
} from 'lucide-react';
import { contactApi, quotationApi, courseApi } from '../../Service';
import { usePermissions } from '../../utils/usePermissions';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  New: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dot: 'bg-blue-500' },
  Contacted: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dot: 'bg-purple-500' },
  'In Discussion': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500' },
  'Proposal Sent': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200', dot: 'bg-indigo-500' },
  Converted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  Closed: { bg: 'bg-slate-100', text: 'text-slate-600', border: 'border-slate-200', dot: 'bg-slate-400' },
};

const QUOTE_STATUS_CONFIG = {
  Draft: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
  Sent: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  Viewed: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  Payment_Submitted: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
  Verified: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-300' },
  Rejected: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
  Expired: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
};

export default function InquiryDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { hasPermission, can, isSuperAdmin } = usePermissions();

  const canManage =
    isSuperAdmin ||
    hasPermission('manage_contacts') ||
    hasPermission('manage_contact') ||
    can('manage', 'contacts') ||
    can('edit', 'contacts');

  // Inquiry & Quotation State
  const [inquiry, setInquiry] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status & Notes
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Send Quotation Modal State
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteType, setQuoteType] = useState('learning_course'); // 'learning_course' | 'solution'
  const [sendingQuote, setSendingQuote] = useState(false);

  // Quotation Form
  const [quoteForm, setQuoteForm] = useState({
    recipientName: '',
    recipientEmail: '',
    recipientPhone: '',
    recipientCompany: '',
    courseId: '',
    courseTitle: '',
    batch: 'Current Cohort 2026',
    solutionTitle: '',
    serviceType: 'Enterprise Software (ERP/CRM/POS)',
    scopeDescription: '',
    modules: '',
    estimatedDuration: '8 - 12 Weeks',
    exactPrice: 0,
    offeredPrice: 0,
    validDays: 14,
    terms: '1. Standard curriculum access & live mentorship included.\n2. Access activated immediately upon UPI transaction verification.\n3. Lab environment & recorded lectures valid for lifetime.',
    notes: '',
  });

  // Verify Modal
  const [verifyingQuote, setVerifyingQuote] = useState(null);
  const [verifying, setVerifying] = useState(false);

  const fetchInquiryAndQuotes = async () => {
    try {
      setLoading(true);
      const [inqRes, quotesRes, coursesRes] = await Promise.all([
        contactApi.getInquiryById(id),
        quotationApi.getQuotationsByInquiry(id).catch(() => ({ quotations: [] })),
        courseApi.getCourses().catch(() => ({ courses: [] })),
      ]);

      if (inqRes && inqRes.inquiry) {
        setInquiry(inqRes.inquiry);
        // Pre-fill quotation modal with inquiry contact info
        setQuoteForm((prev) => ({
          ...prev,
          recipientName: inqRes.inquiry.fullName || '',
          recipientEmail: inqRes.inquiry.email || '',
          recipientPhone: inqRes.inquiry.phone || '',
          recipientCompany: inqRes.inquiry.company || '',
          solutionTitle: inqRes.inquiry.service || '',
          scopeDescription: inqRes.inquiry.message || '',
        }));
      }

      if (quotesRes && quotesRes.quotations) {
        setQuotations(quotesRes.quotations);
      }

      const courseList = Array.isArray(coursesRes) ? coursesRes : coursesRes?.courses || [];
      setCourses(courseList);
    } catch (err) {
      console.error('Failed to load inquiry details:', err);
      toast.error(err.message || 'Error loading consultation inquiry details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInquiryAndQuotes();
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInquiryAndQuotes();
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await contactApi.updateInquiry(id, { status: newStatus });
      if (res && res.inquiry) {
        setInquiry((prev) => ({ ...prev, status: newStatus }));
        toast.success(`Inquiry pipeline stage changed to ${newStatus}`);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAddNote = async (e) => {
    if (e) e.preventDefault();
    if (!noteText.trim()) return;

    try {
      setSubmittingNote(true);
      const res = await contactApi.updateInquiry(id, { note: noteText.trim() });
      if (res && res.inquiry) {
        setInquiry(res.inquiry);
        setNoteText('');
        toast.success('Staff remark logged successfully');
      }
    } catch (err) {
      console.error('Failed to add note:', err);
      toast.error(err.message || 'Failed to log note');
    } finally {
      setSubmittingNote(false);
    }
  };

  // When course is selected in quotation modal, auto-populate details & base exact price
  const handleCourseSelect = (courseId) => {
    const selected = courses.find((c) => c._id === courseId);
    if (selected) {
      const price = Number(selected.price || selected.originalPrice || 24999);
      setQuoteForm((prev) => ({
        ...prev,
        courseId: selected._id,
        courseTitle: selected.title,
        exactPrice: price,
        offeredPrice: price, // Default to exact price, staff can manually override
      }));
    } else {
      setQuoteForm((prev) => ({
        ...prev,
        courseId: '',
        courseTitle: '',
        exactPrice: 0,
        offeredPrice: 0,
      }));
    }
  };

  const handleSendQuotationSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.offeredPrice || Number(quoteForm.offeredPrice) <= 0) {
      toast.error('Please specify a valid quoted price (greater than 0)');
      return;
    }

    try {
      setSendingQuote(true);
      const payload = {
        inquiryId: id,
        type: quoteType,
        recipientName: quoteForm.recipientName,
        recipientEmail: quoteForm.recipientEmail,
        recipientPhone: quoteForm.recipientPhone,
        recipientCompany: quoteForm.recipientCompany,
        exactPrice: Number(quoteForm.exactPrice),
        offeredPrice: Number(quoteForm.offeredPrice),
        validDays: Number(quoteForm.validDays || 14),
        terms: quoteForm.terms,
        notes: quoteForm.notes,
      };

      if (quoteType === 'learning_course') {
        payload.courseId = quoteForm.courseId;
        payload.courseTitle = quoteForm.courseTitle;
        payload.batch = quoteForm.batch;
      } else {
        payload.solutionTitle = quoteForm.solutionTitle;
        payload.serviceType = quoteForm.serviceType;
        payload.scopeDescription = quoteForm.scopeDescription;
        payload.modules = quoteForm.modules
          ? quoteForm.modules.split('\n').filter((m) => m.trim())
          : [];
        payload.estimatedDuration = quoteForm.estimatedDuration;
      }

      const res = await quotationApi.sendQuotation(payload);
      if (res && res.success) {
        const publicUrl = res.quotationUrl;
        if (publicUrl) {
          navigator.clipboard.writeText(publicUrl).catch(() => {});
          toast.success(
            `Quotation #${res.quotation?.quotationNumber} dispatched via email! Link copied to clipboard.`,
            { duration: 5000 }
          );
        } else {
          toast.success(`Quotation ${res.quotation?.quotationNumber || ''} sent via email!`);
        }
        setIsQuoteModalOpen(false);
        fetchInquiryAndQuotes();
      }
    } catch (err) {
      console.error('Failed to send quotation:', err);
      toast.error(err.message || 'Error generating and dispatching quotation');
    } finally {
      setSendingQuote(false);
    }
  };

  const handleVerifyEnrollment = async (quote) => {
    try {
      setVerifying(true);
      const res = await quotationApi.verifyQuotation(quote._id);
      if (res && res.success) {
        toast.success('Enrollment verified! Student account activated & welcome credentials email sent.');
        setVerifyingQuote(null);
        fetchInquiryAndQuotes();
      }
    } catch (err) {
      console.error('Failed to verify enrollment:', err);
      toast.error(err.message || 'Error verifying enrollment');
    } finally {
      setVerifying(false);
    }
  };

  const copyToClipboard = (text, label = 'Copied') => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[450px] flex-col items-center justify-center gap-3">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Loading consultation inquiry details...</p>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">Inquiry Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">
          The requested client consultation record does not exist or has been removed.
        </p>
        <Link
          to="/contacts"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </Link>
      </div>
    );
  }

  const currentStatusStyle = STATUS_CONFIG[inquiry.status] || STATUS_CONFIG.New;

  return (
    <div className="space-y-6 pb-16">
      {/* =====================================================
          TOP BREADCRUMB & HEADER
      ====================================================== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <Link to="/contacts" className="hover:text-blue-600 transition flex items-center gap-1">
              <ArrowLeft className="h-3.5 w-3.5" />
              Client Pipeline
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">Inquiry Details</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              {inquiry.fullName}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${currentStatusStyle.bg} ${currentStatusStyle.text} border ${currentStatusStyle.border}`}
            >
              <span className={`h-2 w-2 rounded-full ${currentStatusStyle.dot}`} />
              {inquiry.status}
            </span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-slate-600">
              {inquiry.priority} Priority
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Registered on {new Date(inquiry.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} • Source:{' '}
            <span className="font-semibold text-slate-700">{inquiry.source || 'Official Portal'}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-500 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            Refresh
          </button>

          {canManage && (
            <button
              type="button"
              onClick={() => setIsQuoteModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
            >
              <Send className="h-3.5 w-3.5" />
              Generate & Send Quotation
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          MAIN GRID: CLIENT DETAILS & SCOPE BRIEF
      ====================================================== */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Scope & Quotation Hub */}
        <div className="space-y-6 lg:col-span-2">
          {/* Project Scope & Consultation Info Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Laptop className="h-4 w-4 text-blue-600" />
                Technical Solution Requirements
              </h2>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Pipeline:</span>
                <select
                  value={inquiry.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {Object.keys(STATUS_CONFIG).map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Target Service / Course Domain
                </p>
                <p className="mt-1 text-sm font-bold text-slate-900">{inquiry.service}</p>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Client Project Budget Estimate
                </p>
                <p className="mt-1 text-sm font-bold text-blue-600 font-mono">
                  {inquiry.budget || 'Not Specified'}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Client Project Brief & Architecture Scope
              </p>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                {inquiry.message}
              </div>
            </div>
          </div>

          {/* =====================================================
              QUOTATION MANAGEMENT HUB
          ====================================================== */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  Commercial Quotations & Registrations ({quotations.length})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Official quotations dispatched with UPI handles & candidate verification state.
                </p>
              </div>

              {canManage && (
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-slate-800 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Quotation
                </button>
              )}
            </div>

            {/* Quotations List */}
            <div className="mt-5 space-y-4">
              {quotations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center bg-slate-50/50">
                  <FileText className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-xs font-bold text-slate-700">No Quotations Issued Yet</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Generate an official quotation for a Learning Program or IT Solution to send to this client.
                  </p>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Create First Quotation
                    </button>
                  )}
                </div>
              ) : (
                quotations.map((quote) => {
                  const statusStyle = QUOTE_STATUS_CONFIG[quote.status] || QUOTE_STATUS_CONFIG.Draft;
                  const mainSiteUrl = (
                    import.meta.env.VITE_MAIN_URL ||
                    'http://localhost:3000'
                  ).replace(/\/+$/, '');
                  const publicUrl = `${mainSiteUrl}/quotation/${quote._id}`;

                  return (
                    <div
                      key={quote._id}
                      className={`rounded-2xl border p-5 transition ${
                        quote.status === 'Payment_Submitted'
                          ? 'border-amber-300 bg-amber-50/30'
                          : quote.status === 'Verified'
                          ? 'border-emerald-300 bg-emerald-50/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-extrabold text-slate-900">
                            #{quote.quotationNumber}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                              quote.type === 'learning_course'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {quote.type === 'learning_course' ? 'Learning Program' : 'IT Solution'}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
                          >
                            {quote.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(publicUrl, 'Quotation Link')}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                            title="Copy Public Quotation URL"
                          >
                            <Copy className="h-3 w-3 text-slate-500" />
                            Copy Link
                          </button>

                          <a
                            href={`https://wa.me/${(quote.recipient?.phone || inquiry.phone).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                              `Hello ${quote.recipient?.name || inquiry.fullName}, here is your official GoTechEdu quotation for ${
                                quote.type === 'learning_course' ? quote.courseTitle : quote.solutionTitle
                              } (Ref: ${quote.quotationNumber}):\n${publicUrl}\n\nPlease review and submit your registration details.`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition"
                            title="Share directly via WhatsApp"
                          >
                            <MessageCircle className="h-3 w-3 text-emerald-600" />
                            WhatsApp
                          </a>

                          <a
                            href={publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
                            title="Open on Main Site"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View on Main
                          </a>
                        </div>
                      </div>

                      {/* Main Quote Item & Price */}
                      <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {quote.type === 'learning_course' ? quote.courseTitle : quote.solutionTitle}
                          </h4>
                          <p className="text-xs text-slate-500">
                            Sent to: <span className="font-medium text-slate-800">{quote.recipient.email}</span> •{' '}
                            Issued: {new Date(quote.sentAt || quote.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="flex items-baseline sm:justify-end gap-2">
                            {quote.exactPrice > quote.offeredPrice && (
                              <span className="text-xs text-slate-400 line-through">
                                ₹{quote.exactPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                            <span className="font-mono text-lg font-black text-blue-600">
                              ₹{quote.offeredPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          {quote.discount > 0 && (
                            <span className="text-[10px] font-bold text-emerald-600">
                              Discount: ₹{quote.discount.toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Payment Submission Alert Box (When Client Paid via UPI) */}
                      {quote.paymentSubmission && quote.paymentSubmission.utrNumber && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                                Candidate Registration & UPI Proof Submitted
                              </div>
                              <p className="text-[11px] text-amber-800 mt-0.5">
                                Candidate registered to course. Status is currently{' '}
                                <strong className="font-bold underline">Pending</strong> awaiting admin verification.
                              </p>
                            </div>

                            {quote.status !== 'Verified' && canManage && (
                              <button
                                type="button"
                                onClick={() => setVerifyingQuote(quote)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                              >
                                <UserCheck className="h-3.5 w-3.5" />
                                Verify Payment & Approve
                              </button>
                            )}
                          </div>

                          <div className="mt-3 grid gap-2 sm:grid-cols-3 text-xs">
                            <div className="rounded-lg bg-white/80 p-2.5 border border-amber-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Student Name & Email
                              </span>
                              <span className="font-semibold text-slate-900">
                                {quote.paymentSubmission.studentName}
                              </span>
                              <span className="block text-[11px] text-slate-600">
                                {quote.paymentSubmission.email}
                              </span>
                            </div>

                            <div className="rounded-lg bg-white/80 p-2.5 border border-amber-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                UPI UTR / Ref Number
                              </span>
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-emerald-800">
                                  {quote.paymentSubmission.utrNumber}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(quote.paymentSubmission.utrNumber, 'UTR Number')}
                                  className="text-slate-400 hover:text-slate-700"
                                >
                                  <Copy className="h-3 w-3" />
                                </button>
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                Paid via: {quote.paymentSubmission.upiIdPaidTo || 'gotechedu@ybl'}
                              </span>
                            </div>

                            <div className="rounded-lg bg-white/80 p-2.5 border border-amber-200/60">
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                College / Company & Phone
                              </span>
                              <span className="font-semibold text-slate-900">
                                {quote.paymentSubmission.phone || 'N/A'}
                              </span>
                              <span className="block text-[11px] text-slate-600 truncate">
                                {quote.paymentSubmission.collegeOrCompany || 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Verified Badge Details */}
                      {quote.status === 'Verified' && (
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 p-2.5 border border-emerald-200 text-xs text-emerald-800">
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>
                              <strong>Verified & Active!</strong> Student is enrolled and able to log in to portal.
                            </span>
                          </div>
                          {quote.verifiedAt && (
                            <span className="text-[11px] text-emerald-700">
                              Verified on {new Date(quote.verifiedAt).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Client Contact Info & Staff Activity Notes */}
        <div className="space-y-6">
          {/* Client Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              Client Profile
            </h2>

            <div className="mt-4 space-y-3.5 text-xs">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 font-bold text-blue-700 text-sm">
                  {inquiry.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{inquiry.fullName}</h3>
                  <p className="text-slate-500">{inquiry.company || 'Individual Client'}</p>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3.5 space-y-2.5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email:
                  </span>
                  <a href={`mailto:${inquiry.email}`} className="font-semibold text-blue-600 hover:underline">
                    {inquiry.email}
                  </a>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone:
                  </span>
                  <a href={`tel:${inquiry.phone}`} className="font-semibold text-slate-800 hover:underline">
                    {inquiry.phone}
                  </a>
                </div>

                {inquiry.company && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      Company:
                    </span>
                    <span className="font-semibold text-slate-800">{inquiry.company}</span>
                  </div>
                )}
              </div>

              {/* Direct Communication Buttons */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`tel:${inquiry.phone}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-emerald-600 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
                >
                  <Phone className="h-3.5 w-3.5" />
                  Call
                </a>
                <a
                  href={`mailto:${inquiry.email}?subject=GoTechEdu%20Consultation%20Follow-up%20-%20${encodeURIComponent(
                    inquiry.service
                  )}`}
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                >
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </a>
                <a
                  href={`https://wa.me/${inquiry.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1 rounded-xl bg-[#25D366] py-2 text-xs font-bold text-white hover:bg-[#20ba5a] transition"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Internal Staff Notes & Timeline */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-600" />
                Staff Activity Remarks
              </span>
              <span className="text-xs font-normal text-slate-400">
                {inquiry.adminNotes?.length || 0} Notes
              </span>
            </h3>

            {/* Note log */}
            <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {inquiry.adminNotes && inquiry.adminNotes.length > 0 ? (
                inquiry.adminNotes.map((nt, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 p-3 border border-slate-200/70 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                      <span className="font-bold text-slate-700">{nt.author || 'Staff'}</span>
                      <span>{new Date(nt.createdAt).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{nt.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic text-center py-4">No staff remarks logged yet.</p>
              )}
            </div>

            {/* Add note input */}
            <form onSubmit={handleAddNote} className="mt-4 space-y-2">
              <textarea
                rows={2}
                placeholder="Record a call remark, client requirement update, or next steps..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs text-slate-900 focus:border-blue-600 focus:bg-white focus:outline-none resize-none"
              />
              <button
                type="submit"
                disabled={submittingNote || !noteText.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition"
              >
                <Send className="h-3 w-3" />
                Append Note
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* =====================================================
          SEND QUOTATION MODAL
      ====================================================== */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Generate & Send Official Quotation
                </h3>
                <p className="text-xs text-slate-500">
                  Sends a commercial quotation email with mapped details, 3 UPI IDs, and scan QR code.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSendQuotationSubmit} className="mt-4 space-y-4 text-xs">
              {/* Quotation Type Toggle */}
              <div>
                <label className="block font-bold uppercase text-[10px] tracking-wider text-slate-700 mb-1.5">
                  Quotation Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setQuoteType('learning_course')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold transition cursor-pointer ${
                      quoteType === 'learning_course'
                        ? 'border-blue-600 bg-blue-50 text-blue-700 ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <BookOpen className="h-4 w-4" />
                    Learning Course / Training
                  </button>

                  <button
                    type="button"
                    onClick={() => setQuoteType('solution')}
                    className={`flex items-center justify-center gap-2 rounded-xl border p-3 font-bold transition cursor-pointer ${
                      quoteType === 'solution'
                        ? 'border-purple-600 bg-purple-50 text-purple-700 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Laptop className="h-4 w-4" />
                    Enterprise / IT Solution
                  </button>
                </div>
              </div>

              {/* Recipient Basic Details */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                  Recipient Information
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Name *</label>
                    <input
                      type="text"
                      required
                      value={quoteForm.recipientName}
                      onChange={(e) => setQuoteForm({ ...quoteForm, recipientName: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Email *</label>
                    <input
                      type="email"
                      required
                      value={quoteForm.recipientEmail}
                      onChange={(e) => setQuoteForm({ ...quoteForm, recipientEmail: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-600 mb-0.5">Phone *</label>
                    <input
                      type="text"
                      required
                      value={quoteForm.recipientPhone}
                      onChange={(e) => setQuoteForm({ ...quoteForm, recipientPhone: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              {/* Specifics: If Learning Course */}
              {quoteType === 'learning_course' ? (
                <div className="space-y-3 rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 block">
                    Map Related Course & Exact Catalog Pricing
                  </span>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 mb-1">
                      Select Course Program *
                    </label>
                    <select
                      value={quoteForm.courseId}
                      onChange={(e) => handleCourseSelect(e.target.value)}
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-semibold text-slate-900 focus:border-blue-600 focus:outline-none"
                    >
                      <option value="">-- Choose from Course Catalog --</option>
                      {courses.map((c) => (
                        <option key={c._id} value={c._id}>
                          {c.title} • ₹{Number(c.price || 0).toLocaleString('en-IN')} ({c.category || 'Tech'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Catalog Exact Price (₹)
                      </label>
                      <input
                        type="number"
                        value={quoteForm.exactPrice}
                        onChange={(e) => setQuoteForm({ ...quoteForm, exactPrice: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 bg-slate-100 p-2 font-mono font-bold text-slate-800 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-blue-700 mb-1">
                        Current Quoted Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteForm.offeredPrice}
                        onChange={(e) => setQuoteForm({ ...quoteForm, offeredPrice: Number(e.target.value) })}
                        className="w-full rounded-xl border-2 border-blue-500 bg-white p-2 font-mono font-bold text-blue-700 focus:outline-none shadow-2xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Assigned Cohort / Batch
                      </label>
                      <input
                        type="text"
                        value={quoteForm.batch}
                        onChange={(e) => setQuoteForm({ ...quoteForm, batch: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>

                  {quoteForm.exactPrice > quoteForm.offeredPrice && (
                    <p className="text-[11px] font-bold text-emerald-600">
                      ✓ Special candidate discount applied: ₹
                      {(quoteForm.exactPrice - quoteForm.offeredPrice).toLocaleString('en-IN')} (
                      {Math.round(
                        ((quoteForm.exactPrice - quoteForm.offeredPrice) / quoteForm.exactPrice) * 100
                      )}
                      % off)
                    </p>
                  )}
                </div>
              ) : (
                /* Specifics: If Enterprise / IT Solution */
                <div className="space-y-3 rounded-2xl border border-purple-100 bg-purple-50/30 p-4">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-800 block">
                    Enterprise Technical Scope & Solution Pricing
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Solution Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Enterprise ERP & Inventory Management Suite"
                        value={quoteForm.solutionTitle}
                        onChange={(e) => setQuoteForm({ ...quoteForm, solutionTitle: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Estimated Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={quoteForm.estimatedDuration}
                        onChange={(e) => setQuoteForm({ ...quoteForm, estimatedDuration: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-slate-900 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 mb-1">
                        Base Estimated Cost (₹)
                      </label>
                      <input
                        type="number"
                        value={quoteForm.exactPrice}
                        onChange={(e) => setQuoteForm({ ...quoteForm, exactPrice: Number(e.target.value) })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 font-mono text-slate-900 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-purple-700 mb-1">
                        Offered Quoted Price (₹) *
                      </label>
                      <input
                        type="number"
                        required
                        value={quoteForm.offeredPrice}
                        onChange={(e) => setQuoteForm({ ...quoteForm, offeredPrice: Number(e.target.value) })}
                        className="w-full rounded-xl border-2 border-purple-500 bg-white p-2 font-mono font-bold text-purple-700 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Gateways Info Box */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1.5">
                  <QrCode className="h-3.5 w-3.5 text-emerald-600" />
                  Official Payment Gateways & UPI Handles Included in Email
                </span>
                <p className="text-[11px] text-emerald-700 mb-2">
                  The client email will prominently display the 3 official UPI handles with dynamic scan QR code:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  <span className="rounded-lg bg-white px-2.5 py-1 font-mono font-bold text-[11px] text-emerald-800 border border-emerald-300">
                    gotechedu@ybl (Primary)
                  </span>
                  <span className="rounded-lg bg-white px-2.5 py-1 font-mono font-bold text-[11px] text-emerald-800 border border-emerald-300">
                    gotechedu@ibl
                  </span>
                  <span className="rounded-lg bg-white px-2.5 py-1 font-mono font-bold text-[11px] text-emerald-800 border border-emerald-300">
                    gotechedu@axl
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Custom Terms & Validity Notes
                </label>
                <textarea
                  rows={2}
                  value={quoteForm.notes}
                  onChange={(e) => setQuoteForm({ ...quoteForm, notes: e.target.value })}
                  placeholder="e.g. Special student concession granted for 2026 Batch. Valid for 14 days."
                  className="w-full rounded-xl border border-slate-300 p-2 text-slate-900 focus:outline-none resize-none"
                />
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingQuote}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition"
                >
                  <Send className={`h-3.5 w-3.5 ${sendingQuote ? 'animate-spin' : ''}`} />
                  {sendingQuote ? 'Dispatching Quotation...' : 'Send Quotation Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          VERIFY ENROLLMENT CONFIRMATION MODAL
      ====================================================== */}
      {verifyingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <div className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                <UserCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">
                Verify Payment & Approve Enrollment
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                You are verifying UPI payment for Quotation #{verifyingQuote.quotationNumber}.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-50 p-3.5 border border-slate-200/70 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-900">
                  {verifyingQuote.paymentSubmission?.studentName || verifyingQuote.recipient.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email:</span>
                <span className="font-semibold text-slate-900">
                  {verifyingQuote.paymentSubmission?.email || verifyingQuote.recipient.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Submitted UTR:</span>
                <span className="font-mono font-bold text-emerald-700">
                  {verifyingQuote.paymentSubmission?.utrNumber || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Quoted Amount:</span>
                <span className="font-bold text-blue-600 font-mono">
                  ₹{verifyingQuote.offeredPrice.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-blue-50 p-3 text-[11px] text-blue-800 leading-relaxed">
              <strong className="block font-bold mb-0.5">Verification Actions Triggered:</strong>
              1. Student account status updated from <em>pending</em> to <strong>active</strong>.<br />
              2. Student will be able to log in to the learning portal.<br />
              3. Automatic verification & welcome email dispatched with login credentials.
            </div>

            <div className="mt-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setVerifyingQuote(null)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={verifying}
                onClick={() => handleVerifyEnrollment(verifyingQuote)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                <Check className={`h-3.5 w-3.5 ${verifying ? 'animate-spin' : ''}`} />
                {verifying ? 'Verifying & Activating...' : 'Approve & Activate Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
