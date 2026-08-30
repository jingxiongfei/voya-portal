import { EditOutlined, PlusOutlined, TagOutlined } from '@ant-design/icons';
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
  Tag,
} from 'antd';
import { useState } from 'react';
import {
  DataCard,
  defaultTablePagination,
  LocalizedDateTime,
} from '../components';
import { userTags as initialTags, type UserTagRecord } from '../mockData';
import { useVoyaPageStyles } from '../styles';

type TagFormValues = Pick<UserTagRecord, 'name' | 'description'>;

export default function TagsPage() {
  const [records, setRecords] = useState(initialTags);
  const [editing, setEditing] = useState<UserTagRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<TagFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const openModal = (record?: UserTagRecord) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { name: '', description: '' });
    setModalOpen(true);
  };

  const saveTag = async () => {
    const values = await form.validateFields();
    if (editing) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editing.id
            ? { ...record, ...values, updatedAt: '2026-08-21 10:32' }
            : record,
        ),
      );
      message.success(t('voya.common.saved'));
    } else {
      setRecords((current) => [
        {
          id: `tag-${Date.now()}`,
          ...values,
          userCount: 0,
          updatedAt: '2026-08-21 10:32',
        },
        ...current,
      ]);
      message.success(t('voya.common.created'));
    }
    setModalOpen(false);
  };

  const columns: TableColumnsType<UserTagRecord> = [
    {
      title: t('voya.common.name'),
      dataIndex: 'name',
      render: (value) => (
        <Tag icon={<TagOutlined />} color="blue">
          {value}
        </Tag>
      ),
    },
    { title: t('voya.common.description'), dataIndex: 'description' },
    {
      title: t('voya.tag.users'),
      dataIndex: 'userCount',
      align: 'right',
      width: 140,
    },
    {
      title: t('voya.common.updatedAt'),
      dataIndex: 'updatedAt',
      width: 180,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 170,
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
      title={t('voya.tag.title')}
      subTitle={t('voya.tag.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.tag.notice')} />
        <DataCard
          title={t('voya.tag.list')}
          count={records.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openModal()}
            >
              {t('voya.tag.create')}
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
              scroll={{ x: 850 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>

      <Modal
        open={modalOpen}
        title={t(editing ? 'voya.tag.edit' : 'voya.tag.create')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={saveTag}
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
            name="description"
            label={t('voya.common.description')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
