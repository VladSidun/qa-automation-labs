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

  it.each([0, 1, 4, 5])(
    'задає базовий тариф 1000 грн для авто віком %i років',
    (age) => {
      expect(calcInsurancePremium(age, 3)).toBeCloseTo(1000, 2);
    },
  );

  it.each([
    [5, 1000],
    [6, 1500],
    [7, 1500],
    [9, 1500],
    [10, 1500],
  ])('визначає тариф для авто віком %i років', (age, expected) => {
    expect(calcInsurancePremium(age, 3)).toBeCloseTo(expected, 2);
  });

  it.each([
    [10, 1500],
    [11, 2000],
    [12, 2000],
    [15, 2000],
  ])('застосовує тариф старшої вікової групи для %i років', (age, expected) => {
    expect(calcInsurancePremium(age, 3)).toBeCloseTo(expected, 2);
  });

  it.each([
    { age: 1, experience: 0, expected: 1250 },
    { age: 1, experience: 2, expected: 1250 },
    { age: 1, experience: 3, expected: 1000 },
    { age: 1, experience: 4, expected: 1000 },
    { age: 6, experience: 2, expected: 1875 },
    { age: 11, experience: 2, expected: 2500 },
  ])(
    'враховує стаж $experience років для віку авто $age',
    ({ age, experience, expected }) => {
      expect(calcInsurancePremium(age, experience)).toBeCloseTo(expected, 2);
    },
  );
});
