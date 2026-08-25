import { EditOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  ConfigProvider,
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
import { useState } from 'react';
import { DataCard, LocalizedDateTime } from '../components';
import {
  type ExchangeRateRecord,
  type ExchangeRateStatus,
  exchangeRates as initialExchangeRates,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type ExchangeRateFormValues = Pick<
  ExchangeRateRecord,
  'baseCurrency' | 'quoteCurrency' | 'rate' | 'status'
>;

const currencies = ['USD', 'CNY', 'EUR', 'GBP', 'JPY', 'SGD', 'AED'];
const demoUpdatedAt = '2026-08-21 17:08';

export default function ExchangeRatesPage() {
  const [records, setRecords] = useState(initialExchangeRates);
  const [editing, setEditing] = useState<ExchangeRateRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<ExchangeRateFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (messageId: string) => intl.formatMessage({ id: messageId });

  const currencyOptions = currencies.map((value) => ({ value, label: value }));
  const statusOptions = (['active', 'inactive'] as ExchangeRateStatus[]).map(
    (value) => ({
      value,
      label: t(`voya.exchangeRate.status.${value}`),
    }),
  );

  const openModal = (record?: ExchangeRateRecord) => {
    setEditing(record ?? null);
    form.setFieldsValue(
      record ?? {
        baseCurrency: 'USD',
        quoteCurrency: 'CNY',
        rate: 1,
        status: 'active',
      },
    );
    setModalOpen(true);
  };

  const saveExchangeRate = async () => {
    const values = await form.validateFields();
    const duplicate = records.some(
      (record) =>
        record.id !== editing?.id &&
        record.baseCurrency === values.baseCurrency &&
        record.quoteCurrency === values.quoteCurrency,
    );
    if (duplicate) {
      message.error(t('voya.exchangeRate.duplicatePair'));
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
          id: `rate-${Date.now()}`,
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

  const columns: TableColumnsType<ExchangeRateRecord> = [
    {
      title: t('voya.exchangeRate.baseCurrency'),
      dataIndex: 'baseCurrency',
      width: 150,
      render: (value) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: t('voya.exchangeRate.quoteCurrency'),
      dataIndex: 'quoteCurrency',
      width: 150,
      render: (value) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: t('voya.exchangeRate.rate'),
      dataIndex: 'rate',
      align: 'right',
      width: 180,
      render: (value: number) =>
        intl.formatNumber(value, {
          minimumFractionDigits: 4,
          maximumFractionDigits: 6,
        }),
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      width: 120,
      render: (value: ExchangeRateStatus) => (
        <Tag color={value === 'active' ? 'success' : 'default'}>
          {t(`voya.exchangeRate.status.${value}`)}
        </Tag>
      ),
    },
    {
      title: t('voya.exchangeRate.effectiveAt'),
      dataIndex: 'effectiveAt',
      width: 190,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.updatedAt'),
      dataIndex: 'updatedAt',
      width: 190,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
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
              { id: 'voya.common.confirmDelete' },
              { name: `${record.baseCurrency}/${record.quoteCurrency}` },
            )}
            description={t('voya.common.deleteDescription')}
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
      ),
    },
  ];

  return (
    <PageContainer
      title={t('voya.exchangeRate.title')}
      subTitle={t('voya.exchangeRate.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.exchangeRate.notice')} />
        <DataCard
          title={t('voya.exchangeRate.list')}
          count={records.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {t('voya.exchangeRate.create')}
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
              pagination={{ pageSize: 10, hideOnSinglePage: true }}
              size="small"
              scroll={{ x: 1120 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>

      <Modal
        open={modalOpen}
        title={t(
          editing ? 'voya.exchangeRate.edit' : 'voya.exchangeRate.create',
        )}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={saveExchangeRate}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="baseCurrency"
            label={t('voya.exchangeRate.baseCurrency')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Select options={currencyOptions} showSearch />
          </Form.Item>
          <Form.Item
            name="quoteCurrency"
            label={t('voya.exchangeRate.quoteCurrency')}
            dependencies={['baseCurrency']}
            rules={[
              { required: true, message: t('voya.common.required') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || value !== getFieldValue('baseCurrency'))
                    return Promise.resolve();
                  return Promise.reject(
                    new Error(t('voya.exchangeRate.sameCurrency')),
                  );
                },
              }),
            ]}
          >
            <Select options={currencyOptions} showSearch />
          </Form.Item>
          <Form.Item
            name="rate"
            label={t('voya.exchangeRate.rate')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <InputNumber
              min={0.000001}
              precision={6}
              step={0.000001}
              style={{ width: '100%' }}
            />
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
