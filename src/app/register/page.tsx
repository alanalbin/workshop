'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ShieldCheck,
  Award,
  Package,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Building,
  CheckCircle2,
  Phone,
  LogIn,
  UserCheck,
  Lock,
  Mail,
  Ticket,
  Lightbulb,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    institution: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
    course: '',
    yearOfStudy: '1st Year',
    privacyConsent: false,
  });

  const [isClosed, setIsClosed] = useState<boolean | null>(null);

  // Check if registrations are closed
  useEffect(() => {
    async function checkEventStatus() {
      try {
        const res = await fetch('/api/event');
        if (res.ok) {
          const data = await res.json();
          if (data?.event) {
            const closed =
              Boolean(data.event.registrationsClosed) ||
              (Boolean(data.event.registrationClosingDate) &&
                new Date(data.event.registrationClosingDate).getTime() <= Date.now());
            setIsClosed(closed);
          }
        }
      } catch (err) {
        console.error('Failed to check event status:', err);
      }
    }
    checkEventStatus();
  }, []);

  // Enforce login first only if registrations are still open
  useEffect(() => {
    if (!authLoading && !user && isClosed === false) {
      router.push('/login?redirect=/register');
    }
  }, [user, authLoading, router, isClosed]);

  // Pre-fill form details if user is signed in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || (user.phoneNumber ? user.phoneNumber.replace('+91', '') : ''),
      }));
    }
  }, [user]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    // Basic frontend checks before sending
    const validationErrors: Record<string, string> = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      validationErrors.fullName = 'Please enter your full name (minimum 2 characters).';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      validationErrors.email = 'Please provide a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      validationErrors.phone = 'Please enter a valid 10-digit Indian mobile number.';
    }
    if (!formData.course.trim()) {
      validationErrors.course = 'Please enter your department / course (e.g. B.Tech Computer Science).';
    }
    if (!formData.privacyConsent) {
      validationErrors.privacyConsent = 'You must accept the terms and privacy policy to proceed.';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.alreadyRegistered && data.isPaid) {
          router.push(`/success?registrationId=${data.registrationId}`);
          return;
        }
        if (data.errors) {
          const fieldErrors: Record<string, string> = {};
          Object.entries(data.errors).forEach(([key, val]: [string, any]) => {
            fieldErrors[key] = Array.isArray(val) ? val[0] : String(val);
          });
          setErrors(fieldErrors);
        }
        setServerError(data.message || 'Registration failed. Please check your inputs.');
        setIsSubmitting(false);
        return;
      }

      // Success or existing pending registration -> proceed to payment page
      if (typeof window !== 'undefined' && data.registrationId) {
        sessionStorage.setItem('p2p_registration_id', data.registrationId);
        localStorage.setItem('p2p_last_registration_id', data.registrationId);

        if (data.registration) {
          localStorage.setItem('p2p_registration_cache', JSON.stringify(data.registration));
        } else {
          const record = {
            id: data.registrationId,
            registrationNumber: '',
            ...formData,
            status: 'pending',
            paymentStatus: 'unpaid',
            amountPaid: 100,
            amountPaise: 10000,
          };
          localStorage.setItem('p2p_registration_cache', JSON.stringify(record));
        }
      }

      router.push(`/payment?registrationId=${data.registrationId}`);
    } catch {
      setServerError('A network error occurred. Please try submitting again.');
      setIsSubmitting(false);
    }
  };

  if (isClosed === true) {
    return (
      <div className="min-h-screen bg-[#05030a] py-36 relative">
        <div className="max-w-xl mx-auto px-6 relative z-10 text-center">
          <div className="glass-card rounded-3xl p-8 sm:p-10 border border-white/[0.08] shadow-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/70 border border-rose-800/50 text-rose-300 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Registrations Closed</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-950/40">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Registrations Are Now Closed
            </h1>

            <p className="mt-4 text-sm sm:text-base text-zinc-300 leading-relaxed">
              Thank you for your interest! The registration period for the{' '}
              <strong className="text-white">Workshop on Problem Solving &amp; Ideation (From Problem to Possibility)</strong> at KMCT College has concluded.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] text-left">
              <h3 className="text-xs uppercase font-mono tracking-wider text-amber-400 font-bold mb-1.5 flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>Already Registered &amp; Paid?</span>
              </h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                If you have previously completed your registration and payment, your entry pass and seat reservation remain confirmed.
              </p>
              <div className="mt-3">
                <Link
                  href="/success"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 text-amber-200 text-xs font-bold transition-all"
                >
                  <span>Access / Lookup Your Ticket Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-xs font-semibold text-zinc-200 hover:text-white transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-amber-400" />
                <span>Return to Homepage</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#05030a] py-36 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Sign In Required to Register</h2>
        <p className="text-sm text-slate-400 max-w-sm mb-6">
          Please sign in with your Google account to reserve your workshop seat.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm backdrop-blur-md active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/login?redirect=/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-lg shadow-orange-900/40"
          >
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05030a] py-28 relative">
      
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-orange-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] hover:border-amber-500/40 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer group shadow-sm backdrop-blur-md active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-amber-300 transition-colors flex items-center gap-1.5"
          >
            <span>Event Home</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/60 border border-orange-800/40 text-xs font-semibold text-amber-300 uppercase tracking-widest mb-3">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Participant Registration • 70 Seats Cap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Reserve Your Workshop Seat
          </h1>
          <p className="mt-3 text-slate-300 text-sm">
            Join the offline workshop &quot;From Problem to Possibility&quot; at KMCT Kasaragod. Organized by Institution&apos;s Innovation Council (IIC).
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Registration Form */}
          <div className="lg:col-span-7 glass-card rounded-2xl p-8 border border-white/[0.08] shadow-2xl">
            
            {serverError && (
              <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 flex items-start gap-3 text-sm text-red-200">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}

            {/* Auth Sign-in Banner / Verified Pill */}
            {user && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between text-xs text-emerald-200 shadow-md">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-7 h-7 rounded-full border border-emerald-400/50 object-cover"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  )}
                  <span>
                    Google Verified: <strong>{user.displayName || user.email}</strong> (Pre-filled below)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-900/60 text-emerald-300 font-semibold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Ready
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Muhammed Faiz"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                    errors.fullName ? 'border-red-500' : 'border-white/10'
                  } focus:border-amber-400 focus:outline-none text-white text-sm transition-colors`}
                />
                {errors.fullName && <p className="text-xs text-red-400 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@kmct.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.email ? 'border-red-500' : 'border-white/10'
                    } focus:border-amber-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.phone ? 'border-red-500' : 'border-white/10'
                    } focus:border-amber-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.phone && <p className="text-xs text-red-400 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Institution */}
              <div>
                <label htmlFor="institution" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Institution / College <span className="text-amber-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.institution ? 'border-red-500' : 'border-white/10'
                    } focus:border-amber-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  <Building className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
                {errors.institution && <p className="text-xs text-red-400 mt-1">{errors.institution}</p>}
              </div>

              {/* Course & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Course / Department <span className="text-amber-400">*</span>
                  </label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science / Management"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-[#0e071c] border ${
                      errors.course ? 'border-red-500' : 'border-white/10'
                    } focus:border-amber-400 focus:outline-none text-white text-sm transition-colors`}
                  />
                  {errors.course && <p className="text-xs text-red-400 mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label htmlFor="yearOfStudy" className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Year of Study <span className="text-amber-400">*</span>
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-[#0e071c] border border-white/10 focus:border-amber-400 focus:outline-none text-white text-sm transition-colors"
                  >
                    <option value="1st Year">1st Year (Primary Target Audience)</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Postgraduate">Management / PG</option>
                    <option value="Faculty / Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Privacy Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    className="mt-1 w-4 h-4 rounded text-orange-600 bg-[#0e071c] border-white/20 focus:ring-amber-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-300 leading-normal">
                    I agree to the{' '}
                    <Link href="/terms" className="text-amber-400 underline hover:text-amber-300">
                      Terms of Participation
                    </Link>{' '}
                    and acknowledge that data collected will be used for official IIC certificate issuance and event logistics at KMCTCEEM.
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-xs text-red-400 mt-1">{errors.privacyConsent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-xl shadow-orange-950 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating &amp; Creating Registration...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Payment (₹100)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: Order Summary & Takeaways */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Pass Summary Card */}
            <div className="glass-card rounded-2xl p-7 border border-white/[0.08]">
              <h2 className="text-base font-bold text-white uppercase tracking-wider mb-4 border-b border-white/[0.08] pb-3">
                Registration Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Workshop Pass</span>
                  <span className="font-bold text-white">₹100</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Date</span>
                  <span className="text-amber-300 font-medium">11th November 2026</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Timing &amp; Venue</span>
                  <span className="text-zinc-300 font-medium">09:30 AM – 04:00 PM (Seminar Hall)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300">Cohort Cap</span>
                  <span className="text-amber-400 font-semibold">Strictly 70 Seats</span>
                </div>

                <div className="pt-3 border-t border-white/[0.08] flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-white">Total Amount</span>
                  <span className="text-3xl font-black text-gradient-vibrant bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">₹100</span>
                </div>
              </div>

              {/* Verified note */}
              <div className="mt-5 p-3 rounded-xl bg-orange-950/40 border border-orange-800/30 text-xs text-amber-200 leading-relaxed">
                <p className="font-semibold text-amber-300 mb-0.5">Approved Fee Structure:</p>
                The ₹100 registration fee covers full full-day workshop access, chart paper &amp; marker prototyping kits, morning tea with fresh canteen samosas, and official IIC certificate.
              </div>
            </div>

            {/* Guaranteed Deliverables */}
            <div className="glass-card rounded-2xl p-7 border border-white/[0.08] space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                What You Receive
              </h3>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Official IIC Activity Certificate</strong> of participation</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Package className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Stationery kit: Chart paper, sketch pens, and empathy worksheets</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <Award className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>Keynote mentorship from <strong>Mr. Muhammed Shayiz K P</strong></span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Refreshments: Morning tea and fresh hot canteen samosas</span>
              </div>
            </div>

            {/* Registration Coordinator Box */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.08] text-xs text-zinc-300 space-y-2">
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Proposed By</p>
              <p className="text-white font-medium text-sm">Mr. Abdul Mujeeb MS</p>
              <p className="text-amber-400 text-xs">IIC Coordinator, KMCT College of Engineering</p>
              <div className="pt-2 border-t border-white/[0.08]">
                <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Institutional Approval</p>
                <p className="text-emerald-400 text-xs">Approved by Principal on 4th November 2026</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
