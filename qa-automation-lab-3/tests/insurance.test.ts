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

  it.each([
    { accidentFreeYears: 0, expected: 1000 },
    { accidentFreeYears: 1, expected: 950 },
    { accidentFreeYears: 5, expected: 750 },
    { accidentFreeYears: 6, expected: 700 },
    { accidentFreeYears: 7, expected: 700 },
  ])(
    'знижує тариф за $accidentFreeYears безаварійних років',
    ({ accidentFreeYears, expected }) => {
      expect(calcInsurancePremium(1, 10, accidentFreeYears)).toBeCloseTo(
        expected,
        2,
      );
    },
  );

  it.each([
    { age: 1, experience: 2, accidentFreeYears: 1, expected: 1187.5 },
    { age: 6, experience: 2, accidentFreeYears: 1, expected: 1781.25 },
    { age: 11, experience: 2, accidentFreeYears: 1, expected: 2375 },
    { age: 11, experience: 10, accidentFreeYears: 6, expected: 1400 },
    { age: 11, experience: 10, accidentFreeYears: 7, expected: 1400 },
  ])(
    'поєднує надбавку й знижку для $age / $experience / $accidentFreeYears',
    ({ age, experience, accidentFreeYears, expected }) => {
      expect(
        calcInsurancePremium(age, experience, accidentFreeYears),
      ).toBeCloseTo(expected, 2);
    },
  );
});
