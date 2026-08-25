import { describe, expect, it } from 'vitest';
import {
  getUserDisplayName,
  getUserEnglishName,
  users,
  vehicleOrderDetails,
  vehicleOrders,
} from './mockData';

describe('consumer user names', () => {
  it('builds the English name from separate given and family names', () => {
    expect(getUserEnglishName(users[0])).toBe('Amelia Watson');
  });

  it('prefers the Chinese name in the Chinese locale', () => {
    expect(getUserDisplayName(users[1], 'zh-CN')).toBe('林知夏');
  });

  it('falls back to the English name when no Chinese name is available', () => {
    expect(getUserDisplayName(users[0], 'zh-CN')).toBe('Amelia Watson');
  });
});

describe('vehicle order details', () => {
  const order = vehicleOrders[0];
  const detail = vehicleOrderDetails[order.id];

  it('keeps payment totals and coupon discounts coherent', () => {
    const couponDiscount = detail.payment.coupons.reduce(
      (total, coupon) => total + coupon.discountAmount,
      0,
    );
    const paidAmount = detail.payment.records.reduce(
      (total, paymentRecord) => total + paymentRecord.paidAmount,
      0,
    );

    expect(detail.payment.payableAmount - couponDiscount).toBe(paidAmount);
  });

  it('keeps every payment linked to its own transaction ID', () => {
    expect(detail.payment.records).toHaveLength(2);
    expect(
      new Set(
        detail.payment.records.map(
          (paymentRecord) => paymentRecord.transactionId,
        ),
      ).size,
    ).toBe(detail.payment.records.length);
  });

  it('keeps traveller totals and itinerary endpoints complete', () => {
    expect(detail.booking.travelerCount).toBe(detail.travelers.length);
    expect(
      detail.itinerary.every(
        (day) =>
          day.stops.some((stop) => stop.type === 'origin') &&
          day.stops.some((stop) => stop.type === 'destination'),
      ),
    ).toBe(true);
  });

  it('keeps pending-payment status consistent with a remaining balance', () => {
    const pendingOrder = vehicleOrders.find(
      (vehicleOrder) => vehicleOrder.status === 'pendingPayment',
    );
    const pendingDetail = pendingOrder
      ? vehicleOrderDetails[pendingOrder.id]
      : undefined;
    const paidAmount =
      pendingDetail?.payment.records.reduce(
        (total, paymentRecord) => total + paymentRecord.paidAmount,
        0,
      ) ?? 0;

    expect(pendingOrder?.paymentTimeRemaining).toBe('23:00');
    expect(paidAmount).toBeLessThan(pendingDetail?.payment.payableAmount ?? 0);
  });
});
