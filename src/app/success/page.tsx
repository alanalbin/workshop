'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Sparkles,
  AlertCircle,
  User,
  Lock,
  ArrowLeft,
  ArrowRight,
  Copy,
  Check,
  Mail,
  Phone,
  GraduationCap,
  Layers,
  CreditCard,
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
  const [copied, setCopied] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-slate-700">
        <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold">Loading registration details...</p>
      </div>
    );
  }

  if (error || !registration) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white rounded-2xl p-8 border border-red-200 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Registration Not Found</h2>
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

  // Normalize amount
  const rawAmount = (registration as any).amountPaid ?? (registration as any).amountPaise ?? eventConfig?.registrationFee ?? 100;
  const numAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, ''));
  const displayAmount = (!isNaN(numAmount) && numAmount >= 1000) ? Math.round(numAmount / 100) : (numAmount || 100);

  const isPaid = registration.paymentStatus === 'verified';
  const displayTicketId = registration.registrationNumber || registration.ticketId || 'TKT-PENDING';

  const handleCopyTicket = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(displayTicketId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <div className="max-w-2xl mx-auto px-6 relative z-10">
        
        {isPaid ? (
          <div className="space-y-6">
            
            {/* Payment Verified & Seat Confirmed Header */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-emerald-200 shadow-xl text-center relative overflow-hidden">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center mx-auto mb-4 text-emerald-600 shadow-xs">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Payment Verified &amp; Seat Confirmed
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
                Registration Confirmed!
              </h1>
              <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
                Thank you, <strong>{registration.fullName}</strong>. Your seat for the offline workshop <strong>&quot;From Problem to Possibility&quot;</strong> at KMCT Kasaragod has been reserved.
              </p>
            </div>

            {/* Confirmed Ticket ID Display */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border-2 border-purple-300 shadow-xl text-center relative overflow-hidden">
              <span className="text-xs uppercase font-extrabold tracking-widest text-purple-700 block mb-2">
                Your Confirmed Ticket ID
              </span>
              <div className="inline-flex items-center justify-center gap-3 bg-purple-50/80 border border-purple-200 px-6 py-3.5 rounded-2xl shadow-inner">
                <span className="text-2xl sm:text-4xl font-mono font-black text-slate-950 tracking-wider select-all">
                  {displayTicketId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyTicket}
                  className="p-2.5 rounded-xl bg-white hover:bg-purple-100 border border-purple-200 text-purple-700 transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Copy Ticket ID"
                >
                  {copied ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 px-1">
                      <Check className="w-4 h-4" /> Copied
                    </span>
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2.5">
                Keep this Ticket ID for your records and event check-in.
              </p>
            </div>

            {/* Prominent Passes Notice Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-purple-500/15 border-2 border-amber-400 rounded-3xl p-6 sm:p-7 shadow-lg flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0 text-amber-700">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                  Passes will be sent to you shortly
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed">
                  Your official workshop pass, venue entry barcode, and team orientation schedule will be sent to your registered email address (<strong>{registration.email}</strong>) and mobile number shortly before the event.
                </p>
              </div>
            </div>

            {/* Candidate Details Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-4">
              <h3 className="text-xs uppercase font-extrabold tracking-wider text-purple-700 border-b border-slate-200 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-purple-600" />
                <span>Student Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Full Name</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{registration.fullName}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Email Address</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 truncate">{registration.email}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Mobile Number</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5 font-mono">+91 {registration.phone}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Batch</span>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">{registration.course}</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Year of Study</span>
                  <p className="text-sm font-bold text-purple-700 mt-0.5">1st Year</p>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">Amount Paid</span>
                  <p className="text-sm font-black text-emerald-600 mt-0.5">
                    ₹{displayAmount} (Verified)
                  </p>
                </div>
              </div>
            </div>

            {/* Return Button */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Homepage</span>
              </Link>
            </div>

          </div>
        ) : (
          /* Payment Required Card if accessed directly without paying */
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 sm:p-12 border border-slate-200 text-center shadow-xl relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-5 text-amber-600 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-amber-700 bg-amber-50 border border-amber-200 px-4 py-1.5 rounded-full shadow-2xs">
              Payment Required to Unlock Ticket ID
            </span>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-4 tracking-tight">
              Workshop Seat Pending Payment
            </h2>

            <p className="mt-2.5 text-slate-600 text-sm max-w-lg mx-auto leading-relaxed">
              Your registration details have been submitted. Please complete the registration fee payment of ₹{displayAmount} to generate your confirmed Ticket ID.
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
                <span className="text-slate-500">Batch:</span>
                <span className="text-slate-900 font-semibold">{registration.course}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Year of Study:</span>
                <span className="text-purple-700 font-semibold">1st Year</span>
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
