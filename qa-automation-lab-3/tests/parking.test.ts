import { describe, it, expect } from 'vitest';
import { calcParkingFee } from '../src/parking';

describe('calcParkingFee', () => {
  it.each([-1, -60, 10.5, NaN, Infinity, -Infinity])(
    'відхиляє некоректну тривалість %s',
    (minutes) => {
      expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
    },
  );

  it.each([0, 1, 14, 15])('не стягує плату за %i хвилин', (minutes) => {
    expect(calcParkingFee(minutes)).toBe(0);
  });

  it.each([
    [15, 0],
    [16, 30],
    [17, 30],
    [59, 30],
    [60, 30],
  ])('за %i хвилин нараховує %i грн', (minutes, expected) => {
    expect(calcParkingFee(minutes)).toBeCloseTo(expected, 2);
  });
});
