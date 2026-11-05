'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Sparkles, Building2, Award, Rocket, Globe, Lightbulb } from 'lucide-react';
import TouchInteractiveTilt from '@/components/ui/TouchInteractiveTilt';

interface Partner {
  name: string;
  category: string;
  badge: string;
  badgeColor: string;
  logo: string;
  logoHeight: string;
  description: string;
  website?: string;
  linkText?: string;
}

const PARTNERS: Partner[] = [
  {
    name: 'KMCT College of Engineering',
    category: 'Host Campus & Venue',
    badge: 'Our College',
    badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-500/40',
    logo: '/logos/kmct-college.png',
    logoHeight: 'h-10 sm:h-12',
    description: 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod — host venue at the College Seminar Hall.',
    website: 'https://www.kmct.org',
    linkText: 'kmct.org',
  },
  {
    name: "Institution's Innovation Council (IIC)",
    category: 'Organizing Framework',
    badge: 'Ministry of Education',
    badgeColor: 'bg-orange-950/80 text-orange-300 border-orange-500/40',
    logo: '/logos/iic-logo.svg',
    logoHeight: 'h-12 sm:h-14',
    description: "Organized under IIC Quarter 1 Activities focusing on Inspiration, Motivation, and Ideation for emerging engineers.",
    website: 'https://mic.gov.in/',
    linkText: 'IIC Portal',
  },
  {
    name: 'Kerala Startup Mission (KSUM)',
    category: 'State Innovation Ecosystem',
    badge: 'Govt. of Kerala',
    badgeColor: 'bg-sky-950/80 text-sky-300 border-sky-500/40',
    logo: '/logos/ksum-logo.svg',
    logoHeight: 'h-12 sm:h-14',
    description: 'The nodal agency of Government of Kerala for entrepreneurship development and startup incubation support.',
    website: 'https://startupmission.kerala.gov.in/',
    linkText: 'startupmission.kerala.gov.in',
  },
  {
    name: 'IEDC Centre',
    category: 'Incubation & Entrepreneurship',
    badge: 'Campus Hub',
    badgeColor: 'bg-pink-950/80 text-pink-300 border-pink-500/40',
    logo: '/logos/iedc-logo.svg',
    logoHeight: 'h-12 sm:h-14',
    description: 'Innovation and Entrepreneurship Development Centre (IEDC) fostering student builders and prototype validation.',
    website: 'https://www.kmct.org',
    linkText: 'KMCT IEDC',
  },
];

export default function PartnersShowcase() {
  return (
    <section className="relative py-20 bg-[#06030e]/30 backdrop-blur-[2px] border-y border-purple-950/40 overflow-hidden z-10">
      
      {/* Subtle backdrop ambient glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-orange-900/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[500px] h-[300px] bg-purple-900/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 relative z-20">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-950/70 border border-orange-800/40 text-xs font-bold text-orange-300 uppercase tracking-widest mb-3.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-orange-400" />
            <span>Institutional Affiliations &amp; Ecosystem</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            Backed by Premier Innovation Bodies
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            The workshop <strong>FROM PROBLEM TO POSSIBILITY</strong> is organized by the <strong>Institution’s Innovation Council (IIC)</strong> at <strong>KMCT College of Engineering for Emerging Technologies and Management, Kasaragod</strong>, in synergy with <strong>Kerala Startup Mission (KSUM)</strong> and <strong>IEDC</strong>.
          </p>
        </div>

        {/* Partners Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PARTNERS.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 30, scale: 0.93 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ type: 'spring', stiffness: 220, damping: 22, delay: index * 0.08 }}
              className="h-full"
            >
              <TouchInteractiveTilt maxTilt={8} glareOpacity={0.15} className="h-full">
                <div className="glass-card rounded-2xl p-6 border border-white/[0.08] hover:border-orange-500/40 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between h-full group shadow-xl shadow-black/30">
                  
                  <div>
                    {/* Badge & Category Header */}
                    <div className="flex items-center justify-between gap-2 mb-5">
                      <span className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md border font-bold ${partner.badgeColor}`}>
                        {partner.badge}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-medium">
                        {partner.category}
                      </span>
                    </div>

                    {/* Logo Box with Frosted Glow */}
                    <div className="w-full h-24 rounded-xl bg-black/40 border border-white/[0.06] flex items-center justify-center p-4 mb-5 group-hover:border-orange-500/30 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.15)] transition-all">
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className={`${partner.logoHeight} max-w-full object-contain filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] group-hover:scale-105 transition-transform duration-300`}
                        loading="lazy"
                      />
                    </div>

                    {/* Partner Name & Description */}
                    <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
                      {partner.name}
                    </h3>
                    <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                      {partner.description}
                    </p>
                  </div>

                  {/* Website Link if applicable */}
                  {partner.website && (
                    <div className="mt-5 pt-4 border-t border-white/[0.06]">
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 group-hover:underline transition-colors"
                      >
                        <span>{partner.linkText || 'Visit Portal'}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                </div>
              </TouchInteractiveTilt>
            </motion.div>
          ))}
        </div>

        {/* Unified Tagline / Banner with Problem to Possibility Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 rounded-2xl bg-gradient-to-r from-orange-950/40 via-purple-950/30 to-amber-950/40 border border-orange-500/30 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 backdrop-blur-xl"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-black/60 border border-orange-500/40 flex items-center justify-center p-2.5 shrink-0 text-amber-400">
              <Lightbulb className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white">
                Turn Real-World Challenges into Pitch-Ready Innovations!
              </h4>
              <p className="text-xs text-slate-300 mt-0.5">
                Proposed by Mr. Abdul Mujeeb MS (IIC Coordinator) • Approved by Principal • KMCT Kasaragod
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-amber-400 font-mono hidden md:inline">#FromProblemToPossibility</span>
            <a
              href="#workshop"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-orange-950/50 flex items-center gap-1.5"
            >
              <span>Explore Agenda</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
