import { describe, it, expect } from 'vitest';
import { calcInsurancePremium } from '../src/insurance';

describe('calcInsurancePremium', () => {
  it.each([-1, 1.5, NaN, Infinity, -Infinity])(
    'відхиляє вік авто %s',
    (age) => {
      expect(() => calcInsurancePremium(age, 3)).toThrow('INVALID_CAR_AGE');
    },
  );

  it.each([-1, 1.5, NaN, Infinity, -Infinity])(
    'відхиляє стаж водіння %s',
    (years) => {
      expect(() => calcInsurancePremium(1, years)).toThrow(
        'INVALID_EXPERIENCE',
      );
    },
  );

  it.each([-1, 1.5, NaN, Infinity, -Infinity, 4])(
    'відхиляє безаварійний стаж %s',
    (years) => {
      expect(() => calcInsurancePremium(1, 3, years)).toThrow(
        'INVALID_ACCIDENT_FREE_YEARS',
      );
    },
  );

  it.each([
    [0, 0, 0],
    [1, 3, 3],
  ])(
    'приймає коректні роки %i / %i / %i',
    (age, experience, accidentFreeYears) => {
      expect(() =>
        calcInsurancePremium(age, experience, accidentFreeYears),
      ).not.toThrow();
    },
  );
});
