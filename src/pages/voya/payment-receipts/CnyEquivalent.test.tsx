import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('@umijs/max', () => ({
  useIntl: () => ({
    formatDate: () => '2026/08/21',
    formatMessage: ({ id }: { id: string }, values: Record<string, string>) => {
      const messages: Record<string, string> = {
        'voya.receipt.cnyConvertedAmount': `折合 ${values.amount}`,
        'voya.receipt.exchangeRateValue': `1 ${values.currency} = ${values.rate} CNY`,
        'voya.receipt.exchangeRateReferenceDate': `汇率参考日期：${values.date}`,
        'voya.receipt.exchangeRateTooltipLabel': `${values.amount}；${values.rate}；${values.referenceDate}`,
      };
      return messages[id] ?? id;
    },
    formatNumber: (
      value: number,
      options?: { style?: string; minimumFractionDigits?: number },
    ) =>
      options?.style === 'currency'
        ? `¥${value.toFixed(2)}`
        : value.toFixed(options?.minimumFractionDigits ?? 0),
  }),
}));

vi.mock('../styles', () => ({
  useVoyaPageStyles: () => ({
    styles: { receiptConvertedAmount: 'receipt-converted-amount' },
  }),
}));

import { ReceiptCnyEquivalent } from './CnyEquivalent';

describe('ReceiptCnyEquivalent', () => {
  it('keeps the rate hidden until the converted amount receives focus', async () => {
    render(
      <ReceiptCnyEquivalent
        amount={48.5}
        currency="USD"
        exchangeRateReferenceAt="2026-08-21 09:35"
        exchangeRateToCny={7.1824}
      />,
    );

    const convertedAmount = screen.getByText('折合 ¥348.35');
    expect(screen.queryByText('1 USD = 7.1824 CNY')).not.toBeInTheDocument();

    fireEvent.focus(convertedAmount);

    expect(await screen.findByText('1 USD = 7.1824 CNY')).toBeInTheDocument();
    expect(screen.getByText('汇率参考日期：2026/08/21')).toBeInTheDocument();
  });
});
