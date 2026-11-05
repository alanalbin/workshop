import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 hover:text-purple-900 uppercase tracking-wider mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workshop Home</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-xl space-y-8">
          <div>
            <span className="text-xs uppercase font-bold tracking-widest text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1 rounded-full shadow-xs">
              Participation Guidelines
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">
              Terms &amp; Conditions
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Effective Date: 2026-11-04 • KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Event Participation</h2>
              <p>
                <strong>From Problem to Possibility</strong> is an offline, activity-driven workshop on Problem Solving, Ideation, and Pitching held at the College Seminar Hall at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod. By registering, you agree to attend the full-day session (09:30 AM – 04:00 PM) on Wednesday, 11th November 2026 to qualify for participation certificate issuance.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Certificates and Materials</h2>
              <p>
                Participation certificates are issued under the <strong>Institution’s Innovation Council (IIC) Quarter 1 Activities</strong> framework to students who attend the workshop and complete team activities. Workshop materials (chart papers, markers, pencils, and empathy worksheets) and refreshments (morning tea &amp; canteen samosas) will be distributed at the Seminar Hall reception desk.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. Pricing and Seats Limit</h2>
              <p>
                The workshop registration fee is <strong>₹100/- per participant</strong>. The cohort is strictly capped at <strong>70 seats</strong> to ensure close mentoring and hands-on guidance from keynote resource person Mr. Muhammed Shayiz K P.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Rescheduling &amp; Approvals</h2>
              <p>
                The workshop was proposed by Mr. Abdul Mujeeb MS (IIC Coordinator) and approved by the Principal on 4th November 2026. If the workshop schedule is adjusted due to institutional exigencies, registration passes remain fully valid for the rescheduled session.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Contact &amp; Grievance</h2>
              <p>
                For any registration questions, kindly reach out to IIC Coordinator Mr. Abdul Mujeeb MS at abdulmujeeb@kmct.edu.in or call 8848563266.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
