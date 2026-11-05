'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Users,
  Award,
  ExternalLink,
  Target,
  Package,
  IndianRupee,
  Maximize2,
  X,
  Lightbulb,
} from 'lucide-react';
import { EventConfig } from '@/types';
import EventCountdown from './EventCountdown';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';
import { useAuth } from '@/context/AuthContext';

interface HeroSectionProps {
  event: EventConfig;
}

export default function HeroSection({ event }: HeroSectionProps) {
  const [showPosterModal, setShowPosterModal] = useState(false);
  const { user } = useAuth();

  const isClosed =
    event.registrationsClosed ||
    (event.registrationClosingDate &&
      new Date(event.registrationClosingDate).getTime() <= Date.now());

  const fee = event.registrationFee ?? 100;
  const coordinatorName = event.officialContact?.name || 'Mr. Abdul Mujeeb MS';
  const isEventCompleted = event.eventCompleted || false;

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <section className="relative min-h-[92vh] flex items-center pt-24 pb-16 overflow-hidden">
      
      {/* Light Theme Subtle Ambient Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 border border-orange-200 text-xs font-semibold text-orange-700 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                <span>IIC Quarter 1 Activity</span>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                <span>KMCTCEEM Kasaragod</span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>For 1st-Year Students</span>
              </div>
            </motion.div>

            {/* Sub-tagline */}
            <motion.div variants={itemVariants}>
              <span className="text-xs sm:text-sm font-mono uppercase tracking-widest text-purple-700 font-extrabold flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Workshop on Problem Solving &amp; Ideation</span>
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.04]"
            >
              FROM PROBLEM TO <br />
              <span className="text-gradient-vibrant bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
                POSSIBILITY.
              </span>
            </motion.h1>

            {/* Turn Real-World Challenges into Pitch-Ready Innovations */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-lg sm:text-xl font-bold text-slate-800 tracking-tight"
            >
              Turn Real-World Challenges into Pitch-Ready Innovations!
            </motion.p>

            {/* Concise Mission Narrative */}
            <motion.p
              variants={itemVariants}
              className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl font-normal leading-relaxed"
            >
              A hands-on, activity-driven workshop for 1st-year Engineering and Management students at KMCT College. Work in small multidisciplinary teams to discover real problems, brainstorm solutions, create hand-drawn concept posters, and deliver a structured pitch.
            </motion.p>

            {/* Key Logistics Micro-Tags */}
            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-2 text-xs text-slate-700">
              <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>Wednesday, 11th November 2026</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>09:30 AM – 04:00 PM</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 font-bold text-amber-800 flex items-center gap-1.5 shadow-xs">
                <IndianRupee className="w-3.5 h-3.5 text-amber-600" />
                <span>₹{fee}/- Registration Pass</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 font-semibold flex items-center gap-1.5 shadow-xs">
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Strictly 70 Seats</span>
              </span>
              <span className="px-3 py-1.5 rounded-md bg-white border border-slate-200 flex items-center gap-1.5 shadow-xs">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>College Seminar Hall</span>
              </span>
            </motion.div>

            {/* Workshop Status & Countdown */}
            <motion.div
              variants={itemVariants}
              className={`mt-7 p-4 sm:p-5 rounded-2xl max-w-lg shadow-sm border ${
                isEventCompleted
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  {isEventCompleted ? (
                    <>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 flex items-center gap-1.5 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Event Completed
                      </span>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">
                        Concluded on 11th Nov 2026 • Seminar Hall
                      </p>
                    </>
                  ) : (
                    <>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 flex items-center gap-1.5 font-bold">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-600" />
                        </span>
                        <Zap className="w-3 h-3 text-purple-600" />
                        Registration Open • Event Date: 11 Nov 2026
                      </span>
                      <p className="text-xs text-slate-600 font-semibold mt-0.5">Offline at College Seminar Hall</p>
                    </>
                  )}
                </div>
                <EventCountdown
                  targetDate="2026-11-11T09:30:00+05:30"
                  isCompleted={isEventCompleted}
                />
              </div>
            </motion.div>

            {/* Resource Person Preview Card with Extracted Photo */}
            <motion.div variants={itemVariants} className="mt-4 p-4 rounded-xl bg-white border border-slate-200 shadow-sm max-w-lg">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center shadow-xs">
                  <img
                    src="/trainer-shayiz.jpg"
                    alt="Mr. Muhammed Shayiz K P"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded">
                      Keynote Resource Person
                    </span>
                    <button
                      onClick={() => setShowPosterModal(true)}
                      className="text-[10px] font-semibold text-slate-500 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Poster</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 truncate mt-1">Mr. Muhammed Shayiz K P</h4>
                  <p className="text-[11px] text-slate-600 truncate">
                    Senior Software Engineer, Doodleblue Innovations, Chennai
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    Co-founder, Shine Technologies, Kannur
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Coordinator & Approval Information */}
            <motion.div variants={itemVariants} className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Proposed By</p>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5">{coordinatorName}</p>
                  <p className="text-[10px] text-purple-700 font-medium">IIC Coordinator</p>
                </div>
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Approval</p>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5">Approved by Principal</p>
                  <p className="text-[10px] text-emerald-600 font-medium">Date: 4th November 2026</p>
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center gap-4">
              {isClosed ? (
                <div className="flex flex-wrap items-center gap-3">
                  <div className="px-7 py-4 rounded-2xl bg-slate-200 border border-slate-300 text-slate-600 font-extrabold text-sm sm:text-base flex items-center gap-2.5 shadow-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Registrations Closed</span>
                  </div>
                  <Link
                    href="/success"
                    className="px-6 py-4 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2"
                  >
                    <span>Lookup Your Pass</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <Link
                  href={user ? "/register" : "/login?redirect=/register"}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm sm:text-base transition-all shadow-lg shadow-orange-500/20 flex items-center gap-2.5 group hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Register Now (₹{fee})</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
              )}
              <a
                href="#workshop"
                className="px-6 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-sm font-semibold transition-all active:scale-[0.98]"
              >
                Workshop Agenda
              </a>
              <button
                type="button"
                onClick={() => setShowPosterModal(true)}
                className="px-4 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5 text-purple-600" />
                <span>Official Poster</span>
              </button>
            </motion.div>

          </div>

          {/* ========================================================
              RIGHT COLUMN: Interactive 3D Touch-Tilt Card (5 cols)
             ======================================================== */}
          <motion.div variants={itemVariants} className="lg:col-span-5 w-full">
            <TouchInteractiveTilt maxTilt={8} glareOpacity={0.15}>
              <div className="bg-white rounded-3xl p-7 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden group">
                
                {/* Glowing Corner Ambient */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/10 transition-all duration-500" />

                {/* Card Header & Live Badge */}
                <div className="flex items-center justify-between pb-5 border-b border-slate-200 mb-6 relative z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 block">
                        IIC Quarter 1 Activity
                      </span>
                      <h3 className="text-lg sm:text-xl font-black text-slate-900 mt-0.5">
                        Official Workshop Pass
                      </h3>
                    </div>
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>70 Seats Max</span>
                  </div>
                </div>

                {/* 4 Core Pillars of the Workshop */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0 text-purple-700">
                      <Target className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Problem Identification &amp; Empathy</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Discover real-world issues with empathy worksheets &amp; symptom sorting games.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 border border-orange-200 flex items-center justify-center shrink-0 text-orange-700">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Structured Ideation Sprint</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Crazy 8s, Yes-And, Worst-Idea reversal &amp; impact-feasibility matrix.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center shrink-0 text-indigo-700">
                      <Package className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Hand-Drawn Prototype Poster</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Visualize solutions on chart paper with storyboards and low-fidelity mockups.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 text-emerald-700">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">Pitch Structure &amp; Presentation</h4>
                      <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                        Deliver short pitch to the panel and receive IIC activity certificate.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Pass Bar */}
                <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-slate-500">Target Cohort:</span>
                    <span className="text-xs font-bold text-slate-900">1st-Year Students (70 Cap)</span>
                  </div>
                  {isClosed ? (
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      Closed
                    </span>
                  ) : (
                    <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
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
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md p-4 sm:p-8 flex items-center justify-center cursor-pointer"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full max-h-[90vh] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-2xl flex flex-col"
            >
              <div className="p-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Official Workshop Poster</span>
                </span>
                <button
                  onClick={() => setShowPosterModal(false)}
                  className="p-1 rounded-lg bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
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
