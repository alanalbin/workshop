'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  IndianRupee,
  Phone,
  Award,
  Package,
  Compass,
  CheckCircle2,
  Users,
  ShieldCheck,
  Zap,
  Lightbulb,
  ExternalLink,
  Maximize2,
  X,
  Target,
} from 'lucide-react';
import { EventConfig } from '@/types';
import { useAuth } from '@/context/AuthContext';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';
import EventCountdown from '@/components/home/EventCountdown';

interface HeroSectionProps {
  event: EventConfig;
  initialSeats?: {
    total: number;
    paid: number;
    remaining: number;
    percentFilled: number;
  };
}

export default function HeroSection({ event }: HeroSectionProps) {
  const { user } = useAuth();
  const fee = event.registrationFee || 100;
  const coordinatorName = event.localCoordinator?.name || 'Mr. Abdul Mujeeb MS';
  const coordinatorPhone = event.localCoordinator?.phone || '8848563266';
  const isEventCompleted = Boolean(event.eventCompleted);
  const isClosed = Boolean(event.registrationsClosed);
  const [showPosterModal, setShowPosterModal] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        damping: 24,
        stiffness: 120,
      },
    },
  };

  return (
    <section className="relative w-full pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden z-10">
      
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-orange-900/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[350px] bg-purple-900/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center"
        >
          
          {/* ========================================================
              LEFT COLUMN: Primary Content & Interactive Controls (7 cols)
             ======================================================== */}
          <div className="lg:col-span-7 flex flex-col justify-center">
            
            {/* Event Association Badges */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-2.5 mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-950/60 border border-orange-500/40 text-xs font-semibold text-orange-300">
                <img src="/logos/iic-logo.svg" alt="IIC" className="w-4 h-4 object-contain" />
                <span>IIC Quarter 1 Activity</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-300">
                <img src="/logos/kmct-college.png" alt="KMCT" className="h-3.5 w-auto object-contain max-w-[90px]" />
                <span className="text-zinc-500">•</span>
                <span>KMCTCEEM Kasaragod</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-zinc-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>For 1st-Year Students</span>
              </div>
            </motion.div>

            {/* Sub-tagline */}
            <motion.div variants={itemVariants}>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-amber-400 font-extrabold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Workshop on Problem Solving &amp; Ideation</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.04]"
            >
              FROM PROBLEM TO <br />
              <span className="text-gradient-vibrant bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                POSSIBILITY.
              </span>
            </motion.h1>

            {/* Turn Real-World Challenges into Pitch-Ready Innovations */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg sm:text-xl font-bold text-amber-200/95 tracking-tight"
            >
              Turn Real-World Challenges into Pitch-Ready Innovations!
            </motion.p>

            {/* Concise Mission Narrative */}
            <motion.p
              variants={itemVariants}
              className="mt-3 text-sm sm:text-base text-slate-300 max-w-xl font-normal leading-relaxed"
            >
              A hands-on, activity-driven workshop for 1st-year Engineering and Management students at KMCT College. Work in small multidisciplinary teams to discover real problems, brainstorm solutions, create hand-drawn concept posters, and deliver a structured pitch.
            </motion.p>

            {/* Key Logistics Micro-Tags */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-2 text-xs text-zinc-300">
              <span className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Wednesday, 11th November 2026</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                <span>09:30 AM – 04:00 PM</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-amber-500/10 border border-amber-500/30 font-bold text-amber-300 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-amber-400" />
                <span>₹{fee}/- Registration Pass</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-200 font-semibold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-purple-400" />
                <span>Strictly 70 Seats</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white/[0.03] border border-white/[0.08] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                <span>College Seminar Hall</span>
              </span>
            </motion.div>

            {/* Workshop Status & Countdown */}
            <motion.div
              variants={itemVariants}
              className={`mt-7 p-4 sm:p-5 rounded-2xl backdrop-blur-md max-w-lg shadow-xl ${
                isEventCompleted
                  ? 'bg-emerald-950/20 border border-emerald-500/30 shadow-emerald-950/20'
                  : 'bg-white/[0.03] border border-white/[0.1] shadow-orange-950/20'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {isEventCompleted ? (
                    <>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Event Completed
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold mt-0.5">
                        Concluded on 11th Nov 2026 • Seminar Hall
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5 font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        <Zap className="w-3 h-3 text-amber-400" />
                        Registration Open • Event Date: 11 Nov 2026
                      </span>
                      <p className="text-xs text-zinc-300 font-semibold mt-0.5">Offline at College Seminar Hall</p>
                    </>
                  )}
                </div>
                <EventCountdown
                  targetDate="2026-11-11T09:30:00+05:30"
                  isCompleted={isEventCompleted}
                />
              </div>
            </motion.div>

            {/* Resource Person Preview Card */}
            <motion.div variants={itemVariants} className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-black/40 border border-orange-500/30 max-w-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src="/event-poster.jpg"
                    alt="Mr. Muhammed Shayiz K P"
                    className="w-full h-full object-cover object-[50%_40%] scale-150"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                      Keynote Resource Person
                    </span>
                    <button
                      onClick={() => setShowPosterModal(true)}
                      className="text-[10px] font-semibold text-purple-300 hover:text-white flex items-center gap-1 transition-colors"
                    >
                      <span>View Poster</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate mt-0.5">Mr. Muhammed Shayiz K P</h4>
                  <p className="text-[11px] text-zinc-300 truncate">
                    Senior Software Engineer, Doodleblue Innovations, Chennai
                  </p>
                  <p className="text-[10px] text-zinc-400 truncate">
                    Co-founder, Shine Technologies, Kannur
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Coordinator & Approval Information */}
            <motion.div variants={itemVariants} className="mt-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.08] max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Proposed By</p>
                  <p className="text-sm font-semibold text-white mt-0.5">{coordinatorName}</p>
                  <p className="text-[10px] text-amber-400">IIC Coordinator</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Approval</p>
                  <p className="text-xs font-semibold text-white mt-0.5">Approved by Principal</p>
                  <p className="text-[10px] text-emerald-400">Date: 4th November 2026</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
              {isClosed ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-7 py-4 rounded-2xl bg-zinc-800/90 border border-zinc-700/70 text-zinc-300 font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-xl">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Registrations Closed</span>
                  </div>
                  <Link
                    href="/success"
                    className="px-6 py-4 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/30 text-sm font-semibold transition-all backdrop-blur-md active:scale-[0.98] flex items-center gap-2"
                  >
                    <span>Lookup Your Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  href={user ? "/register" : "/login?redirect=/register"}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm sm:text-base transition-all shadow-xl shadow-orange-950/80 hover:shadow-orange-700/50 flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Register Now (₹{fee})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <a
                href="#workshop"
                className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-sm font-medium transition-all backdrop-blur-md active:scale-[0.98]"
              >
                Workshop Agenda
              </a>
              <button
                type="button"
                onClick={() => setShowPosterModal(true)}
                className="px-4 py-4 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-all flex items-center gap-1.5"
              >
                <Maximize2 className="w-3.5 h-3.5 text-amber-400" />
                <span>Official Poster</span>
              </button>
            </motion.div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Interactive 3D Touch-Tilt Card (5 cols)
             ======================================================== */}
          <motion.div variants={itemVariants} className="lg:col-span-5 w-full">
            <TouchInteractiveTilt maxTilt={10} glareOpacity={0.25}>
              <div className="glass-card rounded-3xl p-7 sm:p-8 border border-orange-500/40 shadow-2xl shadow-orange-950/60 relative backdrop-blur-2xl overflow-hidden group">
                
                {/* Glowing Corner Ambient */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-orange-600/20 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/30 transition-all duration-500" />

                {/* Card Header & Live Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-white/[0.08] mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-amber-400 shadow-md">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block">
                        IIC Quarter 1 Activity
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-white mt-0.5">
                        Official Workshop Pass
                      </h3>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>70 Seats Max</span>
                  </div>
                </div>

                {/* 4 Core Pillars of the Workshop */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-amber-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 text-amber-300">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Problem Identification &amp; Empathy</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Discover real-world issues with empathy worksheets &amp; symptom sorting games.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-orange-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shrink-0 text-amber-300">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Structured Ideation Sprint</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Crazy 8s, Yes-And, Worst-Idea reversal &amp; impact-feasibility matrix.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-purple-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shrink-0 text-purple-300">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Hand-Drawn Prototype Poster</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Visualize solutions on chart paper with storyboards and low-fidelity mockups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.08] hover:border-emerald-500/40 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-300">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Pitch Structure &amp; Presentation</h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Deliver short pitch to the panel and receive IIC activity certificate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Pass Bar */}
                <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-xs text-slate-300">Target Cohort:</span>
                    <span className="text-xs font-bold text-white">1st-Year Students (70 Cap)</span>
                  </div>
                  {isClosed ? (
                    <span className="text-xs font-extrabold text-rose-300 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-600/40">
                      Closed
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-amber-300 bg-amber-950/60 px-3 py-1.5 rounded-lg border border-amber-600/40">
                      ₹{fee}/- Pass
                    </span>
                  )}
                </div>

              </div>
            </TouchInteractiveTilt>
          </motion.div>

        </motion.div>
      </div>

      {/* Official Poster Modal */}
      <AnimatePresence>
        {showPosterModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPosterModal(false)}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden border border-amber-500/40 bg-zinc-950 shadow-2xl flex flex-col"
            >
              <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Official Workshop Poster</span>
                </span>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-auto p-2">
                <img
                  src="/event-poster.jpg"
                  alt="From Problem to Possibility Poster"
                  className="w-full h-auto rounded-lg object-contain"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
