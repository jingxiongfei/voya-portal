import {
  exchangeRates,
  type VehicleOrderRecord,
  type VehiclePaymentMethod,
  vehicleOrderDetails,
  vehicleOrders,
} from '../mockData';

export type PaymentReceiptRecord = {
  id: string;
  amount: number;
  currency: VehicleOrderRecord['currency'];
  exchangeRateToCny: number;
  exchangeRateReferenceAt: string;
  processingFee: number;
  method: VehiclePaymentMethod;
  paidAt: string;
  refundedAt?: string;
  transactionId: string;
  orderId?: string;
  orderedAt: string;
  lastUnboundOrderId?: string;
  bindingHistory: ReceiptBindingHistoryRecord[];
};

export type ReceiptBindingHistoryRecord = {
  id: string;
  action: 'bind' | 'rebind';
  fromOrderId?: string;
  toOrderId: string;
  operatedAt: string;
  operator: string;
};

const activeUsdToCnyRate =
  exchangeRates.find(
    (rate) =>
      rate.status === 'active' &&
      rate.baseCurrency === 'USD' &&
      rate.quoteCurrency === 'CNY',
  )?.rate ?? 1;

const getExchangeRateToCny = (currency: VehicleOrderRecord['currency']) => {
  if (currency === 'CNY') {
    return 1;
  }
  if (currency === 'USD') {
    return activeUsdToCnyRate;
  }

  const usdToCurrencyRate = exchangeRates.find(
    (rate) =>
      rate.status === 'active' &&
      rate.baseCurrency === 'USD' &&
      rate.quoteCurrency === currency,
  )?.rate;

  return usdToCurrencyRate ? activeUsdToCnyRate / usdToCurrencyRate : 1;
};

const processingFeesByTransaction: Record<string, number> = {
  'PAY-20260821-1038-01': 2.4,
  'PAY-20260821-1038-02': 0.49,
  'PAY-20260821-1031': 6.2,
  'PAY-20260820-0998': 0.5,
  'PAY-20260820-0974': 2.92,
  'PAY-20260820-0951': 98,
  'PAY-20260819-0902': 0.34,
  'PAY-20260819-0896': 5.04,
  'PAY-20260818-0864': 2.65,
  'PAY-20260817-0801': 372,
};

const bindingHistoryByTransaction: Record<
  string,
  ReceiptBindingHistoryRecord[]
> = {
  'PAY-20260819-0902': [
    {
      id: 'binding-PAY-20260819-0902-1',
      action: 'bind',
      toOrderId: 'VO-20260819-0896',
      operatedAt: '2026-08-19 11:18',
      operator: 'Leah Chen',
    },
    {
      id: 'binding-PAY-20260819-0902-2',
      action: 'rebind',
      fromOrderId: 'VO-20260819-0896',
      toOrderId: 'VO-20260818-0864',
      operatedAt: '2026-08-19 11:42',
      operator: 'Daniel Wong',
    },
    {
      id: 'binding-PAY-20260819-0902-3',
      action: 'rebind',
      fromOrderId: 'VO-20260818-0864',
      toOrderId: 'VO-20260819-0902',
      operatedAt: '2026-08-19 12:06',
      operator: 'Nora Liu',
    },
  ],
};

export const paymentReceipts: PaymentReceiptRecord[] = vehicleOrders
  .flatMap((order) =>
    vehicleOrderDetails[order.id].payment.records.map((paymentRecord) => ({
      id: paymentRecord.id,
      amount: paymentRecord.paidAmount,
      currency: paymentRecord.currency,
      exchangeRateToCny: getExchangeRateToCny(paymentRecord.currency),
      exchangeRateReferenceAt: paymentRecord.paidAt,
      processingFee:
        processingFeesByTransaction[paymentRecord.transactionId] ?? 0,
      method: paymentRecord.method,
      paidAt: paymentRecord.paidAt,
      transactionId: paymentRecord.transactionId,
      orderId: order.id,
      orderedAt: order.orderedAt,
      bindingHistory:
        bindingHistoryByTransaction[paymentRecord.transactionId] ?? [],
    })),
  )
  .sort((left, right) => right.paidAt.localeCompare(left.paidAt));
