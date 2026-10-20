import { describe, it, expect } from 'vitest';
import { calcInstallment } from '../src/order';

describe('calcInstallment', () => {
  it.each([
    { months: 3, expected: 4080 },
    { months: 6, expected: 2080 },
    { months: 12, expected: 1080 },
  ])(
    'для 12000 грн на $months місяців платіж дорівнює $expected грн',
    ({ months, expected }) => {
      expect(calcInstallment(12000, months)).toBeCloseTo(expected, 2);
    },
  );

  it.each([
    { months: 3, expected: 340 },
    { months: 6, expected: 173.33 },
    { months: 12, expected: 90 },
  ])(
    'округлює платіж для 1000 грн на $months місяців',
    ({ months, expected }) => {
      expect(calcInstallment(1000, months)).toBeCloseTo(expected, 2);
    },
  );

  // Значення перед, на і після кожного дозволеного строку.
  it.each([
    { months: 2, expected: null },
    { months: 3, expected: 4080 },
    { months: 4, expected: null },
    { months: 5, expected: null },
    { months: 6, expected: 2080 },
    { months: 7, expected: null },
    { months: 11, expected: null },
    { months: 12, expected: 1080 },
    { months: 13, expected: null },
  ])('перевіряє строк $months місяців біля межі', ({ months, expected }) => {
    if (expected === null) {
      expect(() => calcInstallment(12000, months)).toThrow('INVALID_MONTHS');
    } else {
      expect(calcInstallment(12000, months)).toBeCloseTo(expected, 2);
    }
  });

  it.each([0, -3, 3.5, NaN, Infinity, -Infinity])(
    'відхиляє некоректний строк %s',
    (months) => {
      expect(() => calcInstallment(12000, months)).toThrow('INVALID_MONTHS');
    },
  );

  it.each([
    { total: 0, expected: 0 },
    { total: 1, expected: 0.34 },
  ])('дозволяє суму $total грн біля нижньої межі', ({ total, expected }) => {
    expect(calcInstallment(total, 3)).toBeCloseTo(expected, 2);
  });

  it.each([-1, -0.01, NaN, Infinity, -Infinity])(
    'відхиляє некоректну суму %s',
    (total) => {
      expect(() => calcInstallment(total, 3)).toThrow('INVALID_TOTAL');
    },
  );
});
