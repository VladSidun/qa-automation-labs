import { describe, it, expect } from 'vitest';
import { celsiusToFahrenheit } from '../src/temperature';

describe('celsiusToFahrenheit', () => {
  it('перетворює 0 градусів Цельсія на 32 градуси Фаренгейта', () => {
    const celsius = 0;
    const result = celsiusToFahrenheit(celsius);
    expect(result).toBe(32);
  });

  it('перетворює 100 градусів Цельсія на 212 градусів Фаренгейта', () => {
    expect(celsiusToFahrenheit(100)).toBe(212);
  });

  it('повертає -40 у точці збігу шкал', () => {
    expect(celsiusToFahrenheit(-40)).toBe(-40);
  });

  it.each([NaN, Infinity, -Infinity])('відхиляє значення %s', (value) => {
    expect(() => celsiusToFahrenheit(value)).toThrow('INVALID_TEMPERATURE');
  });
});
