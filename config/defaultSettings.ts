import type { ProLayoutProps } from '@ant-design/pro-components';

/**
 * @name
 */
const Settings: ProLayoutProps & {
  logo?: string;
} = {
  navTheme: 'light',
  colorPrimary: '#1677ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: true,
  fixSiderbar: true,
  colorWeak: false,
  title: 'Voya Portal',
  logo: '/voya-explore-logo.png',
  headerTitleRender: (logo) => logo,
  siderWidth: 230,
  menu: {
    collapsedWidth: 72,
  },
  iconfontUrl: '',
  token: {
    header: {
      colorBgHeader: '#E6EDF5',
      colorBgScrollHeader: '#E6EDF5',
    },
    pageContainer: {
      paddingInlinePageContainerContent: 24,
      paddingBlockPageContainerContent: 16,
    },
    sider: {
      colorMenuBackground: '#E6EDF5',
      paddingBlockLayoutMenu: 8,
    },
  },
};

export default Settings;
