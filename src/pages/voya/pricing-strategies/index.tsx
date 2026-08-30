import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  Card,
  ConfigProvider,
  Flex,
  Form,
  InputNumber,
  Modal,
  Popconfirm,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import dayjs from 'dayjs';
import { useState } from 'react';
import {
  DataCard,
  defaultTablePagination,
  LocalizedDateTime,
} from '../components';
import { useVoyaPageStyles } from '../styles';
import {
  calculateSuggestedSellingPrice,
  getCurrencyRateReferenceAt,
  getCurrencyToCnyRate,
  pricingStrategies as initialPricingStrategies,
  type PricingCurrency,
  type PricingStrategyRecord,
  type PricingStrategyStatus,
  type PricingSupplyChain,
  pricingCurrencies,
  pricingSupplyChains,
} from './_mock';

type PricingStrategyFormValues = Pick<
  PricingStrategyRecord,
  'supplyChain' | 'currency' | 'grossMarginRate' | 'status'
>;

const demoUpdatedAt = '2026-08-21 17:08';

export default function PricingStrategiesPage() {
  const [records, setRecords] = useState(initialPricingStrategies);
  const [editing, setEditing] = useState<PricingStrategyRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierCostCny, setSupplierCostCny] = useState(1000);
  const [form] = Form.useForm<PricingStrategyFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (messageId: string) => intl.formatMessage({ id: messageId });

  const currencyOptions = pricingCurrencies.map((value) => ({
    value,
    label: value,
  }));
  const supplyChainOptions = pricingSupplyChains.map((value) => ({
    value,
    label: t(`voya.pricing.supplyChain.${value}`),
  }));
  const statusOptions = (['active', 'inactive'] as PricingStrategyStatus[]).map(
    (value) => ({
      value,
      label: t(`voya.pricing.status.${value}`),
    }),
  );

  const formatCurrency = (value: number, currency: PricingCurrency) =>
    intl.formatNumber(value, {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatReferenceDate = (value: string) => {
    const parsed = dayjs(value.replace(' ', 'T'));
    return parsed.isValid()
      ? intl.formatDate(parsed.toDate(), {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        })
      : value;
  };

  const getSupplyChainLabel = (value: PricingSupplyChain) =>
    t(`voya.pricing.supplyChain.${value}`);

  const openModal = (record?: PricingStrategyRecord) => {
    setEditing(record ?? null);
    form.setFieldsValue(
      record ?? {
        supplyChain: 'pureGuide',
        currency: 'CNY',
        grossMarginRate: 18,
        status: 'active',
      },
    );
    setModalOpen(true);
  };

  const savePricingStrategy = async () => {
    const values = await form.validateFields();
    const duplicate = records.some(
      (record) =>
        record.id !== editing?.id &&
        record.supplyChain === values.supplyChain &&
        record.currency === values.currency,
    );
    if (duplicate) {
      message.error(t('voya.pricing.duplicateCurrency'));
      return;
    }

    if (editing) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editing.id
            ? {
                ...record,
                ...values,
                effectiveAt: demoUpdatedAt,
                updatedAt: demoUpdatedAt,
              }
            : record,
        ),
      );
      message.success(t('voya.common.saved'));
    } else {
      setRecords((current) => [
        {
          id: `pricing-${Date.now()}`,
          ...values,
          effectiveAt: demoUpdatedAt,
          updatedAt: demoUpdatedAt,
        },
        ...current,
      ]);
      message.success(t('voya.common.created'));
    }
    setModalOpen(false);
  };

  const columns: TableColumnsType<PricingStrategyRecord> = [
    {
      title: t('voya.pricing.supplyChain'),
      dataIndex: 'supplyChain',
      width: 180,
      render: (value: PricingSupplyChain) => (
        <Typography.Text strong>{getSupplyChainLabel(value)}</Typography.Text>
      ),
    },
    {
      title: t('voya.pricing.currency'),
      dataIndex: 'currency',
      width: 130,
      render: (value: PricingCurrency) => (
        <Typography.Text strong>{value}</Typography.Text>
      ),
    },
    {
      title: t('voya.pricing.exchangeRate'),
      key: 'exchangeRate',
      width: 230,
      render: (_, record) => {
        const rate = getCurrencyToCnyRate(record.currency);
        const referenceAt = getCurrencyRateReferenceAt(record.currency);
        return (
          <Space orientation="vertical" size={0}>
            <Typography.Text>
              {intl.formatNumber(rate, {
                minimumFractionDigits: 4,
                maximumFractionDigits: 4,
              })}{' '}
              CNY
            </Typography.Text>
            <Typography.Text type="secondary">
              {intl.formatMessage(
                { id: 'voya.pricing.exchangeRateReference' },
                { date: formatReferenceDate(referenceAt) },
              )}
            </Typography.Text>
          </Space>
        );
      },
    },
    {
      title: t('voya.pricing.grossMarginRate'),
      dataIndex: 'grossMarginRate',
      align: 'right',
      width: 150,
      render: (value: number) => (
        <Typography.Text strong>
          {intl.formatNumber(value, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          %
        </Typography.Text>
      ),
    },
    {
      title: t('voya.pricing.suggestedPrice'),
      key: 'suggestedPrice',
      align: 'right',
      width: 210,
      render: (_, record) => (
        <Typography.Text strong>
          {formatCurrency(
            calculateSuggestedSellingPrice(
              supplierCostCny,
              getCurrencyToCnyRate(record.currency),
              record.grossMarginRate,
            ),
            record.currency,
          )}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      width: 130,
      render: (value: PricingStrategyStatus) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {t(`voya.pricing.status.${value}`)}
        </Tag>
      ),
    },
    {
      title: t('voya.pricing.effectiveAt'),
      dataIndex: 'effectiveAt',
      width: 190,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => {
        const isActive = record.status === 'active';
        const supplyChainLabel = getSupplyChainLabel(record.supplyChain);
        return (
          <Space size="small">
            <Button
              size="small"
              type="link"
              icon={<EditOutlined />}
              onClick={() => openModal(record)}
            >
              {t('voya.common.edit')}
            </Button>
            <Popconfirm
              title={intl.formatMessage(
                {
                  id: isActive
                    ? 'voya.pricing.action.deactivateTitle'
                    : 'voya.pricing.action.activateTitle',
                },
                {
                  currency: record.currency,
                  supplyChain: supplyChainLabel,
                },
              )}
              okText={t(
                isActive
                  ? 'voya.pricing.action.deactivate'
                  : 'voya.pricing.action.activate',
              )}
              cancelText={t('voya.common.cancel')}
              onConfirm={() => {
                setRecords((current) =>
                  current.map((item) =>
                    item.id === record.id
                      ? {
                          ...item,
                          status: isActive ? 'inactive' : 'active',
                          updatedAt: demoUpdatedAt,
                        }
                      : item,
                  ),
                );
                message.success(
                  intl.formatMessage(
                    { id: 'voya.pricing.action.statusSuccess' },
                    {
                      currency: record.currency,
                      supplyChain: supplyChainLabel,
                    },
                  ),
                );
              }}
            >
              <Button size="small" type="link">
                {t(
                  isActive
                    ? 'voya.pricing.action.deactivate'
                    : 'voya.pricing.action.activate',
                )}
              </Button>
            </Popconfirm>
            <Popconfirm
              title={intl.formatMessage(
                { id: 'voya.common.confirmDelete' },
                { name: `${supplyChainLabel} / ${record.currency}` },
              )}
              description={t('voya.pricing.deleteDescription')}
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
              <Button danger size="small" type="link">
                {t('voya.common.delete')}
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <PageContainer
      title={t('voya.pricing.title')}
      subTitle={t('voya.pricing.subtitle')}
    >
      <div className={styles.stack}>
        <Alert
          showIcon
          type="info"
          title={t('voya.pricing.notice')}
          description={t('voya.pricing.formula')}
        />
        <Card className={styles.surfaceCard} size="small">
          <Flex align="center" justify="space-between" gap="middle" wrap>
            <div>
              <Typography.Text strong>
                {t('voya.pricing.previewCost')}
              </Typography.Text>
              <Typography.Text type="secondary" style={{ display: 'block' }}>
                {t('voya.pricing.previewHint')}
              </Typography.Text>
            </div>
            <Space.Compact>
              <InputNumber
                aria-label={t('voya.pricing.previewCost')}
                min={0}
                precision={2}
                value={supplierCostCny}
                onChange={(value) => {
                  if (typeof value === 'number') setSupplierCostCny(value);
                }}
              />
              <Space.Addon>CNY</Space.Addon>
            </Space.Compact>
          </Flex>
        </Card>
        <DataCard
          title={t('voya.pricing.list')}
          count={records.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {t('voya.pricing.create')}
            </Button>
          }
        >
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={records}
              pagination={defaultTablePagination}
              size="small"
              scroll={{ x: 1440 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>

      <Modal
        open={modalOpen}
        title={t(editing ? 'voya.pricing.edit' : 'voya.pricing.create')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={savePricingStrategy}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="supplyChain"
            label={t('voya.pricing.supplyChain')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={supplyChainOptions} showSearch />
          </Form.Item>
          <Form.Item
            name="currency"
            label={t('voya.pricing.currency')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={currencyOptions} showSearch />
          </Form.Item>
          <Form.Item
            name="grossMarginRate"
            label={t('voya.pricing.grossMarginRate')}
            rules={[
              { required: true, message: t('voya.common.required') },
              {
                validator(_, value: number | null) {
                  if (
                    value !== null &&
                    value !== undefined &&
                    value >= 0 &&
                    value < 100
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error(t('voya.pricing.marginRange')),
                  );
                },
              },
            ]}
          >
            <Space.Compact block>
              <InputNumber
                min={0}
                max={99.99}
                precision={2}
                step={0.5}
                style={{ width: '100%' }}
              />
              <Space.Addon>%</Space.Addon>
            </Space.Compact>
          </Form.Item>
          <Form.Item
            name="status"
            label={t('voya.common.status')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={statusOptions} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
