'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Target,
  Building2,
  Sparkles,
  ArrowUpRight,
  Lightbulb,
  Palette,
  Mic,
  Calendar,
  MapPin,
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
    <section id="about" className="py-24 bg-[#e8ecf2] border-t border-slate-300 relative overflow-hidden z-10">
      
      {/* Subtle backdrop glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-widest mb-4 shadow-xs">
            <Building2 className="w-3.5 h-3.5 text-purple-600" />
            <span>Proposal &amp; Mission Overview</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            From Problem to Possibility <br />
            <span className="text-gradient-vibrant bg-gradient-to-r from-purple-700 via-indigo-600 to-amber-600 bg-clip-text text-transparent">
              KMCT College of Engineering, Kasaragod.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg text-slate-600 leading-relaxed">
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
                <TouchInteractiveTilt maxTilt={8} glareOpacity={0.15} className="h-full">
                  <div className="bg-white rounded-3xl p-7 border border-slate-300 hover:border-purple-400 hover:shadow-lg transition-all duration-300 shadow-sm h-full flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-50 to-amber-50 border border-purple-200 flex items-center justify-center text-purple-700 mb-5 p-2.5 shadow-xs">
                        <Icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 leading-snug">
                        {obj.title}
                      </h3>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
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
          <TouchInteractiveTilt maxTilt={5} glareOpacity={0.15}>
            <div className="rounded-3xl bg-white border border-slate-300 p-8 sm:p-10 relative overflow-hidden backdrop-blur-2xl shadow-xl">
              <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  {/* Extracted Photo of Mr. Muhammed Shayiz K P on Studio Background */}
                  <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-2xl bg-slate-100 border-2 border-purple-200 overflow-hidden shrink-0 shadow-lg relative group">
                    <img
                      src="/trainer-shayiz.jpg"
                      alt="Mr. Muhammed Shayiz K P - Resource Person"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-900/85 backdrop-blur-xs py-1 text-center text-[10px] font-mono text-white font-bold uppercase tracking-wider">
                      Resource Person
                    </div>
                  </div>

                  <div className="max-w-xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 border border-purple-200 text-xs font-bold text-purple-700 uppercase tracking-wider mb-2 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>Keynote Mentor &amp; Facilitator</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                      Mr. Muhammed Shayiz K P
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-purple-700">
                      Senior Software Engineer, Doodleblue Innovations, Chennai
                    </p>
                    <p className="text-xs text-slate-500">
                      Co-founder, Shine Technologies, Kannur
                    </p>
                    <p className="mt-3 text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                      Bringing high-impact engineering experience and startup leadership to mentor KMCT students through end-to-end design thinking, empathy discovery, problem-solving, and pitch execution.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
                  <div className="p-4 rounded-xl bg-slate-100/90 border border-slate-300 text-xs">
                    <p className="text-[10px] font-mono uppercase text-slate-500">Date &amp; Venue</p>
                    <p className="font-bold text-slate-900 mt-0.5">Wednesday, 11th Nov 2026</p>
                    <p className="text-purple-700 font-semibold text-[11px]">09:30 AM – 04:00 PM</p>
                    <p className="text-slate-500 text-[11px]">College Seminar Hall</p>
                  </div>

                  <a
                    href="#workshop"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-orange-500/20 text-center flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>View Workshop Schedule</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </TouchInteractiveTilt>
        </motion.div>

      </div>
    </section>
  );
}
