import { EyeOutlined, SearchOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import {
  Alert,
  Button,
  ConfigProvider,
  Form,
  Input,
  Select,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd';
import { useState } from 'react';
import {
  DataCard,
  FilterCard,
  LocalizedDateTime,
  RegistrationSourceTag,
  UserStatusTag,
} from '../components';
import {
  type DemoUserStatus,
  getUserDisplayName,
  getUserEnglishName,
  type RegistrationSource,
  type UserRecord,
  users,
  userTags,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

type FilterValues = {
  keyword?: string;
  status?: DemoUserStatus;
  source?: RegistrationSource;
};
const tagMap = new Map(userTags.map((tag) => [tag.id, tag.name]));

export default function UsersPage() {
  const [filters, setFilters] = useState<FilterValues>({});
  const [form] = Form.useForm<FilterValues>();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });
  const filteredUsers = users.filter((user) => {
    const keyword = filters.keyword?.trim().toLowerCase();
    return (
      (!keyword ||
        [
          user.id,
          user.chineseName,
          user.englishGivenName,
          user.englishFamilyName,
          getUserEnglishName(user),
          user.phone,
          user.email,
        ]
          .join(' ')
          .toLowerCase()
          .includes(keyword)) &&
      (!filters.status || user.status === filters.status) &&
      (!filters.source || user.source === filters.source)
    );
  });

  const columns: TableColumnsType<UserRecord> = [
    {
      title: t('voya.common.name'),
      key: 'name',
      fixed: 'left',
      width: 210,
      render: (_, record) => {
        const displayName = getUserDisplayName(record, intl.locale);
        return <Typography.Text strong>{displayName}</Typography.Text>;
      },
    },
    {
      title: t('voya.user.id'),
      dataIndex: 'id',
      width: 130,
      render: (value) => (
        <Typography.Text className={styles.code} copyable={{ text: value }}>
          {value}
        </Typography.Text>
      ),
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      width: 90,
      render: (status) => <UserStatusTag status={status} />,
    },
    {
      title: t('voya.common.source'),
      dataIndex: 'source',
      width: 100,
      render: (source) => <RegistrationSourceTag source={source} />,
    },
    {
      title: t('voya.common.phone'),
      dataIndex: 'phone',
      width: 170,
      render: (value, record) => {
        const phoneNumber = `${record.countryCode} ${value}`;
        return (
          <Typography.Text copyable={{ text: phoneNumber }}>
            {phoneNumber}
          </Typography.Text>
        );
      },
    },
    {
      title: t('voya.common.email'),
      dataIndex: 'email',
      width: 240,
      render: (value) => (
        <Typography.Text copyable={{ text: value }}>{value}</Typography.Text>
      ),
    },
    { title: t('voya.user.nationality'), dataIndex: 'nationality', width: 90 },
    {
      title: t('voya.user.tags'),
      dataIndex: 'tagIds',
      width: 220,
      render: (tagIds: string[]) =>
        tagIds.map((id) => <Tag key={id}>{tagMap.get(id)}</Tag>),
    },
    {
      title: t('voya.user.registeredAt'),
      dataIndex: 'registeredAt',
      width: 180,
      render: (value) => <LocalizedDateTime value={value} />,
    },
    {
      title: t('voya.common.actions'),
      key: 'actions',
      fixed: 'right',
      width: 110,
      render: (_, record) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => history.push(`/users/${record.id}`)}
        >
          {t('voya.common.view')}
        </Button>
      ),
    },
  ];

  return (
    <PageContainer
      title={t('voya.user.title')}
      subTitle={t('voya.user.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.user.notice')} />
        <FilterCard>
          <Form
            form={form}
            layout="vertical"
            onFinish={setFilters}
            className={styles.filterGrid}
          >
            <Form.Item name="keyword" label={t('voya.common.name')}>
              <Input allowClear prefix={<SearchOutlined />} />
            </Form.Item>
            <Form.Item name="status" label={t('voya.common.status')}>
              <Select
                allowClear
                options={(
                  ['active', 'pending', 'restricted'] as DemoUserStatus[]
                ).map((value) => ({
                  value,
                  label: t(`voya.user.status.${value}`),
                }))}
              />
            </Form.Item>
            <Form.Item name="source" label={t('voya.common.source')}>
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
            <div className={styles.filterActions}>
              <Space>
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
        <DataCard title={t('voya.user.list')} count={filteredUsers.length}>
          <ConfigProvider
            theme={{ components: { Table: { cellPaddingBlockSM: 2 } } }}
          >
            <Table
              rowKey="id"
              columns={columns}
              dataSource={filteredUsers}
              pagination={{
                defaultPageSize: 10,
                hideOnSinglePage: false,
                pageSizeOptions: [10, 20, 50],
                showQuickJumper: true,
                showSizeChanger: true,
              }}
              size="small"
              scroll={{ x: 1540 }}
            />
          </ConfigProvider>
        </DataCard>
      </div>
    </PageContainer>
  );
}
