import { describe, it, expect } from 'vitest';
import {
  calcSubtotal,
  calcDiscountRate,
  calcShipping,
  calcOrderTotal,
  type OrderItem,
} from '../src/order';

const item = (price: number, qty = 1): OrderItem => ({
  sku: 'SKU-1',
  price,
  qty,
});

describe('calcSubtotal', () => {
  it('підсумовує позиції з урахуванням кількості', () => {
    const items = [item(100, 2), { sku: 'SKU-2', price: 50, qty: 3 }];
    const result = calcSubtotal(items);
    expect(result).toBe(350);
  });

  it('відхиляє порожнє замовлення', () => {
    expect(() => calcSubtotal([])).toThrow('EMPTY_ORDER');
  });

  it.each([
    { price: 0, expected: 0 },
    { price: 0.01, expected: 0.01 },
  ])('дозволяє ціну $price', ({ price, expected }) => {
    expect(calcSubtotal([item(price)])).toBeCloseTo(expected, 2);
  });

  it.each([-1, -0.01])('відхиляє ціну %s', (price) => {
    expect(() => calcSubtotal([item(price)])).toThrow('NEGATIVE_PRICE');
  });

  it.each([0, -1, 1.5])('відхиляє кількість %s', (qty) => {
    expect(() => calcSubtotal([item(100, qty)])).toThrow('INVALID_QTY');
  });
});

describe('calcDiscountRate', () => {
  it.each([
    { tier: 'basic' as const, expected: 0 },
    { tier: 'silver' as const, expected: 0.05 },
    { tier: 'gold' as const, expected: 0.1 },
  ])('застосовує знижку рівня $tier', ({ tier, expected }) => {
    expect(calcDiscountRate(tier, 500)).toBeCloseTo(expected, 4);
  });

  it.each([
    { subtotal: 1999, expected: 0 },
    { subtotal: 2000, expected: 0.05 },
    { subtotal: 2001, expected: 0.05 },
  ])('визначає бонус для суми $subtotal', ({ subtotal, expected }) => {
    expect(calcDiscountRate('basic', subtotal)).toBeCloseTo(expected, 4);
  });

  it('додає бонус великого замовлення до знижки клієнта', () => {
    expect(calcDiscountRate('gold', 2000)).toBeCloseTo(0.15, 4);
  });

  it.each([
    { promo: 0.24, expected: 0.24 },
    { promo: 0.25, expected: 0.25 },
    { promo: 0.26, expected: 0.25 },
  ])('обмежує промознижку $promo', ({ promo, expected }) => {
    expect(calcDiscountRate('basic', 500, promo)).toBeCloseTo(expected, 4);
  });

  it('обмежує суму всіх знижок значенням 25 %', () => {
    expect(calcDiscountRate('gold', 2000, 0.5)).toBeCloseTo(0.25, 4);
  });

  it('відхиляє від’ємну промознижку', () => {
    expect(() => calcDiscountRate('basic', 500, -0.01)).toThrow(
      'INVALID_PROMO',
    );
  });
});

describe('calcShipping', () => {
  it.each([
    [999, 60],
    [1000, 0],
    [1001, 0],
  ])('для суми %i повертає доставку %i', (amount, expected) => {
    expect(calcShipping(amount)).toBe(expected);
  });
});

describe('calcOrderTotal', () => {
  it('додає доставку до невеликого замовлення', () => {
    expect(calcOrderTotal([item(500)], 'basic')).toBeCloseTo(560, 2);
  });

  it('надає безкоштовну доставку для 1080 грн після знижки', () => {
    expect(calcOrderTotal([item(1200)], 'gold')).toBeCloseTo(1080, 2);
  });

  it('додає доставку, коли знижка зменшує суму нижче порога', () => {
    // 1050 грн після знижки перетворюються на 945 грн.
    expect(calcOrderTotal([item(1050)], 'gold')).toBeCloseTo(1005, 2);
  });

  it('надає безкоштовну доставку рівно від 1000 грн після знижки', () => {
    expect(calcOrderTotal([item(1250)], 'basic', 0.2)).toBeCloseTo(1000, 2);
  });

  it('округлює суму після знижки до копійок', () => {
    expect(calcOrderTotal([item(99.99)], 'silver')).toBeCloseTo(154.99, 2);
  });

  it('передає помилку порожнього замовлення', () => {
    expect(() => calcOrderTotal([], 'gold')).toThrow('EMPTY_ORDER');
  });

  it('передає помилку ціни', () => {
    expect(() => calcOrderTotal([item(-1)], 'basic')).toThrow('NEGATIVE_PRICE');
  });

  it('передає помилку кількості', () => {
    expect(() => calcOrderTotal([item(100, 0)], 'basic')).toThrow(
      'INVALID_QTY',
    );
  });

  it('передає помилку промознижки', () => {
    expect(() => calcOrderTotal([item(100)], 'basic', -0.1)).toThrow(
      'INVALID_PROMO',
    );
  });
});
