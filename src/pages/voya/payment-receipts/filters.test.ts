import dayjs from 'dayjs';
import { describe, expect, it } from 'vitest';
import { vehicleOrders } from '../mockData';
import { paymentReceipts } from './_mock';
import {
  bindReceiptToOrder,
  canBindReceipt,
  canRefundReceipt,
  canUnbindReceipt,
  markReceiptRefunded,
  unbindReceiptFromOrder,
} from './actions';
import { filterPaymentReceipts } from './filters';

describe('payment receipt records', () => {
  it('keeps every transaction unique and linked to an order', () => {
    const orderIds = new Set(vehicleOrders.map((order) => order.id));

    expect(paymentReceipts.length).toBeGreaterThan(vehicleOrders.length);
    expect(
      new Set(paymentReceipts.map((record) => record.transactionId)).size,
    ).toBe(paymentReceipts.length);
    expect(
      paymentReceipts.every(
        (record) =>
          record.orderId !== undefined &&
          orderIds.has(record.orderId) &&
          !dayjs(record.paidAt.replace(' ', 'T')).isBefore(
            dayjs(record.orderedAt.replace(' ', 'T')),
          ),
      ),
    ).toBe(true);
  });

  it('contains multiple payment methods and currencies for filtering', () => {
    expect(new Set(paymentReceipts.map((record) => record.method)).size).toBe(
      3,
    );
    expect(
      new Set(paymentReceipts.map((record) => record.currency)).size,
    ).toBeGreaterThan(1);
  });

  it('provides a CNY conversion rate, reference date and payment fee', () => {
    expect(
      paymentReceipts.every(
        (record) =>
          record.exchangeRateToCny > 0 &&
          record.processingFee >= 0 &&
          dayjs(record.exchangeRateReferenceAt.replace(' ', 'T')).isValid() &&
          dayjs(record.exchangeRateReferenceAt.replace(' ', 'T')).isSame(
            dayjs(record.paidAt.replace(' ', 'T')),
            'day',
          ),
      ),
    ).toBe(true);
    expect(
      paymentReceipts.find((record) => record.currency === 'CNY')
        ?.exchangeRateToCny,
    ).toBe(1);
  });

  it('includes a demo rebinding record for reviewing the history UI', () => {
    const reboundReceipt = paymentReceipts.find(
      (record) => record.transactionId === 'PAY-20260819-0902',
    );

    expect(reboundReceipt?.bindingHistory).toEqual([
      expect.objectContaining({
        fromOrderId: 'VO-20260819-0886',
        toOrderId: 'VO-20260819-0902',
      }),
    ]);
  });
});

describe('payment receipt filters', () => {
  it('filters by payment method and currency', () => {
    const results = filterPaymentReceipts(paymentReceipts, {
      method: 'digitalWallet',
      currency: 'USD',
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (record) =>
          record.method === 'digitalWallet' && record.currency === 'USD',
      ),
    ).toBe(true);
  });

  it('filters payment time and order time independently', () => {
    const results = filterPaymentReceipts(paymentReceipts, {
      paidAt: [dayjs('2026-08-21 09:34'), dayjs('2026-08-21 09:36')],
      orderedAt: [dayjs('2026-08-21 09:30'), dayjs('2026-08-21 09:33')],
    });

    expect(results.map((record) => record.transactionId)).toEqual([
      'PAY-20260821-1038-02',
    ]);
  });
});

describe('payment receipt actions', () => {
  it('enables unlink only while a transaction is linked to an order', () => {
    expect(canUnbindReceipt(paymentReceipts[0])).toBe(true);
    expect(
      canUnbindReceipt({ ...paymentReceipts[0], orderId: undefined }),
    ).toBe(false);
  });

  it('enables binding only for an unlinked transaction', () => {
    expect(canBindReceipt(paymentReceipts[0])).toBe(false);
    expect(canBindReceipt({ ...paymentReceipts[0], orderId: undefined })).toBe(
      true,
    );
  });

  it('updates the linked order and its order time together', () => {
    const targetOrder = vehicleOrders[1];
    const unboundReceipt = unbindReceiptFromOrder(paymentReceipts[0]);
    const result = bindReceiptToOrder(
      unboundReceipt,
      targetOrder,
      '2026-08-23 11:00',
    );

    expect(result.orderId).toBe(targetOrder.id);
    expect(result.orderedAt).toBe(targetOrder.orderedAt);
    expect(result.lastUnboundOrderId).toBeUndefined();
    expect(result.bindingHistory.at(-1)).toEqual(
      expect.objectContaining({
        fromOrderId: paymentReceipts[0].orderId,
        toOrderId: targetOrder.id,
        reboundAt: '2026-08-23 11:00',
      }),
    );
  });

  it('does not mark a first-time binding as a rebinding', () => {
    const targetOrder = vehicleOrders[1];
    const result = bindReceiptToOrder(
      {
        ...paymentReceipts[0],
        orderId: undefined,
        lastUnboundOrderId: undefined,
        bindingHistory: [],
      },
      targetOrder,
      '2026-08-23 11:00',
    );

    expect(result.bindingHistory).toEqual([]);
  });

  it('allows one refund and records its refund time', () => {
    const receipt = paymentReceipts[0];
    expect(canRefundReceipt(receipt)).toBe(true);

    const refundedReceipt = markReceiptRefunded(receipt, '2026-08-23 10:30');

    expect(refundedReceipt.refundedAt).toBe('2026-08-23 10:30');
    expect(canRefundReceipt(refundedReceipt)).toBe(false);
  });
});
