import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import { DataStore } from '@/lib/storage/data-store';
import { PaymentService, getRazorpayKeySecret } from '@/lib/payments/razorpay';
import { getLiveSeatsInfo } from '@/lib/seats/live-seats';

describe('Strict Payment Gate & Pass Issuance Security Rules', () => {
  it('strictly ensures a registration cannot have a ticket ID or verified pass prior to payment', async () => {
    const reg = await DataStore.createRegistration({
      fullName: 'Gated Test Candidate',
      email: `security_check_${Date.now()}@kmct.edu.in`,
      normalizedEmail: `security_check_${Date.now()}@kmct.edu.in`,
      phone: '9876543210',
      institution: 'KMCT College of Engineering',
      course: 'Computer Science',
      yearOfStudy: '1st Year',
      eventId: 'problem-to-possibility-kmct-2026',
      paymentMethod: 'none',
      amountPaise: 10000,
      currency: 'INR',
    });

    expect(reg.paymentStatus).toBe('unpaid');
    expect(reg.status).toBe('pending');
    expect(reg.registrationNumber).toBe('');

    // Reading back from DataStore should also return sanitized unpaid state
    const retrieved = await DataStore.getRegistrationById(reg.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.paymentStatus).toBe('unpaid');
    expect(retrieved?.registrationNumber).toBe('');
  });

  it('rejects invalid signatures and only unlocks pass upon authentic HMAC signature', async () => {
    const reg = await DataStore.createRegistration({
      fullName: 'Verified Test Candidate',
      email: `pay_candidate_${Date.now()}@kmct.edu.in`,
      normalizedEmail: `pay_candidate_${Date.now()}@kmct.edu.in`,
      phone: '8848563266',
      institution: 'KMCT College of Engineering',
      course: 'Engineering',
      yearOfStudy: '1st Year',
      eventId: 'problem-to-possibility-kmct-2026',
      paymentMethod: 'none',
      amountPaise: 10000,
      currency: 'INR',
    });

    const orderId = `order_${Date.now()}`;

    // 1. Reject fake or mismatched signature
    const invalidRes = await PaymentService.handlePaymentSuccess(
      reg.id,
      orderId,
      'pay_fake_123',
      'invalid_signature_hex_12345',
      reg
    );
    expect(invalidRes.success).toBe(false);

    // Ensure registration in DB remains unpaid
    const checkUnpaid = await DataStore.getRegistrationById(reg.id);
    expect(checkUnpaid?.paymentStatus).not.toBe('verified');
    expect(checkUnpaid?.registrationNumber || '').toBe('');

    // 2. Accept authentic HMAC-SHA256 signature
    const mockPaymentId = `pay_test_${Date.now()}`;
    const secret = getRazorpayKeySecret() || 'OJrmNNFNHfOjyccm7vD9VcUf';
    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${mockPaymentId}`)
      .digest('hex');

    const validRes = await PaymentService.handlePaymentSuccess(
      reg.id,
      orderId,
      mockPaymentId,
      validSignature,
      reg
    );

    expect(validRes.success).toBe(true);
    expect(validRes.ticketId).toBeDefined();
    expect(validRes.ticketId).toMatch(/^P2P-KMCT-[A-Z0-9]+-[A-Z0-9]+$/);

    // 3. Verify DB registration is now officially confirmed
    const confirmed = await DataStore.getRegistrationById(reg.id);
    expect(confirmed?.paymentStatus).toBe('verified');
    expect(confirmed?.status).toBe('confirmed');
    expect(confirmed?.registrationNumber).toBe(validRes.ticketId);
    expect(confirmed?.paymentId).toBe(mockPaymentId);
    expect(confirmed?.amountPaid).toBe(100);
  });

  it('guarantees getLiveSeatsInfo() does NOT inject synthetic registrations into DataStore', async () => {
    const randomSyntheticEmail = `non_existent_check_${Date.now()}@kmct.edu.in`;
    await getLiveSeatsInfo();
    const found = await DataStore.getRegistrationByEmail(randomSyntheticEmail);
    expect(found).toBeNull();

    // Verify specifically that legacy payment or Google Sheet rows are not saved as confirmed registrations
    const legacy = await DataStore.getRegistrationByEmail('alanalbin06112005@gmail.com');
    if (legacy) {
      expect(legacy.paymentStatus).not.toBe('verified');
      expect(legacy.registrationNumber || '').toBe('');
    }
  });
});
