import fs from 'fs';
import path from 'path';
import { isTestRecord } from '@/lib/seats/live-seats';

export interface AttendanceItem {
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

const isCloudServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const PRIMARY_DATA_DIR = isCloudServerless ? path.join('/tmp', '.data') : path.join(process.cwd(), '.data');
const PRIMARY_FILE = path.join(PRIMARY_DATA_DIR, 'attendance.json');
const SECONDARY_FILE = isCloudServerless
  ? path.join(process.cwd(), '.data', 'attendance.json')
  : path.join('/tmp', '.data', 'attendance.json');

let inMemoryAttendance: AttendanceItem[] | null = null;

/**
 * Extracts and cleans a ticket identifier from QR raw string or user input
 */
export function extractTicketIdentifier(rawText: string): string {
  if (!rawText) return '';
  const clean = rawText.trim();

  // 1. Direct ticket pattern: KMCT-WS-XX
  const kmctMatch = clean.match(/KMCT-WS-\d+/i);
  if (kmctMatch) return kmctMatch[0].toUpperCase();

  // 2. Direct P2P ticket: P2P-KMCT-...
  const p2pMatch = clean.match(/P2P-KMCT-[A-Z0-9-]+/i);
  if (p2pMatch) return p2pMatch[0].toUpperCase();

  // 3. URL search params (e.g. ?id=P2P-KMCT-... or ?registrationId=...)
  try {
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
      const url = new URL(clean);
      const idVal = url.searchParams.get('id') || url.searchParams.get('registrationId');
      if (idVal) return idVal.trim().toUpperCase();
    }
  } catch {
    // ignore URL parse errors
  }

  // 4. JSON payload (if any)
  try {
    if (clean.startsWith('{') && clean.endsWith('}')) {
      const parsed = JSON.parse(clean);
      const val = parsed.ticketNumber || parsed.ticketId || parsed.registrationId || parsed.id || parsed.p2pTicket;
      if (val) return String(val).trim().toUpperCase();
    }
  } catch {
    // ignore json parse errors
  }

  return clean;
}

/**
 * Loads baseline confirmed candidates from passes manifest or live data
 */
function loadBaselineCandidates(): Omit<AttendanceItem, 'attended' | 'attendedAt' | 'checkInMethod'>[] {
  try {
    const manifestPath = path.join(process.cwd(), 'public', 'generated-passes', 'passes.json');
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, 'utf-8');
      const passes = JSON.parse(content);
      if (Array.isArray(passes) && passes.length > 0) {
        return passes
          .filter((p: any) => {
            const em = (p.email || '').toLowerCase().trim();
            const nm = (p.fullName || '').toLowerCase().trim();
            if (em.includes('kadeejath') || nm.includes('kadeejath') || nm.includes('mashmooma')) return false;
            if (isTestRecord(em, p.fullName, '', 100)) return false;
            return true;
          })
          .map((p: any) => ({
            index: p.index,
            ticketNumber: p.ticketNumber,
            p2pTicket: p.p2pTicket,
            fullName: p.fullName,
            email: p.email,
            phone: p.phone || '',
            course: p.course || '',
            year: p.year || '',
            passImageUrl: p.passImageUrl,
            qrImageUrl: p.qrImageUrl,
          }));
      }
    }
  } catch (err) {
    console.warn('Could not read passes manifest for baseline attendance:', err);
  }

  return [];
}

/**
 * Reads attendance items from disk or memory, ensuring all candidates are present
 */
export function getAttendanceList(): AttendanceItem[] {
  let diskItems: AttendanceItem[] | null = null;

  try {
    if (fs.existsSync(PRIMARY_FILE)) {
      const data = fs.readFileSync(PRIMARY_FILE, 'utf-8');
      diskItems = JSON.parse(data);
    }
  } catch (e) {
    console.warn('Error reading primary attendance file:', e);
  }

  if (!diskItems) {
    try {
      if (fs.existsSync(SECONDARY_FILE)) {
        const data = fs.readFileSync(SECONDARY_FILE, 'utf-8');
        diskItems = JSON.parse(data);
      }
    } catch {
      // ignore
    }
  }

  if (!diskItems && inMemoryAttendance) {
    diskItems = inMemoryAttendance;
  }

  const baseline = loadBaselineCandidates();
  const existingMap = new Map<string, AttendanceItem>();

  if (Array.isArray(diskItems)) {
    for (const item of diskItems) {
      const key = (item.ticketNumber || item.p2pTicket || item.email || '').toUpperCase();
      if (key) {
        existingMap.set(key, item);
      }
      if (item.ticketNumber) existingMap.set(item.ticketNumber.toUpperCase(), item);
      if (item.p2pTicket) existingMap.set(item.p2pTicket.toUpperCase(), item);
      if (item.email) existingMap.set(item.email.toLowerCase(), item);
    }
  }

  // Merge with baseline to ensure all 36 candidates exist
  const merged: AttendanceItem[] = baseline.map((b) => {
    const existing =
      existingMap.get(b.ticketNumber.toUpperCase()) ||
      existingMap.get(b.p2pTicket.toUpperCase()) ||
      existingMap.get(b.email.toLowerCase());

    return {
      index: b.index,
      ticketNumber: b.ticketNumber,
      p2pTicket: b.p2pTicket,
      fullName: b.fullName,
      email: b.email,
      phone: b.phone,
      course: b.course,
      year: b.year,
      passImageUrl: b.passImageUrl,
      qrImageUrl: b.qrImageUrl,
      attended: existing ? Boolean(existing.attended) : false,
      attendedAt: existing ? existing.attendedAt : null,
      checkInMethod: existing ? existing.checkInMethod : null,
      markedBy: existing ? existing.markedBy : undefined,
      notes: existing ? existing.notes : undefined,
    };
  });

  inMemoryAttendance = merged;
  return merged;
}

