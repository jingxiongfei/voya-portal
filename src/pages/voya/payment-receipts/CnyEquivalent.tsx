import { useIntl } from '@umijs/max';
import { Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import { useVoyaPageStyles } from '../styles';
import type { PaymentReceiptRecord } from './_mock';

type ReceiptCnyEquivalentProps = Pick<
  PaymentReceiptRecord,
  'amount' | 'currency' | 'exchangeRateReferenceAt' | 'exchangeRateToCny'
>;

export const ReceiptCnyEquivalent = ({
  amount,
  currency,
  exchangeRateReferenceAt,
  exchangeRateToCny,
}: ReceiptCnyEquivalentProps) => {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const parsedReferenceDate = dayjs(exchangeRateReferenceAt.replace(' ', 'T'));
  const referenceDate = parsedReferenceDate.isValid()
    ? intl.formatDate(parsedReferenceDate.toDate(), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      })
    : exchangeRateReferenceAt;
  const convertedAmount = intl.formatMessage(
    { id: 'voya.receipt.cnyConvertedAmount' },
    {
      amount: intl.formatNumber(amount * exchangeRateToCny, {
        style: 'currency',
        currency: 'CNY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    },
  );
  const exchangeRate = intl.formatMessage(
    { id: 'voya.receipt.exchangeRateValue' },
    {
      currency,
      rate: intl.formatNumber(exchangeRateToCny, {
        minimumFractionDigits: 4,
        maximumFractionDigits: 4,
      }),
    },
  );
  const referenceDateLabel = intl.formatMessage(
    { id: 'voya.receipt.exchangeRateReferenceDate' },
    { date: referenceDate },
  );

  return (
    <Tooltip
      title={
        <Space orientation="vertical" size={0}>
          <span>{exchangeRate}</span>
          <span>{referenceDateLabel}</span>
        </Space>
      }
      trigger={['hover', 'focus']}
    >
      <Typography.Text
        aria-label={intl.formatMessage(
          { id: 'voya.receipt.exchangeRateTooltipLabel' },
          {
            amount: convertedAmount,
            rate: exchangeRate,
            referenceDate: referenceDateLabel,
          },
        )}
        className={styles.receiptConvertedAmount}
        tabIndex={0}
      >
        {convertedAmount}
      </Typography.Text>
    </Tooltip>
  );
};
