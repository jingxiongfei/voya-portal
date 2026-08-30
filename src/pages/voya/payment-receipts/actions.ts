import type { VehicleOrderRecord } from '../mockData';
import type { PaymentReceiptRecord } from './_mock';

export const canUnbindReceipt = (
  receipt: Pick<PaymentReceiptRecord, 'orderId'>,
) => Boolean(receipt.orderId);

export const canBindReceipt = (
  receipt: Pick<PaymentReceiptRecord, 'orderId'>,
) => !canUnbindReceipt(receipt);

export const canRefundReceipt = (
  receipt: Pick<PaymentReceiptRecord, 'refundedAt'>,
) => !receipt.refundedAt;

export const bindReceiptToOrder = (
  receipt: PaymentReceiptRecord,
  order: Pick<VehicleOrderRecord, 'id' | 'orderedAt'>,
  operatedAt: string,
  operator: string,
): PaymentReceiptRecord => {
  const isRebinding =
    Boolean(receipt.lastUnboundOrderId) &&
    receipt.lastUnboundOrderId !== order.id;
  const bindingHistory = [
    ...receipt.bindingHistory,
    {
      id: `${receipt.id}-binding-${receipt.bindingHistory.length + 1}`,
      action: isRebinding ? ('rebind' as const) : ('bind' as const),
      fromOrderId: isRebinding ? receipt.lastUnboundOrderId : undefined,
      toOrderId: order.id,
      operatedAt,
      operator,
    },
  ];

  return {
    ...receipt,
    orderId: order.id,
    orderedAt: order.orderedAt,
    lastUnboundOrderId: undefined,
    bindingHistory,
  };
};

export const unbindReceiptFromOrder = (
  receipt: PaymentReceiptRecord,
): PaymentReceiptRecord =>
  receipt.orderId
    ? {
        ...receipt,
        lastUnboundOrderId: receipt.orderId,
        orderId: undefined,
      }
    : receipt;

export const markReceiptRefunded = (
  receipt: PaymentReceiptRecord,
  refundedAt: string,
): PaymentReceiptRecord => ({
  ...receipt,
  refundedAt,
});
