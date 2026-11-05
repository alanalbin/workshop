import { NextResponse } from 'next/server';
import { syncAllMissingCapturedPaymentsToSheet } from '@/lib/seats/live-seats';
import { DataStore } from '@/lib/storage/data-store';
import { syncCandidateToGoogleSheet } from '@/lib/sheets/google-sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. Sync any captured payments directly from Razorpay API
    let rzpSynced = 0;
    try {
      const rzpResult = await syncAllMissingCapturedPaymentsToSheet();
      rzpSynced = rzpResult.syncedCount || 0;
    } catch (rzpErr) {
      console.warn('Razorpay to Sheets sync note:', rzpErr);
    }

    // 2. Sync from verified registrations in DataStore
    const all = await DataStore.listRegistrations();
    const verified = all.filter((r) => r.paymentStatus === 'verified');
    let localSynced = 0;
    for (const reg of verified) {
      try {
        const res = await syncCandidateToGoogleSheet(reg);
        if (res.success) localSynced++;
      } catch (err) {
        console.warn('Sync candidate error:', err);
      }
    }

    return NextResponse.json(
      {
        success: true,
        verifiedCount: verified.length,
        rzpSynced,
        localSynced,
        message: `Google Sheets sync executed. Verified candidates: ${verified.length}.`,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Google Sheet sync API error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error?.message || 'Failed to sync Google Sheets.',
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  return GET();
}
