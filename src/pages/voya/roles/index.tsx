import {
  EditOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType, TreeDataNode } from 'antd';
import {
  Alert,
  App,
  Button,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tree,
  Typography,
} from 'antd';
import type { Key } from 'react';
import { useMemo, useState } from 'react';
import { DataCard, LocalizedDateTime } from '../components';
import {
  roles as initialRoles,
  permissionTreeData,
  type RoleRecord,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type RoleFormValues = Pick<RoleRecord, 'name' | 'description'>;
type PermissionNode = {
  key: string;
  titleId: string;
  children?: PermissionNode[];
};

export default function RolesPage() {
  const [records, setRecords] = useState(initialRoles);
  const [editing, setEditing] = useState<RoleRecord | null>(null);
  const [permissionRole, setPermissionRole] = useState<RoleRecord | null>(null);
  const [checkedKeys, setCheckedKeys] = useState<Key[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm<RoleFormValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const treeData = useMemo<TreeDataNode[]>(() => {
    const localize = (nodes: PermissionNode[]): TreeDataNode[] =>
      nodes.map((node) => ({
        key: node.key,
        title: t(node.titleId),
        children: node.children ? localize(node.children) : undefined,
      }));
    return localize(permissionTreeData as PermissionNode[]);
  }, [intl.locale]);

  const openRoleModal = (record?: RoleRecord) => {
    setEditing(record ?? null);
    form.setFieldsValue(record ?? { name: '', description: '' });
    setModalOpen(true);
  };

  const saveRole = async () => {
    const values = await form.validateFields();
    if (editing) {
      setRecords((current) =>
        current.map((record) =>
          record.id === editing.id
            ? { ...record, ...values, updatedAt: '2026-08-21 10:26' }
            : record,
        ),
      );
      message.success(t('voya.common.saved'));
    } else {
      setRecords((current) => [
        {
          id: `role-${Date.now()}`,
          ...values,
          memberCount: 0,
          permissions: [],
          updatedAt: '2026-08-21 10:26',
        },
        ...current,
      ]);
      message.success(t('voya.common.created'));
    }
    setModalOpen(false);
  };

  const openPermissions = (record: RoleRecord) => {
    setPermissionRole(record);
    setCheckedKeys(record.permissions);
  };

  const savePermissions = () => {
    if (!permissionRole) return;
    setRecords((current) =>
      current.map((record) =>
        record.id === permissionRole.id
          ? {
              ...record,
              permissions: checkedKeys.map(String),
              updatedAt: '2026-08-21 10:26',
            }
          : record,
      ),
    );
    message.success(t('voya.common.saved'));
    setPermissionRole(null);
  };

  const columns: TableColumnsType<RoleRecord> = [
    {
      title: t('voya.common.name'),
      dataIndex: 'name',
      render: (value, record) => (
        <div className={styles.titleMeta}>
          <Typography.Text strong>{value}</Typography.Text>
          <Typography.Text type="secondary">
            {record.description}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: t('voya.role.members'),
      dataIndex: 'memberCount',
      align: 'right',
      width: 110,
    },
    {
      title: t('voya.role.permissions'),
      dataIndex: 'permissions',
      render: (permissions: string[]) => (
        <Tag icon={<SafetyCertificateOutlined />}>
          {intl.formatMessage(
            { id: 'voya.role.permissionCount' },
            { count: permissions.length },
          )}
        </Tag>
      ),
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
      width: 260,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<SafetyCertificateOutlined />}
            onClick={() => openPermissions(record)}
          >
            {t('voya.role.permissions')}
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openRoleModal(record)}
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
            <Button type="link" danger>
              {t('voya.common.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('voya.role.title')}
      subTitle={t('voya.role.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.role.notice')} />
        <DataCard
          title={t('voya.role.list')}
          count={records.length}
          extra={
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => openRoleModal()}
            >
              {t('voya.role.create')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={columns}
            dataSource={records}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="middle"
            scroll={{ x: 980 }}
          />
        </DataCard>
      </div>

      <Modal
        open={modalOpen}
        title={t(editing ? 'voya.role.edit' : 'voya.role.create')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={saveRole}
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

      <Drawer
        open={Boolean(permissionRole)}
        size="large"
        title={intl.formatMessage(
          { id: 'voya.role.permissionTitle' },
          { name: permissionRole?.name ?? '' },
        )}
        onClose={() => setPermissionRole(null)}
        extra={
          <Space>
            <Button onClick={() => setPermissionRole(null)}>
              {t('voya.common.cancel')}
            </Button>
            <Button type="primary" onClick={savePermissions}>
              {t('voya.common.save')}
            </Button>
          </Space>
        }
      >
        <div className={styles.stack}>
          <Alert showIcon type="info" title={t('voya.role.permissionHelp')} />
          <div className={styles.permissionPanel}>
            <Tree
              checkable
              defaultExpandAll
              treeData={treeData}
              checkedKeys={checkedKeys}
              onCheck={(keys) =>
                setCheckedKeys(Array.isArray(keys) ? keys : keys.checked)
              }
            />
          </div>
        </div>
      </Drawer>
    </PageContainer>
  );
}
