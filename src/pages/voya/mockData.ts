import dayjs from 'dayjs';

export type DemoUserStatus = 'active' | 'pending' | 'restricted';
export type RegistrationSource = 'app' | 'api' | 'partner';
export type Gender = 'female' | 'male' | 'nonBinary' | 'undisclosed';
export type MaritalStatus =
  | 'single'
  | 'married'
  | 'divorced'
  | 'widowed'
  | 'undisclosed';

export type DepartmentRecord = {
  id: string;
  name: string;
  code: string;
  owner: string;
  memberCount: number;
  roleCount: number;
  updatedAt: string;
};

export type RoleRecord = {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  permissions: string[];
  updatedAt: string;
};

export type AccountRecord = {
  id: string;
  name: string;
  username: string;
  departmentId: string;
  roleId: string;
  countryCode: string;
  phone: string;
  email: string;
  lastLoginAt: string;
};

export type SocialAccount = {
  platform: string;
  account: string;
};

export type UserRecord = {
  id: string;
  chineseName?: string;
  englishGivenName: string;
  englishFamilyName: string;
  status: DemoUserStatus;
  source: RegistrationSource;
  registeredAt: string;
  nationality: string;
  gender: Gender;
  maritalStatus: MaritalStatus;
  countryCode: string;
  phone: string;
  birthDate: string;
  email: string;
  socials: SocialAccount[];
  tagIds: string[];
};

export const getUserEnglishName = (user: UserRecord) =>
  `${user.englishGivenName} ${user.englishFamilyName}`.trim();

export const getUserDisplayName = (user: UserRecord, locale: string) =>
  locale.startsWith('zh') && user.chineseName
    ? user.chineseName
    : getUserEnglishName(user);

export type UserTagRecord = {
  id: string;
  name: string;
  description: string;
  userCount: number;
  updatedAt: string;
};

export type VehicleOrderStatus = 'pendingPayment' | 'paid';

export type VehicleOrderRecord = {
  id: string;
  entryChannel: string;
  procurementChannel: string;
  customerName: string;
  countryCode: string;
  customerPhone: string;
  purchaseOrderNo: string;
  thirdPartyOrderNo: string;
  orderType: 'vehicle';
  amount: number;
  currency: 'USD' | 'CNY' | 'EUR' | 'JPY';
  orderedAt: string;
  status: VehicleOrderStatus;
  paymentTimeRemaining?: string;
};

export type VehiclePaymentMethod =
  | 'creditCard'
  | 'digitalWallet'
  | 'bankTransfer';
export type VehicleServiceType =
  | 'multiDayCharter'
  | 'airportTransfer'
  | 'pointToPoint';
export type VehicleCategory = 'businessVan' | 'sedan' | 'suv';
export type OrderLogActorType = 'system' | 'consumer' | 'portal';
export type OrderLogAction =
  | 'orderCreated'
  | 'paymentRecorded'
  | 'procurementSubmitted'
  | 'orderReviewed';

export type OrderContact = {
  userId: string;
  givenName: string;
  familyName: string;
  countryCode: string;
  phone: string;
  email: string;
};

export type CouponUsageRecord = {
  id: string;
  code: string;
  discountAmount: number;
  currency: VehicleOrderRecord['currency'];
  usedAt: string;
};

export type VehiclePaymentRecord = {
  id: string;
  currency: VehicleOrderRecord['currency'];
  method: VehiclePaymentMethod;
  paidAmount: number;
  paidAt: string;
  transactionId: string;
};

export type VehicleOrderDetailRecord = {
  orderId: string;
  booker: OrderContact;
  payment: {
    payableAmount: number;
    records: VehiclePaymentRecord[];
    coupons: CouponUsageRecord[];
  };
  booking: {
    serviceType: VehicleServiceType;
    city: string;
    startDate: string;
    endDate: string;
    departureTime: string;
    vehicleCategory: VehicleCategory;
    travelerCount: number;
    luggageCount: number;
  };
  travelers: OrderContact[];
  itinerary: Array<{
    id: string;
    date: string;
    stops: Array<{
      id: string;
      type: 'origin' | 'waypoint' | 'destination';
      name: string;
      time?: string;
    }>;
  }>;
  logs: Array<{
    id: string;
    at: string;
    actorType: OrderLogActorType;
    actorName: string;
    action: OrderLogAction;
  }>;
};

