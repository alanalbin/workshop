'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  CreditCard,
  Search,
  User,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Award,
  Package,
} from 'lucide-react';
import { Registration, EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registrationId = searchParams.get('registrationId');
  const { user } = useAuth();

  const [registration, setRegistration] = useState<Registration | null>(null);
  const [eventConfig, setEventConfig] = useState<EventConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // Quick Registration State (used when entering /payment directly without registering first)
  const [quickFullName, setQuickFullName] = useState('');
  const [quickEmail, setQuickEmail] = useState('');
  const [quickPhone, setQuickPhone] = useState('');
  const [quickInstitution, setQuickInstitution] = useState('KMCT College of Engineering');
  const [quickCourse, setQuickCourse] = useState('Computer Science & Engineering');

  // Lookup existing registration state
  const [lookupQuery, setLookupQuery] = useState('');
  const [isSearchingLookup, setIsSearchingLookup] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [showLookupBox, setShowLookupBox] = useState(false);

  // Payment processing state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [isAuthError, setIsAuthError] = useState(false);
  const autoOpen = searchParams.get('autoOpen') === 'true';
  const hasAutoOpened = useRef(false);

  // Pre-fill quick registration from authenticated user if available
  useEffect(() => {
    if (user) {
      if (user.displayName && !quickFullName) setQuickFullName(user.displayName);
      if (user.email && !quickEmail) setQuickEmail(user.email);
      if (user.phoneNumber && !quickPhone) setQuickPhone(user.phoneNumber.replace(/\D/g, '').slice(-10));
    }
  }, [user]);

  // Main data resolution effect
  useEffect(() => {
    let isMounted = true;

    async function fetchData() {
      try {
        // Fetch event configuration
        const eventRes = await fetch('/api/event');
        if (eventRes.ok) {
          const eventData = await eventRes.json();
          if (isMounted) setEventConfig(eventData.event);
        }

        // 1. Determine candidate identifier from URL, Storage, or Auth
        let targetId = registrationId?.trim();
        if (!targetId || targetId === 'undefined' || targetId === 'null') {
          targetId = undefined;
          if (typeof window !== 'undefined') {
            const stored =
              sessionStorage.getItem('p2p_registration_id') ||
              localStorage.getItem('p2p_last_registration_id');
            if (stored && stored !== 'undefined' && stored !== 'null') {
              targetId = stored.trim();
            }
          }
        }

        if (!targetId && user?.email) {
          targetId = user.email;
        }

        let resolvedCandidate: Registration | null = null;

        if (targetId) {
          try {
            const regRes = await fetch(`/api/registrations/${encodeURIComponent(targetId)}`);
            if (regRes.ok) {
              const regData = await regRes.json();
              if (regData.registration) {
                resolvedCandidate = regData.registration;
              }
            }
          } catch (e) {
            console.warn('API lookup note:', e);
          }
        }

        // CRITICAL FALLBACK: If serverless lambda has an empty /tmp filesystem or 404s,
        // ALWAYS fallback to client cached registration!
        if (!resolvedCandidate && typeof window !== 'undefined') {
          const cachedStr = localStorage.getItem('p2p_registration_cache');
          if (cachedStr) {
            try {
              const cached = JSON.parse(cachedStr);
              if (cached && (cached.id === targetId || !targetId || cached.email || cached.fullName)) {
                resolvedCandidate = cached;
              }
            } catch {}
          }
        }

        if (resolvedCandidate && isMounted) {
          setRegistration(resolvedCandidate);
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('p2p_registration_id', resolvedCandidate.id);
            localStorage.setItem('p2p_last_registration_id', resolvedCandidate.id);
            localStorage.setItem('p2p_registration_cache', JSON.stringify(resolvedCandidate));
          }

          if (resolvedCandidate.paymentStatus === 'verified') {
            router.push(`/success?registrationId=${resolvedCandidate.id}`);
            return;
          }
        }
      } catch (err: any) {
        console.warn('Payment resolution note:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [registrationId, user, router]);

  // Handle manual lookup of existing pass by Ticket ID or Email
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;

    setIsSearchingLookup(true);
    setLookupError(null);

    try {
      const res = await fetch(`/api/registrations/${encodeURIComponent(lookupQuery.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.registration) {
        setLookupError('No pass found for that Ticket ID or Email. Please register below.');
        setIsSearchingLookup(false);
        return;
      }

      setRegistration(data.registration);
      setShowLookupBox(false);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('p2p_registration_id', data.registration.id);
        localStorage.setItem('p2p_last_registration_id', data.registration.id);
      }

      if (data.registration.paymentStatus === 'verified') {
        router.push(`/success?registrationId=${data.registration.id}`);
      }
    } catch {
      setLookupError('Network error while searching. Please try again.');
    } finally {
      setIsSearchingLookup(false);
    }
  };

  const fee = eventConfig?.registrationFee || 100;
  const feePaise = Math.round(fee * 100);

  // Razorpay Checkout Trigger
  const handleRazorpayPayment = async () => {
    setPaymentError(null);
    setIsAuthError(false);
    setIsProcessing(true);

    try {
      let activeReg = registration;

      // Check client localStorage cache if activeReg state is not yet set
      if (!activeReg && typeof window !== 'undefined') {
        const cachedStr = localStorage.getItem('p2p_registration_cache');
        if (cachedStr) {
          try {
            const cached = JSON.parse(cachedStr);
            if (cached && (cached.email || cached.fullName)) {
              activeReg = cached;
              setRegistration(cached);
            }
          } catch {}
        }
      }

      // If user came directly to /payment without registration, create registration on the fly
      if (!activeReg) {
        if (!quickFullName.trim()) {
          setPaymentError('Please enter your full name above.');
          setIsProcessing(false);
          return;
        }
        if (!quickEmail.trim() || !quickEmail.includes('@')) {
          setPaymentError('Please enter a valid email address above.');
          setIsProcessing(false);
          return;
        }
        const cleanedPhone = quickPhone.replace(/\D/g, '');
        if (cleanedPhone.length < 10) {
          setPaymentError('Please enter a valid 10-digit mobile number above.');
          setIsProcessing(false);
          return;
        }

        const regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: quickFullName.trim(),
            email: quickEmail.trim().toLowerCase(),
            phone: cleanedPhone.slice(-10),
            institution: quickInstitution.trim() || 'KMCT College of Engineering',
            course: quickCourse.trim() || 'Engineering & Technology',
            yearOfStudy: '1st Year',
            privacyConsent: true,
          }),
        });

        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) {
          setPaymentError(regData.message || 'Failed to initialize registration.');
          setIsProcessing(false);
          return;
        }

        activeReg = regData.registration || {
          id: regData.registrationId,
          fullName: quickFullName.trim(),
          email: quickEmail.trim().toLowerCase(),
          phone: cleanedPhone.slice(-10),
          institution: quickInstitution.trim() || 'KMCT College of Engineering',
          course: quickCourse.trim() || 'Engineering & Technology',
          yearOfStudy: '1st Year',
          status: 'pending',
          paymentStatus: 'unpaid',
          amountPaid: 100,
          amountPaise: 10000,
        };
        setRegistration(activeReg);
        if (typeof window !== 'undefined' && activeReg) {
          sessionStorage.setItem('p2p_registration_id', activeReg.id);
          localStorage.setItem('p2p_last_registration_id', activeReg.id);
          localStorage.setItem('p2p_registration_cache', JSON.stringify(activeReg));
        }
      }

      if (!activeReg) {
        setPaymentError('Unable to identify registration. Please refresh and try again.');
        setIsProcessing(false);
        return;
      }

      // 1. Call Backend Order Creation Endpoint: POST /api/create-order
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrationId: activeReg.id,
          registration: activeReg,
          registrationData: activeReg,
          amount: feePaise,
          currency: 'INR',
          receipt: activeReg.registrationNumber || activeReg.id.slice(-40),
        }),
      });

      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.order_id) {
        if (orderRes.status === 401 || orderData.isAuthError) {
          setIsAuthError(true);
        }
        setPaymentError(orderData.message || 'Failed to initialize Razorpay order. Please try again.');
        setIsProcessing(false);
        return;
      }

      // 2. Ensure Razorpay client checkout script is loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        let script = document.querySelector('script[src*="checkout.razorpay.com"]') as HTMLScriptElement;
        if (!script) {
          script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          document.body.appendChild(script);
        }
        await new Promise<void>((resolve, reject) => {
          const checkTimer = setInterval(() => {
            if (typeof (window as any).Razorpay !== 'undefined') {
              clearInterval(checkTimer);
              resolve();
            }
          }, 100);
          script.onload = () => {
            clearInterval(checkTimer);
            resolve();
          };
          script.onerror = () => {
            clearInterval(checkTimer);
            reject(new Error('Failed to load Razorpay SDK. Please check your connection.'));
          };
          setTimeout(() => {
            clearInterval(checkTimer);
            if (typeof (window as any).Razorpay !== 'undefined') {
              resolve();
            } else {
              reject(new Error('Timeout loading Razorpay SDK. Please check your internet connection.'));
            }
          }, 6000);
        });
      }

      const keyId =
        orderData.key_id ||
        orderData.keyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        'rzp_live_TwiUdyPWJ6vtp9';

      // 3. Open Razorpay Checkout Modal
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'KMCT College of Engineering • IIC',
        description: 'From Problem to Possibility Pass (₹100)',
        order_id: orderData.order_id,
        prefill: {
          name: activeReg.fullName,
          email: activeReg.email,
          contact: (activeReg.phone || '').replace(/\D/g, '').slice(-10),
        },
        notes: {
          registrationId: activeReg.id,
          workshop: 'From Problem to Possibility',
        },
        theme: {
          color: '#0284c7',
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        handler: async function (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) {
          setIsProcessing(true);
          try {
            // 4. Send all three parameters to Backend Signature Verification: POST /api/verify-payment
            const verifyRes = await fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                registrationId: activeReg?.id,
                registration: activeReg,
                registrationData: activeReg,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success) {
              if (typeof window !== 'undefined' && activeReg) {
                const confirmed = {
                  ...activeReg,
                  registrationNumber: verifyData.registrationNumber || verifyData.ticketId || activeReg.registrationNumber,
                  paymentStatus: 'verified',
                  status: 'confirmed',
                  amountPaid: fee,
                  paymentId: response.razorpay_payment_id,
                };
                localStorage.setItem('p2p_registration_cache', JSON.stringify(confirmed));
              }
              // Redirect to ticket page where the pass is unlocked
              router.push(`/success?registrationId=${verifyData.registrationId || activeReg?.id}`);
            } else {
              setPaymentError(verifyData.message || 'Payment signature verification failed. Please contact support.');
              setIsProcessing(false);
            }
          } catch (err: any) {
            console.error('Verification error:', err);
            setPaymentError('Network error while verifying payment. Please refresh or contact support.');
            setIsProcessing(false);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setPaymentError(
          response?.error?.description || 'Payment was unsuccessful or cancelled by user.'
        );
      });

      rzp.open();
    } catch (err: any) {
      console.error('Payment initialization error:', err);
      setPaymentError(err.message || 'Error launching Razorpay checkout. Please try again.');
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (autoOpen && registration && registration.paymentStatus !== 'verified' && !isProcessing && !hasAutoOpened.current) {
      hasAutoOpened.current = true;
      const timer = setTimeout(() => {
        handleRazorpayPayment();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [registration, autoOpen]);

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center p-6 text-slate-700">
        <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
        <p className="text-sm font-semibold">Securing Razorpay payment session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Navigation / Back Button */}
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                router.back();
              } else {
                router.push('/register');
              }
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-purple-300 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer group shadow-xs active:scale-95"
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
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-widest mb-3 shadow-2xs">
            <Lock className="w-3.5 h-3.5 text-purple-600" />
            <span>Razorpay Standard Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Complete Registration Payment
          </h1>
          <p className="mt-2 text-slate-600 text-sm">
            Securely pay ₹{fee} with Razorpay to activate your confirmed registration pass and official IIC activity certificate.
          </p>
        </div>

        {/* Razorpay Authentication Error Card */}
        {isAuthError && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900 space-y-3 shadow-md">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600" />
              <span>Razorpay Key Authentication Required</span>
            </div>
            <p className="text-slate-700 leading-relaxed">
              Razorpay returned an authentication error. Please verify that your Key ID and Key Secret are active in the Razorpay Dashboard.
            </p>
          </div>
        )}

        {/* Payment Error Alert */}
        {paymentError && !isAuthError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-3 shadow-md">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
            <span className="flex-1 font-medium">{paymentError}</span>
          </div>
        )}

        {/* Candidate Details Card */}
        {registration ? (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 mb-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-extrabold text-purple-700 tracking-wider">
                    Candidate Details
                  </span>
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-amber-600" />
                    Pass &amp; Ticket ID unlock after payment
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">{registration.fullName}</h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  {registration.email} • +91 {registration.phone}
                </p>
                <p className="text-xs text-purple-700 mt-0.5 font-medium">
                  {registration.course} • {registration.institution}
                </p>
              </div>

              <div className="text-left sm:text-right w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Total Pass Fee</span>
                <p className="text-3xl font-black text-purple-600">₹{fee}</p>
                <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block mt-0.5">Payment Required</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 mb-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Participant Details</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Provide your details to register and proceed to Razorpay payment.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLookupBox(!showLookupBox)}
                className="text-xs text-purple-700 hover:text-purple-900 font-semibold flex items-center gap-1.5 underline decoration-purple-300 cursor-pointer self-start sm:self-auto"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{showLookupBox ? 'Hide lookup' : 'Already registered? Search your pass'}</span>
              </button>
            </div>

            {/* Quick Lookup Bar */}
            {showLookupBox && (
              <form onSubmit={handleLookup} className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-2">
                <span className="text-xs font-semibold text-slate-700 block">
                  Search by Email, WhatsApp Number, or Ticket ID (P2P-KMCT-...):
                </span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. your@email.com, 9876543210, or P2P-KMCT-..."
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:border-purple-600 focus:outline-none shadow-2xs"
                  />
                  <button
                    type="submit"
                    disabled={isSearchingLookup}
                    className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                  >
                    {isSearchingLookup ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    <span>Find Pass</span>
                  </button>
                </div>
                {lookupError && (
                  <p className="text-[11px] text-red-600 font-medium">{lookupError}</p>
                )}
              </form>
            )}

            {/* Quick Participant Input Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={quickFullName}
                  onChange={(e) => setQuickFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-purple-600 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address <span className="text-purple-600">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={quickEmail}
                  onChange={(e) => setQuickEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:border-purple-600 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number <span className="text-purple-600">*</span>
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  value={quickPhone}
                  onChange={(e) => setQuickPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-mono focus:border-purple-600 focus:outline-none shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Year of Study <span className="text-sky-600">*</span>
                </label>
                <select
                  disabled
                  value="1st Year"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-slate-900 text-xs cursor-not-allowed font-medium shadow-2xs"
                >
                  <option value="1st Year">1st Year</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Razorpay Checkout Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-9 border border-purple-200 shadow-xl space-y-6 relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-200 pb-5">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-purple-700 font-bold block">
                Payment Method
              </span>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2 mt-0.5">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <span>Razorpay Standard Web Checkout</span>
              </h3>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>PCI-DSS Secured</span>
            </div>
          </div>

          {/* Supported Rails Showcase */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-600 block font-semibold">
              Supported Payment Modes in Razorpay Modal:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-slate-700">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>All UPI Apps</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Debit / Credit Cards</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Net Banking (50+)</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center gap-2 shadow-2xs font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Wallets &amp; Cred</span>
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 font-medium">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Official IIC Activity Certificate</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Stationery &amp; Prototyping Kit (Chart Papers &amp; Markers)</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleRazorpayPayment}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-sky-600/25 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2.5 group hover:scale-[1.01] active:scale-[0.99]"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Opening Razorpay Checkout...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Pay ₹{fee} with Razorpay</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          {/* Trust Guarantees */}
          <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-3">
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-Bit SSL Encrypted • Direct Bank Rails</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Ticket pass is issued immediately upon payment completion
            </span>
          </div>

          <div className="pt-2 text-center">
            <Link
              href="/success"
              className="inline-flex items-center gap-1.5 text-xs text-sky-700 hover:text-sky-900 font-semibold underline decoration-sky-300"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Already completed payment via UPI? Retrieve your Workshop Pass here</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-transparent flex items-center justify-center text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      }
    >
      <PaymentContent />
    </Suspense>
  );
}
