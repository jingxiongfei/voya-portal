/** Voya Portal route map. Route icons resolve to Ant Design outlined icons. */
export default [
  {
    path: '/user',
    layout: false,
    routes: [
      { path: '/user/login', name: 'login', component: './user/login' },
      { path: '/user', redirect: '/user/login' },
      { path: '/user/*', component: './exception/404' },
    ],
  },
  {
    path: '/overview',
    name: 'overview',
    icon: 'dashboard',
    component: './voya/overview',
  },
  {
    path: '/system',
    name: 'system',
    icon: 'setting',
    routes: [
      { path: '/system', redirect: '/system/departments' },
      {
        path: '/system/departments',
        name: 'departments',
        icon: 'apartment',
        component: './voya/departments',
      },
      {
        path: '/system/roles',
        name: 'roles',
        icon: 'safetyCertificate',
        component: './voya/roles',
      },
      {
        path: '/system/accounts',
        name: 'accounts',
        icon: 'team',
        component: './voya/accounts',
      },
      {
        path: '/system/exchange-rates',
        name: 'exchange-rates',
        icon: 'swap',
        component: './voya/exchange-rates',
      },
    ],
  },
  {
    path: '/users',
    name: 'users',
    icon: 'user',
    routes: [
      { path: '/users', redirect: '/users/list' },
      {
        path: '/users/list',
        name: 'list',
        icon: 'team',
        component: './voya/users',
      },
      {
        path: '/users/tags',
        name: 'tags',
        icon: 'tags',
        component: './voya/tags',
      },
      {
        path: '/users/:id',
        name: 'detail',
        hideInMenu: true,
        component: './voya/user-detail',
      },
    ],
  },
  {
    path: '/operations',
    name: 'operations',
    icon: 'control',
    routes: [
      { path: '/operations', redirect: '/operations/coupons' },
      {
        path: '/operations/coupons',
        name: 'coupons',
        icon: 'percentage',
        component: './voya/coupons',
      },
      {
        path: '/operations/pricing-strategies',
        name: 'pricing-strategies',
        icon: 'calculator',
        component: './voya/pricing-strategies',
      },
      {
        path: '/operations/payment-receipts',
        hideInMenu: true,
        redirect: '/finance/payment-receipts',
      },
    ],
  },
  {
    path: '/finance',
    name: 'finance',
    icon: 'accountBook',
    routes: [
      { path: '/finance', redirect: '/finance/payment-receipts' },
      {
        path: '/finance/payment-receipts',
        name: 'payment-receipts',
        icon: 'moneyCollect',
        component: './voya/payment-receipts',
      },
    ],
  },
  {
    path: '/orders',
    name: 'orders',
    icon: 'car',
    routes: [
      { path: '/orders', redirect: '/orders/vehicle' },
      {
        path: '/orders/vehicle',
        name: 'vehicle',
        icon: 'car',
        component: './voya/vehicle-orders',
      },
      {
        path: '/orders/vehicle/:id',
        name: 'detail',
        hideInMenu: true,
        component: './voya/order-detail',
      },
    ],
  },
  {
    path: '/account/security',
    name: 'account-security',
    hideInMenu: true,
    component: './voya/account-security',
  },
  { path: '/', redirect: '/overview' },
  { path: '*', layout: false, component: './exception/404' },
];
