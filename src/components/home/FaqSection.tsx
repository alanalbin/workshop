'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FaqItem } from '@/types';

interface FaqSectionProps {
  faq: FaqItem[];
}

export default function FaqSection({ faq }: FaqSectionProps) {
  const list = faq || [];
  const [openId, setOpenId] = useState<string | null>(list[0]?.id || null);

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section id="faq" className="pt-20 pb-16 bg-white/40 backdrop-blur-md border-t border-white/60 relative z-10 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-sky-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-sky-800 bg-sky-50 border border-sky-200 px-4 py-1.5 rounded-full shadow-2xs backdrop-blur-xs">
            Answers &amp; Clarity
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-950 tracking-tight mt-4">
            Frequently Asked Questions
          </h2>
          <p className="mt-3.5 text-slate-700 font-medium text-base max-w-xl mx-auto">
            Everything you need to know about the FROM PROBLEM TO POSSIBILITY workshop passes, agenda, deliverables, and certificates at KMCT Kasaragod.
          </p>
        </motion.div>

        {/* Accordions */}
        <div className="space-y-4">
          {list.map((item, idx) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.4, delay: idx * 0.06 }}
                className="bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 hover:border-sky-300 overflow-hidden transition-all duration-300 shadow-md"
              >
                <button
                  onClick={() => toggle(item.id)}
                  className="w-full px-6 sm:px-7 py-5 flex items-center justify-between text-left gap-4 hover:bg-white/50 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-950 flex items-center gap-3.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center shrink-0 text-sky-700 shadow-xs">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <span>{item.question}</span>
                  </span>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-sky-100 text-sky-900' : 'bg-slate-100 text-slate-600'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-2 text-sm text-slate-800 font-medium leading-relaxed border-t border-slate-100 bg-slate-50/60">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
