'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Award,
  ArrowRight,
  Printer,
  Sparkles,
  AlertCircle,
  Package,
  Building,
  Phone,
  User,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Lightbulb,
  Clock,
  FileText,
  BadgeCheck,
  Send,
  Search,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlId =
    searchParams.get('registrationId') ||
    searchParams.get('id') ||
    searchParams.get('email') ||
    searchParams.get('phone') ||
    searchParams.get('ticketId') ||
    searchParams.get('q');

  const [targetQuery, setTargetQuery] = useState<string | null>(urlId);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [rechecking, setRechecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Search input state
  const [searchInput, setSearchInput] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [showLookupBox, setShowLookupBox] = useState(false);

  const passRef = useRef<HTMLDivElement>(null);

  const fetchCandidatePass = async (queryVal: string, isManualSearch = false) => {
    if (isManualSearch) {
      setIsSearching(true);
      setSearchError(null);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const [regRes, eventRes] = await Promise.all([
        fetch(`/api/registrations/${encodeURIComponent(queryVal.trim())}`),
        fetch('/api/event'),
      ]);

      let resolvedReg: Registration | null = null;
      if (regRes.ok) {
        const regData = await regRes.json();
        resolvedReg = regData.registration;
      }

      // Client cache fallback if serverless instance has not synced yet
      if (!resolvedReg && typeof window !== 'undefined') {
        const cachedStr = localStorage.getItem('p2p_registration_cache');
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            const qLower = queryVal.toLowerCase().trim();
            const qDigits = queryVal.replace(/\D/g, '').slice(-10);
            if (
              cached &&
              (cached.id === queryVal ||
                cached.registrationNumber === queryVal ||
                (cached.email && cached.email.toLowerCase() === qLower) ||
                (cached.phone && cached.phone.replace(/\D/g, '').slice(-10) === qDigits))
            ) {
              resolvedReg = cached;
            }
          } catch {}
        }
      }

      if (eventRes.ok) {
        const eventData = await eventRes.json();
        if (eventData.event) setEventConfig(eventData.event);
      }

      if (!resolvedReg) {
        const notFoundMsg = 'No registration or pass found matching that email or mobile number.';
        if (isManualSearch) {
          setSearchError(notFoundMsg);
        } else {
          setError(notFoundMsg);
        }
        return;
      }

      // Sanitize amountPaid to ₹100 if stored in paise
      const rawAmt = resolvedReg.amountPaid ?? resolvedReg.amountPaise ?? 100;
      const parsed = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt).replace(/[^0-9.]/g, ''));
      resolvedReg.amountPaid = !isNaN(parsed) && parsed >= 1000 ? Math.round(parsed / 100) : parsed || 100;

      setRegistration(resolvedReg);
      setShowLookupBox(false);

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('p2p_registration_id', resolvedReg.id);
        localStorage.setItem('p2p_last_registration_id', resolvedReg.id);
        if (resolvedReg.paymentStatus === 'verified') {
          localStorage.setItem('p2p_registration_cache', JSON.stringify(resolvedReg));
        }
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Error connecting to server. Please try again.';
      if (isManualSearch) {
        setSearchError(errMsg);
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
      setIsSearching(false);
      setRechecking(false);
    }
  };

  useEffect(() => {
    let initialTarget = urlId;

    if (!initialTarget && typeof window !== 'undefined') {
      const stored =
        sessionStorage.getItem('p2p_registration_id') ||
        localStorage.getItem('p2p_last_registration_id');
      if (stored && stored !== 'undefined' && stored !== 'null') {
        initialTarget = stored.trim();
      }
    }

    if (initialTarget) {
      setTargetQuery(initialTarget);
      fetchCandidatePass(initialTarget, false);
    } else {
      setLoading(false);
    }
  }, [urlId]);

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    fetchCandidatePass(searchInput.trim(), true);
  };

  const handleRecheckStatus = () => {
    if (!registration) return;
    setRechecking(true);
    fetchCandidatePass(registration.id || registration.email, false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs font-mono uppercase tracking-widest text-slate-600 font-bold">
          Verifying Workshop Credentials...
        </p>
      </div>
    );
  }

  // If no registration loaded or search error occurred, show the Pass Retrieval Portal
  if (!registration) {
    return (
      <div className="min-h-screen bg-transparent py-28 relative">
        <div className="max-w-xl mx-auto px-6 relative z-10">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-2xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto mb-5 text-sky-700 shadow-xs">
              <Search className="w-7 h-7" />
            </div>

            <h2 className="text-2xl font-black text-slate-950 tracking-tight mb-2">
              Retrieve Your Workshop Pass
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
              Already registered or completed payment? Enter your registered <strong>Email Address</strong> or <strong>WhatsApp Mobile Number</strong> below to access your official pass.
            </p>

            <form onSubmit={handleManualSearch} className="space-y-3.5 text-left mb-6">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address or Mobile Number:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. yourname@gmail.com or 9876543210"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-medium focus:bg-white focus:border-sky-600 focus:outline-none shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="absolute right-2 top-2 bottom-2 px-3.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {(searchError || error) && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{searchError || error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSearching}
                className="w-full py-3.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Verified Passes...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Find &amp; View Pass</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-center gap-3 text-xs">
              <Link
                href="/register"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-slate-800 transition-colors"
              >
                Register for Workshop
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normalize amount
  const rawAmount =
    (registration as any).amountPaid ?? (registration as any).amountPaise ?? eventConfig?.registrationFee ?? 100;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, ''));
  const displayAmount = !isNaN(numAmount) && numAmount >= 1000 ? Math.round(numAmount / 100) : numAmount || 100;

  const isPaid = registration.paymentStatus === 'verified';
  const ticketNumber = registration.registrationNumber || (isPaid ? 'P2P-KMCT-VERIFIED' : 'PENDING PAYMENT');

  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {/* Toggle Lookup Drawer / Bar */}
        {showLookupBox && (
          <div className="mb-6 p-5 rounded-2xl bg-white border border-sky-300 shadow-xl print:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-sky-600" />
                <span>Lookup Another Workshop Pass</span>
              </span>
              <button
                type="button"
                onClick={() => setShowLookupBox(false)}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Enter Email Address or Mobile Number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:border-sky-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSearching}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Search</span>
              </button>
            </form>
            {searchError && (
              <p className="text-[11px] text-rose-600 font-medium mt-2">{searchError}</p>
            )}
          </div>
        )}

        {isPaid ? (
          <>
            {/* Professional Verified Header Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/90 border border-emerald-300 shadow-lg shadow-emerald-950/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-600 shrink-0">
                  <BadgeCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                      Payment Verified (₹100) • Seat Confirmed
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-slate-800 font-semibold mt-1">
                    This pass will be sent to your WhatsApp and email shortly. Registration Price: <strong className="text-slate-950">₹100</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button
                  type="button"
                  onClick={() => setShowLookupBox(!showLookupBox)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-semibold text-xs transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Search another pass"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Find Other</span>
                </button>
                <button
                  type="button"
                  onClick={handlePrint}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Pass</span>
                </button>
              </div>
            </div>

            {/* Formal Printable Institutional Pass Card */}
            <div
              ref={passRef}
              className="rounded-3xl bg-white border border-slate-300 p-8 sm:p-10 shadow-2xl shadow-slate-950/10 relative overflow-hidden print:border-black print:p-6 print:shadow-none print:m-0"
            >
              {/* WhatsApp & Email Dispatch Notice Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs print:hidden">
                <div className="flex items-center gap-2.5 text-sky-950 font-semibold">
                  <div className="w-8 h-8 rounded-xl bg-white border border-sky-200 flex items-center justify-center shrink-0 text-sky-700 shadow-2xs">
                    <Send className="w-4 h-4" />
                  </div>
                  <span>This pass will be sent to your WhatsApp and email shortly.</span>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Price:</span>
                  <span className="text-sm font-black text-slate-950">₹100 Paid</span>
                </div>
              </div>

              {/* Institutional Header Strip */}
              <div className="border-b border-slate-200 pb-6 print:border-black">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-black uppercase tracking-widest text-sky-800 print:text-black">
                        Institution&apos;s Innovation Council (IIC) • Quarter 1 Activity
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight print:text-black">
                      FROM PROBLEM TO POSSIBILITY
                    </h1>
                    <p className="text-xs text-slate-700 font-semibold mt-0.5 print:text-gray-700">
                      Workshop on Systematic Problem Solving, Ideation &amp; Prototype Pitching
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5 print:text-gray-600">
                      KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
                    </p>
                  </div>

                  {/* Official Institutional Badge */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right print:border-black">
                      <span className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">
                        Organizer
                      </span>
                      <span className="text-xs font-black text-slate-900 block mt-0.5">
                        KMCTCEEM • IIC
                      </span>
                      <span className="text-[9px] text-emerald-700 font-bold block">
                        Verified Pass
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ticket Identifier Banner */}
              <div className="py-5 border-b border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black">
                <div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
                    Official Ticket ID
                  </span>
                  <span className="text-lg sm:text-xl font-mono font-black text-slate-950 tracking-wider">
                    {ticketNumber}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 print:border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seat Confirmed</span>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider print:border-black">
                    Registration Fee: ₹{displayAmount}
                  </div>
                </div>
              </div>

              {/* Participant & Event Details Grid */}
              <div className="py-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-slate-200 print:border-black">
                {/* Candidate Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Participant Credentials</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:border-black print:bg-white">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Full Name</span>
                      <span className="text-base font-bold text-slate-950">{registration.fullName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Email</span>
                        <span className="text-xs font-mono text-slate-900 truncate block">{registration.email}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Contact</span>
                        <span className="text-xs font-mono text-slate-900 block">{registration.phone || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Department / Year</span>
                      <span className="text-xs font-semibold text-slate-900">
                        {registration.course} • {registration.yearOfStudy}
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Institution</span>
                      <span className="text-xs font-medium text-slate-800 line-clamp-1">{registration.institution}</span>
                    </div>
                  </div>
                </div>

                {/* Event Schedule Info */}
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-sky-600" />
                    <span>Workshop Schedule &amp; Venue</span>
                  </h3>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:border-black print:bg-white">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Date &amp; Time</span>
                      <span className="text-sm font-bold text-slate-950 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-sky-600" />
                        <span>11th November 2026 • 9:30 AM – 4:00 PM IST</span>
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Venue</span>
                      <span className="text-xs font-bold text-slate-900 flex items-start gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                        <span>Seminar Hall, KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</span>
                      </span>
                    </div>
                    <div className="pt-1 border-t border-slate-200/60">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Benefits Included</span>
                      <span className="text-xs font-medium text-slate-800">
                        Official IIC Participation Certificate • Innovation Toolkit • Hands-on Mentorship
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Verification Footer */}
              <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Officially authenticated &amp; verified by KMCTCEEM Institution&apos;s Innovation Council.</span>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-emerald-800">Approved by Principal, KMCTCEEM</span>
                </div>
              </div>
            </div>

            {/* Bottom Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 print:hidden">
              <button
                type="button"
                onClick={handlePrint}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save Pass PDF</span>
              </button>

              <button
                type="button"
                onClick={() => setShowLookupBox(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <Search className="w-4 h-4 text-sky-600" />
                <span>Lookup Another Pass</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-sky-600" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </>
        ) : (
          /* Payment Locked Screen - When participant has not completed payment */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-2xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-300 flex items-center justify-center mx-auto mb-5 text-amber-700 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-800 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full shadow-2xs">
              Payment Required to Unlock Ticket
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-4 tracking-tight">
              Workshop Pass is Pending Payment
            </h2>

            <p className="mt-2.5 text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              The registration price is ₹100. If you already completed payment via UPI/GPay, click &quot;Check Payment Status&quot; below to immediately verify and generate your pass.
            </p>

            <div className="my-7 max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Participant:</span>
                <span className="text-slate-950 font-semibold">{registration.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-950 font-mono">{registration.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Status:</span>
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Unpaid / Pending Verification
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2.5 border-t border-slate-200 items-center">
                <span className="text-slate-500 font-medium">Amount Due:</span>
                <span className="text-xl font-black text-slate-950">₹{displayAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRecheckStatus}
                disabled={rechecking}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${rechecking ? 'animate-spin' : ''}`} />
                <span>{rechecking ? 'Checking Razorpay...' : 'Check Payment Status'}</span>
              </button>

              <Link
                href={`/payment?registrationId=${registration.id}&autoOpen=true`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-sm transition-all shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Pay ₹{displayAmount} via Razorpay</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function RegistrationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center text-slate-600">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
