'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, MapPin, IndianRupee, Users, ShieldCheck, ArrowRight } from 'lucide-react';
import { EventConfig } from '@/types';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface EventDetailsSectionProps {
  event: EventConfig;
}

export default function EventDetailsSection({ event }: EventDetailsSectionProps) {
  const fee = event.registrationFee || 100;
  const isClosed = Boolean(event.registrationsClosed);

  return (
    <section className="py-24 bg-[#dfe5ec]/50 border-t border-slate-300 relative z-10 overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/3 w-[650px] h-[350px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-xs uppercase font-extrabold tracking-widest text-purple-700 bg-purple-50 border border-purple-200 px-4 py-1.5 rounded-full shadow-xs">
            Key Logistics &amp; Parameters
          </span>
          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mt-4">
            Workshop Information
          </h2>
          <p className="mt-3.5 text-slate-600 text-base">
            Approved parameters, timing schedule, and institutional coordinator contacts.
          </p>
        </motion.div>

        {/* 3-Column Logistics Grid with 3D Touch Tilt */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
          
          {/* Card 1: Schedule & Venue */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.05 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.12} className="h-full">
              <div className="rounded-2xl p-7 sm:p-8 border border-slate-300 hover:border-purple-400 bg-white space-y-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shadow-xs">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span>Date &amp; Schedule</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Event Date</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-base font-bold text-slate-900">
                          Wednesday, 11th November 2026
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold">
                          Confirmed Date
                        </span>
                      </div>
                      <p className="text-xs text-purple-700 font-semibold mt-0.5">09:30 AM – 04:00 PM (Full Day)</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Target Audience</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">1st-Year Engineering &amp; Management</p>
                      <p className="text-xs text-slate-500 mt-0.5">Multidisciplinary small team format</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Venue &amp; Mode</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">Offline at College Seminar Hall</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        KMCT College of Engineering for Emerging Technologies and Management
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Kasaragod, Kerala - 671321</span>
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

          {/* Card 2: Pricing & Cohort Size */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.12} className="h-full">
              <div className="rounded-2xl p-7 sm:p-8 border border-slate-300 hover:border-purple-400 bg-white space-y-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shadow-xs">
                      <IndianRupee className="w-5 h-5" />
                    </div>
                    <span>Investment &amp; Cohort Cap</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Registration Pass</p>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-3xl font-black text-slate-900">₹{fee}</span>
                        <span className="text-xs text-slate-500">per participant</span>
                      </div>
                      <div className="mt-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900">
                        <span className="font-bold text-amber-800">All-Inclusive:</span> Workshop entry, stationery (chart papers, markers, worksheets), morning tea with fresh canteen samosas, and official IIC certificate.
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Strict Cohort Cap</p>
                      <p className="text-base font-bold text-slate-900 mt-1">
                        70 Seats Only
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Strict limit to ensure effective mentoring &amp; team poster reviews.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Limited to 70 attendees</span>
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

          {/* Card 3: Contacts & Verification */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.5, delay: 0.25 }}
          >
            <TouchInteractiveTilt maxTilt={7} glareOpacity={0.12} className="h-full">
              <div className="rounded-2xl p-7 sm:p-8 border border-slate-300 hover:border-purple-400 bg-white space-y-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2.5 mb-5">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span>Coordinator &amp; Approvals</span>
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Proposed By</p>
                      <p className="text-base font-bold text-slate-900 mt-1">Mr. Abdul Mujeeb MS</p>
                      <p className="text-xs text-purple-700 font-medium mt-0.5">IIC Coordinator, KMCT College of Engineering</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Institutional Approval</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">Approved by the Principal</p>
                      <p className="text-xs text-emerald-700 font-medium mt-0.5">Proposal Date: 4th November 2026</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Resource Person</p>
                      <p className="text-sm font-semibold text-slate-900 mt-0.5">Mr. Muhammed Shayiz K P</p>
                      <p className="text-[11px] text-slate-600">Sr. Software Engineer, Doodleblue Innovations</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  {isClosed ? (
                    <div className="w-full py-3 rounded-2xl bg-slate-200 border border-slate-300 text-center text-slate-600 text-xs font-bold uppercase tracking-wider shadow-xs flex items-center justify-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span>Registrations Closed</span>
                    </div>
                  ) : (
                    <Link
                      href="/login?redirect=/register"
                      className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-600 to-purple-600 hover:opacity-95 text-center text-white text-xs font-bold uppercase tracking-wider shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <span>Reserve Seat Now (₹{fee})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              </div>
            </TouchInteractiveTilt>
          </motion.div>

        </div>

      </div>
    </section>
  );
}
