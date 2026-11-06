import { NextRequest, NextResponse } from 'next/server';
import { DataStore } from '@/lib/storage/data-store';
import { fetchSheetCandidates, fetchRazorpayCaptured, formatCandidateTicketId, isTestRecord } from '@/lib/seats/live-seats';
import { syncCandidateToGoogleSheet } from '@/lib/sheets/google-sheets';
import { isRazorpayConfigured } from '@/lib/payments/razorpay';
import { Registration } from '@/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cleanId = decodeURIComponent(id || '').trim();
    const cleanLower = cleanId.toLowerCase();
    const cleanDigits = cleanId.replace(/\D/g, '').slice(-10);

    const emailQuery = req.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    const phoneQuery = req.nextUrl.searchParams.get('phone')?.replace(/\D/g, '').slice(-10);

    // 1. Initial lookup in local DataStore
    let registration: Registration | null = await DataStore.getRegistrationById(cleanId);
    
    if (!registration && cleanId.includes('@')) {
      registration = await DataStore.getRegistrationByEmail(cleanLower);
    }

    if (!registration && emailQuery) {
      registration = await DataStore.getRegistrationByEmail(emailQuery);
    }

    if (!registration && (cleanDigits.length >= 10 || phoneQuery)) {
      const targetPhone = cleanDigits.length >= 10 ? cleanDigits : phoneQuery!;
      const all = await DataStore.listRegistrations();
      registration = all.find((r) => (r.phone || '').replace(/\D/g, '').slice(-10) === targetPhone) || null;
    }

    if (!registration) {
      const all = await DataStore.listRegistrations();
      registration =
        all.find(
          (r) =>
            r.registrationNumber?.toUpperCase() === cleanId.toUpperCase() ||
            r.orderId === cleanId ||
            r.paymentId === cleanId
        ) || null;
    }

    // 2. If already verified in DataStore, return immediately
    if (registration && registration.paymentStatus === 'verified') {
      return NextResponse.json({
        success: true,
        registration,
      });
    }

    // 3. Fallback to Google Sheets (Authoritative source for all verified passes)
    try {
      const sheetCandidates = await fetchSheetCandidates();
      const foundSheet = sheetCandidates.find((s) => {
        const sEmail = (s.email || '').toLowerCase().trim();
        const sPhone = (s.phone || '').replace(/\D/g, '').slice(-10);
        const sReg = (s.registrationNumber || '').toUpperCase().trim();
        const sUtr = (s.utr || '').trim();

        if (isTestRecord(sEmail, s.fullName, sUtr, s.amountINR)) return false;

        return (
          (sEmail && (sEmail === cleanLower || sEmail === emailQuery)) ||
          (sReg && sReg === cleanId.toUpperCase()) ||
          (cleanDigits.length >= 10 && sPhone === cleanDigits) ||
          (phoneQuery && sPhone === phoneQuery) ||
          (sUtr && sUtr === cleanId) ||
          (registration?.email && sEmail === registration.email.toLowerCase().trim()) ||
          (registration?.phone && sPhone === (registration.phone || '').replace(/\D/g, '').slice(-10))
        );
      });

      if (foundSheet) {
        const verifiedReg: Registration = {
          id: registration?.id || `reg_${foundSheet.utr || Date.now()}`,
          registrationNumber: foundSheet.registrationNumber,
          fullName: foundSheet.fullName,
          email: foundSheet.email,
          normalizedEmail: foundSheet.email.toLowerCase().trim(),
          phone: foundSheet.phone,
          institution: foundSheet.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
          course: foundSheet.course,
          yearOfStudy: foundSheet.yearOfStudy,
          eventId: 'problem-to-possibility-kmct-2026',
          paymentMethod: (foundSheet.paymentMethod?.toLowerCase().includes('manual') || foundSheet.paymentMethod?.toLowerCase().includes('upi') ? 'manual_upi' : 'razorpay') as any,
          amountPaid: foundSheet.amountINR || 100,
          amountPaise: (foundSheet.amountINR || 100) * 100,
          currency: 'INR',
          paymentId: foundSheet.utr,
          status: 'confirmed',
          paymentStatus: 'verified',
          createdAt: foundSheet.timestamp || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await DataStore.saveRegistrationDirect(verifiedReg);
        return NextResponse.json({
          success: true,
          registration: verifiedReg,
        });
      }
    } catch (sheetErr) {
      console.warn('[Registration API] Google Sheet candidate lookup warning:', sheetErr);
    }

    // 4. Live Razorpay Fallback: Reconcile unverified / dropped mobile payments directly from Razorpay
    if (isRazorpayConfigured()) {
      try {
        const captured = await fetchRazorpayCaptured();
        const match = captured.find((p: any) => {
          const pEmail = (p.notes?.email || p.email || '').toLowerCase().trim();
          const pPhone = (p.notes?.phone || p.contact || '').replace(/\D/g, '').slice(-10);
          const pRegId = (p.notes?.registrationId || '').trim();
          const pOrderId = (p.order_id || '').trim();
          const pId = (p.id || '').trim();

          if (isTestRecord(pEmail, p.notes?.fullName || p.notes?.name, pId, p.amount)) return false;

          return (
            (pRegId && (pRegId === cleanId || pRegId === registration?.id)) ||
            (pOrderId && (pOrderId === cleanId || pOrderId === registration?.orderId)) ||
            (pId && (pId === cleanId || pId === registration?.paymentId)) ||
            (pEmail && (pEmail === cleanLower || pEmail === emailQuery || (registration?.email && pEmail === registration.email.toLowerCase().trim()))) ||
            (cleanDigits.length >= 10 && pPhone === cleanDigits) ||
            (phoneQuery && pPhone === phoneQuery) ||
            (registration?.phone && pPhone === (registration.phone || '').replace(/\D/g, '').slice(-10))
          );
        });

        if (match) {
          const fullName =
            match.notes?.fullName ||
            match.notes?.name ||
            registration?.fullName ||
            match.email?.split('@')[0] ||
            'Workshop Participant';
          const email = (match.notes?.email || match.email || registration?.email || '').toLowerCase().trim();
          const phone = match.notes?.phone || match.contact?.replace(/\D/g, '').slice(-10) || registration?.phone || '';
          const targetTicketId =
            registration?.registrationNumber && registration.registrationNumber !== 'PENDING'
              ? registration.registrationNumber
              : formatCandidateTicketId(match.notes?.registrationId || registration?.id, match.id);

          const autoVerifiedReg: Registration = {
            id: registration?.id || match.notes?.registrationId || `reg_${match.created_at * 1000}_${match.id.slice(-6)}`,
            registrationNumber: targetTicketId,
            fullName,
            email,
            normalizedEmail: email,
            phone,
            institution: match.notes?.institution || registration?.institution || 'KMCT College of Engineering for Emerging Technologies and Management, Kasaragod',
            course: match.notes?.course || registration?.course || 'Engineering',
            yearOfStudy: match.notes?.yearOfStudy || registration?.yearOfStudy || '1st Year',
            eventId: 'problem-to-possibility-kmct-2026',
            paymentMethod: 'razorpay',
            amountPaid: (match.amount || 10000) / 100,
            amountPaise: match.amount || 10000,
            currency: 'INR',
            orderId: match.order_id || registration?.orderId || '',
            paymentId: match.id,
            status: 'confirmed',
            paymentStatus: 'verified',
            createdAt: new Date(match.created_at * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
          };

          await DataStore.saveRegistrationDirect(autoVerifiedReg);
          await DataStore.recordPayment({
            registrationId: autoVerifiedReg.id,
            provider: 'razorpay',
            providerOrderId: match.order_id || '',
            providerPaymentId: match.id,
            amountPaise: match.amount || 10000,
            currency: 'INR',
            status: 'captured',
            verifiedAt: new Date(match.created_at * 1000).toISOString(),
          });

          // Sync to Google Sheet immediately so sheet stays 100% in sync
          try {
            await syncCandidateToGoogleSheet(autoVerifiedReg, {
              registrationId: autoVerifiedReg.id,
              provider: 'razorpay',
              providerOrderId: match.order_id || '',
              providerPaymentId: match.id,
              amountPaise: match.amount || 10000,
              currency: 'INR',
              status: 'captured',
              verifiedAt: new Date(match.created_at * 1000).toISOString(),
            });
          } catch (syncErr) {
            console.warn('[Registration API] Auto-sync to Google Sheet warning:', syncErr);
          }

          return NextResponse.json({
            success: true,
            registration: autoVerifiedReg,
          });
        }
      } catch (rzpErr) {
        console.warn('[Registration API] Razorpay payment query warning:', rzpErr);
      }
    }

    if (!registration) {
      return NextResponse.json(
        { success: false, message: 'Registration record not found' },
        { status: 404 }
      );
    }

    // Pass and Ticket ID are strictly locked until payment is verified
    const isPaid = registration.paymentStatus === 'verified';
    const safeRegistration: Registration = isPaid
      ? registration
      : {
          ...registration,
          registrationNumber: '', // Only issued after verified payment
        };

    return NextResponse.json({
      success: true,
      registration: safeRegistration,
    });
  } catch (error: any) {
    console.error('Fetch registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server error retrieving registration' },
      { status: 500 }
    );
  }
}
