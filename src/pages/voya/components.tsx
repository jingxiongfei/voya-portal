import { FilterOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useIntl } from '@umijs/max';
import { Avatar, Card, Flex, Space, Statistic, Tag, Typography } from 'antd';
import dayjs from 'dayjs';
import type { ReactNode } from 'react';
import type { DemoUserStatus, RegistrationSource } from './mockData';
import { useVoyaPageStyles } from './styles';

const statusColor: Record<DemoUserStatus, string> = {
  active: 'success',
  pending: 'warning',
  restricted: 'error',
};

const sourceColor: Record<RegistrationSource, string> = {
  app: 'blue',
  api: 'purple',
  partner: 'cyan',
};

export const UserStatusTag = ({ status }: { status: DemoUserStatus }) => {
  const intl = useIntl();
  return (
    <Tag color={statusColor[status]}>
      {intl.formatMessage({ id: `voya.user.status.${status}` })}
    </Tag>
  );
};

export const RegistrationSourceTag = ({
  source,
}: {
  source: RegistrationSource;
}) => {
  const intl = useIntl();
  return (
    <Tag color={sourceColor[source]}>
      {intl.formatMessage({ id: `voya.user.source.${source}` })}
    </Tag>
  );
};

export const InitialAvatar = ({
  name,
  size = 40,
}: {
  name: string;
  size?: number;
}) => {
  const { styles } = useVoyaPageStyles();
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Avatar size={size} className={styles.avatar}>
      {initials}
    </Avatar>
  );
};

export const MetricCard = ({
  icon,
  title,
  value,
  note,
}: {
  icon: ReactNode;
  title: ReactNode;
  value: number;
  note: ReactNode;
}) => {
  const { styles } = useVoyaPageStyles();
  return (
    <Card className={styles.metricCard} variant="borderless">
      <Flex justify="space-between" align="flex-start" gap="middle">
        <Statistic title={title} value={value} />
        <span className={styles.metricIcon}>{icon}</span>
      </Flex>
      <Typography.Text type="secondary" className={styles.metricNote}>
        {note}
      </Typography.Text>
    </Card>
  );
};

export const FilterCard = ({
  children,
  compact = false,
}: {
  children: ReactNode;
  compact?: boolean;
}) => {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  return (
    <Card
      size={compact ? 'small' : 'medium'}
      className={styles.filterCard}
      title={
        <span className={styles.sectionTitle}>
          <FilterOutlined className={styles.sectionIcon} />
          {intl.formatMessage({ id: 'voya.common.filters' })}
        </span>
      }
    >
      {children}
    </Card>
  );
};

export const DataCard = ({
  title,
  count,
  extra,
  children,
}: {
  title: ReactNode;
  count: number;
  extra?: ReactNode;
  children: ReactNode;
}) => {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  return (
    <Card
      className={styles.dataCard}
      title={
        <span className={styles.sectionTitle}>
          <UnorderedListOutlined className={styles.sectionIcon} />
          {title}
        </span>
      }
      extra={
        <Space size="middle">
          <Typography.Text type="secondary">
            {intl.formatMessage({ id: 'voya.common.total' }, { count })}
          </Typography.Text>
          {extra}
        </Space>
      }
    >
      {children}
    </Card>
  );
};

export const LocalizedDateTime = ({
  value,
  dateOnly = false,
}: {
  value: string;
  dateOnly?: boolean;
}) => {
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const parsed = dayjs(value.replace(' ', 'T'));
  if (!parsed.isValid()) return <span>{value}</span>;

  return (
    <time
      className={styles.dateTime}
      dateTime={dateOnly ? value : parsed.toISOString()}
    >
      {intl.formatDate(parsed.toDate(), {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...(dateOnly
          ? {}
          : {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            }),
      })}
    </time>
  );
};
