export function calcAverage(numbers: number[]): number {
  if (numbers.length === 0) {
    throw new Error('EMPTY_ARRAY');
  }

  // Додатково відхиляємо NaN та нескінченні значення.
  if (!numbers.every(Number.isFinite)) {
    throw new Error('INVALID_NUMBER');
  }

  const sum = numbers.reduce((total, number) => total + number, 0);
  return sum / numbers.length;
}
