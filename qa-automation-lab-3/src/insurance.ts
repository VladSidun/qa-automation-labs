function assertNonNegativeInteger(value: number, code: string): void {
  if (!Number.isInteger(value) || value < 0) throw new Error(code);
}

function assertValidInputs(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears: number,
): void {
  assertNonNegativeInteger(carAge, 'INVALID_CAR_AGE');
  assertNonNegativeInteger(drivingExperience, 'INVALID_EXPERIENCE');
  assertNonNegativeInteger(accidentFreeYears, 'INVALID_ACCIDENT_FREE_YEARS');
  if (accidentFreeYears > drivingExperience)
    throw new Error('INVALID_ACCIDENT_FREE_YEARS');
}

function calcBasePremium(carAge: number): number {
  if (carAge > 10) return 2000;
  if (carAge > 5) return 1500;
  return 1000;
}

export function calcInsurancePremium(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears = 0,
): number {
  assertValidInputs(carAge, drivingExperience, accidentFreeYears);
  return calcBasePremium(carAge);
}
