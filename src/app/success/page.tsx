'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Award,
  Download,
  Share2,
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
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

function SuccessContent() {
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
          fetch(`/api/registrations/${registrationId}`),
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
              if (cached && (cached.id === registrationId || cached.registrationNumber === registrationId || !registrationId)) {
                resolvedReg = cached;
              }
            } catch {}
          }
        }

        if (!resolvedReg) throw new Error('Registration could not be found.');

        // Sanitize amountPaid to ₹100 if stored in paise (e.g. 10000)
        if (resolvedReg) {
          const rawAmt = resolvedReg.amountPaid ?? resolvedReg.amountPaise ?? 100;
          const parsed = typeof rawAmt === 'number' ? rawAmt : parseFloat(String(rawAmt).replace(/[^0-9.]/g, ''));
          resolvedReg.amountPaid = (!isNaN(parsed) && parsed >= 1000) ? Math.round(parsed / 100) : (parsed || 100);
          if (typeof window !== 'undefined') {
            try {
              localStorage.setItem('p2p_registration_cache', JSON.stringify(resolvedReg));
            } catch {}
          }
        }

        let eventConfigData = null;
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          eventConfigData = eventData.event;
        }

        setRegistration(resolvedReg);
        if (eventConfigData) setEventConfig(eventConfigData);

        // Fire celebratory confetti only if payment is verified
        if (resolvedReg.paymentStatus === 'verified') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#f59e0b', '#ea580c', '#9333ea', '#10b981'],
          });
        }
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
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading your workshop pass...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-2xl p-8 border border-red-200 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Pass Not Found</h2>
          <p className="text-sm text-slate-600 mb-6">{error || 'Unable to retrieve registration details.'}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/register';
                }
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer active:scale-95 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-purple-600" />
              <span>Back</span>
            </button>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
            >
              Register Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Normalize amount: if stored in integer paise (e.g. 10000), convert to rupees (100)
  const rawAmount = (registration as any).amountPaid ?? (registration as any).amountPaise ?? eventConfig?.registrationFee ?? 100;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, ''));
  const displayAmount = (!isNaN(numAmount) && numAmount >= 1000) ? Math.round(numAmount / 100) : (numAmount || 100);

  const isPaid = registration.paymentStatus === 'verified';

  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {isPaid ? (
          <>
            {/* Status Alert Banner */}
            <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-300 flex items-center gap-3.5 shadow-md print:hidden">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment Verified &amp; Seat Confirmed!</h2>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Your official workshop pass for <strong>From Problem to Possibility</strong> is generated below. A confirmation has been dispatched to{' '}
                  <strong className="text-slate-900">{registration.email}</strong>.
                </p>
              </div>
            </div>

            {/* Printable Pass Container */}
            <div
              ref={passRef}
              className="rounded-3xl bg-white border-2 border-purple-200 p-8 shadow-xl relative overflow-hidden print:border-black print:bg-white print:text-black"
            >
              {/* Top Pass Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6 print:border-gray-300 relative z-10">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                    <Lightbulb className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-purple-700 print:text-purple-900">
                        IIC Quarter 1 Activity
                      </span>
                      <span className="text-slate-300 print:hidden">•</span>
                      <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
                        Host: KMCTCEEM
                      </span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-wider mt-0.5 print:text-black">
                      PROBLEM TO POSSIBILITY PASS
                    </h1>
                    <p className="text-xs text-slate-600 mt-0.5 print:text-gray-600">
                      KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-start sm:self-center">
                  <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 print:border-gray-300">
                    <span className="text-[11px] font-bold text-purple-700">KMCTCEEM</span>
                    <div className="h-4 w-px bg-purple-200 print:bg-gray-300" />
                    <span className="text-[11px] font-bold text-amber-600">IIC Activity</span>
                  </div>

                  <div className="w-16 h-16 bg-white p-1.5 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                        `P2P-PASS:${registration.registrationNumber}:${registration.fullName}`
                      )}`}
                      alt="Ticket QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>

              {/* Prominent Straight Ticket ID Bar */}
              <div className="my-5 px-5 py-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs relative z-10 print:bg-gray-100 print:border-black">
                <div className="flex items-center gap-2.5 overflow-x-auto">
                  <span className="text-xs uppercase tracking-wider font-mono font-bold text-purple-700 print:text-purple-900 whitespace-nowrap">
                    Official Ticket ID:
                  </span>
                  <span className="text-base sm:text-lg font-mono font-black text-slate-900 tracking-wider print:text-black select-all whitespace-nowrap">
                    {registration.registrationNumber || 'P2P-KMCT-VERIFIED'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 print:text-emerald-800 print:border-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Seat Confirmed (1/70)</span>
                  </span>
                </div>
              </div>

              {/* Pass Content Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Participant</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 print:text-black">{registration.fullName}</p>
                  <p className="text-slate-600 mt-0.5 truncate">{registration.email}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Department / Branch</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 print:text-black">{registration.course}</p>
                  <p className="text-slate-600 mt-0.5">{registration.yearOfStudy}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Resource Person</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 print:text-black">Mr. Muhammed Shayiz K P</p>
                  <p className="text-slate-600 mt-0.5 truncate">Sr. Software Engineer, Doodleblue</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Amount Paid</span>
                  <p className="text-sm font-black text-purple-700 mt-0.5 print:text-black">₹{displayAmount}</p>
                  <p className="text-emerald-600 mt-0.5 font-semibold">Payment Verified</p>
                </div>
              </div>

              {/* Schedule, Venue & Logistics Footer Strip */}
              <div className="mt-4 pt-5 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Date</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 print:text-black">
                    Wednesday, 11th November 2026
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Timing</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 print:text-black">
                    09:30 AM – 04:00 PM (Full Day)
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Venue</span>
                  <p className="text-xs font-bold text-slate-900 mt-0.5 truncate print:text-black">
                    College Seminar Hall, KMCTCEEM
                  </p>
                </div>
              </div>

              {/* Guaranteed Deliverables Reminder */}
              <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-600 print:border-gray-300 print:text-gray-600 font-medium">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-purple-600" />
                  <span>Official IIC Activity Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-purple-600" />
                  <span>Chart Paper Prototyping Kit &amp; Worksheets</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Refreshments (Morning Tea &amp; Canteen Samosas) Included</span>
                </div>
              </div>

            </div>

            {/* Action Controls */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" />
                <span>Print or Save Pass (PDF)</span>
              </button>

              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold text-center transition-colors shadow-xs"
              >
                Return to Homepage
              </Link>
            </div>

            {/* Next Steps Guidance */}
            <div className="mt-12 bg-white rounded-2xl p-7 border border-slate-200 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Important Next Steps for Participants
              </h3>
              <ul className="space-y-2.5 text-xs text-slate-600 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-[10px] font-bold">1</span>
                  <span>Keep your Ticket ID (<strong>{registration.registrationNumber}</strong>) handy on your mobile device for desk entry.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-[10px] font-bold">2</span>
                  <span>Arrive at the College Seminar Hall before 09:30 AM on Wednesday, 11th November 2026 for team formation and materials collection.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center shrink-0 text-[10px] font-bold">3</span>
                  <span>All chart papers, sketch pens, and empathy worksheets will be provided at the workshop venue.</span>
                </li>
              </ul>

              <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                <div>
                  <span className="font-medium text-slate-800">Proposed by:</span> Mr. Abdul Mujeeb MS (IIC Coordinator)
                </div>
                <div>
                  <span className="text-emerald-700 font-semibold">Approved by Principal on 4th November 2026</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* TICKET LOCKED: ONLY ISSUED AFTER PAYMENT */
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full shadow-2xs">
              Payment Required to Unlock Ticket
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Workshop Pass is Locked
            </h2>

            <p className="mt-2.5 text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Official workshop passes and IIC participation certificates are issued exclusively after payment verification. Please complete your registration payment of ₹{displayAmount} to activate and view your pass.
            </p>

            <div className="my-7 max-w-md mx-auto p-5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Participant:</span>
                <span className="text-slate-900 font-semibold">{registration.fullName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Email:</span>
                <span className="text-slate-900 font-mono">{registration.email}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Pass &amp; Ticket ID:</span>
                <span className="text-amber-700 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Issued upon payment
                </span>
              </div>
              <div className="flex justify-between text-xs pt-2.5 border-t border-slate-200 items-center">
                <span className="text-slate-500 font-medium">Amount Due:</span>
                <span className="text-xl font-bold text-purple-700">₹{displayAmount}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/payment?registrationId=${registration.id}`}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-sm transition-all shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
              >
                <span>Proceed to Pay ₹{displayAmount}</span>
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
        <div className="min-h-screen bg-transparent flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
