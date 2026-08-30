import { ArrowRightOutlined, SwapOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Button, Popover, Space, Timeline, Typography } from 'antd';
import { LocalizedDateTime } from './components';
import type { ReceiptBindingHistoryRecord } from './payment-receipts/_mock';
import { useVoyaPageStyles } from './styles';

type ReceiptBindingHistoryPopoverProps = {
  bindingHistory: ReceiptBindingHistoryRecord[];
  orderId: string;
};

export function ReceiptBindingHistoryPopover({
  bindingHistory,
  orderId,
}: ReceiptBindingHistoryPopoverProps) {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  if (bindingHistory.length === 0) {
    return null;
  }

  return (
    <Popover
      destroyOnHidden
      mouseEnterDelay={0.1}
      mouseLeaveDelay={0.2}
      placement="bottomLeft"
      title={intl.formatMessage(
        { id: 'voya.receipt.bindingHistoryTitle' },
        { count: bindingHistory.length },
      )}
      trigger={['hover', 'focus']}
      content={
        <div className={styles.receiptBindingHistory}>
          <Timeline
            reverse
            items={bindingHistory.map((historyRecord) => ({
              key: historyRecord.id,
              content: (
                <div className={styles.receiptBindingHistoryItem}>
                  <div className={styles.receiptBindingHistoryRoute}>
                    {historyRecord.action === 'rebind' ? (
                      <>
                        <Typography.Text>
                          {historyRecord.fromOrderId}
                        </Typography.Text>
                        <ArrowRightOutlined
                          aria-hidden
                          className={styles.receiptBindingHistoryArrow}
                        />
                        <Typography.Text strong>
                          {historyRecord.toOrderId}
                        </Typography.Text>
                      </>
                    ) : (
                      <>
                        <Typography.Text strong>
                          {t('voya.receipt.originalOrder')}
                        </Typography.Text>
                        <Typography.Text>
                          {historyRecord.toOrderId}
                        </Typography.Text>
                      </>
                    )}
                  </div>
                  <div className={styles.receiptBindingHistoryMeta}>
                    <Space size="small">
                      <Typography.Text type="secondary">
                        {t('voya.receipt.operator')}
                      </Typography.Text>
                      <Typography.Text>
                        {historyRecord.operator}
                      </Typography.Text>
                    </Space>
                    <LocalizedDateTime value={historyRecord.operatedAt} />
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      }
    >
      <Button
        aria-label={intl.formatMessage(
          { id: 'voya.receipt.viewBindingHistory' },
          { orderId, count: bindingHistory.length },
        )}
        className={styles.receiptRebindingButton}
        icon={<SwapOutlined />}
        size="small"
        type="text"
      />
    </Popover>
  );
}
