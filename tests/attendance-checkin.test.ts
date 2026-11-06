import { describe, it, expect, beforeEach } from 'vitest';
import {
  extractTicketIdentifier,
  getAttendanceList,
  findCandidate,
  recordCheckIn,
  undoCheckIn,
} from '@/lib/attendance/attendance-store';

describe('Attendance & QR Check-In System', () => {
  it('extracts ticket identifiers from various QR formats and URLs', () => {
    // Format 1: Direct KMCT ticket ID
    expect(extractTicketIdentifier('KMCT-WS-01')).toBe('KMCT-WS-01');
    expect(extractTicketIdentifier('kmct-ws-12')).toBe('KMCT-WS-12');

    // Format 2: Direct P2P registration ticket
    expect(extractTicketIdentifier('P2P-KMCT-MW4GJ5NL-BB004A')).toBe('P2P-KMCT-MW4GJ5NL-BB004A');

    // Format 3: Verification URL with id parameter
    const url1 = 'https://from-problem-to-possibility.vercel.app/success?id=P2P-KMCT-MW4GJ5NL-BB004A';
    expect(extractTicketIdentifier(url1)).toBe('P2P-KMCT-MW4GJ5NL-BB004A');

    // Format 4: Verification URL with registrationId parameter
    const url2 = 'https://from-problem-to-possibility.vercel.app/success?registrationId=KMCT-WS-05';
    expect(extractTicketIdentifier(url2)).toBe('KMCT-WS-05');

    // Format 5: JSON payload
    const jsonStr = JSON.stringify({ ticketNumber: 'KMCT-WS-08', name: 'Student' });
    expect(extractTicketIdentifier(jsonStr)).toBe('KMCT-WS-08');
  });

  it('ensures Kadeejath Mashmooma Gulzar is excluded from attendance', () => {
    const list = getAttendanceList();
    const kadeejath = list.find(
      (c) =>
        (c.email || '').toLowerCase().includes('kadeejath') ||
        (c.fullName || '').toLowerCase().includes('kadeejath') ||
        (c.fullName || '').toLowerCase().includes('mashmooma')
    );
    expect(kadeejath).toBeUndefined();
  });

  it('accurately finds registered candidates by ticket ID, registration number, or email', () => {
    const list = getAttendanceList();
    expect(list.length).toBeGreaterThan(0);

    const firstStudent = list[0];
    const foundByTicket = findCandidate(list, firstStudent.ticketNumber);
    expect(foundByTicket).not.toBeNull();
    expect(foundByTicket?.item.fullName).toBe(firstStudent.fullName);

    const foundByP2P = findCandidate(list, firstStudent.p2pTicket);
    expect(foundByP2P).not.toBeNull();
    expect(foundByP2P?.item.fullName).toBe(firstStudent.fullName);

    const foundByEmail = findCandidate(list, firstStudent.email);
    expect(foundByEmail).not.toBeNull();
    expect(foundByEmail?.item.fullName).toBe(firstStudent.fullName);
  });

  it('marks attendance and prevents duplicate check-ins', () => {
    const list = getAttendanceList();
    const candidate = list[0];

    // Undo first to ensure clean state
    undoCheckIn(candidate.ticketNumber);

    // Initial check-in
    const firstCheckIn = recordCheckIn(candidate.ticketNumber, 'qr_scanner', 'Coordinator');
    expect(firstCheckIn.success).toBe(true);
    expect(firstCheckIn.alreadyCheckedIn).toBe(false);
    expect(firstCheckIn.student?.attended).toBe(true);
    expect(firstCheckIn.student?.attendedAt).toBeTruthy();
    expect(firstCheckIn.student?.checkInMethod).toBe('qr_scanner');

    // Duplicate check-in attempt
    const secondCheckIn = recordCheckIn(candidate.ticketNumber, 'qr_scanner', 'Coordinator');
    expect(secondCheckIn.success).toBe(true);
    expect(secondCheckIn.alreadyCheckedIn).toBe(true);
    expect(secondCheckIn.message).toContain('already checked in');

    // Undo check-in
    const undoRes = undoCheckIn(candidate.ticketNumber);
    expect(undoRes.success).toBe(true);
    expect(undoRes.student?.attended).toBe(false);
    expect(undoRes.student?.attendedAt).toBeNull();
  });
});

