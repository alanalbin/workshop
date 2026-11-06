'use client';

import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import jsQR from 'jsqr';
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
  Camera,
  CameraOff,
  Volume2,
  VolumeX,
  Upload,
  AlertCircle,
  AlertTriangle,
  Users,
  CheckSquare,
  RotateCcw,
  FileSpreadsheet,
  Smartphone,
} from 'lucide-react';

interface AttendanceItem {
  index: number;
  ticketNumber: string;
  p2pTicket: string;
  fullName: string;
  email: string;
  phone: string;
  course: string;
  year: string;
  passImageUrl?: string;
  qrImageUrl?: string;
  attended: boolean;
  attendedAt: string | null;
  checkInMethod: 'qr_scanner' | 'manual' | null;
  markedBy?: string;
  notes?: string;
}

interface ScanResult {
  status: 'idle' | 'success' | 'already_checked' | 'not_found' | 'error';
  message: string;
  rawCode?: string;
  student?: AttendanceItem;
  timestamp?: string;
}

/**
 * Synthesizes clear audio feedback without external audio files
 */
function playTone(type: 'success' | 'warning' | 'error') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    if (type === 'success') {
      // Harmonic 2-tone chime (D5 -> A5)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain1.gain.setValueAtTime(0.25, ctx.currentTime);
      gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc1.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.15);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc2.start(ctx.currentTime + 0.12);
      osc2.stop(ctx.currentTime + 0.4);
    } else if (type === 'warning') {
      // 2 warning beeps (440Hz -> 350Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.14);

      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(350, ctx.currentTime + 0.16);
      gain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.16);
      gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc2.start(ctx.currentTime + 0.16);
      osc2.stop(ctx.currentTime + 0.35);
    } else {
      // Low error buzz
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.28);
    }
  } catch {
    // Ignore audio permission or playback errors
  }
}

/**
 * Cleans and extracts ticket identifier from scanned QR code or typed input
 */
function extractTicketIdentifier(rawText: string): string {
  if (!rawText) return '';
  const clean = rawText.trim();

  const kmctMatch = clean.match(/KMCT-WS-\d+/i);
  if (kmctMatch) return kmctMatch[0].toUpperCase();

  const p2pMatch = clean.match(/P2P-KMCT-[A-Z0-9-]+/i);
  if (p2pMatch) return p2pMatch[0].toUpperCase();

  try {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const url = new URL(clean);
      const idVal = url.searchParams.get('id') || url.searchParams.get('registrationId');
      if (idVal) return idVal.trim().toUpperCase();
    }
  } catch {
    // Ignore URL parse error
  }

  try {
    if (clean.startsWith('{') && clean.endsWith('}')) {
      const parsed = JSON.parse(clean);
      const val = parsed.ticketNumber || parsed.ticketId || parsed.registrationId || parsed.id || parsed.p2pTicket;
      if (val) return String(val).trim().toUpperCase();
    }
  } catch {
    // Ignore JSON parse error
  }

  return clean;
}

