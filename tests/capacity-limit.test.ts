import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as registerPOST } from '@/app/api/register/route';
import { POST as createOrderPOST } from '@/app/api/create-order/route';
import { GET as eventGET } from '@/app/api/event/route';
import { GET as seatsGET } from '@/app/api/seats/route';
import * as liveSeatsModule from '@/lib/seats/live-seats';
import { DataStore } from '@/lib/storage/data-store';

describe('70-Participant Capacity & Auto-Closure Enforcement', () => {
  beforeEach(async () => {
    vi.restoreAllMocks();
  });

  it('strictly caps total seats at 70 in live-seats info', async () => {
    const seatsInfo = await liveSeatsModule.getLiveSeatsInfo();
    expect(seatsInfo.total).toBe(70);
    expect(seatsInfo.remaining).toBeLessThanOrEqual(70);
  });

  it('rejects /api/register when 70 participants limit is reached', async () => {
    vi.spyOn(liveSeatsModule, 'getLiveSeatsInfo').mockResolvedValue({
      total: 70,
      paid: 70,
      remaining: 0,
      percentFilled: 100,
      isSoldOut: true,
      registrationsClosed: true,
      timestamp: Date.now(),
    });

    const req = new NextRequest('http://localhost:3000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'New Participant',
        email: 'newparticipant@kmct.edu.in',
        phone: '9847123456',
        institution: 'KMCT College of Engineering',
        course: 'Computer Science',
        yearOfStudy: '1st Year',
        privacyConsent: true,
      }),
    });

    const res = await registerPOST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.registrationsClosed).toBe(true);
    expect(data.message).toContain('70 participants');
  });

  it('rejects /api/create-order when 70 participants limit is reached', async () => {
    vi.spyOn(liveSeatsModule, 'getLiveSeatsInfo').mockResolvedValue({
      total: 70,
      paid: 70,
      remaining: 0,
      percentFilled: 100,
      isSoldOut: true,
      registrationsClosed: true,
      timestamp: Date.now(),
    });

    const req = new NextRequest('http://localhost:3000/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 10000,
        currency: 'INR',
        registrationId: 'reg_test_unpaid_123',
      }),
    });

    const res = await createOrderPOST(req);
    expect(res.status).toBe(403);
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.registrationsClosed).toBe(true);
    expect(data.message).toContain('70 seats');
  });

  it('returns isSoldOut and registrationsClosed on /api/seats when 70 participants limit is reached', async () => {
    vi.spyOn(liveSeatsModule, 'getLiveSeatsInfo').mockResolvedValue({
      total: 70,
      paid: 70,
      remaining: 0,
      percentFilled: 100,
      isSoldOut: true,
      registrationsClosed: true,
      timestamp: Date.now(),
    });

    const res = await seatsGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.total).toBe(70);
    expect(data.remaining).toBe(0);
    expect(data.isSoldOut).toBe(true);
    expect(data.registrationsClosed).toBe(true);
  });

  it('marks augmentedEvent.registrationsClosed = true on /api/event when 70 participants limit is reached', async () => {
    vi.spyOn(liveSeatsModule, 'getLiveSeatsInfo').mockResolvedValue({
      total: 70,
      paid: 70,
      remaining: 0,
      percentFilled: 100,
      isSoldOut: true,
      registrationsClosed: true,
      timestamp: Date.now(),
    });

    const res = await eventGET();
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.event.capacity).toBe(70);
    expect(data.event.registrationsClosed).toBe(true);
    expect(data.seats.isSoldOut).toBe(true);
    expect(data.seats.remaining).toBe(0);
  });
});