export type ExchangeRateStatus = 'active' | 'inactive';

export type ExchangeRateRecord = {
  id: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: number;
  status: ExchangeRateStatus;
  effectiveAt: string;
  updatedAt: string;
};

export const departments: DepartmentRecord[] = [
  {
    id: 'dept-operations',
    name: 'Global Operations',
    code: 'OPS',
    owner: 'Leah Chen',
    memberCount: 26,
    roleCount: 3,
    updatedAt: '2026-08-20 16:32',
  },
  {
    id: 'dept-experience',
    name: 'Customer Experience',
    code: 'CX',
    owner: 'Maya Patel',
    memberCount: 18,
    roleCount: 2,
    updatedAt: '2026-08-18 10:21',
  },
  {
    id: 'dept-procurement',
    name: 'Procurement',
    code: 'PROC',
    owner: 'Daniel Wong',
    memberCount: 12,
    roleCount: 2,
    updatedAt: '2026-08-16 09:45',
  },
  {
    id: 'dept-platform',
    name: 'Platform Administration',
    code: 'PLAT',
    owner: 'Nora Liu',
    memberCount: 8,
    roleCount: 2,
    updatedAt: '2026-08-12 14:08',
  },
];

export const roles: RoleRecord[] = [
  {
    id: 'role-admin',
    name: 'System Administrator',
    description: 'Portal configuration and account administration',
    memberCount: 4,
    permissions: [
      'overview.view',
      'departments.view',
      'departments.manage',
      'roles.view',
      'roles.manage',
      'accounts.view',
      'accounts.manage',
      'users.view',
      'tags.view',
      'tags.manage',
      'coupons.view',
      'coupons.manage',
      'paymentReceipts.view',
      'orders.view',
      'orders.manage',
    ],
    updatedAt: '2026-08-20 15:10',
  },
  {
    id: 'role-operations',
    name: 'Operations Manager',
    description: 'User and vehicle order operations',
    memberCount: 16,
    permissions: [
      'overview.view',
      'users.view',
      'tags.view',
      'coupons.view',
      'coupons.manage',
      'paymentReceipts.view',
      'orders.view',
      'orders.manage',
    ],
    updatedAt: '2026-08-19 11:30',
  },
  {
    id: 'role-support',
    name: 'Customer Support',
    description: 'Read-only user and order support access',
    memberCount: 21,
    permissions: ['users.view', 'orders.view'],
    updatedAt: '2026-08-17 17:05',
  },
  {
    id: 'role-procurement',
    name: 'Procurement Specialist',
    description: 'Vehicle order procurement visibility',
    memberCount: 9,
    permissions: ['overview.view', 'orders.view'],
    updatedAt: '2026-08-15 13:26',
  },
];

export const accounts: AccountRecord[] = [
  {
    id: 'acct-001',
    name: 'Leah Chen',
    username: 'leah.chen',
    departmentId: 'dept-operations',
    roleId: 'role-operations',
    countryCode: '+86',
    phone: '138 0000 2471',
    email: 'leah.chen@voyaexplore.com',
    lastLoginAt: '2026-08-21 09:42',
  },
  {
    id: 'acct-002',
    name: 'Nora Liu',
    username: 'nora.liu',
    departmentId: 'dept-platform',
    roleId: 'role-admin',
    countryCode: '+86',
    phone: '139 0000 6138',
    email: 'nora.liu@voyaexplore.com',
    lastLoginAt: '2026-08-21 08:15',
  },
  {
    id: 'acct-003',
    name: 'Maya Patel',
    username: 'maya.patel',
    departmentId: 'dept-experience',
    roleId: 'role-support',
    countryCode: '+44',
    phone: '7700 900 421',
    email: 'maya.patel@voyaexplore.com',
    lastLoginAt: '2026-08-20 22:36',
  },
  {
    id: 'acct-004',
    name: 'Daniel Wong',
    username: 'daniel.wong',
    departmentId: 'dept-procurement',
    roleId: 'role-procurement',
    countryCode: '+65',
    phone: '8123 7110',
    email: 'daniel.wong@voyaexplore.com',
    lastLoginAt: '2026-08-20 18:02',
  },
  {
    id: 'acct-005',
    name: 'Olivia Martin',
    username: 'olivia.martin',
    departmentId: 'dept-experience',
    roleId: 'role-support',
    countryCode: '+33',
    phone: '6 12 34 78 90',
    email: 'olivia.martin@voyaexplore.com',
    lastLoginAt: '2026-08-19 12:20',
  },
];

