import {
  DeleteOutlined,
  EditOutlined,
  HistoryOutlined,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  ConfigProvider,
  DatePicker,
  Drawer,
  Form,
  Input,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs, { type Dayjs } from 'dayjs';
import { useState } from 'react';
import { DataCard, FilterCard, LocalizedDateTime } from '../components';
import { useVoyaPageStyles } from '../styles';
import {
  type CouponDiscountType,
  type CouponRecord,
  type CouponStatus,
  type CouponUsageRecord,
  type CouponUsageStatus,
  couponUsageRecords,
  coupons as initialCoupons,
} from './_mock';

type FilterValues = {
  keyword?: string;
  status?: CouponStatus;
};

type CouponFormValues = {
  code: string;
  nameZh: string;
  nameEn: string;
  type: CouponDiscountType;
  value: number;
  currency: string;
  minSpend: number;
  totalLimit: number;
  validity: [Dayjs, Dayjs];
  status: CouponStatus;
};

const couponStatuses: CouponStatus[] = [
  'active',
  'scheduled',
  'expired',
  'disabled',
];
const discountTypes: CouponDiscountType[] = ['fixedAmount', 'percentage'];
const currencies = ['USD', 'CNY', 'EUR', 'GBP'];
const demoUpdatedAt = '2026-08-22 10:18';

const statusColor: Record<CouponStatus, string> = {
  active: 'success',
  scheduled: 'processing',
  expired: 'default',
  disabled: 'warning',
};

const usageStatusColor: Record<CouponUsageStatus, string> = {
  applied: 'success',
  refunded: 'default',
};

export default function CouponsPage() {
  const [records, setRecords] = useState(initialCoupons);
  const [filters, setFilters] = useState<FilterValues>({});
  const [editing, setEditing] = useState<CouponRecord | null>(null);
  const [usageCoupon, setUsageCoupon] = useState<CouponRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filterForm] = Form.useForm<FilterValues>();
  const [couponForm] = Form.useForm<CouponFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (messageId: string) => intl.formatMessage({ id: messageId });
  const isChinese = intl.locale.startsWith('zh');

  const statusOptions = couponStatuses.map((value) => ({
    value,
    label: t(`voya.coupon.status.${value}`),
  }));
  const typeOptions = discountTypes.map((value) => ({
    value,
    label: t(`voya.coupon.type.${value}`),
  }));
  const currencyOptions = currencies.map((value) => ({ value, label: value }));

  const filteredRecords = records.filter((record) => {
    const keyword = filters.keyword?.trim().toLowerCase();
    return (
      (!keyword ||
        [record.code, record.nameZh, record.nameEn]
          .join(' ')
          .toLowerCase()
          .includes(keyword)) &&
      (!filters.status || record.status === filters.status)
    );
  });

  const openCouponModal = (record?: CouponRecord) => {
    setEditing(record ?? null);
    couponForm.setFieldsValue(
      record
        ? {
            code: record.code,
            nameZh: record.nameZh,
            nameEn: record.nameEn,
            type: record.type,
            value: record.value,
            currency: record.currency,
            minSpend: record.minSpend,
            totalLimit: record.totalLimit,
            validity: [dayjs(record.validFrom), dayjs(record.validTo)],
            status: record.status,
          }
        : {
            code: '',
            nameZh: '',
            nameEn: '',
            type: 'fixedAmount',
            value: 10,
            currency: 'USD',
            minSpend: 0,
            totalLimit: 1000,
            validity: [dayjs(), dayjs().add(30, 'day')],
            status: 'scheduled',
          },
    );
    setModalOpen(true);
  };

  const saveCoupon = async () => {
    const values = await couponForm.validateFields();
    const normalizedCode = values.code.trim().toUpperCase();
    const duplicate = records.some(
      (record) => record.id !== editing?.id && record.code === normalizedCode,
    );
    if (duplicate) {
      message.error(t('voya.coupon.duplicateCode'));
      return;
    }

    const nextValues = {
      code: normalizedCode,
      nameZh: values.nameZh.trim(),
      nameEn: values.nameEn.trim(),
      type: values.type,
      value: values.value,
      currency: values.currency,
      minSpend: values.minSpend,
      totalLimit: values.totalLimit,
      validFrom: values.validity[0].format('YYYY-MM-DD'),
      validTo: values.validity[1].format('YYYY-MM-DD'),
      status: values.status,
      updatedAt: demoUpdatedAt,
    };

    if (editing) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editing.id ? { ...record, ...nextValues } : record,
        ),
      );
      message.success(t('voya.common.saved'));
    } else {
      setRecords((current) => [
        {
          id: `coupon-${Date.now()}`,
          ...nextValues,
          claimedCount: 0,
          usedCount: 0,
        },
        ...current,
      ]);
      message.success(t('voya.common.created'));
    }
    setModalOpen(false);
  };

  const formatMoney = (amount: number, currency: string) =>
    intl.formatNumber(amount, {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const columns: TableColumnsType<CouponRecord> = [
    {
      title: t('voya.common.code'),
      dataIndex: 'code',
      fixed: 'left',
      width: 125,
      render: (value) => (
        <Typography.Text
          className={`${styles.code} ${styles.noWrap}`}
          copyable={{ text: value }}
        >
          {value}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.common.name'),
      key: 'name',
      width: 180,
      render: (_, record) => (
        <Typography.Text strong>
          {isChinese ? record.nameZh : record.nameEn}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.coupon.discountRule'),
      key: 'discountRule',
      width: 165,
      render: (_, record) => (
        <Space size="small">
          <Tag>{t(`voya.coupon.type.${record.type}`)}</Tag>
          <Typography.Text strong className={styles.noWrap}>
            {record.type === 'fixedAmount'
              ? formatMoney(record.value, record.currency)
              : intl.formatNumber(record.value / 100, {
                  style: 'percent',
                  maximumFractionDigits: 2,
                })}
          </Typography.Text>
        </Space>
      ),
    },
    {
      title: t('voya.coupon.minSpend'),
      dataIndex: 'minSpend',
      align: 'right',
      width: 120,
      render: (value, record) => formatMoney(value, record.currency),
    },
    {
      title: t('voya.coupon.claimedCount'),
      dataIndex: 'claimedCount',
      align: 'right',
      width: 80,
      render: (value) => intl.formatNumber(value),
    },
    {
      title: t('voya.coupon.usedCount'),
      dataIndex: 'usedCount',
      align: 'right',
      width: 80,
      render: (value) => intl.formatNumber(value),
    },
    {
      title: t('voya.coupon.totalLimit'),
      dataIndex: 'totalLimit',
      align: 'right',
      width: 90,
      render: (value) => intl.formatNumber(value),
    },
    {
      title: t('voya.coupon.validity'),
      key: 'validity',
      width: 200,
      render: (_, record) => (
        <Space size={4}>
          <LocalizedDateTime dateOnly value={record.validFrom} />
          <Typography.Text type="secondary">—</Typography.Text>
          <LocalizedDateTime dateOnly value={record.validTo} />
        </Space>
      ),
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      width: 90,
      render: (value: CouponStatus) => (
        <Tag color={statusColor[value]}>{t(`voya.coupon.status.${value}`)}</Tag>
      ),
    },
    {
      title: t('voya.common.updatedAt'),
      dataIndex: 'updatedAt',
      width: 160,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size={2}>
          <Button
            size="small"
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => setUsageCoupon(record)}
          >
            {t('voya.coupon.usageRecords')}
          </Button>
          <Button
            size="small"
            type="link"
            icon={<EditOutlined />}
            onClick={() => openCouponModal(record)}
          >
            {t('voya.common.edit')}
          </Button>
          <Popconfirm
            title={intl.formatMessage(
              { id: 'voya.common.confirmDelete' },
              { name: record.code },
            )}
            description={t('voya.coupon.deleteDescription')}
            okText={t('voya.common.deleteConfirm')}
            cancelText={t('voya.common.cancel')}
            okButtonProps={{ danger: true }}
            onConfirm={() => {
              setRecords((current) =>
                current.filter((item) => item.id !== record.id),
              );
              message.success(t('voya.common.deleted'));
            }}
          >
            <Button danger size="small" type="link" icon={<DeleteOutlined />}>
              {t('voya.common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const usageColumns: TableColumnsType<CouponUsageRecord> = [
    {
      title: t('voya.coupon.usageUser'),
      dataIndex: 'userName',
      width: 160,
      render: (value) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: t('voya.user.id'),
      dataIndex: 'userId',
      width: 130,
      render: (value) => (
        <Typography.Text className={styles.code} copyable={{ text: value }}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.coupon.orderId'),
      dataIndex: 'orderId',
      width: 175,
      render: (value) => (
        <Button
          size="small"
          type="link"
          onClick={() => history.push(`/orders/vehicle/${value}`)}
        >
          {value}
        </Button>
      ),
    },
    {
      title: t('voya.coupon.discountAmount'),
      dataIndex: 'discountAmount',
      align: 'right',
      width: 130,
      render: (value, record) => formatMoney(value, record.currency),
    },
    {
      title: t('voya.coupon.usedAt'),
      dataIndex: 'usedAt',
      width: 180,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: CouponUsageStatus) => (
        <Tag color={usageStatusColor[value]}>
          {t(`voya.coupon.usageStatus.${value}`)}
        </Tag>
      ),
    },
  ];

  const selectedUsageRecords = usageCoupon
    ? couponUsageRecords.filter((record) => record.couponId === usageCoupon.id)
    : [];

  return (
    <PageContainer
      title={t('voya.coupon.title')}
      subTitle={t('voya.coupon.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.coupon.notice')} />
        <FilterCard compact>
          <Form
            form={filterForm}
            layout="vertical"
            className={styles.filterGrid}
            onFinish={setFilters}
          >
            <Form.Item name="keyword" label={t('voya.coupon.keyword')}>
              <Input
                allowClear
                className={styles.fullWidth}
                prefix={<SearchOutlined />}
              />
            </Form.Item>
            <Form.Item name="status" label={t('voya.common.status')}>
              <Select
                allowClear
                className={styles.fullWidth}
                options={statusOptions}
              />
            </Form.Item>
            <div />
            <div className={styles.filterActions}>
              <Space>
                <Button
                  onClick={() => {
                    filterForm.resetFields();
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

        <DataCard
          title={t('voya.coupon.list')}
          count={filteredRecords.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openCouponModal()}
            >
              {t('voya.coupon.create')}
            </Button>
          }
        >
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredRecords}
              pagination={{
                defaultPageSize: 10,
                hideOnSinglePage: false,
                pageSizeOptions: [10, 20, 50],
                showQuickJumper: true,
                showSizeChanger: true,
              }}
              size="small"
              scroll={{ x: 1530 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>

      <Modal
        destroyOnHidden
        open={modalOpen}
        title={t(editing ? 'voya.coupon.edit' : 'voya.coupon.create')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        width={760}
        onOk={saveCoupon}
        onCancel={() => setModalOpen(false)}
      >
        <Form
          form={couponForm}
          layout="vertical"
          preserve={false}
          className={styles.formGrid}
        >
          <Form.Item
            name="code"
            label={t('voya.common.code')}
            rules={[
              { required: true, message: t('voya.common.required') },
              {
                pattern: /^[A-Za-z0-9_-]+$/,
                message: t('voya.coupon.codeFormat'),
              },
            ]}
          >
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item
            name="status"
            label={t('voya.common.status')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item
            name="nameZh"
            label={t('voya.coupon.nameZh')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input maxLength={80} />
          </Form.Item>
          <Form.Item
            name="nameEn"
            label={t('voya.coupon.nameEn')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input maxLength={120} />
          </Form.Item>
          <Form.Item
            name="type"
            label={t('voya.coupon.type')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={typeOptions} />
          </Form.Item>
          <Form.Item
            name="value"
            label={t('voya.coupon.value')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <InputNumber
              className={styles.fullWidth}
              min={0.01}
              precision={2}
            />
          </Form.Item>
          <Form.Item
            name="currency"
            label={t('voya.coupon.currency')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={currencyOptions} />
          </Form.Item>
          <Form.Item
            name="minSpend"
            label={t('voya.coupon.minSpend')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <InputNumber className={styles.fullWidth} min={0} precision={2} />
          </Form.Item>
          <Form.Item
            name="totalLimit"
            label={t('voya.coupon.totalLimit')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <InputNumber className={styles.fullWidth} min={1} precision={0} />
          </Form.Item>
          <Form.Item
            name="validity"
            label={t('voya.coupon.validity')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <DatePicker.RangePicker
              allowClear={false}
              className={styles.fullWidth}
            />
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        open={Boolean(usageCoupon)}
        size="large"
        title={intl.formatMessage(
          { id: 'voya.coupon.usageTitle' },
          { code: usageCoupon?.code ?? '' },
        )}
        onClose={() => setUsageCoupon(null)}
      >
        <div className={styles.stack}>
          <Alert
            showIcon
            type="info"
            title={intl.formatMessage(
              { id: 'voya.coupon.usageSummary' },
              { count: usageCoupon?.usedCount ?? 0 },
            )}
          />
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 4 } } }}
          >
            <Table
              rowKey="id"
              columns={usageColumns}
              dataSource={selectedUsageRecords}
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              size="small"
              scroll={{ x: 975 }}
            />
          </ConfigProvider>
        </div>
      </Drawer>
    </PageContainer>
  );
}
