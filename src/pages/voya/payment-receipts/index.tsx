import {
  DisconnectOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  LinkOutlined,
  RollbackOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useModel } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  DatePicker,
  Descriptions,
  Drawer,
  Dropdown,
  Form,
  Modal,
  Select,
  Space,
  Table,
  Tooltip,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  DataCard,
  defaultTablePagination,
  FilterCard,
  LocalizedDateTime,
} from '../components';
import { type VehiclePaymentMethod, vehicleOrders } from '../mockData';
import { ReceiptBindingHistoryPopover } from '../ReceiptBindingHistoryPopover';
import { useVoyaPageStyles } from '../styles';
import { type PaymentReceiptRecord, paymentReceipts } from './_mock';
import {
  bindReceiptToOrder,
  canBindReceipt,
  canRefundReceipt,
  canUnbindReceipt,
  markReceiptRefunded,
  unbindReceiptFromOrder,
} from './actions';
import { ReceiptCnyEquivalent } from './CnyEquivalent';
import { filterPaymentReceipts, type PaymentReceiptFilters } from './filters';

const paymentMethods: VehiclePaymentMethod[] = [
  'creditCard',
  'digitalWallet',
  'bankTransfer',
];
const currencies = Array.from(
  new Set(paymentReceipts.map((record) => record.currency)),
).sort();

type ReceiptActionKey = 'unbind' | 'bind' | 'refund' | 'details';
type BindOrderFormValues = { orderId?: string };

