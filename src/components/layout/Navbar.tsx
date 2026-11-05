'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Menu, X, ArrowUpRight, Shield, User, LogIn, LogOut, Lightbulb } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, openAuthModal, signOut } = useAuth();
  const [registrationsClosed, setRegistrationsClosed] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await fetch('/api/event');
        if (res.ok) {
          const data = await res.json();
          if (data?.event) {
            const closed =
              Boolean(data.event.registrationsClosed) ||
              (Boolean(data.event.registrationClosingDate) &&
                new Date(data.event.registrationClosingDate).getTime() <= Date.now());
            setRegistrationsClosed(closed);
          }
        }
      } catch {
        // Fallback
      }
    }
    checkStatus();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#05030a]/85 backdrop-blur-xl border-b border-purple-950/40">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo / Wordmark */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-orange-600/30 to-purple-600/30 border border-orange-500/40 flex items-center justify-center p-1.5 shadow-md group-hover:scale-105 transition-transform">
            <Lightbulb className="w-5 h-5 text-amber-400 group-hover:text-amber-300 transition-colors" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm sm:text-base tracking-wider text-white uppercase group-hover:text-amber-300 transition-colors">
              PROBLEM TO POSSIBILITY
            </span>
            <span className="text-[10px] text-amber-400/90 font-medium tracking-tight">
              KMCT Kasaragod • IIC Quarter 1 Workshop
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/#about"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Overview
          </a>
          <a
            href="/#speaker"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Resource Person
          </a>
          <a
            href="/#workshop"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Agenda
          </a>
          <a
            href="/#benefits"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            Outcomes
          </a>
          <a
            href="/#faq"
            className="text-xs uppercase font-medium tracking-wider text-slate-300 hover:text-white transition-colors"
          >
            FAQ
          </a>
          <a
            href="https://www.kmct.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium tracking-tight text-zinc-300 hover:text-white flex items-center gap-2 transition-all px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:border-amber-500/40 hover:bg-white/[0.08] group"
            title="KMCT College of Engineering for Emerging Technologies and Management"
          >
            <img src="/logos/kmct-college.png" alt="KMCT" className="h-4 w-auto object-contain max-w-[80px]" />
            <span>kmct.org</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full pl-2 pr-3 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-purple-500/50 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-purple-700 text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-slate-200 max-w-[120px] truncate">
                {user.displayName || user.phoneNumber || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1 text-slate-400 hover:text-red-400 rounded-full transition-colors ml-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-purple-400" />
              <span>Sign In</span>
            </Link>
          )}

          {registrationsClosed ? (
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-zinc-800/90 border border-zinc-700/80 text-zinc-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:border-zinc-500 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Registrations Closed</span>
            </Link>
          ) : (
            <Link
              href={user ? "/register" : "/login?redirect=/register"}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-950/60 hover:shadow-orange-700/40"
            >
              Register (₹100)
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070410]/95 backdrop-blur-2xl border-b border-purple-950/60 px-6 py-6 space-y-4">
          {/* User Sign In / Profile status on mobile */}
          {user ? (
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-purple-500/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-700 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-white truncate max-w-[150px]">
                    {user.displayName || user.phoneNumber || 'User'}
                  </p>
                  <p className="text-[10px] text-purple-300">Signed in</p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-950/50 text-red-300 text-xs font-medium cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal();
              }}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-purple-400" />
              <span>Sign In with OTP / Google</span>
            </button>
          )}

          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Workshop Overview
          </a>
          <a
            href="/#speaker"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Resource Person
          </a>
          <a
            href="/#workshop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Proposed Agenda
          </a>
          <a
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            Expected Outcomes
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-200 hover:text-amber-400"
          >
            FAQ
          </a>
          <a
            href="https://www.kmct.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-medium text-zinc-200 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.08] hover:border-white/20"
          >
            <span className="flex items-center gap-2.5">
              <img src="/logos/kmct-college.png" alt="KMCT" className="h-4 w-auto object-contain" />
              <span>KMCT College Website</span>
            </span>
            <ArrowUpRight className="w-4 h-4 text-zinc-400" />
          </a>
          <div className="pt-2">
            {registrationsClosed ? (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 rounded-xl text-center bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold text-sm shadow-lg flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Registrations Closed</span>
              </Link>
            ) : (
              <Link
                href={user ? "/register" : "/login?redirect=/register"}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 rounded-xl text-center bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 text-white font-bold text-sm shadow-lg shadow-orange-950"
              >
                Register (₹100)
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
