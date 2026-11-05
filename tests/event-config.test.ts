import { describe, it, expect } from 'vitest';
import { DEFAULT_EVENT_CONFIG } from '@/lib/config/event-defaults';

describe('Event Configuration & Safety Rules', () => {
  it('has initial configured fee set to 100 with 10000 paise', () => {
    expect(DEFAULT_EVENT_CONFIG.registrationFee).toBe(100);
    expect(DEFAULT_EVENT_CONFIG.registrationFeePaise).toBe(10000);
  });

  it('accurately specifies workshop parameters', () => {
    expect(DEFAULT_EVENT_CONFIG.officialDiscountFee).toBe(100);
    expect(DEFAULT_EVENT_CONFIG.title).toBe('FROM PROBLEM TO POSSIBILITY');
  });

  it('sets capacity to 70 participants', () => {
    expect(DEFAULT_EVENT_CONFIG.minimumTarget).toBe(70);
    expect(DEFAULT_EVENT_CONFIG.capacity).toBe(70);
  });

  it('specifies confirmed workshop date and coordinator contact', () => {
    expect(DEFAULT_EVENT_CONFIG.date).toBe('11th November 2026');
    expect(DEFAULT_EVENT_CONFIG.localCoordinator?.name).toBe('Mr. Abdul Mujeeb MS');
  });

  it('specifies genuine host institution and official contact', () => {
    expect(DEFAULT_EVENT_CONFIG.hostInstitution).toContain('KMCT');
    expect(DEFAULT_EVENT_CONFIG.locationCity).toBe('Kasaragod');
    expect(DEFAULT_EVENT_CONFIG.officialContact.name).toBe('Mr. Abdul Mujeeb MS');
  });
});
