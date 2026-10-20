import { describe, it, expect } from 'vitest';
import { calcAverage } from '../src/average';

describe('calcAverage', () => {
  it('обчислює середнє додатних чисел', () => {
    const numbers = [4, 8, 12];
    const result = calcAverage(numbers);
    expect(result).toBe(8);
  });

  it('враховує від’ємні числа', () => {
    expect(calcAverage([-6, 0, 9])).toBe(1);
  });

  it('повертає єдиний елемент масиву', () => {
    // Один елемент — найменший допустимий розмір масиву.
    expect(calcAverage([7])).toBe(7);
  });

  it('відхиляє порожній масив', () => {
    expect(() => calcAverage([])).toThrow('EMPTY_ARRAY');
  });

  it('зберігає дробову частину результату', () => {
    expect(calcAverage([1, 2, 2])).toBeCloseTo(1.6666667, 6);
  });

  it('повертає нуль для нульових елементів', () => {
    expect(calcAverage([0, 0])).toBe(0);
  });

  it.each([NaN, Infinity, -Infinity])('відхиляє елемент %s', (value) => {
    expect(() => calcAverage([1, value])).toThrow('INVALID_NUMBER');
  });
});
