'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Users,
  BookOpen,
  Clock,
  Building2,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  CheckCircle2,
  FileText,
  Palette,
  Mic,
  Award,
} from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

export default function AboutSection() {
  const objectives = [
    {
      icon: Target,
      title: 'Human-Centered Problem Identification',
      description:
        'Build a practical, empathetic approach to discovering real-world problems and understanding the actual users affected.',
    },
    {
      icon: Lightbulb,
      title: 'Structured Ideation Techniques',
      description:
        'Develop creative thinking through rapid sprint frameworks like Crazy 8s, Yes-And, and Worst-Idea reversals.',
    },
    {
      icon: Palette,
      title: 'Hand-Drawn Concept & Poster Prototyping',
      description:
        'Translate abstract thoughts into simple visual storyboards, low-fidelity paper prototypes, and concept posters.',
    },
    {
      icon: Mic,
      title: 'Pitching, Validation & Ecosystem Support',
      description:
        'Structure a persuasive pitch presentation and connect with KSUM, IEDC, and incubation funding pathways.',
    },
  ];

  return (
    <section id="about" className="py-24 bg-[#070410]/30 backdrop-blur-[2px] border-t border-purple-950/40 relative overflow-hidden z-10">
      
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-orange-900/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/70 border border-orange-800/40 text-xs font-bold text-orange-300 uppercase tracking-widest mb-4 shadow-sm">
            <Building2 className="w-3.5 h-3.5 text-orange-400" />
            <span>Proposal &amp; Mission Overview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            From Problem to Possibility <br />
            <span className="text-gradient-vibrant bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
              KMCT College of Engineering, Kasaragod.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-300 leading-relaxed">
            Organized under the <strong>Institution&apos;s Innovation Council (IIC) Quarter 1 Activities</strong> (1st September – 30th November), focusing on the thrust area of <em>Inspiration, Motivation, and Ideation</em>. Designed to foster critical thinking, systematic problem identification, and human-centered design capabilities among our students.
          </p>
        </motion.div>

        {/* 4 Objectives Grid with 3D Touch Tilt */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {objectives.map((obj, idx) => {
            const Icon = obj.icon;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35, scale: 0.92 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: idx * 0.08 }}
              >
                <TouchInteractiveTilt maxTilt={8} glareOpacity={0.2} className="h-full">
                  <div className="glass-card rounded-3xl p-7 border border-white/[0.08] hover:border-orange-500/50 transition-all duration-300 shadow-xl shadow-black/30 h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-950/80 to-purple-950/80 border border-orange-500/40 flex items-center justify-center text-amber-400 mb-5 p-2.5 shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-white mb-2 leading-snug">
                        {obj.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {obj.description}
                      </p>
                    </div>
                  </div>
                </TouchInteractiveTilt>
              </motion.div>
            );
          })}
        </div>

        {/* Resource Person Feature Card */}
        <motion.div
          id="speaker"
          initial={{ opacity: 0, y: 35, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 24 }}
          className="mt-14"
        >
          <TouchInteractiveTilt maxTilt={5} glareOpacity={0.2}>
            <div className="rounded-3xl bg-gradient-to-r from-orange-950/60 via-[#120921] to-purple-950/50 border border-orange-500/40 p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl shadow-2xl shadow-orange-950/30">
              <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Photo of Mr. Muhammed Shayiz K P */}
                  <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl bg-amber-500/20 border-2 border-amber-400/50 overflow-hidden shrink-0 shadow-2xl relative">
                    <img
                      src="/event-poster.jpg"
                      alt="Mr. Muhammed Shayiz K P"
                      className="w-full h-full object-cover object-[50%_40%] scale-[1.7]"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs py-0.5 text-center text-[9px] font-mono text-amber-300 font-bold uppercase">
                      Resource Person
                    </div>
                  </div>

                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-500/50 text-xs font-bold text-amber-300 uppercase tracking-wider mb-2 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Keynote Mentor &amp; Facilitator</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      Mr. Muhammed Shayiz K P
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-amber-300">
                      Senior Software Engineer, Doodleblue Innovations, Chennai
                    </p>
                    <p className="text-xs text-zinc-300">
                      Co-founder, Shine Technologies, Kannur
                    </p>
                    <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Bringing high-impact engineering experience and startup leadership to mentor KMCT students through end-to-end design thinking, empathy discovery, problem-solving, and pitch execution.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/10 text-xs">
                    <p className="text-[10px] font-mono uppercase text-zinc-400">Date &amp; Venue</p>
                    <p className="font-bold text-white mt-0.5">Wednesday, 11th Nov 2026</p>
                    <p className="text-amber-400 text-[11px]">09:30 AM – 04:00 PM</p>
                    <p className="text-zinc-400 text-[11px]">College Seminar Hall</p>
                  </div>

                  <a
                    href="#workshop"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-950/60 text-center flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>View Workshop Schedule</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </TouchInteractiveTilt>
        </motion.div>

        {/* Requisition & Budget Transparency Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-8 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-zinc-300"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/60 border border-orange-700/40 flex items-center justify-center text-amber-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Official Institutional Requisition &amp; Budget</p>
              <p className="text-zinc-400 text-xs mt-0.5">
                Proposed by Mr. Abdul Mujeeb MS (IIC Coordinator) • Approved by Principal on 4th November 2026
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 font-mono text-[11px]">
            <span className="px-2.5 py-1 rounded bg-black/40 border border-white/5">
              Remuneration: <strong className="text-white">₹6,000</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-black/40 border border-white/5">
              Canteen Refreshment (Samosa &amp; Tea): <strong className="text-white">₹1,400</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-black/40 border border-white/5">
              Stationery &amp; Posters: <strong className="text-white">₹1,000</strong>
            </span>
            <span className="px-2.5 py-1 rounded bg-orange-950/60 border border-orange-500/40 text-amber-300 font-bold">
              Total Budget: ₹8,400
            </span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
