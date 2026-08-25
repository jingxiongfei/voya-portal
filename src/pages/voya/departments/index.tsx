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
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Typography,
} from 'antd';
import { useState } from 'react';
import { DataCard, LocalizedDateTime } from '../components';
import {
  type DepartmentRecord,
  departments as initialDepartments,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type DepartmentFormValues = Pick<DepartmentRecord, 'name' | 'code' | 'owner'>;

export default function DepartmentsPage() {
  const [records, setRecords] = useState(initialDepartments);
  const [editing, setEditing] = useState<DepartmentRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<DepartmentFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const openModal = (record?: DepartmentRecord) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { name: '', code: '', owner: '' });
    setModalOpen(true);
  };

  const saveDepartment = async () => {
    const values = await form.validateFields();
    if (editing) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editing.id
            ? { ...record, ...values, updatedAt: '2026-08-21 10:18' }
            : record,
        ),
      );
      message.success(t('voya.common.saved'));
    } else {
      setRecords((current) => [
        {
          id: `dept-${Date.now()}`,
          ...values,
          memberCount: 0,
          roleCount: 0,
          updatedAt: '2026-08-21 10:18',
        },
        ...current,
      ]);
      message.success(t('voya.common.created'));
    }
    setModalOpen(false);
  };

  const columns: TableColumnsType<DepartmentRecord> = [
    {
      title: t('voya.common.name'),
      dataIndex: 'name',
      render: (value) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: t('voya.common.code'),
      dataIndex: 'code',
      render: (value) => <Typography.Text code>{value}</Typography.Text>,
    },
    { title: t('voya.department.owner'), dataIndex: 'owner' },
    {
      title: t('voya.department.members'),
      dataIndex: 'memberCount',
      align: 'right',
    },
    {
      title: t('voya.department.roles'),
      dataIndex: 'roleCount',
      align: 'right',
    },
    {
      title: t('voya.common.updatedAt'),
      dataIndex: 'updatedAt',
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space>
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
              { name: record.name },
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
      title={t('voya.department.title')}
      subTitle={t('voya.department.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.department.notice')} />
        <DataCard
          title={t('voya.department.list')}
          count={records.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {t('voya.department.create')}
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
              scroll={{ x: 980 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>

      <Modal
        open={modalOpen}
        title={t(editing ? 'voya.department.edit' : 'voya.department.create')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={saveDepartment}
        onCancel={() => setModalOpen(false)}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label={t('voya.common.name')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="code"
            label={t('voya.common.code')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="owner"
            label={t('voya.department.owner')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
