export interface ParkingOptions {
  night?: boolean;
  weekend?: boolean;
}
const FREE_MINUTES = 15;
const MINUTES_PER_HOUR = 60;
const FIRST_HOUR_FEE = 30;
const EXTRA_HOUR_FEE = 20;

const DAILY_CAP = 200;

export function calcParkingFee(
  minutes: number,
  options: ParkingOptions = {},
): number {
  if (!Number.isInteger(minutes) || minutes < 0) {
    throw new Error('INVALID_DURATION');
  }
  if (minutes <= FREE_MINUTES) return 0;
  const extraHours = Math.max(
    0,
    Math.ceil((minutes - MINUTES_PER_HOUR) / MINUTES_PER_HOUR),
  );
  let fee = Math.min(FIRST_HOUR_FEE + extraHours * EXTRA_HOUR_FEE, DAILY_CAP);
  if (options.night) fee /= 2;
  if (options.weekend) fee *= 0.8;
  return fee;
}
