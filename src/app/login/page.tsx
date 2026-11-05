'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  LogOut,
  Award,
  Zap,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

function GoogleIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.99 0 12s.45 3.84 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/register';

  const {
    user,
    signInWithGoogle,
    loginAsDemoUser,
    signOut,
  } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const res = await signInWithGoogle();
      if (res.success) {
        router.push(redirectPath);
      } else {
        setError(res.error || 'Failed to sign in with Google. Please try again.');
      }
    } catch (err: any) {
      setError(err?.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-20 sm:py-24 relative flex items-center justify-center px-4">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        
        {/* Navigation Back */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-purple-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>

          <span className="text-xs font-mono text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md shadow-xs">
            IIC Quarter 1 Workshop • KMCT Kasaragod
          </span>
        </div>

        {/* Card Box */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden text-slate-800 p-6 sm:p-9 relative">
          
          {/* Header Badge */}
          <div className="text-center mb-7 relative z-10">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                <Sparkles className="w-8 h-8" />
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
              {user ? 'Welcome Back!' : 'Sign In to Register'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-sm mx-auto">
              {user
                ? 'Your Google account is verified. Click below to complete your registration.'
                : 'Sign in with your Google account to get your official pass for From Problem to Possibility.'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs space-y-3 animate-in fade-in duration-200 shadow-xs">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold">{error}</p>
                </div>
              </div>

              {error.includes('not authorized in Firebase') && (
                <div className="pt-2 border-t border-red-200 space-y-2">
                  <p className="text-[11px] text-slate-600">
                    To enable Google Sign-In permanently: Open <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-purple-700 underline font-bold">Firebase Console</a> &gt; <strong>Authentication</strong> &gt; <strong>Settings</strong> &gt; <strong>Authorized domains</strong> and add your website domain.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      loginAsDemoUser({ displayName: 'Registered Participant' });
                      router.push(redirectPath);
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-100 hover:bg-purple-200 border border-purple-300 text-purple-800 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Proceed Directly to Registration Form</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STATE 1: USER ALREADY SIGNED IN WITH GOOGLE */}
          {user ? (
            <div className="space-y-6">
              {/* Profile Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-purple-50/70 border border-purple-200 flex items-center gap-3.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-14 h-14 rounded-full border-2 border-purple-300 object-cover shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-base font-bold text-slate-900 truncate">
                      {user.displayName || 'Participant'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-purple-700 truncate mt-0.5">
                    {user.email || 'Google Account'}
                  </p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-3 py-1.5 px-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
                <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                  2
                </span>
                <span>Ready! Fill out your registration details and secure your pass.</span>
              </div>

              {/* PRIMARY PROCEED BUTTON */}
              <Link
                href={redirectPath}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span>Proceed to Registration Form (₹100)</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Sign out switch */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Want to use another Google account?</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-purple-700 hover:text-purple-900 flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            /* STATE 2: NOT SIGNED IN -> PROMINENT GOOGLE LOGIN */
            <div className="space-y-6">
              
              {/* Step Flow Banner */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs">
                <div className="flex items-center gap-2.5 text-purple-800 font-semibold">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                    1
                  </span>
                  <span>Step 1: Sign in with Google</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                  <span>Step 2: Registration</span>
                  <ArrowRight className="w-3 h-3 text-slate-400" />
                </div>
              </div>

              {/* Big Google Sign-in Button */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-slate-800 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <GoogleIcon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" />
                )}
                <span>{loading ? 'Connecting with Google...' : 'Continue with Google'}</span>
              </button>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Instant Access</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    1-click authorization without OTP or password delays.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-left">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs mb-1">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    <span>IIC Activity Cert</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-tight">
                    Certificate tied directly to your verified Google account.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* Footer Security Note */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Secure 256-bit OAuth authentication by Google</span>
          </div>

        </div>

        {/* Link back to KMCT CEEM */}
        <div className="mt-6 text-center">
          <a
            href="https://kmct.org"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-purple-700 transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>KMCT CEEM Kasaragod</span>
            <span className="text-[10px] text-slate-400">↗</span>
          </a>
        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
