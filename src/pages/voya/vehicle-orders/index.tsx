import { SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Button,
  ConfigProvider,
  DatePicker,
  Form,
  Input,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  DataCard,
  FilterCard,
  LocalizedDateTime,
  RegistrationSourceTag,
} from '../components';
import {
  type RegistrationSource,
  type VehicleOrderRecord,
  vehicleOrders,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type FilterValues = {
  entryChannel?: RegistrationSource;
  procurementChannel?: string;
  orderId?: string;
  customerPhone?: string;
  customerName?: string;
  purchaseOrderNo?: string;
  orderedAt?: [Dayjs, Dayjs];
};
const procurementChannels = Array.from(
  new Set(vehicleOrders.map((order) => order.procurementChannel)),
);

export default function VehicleOrdersPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [form] = Form.useForm<FilterValues>();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });
  const filteredOrders = vehicleOrders.filter((order) => {
    const includes = (value: string, query?: string) =>
      !query || value.toLowerCase().includes(query.trim().toLowerCase());
    const orderedAt = dayjs(order.orderedAt);
    const inRange =
      !filters.orderedAt ||
      (orderedAt.isAfter(filters.orderedAt[0].startOf('day')) &&
        orderedAt.isBefore(filters.orderedAt[1].endOf('day')));
    return (
      (!filters.entryChannel || order.entryChannel === filters.entryChannel) &&
      (!filters.procurementChannel ||
        order.procurementChannel === filters.procurementChannel) &&
      includes(order.id, filters.orderId) &&
      includes(
        `${order.countryCode} ${order.customerPhone}`,
        filters.customerPhone,
      ) &&
      includes(order.customerName, filters.customerName) &&
      includes(order.purchaseOrderNo, filters.purchaseOrderNo) &&
      inRange
    );
  });

  const columns: TableColumnsType<VehicleOrderRecord> = [
    {
      title: t('voya.order.id'),
      dataIndex: 'id',
      fixed: 'left',
      render: (value) => <Typography.Text copyable>{value}</Typography.Text>,
    },
    {
      title: t('voya.order.type'),
      dataIndex: 'orderType',
      width: 90,
      render: (value) => t(`voya.order.type.${value}`),
    },
    {
      title: t('voya.order.entryChannel'),
      dataIndex: 'entryChannel',
      render: (value) => <RegistrationSourceTag source={value} />,
    },
    {
      title: t('voya.order.procurementChannel'),
      dataIndex: 'procurementChannel',
    },
    { title: t('voya.order.customerName'), dataIndex: 'customerName' },
    {
      title: t('voya.order.customerPhone'),
      dataIndex: 'customerPhone',
      render: (value, record) => `${record.countryCode} ${value}`,
    },
    {
      title: t('voya.order.purchaseOrderNo'),
      dataIndex: 'purchaseOrderNo',
      render: (value) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: t('voya.order.thirdPartyOrderNo'),
      dataIndex: 'thirdPartyOrderNo',
      width: 180,
      render: (value) => <Typography.Text code>{value}</Typography.Text>,
    },
    {
      title: t('voya.order.amount'),
      dataIndex: 'amount',
      align: 'right',
      width: 100,
      render: (value) =>
        intl.formatNumber(value, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
    },
    {
      title: t('voya.order.currency'),
      dataIndex: 'currency',
      width: 90,
    },
    {
      title: t('voya.order.orderedAt'),
      dataIndex: 'orderedAt',
      width: 180,
      render: (value) => <LocalizedDateTime value={value} />,
    },
  ];

  return (
    <PageContainer
      title={t('voya.order.title')}
      subTitle={t('voya.order.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.order.notice')} />
        <FilterCard compact>
          <Form
            form={form}
            layout="vertical"
            size="small"
            onFinish={setFilters}
            className={styles.orderFilterGrid}
          >
            <Form.Item name="entryChannel" label={t('voya.order.entryChannel')}>
              <Select
                allowClear
                options={(
                  ['app', 'api', 'partner'] as RegistrationSource[]
                ).map((value) => ({
                  value,
                  label: t(`voya.user.source.${value}`),
                }))}
              />
            </Form.Item>
            <Form.Item
              name="procurementChannel"
              label={t('voya.order.procurementChannel')}
            >
              <Select
                allowClear
                options={procurementChannels.map((value) => ({
                  value,
                  label: value,
                }))}
              />
            </Form.Item>
            <Form.Item name="orderId" label={t('voya.order.id')}>
              <Input allowClear prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item
              name="purchaseOrderNo"
              label={t('voya.order.purchaseOrderNo')}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item name="customerName" label={t('voya.order.customerName')}>
              <Input allowClear />
            </Form.Item>
            <Form.Item
              name="customerPhone"
              label={t('voya.order.customerPhone')}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              name="orderedAt"
              label={t('voya.order.timeRange')}
              className={styles.orderFilterDateRange}
            >
              <DatePicker.RangePicker style={{ width: '100%' }} />
            </Form.Item>
            <div className={styles.compactFilterActions}>
              <Space size="small">
                <Button
                  onClick={() => {
                    form.resetFields();
                    setFilters({});
                  }}
                >
                  {t('voya.common.reset')}
                </Button>
                <Button type="primary" htmlType="submit">
                  {t('voya.common.search')}
                </Button>
              </Space>
            </div>
          </Form>
        </FilterCard>
        <DataCard title={t('voya.order.list')} count={filteredOrders.length}>
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}
          >
            <Table
              rowKey="id"
              rowClassName={styles.clickableRow}
              columns={columns}
              dataSource={filteredOrders}
              onRow={(record) => ({
                'aria-label': `${t('voya.order.detail')}: ${record.id}`,
                role: 'link',
                tabIndex: 0,
                onClick: (event) => {
                  const target = event.target as HTMLElement;
                  if (target.closest('a, button, input, [role="button"]'))
                    return;
                  history.push(
                    `/orders/vehicle/${encodeURIComponent(record.id)}`,
                  );
                },
                onKeyDown: (event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return;
                  event.preventDefault();
                  history.push(
                    `/orders/vehicle/${encodeURIComponent(record.id)}`,
                  );
                },
              })}
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              size="small"
              scroll={{ x: 1510 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>
    </PageContainer>
  );
}
