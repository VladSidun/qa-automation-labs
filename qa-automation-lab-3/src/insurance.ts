const YOUNG_CAR_MAX_AGE = 5;
const MIDDLE_CAR_MAX_AGE = 10;
const YOUNG_CAR_PREMIUM = 1000;
const MIDDLE_CAR_PREMIUM = 1500;
const OLD_CAR_PREMIUM = 2000;
const MIN_EXPERIENCE = 3;
const NOVICE_SURCHARGE = 0.25;

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

function applyExperienceSurcharge(
  premium: number,
  drivingExperience: number,
): number {
  if (drivingExperience < MIN_EXPERIENCE)
    return premium * (1 + NOVICE_SURCHARGE);
  return premium;
}

export function calcInsurancePremium(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears = 0,
): number {
  assertValidInputs(carAge, drivingExperience, accidentFreeYears);
  return applyExperienceSurcharge(calcBasePremium(carAge), drivingExperience);
}
