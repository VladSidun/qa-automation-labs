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

  it.each([
    [60, 30],
    [61, 50],
    [62, 50],
    [119, 50],
    [120, 50],
    [121, 70],
    [180, 70],
  ])('враховує розпочаті години для %i хвилин', (minutes, expected) => {
    expect(calcParkingFee(minutes)).toBeCloseTo(expected, 2);
  });

  it.each([
    [539, 190],
    [540, 190],
    [541, 200],
    [599, 200],
    [600, 200],
    [1440, 200],
  ])('обмежує плату для %i хвилин', (minutes, expected) => {
    expect(calcParkingFee(minutes)).toBeCloseTo(expected, 2);
  });

  it.each([
    [0, 0],
    [15, 0],
    [16, 15],
    [60, 15],
    [121, 35],
    [541, 100],
  ])('застосовує нічний тариф для %i хвилин', (minutes, expected) => {
    expect(calcParkingFee(minutes, { night: true })).toBeCloseTo(expected, 2);
  });

  it.each([
    { minutes: 16, options: { weekend: true }, expected: 24 },
    { minutes: 600, options: { weekend: true }, expected: 160 },
    { minutes: 600, options: { night: true, weekend: true }, expected: 80 },
    { minutes: 45, options: { night: true, weekend: true }, expected: 12 },
    { minutes: 121, options: { night: true, weekend: true }, expected: 28 },
    { minutes: 60, options: { night: false, weekend: false }, expected: 30 },
  ])(
    'враховує прапорці $options для $minutes хвилин',
    ({ minutes, options, expected }) => {
      expect(calcParkingFee(minutes, options)).toBeCloseTo(expected, 2);
    },
  );
});