export const userTags: UserTagRecord[] = [
  {
    id: 'tag-frequent',
    name: 'Frequent Traveler',
    description: 'Users with recurring travel activity',
    userCount: 1284,
    updatedAt: '2026-08-20 11:20',
  },
  {
    id: 'tag-business',
    name: 'Business Travel',
    description: 'Users primarily traveling for business',
    userCount: 862,
    updatedAt: '2026-08-18 16:05',
  },
  {
    id: 'tag-api',
    name: 'API Origin',
    description: 'Users created through partner APIs',
    userCount: 346,
    updatedAt: '2026-08-16 09:40',
  },
  {
    id: 'tag-priority',
    name: 'Priority Support',
    description: 'Users requiring priority assistance',
    userCount: 93,
    updatedAt: '2026-08-12 14:18',
  },
  {
    id: 'tag-new',
    name: 'New User',
    description: 'Recently registered users',
    userCount: 517,
    updatedAt: '2026-08-10 10:32',
  },
];

export const users: UserRecord[] = [
  {
    id: 'VU-1002381',
    englishGivenName: 'Amelia',
    englishFamilyName: 'Watson',
    status: 'active',
    source: 'app',
    registeredAt: '2026-08-20 18:42',
    nationality: 'GB',
    gender: 'female',
    maritalStatus: 'single',
    countryCode: '+44',
    phone: '7700 900 321',
    birthDate: '1992-06-15',
    email: 'amelia.watson@example.com',
    socials: [
      { platform: 'WhatsApp', account: '+44 7700 900 321' },
      { platform: 'Instagram', account: '@amelia.travels' },
    ],
    tagIds: ['tag-frequent', 'tag-business'],
  },
  {
    id: 'VU-1002376',
    chineseName: '林知夏',
    englishGivenName: 'Zhixia',
    englishFamilyName: 'Lin',
    status: 'active',
    source: 'api',
    registeredAt: '2026-08-20 16:08',
    nationality: 'CN',
    gender: 'female',
    maritalStatus: 'married',
    countryCode: '+86',
    phone: '138 0000 9214',
    birthDate: '1988-11-23',
    email: 'zhixia.lin@example.com',
    socials: [
      { platform: 'WeChat', account: 'linzhixia_88' },
      { platform: 'WhatsApp', account: '+86 138 0000 9214' },
    ],
    tagIds: ['tag-api', 'tag-priority'],
  },
  {
    id: 'VU-1002352',
    englishGivenName: 'Noah',
    englishFamilyName: 'Williams',
    status: 'pending',
    source: 'partner',
    registeredAt: '2026-08-19 12:15',
    nationality: 'US',
    gender: 'male',
    maritalStatus: 'single',
    countryCode: '+1',
    phone: '415 555 0182',
    birthDate: '1995-03-08',
    email: 'noah.williams@example.com',
    socials: [{ platform: 'WhatsApp', account: '+1 415 555 0182' }],
    tagIds: ['tag-new'],
  },
  {
    id: 'VU-1002319',
    englishGivenName: 'Sofia',
    englishFamilyName: 'Rossi',
    status: 'restricted',
    source: 'app',
    registeredAt: '2026-08-18 09:27',
    nationality: 'IT',
    gender: 'female',
    maritalStatus: 'divorced',
    countryCode: '+39',
    phone: '312 555 0198',
    birthDate: '1986-09-19',
    email: 'sofia.rossi@example.com',
    socials: [
      { platform: 'Telegram', account: '@sofiarossi' },
      { platform: 'Instagram', account: '@sofia.moves' },
    ],
    tagIds: ['tag-frequent'],
  },
  {
    id: 'VU-1002288',
    englishGivenName: 'Hana',
    englishFamilyName: 'Sato',
    status: 'active',
    source: 'api',
    registeredAt: '2026-08-17 20:40',
    nationality: 'JP',
    gender: 'female',
    maritalStatus: 'married',
    countryCode: '+81',
    phone: '90 1234 5678',
    birthDate: '1991-12-02',
    email: 'hana.sato@example.com',
    socials: [
      { platform: 'LINE', account: 'hana.sato91' },
      { platform: 'WhatsApp', account: '+81 90 1234 5678' },
    ],
    tagIds: ['tag-api', 'tag-business'],
  },
  {
    id: 'VU-1002241',
    englishGivenName: 'Lucas',
    englishFamilyName: 'Bernard',
    status: 'pending',
    source: 'partner',
    registeredAt: '2026-08-16 14:13',
    nationality: 'FR',
    gender: 'male',
    maritalStatus: 'single',
    countryCode: '+33',
    phone: '6 98 22 41 70',
    birthDate: '1998-04-27',
    email: 'lucas.bernard@example.com',
    socials: [{ platform: 'WhatsApp', account: '+33 6 98 22 41 70' }],
    tagIds: ['tag-new'],
  },
];

