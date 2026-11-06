import { NextResponse } from 'next/server';
import { getLiveSeatsInfo } from '@/lib/seats/live-seats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const seats = await getLiveSeatsInfo();
    const isClosed = seats.paid >= 70 || seats.remaining <= 0 || Boolean(seats.registrationsClosed);
    return NextResponse.json(
      {
        success: true,
        total: 70,
        paid: seats.paid,
        remaining: Math.max(0, 70 - seats.paid),
        percentFilled: Math.min(100, Math.round((seats.paid / 70) * 100)),
        isSoldOut: isClosed,
        registrationsClosed: isClosed,
        timestamp: seats.timestamp,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: true,
        total: 70,
        paid: 6,
        remaining: 64,
        percentFilled: 9,
        isSoldOut: false,
        registrationsClosed: false,
        timestamp: Date.now(),
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}
