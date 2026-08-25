import {
  ArrowLeftOutlined,
  CarOutlined,
  CloseCircleOutlined,
  CreditCardOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  MailOutlined,
  PauseCircleOutlined,
  PhoneOutlined,
  ProfileOutlined,
  RollbackOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useParams } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Anchor,
  App,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Flex,
  Popconfirm,
  Space,
  Table,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
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
  type VehiclePaymentRecord,
  vehicleOrderDetails,
  vehicleOrders,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

const actorColor: Record<OrderLogActorType, string> = {
  system: 'default',
  consumer: 'cyan',
  portal: 'blue',
};

const orderStatusColor: Record<VehicleOrderStatus, string> = {
  pendingPayment: 'warning',
  paid: 'success',
};

const stopColor = {
  origin: 'green',
  waypoint: 'blue',
  destination: 'volcano',
} as const;

const DEFAULT_DETAIL_TITLE_STICKY_BOTTOM = 156;
const DETAIL_NAV_HEIGHT = 48;

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const intl = useIntl();
  const { message } = App.useApp();
  const { styles } = useVoyaPageStyles();
  const { token } = theme.useToken();
  const detailHeaderRef = useRef<HTMLDivElement>(null);
  const detailAnchorHostRef = useRef<HTMLDivElement>(null);
  const [detailTitleStickyBottom, setDetailTitleStickyBottom] = useState(
    DEFAULT_DETAIL_TITLE_STICKY_BOTTOM,
  );
  const [isDetailAnchorStuck, setIsDetailAnchorStuck] = useState(false);
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

  const totalPaidAmount = detail.payment.records.reduce(
    (total, paymentRecord) => total + paymentRecord.paidAmount,
    0,
  );

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
      danger: false,
      confirmDanger: false,
    },
    {
      key: 'refund',
      icon: <RollbackOutlined />,
      danger: false,
      confirmDanger: true,
    },
    {
      key: 'cancel',
      icon: <CloseCircleOutlined />,
      danger: true,
      confirmDanger: true,
    },
    {
      key: 'void',
      icon: <StopOutlined />,
      danger: true,
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

  const paymentColumns: TableColumnsType<VehiclePaymentRecord> = [
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
      render: (transactionId: string) => (
        <Typography.Text code copyable={{ text: transactionId }}>
          {transactionId}
        </Typography.Text>
      ),
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
                    <Button danger={action.danger} icon={action.icon}>
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
                <div>
                  <Space size="small" wrap>
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
                  </Space>
                  <Space size="small" wrap>
                    <Tag color={orderStatusColor[order.status]}>
                      {t(`voya.order.status.${order.status}`)}
                    </Tag>
                    {order.status === 'pendingPayment' &&
                    order.paymentTimeRemaining ? (
                      <Typography.Text type="warning">
                        {intl.formatMessage(
                          { id: 'voya.order.paymentTimeRemaining' },
                          { time: order.paymentTimeRemaining },
                        )}
                      </Typography.Text>
                    ) : null}
                    <LocalizedDateTime value={order.orderedAt} />
                  </Space>
                </div>
              </Flex>
              <div className={styles.amountSummary}>
                <Typography.Text type="secondary">
                  {t('voya.order.paidAmount')}
                </Typography.Text>
                <Typography.Text className={styles.amountValue}>
                  {formatAmount(totalPaidAmount)}
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
                  key: 'procurementChannel',
                  label: t('voya.order.procurementChannel'),
                  children: order.procurementChannel,
                },
                {
                  key: 'purchaseOrderNo',
                  label: t('voya.order.purchaseOrderNo'),
                  children: (
                    <Typography.Text
                      code
                      copyable={{ text: order.purchaseOrderNo }}
                    >
                      {order.purchaseOrderNo}
                    </Typography.Text>
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
                <Table<VehiclePaymentRecord>
                  columns={paymentColumns}
                  dataSource={detail.payment.records}
                  pagination={false}
                  rowKey="id"
                  scroll={{ x: 1010 }}
                  size="small"
                />
              </div>

              <div>
                <Typography.Text strong>
                  {t('voya.order.couponUsage')}
                </Typography.Text>
                {detail.payment.coupons.length ? (
                  <Flex vertical gap="small">
                    {detail.payment.coupons.map((coupon) => (
                      <div className={styles.couponRecord} key={coupon.id}>
                        <Space size="small" wrap>
                          <Tag color="blue">{coupon.code}</Tag>
                          <Typography.Text type="success">
                            -
                            {formatAmount(
                              coupon.discountAmount,
                              coupon.currency,
                            )}
                          </Typography.Text>
                        </Space>
                        <LocalizedDateTime value={coupon.usedAt} />
                      </div>
                    ))}
                  </Flex>
                ) : (
                  <Typography.Paragraph type="secondary">
                    {t('voya.order.noCoupon')}
                  </Typography.Paragraph>
                )}
              </div>
            </Flex>
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
    </PageContainer>
  );
}