export const vehicleOrders: VehicleOrderRecord[] = [
  {
    id: 'VO-20260821-1038',
    entryChannel: 'app',
    procurementChannel: 'GlobalRide',
    customerName: 'Amelia Watson',
    countryCode: '+44',
    customerPhone: '7700 900 321',
    purchaseOrderNo: 'PO-GLR-88241',
    thirdPartyOrderNo: 'GLR-89471362',
    orderType: 'vehicle',
    amount: 128.5,
    currency: 'USD',
    orderedAt: '2026-08-21 09:32',
    status: 'paid',
  },
  {
    id: 'VO-20260821-1031',
    entryChannel: 'api',
    procurementChannel: 'Voya Direct',
    customerName: '林知夏',
    countryCode: '+86',
    customerPhone: '138 0000 9214',
    purchaseOrderNo: 'PO-VD-26082119',
    thirdPartyOrderNo: 'VD-61382409',
    orderType: 'vehicle',
    amount: 620,
    currency: 'CNY',
    orderedAt: '2026-08-21 08:46',
    status: 'paid',
  },
  {
    id: 'VO-20260820-0998',
    entryChannel: 'partner',
    procurementChannel: 'LocalLink',
    customerName: 'Noah Williams',
    countryCode: '+1',
    customerPhone: '415 555 0182',
    purchaseOrderNo: 'PO-LL-71902',
    thirdPartyOrderNo: 'LL-50278194',
    orderType: 'vehicle',
    amount: 142.75,
    currency: 'EUR',
    orderedAt: '2026-08-20 22:18',
    status: 'paid',
  },
  {
    id: 'VO-20260820-0974',
    entryChannel: 'app',
    procurementChannel: 'GlobalRide',
    customerName: 'Sofia Rossi',
    countryCode: '+39',
    customerPhone: '312 555 0198',
    purchaseOrderNo: 'PO-GLR-88176',
    thirdPartyOrderNo: 'GLR-89469871',
    orderType: 'vehicle',
    amount: 97.2,
    currency: 'USD',
    orderedAt: '2026-08-20 18:54',
    status: 'paid',
  },
  {
    id: 'VO-20260820-0951',
    entryChannel: 'api',
    procurementChannel: 'Voya Direct',
    customerName: 'Hana Sato',
    countryCode: '+81',
    customerPhone: '90 1234 5678',
    purchaseOrderNo: 'PO-VD-26082042',
    thirdPartyOrderNo: 'VD-61380942',
    orderType: 'vehicle',
    amount: 9800,
    currency: 'JPY',
    orderedAt: '2026-08-20 15:27',
    status: 'paid',
  },
  {
    id: 'VO-20260819-0902',
    entryChannel: 'partner',
    procurementChannel: 'LocalLink',
    customerName: 'Lucas Bernard',
    countryCode: '+33',
    customerPhone: '6 98 22 41 70',
    purchaseOrderNo: 'PO-LL-71688',
    thirdPartyOrderNo: 'LL-50271688',
    orderType: 'vehicle',
    amount: 116.4,
    currency: 'EUR',
    orderedAt: '2026-08-19 11:08',
    status: 'pendingPayment',
    paymentTimeRemaining: '23:00',
  },
];