function PassesQRContent() {
  const [activeTab, setActiveTab] = useState<'passes' | 'scanner' | 'roster'>('passes');
  const [students, setStudents] = useState<AttendanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<AttendanceItem | null>(null);
  const [isBatchPrinting, setIsBatchPrinting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Scanner State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [isProcessingCheckIn, setIsProcessingCheckIn] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult>({ status: 'idle', message: '' });
  const [cooldownCountdown, setCooldownCountdown] = useState<number>(0);
  const [filterAttendance, setFilterAttendance] = useState<'all' | 'attended' | 'pending'>('all');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const isCooldownRef = useRef(false);

  // Fetch Attendance and Passes
  const fetchAttendanceData = useCallback(async () => {
    try {
      const res = await fetch('/api/attendance');
      if (res.ok) {
        const data = await res.json();
        const list: AttendanceItem[] = data.candidates || [];
        setStudents(list);
        try {
          localStorage.setItem('kmct_attendance_offline_cache', JSON.stringify(list));
        } catch {
          // LocalStorage fallback ignored
        }
        if (list.length > 0 && !selectedStudent) {
          setSelectedStudent(list[0]);
        }
      }
    } catch (err) {
      console.warn('Error fetching attendance API, reading offline cache:', err);
      try {
        const cached = localStorage.getItem('kmct_attendance_offline_cache');
        if (cached) {
          const list: AttendanceItem[] = JSON.parse(cached);
          setStudents(list);
          if (list.length > 0 && !selectedStudent) {
            setSelectedStudent(list[0]);
          }
        }
      } catch {
        // Cache read fallback ignored
      }
    } finally {
      setLoading(false);
    }
  }, [selectedStudent]);

  useEffect(() => {
    fetchAttendanceData();
  }, [fetchAttendanceData]);

  // Clean up camera on unmount or tab switch away from scanner
  const stopCamera = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  useEffect(() => {
    if (activeTab !== 'scanner') {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, stopCamera]);

  // Execute Check-In API call
  const performCheckIn = async (identifier: string, method: 'qr_scanner' | 'manual' = 'qr_scanner') => {
    if (!identifier.trim() || isProcessingCheckIn) return;
    setIsProcessingCheckIn(true);

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketIdentifier: identifier,
          method,
          markedBy: 'Coordinator',
        }),
      });

      const data = await res.json();

      if (data.success) {
        const student: AttendanceItem = data.student;

        // Update local list state
        setStudents((prev) =>
          prev.map((s) => (s.ticketNumber === student.ticketNumber || s.p2pTicket === student.p2pTicket ? student : s))
        );

        if (data.alreadyCheckedIn) {
          if (soundEnabled) playTone('warning');
          setScanResult({
            status: 'already_checked',
            message: `Already Checked In at ${student.attendedAt ? new Date(student.attendedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'earlier'}`,
            rawCode: identifier,
            student,
            timestamp: new Date().toISOString(),
          });
        } else {
          if (soundEnabled) playTone('success');
          setScanResult({
            status: 'success',
            message: `Check-in verified successfully for ${student.fullName}!`,
            rawCode: identifier,
            student,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        if (soundEnabled) playTone('error');
        setScanResult({
          status: 'not_found',
          message: data.message || `No candidate found matching: ${identifier}`,
          rawCode: identifier,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (err: any) {
      if (soundEnabled) playTone('error');
      setScanResult({
        status: 'error',
        message: err?.message || 'Connection error while recording attendance',
        rawCode: identifier,
      });
    } finally {
      setIsProcessingCheckIn(false);
      setManualTicketInput('');

      // Start cooldown countdown to prevent double-scan
      isCooldownRef.current = true;
      setCooldownCountdown(3);
      let count = 3;
      const interval = setInterval(() => {
        count -= 1;
        setCooldownCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          isCooldownRef.current = false;
        }
      }, 1000);
    }
  };

  // Undo Check-in
  const handleUndoCheckIn = async (ticketNumber: string) => {
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticketIdentifier: ticketNumber,
          action: 'undo',
        }),
      });
      const data = await res.json();
      if (data.success && data.student) {
        setStudents((prev) =>
          prev.map((s) => (s.ticketNumber === data.student.ticketNumber ? data.student : s))
        );
        if (scanResult.student?.ticketNumber === ticketNumber) {
          setScanResult({
            status: 'idle',
            message: `Check-in undone for ${data.student.fullName}`,
          });
        }
      }
    } catch (err) {
      console.error('Error undoing check in:', err);
    }
  };

  // Camera Scanning Loop
  const scanQrFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (!isCooldownRef.current && !isProcessingCheckIn) {
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data) {
          const raw = code.data.trim();
          if (raw) {
            performCheckIn(raw, 'qr_scanner');
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(scanQrFrame);
  }, [isProcessingCheckIn]);

  // Start Camera Stream
  const startCamera = async () => {
    stopCamera();
    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: cameraFacing },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch {
        // Fallback to any available video stream (e.g. laptop webcam)
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setIsCameraActive(true);
        animationFrameRef.current = requestAnimationFrame(scanQrFrame);
      }
    } catch (err: any) {
      console.error('Unable to access camera:', err);
      alert('Camera access denied or unavailable. You can use the manual Ticket ID entry below.');
      setIsCameraActive(false);
    }
  };

  // Switch between front/back camera
  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      setTimeout(() => {
        startCamera();
      }, 100);
    }
  };

  // Upload QR image file fallback
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            performCheckIn(code.data.trim(), 'qr_scanner');
          } else {
            alert('No scannable QR code detected in the selected image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Attendance metrics
  const totalCount = students.length;
  const attendedCount = students.filter((s) => s.attended).length;
  const pendingCount = totalCount - attendedCount;
  const attendancePercent = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0;

  // Filtered list for directory and roster
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      s.fullName.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q) ||
      (s.phone && s.phone.includes(q)) ||
      s.ticketNumber.toLowerCase().includes(q) ||
      (s.p2pTicket && s.p2pTicket.toLowerCase().includes(q)) ||
      (s.course && s.course.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterAttendance === 'attended') return s.attended;
    if (filterAttendance === 'pending') return !s.attended;
    return true;
  });

  // Print handlers
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

  // Export Attendance CSV
  const handleExportCSV = () => {
    const headers = [
      'Sl No',
      'Ticket Number',
      'Registration ID',
      'Full Name',
      'Email',
      'Phone',
      'Course',
      'Year',
      'Attendance Status',
      'Checked In At',
      'Check-in Method',
      'Marked By',
    ];

    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.ticketNumber || ''}"`,
      `"${s.p2pTicket || ''}"`,
      `"${(s.fullName || '').replace(/"/g, '""')}"`,
      `"${(s.email || '').replace(/"/g, '""')}"`,
      `"${s.phone || ''}"`,
      `"${(s.course || '').replace(/"/g, '""')}"`,
      `"${(s.year || '').replace(/"/g, '""')}"`,
      s.attended ? 'PRESENT' : 'ABSENT',
      s.attendedAt ? `"${new Date(s.attendedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}"` : '""',
      `"${s.checkInMethod || ''}"`,
      `"${s.markedBy || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KMCT_Workshop_Attendance_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 pb-20 print:bg-white print:text-black print:p-0">
      {/* Top Coordinator Banner (Hidden during Print) */}
      <header className="bg-slate-950/95 border-b border-slate-800 sticky top-0 z-40 backdrop-blur-md print:hidden shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-rose-700 flex items-center justify-center text-white shadow-md shadow-rose-950/30">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Passes &amp; Live Check-In
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  KMCTCEEM IIC
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                11th Nov 2026 • &ldquo;From Problem to Possibility&rdquo; Workshop Attendance Portal
              </p>
            </div>
          </div>

          {/* Quick Metrics Bar in Header */}
          <div className="flex items-center gap-2 sm:gap-4 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total</div>
              <div className="text-sm font-black text-white">{totalCount}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-emerald-400">Checked In</div>
              <div className="text-sm font-black text-emerald-400">{attendedCount}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-amber-400">Remaining</div>
              <div className="text-sm font-black text-amber-400">{pendingCount}</div>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-sky-400">Rate</div>
              <div className="text-sm font-black text-sky-400">{attendancePercent}%</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-1 flex items-center justify-between border-t border-slate-800/60 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 sm:gap-2 py-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('passes')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'passes'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Passes Directory ({students.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('scanner');
                if (!isCameraActive) {
                  setTimeout(() => startCamera(), 100);
                }
              }}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'scanner'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span>Live QR Check-In Scanner</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('roster')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'roster'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Attendance Roster ({attendedCount}/{totalCount})</span>
            </button>
          </div>

          <div className="flex items-center gap-2 py-1.5">
            <button
              type="button"
              onClick={fetchAttendanceData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer disabled:opacity-50"
              title="Refresh attendance records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 cursor-pointer"
              title="Export complete attendance CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 print:p-0 print:m-0 print:max-w-none">

        {/* ========================================================================= */}
        {/* TAB 1: PASSES & TICKETS DIRECTORY */}
        {/* ========================================================================= */}
        {activeTab === 'passes' && !isBatchPrinting && (
          <div className="space-y-4">
            {/* Search and Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
              <div className="relative flex-1 max-w-xl">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by student name, Ticket ID (KMCT-WS-.. or P2P-..), phone, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
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

              <div className="flex items-center gap-2">
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

            {/* Two Column Layout: Student List & Selected Pass Card */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Registered Students Directory */}
              <div className="lg:col-span-5 space-y-3 print:hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold px-1">
                  <span>Select candidate to preview or download</span>
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ₹100 Confirmed
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
                    <p className="text-xs font-bold text-white">No matching candidates found</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different keyword.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
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
                                {s.attended ? (
                                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                                    <Check className="w-3 h-3" /> Checked In
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-mono truncate">
                                    {s.p2pTicket}
                                  </span>
                                )}
                              </div>
                              <h3 className="text-sm font-black text-white truncate">{s.fullName}</h3>
                              <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                                {s.course} • {s.year}
                              </p>
                              <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                {s.email} {s.phone ? `• ${s.phone}` : ''}
                              </p>
                            </div>

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

              {/* Right Column: Selected Pass Preview */}
              <div className="lg:col-span-7">
                {selectedStudent ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shadow-md flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">
                          Active Pass Preview
                        </span>
                        <h2 className="text-base font-black text-white flex items-center gap-2">
                          <span>{selectedStudent.fullName}</span>
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {selectedStudent.ticketNumber}
                          </span>
                        </h2>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {selectedStudent.passImageUrl && (
                          <a
                            href={selectedStudent.passImageUrl}
                            download={`${selectedStudent.ticketNumber}_Pass_${selectedStudent.fullName.replace(/\s+/g, '_')}.png`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <ArrowDownToLine className="w-3.5 h-3.5" />
                            <span>Download Pass</span>
                          </a>
                        )}

                        {selectedStudent.qrImageUrl && (
                          <a
                            href={selectedStudent.qrImageUrl}
                            download={`${selectedStudent.ticketNumber}_QR_${selectedStudent.fullName.replace(/\s+/g, '_')}.png`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white text-xs font-bold transition-all shadow-xs"
                          >
                            <QrCode className="w-3.5 h-3.5 text-amber-400" />
                            <span>Download QR</span>
                          </a>
                        )}

                        <button
                          type="button"
                          onClick={handlePrintSingle}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-white text-slate-900 text-xs font-black uppercase tracking-wider transition-all shadow-xs cursor-pointer active:scale-95"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Print</span>
                        </button>

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

                    {/* Graphic Pass Preview */}
                    <div className="bg-slate-950 p-4 sm:p-6 rounded-3xl border border-slate-800 shadow-2xl flex flex-col items-center justify-center">
                      <div className="max-w-[480px] w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-700/50">
                        {selectedStudent.passImageUrl ? (
                          <img
                            src={selectedStudent.passImageUrl}
                            alt={`Pass for ${selectedStudent.fullName}`}
                            className="w-full h-auto object-contain block"
                          />
                        ) : (
                          <div className="p-8 text-center text-slate-400">Pass image generating...</div>
                        )}
                      </div>

                      {/* Standalone QR Code Inspection Box */}
                      {selectedStudent.qrImageUrl && (
                        <div className="mt-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 w-full max-w-[480px] flex items-center justify-between gap-4">
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
                                Separate High-Resolution QR
                              </span>
                              <span className="text-xs font-bold text-white block">
                                Direct Scannable Entry Code
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
                      )}
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
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: LIVE QR CHECK-IN SCANNER */}
        {/* ========================================================================= */}
        {activeTab === 'scanner' && !isBatchPrinting && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Top Scanner Control Card */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-black text-white flex items-center gap-2">
                      <span>Venue Entry QR Scanner</span>
                      {isCameraActive && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse">
                          Live Active
                        </span>
                      )}
                    </h2>
                    <p className="text-xs text-slate-400">
                      Point camera at candidate pass QR code for automatic verification &amp; attendance
                    </p>
                  </div>
                </div>

                {/* Scanner Controls Toolbar */}
                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`p-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      soundEnabled
                        ? 'bg-slate-800 text-emerald-400 border-slate-700'
                        : 'bg-slate-800/50 text-slate-500 border-slate-800'
                    }`}
                    title={soundEnabled ? 'Mute Audio Chime' : 'Unmute Audio Chime'}
                  >
                    {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer transition-colors"
                    title="Switch Front/Rear Camera"
                  >
                    <Smartphone className="w-4 h-4" />
                  </button>

                  {isCameraActive ? (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-sm"
                    >
                      <CameraOff className="w-3.5 h-3.5" />
                      <span>Stop Camera</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Start Camera</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Live Video Camera Viewport */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-800 aspect-video max-h-[380px] flex items-center justify-center">
                <video
                  ref={videoRef}
                  className={`w-full h-full object-cover ${isCameraActive ? 'block' : 'hidden'}`}
                  autoPlay
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Target Box when camera is running */}
                {isCameraActive ? (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 border-2 border-emerald-400/80 rounded-2xl shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                      {/* Corner Target Markers */}
                      <span className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg" />
                      <span className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg" />
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-emerald-400 rounded-br-lg" />

                      {/* Animated Laser Scanning Line */}
                      <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#34d399] animate-[scannerLaser_2s_ease-in-out_infinite]" />

                      {/* Cooldown Ring Overlay */}
                      {cooldownCountdown > 0 && (
                        <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex flex-col items-center justify-center p-3 text-center">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-1 animate-bounce" />
                          <span className="text-xs font-bold text-white">Scanned!</span>
                          <span className="text-[11px] text-slate-300 mt-0.5">
                            Ready for next in {cooldownCountdown}s
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
                      <Camera className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Camera is currently inactive</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Click &ldquo;Start Camera&rdquo; above to begin live scanning passes at the registration desk.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={startCamera}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-md"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Start Camera Now</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Upload Image Fallback */}
              <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Alternative: Have a screenshot or digital photo of the pass?</span>
                </span>
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold cursor-pointer transition-colors">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Scan QR from Image File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Manual Ticket Fallback Input */}
            <div className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-xl">
              <div className="flex items-center gap-2 mb-3">
                <BadgeCheck className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs uppercase font-bold text-slate-300 tracking-wider">
                  Manual Ticket ID / Student Lookup Check-In
                </h3>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (manualTicketInput.trim()) {
                    performCheckIn(manualTicketInput.trim(), 'manual');
                  }
                }}
                className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter Ticket ID (e.g. KMCT-WS-01 or P2P-KMCT-...) or student name..."
                    value={manualTicketInput}
                    onChange={(e) => setManualTicketInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs sm:text-sm text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!manualTicketInput.trim() || isProcessingCheckIn}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shrink-0 flex items-center justify-center gap-1.5"
                >
                  {isProcessingCheckIn ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckSquare className="w-4 h-4" />
                  )}
                  <span>Mark Check-In</span>
                </button>
              </form>
            </div>

            {/* Live Scan Result Banner */}
            {scanResult.status !== 'idle' && (
              <div
                className={`p-5 rounded-3xl border shadow-xl transition-all ${
                  scanResult.status === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                    : scanResult.status === 'already_checked'
                    ? 'bg-amber-950/40 border-amber-500/60 ring-1 ring-amber-500/30'
                    : 'bg-rose-950/40 border-rose-500/60 ring-1 ring-rose-500/30'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        scanResult.status === 'success'
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-900/40'
                          : scanResult.status === 'already_checked'
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/40'
                          : 'bg-rose-500 text-white shadow-md shadow-rose-900/40'
                      }`}
                    >
                      {scanResult.status === 'success' && <CheckCircle2 className="w-6 h-6" />}
                      {scanResult.status === 'already_checked' && <AlertTriangle className="w-6 h-6" />}
                      {(scanResult.status === 'not_found' || scanResult.status === 'error') && (
                        <AlertCircle className="w-6 h-6" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className={`text-xs uppercase font-black px-2 py-0.5 rounded-md ${
                            scanResult.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : scanResult.status === 'already_checked'
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-rose-500/20 text-rose-300'
                          }`}
                        >
                          {scanResult.status === 'success'
                            ? '✅ Verified & Checked In'
                            : scanResult.status === 'already_checked'
                            ? '⚠️ Already Checked In'
                            : '❌ Scan Warning'}
                        </span>
                        {scanResult.student && (
                          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                            {scanResult.student.ticketNumber}
                          </span>
                        )}
                      </div>

                      {scanResult.student ? (
                        <>
                          <h3 className="text-lg font-black text-white">{scanResult.student.fullName}</h3>
                          <p className="text-xs text-slate-300 font-medium">
                            {scanResult.student.course} • {scanResult.student.year}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            ID: {scanResult.student.p2pTicket} {scanResult.student.phone ? `• Ph: ${scanResult.student.phone}` : ''}
                          </p>
                          {scanResult.student.attendedAt && (
                            <p className="text-[11px] text-emerald-400 font-semibold mt-1">
                              Recorded At: {new Date(scanResult.student.attendedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
                            </p>
                          )}
                        </>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-white">{scanResult.message}</p>
                          {scanResult.rawCode && (
                            <p className="text-xs text-slate-400 font-mono mt-1 truncate max-w-md">
                              Scanned Code: {scanResult.rawCode}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions on Result */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                    {scanResult.student && scanResult.student.attended && (
                      <button
                        type="button"
                        onClick={() => handleUndoCheckIn(scanResult.student!.ticketNumber)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo Check-In</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setScanResult({ status: 'idle', message: '' })}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: ATTENDANCE ROSTER & REAL-TIME STATUS */}
        {/* ========================================================================= */}
        {activeTab === 'roster' && !isBatchPrinting && (
          <div className="space-y-4">
            {/* Header controls & filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter roster by student name, ticket ID, phone, or course..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:border-amber-500 focus:outline-none"
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

              <div className="flex items-center gap-2">
                {/* Filter pills */}
                <div className="inline-flex rounded-xl bg-slate-900 p-1 border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setFilterAttendance('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filterAttendance === 'all'
                        ? 'bg-slate-700 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    All ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterAttendance('attended')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filterAttendance === 'attended'
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Present ({attendedCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterAttendance('pending')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      filterAttendance === 'pending'
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending ({pendingCount})
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Attendance Roster Table */}
            <div className="bg-slate-950 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Ticket</th>
                      <th className="py-3 px-4">Participant Name</th>
                      <th className="py-3 px-4">Course &amp; Year</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Check-In Time</th>
                      <th className="py-3 px-4 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                          No candidates matching your filter.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <tr
                          key={s.ticketNumber}
                          className={`hover:bg-slate-900/50 transition-colors ${
                            s.attended ? 'bg-emerald-950/10' : ''
                          }`}
                        >
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                              {s.ticketNumber}
                            </span>
                            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {s.p2pTicket}
                            </div>
                          </td>

                          <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                            {s.fullName}
                          </td>

                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap">
                            <div>{s.course}</div>
                            <div className="text-[10px] text-slate-400">{s.year}</div>
                          </td>

                          <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                            <div>{s.email}</div>
                            {s.phone && <div>{s.phone}</div>}
                          </td>

                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            {s.attended ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Check className="w-3 h-3" /> Present
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                                Pending
                              </span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-slate-300 whitespace-nowrap font-mono text-[11px]">
                            {s.attendedAt ? (
                              <div>
                                <span className="text-white font-bold">
                                  {new Date(s.attendedAt).toLocaleTimeString('en-IN', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })}
                                </span>
                                <div className="text-[10px] text-slate-400">
                                  via {s.checkInMethod === 'qr_scanner' ? '📷 QR Scan' : '✍️ Manual'}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-500">—</span>
                            )}
                          </td>

                          <td className="py-3 px-4 text-right whitespace-nowrap">
                            {s.attended ? (
                              <button
                                type="button"
                                onClick={() => handleUndoCheckIn(s.ticketNumber)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                                title="Undo check-in"
                              >
                                <RotateCcw className="w-3 h-3" />
                                <span>Undo</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => performCheckIn(s.ticketNumber, 'manual')}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                              >
                                <Check className="w-3 h-3" />
                                <span>Check In</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* BATCH PRINT ALL PASSES (Visible ONLY during print action) */}
        {/* ========================================================================= */}
        {isBatchPrinting && (
          <div className="hidden print:block space-y-6">
            {filteredStudents.map((s) => (
              <div
                key={s.ticketNumber}
                className="page-break-after-always flex items-center justify-center p-4"
                style={{ breakAfter: 'page', pageBreakAfter: 'always' }}
              >
                <div className="w-full max-w-[620px] mx-auto text-center">
                  {s.passImageUrl && (
                    <img
                      src={s.passImageUrl}
                      alt={`Official Pass for ${s.fullName}`}
                      className="w-full h-auto object-contain mx-auto"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <style jsx global>{`
        @keyframes scannerLaser {
          0% {
            top: 5%;
          }
          50% {
            top: 90%;
          }
          100% {
            top: 5%;
          }
        }
      `}</style>
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
