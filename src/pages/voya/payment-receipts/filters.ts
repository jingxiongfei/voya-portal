import dayjs, { type Dayjs } from 'dayjs';
import type { VehiclePaymentMethod } from '../mockData';
import type { PaymentReceiptRecord } from './_mock';

export type PaymentReceiptFilters = {
  paidAt?: [Dayjs, Dayjs];
  method?: VehiclePaymentMethod;
  currency?: PaymentReceiptRecord['currency'];
  orderedAt?: [Dayjs, Dayjs];
};

const isWithinRange = (value: string, range?: [Dayjs, Dayjs]) => {
  if (!range) return true;

  const dateTime = dayjs(value.replace(' ', 'T'));
  return !dateTime.isBefore(range[0]) && !dateTime.isAfter(range[1]);
};

export const filterPaymentReceipts = (
  records: PaymentReceiptRecord[],
  filters: PaymentReceiptFilters,
) =>
  records.filter(
    (record) =>
      (!filters.method || record.method === filters.method) &&
      (!filters.currency || record.currency === filters.currency) &&
      isWithinRange(record.paidAt, filters.paidAt) &&
      isWithinRange(record.orderedAt, filters.orderedAt),
  );
