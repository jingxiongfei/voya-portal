import { LockOutlined, MobileOutlined, UserOutlined } from '@ant-design/icons';
import {
  LoginForm,
  ProFormCaptcha,
  ProFormText,
} from '@ant-design/pro-components';
import { Helmet, useIntl, useModel } from '@umijs/max';
import { Alert, App, Image, Select, Tabs, Typography } from 'antd';
import React, { startTransition, useState } from 'react';
import { LangDropdown } from '@/components/RightContent/LangDropdown';
import { login } from '@/services/ant-design-pro/api';
import { getFakeCaptcha } from '@/services/ant-design-pro/login';
import {
  isDemoAuthenticationEnabled,
  loginWithDemoAccount,
} from '@/services/demoAuth';
import Settings from '../../../../config/defaultSettings';
import { useVoyaPageStyles } from '../../voya/styles';

const getSafeRedirectUrl = (redirect: string | null): string => {
  if (!redirect?.startsWith('/') || redirect.startsWith('//'))
    return '/overview';
  try {
    const parsed = new URL(redirect, window.location.origin);
    if (parsed.origin !== window.location.origin) return '/overview';
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return '/overview';
  }
};

const countryCodes = ['+86', '+1', '+44', '+65', '+33', '+81'].map((value) => ({
  label: value,
  value,
}));

const Login: React.FC = () => {
  const [loginState, setLoginState] = useState<API.LoginResult>({});
  const [type, setType] = useState('account');
  const { initialState, setInitialState } = useModel('@@initialState');
  const { styles } = useVoyaPageStyles();
  const { message } = App.useApp();
  const intl = useIntl();

  const t = (id: string) => intl.formatMessage({ id });

  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      startTransition(() => {
        setInitialState((state) => ({ ...state, currentUser: userInfo }));
      });
    }
  };

  const handleSubmit = async (values: API.LoginParams) => {
    try {
      const loginParams = { ...values, type };
      const result = isDemoAuthenticationEnabled
        ? await loginWithDemoAccount(loginParams)
        : await login(loginParams);
      if (result.status === 'ok') {
        message.success(t('voya.login.success'));
        await fetchUserInfo();
        const redirect = new URL(window.location.href).searchParams.get(
          'redirect',
        );
        window.location.href = getSafeRedirectUrl(redirect);
        return;
      }
      setLoginState(result);
    } catch {
      message.error(t('voya.login.failure'));
    }
  };

  const hasError = loginState.status === 'error' && loginState.type === type;

  return (
    <main className={styles.loginShell}>
      <Helmet>
        <title>{`${t('menu.login')} - ${Settings.title}`}</title>
      </Helmet>
      <section className={styles.loginStory}>
        <div className={styles.loginBrandLogo}>
          <Image
            alt="Voya Explore"
            height={34}
            preview={false}
            src={Settings.logo}
          />
        </div>

        <div className={styles.loginStoryBody} style={{ maxWidth: 620 }}>
          <Typography.Title
            level={1}
            style={{
              color: '#fff',
              fontSize: 'clamp(36px, 4.5vw, 64px)',
              lineHeight: 1.12,
            }}
          >
            {t('voya.login.storyTitle')}
          </Typography.Title>
          <Typography.Paragraph
            style={{ color: 'rgba(255,255,255,.72)', fontSize: 18 }}
          >
            {t('voya.login.storyDescription')}
          </Typography.Paragraph>
        </div>

        <Typography.Text
          className={styles.loginStoryFooter}
          style={{ color: 'rgba(255,255,255,.54)' }}
        >
          © {new Date().getFullYear()} Voya Explore
        </Typography.Text>
      </section>

      <section className={styles.loginPanel}>
        <div style={{ position: 'absolute', right: 24, top: 20 }} data-lang>
          <LangDropdown />
        </div>
        <div className={styles.loginFormWrap}>
          <Typography.Title level={2} style={{ marginBottom: 8 }}>
            {t('voya.login.welcome')}
          </Typography.Title>
          <Typography.Paragraph type="secondary" style={{ marginBottom: 28 }}>
            {t('voya.login.welcomeSubtitle')}
          </Typography.Paragraph>

          <LoginForm
            contentStyle={{ width: '100%', maxWidth: 'none' }}
            submitter={{
              searchConfig: { submitText: t('voya.login.submit') },
              submitButtonProps: { block: true, size: 'large' },
            }}
            onFinish={async (values) => handleSubmit(values as API.LoginParams)}
          >
            <Tabs
              activeKey={type}
              onChange={(key) => {
                setType(key);
                setLoginState({});
              }}
              items={[
                { key: 'account', label: t('voya.login.accountTab') },
                { key: 'mobile', label: t('voya.login.mobileTab') },
              ]}
            />

            {hasError && (
              <Alert
                showIcon
                type="error"
                title={t(
                  type === 'account'
                    ? 'voya.login.accountError'
                    : 'voya.login.mobileError',
                )}
                style={{ marginBottom: 24 }}
              />
            )}

            {type === 'account' ? (
              <>
                <ProFormText
                  name="username"
                  placeholder={t('voya.login.username')}
                  fieldProps={{ size: 'large', prefix: <UserOutlined /> }}
                  rules={[
                    {
                      required: true,
                      message: t('voya.login.requiredUsername'),
                    },
                  ]}
                />
                <ProFormText.Password
                  name="password"
                  placeholder={t('voya.login.password')}
                  fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                  rules={[
                    {
                      required: true,
                      message: t('voya.login.requiredPassword'),
                    },
                  ]}
                />
                <Alert type="info" showIcon title={t('voya.login.demoHint')} />
              </>
            ) : (
              <>
                <ProFormText
                  name="mobile"
                  placeholder={t('voya.login.mobile')}
                  fieldProps={{
                    size: 'large',
                    prefix: <MobileOutlined />,
                    addonBefore: (
                      <Select
                        defaultValue="+86"
                        options={countryCodes}
                        variant="borderless"
                        style={{ width: 82 }}
                      />
                    ),
                  }}
                  rules={[
                    { required: true, message: t('voya.login.requiredMobile') },
                    {
                      pattern: /^\d{6,15}$/,
                      message: t('voya.login.mobileInvalid'),
                    },
                  ]}
                />
                <ProFormCaptcha
                  name="captcha"
                  placeholder={t('voya.login.captcha')}
                  fieldProps={{ size: 'large', prefix: <LockOutlined /> }}
                  captchaProps={{ size: 'large' }}
                  captchaTextRender={() => t('voya.login.getCaptcha')}
                  rules={[
                    {
                      required: true,
                      message: t('voya.login.requiredCaptcha'),
                    },
                  ]}
                  onGetCaptcha={async (phone) => {
                    await getFakeCaptcha({ phone });
                    message.success(t('voya.login.captchaSent'));
                  }}
                />
              </>
            )}
          </LoginForm>
        </div>
      </section>
    </main>
  );
};

export default Login;
