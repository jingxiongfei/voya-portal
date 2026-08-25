import { LogoutOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { history, useIntl, useModel } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Spin } from 'antd';
import React, { startTransition } from 'react';
import { outLogin } from '@/services/ant-design-pro/api';
import {
  isDemoAuthenticationEnabled,
  logoutDemoAccount,
} from '@/services/demoAuth';
import HeaderDropdown from '../HeaderDropdown';

type GlobalHeaderRightProps = {
  children?: React.ReactNode;
};

const loginOut = async () => {
  if (isDemoAuthenticationEnabled) {
    logoutDemoAccount();
  } else {
    try {
      await outLogin();
    } catch {
      // Local logout has already cleared user state; redirect should still proceed.
    }
  }
  const { search, pathname } = window.location;
  const urlParams = new URL(window.location.href).searchParams;
  const searchParams = new URLSearchParams({
    redirect: pathname + search,
  });
  const redirect = urlParams.get('redirect');
  if (window.location.pathname !== '/user/login' && !redirect) {
    history.replace({
      pathname: '/user/login',
      search: searchParams.toString(),
    });
  }
};

export const AvatarDropdown: React.FC<GlobalHeaderRightProps> = ({
  children,
}) => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const intl = useIntl();

  const menuItems: MenuProps['items'] = [
    {
      key: 'security',
      icon: <SafetyCertificateOutlined />,
      label: intl.formatMessage({ id: 'voya.header.accountSecurity' }),
    },
    { type: 'divider' as const },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: intl.formatMessage({ id: 'voya.header.logout' }),
    },
  ];

  const onMenuClick: MenuProps['onClick'] = (event) => {
    const { key } = event;
    if (key === 'logout') {
      startTransition(() => {
        setInitialState((s) => ({ ...s, currentUser: undefined }));
      });
      loginOut();
      return;
    }
    history.push(`/account/${key}`);
  };

  if (!initialState) {
    return <Spin size="small" />;
  }

  const { currentUser } = initialState;

  if (!currentUser) {
    return <Spin size="small" />;
  }

  return (
    <HeaderDropdown
      placement="bottomRight"
      menu={{
        selectedKeys: [],
        onClick: onMenuClick,
        items: menuItems,
      }}
      arrow
    >
      {children}
    </HeaderDropdown>
  );
};
