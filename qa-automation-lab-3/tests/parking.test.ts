import { describe, it, expect } from 'vitest';
import { calcParkingFee } from '../src/parking';

describe('calcParkingFee', () => {
  it.each([-1, -60, 10.5, NaN, Infinity, -Infinity])(
    'відхиляє некоректну тривалість %s',
    (minutes) => {
      expect(() => calcParkingFee(minutes)).toThrow('INVALID_DURATION');
    },
  );
});
