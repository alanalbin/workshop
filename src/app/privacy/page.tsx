import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-transparent py-28 relative">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-purple-700 hover:text-purple-800 uppercase tracking-wider mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Workshop Home</span>
        </Link>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-300 shadow-xl space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs uppercase font-bold tracking-widest text-purple-700 bg-purple-50 border border-purple-200 px-3.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Data Protection &amp; Privacy
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-4">
              Privacy Policy
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Effective Date: 2026-11-04 • Workshop on Problem Solving &amp; Ideation (From Problem to Possibility)
            </p>
          </div>

          <div className="space-y-6 text-sm text-slate-600 leading-relaxed">
            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">1. Scope and Purpose</h2>
              <p>
                This privacy policy applies to personal information gathered from students and participants registering for the <strong>Workshop on Problem Solving and Ideation (From Problem to Possibility)</strong> conducted at KMCT College of Engineering for Emerging Technologies and Management, Kasaragod under the <strong>Institution’s Innovation Council (IIC) Quarter 1 Activities</strong>.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">2. Information We Collect</h2>
              <p>When you register for the event, we collect:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Your full name (as required on official IIC activity certificates)</li>
                <li>Email address and mobile phone number for event communication and digital pass delivery</li>
                <li>College/Institution name, department/course, and academic year of study</li>
                <li>Transaction reference numbers (e.g., UTR / Razorpay payment IDs) to verify workshop registration fee payments</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">3. How Information Is Used</h2>
              <p>The collected information is used strictly for:</p>
              <ul className="list-disc pl-5 space-y-1 text-slate-600">
                <li>Issuing official digital and physical entry passes for the 70-seat workshop cohort</li>
                <li>Facilitating attendance tracking, team formation, and workshop material distribution</li>
                <li>Issuing official Institution&apos;s Innovation Council (IIC) participation certificates</li>
                <li>Connecting top student concepts with college IEDC and Kerala Startup Mission (KSUM) incubation tracks</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">4. Payment and Financial Security</h2>
              <p>
                We do not store UPI PINs, card numbers, or banking credentials on our servers. Online payments are processed through Razorpay or direct bank UPI rails using cryptographic signature verification.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-base font-bold text-slate-900">5. Coordinator Contact</h2>
              <p>
                For questions regarding your data or to request corrections, contact Mr. Abdul Mujeeb MS (IIC Coordinator, KMCT College of Engineering) at <a href="mailto:abdulmujeeb@kmct.edu.in" className="text-purple-600 font-semibold hover:underline">abdulmujeeb@kmct.edu.in</a>.
              </p>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}
