import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as getRegistrationGET } from '@/app/api/registrations/[id]/route';
import { GET as lookupGET } from '@/app/api/registrations/lookup/route';
import { DataStore } from '@/lib/storage/data-store';

describe('Pass Lookup & Reconciliation API', () => {
  it('returns locked pass with empty ticket number for unpaid registrations', async () => {
    const email = `unpaid_${Date.now()}@kmct.edu.in`;
    const reg = await DataStore.createRegistration({
      fullName: 'Unpaid Candidate',
      email,
      normalizedEmail: email,
      phone: '9123456780',
      institution: 'KMCT College',
      course: 'B.Tech CSE',
      yearOfStudy: '1st Year',
      eventId: 'problem-to-possibility-kmct-2026',
      paymentMethod: 'none',
      amountPaise: 10000,
      currency: 'INR',
    });

    const req = new NextRequest(`http://localhost:3000/api/registrations/${reg.id}`);
    const res = await getRegistrationGET(req, { params: Promise.resolve({ id: reg.id }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.registration.paymentStatus).toBe('unpaid');
    expect(data.registration.registrationNumber).toBe('');
  });

  it('returns official ticket pass for verified registrations when queried by ID or email', async () => {
    const email = `paid_${Date.now()}@kmct.edu.in`;
    const ticketId = `P2P-KMCT-TEST-${Date.now().toString(36).toUpperCase()}`;

    const reg = await DataStore.createRegistration({
      fullName: 'Paid Candidate',
      email,
      normalizedEmail: email,
      phone: '9845123456',
      institution: 'KMCT College of Engineering',
      course: 'AI & Data Science',
      yearOfStudy: '1st Year',
      eventId: 'problem-to-possibility-kmct-2026',
      paymentMethod: 'razorpay',
      amountPaise: 10000,
      currency: 'INR',
    });

    await DataStore.updateRegistration(reg.id, {
      status: 'confirmed',
      paymentStatus: 'verified',
      registrationNumber: ticketId,
      paymentId: `pay_test_${Date.now()}`,
      amountPaid: 100,
    });

    // Query by ID
    const req1 = new NextRequest(`http://localhost:3000/api/registrations/${reg.id}`);
    const res1 = await getRegistrationGET(req1, { params: Promise.resolve({ id: reg.id }) });
    expect(res1.status).toBe(200);
    const data1 = await res1.json();
    expect(data1.success).toBe(true);
    expect(data1.registration.paymentStatus).toBe('verified');
    expect(data1.registration.registrationNumber).toBe(ticketId);

    // Query by Email via lookup endpoint
    const req2 = new NextRequest(`http://localhost:3000/api/registrations/lookup?query=${encodeURIComponent(email)}`);
    const res2 = await lookupGET(req2);
    expect(res2.status).toBe(200);
    const data2 = await res2.json();
    expect(data2.success).toBe(true);
    expect(data2.registration.registrationNumber).toBe(ticketId);
    expect(data2.registration.fullName).toBe('Paid Candidate');
  });

  it('rejects lookup requests with empty query with status 400', async () => {
    const req = new NextRequest('http://localhost:3000/api/registrations/lookup?query=   ');
    const res = await lookupGET(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.success).toBe(false);
  });
});

