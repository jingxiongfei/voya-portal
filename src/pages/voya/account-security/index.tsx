import { LockOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import { Alert, App, Button, Card, Form, Input } from 'antd';
import { useVoyaPageStyles } from '../styles';

type PasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function AccountSecurityPage() {
  const [form] = Form.useForm<PasswordValues>();
  const { message } = App.useApp();
  const intl = useIntl();
  const { styles } = useVoyaPageStyles();
  const t = (id: string) => intl.formatMessage({ id });

  const submit = async () => {
    await form.validateFields();
    message.success(t('voya.security.success'));
    form.resetFields();
  };

  return (
    <PageContainer
      title={t('voya.security.title')}
      subTitle={t('voya.security.subtitle')}
    >
      <div className={styles.stack} style={{ maxWidth: 760 }}>
        <Alert showIcon type="warning" title={t('voya.security.notice')} />
        <Card
          className={styles.surfaceCard}
          title={t('voya.security.formTitle')}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={submit}
            style={{ maxWidth: 520 }}
          >
            <Form.Item
              name="currentPassword"
              label={t('voya.security.currentPassword')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                autoComplete="current-password"
              />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label={t('voya.security.newPassword')}
              rules={[{ required: true, message: t('voya.common.required') }]}
            >
              <Input.Password
                prefix={<SafetyCertificateOutlined />}
                autoComplete="new-password"
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              label={t('voya.security.confirmPassword')}
              dependencies={['newPassword']}
              rules={[
                { required: true, message: t('voya.common.required') },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    return !value || getFieldValue('newPassword') === value
                      ? Promise.resolve()
                      : Promise.reject(
                          new Error(t('voya.account.passwordMismatch')),
                        );
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<SafetyCertificateOutlined />}
                autoComplete="new-password"
              />
            </Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SafetyCertificateOutlined />}
            >
              {t('voya.security.submit')}
            </Button>
          </Form>
        </Card>
      </div>
    </PageContainer>
  );
}
