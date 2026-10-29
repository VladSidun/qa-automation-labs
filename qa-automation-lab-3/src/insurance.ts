export function calcInsurancePremium(
  carAge: number,
  drivingExperience: number,
  accidentFreeYears = 0,
): number {
  if (!Number.isInteger(carAge) || carAge < 0)
    throw new Error('INVALID_CAR_AGE');
  if (!Number.isInteger(drivingExperience) || drivingExperience < 0)
    throw new Error('INVALID_EXPERIENCE');
  if (
    !Number.isInteger(accidentFreeYears) ||
    accidentFreeYears < 0 ||
    accidentFreeYears > drivingExperience
  ) {
    throw new Error('INVALID_ACCIDENT_FREE_YEARS');
  }
  return 0;
}
