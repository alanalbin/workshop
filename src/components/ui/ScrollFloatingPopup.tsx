'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, X, ShieldCheck, Ticket, Lightbulb } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface ScrollFloatingPopupProps {
  fee?: number;
  registrationsClosed?: boolean;
}

export default function ScrollFloatingPopup({ fee = 100, registrationsClosed }: ScrollFloatingPopupProps) {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (registrationsClosed) {
    return null;
  }

  useEffect(() => {
    // Check if dismissed previously during this session
    if (typeof window !== 'undefined' && sessionStorage.getItem('p2p_popup_dismissed') === 'true') {
      setIsDismissed(true);
    }

    const handleScroll = () => {
      // Show when scrolled down past 320px, hide near the very bottom footer or top hero
      const scrollY = window.scrollY;
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const isPastHero = scrollY > 320;
      const isNearFooter = scrollY > totalHeight - 200;

      if (isPastHero && !isNearFooter && !isDismissed) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('p2p_popup_dismissed', 'true');
    }
  };

  const registerHref = user ? '/register' : '/login?redirect=/register';

  return (
    <AnimatePresence>
      {isVisible && !isDismissed && (
        <motion.div
          key="scroll-floating-popup"
          initial={{ opacity: 0, y: 45, scale: 0.88 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 35, scale: 0.9 }}
          transition={{
            type: 'spring',
            stiffness: 320,
            damping: 24,
            mass: 0.8,
          }}
          className="fixed bottom-5 right-4 sm:right-6 z-50 max-w-[calc(100vw-2rem)] sm:max-w-md pointer-events-auto"
        >
          <div className="relative group">
            {/* Ambient Animated Glow Aura */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 rounded-2xl blur-md opacity-60 group-hover:opacity-100 transition-opacity duration-500 animate-pulse pointer-events-none" />

            {/* Glassmorphic Main Card */}
            <div className="relative rounded-2xl bg-[#0b071a]/95 border border-orange-500/40 p-4 sm:p-5 backdrop-blur-xl shadow-[0_16px_45px_rgba(0,0,0,0.85)] flex flex-col gap-3">
              
              {/* Header row: Live status badge + Dismiss button */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                  </span>
                  <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-emerald-300">
                    Live Registration · 70 Seats Cap
                  </span>
                </div>

                <button
                  onClick={handleDismiss}
                  className="w-6 h-6 rounded-full bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
                  aria-label="Close notification"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Body description */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-950/60 border border-orange-600/40 flex items-center justify-center shrink-0 text-amber-300 shadow-inner">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                    <span>Problem to Possibility Pass</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-orange-950/80 border border-orange-700/50 text-amber-300">
                      ₹{fee}
                    </span>
                  </h4>
                  <p className="text-xs text-zinc-300 mt-0.5 line-clamp-1">
                    11th Nov • Offline Workshop • Materials &amp; Samosa/Tea Included
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <Link
                href={registerHref}
                className="w-full mt-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-orange-950/60 hover:shadow-orange-700/50 flex items-center justify-center gap-2 group/btn"
              >
                <span>Reserve Seat (₹{fee})</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
              </Link>

              {/* Sub-badge */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-medium text-zinc-400">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                <span>IIC Activity Certificate · Mr. Muhammed Shayiz K P</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
