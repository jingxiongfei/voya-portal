import { describe, expect, it } from 'vitest';
import {
  calculateSuggestedSellingPrice,
  getCurrencyRateReferenceAt,
  getCurrencyToCnyRate,
  pricingCurrencies,
  pricingStrategies,
} from './_mock';

describe('pricing strategy demo data', () => {
  it('keeps one strategy per supply chain and selling currency', () => {
    const strategyKeys = pricingStrategies.map(
      (item) => `${item.supplyChain}:${item.currency}`,
    );
    expect(new Set(strategyKeys).size).toBe(pricingStrategies.length);
    expect(
      pricingStrategies.every(
        (item) =>
          pricingCurrencies.includes(item.currency) &&
          item.grossMarginRate >= 0 &&
          item.grossMarginRate < 100,
      ),
    ).toBe(true);
  });

  it('calculates a selling price from gross margin rather than markup', () => {
    expect(calculateSuggestedSellingPrice(1000, 7.1824, 18)).toBeCloseTo(
      169.79,
      2,
    );
  });

  it('returns a one-to-one rate for CNY', () => {
    expect(getCurrencyToCnyRate('CNY')).toBe(1);
  });

  it('uses the USD to CNY reference for USD and CNY strategies', () => {
    expect(getCurrencyRateReferenceAt('USD')).toBe('2026-08-21 09:00');
    expect(getCurrencyRateReferenceAt('CNY')).toBe('2026-08-21 09:00');
  });
});
