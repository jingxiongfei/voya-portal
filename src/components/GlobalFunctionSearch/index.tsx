import {
  ApartmentOutlined,
  ArrowRightOutlined,
  CarOutlined,
  DashboardOutlined,
  MoneyCollectOutlined,
  PercentageOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  SwapOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { history, useIntl } from '@umijs/max';
import {
  Button,
  Empty,
  Flex,
  Input,
  Listy,
  Modal,
  Tag,
  Typography,
} from 'antd';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useStyles } from './style';

type FunctionEntry = {
  descriptionId: string;
  groupId: string;
  icon: ReactNode;
  keywords: string;
  nameId: string;
  path: string;
};

const functionEntries: FunctionEntry[] = [
  {
    path: '/overview',
    nameId: 'menu.overview',
    groupId: 'menu.overview',
    descriptionId: 'voya.overview.subtitle',
    keywords: '工作台 首页 概览 dashboard overview home',
    icon: <DashboardOutlined />,
  },
  {
    path: '/system/departments',
    nameId: 'menu.system.departments',
    groupId: 'menu.system',
    descriptionId: 'voya.department.subtitle',
    keywords: '系统设置 部门 组织 架构 department organisation organization',
    icon: <ApartmentOutlined />,
  },
  {
    path: '/system/roles',
    nameId: 'menu.system.roles',
    groupId: 'menu.system',
    descriptionId: 'voya.role.subtitle',
    keywords: '系统设置 角色 权限 role permission access',
    icon: <SafetyCertificateOutlined />,
  },
  {
    path: '/system/accounts',
    nameId: 'menu.system.accounts',
    groupId: 'menu.system',
    descriptionId: 'voya.account.subtitle',
    keywords: '系统设置 后台 账户 管理员 account admin staff',
    icon: <TeamOutlined />,
  },
  {
    path: '/system/exchange-rates',
    nameId: 'menu.system.exchange-rates',
    groupId: 'menu.system',
    descriptionId: 'voya.exchangeRate.subtitle',
    keywords: '系统设置 汇率 货币 换算 exchange rate currency conversion',
    icon: <SwapOutlined />,
  },
  {
    path: '/users/list',
    nameId: 'menu.users.list',
    groupId: 'menu.users',
    descriptionId: 'voya.user.subtitle',
    keywords: '用户中心 用户 列表 身份 user customer identity',
    icon: <UserOutlined />,
  },
  {
    path: '/users/tags',
    nameId: 'menu.users.tags',
    groupId: 'menu.users',
    descriptionId: 'voya.tag.subtitle',
    keywords: '用户中心 标签 分类 tag label category',
    icon: <TagsOutlined />,
  },
  {
    path: '/operations/coupons',
    nameId: 'menu.operations.coupons',
    groupId: 'menu.operations',
    descriptionId: 'voya.coupon.subtitle',
    keywords: '运营管理 优惠券 折扣 使用记录 coupon discount promotion usage',
    icon: <PercentageOutlined />,
  },
  {
    path: '/finance/payment-receipts',
    nameId: 'menu.finance.payment-receipts',
    groupId: 'menu.finance',
    descriptionId: 'voya.receipt.subtitle',
    keywords:
      '财务管理 收款 明细 支付 流水号 订单 finance payment receipt transaction order',
    icon: <MoneyCollectOutlined />,
  },
  {
    path: '/orders/vehicle',
    nameId: 'menu.orders.vehicle',
    groupId: 'menu.orders',
    descriptionId: 'voya.order.subtitle',
    keywords: '订单中心 用车 订单 采购 渠道 vehicle car order procurement',
    icon: <CarOutlined />,
  },
  {
    path: '/account/security',
    nameId: 'menu.account-security',
    groupId: 'voya.functionSearch.personal',
    descriptionId: 'voya.security.subtitle',
    keywords: '账户安全 密码 修改 password security profile',
    icon: <SafetyCertificateOutlined />,
  },
];

const GlobalFunctionSearch = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const results = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return functionEntries;

    return functionEntries.filter((entry) => {
      const searchableText = [
        intl.formatMessage({ id: entry.nameId }),
        intl.formatMessage({ id: entry.groupId }),
        intl.formatMessage({ id: entry.descriptionId }),
        entry.keywords,
      ]
        .join(' ')
        .toLocaleLowerCase();
      return searchableText.includes(normalizedQuery);
    });
  }, [intl, query]);

  const closeSearch = () => {
    setOpen(false);
    setQuery('');
  };

  const openEntry = (path: string) => {
    closeSearch();
    history.push(path);
  };

  return (
    <div className={styles.headerSlot}>
      <Button
        aria-label={intl.formatMessage({ id: 'voya.functionSearch.trigger' })}
        className={styles.searchTrigger}
        icon={<SearchOutlined />}
        onClick={() => setOpen(true)}
      >
        <span className={styles.triggerContent}>
          <span className={styles.triggerText}>
            {intl.formatMessage({ id: 'voya.functionSearch.trigger' })}
          </span>
          <Typography.Text keyboard className={styles.shortcut}>
            ⌘ K
          </Typography.Text>
        </span>
      </Button>

      <Modal
        centered
        destroyOnHidden
        footer={null}
        open={open}
        title={intl.formatMessage({ id: 'voya.functionSearch.title' })}
        width={640}
        onCancel={closeSearch}
        afterOpenChange={(isOpen) => {
          if (!isOpen) setQuery('');
        }}
      >
        <Input
          allowClear
          autoFocus
          className={styles.modalInput}
          placeholder={intl.formatMessage({
            id: 'voya.functionSearch.placeholder',
          })}
          prefix={<SearchOutlined />}
          size="large"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />

        <Typography.Text type="secondary" className={styles.resultSummary}>
          {intl.formatMessage(
            { id: 'voya.functionSearch.resultSummary' },
            { count: results.length },
          )}
        </Typography.Text>

        {results.length > 0 ? (
          <Listy<FunctionEntry>
            className={styles.results}
            classNames={{ item: styles.resultItem }}
            items={results}
            itemRender={(item) => (
              <Button
                className={styles.resultButton}
                type="text"
                onClick={() => openEntry(item.path)}
              >
                <span className={styles.resultIcon}>{item.icon}</span>
                <Flex className={styles.resultCopy} vertical gap={2}>
                  <Flex align="center" gap="small" wrap>
                    <Typography.Text strong>
                      {intl.formatMessage({ id: item.nameId })}
                    </Typography.Text>
                    <Tag variant="filled">
                      {intl.formatMessage({ id: item.groupId })}
                    </Tag>
                  </Flex>
                  <Typography.Text ellipsis type="secondary">
                    {intl.formatMessage({ id: item.descriptionId })}
                  </Typography.Text>
                </Flex>
                <ArrowRightOutlined className={styles.resultArrow} />
              </Button>
            )}
            rowKey="path"
          />
        ) : (
          <Empty
            className={styles.empty}
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={intl.formatMessage({
              id: 'voya.functionSearch.empty',
            })}
          />
        )}
      </Modal>
    </div>
  );
};

export default GlobalFunctionSearch;
