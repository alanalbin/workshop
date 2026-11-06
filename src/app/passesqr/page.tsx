'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import QRCode from 'qrcode';
import {
  QrCode,
  Search,
  Printer,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Building,
  User,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  PlusCircle,
  FileText,
  BadgeCheck,
  ChevronRight,
  Filter,
  Eye,
  X,
  Layers,
  Award,
} from 'lucide-react';

interface CandidatePass {
  id: string;
  registrationNumber: string;
  fullName: string;
  email: string;
  phone: string;
  institution: string;
  course: string;
  yearOfStudy: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string;
  amountINR: number;
  timestamp?: string;
  qrDataUrl?: string;
}

function PassesQRContent() {
  const [candidates, setCandidates] = useState<CandidatePass[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<CandidatePass | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'custom'>('all');
  const [batchPrinting, setBatchPrinting] = useState(false);

  // Custom pass creator form state
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [customCourse, setCustomCourse] = useState('B.Tech Computer Science');
  const [customYear, setCustomYear] = useState('1st Year');
  const [customInstitution, setCustomInstitution] = useState(
    'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod'
  );
  const [customTicketId, setCustomTicketId] = useState('');

  const singlePassRef = useRef<HTMLDivElement>(null);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/passesqr');
      if (res.ok) {
        const data = await res.json();
        const list: CandidatePass[] = data.candidates || [];

        // Generate QR codes for all candidates
        const enriched = await Promise.all(
          list.map(async (c) => {
            const ticketId = c.registrationNumber || `P2P-KMCT-${c.id.slice(-8).toUpperCase()}`;
            const qrPayload = JSON.stringify({
              event: 'From Problem to Possibility 2026',
              host: 'KMCTCEEM Kasaragod',
              ticket: ticketId,
              name: c.fullName,
              dept: c.course,
              year: c.yearOfStudy,
              phone: c.phone,
              email: c.email,
              status: 'VERIFIED_ENTRY',
              verificationUrl: `https://from-problem-to-possibility.vercel.app/success?registrationId=${encodeURIComponent(ticketId)}`,
            });

            try {
              const qrUrl = await QRCode.toDataURL(qrPayload, {
                width: 320,
                margin: 1,
                color: {
                  dark: '#030712',
                  light: '#ffffff',
                },
                errorCorrectionLevel: 'H',
              });
              return { ...c, registrationNumber: ticketId, qrDataUrl: qrUrl };
            } catch {
              return { ...c, registrationNumber: ticketId };
            }
          })
        );

        setCandidates(enriched);
        if (enriched.length > 0 && !selectedCandidate) {
          setSelectedCandidate(enriched[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const handleCreateCustomPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const ticketId =
      customTicketId.trim() ||
      `P2P-KMCT-CUST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(-4).toUpperCase()}`;

    const qrPayload = JSON.stringify({
      event: 'From Problem to Possibility 2026',
      host: 'KMCTCEEM Kasaragod',
      ticket: ticketId,
      name: customName.trim(),
      dept: customCourse,
      year: customYear,
      phone: customPhone.trim(),
      email: customEmail.trim(),
      status: 'VERIFIED_ENTRY',
      verificationUrl: `https://from-problem-to-possibility.vercel.app/success?registrationId=${encodeURIComponent(ticketId)}`,
    });

    let qrUrl = '';
    try {
      qrUrl = await QRCode.toDataURL(qrPayload, {
        width: 320,
        margin: 1,
        color: {
          dark: '#030712',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'H',
      });
    } catch {}

    const newPass: CandidatePass = {
      id: `custom_${Date.now()}`,
      registrationNumber: ticketId,
      fullName: customName.trim(),
      email: customEmail.trim(),
      phone: customPhone.trim(),
      institution: customInstitution.trim(),
      course: customCourse.trim(),
      yearOfStudy: customYear.trim(),
      paymentStatus: 'verified',
      paymentMethod: 'manual_admin',
      paymentId: 'ADMIN_GENERATED',
      amountINR: 100,
      timestamp: new Date().toISOString(),
      qrDataUrl: qrUrl,
    };

    setCandidates((prev) => [newPass, ...prev]);
    setSelectedCandidate(newPass);
    setActiveTab('all');

    // Reset inputs
    setCustomName('');
    setCustomEmail('');
    setCustomPhone('');
    setCustomTicketId('');
  };

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.fullName.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q)) ||
      c.registrationNumber.toLowerCase().includes(q) ||
      c.course.toLowerCase().includes(q)
    );
  });

  const handlePrintSingle = () => {
    setBatchPrinting(false);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handlePrintBatch = () => {
    setBatchPrinting(true);
    setTimeout(() => {
      window.print();
      setBatchPrinting(false);
    }, 200);
  };

  const handleDownloadQR = (candidate: CandidatePass) => {
    if (!candidate.qrDataUrl) return;
    const a = document.createElement('a');
    a.href = candidate.qrDataUrl;
    a.download = `QR_${candidate.registrationNumber}_${candidate.fullName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 print:bg-white print:p-0">
      {/* Top Banner & Navigation (Hidden in Print) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950">
                  Pass &amp; QR Code Hub
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  KMCTCEEM • IIC
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Official Workshop Candidate Passes with Verification QR Codes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={fetchCandidates}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh passes from live sheets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handlePrintBatch}
              disabled={filteredCandidates.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print All ({filteredCandidates.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-bar with Tab Selection and Search */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-100 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Verified Passes ({candidates.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'custom'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-600" />
              <span>Instant Pass Creator</span>
            </button>
          </div>

          {activeTab === 'all' && (
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search participant by name, email, phone, or ticket ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-900 focus:bg-white focus:border-sky-600 focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:p-0 print:m-0 print:max-w-none">
        {/* TAB 1: LIST + PREVIEW */}
        {activeTab === 'all' && !batchPrinting && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
            {/* Left Column: Candidates Directory (Hidden in Print) */}
            <div className="lg:col-span-5 space-y-3 print:hidden">
              <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                <span>
                  Showing {filteredCandidates.length} of {candidates.length} verified candidate(s)
                </span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Paid &amp; Confirmed
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-600 font-medium">Loading verified candidate passes...</p>
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                  <Search className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-800">No candidates found</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Try searching with a different term.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
                  {filteredCandidates.map((c) => {
                    const isSelected = selectedCandidate?.id === c.id;
                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCandidate(c)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-sky-50/80 border-sky-400 shadow-sm ring-1 ring-sky-300'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-mono font-bold text-sky-800">
                                {c.registrationNumber}
                              </span>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                            </div>
                            <h3 className="text-sm font-black text-slate-950 truncate">{c.fullName}</h3>
                            <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                              {c.course} • {c.yearOfStudy}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {c.email} {c.phone ? `• ${c.phone}` : ''}
                            </p>
                          </div>

                          {c.qrDataUrl && (
                            <div className="w-12 h-12 bg-white rounded-xl border border-slate-200 p-0.5 shrink-0 shadow-2xs">
                              <img
                                src={c.qrDataUrl}
                                alt="QR"
                                className="w-full h-full object-contain rounded-lg"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Column: Full Pass Preview Card & Action Bar */}
            <div className="lg:col-span-7 print:col-span-12">
              {selectedCandidate ? (
                <div>
                  {/* Action Bar for the active pass (Hidden in print) */}
                  <div className="mb-4 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        Pass Preview: <span className="text-sky-700">{selectedCandidate.fullName}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadQR(selectedCandidate)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                        title="Download QR code as PNG image"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save QR</span>
                      </button>

                      <button
                        type="button"
                        onClick={handlePrintSingle}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs active:scale-95 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Pass</span>
                      </button>
                    </div>
                  </div>

                  {/* Formal Printable Institutional Pass Card */}
                  <div
                    ref={singlePassRef}
                    className="rounded-3xl bg-white border-2 border-slate-300 p-8 sm:p-10 shadow-xl relative overflow-hidden print:border-2 print:border-black print:p-6 print:shadow-none print:m-0 print:page-break-after-always"
                  >
                    {/* Header Strip */}
                    <div className="border-b-2 border-slate-200 pb-5 print:border-black">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-sky-800 print:text-black">
                              Institution&apos;s Innovation Council (IIC) • Quarter 1 Activity
                            </span>
                          </div>
                          <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight print:text-black">
                            FROM PROBLEM TO POSSIBILITY
                          </h2>
                          <p className="text-xs text-slate-700 font-semibold mt-0.5 print:text-gray-800">
                            Workshop on Systematic Problem Solving, Ideation &amp; Prototype Pitching
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5 print:text-gray-600">
                            KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
                          </p>
                        </div>

                        {/* Institutional Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0">
                          <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-right print:border-black">
                            <span className="text-[9px] uppercase tracking-widest text-slate-500 font-extrabold block">
                              Organizer
                            </span>
                            <span className="text-xs font-black text-slate-900 block mt-0.5">
                              KMCTCEEM • IIC
                            </span>
                            <span className="text-[9px] text-emerald-700 font-bold block">
                              Official Entry Pass
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Ticket Identifier & Status Ribbon */}
                    <div className="py-4 border-b border-dashed border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-black">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block">
                          Official Ticket ID
                        </span>
                        <span className="text-xl font-mono font-black text-slate-950 tracking-wider">
                          {selectedCandidate.registrationNumber}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 print:border-black">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Admit One • Confirmed</span>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider print:border-black">
                          Fee: ₹100 Paid
                        </div>
                      </div>
                    </div>

                    {/* Main Body: Candidate Credentials + Official High-Res QR Code */}
                    <div className="py-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-slate-200 print:border-black">
                      {/* Left Side: Participant Data */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 print:border-black print:bg-white">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Participant Name
                            </span>
                            <span className="text-lg font-black text-slate-950 block">
                              {selectedCandidate.fullName}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Department / Course
                              </span>
                              <span className="text-xs font-bold text-slate-900 block truncate">
                                {selectedCandidate.course}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Year of Study
                              </span>
                              <span className="text-xs font-bold text-slate-900 block">
                                {selectedCandidate.yearOfStudy}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                Email Address
                              </span>
                              <span className="text-xs font-mono text-slate-900 block truncate">
                                {selectedCandidate.email}
                              </span>
                            </div>
                            <div>
                              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                                WhatsApp / Phone
                              </span>
                              <span className="text-xs font-mono text-slate-900 block">
                                {selectedCandidate.phone || 'N/A'}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-500 block">
                              Institution
                            </span>
                            <span className="text-xs font-semibold text-slate-800 block line-clamp-1">
                              {selectedCandidate.institution}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Side: QR Code Verification Box */}
                      <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-slate-50 border border-slate-200 print:border-black print:bg-white">
                        {selectedCandidate.qrDataUrl ? (
                          <div className="w-44 h-44 bg-white p-2 rounded-2xl border-2 border-slate-300 shadow-sm print:border-black">
                            <img
                              src={selectedCandidate.qrDataUrl}
                              alt={`QR Code for ${selectedCandidate.registrationNumber}`}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-44 h-44 bg-slate-100 flex items-center justify-center rounded-2xl text-slate-400">
                            <QrCode className="w-12 h-12" />
                          </div>
                        )}
                        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-600 mt-2.5 block print:text-black">
                          Scan to Authenticate Entry
                        </span>
                        <span className="text-[9px] text-slate-500 block">
                          Verified IIC Security Hash
                        </span>
                      </div>
                    </div>

                    {/* Schedule & Venue Strip */}
                    <div className="py-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print:border-black">
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Clock className="w-4 h-4 text-sky-700 shrink-0" />
                        <span>Wednesday, 11th November 2026 • 9:30 AM – 4:00 PM IST</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-800 font-semibold">
                        <MapPin className="w-4 h-4 text-rose-700 shrink-0" />
                        <span>Seminar Hall, KMCTCEEM, Kasaragod</span>
                      </div>
                    </div>

                    {/* Footer Authority Stamp */}
                    <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[10px] text-slate-500 print:text-black">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>
                          Official digital pass issued by Institution&apos;s Innovation Council, KMCTCEEM. Non-transferable.
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-800 print:text-black">
                          Approved by Principal, KMCTCEEM
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
                  <FileText className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">Select a candidate to view their pass</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: INSTANT PASS CREATOR */}
        {activeTab === 'custom' && (
          <div className="max-w-2xl mx-auto bg-white rounded-3xl p-8 border border-slate-200 shadow-xl">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-200">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700">
                <PlusCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">Instant Pass &amp; QR Generator</h2>
                <p className="text-xs text-slate-600">
                  Generate a custom workshop pass with verification QR code on the spot.
                </p>
              </div>
            </div>

            <form onSubmit={handleCreateCustomPass} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Participant Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul@example.com"
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile / WhatsApp <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={customPhone}
                    onChange={(e) => setCustomPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Custom Ticket ID (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Leave empty for auto-generated ID"
                    value={customTicketId}
                    onChange={(e) => setCustomTicketId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Department / Course
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech Computer Science"
                    value={customCourse}
                    onChange={(e) => setCustomCourse(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-sky-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Year of Study
                  </label>
                  <select
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-sky-600 focus:outline-none cursor-pointer"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Faculty / Staff">Faculty / Staff</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  required
                  value={customInstitution}
                  onChange={(e) => setCustomInstitution(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-xs focus:bg-white focus:border-sky-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                <QrCode className="w-4 h-4" />
                <span>Generate Pass with QR Code</span>
              </button>
            </form>
          </div>
        )}

        {/* BATCH PRINTING MULTI-PASS CONTAINER (Activated during Batch Print) */}
        {batchPrinting && (
          <div className="hidden print:block space-y-8">
            {filteredCandidates.map((c) => (
              <div
                key={c.id}
                className="p-8 border-2 border-black rounded-3xl bg-white page-break-after-always"
                style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
              >
                {/* Header */}
                <div className="border-b-2 border-black pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest block text-black">
                      Institution&apos;s Innovation Council (IIC) • Quarter 1 Activity
                    </span>
                    <h2 className="text-2xl font-black text-black">FROM PROBLEM TO POSSIBILITY</h2>
                    <p className="text-xs text-gray-800">
                      KMCT College of Engineering for Emerging Technologies and Management, Kasaragod
                    </p>
                  </div>
                  <div className="text-right border border-black p-2 rounded-lg">
                    <span className="text-[10px] font-bold block">KMCTCEEM • IIC</span>
                    <span className="text-xs font-black block">Official Pass</span>
                  </div>
                </div>

                {/* Ticket ID */}
                <div className="flex justify-between items-center py-2 border-b border-black text-xs mb-4">
                  <div>
                    <span className="font-bold">Ticket ID: </span>
                    <span className="font-mono font-black text-base">{c.registrationNumber}</span>
                  </div>
                  <div className="font-bold uppercase">Fee: ₹100 Paid • Confirmed</div>
                </div>

                {/* Details + QR */}
                <div className="grid grid-cols-12 gap-4 items-center py-4 border-b border-black">
                  <div className="col-span-8 space-y-2 text-xs">
                    <div>
                      <span className="font-bold text-gray-600 block text-[10px] uppercase">Participant:</span>
                      <span className="font-black text-base text-black block">{c.fullName}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="font-bold text-gray-600 block text-[10px] uppercase">Department:</span>
                        <span className="font-bold text-black">{c.course}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-600 block text-[10px] uppercase">Year:</span>
                        <span className="font-bold text-black">{c.yearOfStudy}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <span className="font-bold text-gray-600 block text-[10px] uppercase">Email:</span>
                        <span className="font-mono text-black truncate block">{c.email}</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-600 block text-[10px] uppercase">Contact:</span>
                        <span className="font-mono text-black">{c.phone || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="col-span-4 flex flex-col items-center justify-center text-center">
                    {c.qrDataUrl && (
                      <img
                        src={c.qrDataUrl}
                        alt="QR Code"
                        className="w-32 h-32 object-contain border border-black p-1 rounded-lg"
                      />
                    )}
                    <span className="text-[9px] font-bold mt-1 block">Scan for Entry</span>
                  </div>
                </div>

                {/* Schedule */}
                <div className="py-2 flex justify-between text-[11px] font-semibold border-b border-black">
                  <span>Date: Wednesday, 11th November 2026 • 9:30 AM – 4:00 PM</span>
                  <span>Venue: Seminar Hall, KMCTCEEM</span>
                </div>

                {/* Footer */}
                <div className="pt-2 text-[9px] text-gray-700 flex justify-between">
                  <span>Authorized by KMCTCEEM Institution&apos;s Innovation Council. Admit One.</span>
                  <span className="font-bold">Approved by Principal, KMCTCEEM</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PassesQRPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
          <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PassesQRContent />
    </Suspense>
  );
}
