'use client';

import React, { useState, useEffect } from 'react';

export interface EventCountdownProps {
  targetDate?: string | Date | null;
  isCompleted?: boolean;
  className?: string;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
}

export function parseTargetTimestamp(targetDate?: string | Date | null): number | null {
  if (!targetDate) return null;
  const parsed = new Date(targetDate).getTime();
  return isNaN(parsed) ? null : parsed;
}

export function getEffectiveTargetTimestamp(targetDate?: string | Date | null): number {
  const parsed = parseTargetTimestamp(targetDate);
  if (parsed !== null) {
    return parsed;
  }

  // Authoritative Workshop Date: 11th of November 2026 (09:30:00 IST)
  const november11Target = new Date('2026-11-11T09:30:00+05:30').getTime();
  if (november11Target > Date.now()) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('p2p_countdown_target', november11Target.toString());
      } catch {
        // Storage access blocked or restricted
      }
    }
    return november11Target;
  }

  // Fallback to persistent deadline in localStorage so it doesn't reset on every refresh
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('p2p_countdown_target');
      if (stored) {
        const parsedStored = parseInt(stored, 10);
        if (!isNaN(parsedStored) && parsedStored > Date.now()) {
          return parsedStored;
        }
      }
    } catch {
      // Storage access blocked or restricted
    }
  }

  // Create rolling target 14 days from now aligned to end of day if past Oct 2026 and no date configured
  const fallback = new Date();
  fallback.setDate(fallback.getDate() + 14);
  fallback.setHours(23, 59, 59, 999);
  const fallbackTs = fallback.getTime();

  return fallbackTs;
}

export function calculateTimeRemaining(targetTs: number, currentNow: number = Date.now()): TimeLeft {
  const diff = targetTs - currentNow;
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
    isEnded: false,
  };
}

export default function EventCountdown({ targetDate, isCompleted = false, className = '' }: EventCountdownProps) {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => {
    if (isCompleted) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true };
    }
    const targetTs = getEffectiveTargetTimestamp(targetDate);
    return calculateTimeRemaining(targetTs);
  });

  useEffect(() => {
    setMounted(true);

    if (isCompleted) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('p2p_countdown_target');
        } catch {
          // ignore
        }
      }
      return;
    }

    const targetTs = getEffectiveTargetTimestamp(targetDate);
    const initial = calculateTimeRemaining(targetTs);
    setTimeLeft(initial);

    // If event target timestamp has passed, stop and clean up
    if (initial.isEnded) {
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('p2p_countdown_target');
        } catch {
          // ignore
        }
      }
      return;
    }

    const interval = setInterval(() => {
      const updated = calculateTimeRemaining(targetTs);
      setTimeLeft(updated);
      if (updated.isEnded) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate, isCompleted]);

  const isFinished = isCompleted || timeLeft.isEnded;

  if (isFinished) {
    return (
      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50/90 border border-emerald-300 text-emerald-800 shadow-xs ${className}`}>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-xs font-bold uppercase tracking-wider">Event Live / Concluded</span>
      </div>
    );
  }

  const units = [
    { label: 'Days', val: String(timeLeft.days).padStart(2, '0') },
    { label: 'Hours', val: String(timeLeft.hours).padStart(2, '0') },
    { label: 'Mins', val: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'Secs', val: String(timeLeft.seconds).padStart(2, '0'), isSec: true },
  ];

  return (
    <div className={`inline-flex items-center gap-1.5 sm:gap-2 p-1.5 rounded-2xl bg-white/70 border border-sky-200/90 backdrop-blur-xl shadow-md shadow-sky-950/5 ${className}`}>
      {units.map((item, idx) => (
        <React.Fragment key={idx}>
          <div
            className={`flex flex-col items-center justify-center min-w-[50px] sm:min-w-[56px] py-2 px-1.5 rounded-xl bg-white/95 border transition-all duration-300 shadow-2xs relative overflow-hidden ${
              item.isSec
                ? 'border-sky-300 ring-1 ring-sky-400/20'
                : 'border-slate-200/90 hover:border-sky-300'
            }`}
          >
            {/* Top accent bar */}
            <div
              className={`h-0.5 w-full absolute top-0 inset-x-0 ${
                item.isSec
                  ? 'bg-gradient-to-r from-amber-400 to-sky-500'
                  : 'bg-gradient-to-r from-sky-400 to-indigo-500'
              }`}
            />

            <div className="flex items-center gap-0.5 mt-0.5">
              <span
                suppressHydrationWarning
                className="text-lg sm:text-xl font-black font-mono tabular-nums tracking-tight text-slate-950 leading-tight"
              >
                {item.val}
              </span>
              {item.isSec && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5 shrink-0" />
              )}
            </div>

            <span className="text-[9px] font-extrabold uppercase tracking-widest text-sky-800 leading-none mt-1">
              {item.label}
            </span>
          </div>

          {/* Colon divider between cards */}
          {idx < units.length - 1 && (
            <span className="text-slate-400 font-extrabold text-sm select-none -mx-0.5 pb-2">
              :
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
