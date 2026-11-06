import { NextResponse } from 'next/server';
import { fetchSheetCandidates, isTestRecord } from '@/lib/seats/live-seats';
import { DataStore } from '@/lib/storage/data-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const candidateMap = new Map<string, any>();

    // 1. Fetch live from Google Sheets
    try {
      const sheetCandidates = await fetchSheetCandidates();
      for (const s of sheetCandidates) {
        const email = (s.email || '').toLowerCase().trim();
        if (!email || isTestRecord(email, s.fullName, s.utr, s.amountINR)) continue;

        candidateMap.set(email, {
          id: `sheet_${s.utr || email}`,
          registrationNumber: s.registrationNumber,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          institution: s.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
          course: s.course,
          yearOfStudy: s.yearOfStudy,
          paymentStatus: 'verified',
          paymentMethod: s.paymentMethod || 'razorpay',
          paymentId: s.utr,
          amountINR: s.amountINR || 100,
          timestamp: s.timestamp,
        });
      }
    } catch (sheetErr) {
      console.warn('[PassesQR API] Sheet fetch note:', sheetErr);
    }

    // 2. Cross-reference with DataStore
    try {
      const dbRegistrations = await DataStore.listRegistrations();
      for (const r of dbRegistrations) {
        const email = (r.email || '').toLowerCase().trim();
        if (
          r.paymentStatus === 'verified' &&
          email &&
          !isTestRecord(email, r.fullName, r.paymentId, r.amountPaid)
        ) {
          if (!candidateMap.has(email)) {
            candidateMap.set(email, {
              id: r.id,
              registrationNumber: r.registrationNumber || `P2P-KMCT-${r.id.slice(-8).toUpperCase()}`,
              fullName: r.fullName,
              email: r.email,
              phone: r.phone,
              institution: r.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
              course: r.course,
              yearOfStudy: r.yearOfStudy,
              paymentStatus: 'verified',
              paymentMethod: r.paymentMethod || 'razorpay',
              paymentId: r.paymentId || r.manualUtr || 'VERIFIED',
              amountINR: r.amountPaid || 100,
              timestamp: r.createdAt,
            });
          }
        }
      }
    } catch (dbErr) {
      console.warn('[PassesQR API] DB fetch note:', dbErr);
    }

    const candidates = Array.from(candidateMap.values());

    return NextResponse.json(
      {
        success: true,
        count: candidates.length,
        candidates,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    );
  } catch (error: any) {
    console.error('PassesQR API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch passes' },
      { status: 500 }
    );
  }
}
