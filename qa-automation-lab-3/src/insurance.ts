function assertNonNegativeInteger(value: number, code: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(code);
}

export function calcInsurancePremium(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears = 0,
): number {
  assertNonNegativeInteger(carAge, 'INVALID_CAR_AGE');
  assertNonNegativeInteger(drivingExperience, 'INVALID_EXPERIENCE');
  assertNonNegativeInteger(accidentFreeYears, 'INVALID_ACCIDENT_FREE_YEARS');
  if (accidentFreeYears > drivingExperience)
    throw new Error('INVALID_ACCIDENT_FREE_YEARS');
  return 0;
}
