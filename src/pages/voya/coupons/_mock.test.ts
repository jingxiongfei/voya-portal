import { describe, expect, it } from 'vitest';
import { coupons, couponUsageRecords } from './_mock';

describe('coupon demo data', () => {
  it('uses unique coupon codes and valid discount values', () => {
    expect(new Set(coupons.map((coupon) => coupon.code)).size).toBe(
      coupons.length,
    );

    for (const coupon of coupons) {
      expect(coupon.value).toBeGreaterThan(0);
      if (coupon.type === 'percentage')
        expect(coupon.value).toBeLessThanOrEqual(100);
      expect(coupon.validFrom <= coupon.validTo).toBe(true);
      expect(coupon.usedCount).toBeLessThanOrEqual(coupon.claimedCount);
      expect(coupon.claimedCount).toBeLessThanOrEqual(coupon.totalLimit);
    }
  });

  it('keeps every usage record linked to an existing coupon', () => {
    const couponIds = new Set(coupons.map((coupon) => coupon.id));
    expect(
      couponUsageRecords.every((record) => couponIds.has(record.couponId)),
    ).toBe(true);
  });
});
