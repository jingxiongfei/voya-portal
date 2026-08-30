import {
  ArrowLeftOutlined,
  CarOutlined,
  CheckOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  DollarOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  MailOutlined,
  PauseCircleOutlined,
  PhoneOutlined,
  ProfileOutlined,
  RollbackOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
  WhatsAppOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useModel, useParams } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Anchor,
  App,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Empty,
  Flex,
  Image,
  Modal,
  Popconfirm,
  Rate,
  Select,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { LocalizedDateTime, RegistrationSourceTag } from '../components';
import {
  type OrderContact,
  type OrderLogActorType,
  type RegistrationSource,
  type VehicleOrderStatus,
  vehicleOrderDetails,
  vehicleOrders,
} from '../mockData';
import { paymentReceipts } from '../payment-receipts/_mock';
import { ReceiptBindingHistoryPopover } from '../ReceiptBindingHistoryPopover';
import { useVoyaPageStyles } from '../styles';
import {
  convertCnyToPaymentCurrency,
  getOrderPaymentRecords,
  isReboundPaymentRecord,
  type OrderPaymentRecord,
  rebindReceiptToOrder,
} from './paymentActions';

const actorColor: Record<OrderLogActorType, string> = {
  system: 'default',
  consumer: 'cyan',
  portal: 'blue',
};

const orderStatusColor: Record<VehicleOrderStatus, string> = {
  pendingPayment: 'warning',
  matching: 'processing',
  onHold: 'warning',
  unpaid: 'orange',
  cancelled: 'error',
  voided: 'default',
  pendingTravel: 'blue',
  inTravel: 'cyan',
  completed: 'success',
};

const stopColor = {
  origin: 'green',
  waypoint: 'blue',
  destination: 'volcano',
} as const;

const DEFAULT_DETAIL_TITLE_STICKY_BOTTOM = 156;
const DETAIL_NAV_HEIGHT = 48;

