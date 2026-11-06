import React from 'react';
import Link from 'next/link';
import { ExternalLink, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white/70 backdrop-blur-xl border-t border-white/60 text-slate-700 text-xs shadow-xs">
      <div className="max-w-7xl mx-auto px-6 pt-10 pb-6">
        
        {/* Partner Logos Strip */}
        <div className="mb-8 pb-6 border-b border-slate-200/80">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 text-center sm:text-left">
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-sky-800 font-bold">
                Institutional Affiliations & Approvals
              </p>
              <h4 className="text-base font-bold text-slate-950 mt-0.5">
                KMCT College of Engineering • Institution’s Innovation Council (IIC)
              </h4>
            </div>
            <span className="text-[11px] text-slate-600 font-mono">
              IIC Quarter 1 Activities (Inspiration, Motivation & Ideation)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
            {/* KMCT College */}
            <a
              href="https://www.kmct.org"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-xl bg-white/90 border border-slate-200 hover:border-sky-300 transition-all flex flex-col items-center justify-center h-20 shadow-2xs group"
              title="KMCT College of Engineering for Emerging Technologies and Management, Kasaragod"
            >
              <img src="/logos/kmct-college.png" alt="KMCT College" className="h-7 w-auto max-w-[155px] object-contain group-hover:scale-105 transition-transform" />
              <span className="text-[9px] text-slate-600 mt-1 font-medium">Host Institution</span>
            </a>

            {/* IIC Logo */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center h-20 shadow-2xs">
              <img src="/logos/iic-logo.svg" alt="IIC" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-orange-700 mt-1 font-semibold">IIC (MoE Initiative)</span>
            </div>

            {/* Kerala Startup Mission */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center h-20 shadow-2xs">
              <img src="/logos/ksum-logo.svg" alt="KSUM" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-sky-700 mt-1 font-semibold">Kerala Startup Mission</span>
            </div>

            {/* IEDC */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center h-20 shadow-2xs">
              <img src="/logos/iedc-logo.svg" alt="IEDC" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-pink-700 mt-1 font-semibold">IEDC Centre</span>
            </div>

            {/* AICTE */}
            <div className="p-3 rounded-xl bg-white/90 border border-slate-200 flex flex-col items-center justify-center h-20 shadow-2xs col-span-2 sm:col-span-4 lg:col-span-1">
              <img src="/logos/aicte-logo.svg" alt="AICTE" className="h-8 w-auto object-contain" />
              <span className="text-[9px] text-amber-700 mt-1 font-semibold">AICTE Approved</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Mission with Round Blue Emblem */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src="/logos/kmct-icon.png"
                alt="KMCT Emblem"
                className="w-7 h-7 object-contain shrink-0"
              />
              <span className="font-extrabold text-sm tracking-wider text-slate-950 uppercase block">
                FROM PROBLEM TO POSSIBILITY
              </span>
            </div>
            <p className="text-slate-700 leading-relaxed text-xs font-medium">
              A hands-on, activity-driven offline workshop on Problem Solving, Ideation &amp; Pitching conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod under Institution&apos;s Innovation Council (IIC).
            </p>
            <p className="text-[11px] text-sky-800 font-bold">
              Resource Person: Mr. Muhammed Shayiz K P
            </p>
          </div>

          {/* Col 2: Institutional Affiliation & Venue */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Host Campus & Venue
            </h4>
            <p className="text-slate-800 font-medium">
              KMCT College of Engineering for Emerging Technologies and Management
            </p>
            <p className="text-slate-600 flex items-start gap-1 mt-1 text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
              <span>Near KCA Stadium, Mundodu, Ullody P.O, Manya Kasaragod, Kerala - 671321</span>
            </p>
            <p className="text-[11px] text-purple-700 pt-1 font-medium">
              Venue: College Seminar Hall (Offline)
            </p>
          </div>

          {/* Col 3: Coordinator Details */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Event Coordination
            </h4>
            <div>
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Proposed By</p>
              <p className="text-slate-900 font-medium text-xs mt-0.5">Mr. Abdul Mujeeb MS</p>
              <p className="text-[11px] text-purple-700 font-medium mt-0.5">IIC Coordinator, KMCTCEEM</p>
            </div>

            <div className="pt-2 border-t border-slate-300">
              <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500">Approval</p>
              <p className="text-slate-700 text-xs mt-0.5">Approved by the Principal on 4th November 2026</p>
            </div>

            <div className="pt-1">
              <p className="text-[11px] text-slate-600">Date: 11th November 2026 (Wednesday)</p>
              <p className="text-[10px] text-slate-500">Timing: 09:30 AM – 04:00 PM</p>
            </div>
          </div>

          {/* Col 4: Links & Resources */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
              Quick Links & Policies
            </h4>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://www.kmct.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-purple-700 hover:text-purple-900 font-semibold transition-colors"
                >
                  <span>KMCT Official Website</span>
                  <ExternalLink className="w-3 h-3 text-purple-600" />
                </a>
              </li>
              <li>
                <a
                  href="/event-poster.jpg"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-slate-600 hover:text-purple-700 transition-colors"
                >
                  <span>View Official Event Poster</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-600 hover:text-purple-700 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-600 hover:text-purple-700 transition-colors">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-4 border-t border-slate-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-[11px] text-slate-500">
            © {currentYear} KMCT College of Engineering for Emerging Technologies and Management. Institution’s Innovation Council (IIC).
          </p>
          <p className="text-[11px] text-slate-500 max-w-md">
            Workshop on Problem Solving and Ideation (From Problem to Possibility). Registration fee: ₹100 per participant. 70 seats capacity.
          </p>
        </div>

      </div>
    </footer>
  );
}
