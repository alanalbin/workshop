'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ArrowUpRight, LogIn, LogOut } from 'lucide-react';
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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo with Official KMCT Emblem */}
        <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <img
            src="/logos/kmct-icon.png"
            alt="KMCT Emblem"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain drop-shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm md:text-base tracking-wider text-slate-950 uppercase group-hover:text-sky-600 transition-colors leading-tight">
              PROBLEM TO POSSIBILITY
            </span>
            <span className="text-[9px] sm:text-[10px] text-slate-600 font-semibold tracking-tight">
              KMCT Kasaragod • IIC Quarter 1 Workshop
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/#about"
            className="text-xs uppercase font-bold tracking-wider text-slate-800 hover:text-sky-700 transition-colors"
          >
            Overview
          </a>
          <a
            href="/#speaker"
            className="text-xs uppercase font-bold tracking-wider text-slate-800 hover:text-sky-700 transition-colors"
          >
            Resource Person
          </a>
          <a
            href="/#workshop"
            className="text-xs uppercase font-bold tracking-wider text-slate-800 hover:text-sky-700 transition-colors"
          >
            Agenda
          </a>
          <a
            href="/#benefits"
            className="text-xs uppercase font-bold tracking-wider text-slate-800 hover:text-sky-700 transition-colors"
          >
            Outcomes
          </a>
          <a
            href="/#faq"
            className="text-xs uppercase font-bold tracking-wider text-slate-800 hover:text-sky-700 transition-colors"
          >
            FAQ
          </a>
          <a
            href="https://www.kmct.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold tracking-tight text-slate-800 hover:text-sky-700 flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white border border-slate-200/90 shadow-2xs group"
            title="KMCT College of Engineering for Emerging Technologies and Management"
          >
            <span>kmct.org</span>
            <ArrowUpRight className="w-3 h-3 text-slate-500 group-hover:text-sky-600 group-hover:translate-x-0.5 transition-all" />
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-full pl-2 pr-3 py-1">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full border border-sky-500/50 object-cover"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="text-xs font-medium text-slate-700 max-w-[120px] truncate">
                {user.displayName || user.phoneNumber || 'User'}
              </span>
              <button
                onClick={() => signOut()}
                className="p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors ml-1 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-3.5 py-2 rounded-full bg-white/90 hover:bg-white border border-slate-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <LogIn className="w-3.5 h-3.5 text-sky-600" />
              <span>Sign In</span>
            </Link>
          )}

          {registrationsClosed ? (
            <Link
              href="/register"
              className="px-4 py-2 rounded-full bg-slate-200 border border-slate-300 text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 hover:border-slate-400 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Registrations Closed</span>
            </Link>
          ) : (
            <Link
              href={user ? "/register" : "/login?redirect=/register"}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-sky-600/25"
            >
              Register (₹100)
            </Link>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

      </div>

      {/* Mobile Menu Drawer with Smooth Spring Animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-nav-drawer"
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -6 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="md:hidden bg-white/95 backdrop-blur-2xl border-b border-slate-200 px-6 py-6 space-y-4 shadow-xl overflow-hidden will-change-transform"
          >
          {/* User Sign In / Profile status on mobile */}
          {user ? (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-8 h-8 rounded-full border border-purple-400"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">
                    {(user.displayName || user.phoneNumber || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-slate-900 truncate max-w-[150px]">
                    {user.displayName || user.phoneNumber || 'User'}
                  </p>
                  <p className="text-[10px] text-purple-600">Signed in</p>
                </div>
              </div>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 rounded-lg bg-red-50 text-red-600 border border-red-200 text-xs font-medium cursor-pointer"
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
              className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4 text-purple-600" />
              <span>Sign In with OTP / Google</span>
            </button>
          )}

          <a
            href="/#about"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-purple-600"
          >
            Workshop Overview
          </a>
          <a
            href="/#speaker"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-purple-600"
          >
            Resource Person
          </a>
          <a
            href="/#workshop"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-purple-600"
          >
            Proposed Agenda
          </a>
          <a
            href="/#benefits"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-purple-600"
          >
            Expected Outcomes
          </a>
          <a
            href="/#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-slate-700 hover:text-purple-600"
          >
            FAQ
          </a>
          <a
            href="https://www.kmct.org"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between text-sm font-medium text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200 hover:bg-slate-100"
          >
            <span>KMCT College Website</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400" />
          </a>
          <div className="pt-2">
            {registrationsClosed ? (
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 rounded-xl text-center bg-slate-200 border border-slate-300 text-slate-600 font-bold text-sm shadow-xs flex items-center justify-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>Registrations Closed</span>
              </Link>
            ) : (
              <Link
                href={user ? "/register" : "/login?redirect=/register"}
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full py-3 rounded-xl text-center bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 text-white font-bold text-sm shadow-md"
              >
                Register (₹100)
              </Link>
            )}
          </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
