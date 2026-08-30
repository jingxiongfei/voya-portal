import { describe, expect, it } from 'vitest';
import { vehicleOrders } from '../mockData';
import { paymentReceipts } from '../payment-receipts/_mock';
import {
  convertCnyToPaymentCurrency,
  getOrderPaymentRecords,
  isReboundPaymentRecord,
  rebindReceiptToOrder,
} from './paymentActions';

describe('order payment collection', () => {
  const targetOrder = vehicleOrders[0];
  const sourceReceipt = paymentReceipts.find(
    (receipt) => receipt.transactionId === 'PAY-20260820-0974',
  );
  if (!sourceReceipt) {
    throw new Error('Expected the source payment receipt fixture to exist');
  }

  it('moves the transaction while preserving its original amount and paid time', () => {
    const reboundReceipt = rebindReceiptToOrder(
      sourceReceipt,
      targetOrder,
      '2026-08-26 14:30',
      'Nora Liu',
      '系统',
    );

    expect(reboundReceipt).toEqual(
      expect.objectContaining({
        orderId: targetOrder.id,
        amount: sourceReceipt?.amount,
        paidAt: sourceReceipt?.paidAt,
        transactionId: sourceReceipt?.transactionId,
      }),
    );
    expect(reboundReceipt.bindingHistory).toEqual([
      expect.objectContaining({
        action: 'bind',
        toOrderId: sourceReceipt?.orderId,
        operator: '系统',
      }),
      expect.objectContaining({
        action: 'rebind',
        fromOrderId: sourceReceipt?.orderId,
        toOrderId: targetOrder.id,
        operatedAt: '2026-08-26 14:30',
        operator: 'Nora Liu',
      }),
    ]);
  });

  it('adds the moved amount to the target order total and marks it as rebound', () => {
    const currentTotal = getOrderPaymentRecords(
      targetOrder.id,
      paymentReceipts,
    ).reduce((total, record) => total + record.paidAmount, 0);
    const reboundReceipt = rebindReceiptToOrder(
      sourceReceipt,
      targetOrder,
      '2026-08-26 14:30',
      'Nora Liu',
      '系统',
    );
    const updatedReceipts = paymentReceipts.map((receipt) =>
      receipt.id === reboundReceipt.id ? reboundReceipt : receipt,
    );
    const updatedRecords = getOrderPaymentRecords(
      targetOrder.id,
      updatedReceipts,
    );
    const updatedTotal = updatedRecords.reduce(
      (total, record) => total + record.paidAmount,
      0,
    );
    const collectedRecord = updatedRecords.find(
      (record) => record.id === reboundReceipt.id,
    );
    if (!collectedRecord) {
      throw new Error('Expected the collected payment record to exist');
    }

    expect(updatedTotal).toBe(currentTotal + sourceReceipt.amount);
    expect(collectedRecord).toEqual(
      expect.objectContaining({
        paidAmount: sourceReceipt?.amount,
        paidAt: sourceReceipt?.paidAt,
      }),
    );
    expect(isReboundPaymentRecord(collectedRecord, targetOrder.id)).toBe(true);
  });

  it('converts a CNY supplier quote into the order payment currency', () => {
    expect(convertCnyToPaymentCurrency(520, 7.1824)).toBeCloseTo(72.4, 2);
    expect(convertCnyToPaymentCurrency(520, 1)).toBe(520);
  });
});
