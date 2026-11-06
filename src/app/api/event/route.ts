import { NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';
import { getLiveSeatsInfo } from '@/lib/seats/live-seats';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const [event, seats] = await Promise.all([
      DataStore.getEventConfig(),
      getLiveSeatsInfo(),
    ]);

    const isClosed =
      Boolean(event.registrationsClosed) ||
      seats.paid >= 70 ||
      seats.remaining <= 0 ||
      Boolean(event.registrationClosingDate && new Date(event.registrationClosingDate).getTime() <= Date.now());

    const augmentedEvent = {
      ...event,
      capacity: 70,
      minimumTarget: 70,
      registrationsClosed: isClosed,
    };

    return NextResponse.json(
      {
        success: true,
        event: augmentedEvent,
        seats: {
          total: 70,
          paid: seats.paid,
          remaining: Math.max(0, 70 - seats.paid),
          percentFilled: Math.min(100, Math.round((seats.paid / 70) * 100)),
          isSoldOut: isClosed,
          registrationsClosed: isClosed,
        },
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
    console.error('Fetch event config error, returning defaults:', error);
    return NextResponse.json(
      {
        success: true,
        event: DEFAULT_EVENT_CONFIG,
        seats: {
          total: 70,
          paid: 6,
          remaining: 64,
          percentFilled: 9,
        },
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }
}

