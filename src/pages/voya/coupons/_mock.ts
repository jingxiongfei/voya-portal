export type CouponStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export type CouponDiscountType = 'fixedAmount' | 'percentage';

export type CouponRecord = {
  id: string;
  code: string;
  nameZh: string;
  nameEn: string;
  type: CouponDiscountType;
  value: number;
  currency: string;
  minSpend: number;
  totalLimit: number;
  claimedCount: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  status: CouponStatus;
  updatedAt: string;
};

export type CouponUsageStatus = 'applied' | 'refunded';

export type CouponUsageRecord = {
  id: string;
  couponId: string;
  userId: string;
  userName: string;
  orderId: string;
  discountAmount: number;
  currency: string;
  usedAt: string;
  status: CouponUsageStatus;
};

export const coupons: CouponRecord[] = [
  {
    id: 'coupon-voya10',
    code: 'VOYA10',
    nameZh: '新客出行立减',
    nameEn: 'New traveller discount',
    type: 'fixedAmount',
    value: 10,
    currency: 'USD',
    minSpend: 100,
    totalLimit: 5000,
    claimedCount: 3210,
    usedCount: 1284,
    validFrom: '2026-08-01',
    validTo: '2026-12-31',
    status: 'active',
    updatedAt: '2026-08-21 16:20',
  },
  {
    id: 'coupon-airport15',
    code: 'AIRPORT15',
    nameZh: '接送机专享折扣',
    nameEn: 'Airport transfer offer',
    type: 'percentage',
    value: 15,
    currency: 'USD',
    minSpend: 80,
    totalLimit: 2000,
    claimedCount: 880,
    usedCount: 346,
    validFrom: '2026-09-01',
    validTo: '2026-10-31',
    status: 'scheduled',
    updatedAt: '2026-08-20 11:45',
  },
  {
    id: 'coupon-business20',
    code: 'BUSINESS20',
    nameZh: '商务出行立减',
    nameEn: 'Business travel discount',
    type: 'fixedAmount',
    value: 20,
    currency: 'USD',
    minSpend: 180,
    totalLimit: 1500,
    claimedCount: 632,
    usedCount: 218,
    validFrom: '2026-08-15',
    validTo: '2026-11-30',
    status: 'active',
    updatedAt: '2026-08-19 09:32',
  },
  {
    id: 'coupon-summer8',
    code: 'SUMMER8',
    nameZh: '夏季出行优惠',
    nameEn: 'Summer travel offer',
    type: 'percentage',
    value: 8,
    currency: 'USD',
    minSpend: 60,
    totalLimit: 8000,
    claimedCount: 6540,
    usedCount: 3976,
    validFrom: '2026-05-01',
    validTo: '2026-07-31',
    status: 'expired',
    updatedAt: '2026-08-01 00:05',
  },
  {
    id: 'coupon-vip50',
    code: 'VIP50',
    nameZh: '贵宾专属优惠',
    nameEn: 'VIP exclusive discount',
    type: 'fixedAmount',
    value: 50,
    currency: 'USD',
    minSpend: 400,
    totalLimit: 500,
    claimedCount: 126,
    usedCount: 74,
    validFrom: '2026-08-01',
    validTo: '2026-12-31',
    status: 'disabled',
    updatedAt: '2026-08-18 14:10',
  },
];

export const couponUsageRecords: CouponUsageRecord[] = [
  {
    id: 'usage-001',
    couponId: 'coupon-voya10',
    userId: 'VU-1002381',
    userName: 'Amelia Watson',
    orderId: 'VO-20260821-1038',
    discountAmount: 10,
    currency: 'USD',
    usedAt: '2026-08-21 09:32',
    status: 'applied',
  },
  {
    id: 'usage-002',
    couponId: 'coupon-voya10',
    userId: 'VU-1002319',
    userName: 'Sofia Rossi',
    orderId: 'VO-20260820-0974',
    discountAmount: 10,
    currency: 'USD',
    usedAt: '2026-08-20 18:54',
    status: 'applied',
  },
  {
    id: 'usage-003',
    couponId: 'coupon-voya10',
    userId: 'VU-1002241',
    userName: 'Lucas Bernard',
    orderId: 'VO-20260819-0902',
    discountAmount: 10,
    currency: 'USD',
    usedAt: '2026-08-19 11:08',
    status: 'applied',
  },
  {
    id: 'usage-004',
    couponId: 'coupon-airport15',
    userId: 'VU-1002376',
    userName: '林知夏',
    orderId: 'VO-20260821-1031',
    discountAmount: 15.18,
    currency: 'USD',
    usedAt: '2026-08-21 08:46',
    status: 'applied',
  },
  {
    id: 'usage-005',
    couponId: 'coupon-airport15',
    userId: 'VU-1002288',
    userName: 'Hana Sato',
    orderId: 'VO-20260820-0951',
    discountAmount: 11.45,
    currency: 'USD',
    usedAt: '2026-08-20 15:27',
    status: 'applied',
  },
  {
    id: 'usage-006',
    couponId: 'coupon-business20',
    userId: 'VU-1002352',
    userName: 'Noah Williams',
    orderId: 'VO-20260820-0998',
    discountAmount: 20,
    currency: 'USD',
    usedAt: '2026-08-20 22:18',
    status: 'refunded',
  },
  {
    id: 'usage-007',
    couponId: 'coupon-summer8',
    userId: 'VU-1002381',
    userName: 'Amelia Watson',
    orderId: 'VO-20260718-0754',
    discountAmount: 12.8,
    currency: 'USD',
    usedAt: '2026-07-18 12:20',
    status: 'applied',
  },
];
