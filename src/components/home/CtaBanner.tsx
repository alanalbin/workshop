'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, ArrowUpRight, Lightbulb } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface CtaBannerProps {
  fee: number;
  registrationsClosed?: boolean;
}

export default function CtaBanner({ fee, registrationsClosed }: CtaBannerProps) {
  return (
    <section className="pt-6 pb-14 bg-white/40 backdrop-blur-md relative overflow-hidden border-t border-white/60 z-10">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 sm:px-10 relative z-20">
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
        >
          <TouchInteractiveTilt maxTilt={5} glareOpacity={0.12}>
            <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-white/80 p-9 sm:p-14 text-center shadow-2xl shadow-sky-950/10 relative overflow-hidden">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 border border-sky-200 text-xs font-bold text-sky-800 mb-6 shadow-2xs relative z-10 backdrop-blur-xs">
                <Lightbulb className="w-4 h-4 text-sky-600" />
                <span>
                  {registrationsClosed
                    ? 'Offline Workshop • College Seminar Hall • Cohort Finalized'
                    : 'Offline Workshop • College Seminar Hall • 70 Seats Cap'}
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight leading-tight max-w-2xl mx-auto">
                {registrationsClosed
                  ? 'Registrations Are Now Closed'
                  : 'Ready to Turn Problems into Possibilities?'}
              </h2>

              <p className="mt-4 text-slate-700 font-medium max-w-xl mx-auto text-base sm:text-lg leading-relaxed">
                {registrationsClosed
                  ? 'Registrations for the workshop on Problem Solving & Ideation at KMCT College have concluded. Confirmed participants can check their digital pass.'
                  : 'Join 1st-year peers for a day of problem discovery, Crazy 8s ideation, hand-drawn concept posters, and pitch delivery with Mr. Muhammed Shayiz K P.'}
              </p>

              <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                {registrationsClosed ? (
                  <Link
                    href="/success"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-base shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Access / Lookup Your Pass</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link
                    href="/login?redirect=/register"
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-amber-500 hover:opacity-95 text-white font-extrabold text-base shadow-lg shadow-sky-600/25 transition-all flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span>Register with Google (₹{fee})</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                <a
                  href="/event-poster.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-white/90 hover:bg-white text-slate-800 hover:text-slate-950 border border-slate-200/90 text-sm font-bold transition-all shadow-2xs flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span>View Official Event Poster</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-600 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  {registrationsClosed
                    ? 'Confirmed attendees only • Verification at Seminar Hall'
                    : '₹100 Registration Fee • 70 seats strict capacity • Refreshments included'}
                </span>
              </div>

            </div>
          </TouchInteractiveTilt>
        </motion.div>

      </div>
    </section>
  );
}