const vehicleOrderDetailSeeds = [
  {
    city: 'London',
    startDate: '2026-08-24',
    endDate: '2026-08-25',
    departureTime: '08:30',
    serviceType: 'multiDayCharter' as const,
    vehicleCategory: 'businessVan' as const,
    luggageCount: 3,
    itinerary: [
      {
        date: '2026-08-24',
        stops: [
          {
            type: 'origin' as const,
            name: 'London Heathrow Airport T5',
            time: '08:30',
          },
          {
            type: 'waypoint' as const,
            name: 'Hyde Park Corner',
            time: '09:20',
          },
          { type: 'destination' as const, name: 'The Savoy', time: '09:45' },
        ],
      },
      {
        date: '2026-08-25',
        stops: [
          { type: 'origin' as const, name: 'The Savoy', time: '10:00' },
          { type: 'waypoint' as const, name: 'British Museum', time: '10:25' },
          {
            type: 'destination' as const,
            name: 'St Pancras International',
            time: '12:10',
          },
        ],
      },
    ],
  },
  {
    city: 'Shanghai',
    startDate: '2026-08-23',
    endDate: '2026-08-23',
    departureTime: '07:45',
    serviceType: 'airportTransfer' as const,
    vehicleCategory: 'businessVan' as const,
    luggageCount: 2,
    itinerary: [
      {
        date: '2026-08-23',
        stops: [
          {
            type: 'origin' as const,
            name: 'Pudong International Airport T2',
            time: '07:45',
          },
          {
            type: 'destination' as const,
            name: 'The Shanghai EDITION',
            time: '09:05',
          },
        ],
      },
    ],
  },
  {
    city: 'San Francisco',
    startDate: '2026-08-24',
    endDate: '2026-08-24',
    departureTime: '11:00',
    serviceType: 'pointToPoint' as const,
    vehicleCategory: 'suv' as const,
    luggageCount: 2,
    itinerary: [
      {
        date: '2026-08-24',
        stops: [
          { type: 'origin' as const, name: 'Union Square', time: '11:00' },
          {
            type: 'destination' as const,
            name: 'SFO International Terminal',
            time: '11:45',
          },
        ],
      },
    ],
  },
  {
    city: 'Rome',
    startDate: '2026-08-22',
    endDate: '2026-08-22',
    departureTime: '09:15',
    serviceType: 'pointToPoint' as const,
    vehicleCategory: 'sedan' as const,
    luggageCount: 1,
    itinerary: [
      {
        date: '2026-08-22',
        stops: [
          { type: 'origin' as const, name: 'Hotel de Russie', time: '09:15' },
          { type: 'waypoint' as const, name: 'Roma Termini', time: '09:35' },
          {
            type: 'destination' as const,
            name: 'Fiumicino Airport T3',
            time: '10:20',
          },
        ],
      },
    ],
  },
  {
    city: 'Tokyo',
    startDate: '2026-08-23',
    endDate: '2026-08-23',
    departureTime: '06:40',
    serviceType: 'airportTransfer' as const,
    vehicleCategory: 'businessVan' as const,
    luggageCount: 2,
    itinerary: [
      {
        date: '2026-08-23',
        stops: [
          { type: 'origin' as const, name: 'Shinjuku Station', time: '06:40' },
          {
            type: 'destination' as const,
            name: 'Haneda Airport T3',
            time: '07:25',
          },
        ],
      },
    ],
  },
  {
    city: 'Paris',
    startDate: '2026-08-21',
    endDate: '2026-08-21',
    departureTime: '13:30',
    serviceType: 'pointToPoint' as const,
    vehicleCategory: 'sedan' as const,
    luggageCount: 1,
    itinerary: [
      {
        date: '2026-08-21',
        stops: [
          { type: 'origin' as const, name: 'Gare du Nord', time: '13:30' },
          {
            type: 'destination' as const,
            name: 'Hôtel Lutetia',
            time: '14:05',
          },
        ],
      },
    ],
  },
];

