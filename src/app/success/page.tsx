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
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig>(DEFAULT_EVENT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const passRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!registrationId) {
      setError('No registration ID provided.');
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [regRes, eventRes] = await Promise.all([
          fetch(`/api/registrations/${encodeURIComponent(registrationId!)}`),
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
              if (cached && (cached.id === registrationId || cached.registrationNumber === registrationId)) {
                resolvedReg = cached;
              }
            } catch {}
          }
        }

        if (!resolvedReg) throw new Error('Registration could not be found.');

        // STRICT ENFORCEMENT: First payment, then only the passes!
        // Unpaid or pending registrations cannot access passes and are sent to payment
        const isAuthenticPaid = Boolean(
          resolvedReg.paymentStatus === 'verified' &&
          resolvedReg.paymentId &&
          resolvedReg.paymentId.startsWith('pay_') &&
          resolvedReg.paymentId !== 'pay_TjQSIYw4J4tPTW' &&
          resolvedReg.registrationNumber &&
          resolvedReg.registrationNumber.startsWith('P2P-KMCT-')
        );

        if (!isAuthenticPaid) {
          router.replace(`/payment?registrationId=${encodeURIComponent(resolvedReg.id)}&autoOpen=true`);
          return;
        }

        // Sanitize amountPaid to ₹100 if stored in paise (e.g. 10000)
        if (resolvedReg) {
          const rawAmt = resolvedReg.amountPaid ?? resolvedReg.amountPaise ?? 100;
          const parsed = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt).replace(/[^0-9.]/g, ''));
          resolvedReg.amountPaid = !isNaN(parsed) && parsed >= 1000 ? Math.round(parsed / 100) : parsed || 100;
        }

        let eventConfigData = null;
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          eventConfigData = eventData.event;
        }

        setRegistration(resolvedReg);
        if (eventConfigData) setEventConfig(eventConfigData);
      } catch (err: any) {
        setError(err.message || 'Error loading registration pass.');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [registrationId]);

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

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Pass Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'Unable to retrieve your registration pass.'}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-600" />
              <span>Event Homepage</span>
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-sky-600/20"
            >
              Register Now
            </Link>
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

  const isPaid =
    registration.paymentStatus === 'verified' &&
    Boolean(registration.paymentId && registration.paymentId.startsWith('pay_') && registration.paymentId !== 'pay_TjQSIYw4J4tPTW') &&
    Boolean(registration.registrationNumber && registration.registrationNumber.startsWith('P2P-KMCT-'));
  const ticketNumber = registration.registrationNumber || (isPaid ? 'P2P-KMCT-VERIFIED' : 'PENDING PAYMENT');

  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        {isPaid ? (
          <>
            {/* Professional Verified Header Banner */}
            <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-white/90 border border-emerald-300 shadow-lg shadow-emerald-950/5 flex items-center justify-between gap-4 print:hidden backdrop-blur-md">
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

              <div className="hidden sm:flex items-center gap-2">
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

            {/* Formal Printable Institutional Pass Card (Zero QR codes) */}
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

                  {/* Official Institutional Badge (Zero QR codes) */}
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

              {/* Official Ticket ID Bar */}
              <div className="my-6 p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:bg-white print:border-black">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-sky-700 shrink-0 shadow-2xs print:border-black">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold block">
                      Official Ticket ID / Pass Number
                    </span>
                    <span className="text-lg sm:text-xl font-mono font-black text-slate-950 tracking-wider select-all block mt-0.5">
                      {ticketNumber}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-xs font-bold text-emerald-800 print:border-black">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seat Confirmed (Cohort of 70)</span>
                  </span>
                </div>
              </div>

              {/* Delegate & Workshop Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 py-4 text-xs border-b border-slate-200 print:border-black">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Delegate / Participant
                  </span>
                  <p className="text-sm font-bold text-slate-950 mt-1 print:text-black">
                    {registration.fullName}
                  </p>
                  <p className="text-slate-600 font-mono text-[11px] mt-0.5">{registration.email}</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">+91 {registration.phone}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Branch &amp; Year
                  </span>
                  <p className="text-sm font-bold text-slate-950 mt-1 print:text-black">
                    {registration.course}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5 font-medium">
                    {registration.yearOfStudy || '1st Year Batch'}
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">KMCTCEEM Kasaragod</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Keynote Resource Person
                  </span>
                  <p className="text-sm font-bold text-slate-950 mt-1 print:text-black">
                    Mr. Muhammed Shayiz K P
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Sr. Software Engineer, Doodleblue Innovations
                  </p>
                  <p className="text-slate-500 text-[10px]">Co-founder, Shine Technologies</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Event Date &amp; Time
                  </span>
                  <p className="text-xs font-bold text-slate-950 mt-1 print:text-black">
                    Wednesday, 11th November 2026
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">09:30 AM – 04:00 PM IST</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Venue
                  </span>
                  <p className="text-xs font-bold text-slate-950 mt-1 print:text-black">
                    College Seminar Hall
                  </p>
                  <p className="text-slate-600 text-[11px] mt-0.5">KMCTCEEM Campus, Kasaragod</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest block font-bold">
                    Price
                  </span>
                  <p className="text-sm font-black text-slate-950 mt-1 print:text-black">
                    ₹100 Paid
                  </p>
                  <p className="text-emerald-700 text-[11px] mt-0.5 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Razorpay Verified</span>
                  </p>
                </div>
              </div>

              {/* Attendee Instructions */}
              <div className="mt-6 pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-700 tracking-wider block mb-2">
                  Important Delegate Instructions:
                </span>
                <ul className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                  <li className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      1
                    </span>
                    <span>This pass will be sent to your WhatsApp and email shortly. Please present your Ticket ID ({ticketNumber}) for check-in.</span>
                  </li>
                  <li className="flex items-start gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      2
                    </span>
                    <span>Reporting time is 09:15 AM at the Seminar Hall for multidisciplinary team allocations.</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="w-4 h-4 rounded-full bg-sky-100 text-sky-800 font-bold flex items-center justify-center text-[9px] shrink-0 mt-0.5">
                      3
                    </span>
                    <span>Prototyping materials, worksheets, morning tea &amp; canteen refreshments are provided.</span>
                  </li>
                </ul>
              </div>

              {/* Authorization & Sign-off Block */}
              <div className="mt-8 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-4 print:border-black">
                <div>
                  <span className="font-semibold text-slate-900">Coordinator:</span> Mr. Abdul Mujeeb M S (IIC Coordinator, KMCTCEEM)
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
              The registration price is ₹100. Upon payment verification, your official workshop pass will be generated and sent to your WhatsApp and email shortly.
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
                  <Lock className="w-3 h-3" /> Unpaid (Payment Required)
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2.5 border-t border-slate-200 items-center">
                <span className="text-slate-500 font-medium">Amount Due:</span>
                <span className="text-xl font-black text-slate-950">₹{displayAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
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
