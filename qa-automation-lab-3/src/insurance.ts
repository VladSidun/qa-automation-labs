const YOUNG_CAR_MAX_AGE = 5;
const MIDDLE_CAR_MAX_AGE = 10;
const YOUNG_CAR_PREMIUM = 1000;
const MIDDLE_CAR_PREMIUM = 1500;
const OLD_CAR_PREMIUM = 2000;

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
  if (carAge <= YOUNG_CAR_MAX_AGE) return YOUNG_CAR_PREMIUM;
  if (carAge <= MIDDLE_CAR_MAX_AGE) return MIDDLE_CAR_PREMIUM;
  return OLD_CAR_PREMIUM;
}

export function calcInsurancePremium(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears = 0,
): number {
  assertValidInputs(carAge, drivingExperience, accidentFreeYears);
  const premium = calcBasePremium(carAge);
  return drivingExperience < 3 ? premium * 1.25 : premium;
}
