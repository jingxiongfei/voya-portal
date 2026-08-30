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
    expect(pendingOrder?.paymentDeadline).toBe('2026-08-21 10:02');
    expect(paidAmount).toBeLessThan(pendingDetail?.payment.payableAmount ?? 0);
    expect(pendingDetail?.procurement).toBeUndefined();
    expect(
      pendingDetail?.logs.some((log) => log.action === 'procurementSubmitted'),
    ).toBe(false);
  });

  it('provides procurement and guide quotations for the matching order', () => {
    const matchingOrder = vehicleOrders.find(
      (vehicleOrder) => vehicleOrder.status === 'matching',
    );
    const matchingDetail = matchingOrder
      ? vehicleOrderDetails[matchingOrder.id]
      : undefined;

    expect(matchingDetail?.procurement?.channel).toBe('Voya Direct');
    expect(matchingDetail?.procurement?.purchaseOrderNo).toBe('PO-VD-26082119');
    expect(matchingDetail?.procurement?.guideQuotes).toHaveLength(3);
    expect(
      matchingDetail?.procurement?.guideQuotes.every(
        (quote) =>
          quote.priceCny > 0 &&
          quote.vehicle.registrationNumber.length > 0 &&
          quote.vehicle.brand.length > 0 &&
          quote.vehicle.model.length > 0 &&
          quote.vehicle.seatCount > 0 &&
          quote.vehicle.luggageCount > 0,
      ),
    ).toBe(true);
    expect(
      matchingDetail?.logs.some((log) => log.action === 'procurementSubmitted'),
    ).toBe(true);
  });

  it('provides fulfilled procurement details for travel lifecycle orders', () => {
    const fulfilledStatuses = [
      'pendingTravel',
      'inTravel',
      'completed',
    ] as const;

    for (const status of fulfilledStatuses) {
      const fulfilledOrder = vehicleOrders.find(
        (vehicleOrder) => vehicleOrder.status === status,
      );
      const fulfillment = fulfilledOrder
        ? vehicleOrderDetails[fulfilledOrder.id].procurement?.fulfillment
        : undefined;

      expect(fulfillment?.purchasePriceCny).toBeGreaterThan(0);
      expect(fulfillment?.guide.name.length).toBeGreaterThan(0);
      expect(fulfillment?.guide.serviceRating).toBeGreaterThanOrEqual(0);
      expect(fulfillment?.guide.serviceRating).toBeLessThanOrEqual(5);
      expect(fulfillment?.guide.whatsApp.length).toBeGreaterThan(0);
      expect(fulfillment?.vehicle.photoUrl).toBe(
        '/vehicles/guide-vehicle-v-class.jpg',
      );
      expect(fulfillment?.vehicle.registrationNumber.length).toBeGreaterThan(0);
    }
  });

  it('provides one demo order for every lifecycle status', () => {
    const lifecycleStatuses = [
      'pendingPayment',
      'matching',
      'onHold',
      'unpaid',
      'cancelled',
      'voided',
      'pendingTravel',
      'inTravel',
      'completed',
    ] as const;

    expect(vehicleOrders).toHaveLength(lifecycleStatuses.length);
    for (const status of lifecycleStatuses) {
      expect(
        vehicleOrders.filter((vehicleOrder) => vehicleOrder.status === status),
      ).toHaveLength(1);
    }
  });
});