export const vehicleOrderDetails: Record<string, VehicleOrderDetailRecord> =
  Object.fromEntries(
    vehicleOrders.map((order, index) => {
      const user = users[index];
      const seed = vehicleOrderDetailSeeds[index];
      const couponDiscount = index === 0 ? 10 : 0;
      const booker: OrderContact = {
        userId: user.id,
        givenName: user.englishGivenName,
        familyName: user.englishFamilyName,
        countryCode: user.countryCode,
        phone: user.phone,
        email: user.email,
      };
      const travelers: OrderContact[] =
        index === 0
          ? [
              booker,
              {
                userId: 'VU-1002382',
                givenName: 'John',
                familyName: 'Watson',
                countryCode: '+44',
                phone: '7700 900 322',
                email: 'john.watson@example.com',
              },
            ]
          : [booker];
      const paymentMethod: VehiclePaymentMethod =
        index % 3 === 0
          ? 'creditCard'
          : index % 3 === 1
            ? 'digitalWallet'
            : 'bankTransfer';
      const transactionId = `PAY-${order.id.replace('VO-', '')}`;
      const orderedAt = dayjs(order.orderedAt.replace(' ', 'T'));
      const singlePaymentAmount =
        order.status === 'pendingPayment' ? order.amount - 20 : order.amount;
      const paymentRecords: VehiclePaymentRecord[] =
        index === 0
          ? [
              {
                id: `${order.id}-payment-1`,
                currency: order.currency,
                method: 'creditCard',
                paidAmount: 80,
                paidAt: orderedAt.add(1, 'minute').format('YYYY-MM-DD HH:mm'),
                transactionId: `${transactionId}-01`,
              },
              {
                id: `${order.id}-payment-2`,
                currency: order.currency,
                method: 'digitalWallet',
                paidAmount: order.amount - 80,
                paidAt: orderedAt.add(3, 'minute').format('YYYY-MM-DD HH:mm'),
                transactionId: `${transactionId}-02`,
              },
            ]
          : [
              {
                id: `${order.id}-payment-1`,
                currency: order.currency,
                method: paymentMethod,
                paidAmount: singlePaymentAmount,
                paidAt: orderedAt.add(2, 'minute').format('YYYY-MM-DD HH:mm'),
                transactionId,
              },
            ];

      return [
        order.id,
        {
          orderId: order.id,
          booker,
          payment: {
            payableAmount: order.amount + couponDiscount,
            records: paymentRecords,
            coupons:
              couponDiscount > 0
                ? [
                    {
                      id: `coupon-${order.id}`,
                      code: 'VOYA10',
                      discountAmount: couponDiscount,
                      currency: order.currency,
                      usedAt: order.orderedAt,
                    },
                  ]
                : [],
          },
          booking: {
            serviceType: seed.serviceType,
            city: seed.city,
            startDate: seed.startDate,
            endDate: seed.endDate,
            departureTime: seed.departureTime,
            vehicleCategory: seed.vehicleCategory,
            travelerCount: travelers.length,
            luggageCount: seed.luggageCount,
          },
          travelers,
          itinerary: seed.itinerary.map((day, dayIndex) => ({
            id: `${order.id}-day-${dayIndex + 1}`,
            date: day.date,
            stops: day.stops.map((stop, stopIndex) => ({
              ...stop,
              id: `${order.id}-day-${dayIndex + 1}-stop-${stopIndex + 1}`,
            })),
          })),
          logs: [
            {
              id: `${order.id}-log-1`,
              at: order.orderedAt,
              actorType: 'consumer',
              actorName: order.customerName,
              action: 'orderCreated',
            },
            {
              id: `${order.id}-log-2`,
              at: order.orderedAt.replace(/:\d{2}$/, ':34'),
              actorType: 'system',
              actorName: 'Voya Portal',
              action: 'paymentRecorded',
            },
            {
              id: `${order.id}-log-3`,
              at: order.orderedAt.replace(/:\d{2}$/, ':36'),
              actorType: 'system',
              actorName: 'Voya Portal',
              action: 'procurementSubmitted',
            },
            {
              id: `${order.id}-log-4`,
              at: order.orderedAt.replace(/:\d{2}$/, ':41'),
              actorType: 'portal',
              actorName: 'Nora Liu',
              action: 'orderReviewed',
            },
          ],
        },
      ];
    }),
  );

