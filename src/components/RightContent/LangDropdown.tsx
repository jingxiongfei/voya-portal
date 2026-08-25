import { CheckOutlined, GlobalOutlined } from '@ant-design/icons';
import { getLocale, setLocale, useIntl } from '@umijs/max';
import type { MenuProps } from 'antd';
import { Button } from 'antd';
import HeaderDropdown from '../HeaderDropdown';
import useHeaderActionStyles from './style';

const supportLocales = ['zh-CN', 'en-US'] as const;

const localeLabelMap: Record<(typeof supportLocales)[number], string> = {
  'zh-CN': '简体中文',
  'en-US': 'English',
};

const onLangClick: MenuProps['onClick'] = ({ key }) => {
  if (key.startsWith('lang-')) {
    setLocale(key.replace('lang-', ''), false);
  }
};

export const LangDropdown: React.FC = () => {
  const { styles } = useHeaderActionStyles();
  const intl = useIntl();
  const currentLocale = getLocale();

  if (supportLocales.length <= 1) {
    return null;
  }

  const langItems: MenuProps['items'] = supportLocales.map((locale) => ({
    key: `lang-${locale}`,
    icon:
      locale === currentLocale ? (
        <CheckOutlined style={{ color: '#52c41a' }} />
      ) : (
        <span style={{ display: 'inline-block', width: 14 }} />
      ),
    label: localeLabelMap[locale],
  }));

  return (
    <HeaderDropdown
      placement="bottomRight"
      arrow
      menu={{
        selectedKeys: [`lang-${currentLocale}`],
        onClick: onLangClick,
        items: langItems,
        style: { minWidth: 180 },
      }}
    >
      <Button
        type="text"
        className={styles.action}
        icon={<GlobalOutlined />}
        aria-label={intl.formatMessage({
          id: 'component.globalHeader.languageSwitch',
        })}
      >
        {intl.formatMessage({ id: 'component.globalHeader.language' })}
      </Button>
    </HeaderDropdown>
  );
};
