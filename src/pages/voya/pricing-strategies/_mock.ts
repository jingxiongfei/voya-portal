import { exchangeRates } from '../mockData';

export const pricingCurrencies = [
  'CNY',
  'USD',
  'EUR',
  'GBP',
  'JPY',
  'SGD',
] as const;

export const pricingSupplyChains = [
  'pureGuide',
  'globalRide',
  'voyaDirect',
  'localLink',
] as const;

export type PricingCurrency = (typeof pricingCurrencies)[number];
export type PricingSupplyChain = (typeof pricingSupplyChains)[number];
export type PricingStrategyStatus = 'active' | 'inactive';

export type PricingStrategyRecord = {
  id: string;
  supplyChain: PricingSupplyChain;
  currency: PricingCurrency;
  grossMarginRate: number;
  status: PricingStrategyStatus;
  effectiveAt: string;
  updatedAt: string;
};

const activeUsdToCnyRate =
  exchangeRates.find(
    (rate) =>
      rate.status === 'active' &&
      rate.baseCurrency === 'USD' &&
      rate.quoteCurrency === 'CNY',
  )?.rate ?? 1;

const activeUsdToCnyReferenceAt =
  exchangeRates.find(
    (rate) =>
      rate.status === 'active' &&
      rate.baseCurrency === 'USD' &&
      rate.quoteCurrency === 'CNY',
  )?.effectiveAt ?? '';

export const getCurrencyToCnyRate = (currency: PricingCurrency) => {
  if (currency === 'CNY') return 1;
  if (currency === 'USD') return activeUsdToCnyRate;

  const usdToCurrencyRate = exchangeRates.find(
    (rate) =>
      rate.status === 'active' &&
      rate.baseCurrency === 'USD' &&
      rate.quoteCurrency === currency,
  )?.rate;

  return usdToCurrencyRate ? activeUsdToCnyRate / usdToCurrencyRate : 1;
};

export const getCurrencyRateReferenceAt = (currency: PricingCurrency) => {
  if (currency === 'CNY' || currency === 'USD')
    return activeUsdToCnyReferenceAt;

  return (
    exchangeRates.find(
      (rate) =>
        rate.status === 'active' &&
        rate.baseCurrency === 'USD' &&
        rate.quoteCurrency === currency,
    )?.effectiveAt ?? ''
  );
};

export const calculateSuggestedSellingPrice = (
  supplierCostCny: number,
  exchangeRateToCny: number,
  grossMarginRate: number,
) => {
  if (
    !Number.isFinite(supplierCostCny) ||
    supplierCostCny < 0 ||
    !Number.isFinite(exchangeRateToCny) ||
    exchangeRateToCny <= 0 ||
    !Number.isFinite(grossMarginRate) ||
    grossMarginRate < 0 ||
    grossMarginRate >= 100
  ) {
    throw new RangeError('Pricing inputs are outside the supported range.');
  }

  return supplierCostCny / exchangeRateToCny / (1 - grossMarginRate / 100);
};

export const pricingStrategies: PricingStrategyRecord[] = [
  {
    id: 'pricing-usd',
    supplyChain: 'pureGuide',
    currency: 'USD',
    grossMarginRate: 18,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'pricing-eur',
    supplyChain: 'pureGuide',
    currency: 'EUR',
    grossMarginRate: 20,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'pricing-gbp',
    supplyChain: 'globalRide',
    currency: 'GBP',
    grossMarginRate: 18,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'pricing-jpy',
    supplyChain: 'voyaDirect',
    currency: 'JPY',
    grossMarginRate: 22,
    status: 'active',
    effectiveAt: '2026-08-21 09:00',
    updatedAt: '2026-08-21 09:00',
  },
  {
    id: 'pricing-sgd',
    supplyChain: 'localLink',
    currency: 'SGD',
    grossMarginRate: 16,
    status: 'inactive',
    effectiveAt: '2026-08-20 09:00',
    updatedAt: '2026-08-20 09:00',
  },
];
