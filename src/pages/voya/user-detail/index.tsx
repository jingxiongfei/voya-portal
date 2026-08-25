import {
  ArrowLeftOutlined,
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { history, useIntl, useParams } from '@umijs/max';
import {
  Alert,
  App,
  Button,
  Card,
  Descriptions,
  Empty,
  Flex,
  Form,
  Select,
  Space,
  Tag,
  Timeline,
  Typography,
} from 'antd';
import { useMemo, useState } from 'react';
import {
  InitialAvatar,
  LocalizedDateTime,
  RegistrationSourceTag,
  UserStatusTag,
} from '../components';
import {
  getUserDisplayName,
  type MaritalStatus,
  type UserRecord,
  users,
  userTags,
} from '../mockData';
import { useVoyaPageStyles } from '../styles';

const tagMap = new Map(userTags.map((tag) => [tag.id, tag.name]));
const nationalityCodes = ['GB', 'CN', 'US', 'IT', 'JP', 'FR'] as const;
const maritalStatuses: MaritalStatus[] = [
  'single',
  'married',
  'divorced',
  'widowed',
  'undisclosed',
];

type EditableProfileValues = Pick<UserRecord, 'nationality' | 'maritalStatus'>;

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRecord | undefined>(() =>
    users.find((record) => record.id === id),
  );
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm<EditableProfileValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (messageId: string) => intl.formatMessage({ id: messageId });
  const displayName = user ? getUserDisplayName(user, intl.locale) : '';

  const nationalityOptions = useMemo(
    () =>
      nationalityCodes.map((code) => ({
        value: code,
        label: `${t(`voya.country.${code}`)} (${code})`,
      })),
    [intl.locale],
  );
  const maritalStatusOptions = useMemo(
    () =>
      maritalStatuses.map((status) => ({
        value: status,
        label: t(`voya.user.maritalStatus.${status}`),
      })),
    [intl.locale],
  );

  const startEditing = () => {
    if (!user) return;
    form.setFieldsValue({
      nationality: user.nationality,
      maritalStatus: user.maritalStatus,
    });
    setEditing(true);
  };

  const cancelEditing = () => {
    form.resetFields();
    setEditing(false);
  };

  const saveProfile = async () => {
    const values = await form.validateFields();
    setUser((current) => (current ? { ...current, ...values } : current));
    setEditing(false);
    message.success(t('voya.common.saved'));
  };

  if (!user) {
    return (
      <PageContainer title={t('voya.user.detail')}>
        <Card className={styles.surfaceCard}>
          <Empty>
            <Button onClick={() => history.push('/users/list')}>
              {t('voya.common.back')}
            </Button>
          </Empty>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer
      title={t('voya.user.detail')}
      onBack={() => history.push('/users/list')}
      extra={[
        <Button
          key="back"
          icon={<ArrowLeftOutlined />}
          onClick={() => history.push('/users/list')}
        >
          {t('voya.common.back')}
        </Button>,
      ]}
    >
      <div className={styles.stack}>
        <Alert showIcon type="warning" title={t('voya.user.readOnly')} />
        <Card className={styles.profileCard}>
          <div className={styles.profileHeader}>
            <InitialAvatar name={displayName} size={64} />
            <div className={styles.profileIdentity}>
              <Flex align="center" gap="small" wrap>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {displayName}
                </Typography.Title>
                <UserStatusTag status={user.status} />
              </Flex>
              <Typography.Text className={styles.code}>
                {user.id}
              </Typography.Text>
              <Space wrap>
                <Typography.Text type="secondary">
                  <PhoneOutlined /> {user.countryCode} {user.phone}
                </Typography.Text>
                <Typography.Text type="secondary">
                  <MailOutlined /> {user.email}
                </Typography.Text>
              </Space>
            </div>
          </div>
        </Card>

        <div className={styles.detailGrid}>
          <Card
            className={styles.surfaceCard}
            title={t('voya.user.profile')}
            extra={
              editing ? (
                <Space size="small">
                  <Button icon={<CloseOutlined />} onClick={cancelEditing}>
                    {t('voya.common.cancel')}
                  </Button>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={saveProfile}
                  >
                    {t('voya.common.save')}
                  </Button>
                </Space>
              ) : (
                <Button icon={<EditOutlined />} onClick={startEditing}>
                  {t('voya.common.edit')}
                </Button>
              )
            }
          >
            <Form form={form} component={false}>
              <Descriptions
                column={{ xs: 1, sm: 1, md: 2 }}
                items={[
                  {
                    key: 'id',
                    label: t('voya.user.id'),
                    children: (
                      <Typography.Text copyable>{user.id}</Typography.Text>
                    ),
                  },
                  {
                    key: 'chineseName',
                    label: t('voya.user.chineseName'),
                    children: user.chineseName ?? (
                      <Typography.Text type="secondary">
                        {t('voya.common.notProvided')}
                      </Typography.Text>
                    ),
                  },
                  {
                    key: 'englishGivenName',
                    label: t('voya.user.englishGivenName'),
                    children: user.englishGivenName,
                  },
                  {
                    key: 'englishFamilyName',
                    label: t('voya.user.englishFamilyName'),
                    children: user.englishFamilyName,
                  },
                  {
                    key: 'nationality',
                    label: t('voya.user.nationality'),
                    children: editing ? (
                      <Form.Item
                        name="nationality"
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: t('voya.common.required'),
                          },
                        ]}
                      >
                        <Select
                          aria-label={t('voya.user.nationality')}
                          size="small"
                          style={{ width: 180 }}
                          showSearch={{ optionFilterProp: 'label' }}
                          options={nationalityOptions}
                        />
                      </Form.Item>
                    ) : (
                      `${t(`voya.country.${user.nationality}`)} (${user.nationality})`
                    ),
                  },
                  {
                    key: 'gender',
                    label: t('voya.user.gender'),
                    children: t(`voya.user.gender.${user.gender}`),
                  },
                  {
                    key: 'maritalStatus',
                    label: t('voya.user.maritalStatus'),
                    children: editing ? (
                      <Form.Item
                        name="maritalStatus"
                        noStyle
                        rules={[
                          {
                            required: true,
                            message: t('voya.common.required'),
                          },
                        ]}
                      >
                        <Select
                          aria-label={t('voya.user.maritalStatus')}
                          size="small"
                          style={{ width: 180 }}
                          options={maritalStatusOptions}
                        />
                      </Form.Item>
                    ) : (
                      t(`voya.user.maritalStatus.${user.maritalStatus}`)
                    ),
                  },
                  {
                    key: 'birthDate',
                    label: t('voya.user.birthDate'),
                    children: (
                      <LocalizedDateTime value={user.birthDate} dateOnly />
                    ),
                  },
                  {
                    key: 'phone',
                    label: t('voya.common.phone'),
                    children: `${user.countryCode} ${user.phone}`,
                  },
                  {
                    key: 'email',
                    label: t('voya.common.email'),
                    children: user.email,
                  },
                  {
                    key: 'status',
                    label: t('voya.common.status'),
                    children: <UserStatusTag status={user.status} />,
                  },
                  {
                    key: 'source',
                    label: t('voya.common.source'),
                    children: <RegistrationSourceTag source={user.source} />,
                  },
                ]}
              />
            </Form>
          </Card>

          <Card
            className={styles.surfaceCard}
            title={t('voya.user.registration')}
          >
            <Descriptions
              column={1}
              items={[
                {
                  key: 'source',
                  label: t('voya.common.source'),
                  children: <RegistrationSourceTag source={user.source} />,
                },
                {
                  key: 'registeredAt',
                  label: t('voya.user.registeredAt'),
                  children: <LocalizedDateTime value={user.registeredAt} />,
                },
              ]}
            />
          </Card>

          <Card className={styles.surfaceCard} title={t('voya.user.socials')}>
            <Descriptions
              column={1}
              items={user.socials.map((social) => ({
                key: `${social.platform}-${social.account}`,
                label: social.platform,
                children: social.account,
              }))}
            />
          </Card>

          <Card className={styles.surfaceCard} title={t('voya.user.tags')}>
            <Space wrap>
              {user.tagIds.map((tagId) => (
                <Tag key={tagId}>{tagMap.get(tagId)}</Tag>
              ))}
            </Space>
          </Card>

          <Card
            className={styles.surfaceCard}
            title={t('voya.user.registrationTimeline')}
            style={{ gridColumn: '1 / -1' }}
          >
            <Timeline
              items={[
                {
                  content: (
                    <>
                      <Typography.Text strong>
                        {t('voya.user.identityCreated')}
                      </Typography.Text>
                      <div className={styles.muted}>
                        <LocalizedDateTime value={user.registeredAt} />
                      </div>
                    </>
                  ),
                },
                {
                  content: (
                    <>
                      <Typography.Text strong>
                        {t('voya.user.sourceConnected')}
                      </Typography.Text>
                      <div className={styles.muted}>
                        <RegistrationSourceTag source={user.source} />
                      </div>
                    </>
                  ),
                },
              ]}
            />
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
