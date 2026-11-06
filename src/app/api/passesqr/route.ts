import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { fetchSheetCandidates, isTestRecord } from '@/lib/seats/live-seats';
import { DataStore } from '@/lib/storage/data-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // 1. If generated manifest exists on disk, read it
    const manifestPath = path.join(process.cwd(), 'public', 'generated-passes', 'passes.json');
    if (fs.existsSync(manifestPath)) {
      try {
        const manifestContent = fs.readFileSync(manifestPath, 'utf-8');
        const passes = JSON.parse(manifestContent);
        if (Array.isArray(passes) && passes.length > 0) {
          return NextResponse.json({
            success: true,
            count: passes.length,
            candidates: passes,
          });
        }
      } catch (err) {
        console.warn('Error reading passes manifest:', err);
      }
    }

    // 2. Fallback: Query live sheet candidates
    const sheetCandidates = await fetchSheetCandidates();
    const candidates: any[] = [];
    for (const s of sheetCandidates) {
      const email = (s.email || '').toLowerCase().trim();
      if (!email || isTestRecord(email, s.fullName, s.utr, s.amountINR)) continue;

      const idx: number = candidates.length + 1;
      const ticketNumber = `KMCT-WS-${String(idx).padStart(2, '0')}`;
      candidates.push({
        index: idx,
        ticketNumber,
        p2pTicket: s.registrationNumber,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        course: s.course,
        year: s.yearOfStudy,
        passImageUrl: `/pass-template.jpg`,
      });
    }

    return NextResponse.json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error: any) {
    console.error('PassesQR API error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to fetch passes' },
      { status: 500 }
    );
  }
}
