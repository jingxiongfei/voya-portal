import {
  ApartmentOutlined,
  CarOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl } from '@umijs/max';
import type { TableColumnsType } from 'antd';
import { Alert, Button, Flex, Table, Typography } from 'antd';
import {
  compactTablePagination,
  DataCard,
  InitialAvatar,
  LocalizedDateTime,
  MetricCard,
  RegistrationSourceTag,
  UserStatusTag,
} from '../components';
import {
  departments,
  getUserDisplayName,
  roles,
  type UserRecord,
  users,
  type VehicleOrderRecord,
  vehicleOrders,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

export default function OverviewPage() {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string, values?: Record<string, number>) =>
    intl.formatMessage({ id }, values);

  const userColumns: TableColumnsType<UserRecord> = [
    {
      title: t('voya.common.name'),
      key: 'name',
      render: (_, record) => {
        const displayName = getUserDisplayName(record, intl.locale);
        return (
          <Flex align="center" gap="small">
            <InitialAvatar name={displayName} size={34} />
            <div>
              <Typography.Text strong>{displayName}</Typography.Text>
              <div className={styles.code}>{record.id}</div>
            </div>
          </Flex>
        );
      },
    },
    {
      title: t('voya.common.source'),
      dataIndex: 'source',
      render: (source) => <RegistrationSourceTag source={source} />,
    },
    {
      title: t('voya.common.status'),
      dataIndex: 'status',
      render: (status) => <UserStatusTag status={status} />,
    },
    {
      title: t('voya.user.registeredAt'),
      dataIndex: 'registeredAt',
      render: (value) => <LocalizedDateTime value={value} />,
    },
  ];

  const orderColumns: TableColumnsType<VehicleOrderRecord> = [
    {
      title: t('voya.order.id'),
      dataIndex: 'id',
      render: (value) => <Typography.Text copyable>{value}</Typography.Text>,
    },
    { title: t('voya.order.customerName'), dataIndex: 'customerName' },
    {
      title: t('voya.order.procurementChannel'),
      dataIndex: 'procurementChannel',
    },
    {
      title: t('voya.order.orderedAt'),
      dataIndex: 'orderedAt',
      render: (value) => <LocalizedDateTime value={value} />,
    },
  ];

  return (
    <PageContainer
      title={t('voya.overview.title')}
      subTitle={t('voya.overview.subtitle')}
    >
      <div className={styles.stack}>
        <Alert showIcon type="info" title={t('voya.common.demoNotice')} />
        <div className={styles.metrics}>
          <MetricCard
            icon={<TeamOutlined />}
            title={t('voya.overview.users')}
            value={24862}
            note={t('voya.overview.userNote')}
          />
          <MetricCard
            icon={<CarOutlined />}
            title={t('voya.overview.ordersToday')}
            value={
              vehicleOrders.filter((order) =>
                order.orderedAt.startsWith('2026-08-21'),
              ).length
            }
            note={t('voya.overview.orderNote')}
          />
          <MetricCard
            icon={<ApartmentOutlined />}
            title={t('voya.overview.departments')}
            value={departments.length}
            note={t('voya.overview.departmentNote')}
          />
          <MetricCard
            icon={<SafetyCertificateOutlined />}
            title={t('voya.overview.roles')}
            value={roles.length}
            note={t('voya.overview.roleNote')}
          />
        </div>
        <DataCard
          title={t('voya.overview.recentUsers')}
          count={users.length}
          extra={
            <Button type="link" onClick={() => history.push('/users/list')}>
              {t('voya.overview.viewAll')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={userColumns}
            dataSource={users.slice(0, 4)}
            pagination={compactTablePagination}
            size="middle"
            scroll={{ x: 720 }}
          />
        </DataCard>
        <DataCard
          title={t('voya.overview.recentOrders')}
          count={vehicleOrders.length}
          extra={
            <Button type="link" onClick={() => history.push('/orders/vehicle')}>
              {t('voya.overview.viewAll')}
            </Button>
          }
        >
          <Table
            rowKey="id"
            columns={orderColumns}
            dataSource={vehicleOrders.slice(0, 4)}
            pagination={compactTablePagination}
            size="middle"
            scroll={{ x: 720 }}
          />
        </DataCard>
      </div>
    </PageContainer>
  );
}
