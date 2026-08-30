import type { VehicleOrderRecord, VehiclePaymentRecord } from '../mockData';
import type {
  PaymentReceiptRecord,
  ReceiptBindingHistoryRecord,
} from '../payment-receipts/_mock';
import {
  bindReceiptToOrder,
  unbindReceiptFromOrder,
} from '../payment-receipts/actions';

export type OrderPaymentRecord = VehiclePaymentRecord & {
  bindingHistory: ReceiptBindingHistoryRecord[];
};

export const getOrderPaymentRecords = (
  orderId: string,
  receipts: PaymentReceiptRecord[],
): OrderPaymentRecord[] =>
  receipts
    .filter((receipt) => receipt.orderId === orderId)
    .map((receipt) => ({
      id: receipt.id,
      currency: receipt.currency,
      method: receipt.method,
      paidAmount: receipt.amount,
      paidAt: receipt.paidAt,
      transactionId: receipt.transactionId,
      bindingHistory: receipt.bindingHistory,
    }));

export const rebindReceiptToOrder = (
  receipt: PaymentReceiptRecord,
  order: Pick<VehicleOrderRecord, 'id' | 'orderedAt'>,
  operatedAt: string,
  operator: string,
  originalOperator: string,
): PaymentReceiptRecord => {
  const bindingHistory =
    receipt.bindingHistory.length > 0 || !receipt.orderId
      ? receipt.bindingHistory
      : [
          {
            id: `${receipt.id}-binding-original`,
            action: 'bind' as const,
            toOrderId: receipt.orderId,
            operatedAt: receipt.paidAt,
            operator: originalOperator,
          },
        ];

  return bindReceiptToOrder(
    unbindReceiptFromOrder({ ...receipt, bindingHistory }),
    order,
    operatedAt,
    operator,
  );
};

export const isReboundPaymentRecord = (
  record: OrderPaymentRecord,
  orderId: string,
) =>
  record.bindingHistory.some(
    (historyRecord) =>
      historyRecord.action === 'rebind' && historyRecord.toOrderId === orderId,
  );

export const convertCnyToPaymentCurrency = (
  amountCny: number,
  exchangeRateToCny: number,
) =>
  Number.isFinite(exchangeRateToCny) && exchangeRateToCny > 0
    ? amountCny / exchangeRateToCny
    : amountCny;
