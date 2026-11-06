import { NextResponse } from 'next/server';
import {
  getAttendanceList,
  recordCheckIn,
  undoCheckIn,
  extractTicketIdentifier,
} from '@/lib/attendance/attendance-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const list = getAttendanceList();
    const total = list.length;
    const checkedIn = list.filter((s) => s.attended).length;
    const pending = total - checkedIn;
    const attendanceRate = total > 0 ? `${Math.round((checkedIn / total) * 100)}%` : '0%';

    return NextResponse.json({
      success: true,
      metrics: {
        total,
        checkedIn,
        pending,
        attendanceRate,
      },
      candidates: list,
    });
  } catch (err: any) {
    console.error('Attendance API GET error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to fetch attendance' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { ticketIdentifier, method = 'qr_scanner', action = 'checkin', markedBy = 'Coordinator', notes } = body;

    if (!ticketIdentifier || typeof ticketIdentifier !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Ticket identifier is required' },
        { status: 400 }
      );
    }

    if (action === 'undo') {
      const res = undoCheckIn(ticketIdentifier);
      const list = getAttendanceList();
      const total = list.length;
      const checkedIn = list.filter((s) => s.attended).length;
      const pending = total - checkedIn;

      return NextResponse.json({
        ...res,
        metrics: {
          total,
          checkedIn,
          pending,
          attendanceRate: total > 0 ? `${Math.round((checkedIn / total) * 100)}%` : '0%',
        },
      });
    }

    const res = recordCheckIn(ticketIdentifier, method, markedBy, notes);
    const list = getAttendanceList();
    const total = list.length;
    const checkedIn = list.filter((s) => s.attended).length;
    const pending = total - checkedIn;

    return NextResponse.json({
      ...res,
      cleanedIdentifier: extractTicketIdentifier(ticketIdentifier),
      metrics: {
        total,
        checkedIn,
        pending,
        attendanceRate: total > 0 ? `${Math.round((checkedIn / total) * 100)}%` : '0%',
      },
    });
  } catch (err: any) {
    console.error('Attendance API POST error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Failed to update attendance' },
      { status: 500 }
    );
  }
}
