'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal,
  Cpu,
  Award,
  Activity,
  Layers,
  Lightbulb,
} from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

export default function DisplayWorkstation3D() {
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'curriculum' | 'credentials'>('terminal');

  useEffect(() => {
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 8) + 4;
      if (current >= 100) {
        current = 100;
        setIsLoaded(true);
        clearInterval(interval);
      }
      setLoadProgress(current);
    }, 90);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 sm:py-28 relative overflow-hidden bg-white/40 backdrop-blur-md border-t border-white/60">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold uppercase tracking-wider text-sky-800 mb-3 shadow-2xs backdrop-blur-xs">
            <Cpu className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
            <span>Ideation Studio Workstation</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight">
            Interactive Ideation Platform
          </h2>
          <p className="mt-3 text-slate-700 font-medium text-sm sm:text-base leading-relaxed">
            Hands-on problem discovery, Crazy 8s sprint engine, and pitch deck simulator for 1st-year engineering &amp; management students.
          </p>
        </div>

        {/* 3D Scroll Popup Container */}
        <div className="md:perspective-[1400px]">
          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          >
            <TouchInteractiveTilt maxTilt={6} glareOpacity={0.15} className="w-full">
              
              {/* Outer PC / Studio Display Rectangle Frame */}
              <div className="relative rounded-2xl sm:rounded-3xl bg-slate-200 border-2 border-slate-300 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl">
                
                {/* Top Display Bezel with Camera Notch & Indicator */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-slate-300 mb-3 text-xs text-slate-600 select-none">
                  {/* Window Control Buttons */}
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#ff5f56] inline-block shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-[#ffbd2e] inline-block shadow-xs" />
                    <span className="w-3 h-3 rounded-full bg-[#27c93f] inline-block shadow-xs" />
                    <span className="hidden sm:inline-block ml-3 font-mono text-[11px] text-slate-500">
                      p2p-engine://kmct.local:3000
                    </span>
                  </div>

                  {/* Center Web Camera Notch */}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-300 border border-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block" />
                    <span className="w-1 h-1 rounded-full bg-emerald-500 animate-ping inline-block" />
                  </div>

                  {/* System Status */}
                  <div className="flex items-center gap-2 font-mono text-[11px]">
                    <span className="text-slate-500 hidden md:inline-block">Status:</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {isLoaded ? 'ONLINE' : `BOOTING ${loadProgress}%`}
                    </span>
                  </div>
                </div>

                {/* PC Screen Inner Canvas */}
                <div className="rounded-xl sm:rounded-2xl bg-[#090d16] border border-slate-700 overflow-hidden min-h-[420px] flex flex-col relative shadow-inner">
                  
                  {/* Top Animated Progress Loading Bar */}
                  <div className="h-1 bg-white/[0.04] w-full overflow-hidden relative">
                    <motion.div
                      className="h-full bg-gradient-to-r from-amber-500 via-orange-400 to-emerald-400"
                      initial={{ width: '0%' }}
                      animate={{ width: `${loadProgress}%` }}
                      transition={{ ease: 'easeOut', duration: 0.1 }}
                    />
                  </div>

                  {/* Display Sub-Navigation Tabs */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] px-3 sm:px-4 py-2 sm:py-2.5 bg-black/50 text-xs gap-2 overflow-x-auto scrollbar-none">
                    <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('terminal')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'terminal'
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>System Terminal</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('curriculum')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'curriculum'
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Layers className="w-3.5 h-3.5 text-orange-400" />
                        <span>Agenda Engine</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('credentials')}
                        className={`px-3 py-1.5 rounded-md font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 whitespace-nowrap ${
                          activeTab === 'credentials'
                            ? 'bg-white/15 text-white font-semibold'
                            : 'text-zinc-400 hover:text-zinc-200'
                        }`}
                      >
                        <Award className="w-3.5 h-3.5 text-emerald-400" />
                        <span>IIC Activity Cert</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex items-center gap-3 text-[11px] font-mono text-zinc-400">
                      <span>KMCT Kasaragod • Institution&apos;s Innovation Council</span>
                    </div>
                  </div>

                  {/* TAB 1: TERMINAL BOOT SEQUENCE */}
                  {activeTab === 'terminal' && (
                    <div className="p-5 sm:p-7 flex-1 font-mono text-xs text-zinc-300 space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2 text-amber-400 pb-2 border-b border-white/[0.08]">
                          <Lightbulb className="w-4 h-4" />
                          <span className="font-bold">FROM PROBLEM TO POSSIBILITY WORKSTATION [v2.0]</span>
                        </div>

                        <p className="text-zinc-400">
                          Institution’s Innovation Council (IIC) &amp; KMCT College of Engineering. All rights reserved.
                        </p>

                        <div className="pt-2 space-y-1.5">
                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:30:00</span>
                            <span>[OK] Core architecture mounted: College Seminar Hall, KMCT Kasaragod</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:30:02</span>
                            <span>[OK] Keynote Resource Person confirmed: Mr. Muhammed Shayiz K P</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:30:04</span>
                            <span>[OK] Framework: IIC Quarter 1 Activities (Inspiration, Motivation, Ideation)</span>
                          </p>

                          <p className="text-emerald-400 flex items-center gap-2">
                            <span className="text-zinc-500">09:30:06</span>
                            <span>[OK] Prototyping materials allocated: Chart papers, sketch pens, worksheets</span>
                          </p>

                          <p className="text-amber-300 flex items-center gap-2">
                            <span className="text-zinc-500">09:30:08</span>
                            <span>[LIVE] Cohort Registration Desk active: 70 Seats Cap | Fee: ₹100 per participant</span>
                          </p>
                        </div>
                      </div>

                      {/* Interactive Prompt / Status Strip */}
                      <div className="pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <span className="animate-pulse">●</span>
                          <span>{isLoaded ? 'System compilation finished. 70/70 Seats ready.' : `Loading assets... ${loadProgress}%`}</span>
                        </div>

                        <div className="text-zinc-300 font-mono">
                          Registration Fee: <strong className="text-white">₹100/-</strong> per participant
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: CURRICULUM MODULES PREVIEW */}
                  {activeTab === 'curriculum' && (
                    <div className="p-5 sm:p-7 flex-1 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1]">
                          <span className="font-mono text-[10px] text-amber-400 uppercase tracking-wider block mb-1">
                            Phase 01
                          </span>
                          <h4 className="text-sm font-semibold text-white">Problem Discovery &amp; Empathy</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Discover root causes using symptom sorting games and empathy framing.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1]">
                          <span className="font-mono text-[10px] text-orange-400 uppercase tracking-wider block mb-1">
                            Phase 02
                          </span>
                          <h4 className="text-sm font-semibold text-white">Ideation &amp; Feasibility Matrix</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Crazy 8s, Yes-And, Worst-Idea reversals, and democratic dot voting.
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white/[0.04] border border-white/[0.1]">
                          <span className="font-mono text-[10px] text-emerald-400 uppercase tracking-wider block mb-1">
                            Phase 03
                          </span>
                          <h4 className="text-sm font-semibold text-white">Hand-Drawn Poster &amp; Pitch</h4>
                          <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                            Physical chart-paper concept posters and structured team presentation.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: CREDENTIAL VERIFICATION PREVIEW */}
                  {activeTab === 'credentials' && (
                    <div className="p-5 sm:p-7 flex-1 flex flex-col justify-center items-center text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-emerald-400 shadow-inner">
                        <Award className="w-7 h-7" />
                      </div>
                      <h4 className="text-base font-bold text-white">Official Certificate under IIC Framework</h4>
                      <p className="text-xs text-zinc-300 max-w-md leading-relaxed">
                        Every 1st-year student participant who attends the workshop and completes team deliverables earns an official IIC activity certificate of participation.
                      </p>
                    </div>
                  )}

                </div>

                {/* Metallic Desktop Stand Mockup Base */}
                <div className="hidden sm:block w-36 h-4 mx-auto bg-slate-300 rounded-b-xl border-x border-b border-slate-400 mt-1 shadow-xs" />
                <div className="hidden sm:block w-48 h-1.5 mx-auto bg-slate-400 rounded-full shadow-xs" />

              </div>

            </TouchInteractiveTilt>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