export const exchangeRates: ExchangeRateRecord[] = [
  {
    id: 'rate-usd-cny',
    baseCurrency: 'USD',
    quoteCurrency: 'CNY',
    rate: 7.1824,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'rate-usd-eur',
    baseCurrency: 'USD',
    quoteCurrency: 'EUR',
    rate: 0.8612,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'rate-usd-gbp',
    baseCurrency: 'USD',
    quoteCurrency: 'GBP',
    rate: 0.7428,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'rate-usd-jpy',
    baseCurrency: 'USD',
    quoteCurrency: 'JPY',
    rate: 147.36,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'rate-usd-sgd',
    baseCurrency: 'USD',
    quoteCurrency: 'SGD',
    rate: 1.2794,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'rate-usd-aed',
    baseCurrency: 'USD',
    quoteCurrency: 'AED',
    rate: 3.6725,
    status: 'inactive',
    effectiveAt: '2026-08-20 09:00',
    updatedAt: '2026-08-20 09:00',
  },
];

export const permissionTreeData = [
  {
    key: 'overview',
    titleId: 'voya.permission.overview',
    children: [{ key: 'overview.view', titleId: 'voya.permission.view' }],
  },
  {
    key: 'system',
    titleId: 'voya.permission.system',
    children: [
      {
        key: 'departments',
        titleId: 'voya.permission.departments',
        children: [
          { key: 'departments.view', titleId: 'voya.permission.view' },
          { key: 'departments.manage', titleId: 'voya.permission.manage' },
        ],
      },
      {
        key: 'roles',
        titleId: 'voya.permission.roles',
        children: [
          { key: 'roles.view', titleId: 'voya.permission.view' },
          { key: 'roles.manage', titleId: 'voya.permission.manage' },
        ],
      },
      {
        key: 'accounts',
        titleId: 'voya.permission.accounts',
        children: [
          { key: 'accounts.view', titleId: 'voya.permission.view' },
          { key: 'accounts.manage', titleId: 'voya.permission.manage' },
        ],
      },
      {
        key: 'exchangeRates',
        titleId: 'voya.permission.exchangeRates',
        children: [
          { key: 'exchangeRates.view', titleId: 'voya.permission.view' },
          { key: 'exchangeRates.manage', titleId: 'voya.permission.manage' },
        ],
      },
    ],
  },
  {
    key: 'users',
    titleId: 'voya.permission.users',
    children: [
      { key: 'users.view', titleId: 'voya.permission.view' },
      { key: 'tags.view', titleId: 'voya.permission.tagsView' },
      { key: 'tags.manage', titleId: 'voya.permission.tagsManage' },
    ],
  },
  {
    key: 'operations',
    titleId: 'voya.permission.operations',
    children: [
      {
        key: 'coupons',
        titleId: 'voya.permission.coupons',
        children: [
          { key: 'coupons.view', titleId: 'voya.permission.view' },
          { key: 'coupons.manage', titleId: 'voya.permission.manage' },
        ],
      },
    ],
  },
  {
    key: 'finance',
    titleId: 'voya.permission.finance',
    children: [
      {
        key: 'paymentReceipts',
        titleId: 'voya.permission.paymentReceipts',
        children: [
          { key: 'paymentReceipts.view', titleId: 'voya.permission.view' },
        ],
      },
    ],
  },
  {
    key: 'orders',
    titleId: 'voya.permission.orders',
    children: [
      { key: 'orders.view', titleId: 'voya.permission.view' },
      { key: 'orders.manage', titleId: 'voya.permission.manage' },
    ],
  },
];
