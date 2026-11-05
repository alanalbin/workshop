import React from 'react';
import Link from 'next/link';
import { Sparkles, Mail, Phone, ExternalLink, Lightbulb, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030107] border-t border-purple-950/40 text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        
        {/* Partner Logos Strip */}
        <div className="mb-8 pb-6 border-b border-purple-950/40">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Institutional Affiliations & Approvals
              </p>
              <h4 className="text-base font-bold text-white mt-0.5">
                KMCT College of Engineering • Institution’s Innovation Council (IIC)
              </h4>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              IIC Quarter 1 Activities (Inspiration, Motivation & Ideation)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
            {/* KMCT College */}
            <a
              href="https://www.kmct.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-amber-500/40 hover:bg-white/[0.04] transition-all flex flex-col items-center justify-center h-20 group"
              title="KMCT College of Engineering for Emerging Technologies and Management, Kasaragod"
            >
              <img src="/logos/kmct-college.png" alt="KMCT College" className="h-6 w-auto max-w-[130px] object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-zinc-400 mt-1.5 font-medium">Host Institution</span>
            </a>

            {/* IIC Logo */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center h-20">
              <img src="/logos/iic-logo.svg" alt="IIC" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-orange-400 mt-1 font-medium">IIC (MoE Initiative)</span>
            </div>

            {/* Kerala Startup Mission */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center h-20">
              <img src="/logos/ksum-logo.svg" alt="KSUM" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-sky-400 mt-1 font-medium">Kerala Startup Mission</span>
            </div>

            {/* IEDC */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center h-20">
              <img src="/logos/iedc-logo.svg" alt="IEDC" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-pink-400 mt-1 font-medium">IEDC Centre</span>
            </div>

            {/* AICTE */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center h-20 col-span-2 sm:col-span-4 lg:col-span-1">
              <img src="/logos/aicte-logo.svg" alt="AICTE" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-amber-400 mt-1 font-medium">AICTE Approved</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-amber-400">
                <Lightbulb className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-sm tracking-wider text-white uppercase">
                FROM PROBLEM TO POSSIBILITY
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              A hands-on, activity-driven offline workshop on Problem Solving, Ideation &amp; Pitching conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod under Institution&apos;s Innovation Council (IIC).
            </p>
            <p className="text-[11px] text-amber-400 font-medium">
              Resource Person: Mr. Muhammed Shayiz K P
            </p>
          </div>

          {/* Col 2: Institutional Affiliation & Venue */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Host Campus & Venue
            </h4>
            <div className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] mb-2">
              <img src="/logos/kmct-college.png" alt="KMCT" className="h-5 w-auto object-contain" />
            </div>
            <p className="text-slate-300 font-medium">
              KMCT College of Engineering for Emerging Technologies and Management
            </p>
            <p className="text-slate-400 flex items-start gap-1 mt-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
              <span>Near KCA Stadium, Mundodu, Ullody P.O, Manya Kasaragod, Kerala - 671321</span>
            </p>
            <p className="text-[11px] text-purple-300 pt-1">
              Venue: College Seminar Hall (Offline)
            </p>
          </div>

          {/* Col 3: Coordinator Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Event Coordination
            </h4>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Proposed By</p>
              <p className="text-white font-medium text-xs mt-0.5">Mr. Abdul Mujeeb MS</p>
              <p className="text-[11px] text-amber-400 mt-0.5">IIC Coordinator, KMCTCEEM</p>
            </div>

            <div className="pt-2 border-t border-white/[0.08]">
              <p className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Approval</p>
              <p className="text-zinc-300 text-xs mt-0.5">Approved by the Principal on 4th November 2026</p>
            </div>

            <div className="pt-1">
              <p className="text-[11px] text-zinc-400">Date: 11th November 2026 (Wednesday)</p>
              <p className="text-[10px] text-zinc-500">Timing: 09:30 AM – 04:00 PM</p>
            </div>
          </div>

          {/* Col 4: Links & Resources */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Quick Links & Policies
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.kmct.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                >
                  <span>KMCT Official Website</span>
                  <ExternalLink className="w-3 h-3 text-amber-500" />
                </a>
              </li>
              <li>
                <a
                  href="/event-poster.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-300 hover:text-purple-200 transition-colors"
                >
                  <span>View Official Event Poster</span>
                  <ExternalLink className="w-3 h-3 text-purple-400" />
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-purple-400 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-purple-950/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-slate-400">
            © {currentYear} KMCT College of Engineering for Emerging Technologies and Management. Institution’s Innovation Council (IIC).
          </p>
          <p className="text-[11px] text-slate-400 max-w-md">
            Workshop on Problem Solving and Ideation (From Problem to Possibility). Registration fee: ₹100 per participant. 70 seats capacity.
          </p>
        </div>

      </div>
    </footer>
  );
}