export default function PaymentReceiptsPage() {
  const [receipts, setReceipts] = useState(paymentReceipts);
  const [filters, setFilters] = useState<PaymentReceiptFilters>({});
  const [selectedReceipt, setSelectedReceipt] =
    useState<PaymentReceiptRecord>();
  const [bindingReceipt, setBindingReceipt] = useState<PaymentReceiptRecord>();
  const [bindingOrderId, setBindingOrderId] = useState<string>();
  const [form] = Form.useForm<PaymentReceiptFilters>();
  const [bindForm] = Form.useForm<BindOrderFormValues>();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { message, modal } = App.useApp();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });
  const filteredReceipts = filterPaymentReceipts(receipts, filters);

  const formatAmount = (receipt: PaymentReceiptRecord) =>
    `${intl.formatNumber(receipt.amount, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${receipt.currency}`;

  const formatProcessingFee = (receipt: PaymentReceiptRecord) =>
    `${intl.formatNumber(receipt.processingFee, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} ${receipt.currency}`;

  const openOrder = (orderId: string) => {
    setSelectedReceipt(undefined);
    history.push(`/orders/vehicle/${encodeURIComponent(orderId)}`);
  };

  const closeBindOrder = () => {
    setBindingReceipt(undefined);
    setBindingOrderId(undefined);
    bindForm.resetFields();
  };

  const openBindOrder = (receipt: PaymentReceiptRecord) => {
    if (!canBindReceipt(receipt)) {
      return;
    }
    setBindingReceipt(receipt);
    setBindingOrderId(undefined);
  };

  const bindOrder = () => {
    if (!bindingReceipt || !bindingOrderId) {
      return;
    }

    const order = vehicleOrders.find(
      (vehicleOrder) => vehicleOrder.id === bindingOrderId,
    );
    if (!order) {
      return;
    }

    const operatedAt = dayjs().format('YYYY-MM-DD HH:mm');
    const operator =
      initialState?.currentUser?.name ?? t('voya.receipt.operator.system');
    setReceipts((currentReceipts) =>
      currentReceipts.map((currentReceipt) =>
        currentReceipt.id === bindingReceipt.id
          ? bindReceiptToOrder(currentReceipt, order, operatedAt, operator)
          : currentReceipt,
      ),
    );
    message.success(
      intl.formatMessage(
        { id: 'voya.receipt.action.bindSuccess' },
        { orderId: order.id },
      ),
    );
    closeBindOrder();
  };

  const confirmUnbind = (receipt: PaymentReceiptRecord) => {
    if (!receipt.orderId) {
      return;
    }

    const boundOrderId = receipt.orderId;
    modal.confirm({
      title: t('voya.receipt.action.unbindConfirmTitle'),
      content: intl.formatMessage(
        { id: 'voya.receipt.action.unbindDescription' },
        {
          transactionId: receipt.transactionId,
          orderId: boundOrderId,
        },
      ),
      icon: <ExclamationCircleOutlined />,
      okText: t('voya.receipt.action.unbindConfirm'),
      cancelText: t('voya.common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => {
        setReceipts((currentReceipts) =>
          currentReceipts.map((currentReceipt) =>
            currentReceipt.id === receipt.id
              ? unbindReceiptFromOrder(currentReceipt)
              : currentReceipt,
          ),
        );
        setSelectedReceipt((currentReceipt) =>
          currentReceipt?.id === receipt.id
            ? unbindReceiptFromOrder(currentReceipt)
            : currentReceipt,
        );
        message.success(t('voya.receipt.action.unbindSuccess'));
      },
    });
  };

  const confirmRefund = (receipt: PaymentReceiptRecord) => {
    if (!canRefundReceipt(receipt)) {
      return;
    }

    modal.confirm({
      title: t('voya.receipt.action.refundConfirmTitle'),
      content: intl.formatMessage(
        { id: 'voya.receipt.action.refundDescription' },
        {
          transactionId: receipt.transactionId,
          amount: formatAmount(receipt),
        },
      ),
      icon: <ExclamationCircleOutlined />,
      okText: t('voya.receipt.action.refundConfirm'),
      cancelText: t('voya.common.cancel'),
      okButtonProps: { danger: true },
      onOk: () => {
        const refundedAt = dayjs().format('YYYY-MM-DD HH:mm');
        setReceipts((currentReceipts) =>
          currentReceipts.map((currentReceipt) =>
            currentReceipt.id === receipt.id
              ? markReceiptRefunded(currentReceipt, refundedAt)
              : currentReceipt,
          ),
        );
        setSelectedReceipt((currentReceipt) =>
          currentReceipt?.id === receipt.id
            ? markReceiptRefunded(currentReceipt, refundedAt)
            : currentReceipt,
        );
        message.success(t('voya.receipt.action.refundSuccess'));
      },
    });
  };

  const handleReceiptAction = (
    action: ReceiptActionKey,
    receipt: PaymentReceiptRecord,
  ) => {
    if (action === 'unbind') {
      confirmUnbind(receipt);
      return;
    }
    if (action === 'refund') {
      confirmRefund(receipt);
      return;
    }
    if (action === 'bind') {
      openBindOrder(receipt);
      return;
    }
    setSelectedReceipt(receipt);
  };

  const columns: TableColumnsType<PaymentReceiptRecord> = [
    {
      title: t('voya.receipt.amount'),
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 130,
      render: (amount: number) => (
        <Typography.Text strong>
          {intl.formatNumber(amount, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.receipt.currency'),
      dataIndex: 'currency',
      key: 'currency',
      width: 90,
    },
    {
      title: t('voya.receipt.cnyEquivalent'),
      key: 'exchangeRateToCny',
      width: 170,
      render: (_, receipt) => <ReceiptCnyEquivalent {...receipt} />,
    },
    {
      title: t('voya.order.paymentMethod'),
      dataIndex: 'method',
      key: 'method',
      width: 160,
      render: (method: VehiclePaymentMethod) =>
        t(`voya.order.paymentMethod.${method}`),
    },
    {
      title: t('voya.receipt.processingFee'),
      dataIndex: 'processingFee',
      key: 'processingFee',
      align: 'right',
      width: 145,
      render: (_, receipt) => formatProcessingFee(receipt),
    },
    {
      title: t('voya.receipt.paidAt'),
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 190,
      render: (paidAt: string) => <LocalizedDateTime value={paidAt} />,
    },
    {
      title: t('voya.receipt.refundedAt'),
      dataIndex: 'refundedAt',
      key: 'refundedAt',
      width: 190,
      render: (refundedAt?: string) =>
        refundedAt ? (
          <LocalizedDateTime value={refundedAt} />
        ) : (
          <Typography.Text type="secondary">
            {t('voya.common.notAvailable')}
          </Typography.Text>
        ),
    },
    {
      title: t('voya.order.transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 250,
      render: (transactionId: string) => (
        <Typography.Text code copyable={{ text: transactionId }}>
          {transactionId}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.receipt.boundOrder'),
      dataIndex: 'orderId',
      key: 'orderId',
      width: 225,
      render: (orderId: string | undefined, receipt) =>
        orderId ? (
          <span className={styles.receiptBoundOrder}>
            <ReceiptBindingHistoryPopover
              bindingHistory={receipt.bindingHistory}
              orderId={orderId}
            />
            <Button
              className={
                receipt.bindingHistory.length > 0
                  ? styles.receiptReboundOrderLink
                  : undefined
              }
              type="link"
              size="small"
              onClick={() => openOrder(orderId)}
            >
              {orderId}
            </Button>
          </span>
        ) : (
          <Typography.Text type="secondary">
            {t('voya.receipt.unboundOrder')}
          </Typography.Text>
        ),
    },
    {
      title: t('voya.order.orderedAt'),
      dataIndex: 'orderedAt',
      key: 'orderedAt',
      width: 190,
      render: (orderedAt: string) => <LocalizedDateTime value={orderedAt} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      align: 'center',
      fixed: 'right',
      width: 72,
      render: (_, receipt) => (
        <Tooltip title={t('voya.receipt.moreActions')}>
          <Dropdown
            placement="bottomRight"
            trigger={['click']}
            menu={{
              items: [
                {
                  key: 'unbind',
                  icon: <DisconnectOutlined />,
                  label: t('voya.receipt.action.unbind'),
                  disabled: !canUnbindReceipt(receipt),
                },
                ...(canBindReceipt(receipt)
                  ? [
                      {
                        key: 'bind',
                        icon: <LinkOutlined />,
                        label: t('voya.receipt.action.bind'),
                      },
                    ]
                  : []),
                {
                  key: 'refund',
                  icon: <RollbackOutlined />,
                  label: t(
                    canRefundReceipt(receipt)
                      ? 'voya.receipt.action.refund'
                      : 'voya.receipt.action.refunded',
                  ),
                  disabled: !canRefundReceipt(receipt),
                  danger: true,
                },
                {
                  key: 'details',
                  icon: <EyeOutlined />,
                  label: t('voya.receipt.action.details'),
                },
              ],
              onClick: ({ key }) =>
                handleReceiptAction(key as ReceiptActionKey, receipt),
            }}
          >
            <Button
              aria-label={t('voya.receipt.moreActions')}
              icon={<EllipsisOutlined />}
              type="text"
            />
          </Dropdown>
        </Tooltip>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('voya.receipt.title')}
      subTitle={t('voya.receipt.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="info" title={t('voya.receipt.notice')} />
        <FilterCard compact>
          <Form
            className={styles.receiptFilterGrid}
            form={form}
            layout="vertical"
            size="small"
            onFinish={setFilters}
          >
            <Form.Item
              className={styles.receiptFilterDateRange}
              label={t('voya.receipt.paymentTimeRange')}
              name="paidAt"
            >
              <DatePicker.RangePicker
                className={styles.fullWidth}
                format="YYYY-MM-DD HH:mm"
                showTime
              />
            </Form.Item>
            <Form.Item label={t('voya.order.paymentMethod')} name="method">
              <Select
                allowClear
                options={paymentMethods.map((method) => ({
                  value: method,
                  label: t(`voya.order.paymentMethod.${method}`),
                }))}
              />
            </Form.Item>
            <Form.Item label={t('voya.receipt.currency')} name="currency">
              <Select
                allowClear
                options={currencies.map((currency) => ({
                  value: currency,
                  label: currency,
                }))}
              />
            </Form.Item>
            <Form.Item
              className={styles.receiptFilterDateRange}
              label={t('voya.receipt.orderTimeRange')}
              name="orderedAt"
            >
              <DatePicker.RangePicker
                className={styles.fullWidth}
                format="YYYY-MM-DD HH:mm"
                showTime
              />
            </Form.Item>
            <div className={styles.receiptFilterActions}>
              <Space size="small">
                <Button
                  onClick={() => {
                    form.resetFields();
                    setFilters({});
                  }}
                >
                  {t('voya.common.reset')}
                </Button>
                <Button htmlType="submit" type="primary">
                  {t('voya.common.search')}
                </Button>
              </Space>
            </div>
          </Form>
        </FilterCard>
        <DataCard
          title={t('voya.receipt.list')}
          count={filteredReceipts.length}
        >
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 4 } } }}
          >
            <Table<PaymentReceiptRecord>
              columns={columns}
              dataSource={filteredReceipts}
              pagination={defaultTablePagination}
              rowKey="id"
              scroll={{ x: 1900 }}
              size="small"
            />
          </ConfigProvider>
        </DataCard>
      </div>
      <Drawer
        destroyOnHidden
        open={Boolean(selectedReceipt)}
        size={520}
        title={t('voya.receipt.detailsTitle')}
        onClose={() => setSelectedReceipt(undefined)}
      >
        {selectedReceipt ? (
          <Descriptions
            bordered
            column={1}
            size="small"
            items={[
              {
                key: 'transactionId',
                label: t('voya.order.transactionId'),
                children: (
                  <Typography.Text
                    code
                    copyable={{ text: selectedReceipt.transactionId }}
                  >
                    {selectedReceipt.transactionId}
                  </Typography.Text>
                ),
              },
              {
                key: 'amount',
                label: t('voya.receipt.amount'),
                children: formatAmount(selectedReceipt),
              },
              {
                key: 'exchangeRate',
                label: t('voya.receipt.cnyEquivalent'),
                children: <ReceiptCnyEquivalent {...selectedReceipt} />,
              },
              {
                key: 'processingFee',
                label: t('voya.receipt.processingFee'),
                children: formatProcessingFee(selectedReceipt),
              },
              {
                key: 'method',
                label: t('voya.order.paymentMethod'),
                children: t(
                  `voya.order.paymentMethod.${selectedReceipt.method}`,
                ),
              },
              {
                key: 'paidAt',
                label: t('voya.receipt.paidAt'),
                children: <LocalizedDateTime value={selectedReceipt.paidAt} />,
              },
              {
                key: 'refundedAt',
                label: t('voya.receipt.refundedAt'),
                children: selectedReceipt.refundedAt ? (
                  <LocalizedDateTime value={selectedReceipt.refundedAt} />
                ) : (
                  <Typography.Text type="secondary">
                    {t('voya.common.notAvailable')}
                  </Typography.Text>
                ),
              },
              {
                key: 'boundOrder',
                label: t('voya.receipt.boundOrder'),
                children: selectedReceipt.orderId ? (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => openOrder(selectedReceipt.orderId as string)}
                  >
                    {selectedReceipt.orderId}
                  </Button>
                ) : (
                  <Typography.Text type="secondary">
                    {t('voya.receipt.unboundOrder')}
                  </Typography.Text>
                ),
              },
              {
                key: 'orderedAt',
                label: t('voya.order.orderedAt'),
                children: (
                  <LocalizedDateTime value={selectedReceipt.orderedAt} />
                ),
              },
            ]}
          />
        ) : null}
      </Drawer>
      <Modal
        destroyOnHidden
        open={Boolean(bindingReceipt)}
        title={t('voya.receipt.action.bindTitle')}
        okText={t('voya.receipt.action.bindConfirm')}
        cancelText={t('voya.common.cancel')}
        okButtonProps={{ disabled: !bindingOrderId }}
        onCancel={closeBindOrder}
        onOk={bindOrder}
      >
        {bindingReceipt ? (
          <>
            <Typography.Paragraph type="secondary">
              {intl.formatMessage(
                { id: 'voya.receipt.action.bindDescription' },
                { transactionId: bindingReceipt.transactionId },
              )}
            </Typography.Paragraph>
            <Form
              form={bindForm}
              layout="vertical"
              onValuesChange={(_, values: BindOrderFormValues) =>
                setBindingOrderId(values.orderId)
              }
            >
              <Form.Item
                required
                label={t('voya.receipt.action.bindOrderLabel')}
                name="orderId"
                rules={[
                  {
                    required: true,
                    message: t('voya.receipt.action.bindOrderRequired'),
                  },
                ]}
              >
                <Select
                  allowClear
                  showSearch={{ optionFilterProp: 'value' }}
                  options={vehicleOrders.map((order) => ({
                    value: order.id,
                    label: order.id,
                  }))}
                  placeholder={t('voya.receipt.action.bindOrderPlaceholder')}
                />
              </Form.Item>
            </Form>
          </>
        ) : null}
      </Modal>
    </PageContainer>
  );
}
