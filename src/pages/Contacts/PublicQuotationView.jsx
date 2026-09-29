import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  BookOpen,
  Laptop,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  Mail,
  Phone,
  Building,
  GraduationCap,
  FileCheck,
  ShieldCheck,
  Calendar,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { quotationApi } from '../../Service';
import toast from 'react-hot-toast';

export default function PublicQuotationView() {
  const { id } = useParams();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(null);

  // Form State
  const [regForm, setRegForm] = useState({
    studentName: '',
    email: '',
    phone: '',
    collegeOrCompany: '',
    qualification: '',
    utrNumber: '',
    upiIdPaidTo: 'gotechedu@ybl',
    notes: '',
  });

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const res = await quotationApi.getPublicQuotation(id);
        if (res && res.quotation) {
          setQuotation(res.quotation);
          setRegForm((prev) => ({
            ...prev,
            studentName: res.quotation.recipient?.name || '',
            email: res.quotation.recipient?.email || '',
            phone: res.quotation.recipient?.phone || '',
            collegeOrCompany: res.quotation.recipient?.company || '',
          }));

          if (res.quotation.status === 'Payment_Submitted' || res.quotation.status === 'Verified') {
            setSubmittedSuccess(true);
          }
        }
      } catch (err) {
        console.error('Failed to load quotation:', err);
        toast.error(err.message || 'Quotation not found or link has expired');
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [id]);

  const copyUpi = (upiId) => {
    navigator.clipboard.writeText(upiId);
    setCopiedUpi(upiId);
    toast.success(`Copied UPI ID: ${upiId}`);
    setTimeout(() => setCopiedUpi(null), 2500);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.utrNumber.trim()) {
      toast.error('Please enter the 12-digit UPI UTR reference number.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await quotationApi.submitRegistration(id, regForm);
      if (res && res.success) {
        setSubmittedSuccess(true);
        toast.success('Registration details & UTR submitted successfully!');
      } else {
        toast.error(res?.message || 'Failed to submit registration');
      }
    } catch (err) {
      console.error('Registration submission error:', err);
      toast.error(err.message || 'Error submitting registration details');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-800 p-4">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="mt-4 text-xs font-semibold text-slate-500">Loading quotation document...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 max-w-md w-full shadow-lg">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
          <h2 className="mt-4 text-xl font-bold text-slate-900">Quotation Document Not Found</h2>
          <p className="mt-2 text-xs text-slate-500">
            This quotation link has expired or does not exist.
          </p>
          <Link
            to="/contacts"
            className="mt-6 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
          >
            Back to Inquiries
          </Link>
        </div>
      </div>
    );
  }

  const isCourse = quotation.type === 'learning_course';
  const titleText = isCourse ? quotation.courseTitle : quotation.solutionTitle;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 py-10 px-4 sm:px-6 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-10 right-1/4 h-80 w-80 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute top-1/2 left-10 h-72 w-72 rounded-full bg-indigo-100/40 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between text-xs">
          <Link
            to="/contacts"
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-blue-600 transition font-medium"
          >
            ← Back to Inquiries Hub
          </Link>
          <span className="font-mono text-xs font-bold text-blue-600">
            QUOTATION #{quotation.quotationNumber}
          </span>
        </div>

        {/* Top Brand Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xl shadow-md shadow-blue-500/20">
              GT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
                  GoTech<span className="text-blue-600">Edu</span>
                </h1>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 border border-blue-200">
                  Commercial Quotation
                </span>
              </div>
              <p className="text-xs text-slate-500">Enterprise Technology & Academia Services</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="font-mono text-xs font-bold text-blue-600 block">
              REF #{quotation.quotationNumber}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-slate-400" />
              Valid Until:{' '}
              <strong className="text-slate-800">
                {quotation.validUntil
                  ? new Date(quotation.validUntil).toLocaleDateString('en-IN', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                  : '14 Days'}
              </strong>
            </span>
          </div>
        </div>

        {/* Main Document Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-6">
          {/* Greeting */}
          <div className="border-b border-slate-100 pb-5">
            <span className="text-[11px] font-mono font-bold text-blue-600 uppercase tracking-wider block mb-1">
              Presented Exclusively To:
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">{quotation.recipient?.name}</h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs sm:text-sm text-slate-600 mt-1">
              {quotation.recipient?.company && (
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <Building className="h-3.5 w-3.5 text-slate-400" />
                  {quotation.recipient.company}
                </span>
              )}
              {quotation.recipient?.email && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  {quotation.recipient.email}
                </span>
              )}
              {quotation.recipient?.phone && (
                <span className="flex items-center gap-1 text-slate-500">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {quotation.recipient.phone}
                </span>
              )}
            </div>
          </div>

          {/* Program / Solution Scope */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="inline-flex items-center gap-1 rounded-md bg-blue-100/70 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                  {isCourse ? (
                    <>
                      <BookOpen className="h-3 w-3 text-blue-600" />
                      Professional Training Track
                    </>
                  ) : (
                    <>
                      <Layers className="h-3 w-3 text-blue-600" />
                      Enterprise Technical Solution
                    </>
                  )}
                </span>
                <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900">{titleText}</h3>
              </div>

              {quotation.duration && (
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 font-semibold flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
                  <Clock className="h-3.5 w-3.5 text-blue-600" />
                  {quotation.duration}
                </div>
              )}
            </div>

            {/* Scope Deliverables */}
            {quotation.deliverables && quotation.deliverables.length > 0 && (
              <div className="pt-2">
                <span className="text-[10px] font-mono uppercase font-bold text-slate-400 block mb-2">
                  Scope &amp; Deliverables:
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {quotation.deliverables.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 rounded-xl bg-white p-2.5 border border-slate-200/80 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price Breakdown Banner */}
            <div className="flex flex-wrap items-baseline justify-between gap-4 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/40 p-4 sm:p-5">
              <div>
                <span className="text-xs text-slate-500 block font-medium">Catalog Standard Fee:</span>
                <span className="text-sm text-slate-400 line-through font-mono font-semibold">
                  ₹{Number(quotation.exactPrice || 0).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] text-blue-700 font-bold block uppercase tracking-wider">
                  Special Approved Quotation Fee:
                </span>
                <span className="font-mono text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  ₹{Number(quotation.offeredPrice || 0).toLocaleString('en-IN')}
                </span>
                {quotation.discount > 0 && (
                  <span className="block mt-0.5 text-xs font-bold text-emerald-700">
                    🎉 Total Direct Savings: ₹{Number(quotation.discount).toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {quotation.notes && (
              <p className="text-xs text-slate-600 italic bg-white p-3 rounded-xl border border-slate-200">
                Note: {quotation.notes}
              </p>
            )}
          </div>

          {/* Official Direct UPI Gateways & Custom QR Code */}
          <div className="rounded-3xl border border-emerald-200/90 bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/50 p-6 sm:p-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-100 pb-3">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  Official Direct UPI Payment Gateways
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Transfer exact quoted fee (₹{Number(quotation.offeredPrice).toLocaleString('en-IN')}) via any UPI application.
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/70 px-3 py-1 text-[11px] font-bold text-emerald-800 border border-emerald-200 self-start sm:self-auto">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Verified Merchant
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 items-center pt-1">
              {/* UPI Handles with One-Click Copy */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-mono uppercase font-bold text-slate-500 block">
                  Click to Copy Official UPI Virtual Payment Address (VPA):
                </span>

                {[
                  { id: 'gotechedu@ybl', bank: 'YES Bank', primary: true },
                  { id: 'gotechedu@ibl', bank: 'ICICI Bank', primary: false },
                  { id: 'gotechedu@axl', bank: 'Axis Bank', primary: false },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => copyUpi(item.id)}
                    className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-emerald-500 hover:shadow-xs transition cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
                      <div>
                        <span className="font-mono text-sm font-bold text-slate-900 group-hover:text-emerald-700 block">
                          {item.id}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.bank}</span>
                      </div>
                      {item.primary && (
                        <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                          Primary
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      className="rounded-lg p-1.5 text-slate-400 group-hover:text-emerald-600"
                    >
                      {copiedUpi === item.id ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                ))}
              </div>

              {/* Official Custom GoTechEdu QR Code */}
              <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-white border border-slate-200 text-center shadow-xs">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
                  GoTechEdu Official UPI Scan-To-Pay
                </span>
                <div className="p-2 rounded-xl bg-slate-900 text-white shadow-sm">
                  <img
                    src="/gotechedu-qr.jpeg"
                    alt="GoTechEdu Official PhonePe UPI QR Code"
                    className="h-48 w-48 object-contain rounded-lg"
                  />
                </div>
                <p className="mt-3 text-xs font-extrabold text-slate-900">Scan with GPay, PhonePe, Paytm, or BHIM</p>
                <p className="text-[11px] font-mono text-slate-500 mt-0.5">
                  Pre-configured Merchant: <strong className="text-slate-800">gotechedu@ybl</strong>
                </p>
                <a
                  href="/gotechedu-qr.jpeg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  View / Open Full QR Image
                </a>
              </div>
            </div>
          </div>

          {/* Registration & Payment Confirmation Form */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-7 shadow-xs">
            {submittedSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Registration &amp; Payment Submitted!</h3>
                <div className="max-w-md mx-auto text-xs text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <p className="font-bold text-amber-700 mb-1 flex items-center justify-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    Account Status: <span className="underline">Pending Admin Verification</span>
                  </p>
                  Your registration details and UPI UTR reference number have been securely logged. Once our administration team verifies your transaction receipt in HRMS, your status will become <strong>active</strong> and you will receive an official verification email with your workstation sign-in credentials.
                </div>
              </div>
            ) : (
              <div>
                <div className="pb-4 border-b border-slate-100 mb-4">
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-blue-600" />
                    Candidate Registration &amp; Payment Confirmation
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Please confirm your details and provide your 12-digit UPI UTR reference number.
                  </p>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Candidate Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aditya Sharma"
                        value={regForm.studentName}
                        onChange={(e) => setRegForm({ ...regForm, studentName: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Registered Email *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="aditya@example.com"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+91 98765 43210"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 focus:outline-none transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        College or Company
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Delhi University / Tech Corp"
                        value={regForm.collegeOrCompany}
                        onChange={(e) => setRegForm({ ...regForm, collegeOrCompany: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Highest Qualification
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. B.Tech / MCA / BCA"
                        value={regForm.qualification}
                        onChange={(e) => setRegForm({ ...regForm, qualification: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Payment Confirmation Highlight Field */}
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 p-4 sm:p-5 space-y-3">
                    <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700 block">
                      Official UPI Transaction Reference Proof
                    </span>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">
                          12-Digit UPI UTR / Transaction ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. 423589124578"
                          value={regForm.utrNumber}
                          onChange={(e) => setRegForm({ ...regForm, utrNumber: e.target.value })}
                          className="w-full rounded-xl border-2 border-emerald-500 bg-white p-2.5 font-mono text-sm font-bold text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 focus:outline-none shadow-2xs"
                        />
                        <span className="text-[10px] text-slate-500 block mt-1">
                          Shown on your PhonePe / Google Pay / Paytm payment confirmation receipt.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          UPI VPA You Sent Payment To
                        </label>
                        <select
                          value={regForm.upiIdPaidTo}
                          onChange={(e) => setRegForm({ ...regForm, upiIdPaidTo: e.target.value })}
                          className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
                        >
                          <option value="gotechedu@ybl">gotechedu@ybl (YES Bank - Primary)</option>
                          <option value="gotechedu@ibl">gotechedu@ibl (ICICI Bank)</option>
                          <option value="gotechedu@axl">gotechedu@axl (Axis Bank)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 py-3.5 text-sm font-extrabold text-white shadow-md shadow-blue-500/20 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 transition cursor-pointer active:scale-[0.99]"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Submitting Registration...
                      </>
                    ) : (
                      <>
                        Confirm Registration &amp; Submit Payment Proof
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 pb-10">
          <p>© 2026 GoTechEdu Organization. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
