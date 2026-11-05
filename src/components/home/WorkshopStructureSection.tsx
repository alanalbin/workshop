'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightbulb,
  Compass,
  Zap,
  Presentation,
  CheckCircle,
  Clock,
  Coffee,
  Utensils,
  Sparkles,
  Palette,
  Target,
  FileSpreadsheet,
} from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface AgendaItem {
  time: string;
  title: string;
  format: string;
  description: string;
  type: 'session' | 'break';
  icon: any;
  tag: string;
}

const AGENDA: AgendaItem[] = [
  {
    time: '09:30 – 10:00',
    title: 'Inauguration, Welcome & Creative Warm-Up',
    format: 'Many Uses Challenge; Multidisciplinary Team Formation',
    description:
      'Official opening followed by divergent thinking warm-up exercises and forming collaborative teams of 1st-year engineering & management students.',
    type: 'session',
    icon: Sparkles,
    tag: 'Kickoff & Teams',
  },
  {
    time: '10:00 – 10:30',
    title: 'Problem-Solving Mindset',
    format: 'Problem / Symptom / Solution Sorting Game',
    description:
      'Learn to differentiate root problems from surface-level symptoms and premature solutions through an interactive classification game.',
    type: 'session',
    icon: Target,
    tag: 'Mindset & Analysis',
  },
  {
    time: '10:30 – 11:15',
    title: 'Discover a Real Problem',
    format: 'Empathy & Problem-Framing Worksheet',
    description:
      'Step into the shoes of affected users. Formulate a crisp, human-centered problem statement and define your exact target persona.',
    type: 'session',
    icon: FileSpreadsheet,
    tag: 'User Empathy',
  },
  {
    time: '11:15 – 11:30',
    title: 'Morning Refreshment Break',
    format: 'Tea & Fresh Canteen Samosas',
    description: 'Informal networking and discussion with mentors over tea and hot snacks provided at the venue.',
    type: 'break',
    icon: Coffee,
    tag: 'Refreshment Break',
  },
  {
    time: '11:30 – 12:15',
    title: 'Generate Ideas (Ideation Sprint)',
    format: 'Crazy 8s, Yes-And & Worst-Idea Reversal',
    description:
      'Unleash radical creativity! Rapid ideation sprints using Crazy 8s, lateral thinking reversals, and constructive collaborative building.',
    type: 'session',
    icon: Zap,
    tag: 'Ideation Sprint',
  },
  {
    time: '12:15 – 13:00',
    title: 'Select and Refine Solution Ideas',
    format: 'Dot Voting & Impact-Feasibility Matrix',
    description:
      'Filter down dozens of concepts into the highest-impact winner using democratic dot voting and a structured feasibility vs. impact matrix.',
    type: 'session',
    icon: Compass,
    tag: 'Evaluation & Filter',
  },
  {
    time: '13:00 – 13:30',
    title: 'Lunch Break',
    format: 'Campus Canteen & Networking',
    description: 'Midday recharge and informal strategy sync with team members and facilitators.',
    type: 'break',
    icon: Utensils,
    tag: 'Lunch Break',
  },
  {
    time: '13:30 – 14:30',
    title: 'Visualise the Solution (Prototyping)',
    format: 'Hand-Drawn Chart-Paper Concept & Storyboard',
    description:
      'Hands-on physical crafting sprint: utilize provided chart papers, markers, and sketch pens to illustrate how your solution functions in user hands.',
    type: 'session',
    icon: Palette,
    tag: 'Paper Prototyping',
  },
  {
    time: '14:30 – 15:15',
    title: 'Build the Pitch & Deck Structure',
    format: 'Pitch Structure & Slide Planning Framework',
    description:
      'Craft an elevator pitch and slide sequence: Problem, User, Solution, Unfair Advantage, and Next Steps for user validation and incubation.',
    type: 'session',
    icon: Presentation,
    tag: 'Pitch Construction',
  },
  {
    time: '15:15 – 16:00',
    title: 'Team Pitches, Panel Feedback & Valedictory',
    format: 'Live Pitching & IIC Certificate Presentation',
    description:
      'Teams present concepts to the panel. Expert critique from Mr. Muhammed Shayiz K P, concluding remarks, and participation certificate handover.',
    type: 'session',
    icon: Lightbulb,
    tag: 'Pitching & Awards',
  },
];

export default function WorkshopStructureSection() {
  return (
    <section id="workshop" className="py-24 bg-[#05030a]/40 backdrop-blur-[2px] relative overflow-hidden z-10 border-t border-purple-950/40">
      
      {/* Glow aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-orange-900/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-amber-400 bg-amber-950/70 border border-amber-800/40 px-4 py-1.5 rounded-full shadow-sm">
            Proposed Agenda • 11th November 2026
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-4">
            Hands-on Activity-Driven Schedule
          </h2>
          <p className="mt-3.5 text-slate-300 text-base sm:text-lg">
            A comprehensive, interactive schedule engineered to take 1st-year students from an abstract problem to a physical prototype and pitch-ready innovation.
          </p>
        </motion.div>

        {/* Timeline / Agenda Cards Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6">
          {AGENDA.map((item, idx) => {
            const Icon = item.icon;
            const isBreak = item.type === 'break';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: idx * 0.05 }}
              >
                <TouchInteractiveTilt maxTilt={6} glareOpacity={0.18}>
                  <div
                    className={`rounded-3xl p-6 sm:p-7 border transition-all duration-300 shadow-xl h-full flex flex-col justify-between ${
                      isBreak
                        ? 'bg-amber-950/20 border-amber-500/30 hover:border-amber-400/50 shadow-amber-950/20'
                        : 'bg-white/[0.02] border-white/[0.08] hover:border-orange-500/40 shadow-black/40'
                    }`}
                  >
                    <div>
                      {/* Time and Tag Header */}
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-black/60 border border-white/10 text-amber-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>{item.time}</span>
                        </span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isBreak ? 'bg-amber-900/40 border-amber-600/40 text-amber-200' : 'bg-purple-950/60 border-purple-800/40 text-purple-300'
                        }`}>
                          {item.tag}
                        </span>
                      </div>

                      {/* Title & Icon */}
                      <div className="flex items-start gap-3.5 mb-2.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${
                          isBreak ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300' : 'bg-orange-500/20 border border-orange-500/40 text-orange-300'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {item.title}
                          </h3>
                          <p className="text-xs font-semibold text-amber-400 mt-0.5">
                            Format / Output: {item.format}
                          </p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mt-2.5">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-zinc-400">
                      <span>Venue: College Seminar Hall</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Interactive Team Session</span>
                      </span>
                    </div>

                  </div>
                </TouchInteractiveTilt>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
