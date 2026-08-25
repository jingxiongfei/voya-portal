import { EditOutlined, KeyOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  App,
  Button,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Typography,
} from 'antd';
import { useState } from 'react';
import {
  DataCard,
  FilterCard,
  InitialAvatar,
  LocalizedDateTime,
} from '../components';
import {
  type AccountRecord,
  departments,
  accounts as initialAccounts,
  roles,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type AccountFormValues = Pick<
  AccountRecord,
  | 'name'
  | 'username'
  | 'departmentId'
  | 'roleId'
  | 'countryCode'
  | 'phone'
  | 'email'
>;
type FilterValues = {
  keyword?: string;
  departmentId?: string;
  roleId?: string;
};
type PasswordValues = { password: string; confirmPassword: string };

const countryCodes = ['+86', '+1', '+44', '+65', '+33', '+81'].map((value) => ({
  label: value,
  value,
}));
const departmentMap = new Map(
  departments.map((department) => [department.id, department.name]),
);
const roleMap = new Map(roles.map((role) => [role.id, role.name]));

export default function AccountsPage() {
  const [records, setRecords] = useState(initialAccounts);
  const [filters, setFilters] = useState<FilterValues>({});
  const [editing, setEditing] = useState<AccountRecord | null>(null);
  const [passwordAccount, setPasswordAccount] = useState<AccountRecord | null>(
    null,
  );
  const [filterForm] = Form.useForm<FilterValues>();
  const [editForm] = Form.useForm<AccountFormValues>();
  const [passwordForm] = Form.useForm<PasswordValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const filteredRecords = records.filter((record) => {
    const keyword = filters.keyword?.trim().toLowerCase();
    return (
      (!keyword ||
        [record.name, record.username, record.email, record.phone]
          .join(' ')
          .toLowerCase()
          .includes(keyword)) &&
      (!filters.departmentId || record.departmentId === filters.departmentId) &&
      (!filters.roleId || record.roleId === filters.roleId)
    );
  });

  const openEdit = (record: AccountRecord) => {
    setEditing(record);
    editForm.setFieldsValue(record);
  };

  const saveAccount = async () => {
    const values = await editForm.validateFields();
    if (!editing) return;
    setRecords((current) =>
      current.map((record) =>
        record.id === editing.id ? { ...record, ...values } : record,
      ),
    );
    message.success(t('voya.common.saved'));
    setEditing(null);
  };

  const savePassword = async () => {
    await passwordForm.validateFields();
    message.success(t('voya.account.passwordReset'));
    passwordForm.resetFields();
    setPasswordAccount(null);
  };

  const columns: TableColumnsType<AccountRecord> = [
    {
      title: t('voya.common.name'),
      dataIndex: 'name',
      fixed: 'left',
      render: (_, record) => (
        <div className={styles.titleCell}>
          <InitialAvatar name={record.name} />
          <div className={styles.titleMeta}>
            <Typography.Text strong>{record.name}</Typography.Text>
            <Typography.Text className={styles.code}>
              {record.username}
            </Typography.Text>
          </div>
        </div>
      ),
    },
    {
      title: t('voya.common.department'),
      dataIndex: 'departmentId',
      render: (value) => departmentMap.get(value),
    },
    {
      title: t('voya.common.role'),
      dataIndex: 'roleId',
      render: (value) => roleMap.get(value),
    },
    {
      title: t('voya.common.phone'),
      dataIndex: 'phone',
      render: (value, record) => `${record.countryCode} ${value}`,
    },
    { title: t('voya.common.email'), dataIndex: 'email' },
    {
      title: t('voya.account.lastLogin'),
      dataIndex: 'lastLoginAt',
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 230,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => openEdit(record)}
          >
            {t('voya.common.edit')}
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => {
              passwordForm.resetFields();
              setPasswordAccount(record);
            }}
          >
            {t('voya.account.resetPassword')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('voya.account.title')}
      subTitle={t('voya.account.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.account.notice')} />
        <FilterCard>
          <Form
            form={filterForm}
            layout="vertical"
            onFinish={setFilters}
            className={styles.filterGrid}
          >
            <Form.Item name="keyword" label={t('voya.account.username')}>
              <Input allowClear prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="departmentId" label={t('voya.common.department')}>
              <Select
                allowClear
                options={departments.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
              />
            </Form.Item>
            <Form.Item name="roleId" label={t('voya.common.role')}>
              <Select
                allowClear
                options={roles.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
              />
            </Form.Item>
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

        <DataCard title={t('voya.account.list')} count={filteredRecords.length}>
          <Table
            rowKey="id"
            columns={columns}
            dataSource={filteredRecords}
            pagination={{ pageSize: 10, hideOnSinglePage: true }}
            size="middle"
            scroll={{ x: 1180 }}
          />
        </DataCard>
      </div>

      <Modal
        open={Boolean(editing)}
        title={t('voya.account.edit')}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={saveAccount}
        onCancel={() => setEditing(null)}
        width={680}
        destroyOnHidden
      >
        <Form form={editForm} layout="vertical" preserve={false}>
          <div className={styles.filterGrid}>
            <Form.Item
              name="name"
              label={t('voya.common.name')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="username"
              label={t('voya.account.username')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="departmentId"
              label={t('voya.common.department')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Select
                options={departments.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="roleId"
              label={t('voya.common.role')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Select
                options={roles.map(({ id, name }) => ({
                  value: id,
                  label: name,
                }))}
              />
            </Form.Item>
            <Form.Item
              name="countryCode"
              label={t('voya.common.phone')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Select options={countryCodes} />
            </Form.Item>
            <Form.Item
              name="phone"
              label={t('voya.common.phone')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label={t('voya.common.email')}
              rules={[
                {
                  required: true,
                  type: 'email',
                  message: t('voya.common.required'),
                },
              ]}
            >
              <Input />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        open={Boolean(passwordAccount)}
        title={`${t('voya.account.resetPassword')} · ${passwordAccount?.name ?? ''}`}
        okText={t('voya.common.save')}
        cancelText={t('voya.common.cancel')}
        onOk={savePassword}
        onCancel={() => setPasswordAccount(null)}
        destroyOnHidden
      >
        <Alert
          showIcon
          type="warning"
          title={t('voya.account.notice')}
          style={{ marginBottom: 20 }}
        />
        <Form form={passwordForm} layout="vertical" preserve={false}>
          <Form.Item
            name="password"
            label={t('voya.account.newPassword')}
            rules={[{ required: true, message: t('voya.common.required') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('voya.account.confirmPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('voya.common.required') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  return !value || getFieldValue('password') === value
                    ? Promise.resolve()
                    : Promise.reject(
                        new Error(t('voya.account.passwordMismatch')),
                      );
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
}
