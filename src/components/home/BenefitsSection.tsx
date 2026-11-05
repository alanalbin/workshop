'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Award, Sparkles, Compass, CheckCircle2, Target, Palette, Mic } from 'lucide-react';
import { EventBenefit } from '@/types';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface BenefitsSectionProps {
  benefits: EventBenefit[];
}

export default function BenefitsSection({ benefits }: BenefitsSectionProps) {
  const outcomes = [
    {
      id: 'outcome-1',
      title: 'Clearly Written Problem Statement & Target User',
      description: 'A deep, empathy-driven understanding of who is affected, defining exact root pain points using structured problem-framing worksheets.',
      icon: Target,
      highlight: 'Core Deliverable 1',
    },
    {
      id: 'outcome-2',
      title: 'Alternative Solution Ideas & Reasoned Selection',
      description: 'A rich set of explored solutions generated via Crazy 8s & Worst-Idea reversal, filtered through an impact-feasibility matrix.',
      icon: Sparkles,
      highlight: 'Core Deliverable 2',
    },
    {
      id: 'outcome-3',
      title: 'Hand-Drawn Concept / Prototype Poster',
      description: 'A physical chart-paper storyboard and low-fidelity prototype visual showing how the solution works in real-world scenarios.',
      icon: Palette,
      highlight: 'Core Deliverable 3',
    },
    {
      id: 'outcome-4',
      title: 'Structured Pitch & Presentation Structure',
      description: 'A concise, compelling team pitch deck ready to present to panels, mentors, incubators, and student innovation competitions.',
      icon: Mic,
      highlight: 'Core Deliverable 4',
    },
    {
      id: 'outcome-5',
      title: 'Next-Step Plan & Ecosystem Incubation',
      description: 'A concrete roadmap for user validation, prototype refinement, and potential funding support through KSUM & college IEDC.',
      icon: Compass,
      highlight: 'Core Deliverable 5',
    },
    {
      id: 'outcome-6',
      title: 'Official IIC Certificate & Refreshments',
      description: 'Activity-endorsed certificate of participation issued under IIC Quarter 1, plus morning tea and hot canteen samosas included in the ₹100 pass.',
      icon: Award,
      highlight: 'Credentials & Takeaways',
    },
  ];

  return (
    <section id="benefits" className="py-24 bg-white/40 backdrop-blur-md border-t border-white/60 relative overflow-hidden z-10">
      
      {/* Background radial glow */}
      <div className="absolute top-1/3 right-10 w-[550px] h-[350px] bg-sky-500/10 rounded-full blur-[130px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-800 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-xs">
            Tangible Deliverables &amp; Outcomes
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-4">
            Expected Learning Outcomes
          </h2>
          <p className="mt-3.5 text-slate-700 font-medium text-base sm:text-lg leading-relaxed">
            By the end of the workshop, each student team will walk away with real, physical and pitch-ready deliverables designed to jumpstart their innovation journey.
          </p>
        </motion.div>

        {/* Deliverables Bento Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {outcomes.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 35, scale: 0.93 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ type: 'spring', stiffness: 220, damping: 22, delay: idx * 0.07 }}
              >
                <TouchInteractiveTilt maxTilt={7} glareOpacity={0.12} className="h-full">
                  <div className="bg-white/85 backdrop-blur-xl rounded-3xl p-7 sm:p-8 border border-white/80 hover:border-sky-300 flex flex-col justify-between transition-all duration-300 shadow-lg shadow-sky-950/5 hover:shadow-2xl h-full">
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center p-2.5 shadow-xs text-sky-700">
                          <Icon className="w-6 h-6" />
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[11px] font-bold text-sky-800">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          <span>{item.highlight}</span>
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-950 group-hover:text-sky-700 transition-colors mb-2">
                        {item.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-purple-700 font-semibold">
                      <span>✓ Team-based interactive completion</span>
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