type PaymentDetailRecord =
  | (OrderPaymentRecord & { kind: 'payment' })
  | {
      kind: 'coupon';
      id: string;
      currency: OrderPaymentRecord['currency'];
      method: 'coupon';
      paidAmount: number;
      paidAt: string;
      transactionId: string;
      bindingHistory: [];
    };

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { initialState } = useModel('@@initialState');
  const { message } = App.useApp();
  const { styles } = useVoyaPageStyles();
  const { token } = theme.useToken();
  const detailHeaderRef = useRef<HTMLDivElement>(null);
  const detailAnchorHostRef = useRef<HTMLDivElement>(null);
  const [detailTitleStickyBottom, setDetailTitleStickyBottom] = useState(
    DEFAULT_DETAIL_TITLE_STICKY_BOTTOM,
  );
  const [isDetailAnchorStuck, setIsDetailAnchorStuck] = useState(false);
  const [receipts, setReceipts] = useState(paymentReceipts);
  const [isCollectModalOpen, setIsCollectModalOpen] = useState(false);
  const [isQuoteDrawerOpen, setIsQuoteDrawerOpen] = useState(false);
  const [selectedGuideQuoteId, setSelectedGuideQuoteId] = useState<string>();
  const [selectedTransactionId, setSelectedTransactionId] = useState<string>();
  const t = (messageId: string) => intl.formatMessage({ id: messageId });
  const order = vehicleOrders.find((record) => record.id === id);
  const detail = order ? vehicleOrderDetails[order.id] : undefined;
  const detailSectionTargetOffset = detailTitleStickyBottom + DETAIL_NAV_HEIGHT;

  useEffect(() => {
    const header = detailHeaderRef.current;
    if (!header) {
      return;
    }

    let animationFrame: number | undefined;
    const updateHeaderBottom = () => {
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = undefined;
        setDetailTitleStickyBottom(
          Math.round(header.getBoundingClientRect().bottom),
        );
      });
    };
    const resizeObserver = new ResizeObserver(updateHeaderBottom);

    updateHeaderBottom();
    resizeObserver.observe(header);
    window.addEventListener('resize', updateHeaderBottom);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateHeaderBottom);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [id]);

  useEffect(() => {
    const anchor = detailAnchorHostRef.current?.querySelector<HTMLElement>(
      '.ant-anchor-css-var',
    );
    if (!anchor) {
      return;
    }

    let animationFrame: number | undefined;
    const updateStuckState = () => {
      animationFrame = undefined;
      const isStuck =
        window.scrollY > 0 &&
        anchor.getBoundingClientRect().top <= detailTitleStickyBottom + 0.5;
      setIsDetailAnchorStuck((current) =>
        current === isStuck ? current : isStuck,
      );
    };
    const scheduleUpdate = () => {
      if (animationFrame === undefined) {
        animationFrame = window.requestAnimationFrame(updateStuckState);
      }
    };

    updateStuckState();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrame !== undefined) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [detailTitleStickyBottom, id]);

  useEffect(() => {
    setIsCollectModalOpen(false);
    setIsQuoteDrawerOpen(false);
    setSelectedGuideQuoteId(undefined);
    setSelectedTransactionId(undefined);
  }, [id]);

  if (!order || !detail) {
    return (
      <PageContainer
        title={t('voya.order.detail')}
        onBack={() => history.push('/orders/vehicle')}
      >
        <Card className={styles.surfaceCard}>
          <Empty description={t('voya.order.notFound')}>
            <Button onClick={() => history.push('/orders/vehicle')}>
              {t('voya.common.back')}
            </Button>
          </Empty>
        </Card>
      </PageContainer>
    );
  }

  const formatAmount = (amount: number, currency = order.currency) =>
    intl.formatNumber(amount, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatNumberAmount = (amount: number) =>
    intl.formatNumber(amount, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const paymentRecords = getOrderPaymentRecords(order.id, receipts);
  const paymentDetailRecords: PaymentDetailRecord[] = [
    ...paymentRecords.map((paymentRecord) => ({
      ...paymentRecord,
      kind: 'payment' as const,
    })),
    ...detail.payment.coupons.map((coupon) => ({
      kind: 'coupon' as const,
      id: coupon.id,
      currency: coupon.currency,
      method: 'coupon' as const,
      paidAmount: -coupon.discountAmount,
      paidAt: coupon.usedAt,
      transactionId: coupon.code,
      bindingHistory: [] as [],
    })),
  ].sort((left, right) => right.paidAt.localeCompare(left.paidAt));
  const availableReceipts = receipts.filter(
    (receipt) =>
      !receipt.refundedAt &&
      receipt.currency === order.currency &&
      receipt.orderId !== order.id,
  );
  const selectedReceipt = availableReceipts.find(
    (receipt) => receipt.transactionId === selectedTransactionId,
  );
  const totalPaidAmount = paymentRecords.reduce(
    (total, paymentRecord) => total + paymentRecord.paidAmount,
    0,
  );
  const totalPaidAmountCny = receipts
    .filter((receipt) => receipt.orderId === order.id && !receipt.refundedAt)
    .reduce(
      (total, receipt) => total + receipt.amount * receipt.exchangeRateToCny,
      0,
    );
  const paymentCurrencyExchangeRateToCny =
    totalPaidAmount > 0 ? totalPaidAmountCny / totalPaidAmount : 1;
  const isAwaitingPayment =
    order.status === 'pendingPayment' || order.status === 'unpaid';
  const procurementFulfillment = detail.procurement?.fulfillment;
  const totalProcessingFee = receipts
    .filter((receipt) => receipt.orderId === order.id && !receipt.refundedAt)
    .reduce((total, receipt) => total + (receipt.processingFee ?? 0), 0);
  const convertedProcurementCost = procurementFulfillment
    ? convertCnyToPaymentCurrency(
        procurementFulfillment.purchasePriceCny,
        paymentCurrencyExchangeRateToCny,
      )
    : 0;
  const procurementGrossProfit =
    totalPaidAmount - totalProcessingFee - convertedProcurementCost;

  const closeCollectModal = () => {
    setIsCollectModalOpen(false);
    setSelectedTransactionId(undefined);
  };

  const selectGuideQuote = (quoteId: string, guideName: string) => {
    setSelectedGuideQuoteId(quoteId);
    message.success(
      intl.formatMessage(
        { id: 'voya.order.procurementSelectSuccess' },
        { guide: guideName },
      ),
    );
  };

  const collectPayment = () => {
    if (!selectedReceipt) {
      return;
    }

    const reboundReceipt = rebindReceiptToOrder(
      selectedReceipt,
      order,
      dayjs().format('YYYY-MM-DD HH:mm'),
      initialState?.currentUser?.name ?? t('voya.receipt.operator.system'),
      t('voya.receipt.operator.system'),
    );
    setReceipts((currentReceipts) =>
      currentReceipts.map((receipt) =>
        receipt.id === reboundReceipt.id ? reboundReceipt : receipt,
      ),
    );
    message.success(
      intl.formatMessage(
        { id: 'voya.order.collectSuccess' },
        { transactionId: selectedReceipt.transactionId },
      ),
    );
    closeCollectModal();
  };

  const sectionTitle = (icon: ReactNode, label: string) => (
    <span className={styles.sectionTitle}>
      <span className={styles.sectionIcon}>{icon}</span>
      {label}
    </span>
  );

  const orderActions = [
    {
      key: 'hold',
      icon: <PauseCircleOutlined />,
      confirmDanger: false,
    },
    {
      key: 'refund',
      icon: <RollbackOutlined />,
      confirmDanger: true,
    },
    {
      key: 'cancel',
      icon: <CloseCircleOutlined />,
      confirmDanger: true,
    },
    {
      key: 'void',
      icon: <StopOutlined />,
      confirmDanger: true,
    },
  ] as const;

  const travelerColumns: TableColumnsType<OrderContact> = [
    {
      title: t('voya.order.familyName'),
      dataIndex: 'familyName',
      key: 'familyName',
      width: 150,
    },
    {
      title: t('voya.order.givenName'),
      dataIndex: 'givenName',
      key: 'givenName',
      width: 150,
    },
    {
      title: t('voya.common.phone'),
      key: 'phone',
      width: 230,
      render: (_, traveler) => (
        <Typography.Text
          copyable={{ text: `${traveler.countryCode} ${traveler.phone}` }}
        >
          <PhoneOutlined /> {traveler.countryCode} {traveler.phone}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.common.email'),
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Typography.Text copyable={{ text: email }}>
          <MailOutlined /> {email}
        </Typography.Text>
      ),
    },
  ];

  const paymentColumns: TableColumnsType<PaymentDetailRecord> = [
    {
      title: t('voya.order.paymentCurrency'),
      dataIndex: 'currency',
      key: 'currency',
      width: 160,
    },
    {
      title: t('voya.order.paymentMethod'),
      key: 'method',
      width: 220,
      render: (_, paymentRecord) =>
        t(`voya.order.paymentMethod.${paymentRecord.method}`),
    },
    {
      title: t('voya.order.paidAmount'),
      key: 'paidAmount',
      width: 220,
      align: 'right',
      render: (_, paymentRecord) => (
        <Typography.Text strong>
          {formatNumberAmount(paymentRecord.paidAmount)}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.order.paidAt'),
      dataIndex: 'paidAt',
      key: 'paidAt',
      width: 190,
      render: (paidAt: string) => <LocalizedDateTime value={paidAt} />,
    },
    {
      title: t('voya.order.transactionId'),
      dataIndex: 'transactionId',
      key: 'transactionId',
      width: 360,
      render: (transactionId: string, paymentRecord) => {
        if (paymentRecord.kind === 'coupon') {
          return (
            <Typography.Text code copyable={{ text: transactionId }}>
              {transactionId}
            </Typography.Text>
          );
        }

        const isRebound = isReboundPaymentRecord(paymentRecord, order.id);

        return (
          <Space size="small" wrap>
            <Typography.Text code copyable={{ text: transactionId }}>
              {transactionId}
            </Typography.Text>
            {isRebound ? (
              <>
                <Typography.Text type="secondary">
                  {t('voya.order.paymentReboundSource')}
                </Typography.Text>
                <ReceiptBindingHistoryPopover
                  bindingHistory={paymentRecord.bindingHistory}
                  orderId={order.id}
                />
              </>
            ) : null}
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer
      breadcrumbRender={false}
      pageHeaderRender={() => (
        <div ref={detailHeaderRef} className={styles.detailHeaderShell}>
          <div className={styles.detailPageHeader}>
            <Flex
              align="center"
              className={styles.detailHeaderToolbar}
              gap="small"
              wrap
            >
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => history.push('/orders/vehicle')}
              >
                {t('voya.common.back')}
              </Button>
              <Divider
                className={styles.detailHeaderDivider}
                orientation="vertical"
              />
              <Space size="small" wrap>
                <Button
                  icon={<DollarOutlined />}
                  onClick={() => setIsCollectModalOpen(true)}
                >
                  {t('voya.order.action.collect')}
                </Button>
                {orderActions.map((action) => (
                  <Popconfirm
                    key={action.key}
                    title={t(`voya.order.action.${action.key}ConfirmTitle`)}
                    description={t(
                      `voya.order.action.${action.key}Description`,
                    )}
                    icon={<ExclamationCircleOutlined />}
                    okText={t(
                      action.key === 'void'
                        ? 'voya.order.action.voidConfirm'
                        : `voya.order.action.${action.key}`,
                    )}
                    cancelText={t('voya.common.cancel')}
                    okButtonProps={{ danger: action.confirmDanger }}
                    onConfirm={() =>
                      message.success(
                        t(`voya.order.action.${action.key}Success`),
                      )
                    }
                  >
                    <Button icon={action.icon}>
                      {t(`voya.order.action.${action.key}`)}
                    </Button>
                  </Popconfirm>
                ))}
              </Space>
            </Flex>
            <Typography.Title className={styles.detailHeaderTitle} level={3}>
              {t('voya.order.detail')}
            </Typography.Title>
          </div>
        </div>
      )}
    >
      <div
        className={`${styles.stack} ${styles.detailStack}`}
        style={
          {
            '--voya-detail-section-offset': `${detailSectionTargetOffset}px`,
          } as CSSProperties
        }
      >
        <div ref={detailAnchorHostRef} className={styles.detailAnchorHost}>
          <Anchor
            className={`${styles.detailAnchor} ${
              isDetailAnchorStuck ? styles.detailAnchorStuck : ''
            }`}
            direction="horizontal"
            affix={false}
            replace
            style={{
              insetBlockStart: detailTitleStickyBottom,
              minBlockSize: DETAIL_NAV_HEIGHT,
            }}
            targetOffset={detailSectionTargetOffset}
            items={[
              {
                key: 'order-info',
                href: '#order-info',
                title: t('voya.order.orderInfo'),
              },
              {
                key: 'booker-info',
                href: '#booker-info',
                title: t('voya.order.bookerInfo'),
              },
              {
                key: 'payment-info',
                href: '#payment-info',
                title: t('voya.order.paymentInfo'),
              },
              {
                key: 'procurement-info',
                href: '#procurement-info',
                title: t('voya.order.procurementInfo'),
              },
              {
                key: 'booking-details',
                href: '#booking-details',
                title: t('voya.order.bookingDetails'),
              },
              {
                key: 'traveler-info',
                href: '#traveler-info',
                title: t('voya.order.travelerInfo'),
              },
              {
                key: 'itinerary-info',
                href: '#itinerary-info',
                title: t('voya.order.itineraryInfo'),
              },
              {
                key: 'order-log',
                href: '#order-log',
                title: t('voya.order.orderLog'),
              },
            ]}
          />
        </div>

        <div data-voya-elastic-scroll-region className={styles.stack}>
          <Card className={styles.profileCard}>
            <Flex align="center" justify="space-between" gap="large" wrap>
              <Flex align="center" gap="middle">
                <span className={styles.metricIcon}>
                  <CarOutlined />
                </span>
                <Flex
                  align="center"
                  className={styles.orderSummaryMeta}
                  gap="small"
                  wrap
                >
                  <Typography.Title
                    copyable={{ text: order.id }}
                    level={3}
                    style={{ margin: 0 }}
                  >
                    {order.id}
                  </Typography.Title>
                  <Tag color="blue">
                    {t(`voya.order.type.${order.orderType}`)}
                  </Tag>
                  <Tag color={orderStatusColor[order.status]}>
                    {t(`voya.order.status.${order.status}`)}
                  </Tag>
                  {order.status === 'pendingPayment' &&
                  order.paymentTimeRemaining ? (
                    <Typography.Text strong type="danger">
                      {intl.formatMessage(
                        { id: 'voya.order.paymentTimeRemaining' },
                        { time: order.paymentTimeRemaining },
                      )}
                    </Typography.Text>
                  ) : null}
                  {order.status === 'pendingPayment' &&
                  order.paymentDeadline ? (
                    <Typography.Text type="secondary">
                      {t('voya.order.paymentDeadline')}{' '}
                      <LocalizedDateTime value={order.paymentDeadline} />
                    </Typography.Text>
                  ) : null}
                </Flex>
              </Flex>
              <div className={styles.amountSummary}>
                <Typography.Text type="secondary">
                  {t('voya.order.summaryPayableAmount')}
                </Typography.Text>
                <Typography.Text className={styles.amountValue}>
                  {formatAmount(detail.payment.payableAmount)}
                </Typography.Text>
              </div>
            </Flex>
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="order-info"
            size="small"
            title={sectionTitle(<ProfileOutlined />, t('voya.order.orderInfo'))}
          >
            <Descriptions
              column={{ xs: 1, sm: 2, lg: 3 }}
              size="small"
              items={[
                {
                  key: 'id',
                  label: t('voya.order.id'),
                  children: (
                    <Typography.Text copyable>{order.id}</Typography.Text>
                  ),
                },
                {
                  key: 'orderedAt',
                  label: t('voya.order.orderedAt'),
                  children: <LocalizedDateTime value={order.orderedAt} />,
                },
                {
                  key: 'entryChannel',
                  label: t('voya.order.entryChannel'),
                  children: (
                    <RegistrationSourceTag
                      source={order.entryChannel as RegistrationSource}
                    />
                  ),
                },
                {
                  key: 'thirdPartyOrderNo',
                  label: t('voya.order.thirdPartyOrderNo'),
                  children: (
                    <Typography.Text
                      code
                      copyable={{ text: order.thirdPartyOrderNo }}
                    >
                      {order.thirdPartyOrderNo}
                    </Typography.Text>
                  ),
                },
              ]}
            />
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="booker-info"
            size="small"
            title={sectionTitle(<UserOutlined />, t('voya.order.bookerInfo'))}
          >
            <Descriptions
              column={{ xs: 1, sm: 2, lg: 3 }}
              size="small"
              items={[
                {
                  key: 'userId',
                  label: t('voya.order.bookerUserId'),
                  children: (
                    <Typography.Text copyable>
                      {detail.booker.userId}
                    </Typography.Text>
                  ),
                },
                {
                  key: 'familyName',
                  label: t('voya.order.familyName'),
                  children: detail.booker.familyName,
                },
                {
                  key: 'givenName',
                  label: t('voya.order.givenName'),
                  children: detail.booker.givenName,
                },
                {
                  key: 'phone',
                  label: t('voya.common.phone'),
                  children: (
                    <Typography.Text
                      copyable={{
                        text: `${detail.booker.countryCode} ${detail.booker.phone}`,
                      }}
                    >
                      <PhoneOutlined /> {detail.booker.countryCode}{' '}
                      {detail.booker.phone}
                    </Typography.Text>
                  ),
                },
                {
                  key: 'email',
                  label: t('voya.common.email'),
                  span: 'filled',
                  children: (
                    <Typography.Text copyable={{ text: detail.booker.email }}>
                      <MailOutlined /> {detail.booker.email}
                    </Typography.Text>
                  ),
                },
              ]}
            />
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="payment-info"
            size="small"
            title={sectionTitle(
              <CreditCardOutlined />,
              t('voya.order.paymentInfo'),
            )}
          >
            <Flex vertical gap="middle">
              <Descriptions
                column={{ xs: 1, sm: 2 }}
                size="small"
                items={[
                  {
                    key: 'payableAmount',
                    label: t('voya.order.payableAmount'),
                    children: formatAmount(detail.payment.payableAmount),
                  },
                  {
                    key: 'totalPaidAmount',
                    label: t('voya.order.totalPaidAmount'),
                    children: (
                      <Typography.Text strong>
                        {formatAmount(totalPaidAmount)}
                      </Typography.Text>
                    ),
                  },
                ]}
              />

              <div>
                <Typography.Text strong>
                  {t('voya.order.paymentRecords')}
                </Typography.Text>
                <Table<PaymentDetailRecord>
                  columns={paymentColumns}
                  dataSource={paymentDetailRecords}
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: 1190 }}
                  size="small"
                />
              </div>
            </Flex>
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="procurement-info"
            size="small"
            title={sectionTitle(
              <ShoppingCartOutlined />,
              t('voya.order.procurementInfo'),
            )}
          >
            {isAwaitingPayment ? (
              <Alert
                description={t('voya.order.procurementAwaitingPayment')}
                showIcon
                title={t('voya.order.procurementUnavailableTitle')}
                type="info"
              />
            ) : procurementFulfillment && detail.procurement ? (
              <Flex vertical gap="middle">
                <Descriptions
                  column={{ xs: 1, sm: 2, lg: 4 }}
                  size="small"
                  items={[
                    {
                      key: 'channel',
                      label: t('voya.order.procurementChannel'),
                      children: detail.procurement.channel,
                    },
                    {
                      key: 'purchaseOrderNo',
                      label: t('voya.order.purchaseOrderNo'),
                      children: (
                        <Typography.Text
                          code
                          copyable={{
                            text: detail.procurement.purchaseOrderNo,
                          }}
                        >
                          {detail.procurement.purchaseOrderNo}
                        </Typography.Text>
                      ),
                    },
                    {
                      key: 'purchasePrice',
                      label: t('voya.order.procurementPurchasePrice'),
                      children: formatAmount(
                        procurementFulfillment.purchasePriceCny,
                        'CNY',
                      ),
                    },
                    {
                      key: 'convertedCost',
                      label: intl.formatMessage(
                        { id: 'voya.order.procurementConvertedCost' },
                        { currency: order.currency },
                      ),
                      children: formatAmount(convertedProcurementCost),
                    },
                  ]}
                />

                <fieldset
                  aria-label={intl.formatMessage(
                    { id: 'voya.order.procurementFormulaAria' },
                    {
                      grossProfit: formatAmount(procurementGrossProfit),
                      paidAmount: formatAmount(totalPaidAmount),
                      fee: formatAmount(totalProcessingFee),
                      cost: formatAmount(convertedProcurementCost),
                    },
                  )}
                  className={styles.procurementFormula}
                >
                  <div className={styles.procurementFormulaTerm}>
                    <Typography.Text type="secondary">
                      {t('voya.order.procurementGrossProfit')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatAmount(procurementGrossProfit)}
                    </Typography.Text>
                  </div>
                  <Typography.Text
                    className={styles.procurementFormulaOperator}
                  >
                    =
                  </Typography.Text>
                  <div className={styles.procurementFormulaTerm}>
                    <Typography.Text type="secondary">
                      {t('voya.order.procurementUserPaid')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatAmount(totalPaidAmount)}
                    </Typography.Text>
                  </div>
                  <Typography.Text
                    className={styles.procurementFormulaOperator}
                  >
                    −
                  </Typography.Text>
                  <div className={styles.procurementFormulaTerm}>
                    <Typography.Text type="secondary">
                      {t('voya.order.procurementPaymentFee')}
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatAmount(totalProcessingFee)}
                    </Typography.Text>
                  </div>
                  <Typography.Text
                    className={styles.procurementFormulaOperator}
                  >
                    −
                  </Typography.Text>
                  <div className={styles.procurementFormulaTerm}>
                    <Typography.Text type="secondary">
                      {intl.formatMessage(
                        { id: 'voya.order.procurementConvertedCost' },
                        { currency: order.currency },
                      )}
                    </Typography.Text>
                    <Typography.Text strong>
                      {formatAmount(convertedProcurementCost)}
                    </Typography.Text>
                  </div>
                </fieldset>

                <section className={styles.procurementSubsection}>
                  <div className={styles.procurementSubsectionHeader}>
                    {sectionTitle(
                      <UserOutlined />,
                      t('voya.order.procurementGuideProfile'),
                    )}
                  </div>
                  <div className={styles.procurementSubsectionBody}>
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 2, lg: 4 }}
                      layout="vertical"
                      size="small"
                      items={[
                        {
                          key: 'guideName',
                          label: t('voya.order.procurementGuideName'),
                          children: procurementFulfillment.guide.name,
                        },
                        {
                          key: 'guideAge',
                          label: t('voya.order.procurementGuideAge'),
                          children: intl.formatMessage(
                            { id: 'voya.order.procurementGuideAgeValue' },
                            { age: procurementFulfillment.guide.age },
                          ),
                        },
                        {
                          key: 'guideGender',
                          label: t('voya.order.procurementGuideGender'),
                          children: t(
                            `voya.user.gender.${procurementFulfillment.guide.gender}`,
                          ),
                        },
                        {
                          key: 'guideNationality',
                          label: t('voya.order.procurementGuideNationality'),
                          children: procurementFulfillment.guide.nationality,
                        },
                        {
                          key: 'guideRating',
                          label: t('voya.order.procurementGuideRating'),
                          span: { xs: 1, sm: 2, lg: 2 },
                          children: (
                            <Space size="small">
                              <Rate
                                allowHalf
                                character={<StarOutlined />}
                                disabled
                                size="small"
                                value={
                                  procurementFulfillment.guide.serviceRating
                                }
                              />
                              <Typography.Text strong>
                                {intl.formatNumber(
                                  procurementFulfillment.guide.serviceRating,
                                  {
                                    minimumFractionDigits: 1,
                                    maximumFractionDigits: 1,
                                  },
                                )}
                              </Typography.Text>
                            </Space>
                          ),
                        },
                        {
                          key: 'guidePhone',
                          label: t('voya.order.procurementGuidePhone'),
                          children: (
                            <Typography.Text
                              copyable={{
                                text: `${procurementFulfillment.guide.countryCode} ${procurementFulfillment.guide.phone}`,
                              }}
                            >
                              <PhoneOutlined />{' '}
                              {procurementFulfillment.guide.countryCode}{' '}
                              {procurementFulfillment.guide.phone}
                            </Typography.Text>
                          ),
                        },
                        {
                          key: 'guideWhatsApp',
                          label: t('voya.order.procurementGuideWhatsApp'),
                          children: (
                            <Typography.Text
                              copyable={{
                                text: procurementFulfillment.guide.whatsApp,
                              }}
                            >
                              <WhatsAppOutlined />{' '}
                              {procurementFulfillment.guide.whatsApp}
                            </Typography.Text>
                          ),
                        },
                      ]}
                    />
                  </div>
                </section>

                <section className={styles.procurementSubsection}>
                  <div className={styles.procurementSubsectionHeader}>
                    {sectionTitle(
                      <CarOutlined />,
                      t('voya.order.procurementVehicleInfo'),
                    )}
                  </div>
                  <div
                    className={`${styles.procurementSubsectionBody} ${styles.procurementVehicleLayout}`}
                  >
                    <figure className={styles.procurementVehicleFigure}>
                      <Image
                        alt={intl.formatMessage(
                          { id: 'voya.order.procurementVehiclePhotoAlt' },
                          {
                            model: `${procurementFulfillment.vehicle.brand} ${procurementFulfillment.vehicle.model}`,
                            registrationNumber:
                              procurementFulfillment.vehicle.registrationNumber,
                          },
                        )}
                        height={148}
                        preview={{ focusTrap: true }}
                        src={procurementFulfillment.vehicle.photoUrl}
                        styles={{ image: { objectFit: 'cover' } }}
                        width={232}
                      />
                      <figcaption>
                        <Typography.Text type="secondary">
                          {t('voya.order.procurementVehiclePreviewHint')}
                        </Typography.Text>
                      </figcaption>
                    </figure>
                    <Descriptions
                      bordered
                      className={styles.procurementVehicleDetails}
                      column={{ xs: 1, sm: 2 }}
                      layout="vertical"
                      size="small"
                      items={[
                        {
                          key: 'vehicleModel',
                          label: t('voya.order.procurementVehicleModel'),
                          children: `${procurementFulfillment.vehicle.brand} ${procurementFulfillment.vehicle.model}`,
                        },
                        {
                          key: 'vehicleRegistration',
                          label: t('voya.order.procurementVehicleRegistration'),
                          children: (
                            <Typography.Text
                              code
                              copyable={{
                                text: procurementFulfillment.vehicle
                                  .registrationNumber,
                              }}
                            >
                              {
                                procurementFulfillment.vehicle
                                  .registrationNumber
                              }
                            </Typography.Text>
                          ),
                        },
                        {
                          key: 'vehicleSeats',
                          label: t('voya.order.procurementVehicleSeats'),
                          children: intl.formatMessage(
                            { id: 'voya.order.procurementSeatCount' },
                            { count: procurementFulfillment.vehicle.seatCount },
                          ),
                        },
                        {
                          key: 'vehicleLuggage',
                          label: t('voya.order.procurementVehicleLuggage'),
                          children: intl.formatMessage(
                            { id: 'voya.order.procurementLuggageCount' },
                            {
                              count:
                                procurementFulfillment.vehicle.luggageCount,
                            },
                          ),
                        },
                      ]}
                    />
                  </div>
                </section>
              </Flex>
            ) : detail.procurement ? (
              <Descriptions
                column={{ xs: 1, sm: 2, lg: 3 }}
                size="small"
                items={[
                  {
                    key: 'channel',
                    label: t('voya.order.procurementChannel'),
                    children: detail.procurement.channel,
                  },
                  {
                    key: 'purchaseOrderNo',
                    label: t('voya.order.purchaseOrderNo'),
                    children: (
                      <Typography.Text
                        code
                        copyable={{ text: detail.procurement.purchaseOrderNo }}
                      >
                        {detail.procurement.purchaseOrderNo}
                      </Typography.Text>
                    ),
                  },
                  {
                    key: 'status',
                    label: t('voya.order.procurementStatus'),
                    children: (
                      <Space size="small" wrap>
                        <Tag color="processing">
                          {t('voya.order.status.matching')}
                        </Tag>
                        <Button
                          onClick={() => setIsQuoteDrawerOpen(true)}
                          size="small"
                        >
                          {intl.formatMessage(
                            { id: 'voya.order.procurementQuoteCount' },
                            {
                              count: detail.procurement.guideQuotes.length,
                            },
                          )}
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            ) : (
              <Alert
                description={intl.formatMessage(
                  { id: 'voya.order.procurementUnavailableForStatus' },
                  { status: t(`voya.order.status.${order.status}`) },
                )}
                showIcon
                title={t('voya.order.procurementUnavailableTitle')}
                type="info"
              />
            )}
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="booking-details"
            size="small"
            title={sectionTitle(
              <CarOutlined />,
              t('voya.order.bookingDetails'),
            )}
          >
            <Descriptions
              column={{ xs: 1, sm: 2, lg: 4 }}
              size="small"
              items={[
                {
                  key: 'serviceType',
                  label: t('voya.order.serviceType'),
                  children: t(
                    `voya.order.serviceType.${detail.booking.serviceType}`,
                  ),
                },
                {
                  key: 'city',
                  label: t('voya.order.serviceCity'),
                  children: detail.booking.city,
                },
                {
                  key: 'startDate',
                  label: t('voya.order.startDate'),
                  children: (
                    <LocalizedDateTime
                      dateOnly
                      value={detail.booking.startDate}
                    />
                  ),
                },
                {
                  key: 'endDate',
                  label: t('voya.order.endDate'),
                  children: (
                    <LocalizedDateTime
                      dateOnly
                      value={detail.booking.endDate}
                    />
                  ),
                },
                {
                  key: 'departureTime',
                  label: t('voya.order.departureTime'),
                  children: detail.booking.departureTime,
                },
                {
                  key: 'vehicleCategory',
                  label: t('voya.order.vehicleCategory'),
                  children: t(
                    `voya.order.vehicleCategory.${detail.booking.vehicleCategory}`,
                  ),
                },
                {
                  key: 'travelerCount',
                  label: t('voya.order.travelerCount'),
                  children: intl.formatNumber(detail.booking.travelerCount),
                },
                {
                  key: 'luggageCount',
                  label: t('voya.order.luggageCount'),
                  children: intl.formatNumber(detail.booking.luggageCount),
                },
              ]}
            />
          </Card>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="traveler-info"
            size="small"
            title={sectionTitle(<TeamOutlined />, t('voya.order.travelerInfo'))}
          >
            <Table<OrderContact>
              columns={travelerColumns}
              dataSource={detail.travelers}
              pagination={false}
              rowKey="userId"
              scroll={{ x: 760 }}
              size="small"
            />
          </Card>

          <div className={styles.detailSection} id="itinerary-info">
            <Collapse
              className={styles.surfaceCard}
              defaultActiveKey={[]}
              expandIconPlacement="end"
              items={[
                {
                  key: 'itinerary',
                  styles: {
                    header: {
                      background: token.colorBgContainer,
                    },
                  },
                  label: sectionTitle(
                    <EnvironmentOutlined />,
                    t('voya.order.itineraryInfo'),
                  ),
                  children: (
                    <Timeline
                      titleSpan={4}
                      variant="outlined"
                      items={detail.itinerary.map((day, index) => ({
                        key: day.id,
                        color: 'blue',
                        title: (
                          <Typography.Text strong>
                            {intl.formatMessage(
                              { id: 'voya.order.day' },
                              { day: index + 1 },
                            )}{' '}
                            · <LocalizedDateTime dateOnly value={day.date} />
                          </Typography.Text>
                        ),
                        content: (
                          <div className={styles.routeStops}>
                            {day.stops.map((stop) => (
                              <div className={styles.routeStop} key={stop.id}>
                                <Tag color={stopColor[stop.type]}>
                                  {t(`voya.order.stop.${stop.type}`)}
                                </Tag>
                                <div className={styles.routeStopBody}>
                                  <Typography.Text>{stop.name}</Typography.Text>
                                  {stop.time ? (
                                    <Typography.Text type="secondary">
                                      {stop.time}
                                    </Typography.Text>
                                  ) : null}
                                </div>
                              </div>
                            ))}
                          </div>
                        ),
                      }))}
                    />
                  ),
                },
              ]}
              size="small"
            />
          </div>

          <Card
            className={`${styles.surfaceCard} ${styles.detailSection}`}
            id="order-log"
            size="small"
            title={sectionTitle(<HistoryOutlined />, t('voya.order.orderLog'))}
          >
            <Timeline
              titleSpan={4}
              variant="outlined"
              items={detail.logs.map((log) => ({
                key: log.id,
                color: actorColor[log.actorType],
                title: t(`voya.order.logAction.${log.action}`),
                content: (
                  <Space className={styles.noWrap} size="small">
                    <Tag color={actorColor[log.actorType]}>
                      {t(`voya.order.logActor.${log.actorType}`)}
                    </Tag>
                    <Typography.Text>{log.actorName}</Typography.Text>
                    <LocalizedDateTime value={log.at} />
                  </Space>
                ),
              }))}
            />
          </Card>
        </div>
      </div>

      <Drawer
        closable={{
          'aria-label': t('voya.order.procurementQuoteDrawerClose'),
        }}
        destroyOnHidden
        onClose={() => setIsQuoteDrawerOpen(false)}
        open={isQuoteDrawerOpen}
        size="large"
        styles={{ body: { background: token.colorBgLayout } }}
        title={t('voya.order.procurementQuoteDrawerTitle')}
      >
        <Flex vertical gap="middle">
          <Alert
            description={t('voya.order.procurementPaidCnyDescription')}
            showIcon
            title={intl.formatMessage(
              { id: 'voya.order.procurementPaidCny' },
              { amount: formatAmount(totalPaidAmountCny, 'CNY') },
            )}
            type="success"
          />
          <Flex vertical gap="small">
            {detail.procurement?.guideQuotes.map((quote) => {
              const isSelected = selectedGuideQuoteId === quote.id;
              const quoteInPaymentCurrency = convertCnyToPaymentCurrency(
                quote.priceCny,
                paymentCurrencyExchangeRateToCny,
              );

              return (
                <Card
                  extra={
                    <Button
                      aria-pressed={isSelected}
                      icon={isSelected ? <CheckOutlined /> : undefined}
                      onClick={() =>
                        selectGuideQuote(quote.id, quote.guideName)
                      }
                      size="small"
                    >
                      {t(
                        isSelected
                          ? 'voya.order.procurementQuoteSelected'
                          : 'voya.order.procurementSelectQuote',
                      )}
                    </Button>
                  }
                  key={quote.id}
                  size="small"
                  title={
                    <Space size="small">
                      <TeamOutlined />
                      <Typography.Text strong>
                        {quote.guideName}
                      </Typography.Text>
                    </Space>
                  }
                >
                  <Descriptions
                    column={{ xs: 1, sm: 2 }}
                    size="small"
                    items={[
                      {
                        key: 'guideId',
                        label: t('voya.order.procurementGuideId'),
                        children: (
                          <Typography.Text code copyable>
                            {quote.guideId}
                          </Typography.Text>
                        ),
                      },
                      {
                        key: 'supplierQuote',
                        label: t('voya.order.procurementSupplierQuote'),
                        children: (
                          <Typography.Text strong>
                            {formatAmount(quote.priceCny, 'CNY')}
                          </Typography.Text>
                        ),
                      },
                      {
                        key: 'paymentCurrencyQuote',
                        label: intl.formatMessage(
                          {
                            id: 'voya.order.procurementQuotePaymentCurrency',
                          },
                          { currency: order.currency },
                        ),
                        children: (
                          <Typography.Text strong>
                            {formatAmount(
                              quoteInPaymentCurrency,
                              order.currency,
                            )}
                          </Typography.Text>
                        ),
                      },
                      {
                        key: 'registrationNumber',
                        label: t('voya.order.procurementVehicleRegistration'),
                        children: (
                          <Typography.Text code copyable>
                            {quote.vehicle.registrationNumber}
                          </Typography.Text>
                        ),
                      },
                      {
                        key: 'brand',
                        label: t('voya.order.procurementVehicleBrand'),
                        children: quote.vehicle.brand,
                      },
                      {
                        key: 'model',
                        label: t('voya.order.procurementVehicleModel'),
                        children: quote.vehicle.model,
                      },
                      {
                        key: 'seatCount',
                        label: t('voya.order.procurementVehicleSeats'),
                        children: intl.formatMessage(
                          { id: 'voya.order.procurementSeatCount' },
                          { count: quote.vehicle.seatCount },
                        ),
                      },
                      {
                        key: 'luggageCount',
                        label: t('voya.order.procurementVehicleLuggage'),
                        children: intl.formatMessage(
                          { id: 'voya.order.procurementLuggageCount' },
                          { count: quote.vehicle.luggageCount },
                        ),
                      },
                    ]}
                  />
                </Card>
              );
            })}
          </Flex>
        </Flex>
      </Drawer>

      <Modal
        cancelText={t('voya.common.cancel')}
        destroyOnHidden
        okButtonProps={{ disabled: !selectedReceipt }}
        okText={t('voya.order.collectConfirm')}
        onCancel={closeCollectModal}
        onOk={collectPayment}
        open={isCollectModalOpen}
        title={t('voya.order.collectTitle')}
      >
        <Flex vertical gap="middle">
          <Typography.Paragraph type="secondary">
            {intl.formatMessage(
              { id: 'voya.order.collectDescription' },
              { orderId: order.id },
            )}
          </Typography.Paragraph>
          <Alert
            showIcon
            type="info"
            title={intl.formatMessage(
              { id: 'voya.order.collectCurrencyRule' },
              { currency: order.currency },
            )}
          />
          <Flex vertical gap="small">
            <Typography.Text strong>
              {t('voya.order.collectTransactionLabel')}
            </Typography.Text>
            <Select
              aria-label={t('voya.order.collectTransactionLabel')}
              notFoundContent={t('voya.order.collectNoTransactions')}
              onChange={setSelectedTransactionId}
              options={availableReceipts.map((receipt) => ({
                label: intl.formatMessage(
                  { id: 'voya.order.collectOption' },
                  {
                    transactionId: receipt.transactionId,
                    amount: formatAmount(receipt.amount, receipt.currency),
                    orderId: receipt.orderId ?? t('voya.receipt.unboundOrder'),
                  },
                ),
                value: receipt.transactionId,
              }))}
              placeholder={t('voya.order.collectTransactionPlaceholder')}
              showSearch={{ optionFilterProp: 'label' }}
              value={selectedTransactionId}
            />
          </Flex>
          {selectedReceipt ? (
            <Descriptions
              bordered
              column={1}
              size="small"
              items={[
                {
                  key: 'sourceOrder',
                  label: t('voya.order.collectCurrentOrder'),
                  children:
                    selectedReceipt.orderId ?? t('voya.receipt.unboundOrder'),
                },
                {
                  key: 'amount',
                  label: t('voya.order.collectOriginalAmount'),
                  children: formatAmount(
                    selectedReceipt.amount,
                    selectedReceipt.currency,
                  ),
                },
                {
                  key: 'paidAt',
                  label: t('voya.order.paidAt'),
                  children: (
                    <LocalizedDateTime value={selectedReceipt.paidAt} />
                  ),
                },
              ]}
            />
          ) : null}
        </Flex>
      </Modal>
    </PageContainer>
  );
}
