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
      <div className="min-h-screen bg-[#e8ecf2] py-36 relative">
        <div className="max-w-xl mx-auto px-6 relative z-10 text-center">
          <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Registrations Closed</span>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-6 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Registrations Are Now Closed
            </h1>

            <p className="mt-4 text-sm sm:text-base text-slate-600 leading-relaxed">
              Thank you for your interest! The registration period for the{' '}
              <strong className="text-slate-900">Workshop on Problem Solving &amp; Ideation (From Problem to Possibility)</strong> at KMCT College has concluded.
            </p>

            <div className="mt-8 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left">
              <h3 className="text-xs uppercase font-mono tracking-wider text-purple-700 font-bold mb-1.5 flex items-center gap-2">
                <Ticket className="w-4 h-4" />
                <span>Already Registered &amp; Paid?</span>
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                If you have previously completed your registration and payment, your entry pass and seat reservation remain confirmed.
              </p>
              <div className="mt-3">
                <Link
                  href="/success"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 text-xs font-bold transition-all"
                >
                  <span>Access / Lookup Your Ticket Pass</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-purple-600" />
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
      <div className="min-h-screen bg-[#e8ecf2] py-36 flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-4 shadow-xs">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required to Register</h2>
        <p className="text-sm text-slate-600 max-w-sm mb-6">
          Please sign in with your Google account to reserve your workshop seat.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer group shadow-xs active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Home</span>
          </Link>
          <Link
            href="/login?redirect=/register"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md shadow-orange-500/20"
          >
            Proceed to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#e8ecf2] py-28 relative">
      
      {/* Background Glows */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-purple-700 transition-all cursor-pointer group shadow-xs active:scale-95"
            title="Go back"
          >
            <ArrowLeft className="w-4 h-4 text-purple-600 group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>

          <Link
            href="/"
            className="text-xs text-slate-600 hover:text-purple-700 transition-colors flex items-center gap-1.5 font-medium"
          >
            <span>Event Home</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-700 uppercase tracking-widest mb-3 shadow-xs">
            <Lightbulb className="w-3.5 h-3.5 text-purple-600" />
            <span>Participant Registration • 70 Seats Cap</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            Reserve Your Workshop Seat
          </h1>
          <p className="mt-3 text-slate-600 text-sm">
            Join the offline workshop &quot;From Problem to Possibility&quot; at KMCT Kasaragod. Organized by Institution&apos;s Innovation Council (IIC).
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Registration Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-8 border border-slate-200 shadow-xl">
            
            {serverError && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-sm text-red-700 shadow-xs">
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <p>{serverError}</p>
              </div>
            )}

            {/* Auth Sign-in Banner / Verified Pill */}
            {user && (
              <div className="mb-6 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800 shadow-xs">
                <div className="flex items-center gap-2.5">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Google User'}
                      className="w-7 h-7 rounded-full border border-emerald-300 object-cover"
                    />
                  ) : (
                    <UserCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>
                    Google Verified: <strong>{user.displayName || user.email}</strong> (Pre-filled below)
                  </span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                  Ready
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-amber-500">*</span>
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  placeholder="e.g. Muhammed Faiz"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
                    errors.fullName ? 'border-red-500' : 'border-slate-300'
                  } focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors`}
                />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              {/* Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="name@kmct.edu.in"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
                      errors.email ? 'border-red-500' : 'border-slate-300'
                    } focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors`}
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="10-digit number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
                      errors.phone ? 'border-red-500' : 'border-slate-300'
                    } focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors`}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>
              </div>

              {/* Institution */}
              <div>
                <label htmlFor="institution" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Institution / College <span className="text-amber-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="institution"
                    name="institution"
                    type="text"
                    required
                    value={formData.institution}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
                      errors.institution ? 'border-red-500' : 'border-slate-300'
                    } focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors`}
                  />
                  <Building className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {errors.institution && <p className="text-xs text-red-500 mt-1">{errors.institution}</p>}
              </div>

              {/* Course & Year */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Course / Department <span className="text-amber-500">*</span>
                  </label>
                  <input
                    id="course"
                    name="course"
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science / Management"
                    value={formData.course}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 rounded-xl bg-slate-50 border ${
                      errors.course ? 'border-red-500' : 'border-slate-300'
                    } focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors`}
                  />
                  {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
                </div>

                <div>
                  <label htmlFor="yearOfStudy" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Year of Study <span className="text-amber-500">*</span>
                  </label>
                  <select
                    id="yearOfStudy"
                    name="yearOfStudy"
                    value={formData.yearOfStudy}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-purple-600 focus:bg-white focus:outline-none text-slate-900 text-sm transition-colors"
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
                    className="mt-1 w-4 h-4 rounded text-purple-600 bg-white border-slate-300 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <span className="text-xs text-slate-600 leading-normal">
                    I agree to the{' '}
                    <Link href="/terms" className="text-purple-700 underline hover:text-purple-900">
                      Terms of Participation
                    </Link>{' '}
                    and acknowledge that data collected will be used for official IIC certificate issuance and event logistics at KMCTCEEM.
                  </span>
                </label>
                {errors.privacyConsent && (
                  <p className="text-xs text-red-500 mt-1">{errors.privacyConsent}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl">
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-3">
                Registration Summary
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Workshop Pass</span>
                  <span className="font-bold text-slate-900">₹100</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Date</span>
                  <span className="text-purple-700 font-semibold">11th November 2026</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Timing &amp; Venue</span>
                  <span className="text-slate-800 font-medium">09:30 AM – 04:00 PM (Seminar Hall)</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-600">Cohort Cap</span>
                  <span className="text-purple-700 font-bold">Strictly 70 Seats</span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-sm font-semibold text-slate-900">Total Amount</span>
                  <span className="text-3xl font-black text-slate-900">₹100</span>
                </div>
              </div>

              {/* Verified note */}
              <div className="mt-5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-amber-800 mb-0.5">Approved Fee Structure:</p>
                The ₹100 registration fee covers full full-day workshop access, chart paper &amp; marker prototyping kits, morning tea with fresh canteen samosas, and official IIC certificate.
              </div>
            </div>

            {/* Guaranteed Deliverables */}
            <div className="bg-white rounded-2xl p-7 border border-slate-200 shadow-xl space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                What You Receive
              </h3>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong className="text-slate-900">Official IIC Activity Certificate</strong> of participation</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Package className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <span>Stationery kit: Chart paper, sketch pens, and empathy worksheets</span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <Award className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>Keynote mentorship from <strong className="text-slate-900">Mr. Muhammed Shayiz K P</strong></span>
              </div>

              <div className="flex items-start gap-3 text-xs text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Refreshments: Morning tea and fresh hot canteen samosas</span>
              </div>
            </div>

            {/* Registration Coordinator Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Proposed By</p>
              <p className="text-slate-900 font-semibold text-sm">Mr. Abdul Mujeeb MS</p>
              <p className="text-purple-700 text-xs font-medium">IIC Coordinator, KMCT College of Engineering</p>
              <div className="pt-2 border-t border-slate-200">
                <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Institutional Approval</p>
                <p className="text-emerald-700 text-xs font-medium">Approved by Principal on 4th November 2026</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