/**
 * Persists attendance items to disk
 */
export function saveAttendanceList(items: AttendanceItem[]): void {
  inMemoryAttendance = items;

  try {
    if (!fs.existsSync(PRIMARY_DATA_DIR)) {
      fs.mkdirSync(PRIMARY_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(PRIMARY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing primary attendance file:', err);
  }

  try {
    const secDir = path.dirname(SECONDARY_FILE);
    if (!fs.existsSync(secDir)) {
      fs.mkdirSync(secDir, { recursive: true });
    }
    fs.writeFileSync(SECONDARY_FILE, JSON.stringify(items, null, 2), 'utf-8');
  } catch {
    // ignore
  }
}

/**
 * Finds a candidate by multiple flexible fields
 */
export function findCandidate(
  items: AttendanceItem[],
  query: string
): { item: AttendanceItem; index: number } | null {
  if (!query) return null;
  const qClean = extractTicketIdentifier(query).toUpperCase().trim();
  const qRaw = query.trim().toLowerCase();

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    if (it.ticketNumber && it.ticketNumber.toUpperCase() === qClean) return { item: it, index: i };
    if (it.p2pTicket && it.p2pTicket.toUpperCase() === qClean) return { item: it, index: i };
    if (it.ticketNumber && it.ticketNumber.toUpperCase() === query.toUpperCase().trim()) return { item: it, index: i };
    if (it.p2pTicket && it.p2pTicket.toUpperCase() === query.toUpperCase().trim()) return { item: it, index: i };
    if (it.email && it.email.toLowerCase() === qRaw) return { item: it, index: i };
    if (it.phone && it.phone.replace(/\D/g, '').endsWith(query.replace(/\D/g, '')) && query.replace(/\D/g, '').length >= 6) {
      return { item: it, index: i };
    }
    if (it.fullName && it.fullName.toLowerCase() === qRaw) return { item: it, index: i };
  }

  // Loose search fallback (if query has at least 3 characters)
  if (qRaw.length >= 3) {
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (it.fullName.toLowerCase().includes(qRaw)) return { item: it, index: i };
    }
  }

  return null;
}

/**
 * Marks attendance for a candidate
 */
export function recordCheckIn(
  identifier: string,
  method: 'qr_scanner' | 'manual' = 'qr_scanner',
  markedBy = 'Coordinator',
  notes?: string
): {
  success: boolean;
  alreadyCheckedIn: boolean;
  student?: AttendanceItem;
  message: string;
} {
  const items = getAttendanceList();
  const found = findCandidate(items, identifier);

  if (!found) {
    return {
      success: false,
      alreadyCheckedIn: false,
      message: `Candidate not found for ticket: ${identifier}`,
    };
  }

  const { item, index } = found;

  if (item.attended) {
    return {
      success: true,
      alreadyCheckedIn: true,
      student: item,
      message: `Candidate was already checked in at ${new Date(item.attendedAt!).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`,
    };
  }

  const now = new Date().toISOString();
  item.attended = true;
  item.attendedAt = now;
  item.checkInMethod = method;
  item.markedBy = markedBy;
  if (notes) item.notes = notes;

  items[index] = item;
  saveAttendanceList(items);

  return {
    success: true,
    alreadyCheckedIn: false,
    student: item,
    message: `Attendance marked successfully for ${item.fullName}!`,
  };
}

/**
 * Undoes check-in for a candidate
 */
export function undoCheckIn(identifier: string): {
  success: boolean;
  student?: AttendanceItem;
  message: string;
} {
  const items = getAttendanceList();
  const found = findCandidate(items, identifier);

  if (!found) {
    return {
      success: false,
      message: `Candidate not found for ticket: ${identifier}`,
    };
  }

  const { item, index } = found;
  item.attended = false;
  item.attendedAt = null;
  item.checkInMethod = null;
  item.notes = undefined;

  items[index] = item;
  saveAttendanceList(items);

  return {
    success: true,
    student: item,
    message: `Check-in reverted for ${item.fullName}.`,
  };
}

