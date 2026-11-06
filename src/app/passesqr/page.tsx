'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
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
  FileText,
  BadgeCheck,
  X,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  Eye,
  Check,
  Share2,
} from 'lucide-react';

interface StudentPassItem {
  index: number;
  ticketNumber: string;
  p2pTicket: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  year: string;
  passImageUrl: string;
  qrImageUrl: string;
  passFilename?: string;
  qrFilename?: string;
}

function PassesQRContent() {
  const [students, setStudents] = useState<StudentPassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentPassItem | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchPasses = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/passesqr');
      if (res.ok) {
        const data = await res.json();
        const list: StudentPassItem[] = data.candidates || [];
        setStudents(list);
        if (list.length > 0 && !selectedStudent) {
          setSelectedStudent(list[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching passes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPasses();
  }, []);

  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      s.ticketNumber.toLowerCase().includes(q) ||
      (s.p2pTicket && s.p2pTicket.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q))
    );
  });

  const handlePrintSingle = () => {
    setIsBatchPrinting(false);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const handlePrintBatch = () => {
    setIsBatchPrinting(true);
    setTimeout(() => {
      window.print();
      setIsBatchPrinting(false);
    }, 250);
  };

  const handleCopyLink = (ticket: string) => {
    const url = `${window.location.origin}/success?registrationId=${encodeURIComponent(ticket)}`;
    navigator.clipboard.writeText(url);
    setCopiedId(ticket);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 print:bg-white print:text-black print:p-0">
      {/* Top Coordinator Banner (Hidden during Print) */}
      <header className="bg-slate-950/90 border-b border-slate-800 sticky top-0 z-30 backdrop-blur-md print:hidden shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Pass &amp; QR Code Hub
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  KMCTCEEM IIC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Official Entry Passes &amp; Separate QR Codes for All Registered Students ({students.length} Confirmed)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              type="button"
              onClick={fetchPasses}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh passes"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handlePrintBatch}
              disabled={filteredStudents.length === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Batch Print All ({filteredStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Real-Time Search Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-t border-slate-800/80 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, Ticket ID (KMCT-WS-.. or P2P-..), phone, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-400 focus:bg-slate-800 focus:border-amber-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-xs text-slate-400 font-semibold hidden md:block">
            Showing <strong className="text-white">{filteredStudents.length}</strong> of{' '}
            <strong className="text-white">{students.length}</strong> passes
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:p-0 print:m-0 print:max-w-none">
        {!isBatchPrinting && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start print:block">
            {/* Left Column: Registered Students Directory (Hidden in Print) */}
            <div className="lg:col-span-5 space-y-3 print:hidden">
              <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                <span>Select a student to view and download their pass</span>
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified (₹100 Paid)
                </span>
              </div>

              {loading ? (
                <div className="p-12 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
                  <RefreshCw className="w-6 h-6 text-amber-500 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-300 font-medium">Loading confirmed student passes...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="p-10 text-center bg-slate-800/40 rounded-2xl border border-slate-800">
                  <Search className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-bold text-white">No matching students found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword.</p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[calc(100vh-210px)] overflow-y-auto pr-1">
                  {filteredStudents.map((s) => {
                    const isSelected = selectedStudent?.ticketNumber === s.ticketNumber;
                    return (
                      <div
                        key={s.ticketNumber}
                        onClick={() => setSelectedStudent(s)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                            : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                                {s.ticketNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono truncate">
                                {s.p2pTicket}
                              </span>
                            </div>
                            <h3 className="text-sm font-black text-white truncate">{s.fullName}</h3>
                            <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                              {s.course} • {s.year}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                              {s.email} {s.phone ? `• ${s.phone}` : ''}
                            </p>
                          </div>

                          {/* Thumbnail Preview */}
                          {s.qrImageUrl && (
                            <div className="w-12 h-12 bg-white rounded-xl p-0.5 shrink-0 shadow-xs border border-slate-700">
                              <img
                                src={s.qrImageUrl}
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

            {/* Right Column: Selected Student's Official Pass Preview Card */}
            <div className="lg:col-span-7 print:col-span-12">
              {selectedStudent ? (
                <div className="space-y-4">
                  {/* Action Bar for the Active Pass (Hidden in Print) */}
                  <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <div>
                      <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                        Active Pass Selected
                      </span>
                      <h2 className="text-base font-black text-white flex items-center gap-2">
                        <span>{selectedStudent.fullName}</span>
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                          {selectedStudent.ticketNumber}
                        </span>
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Download Pass Image */}
                      <a
                        href={selectedStudent.passImageUrl}
                        download={`${selectedStudent.ticketNumber}_Pass_${selectedStudent.fullName.replace(/\s+/g, '_')}.png`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <ArrowDownToLine className="w-3.5 h-3.5" />
                        <span>Download Pass</span>
                      </a>

                      {/* Download Separate QR Code */}
                      <a
                        href={selectedStudent.qrImageUrl}
                        download={`${selectedStudent.ticketNumber}_QR_${selectedStudent.fullName.replace(/\s+/g, '_')}.png`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-bold transition-all shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5 text-amber-400" />
                        <span>Download QR Code</span>
                      </a>

                      {/* Print Pass */}
                      <button
                        type="button"
                        onClick={handlePrintSingle}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print</span>
                      </button>

                      {/* Copy Pass URL */}
                      <button
                        type="button"
                        onClick={() => handleCopyLink(selectedStudent.p2pTicket)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs transition-colors cursor-pointer"
                        title="Copy student pass link"
                      >
                        {copiedId === selectedStudent.p2pTicket ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Share2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* High-Resolution Graphic Pass Viewport */}
                  <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center print:bg-white print:border-none print:p-0 print:m-0">
                    <div className="max-w-[500px] w-full rounded-2xl overflow-hidden shadow-2xl border-2 border-slate-700/50 print:border-none print:shadow-none print:max-w-none print:w-full">
                      <img
                        src={selectedStudent.passImageUrl}
                        alt={`Pass for ${selectedStudent.fullName}`}
                        className="w-full h-auto object-contain block"
                      />
                    </div>

                    {/* Quick Separate QR Code Inspection Box */}
                    <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 w-full max-w-[500px] flex items-center justify-between gap-4 print:hidden">
                      <div className="flex items-center gap-3">
                        <div className="w-16 h-16 bg-white p-1 rounded-xl shrink-0 shadow-sm">
                          <img
                            src={selectedStudent.qrImageUrl}
                            alt="Separate QR"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block">
                            Separate QR Code
                          </span>
                          <span className="text-xs font-bold text-white block">
                            Scan for Venue Entry &amp; Verification
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                            Ticket: {selectedStudent.ticketNumber}
                          </span>
                        </div>
                      </div>

                      <a
                        href={selectedStudent.qrImageUrl}
                        download={`${selectedStudent.ticketNumber}_QR.png`}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Save PNG</span>
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800">
                  <FileText className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <p className="text-sm font-bold text-white">Select a candidate pass from the list</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* BATCH PRINT ALL PASSES (Visible only during Batch Printing) */}
        {isBatchPrinting && (
          <div className="hidden print:block space-y-6">
            {filteredStudents.map((s) => (
              <div
                key={s.ticketNumber}
                className="page-break-after-always flex items-center justify-center p-4"
                style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
              >
                <div className="w-full max-w-[620px] mx-auto text-center">
                  <img
                    src={s.passImageUrl}
                    alt={`Official Pass for ${s.fullName}`}
                    className="w-full h-auto object-contain mx-auto"
                  />
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
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-slate-400">
          <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <PassesQRContent />
    </Suspense>
  );
}
