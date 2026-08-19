import {
  asFiniteNumber,
  ensureNonNegative,
  ensurePositive,
  ValidationError,
} from "@/utils/validate";

export interface TimeValueInput {
  annualIncome: number;
  weeklyHours: number;
  weeksPerYear: number;
  itemPrice?: number | null;
}

export interface TimeValueResult {
  hourlyRate: number;
  minuteRate: number;
  hoursForItem: number | null;
}

/**
 * Time Value (Spec §3.8). Estimates hourly/minute value of time and how many
 * work hours an item costs. Tone is light and non-judgmental (handled in UI).
 */
export function calculateTimeValue(input: TimeValueInput): TimeValueResult {
  const income = ensureNonNegative(asFiniteNumber(input.annualIncome));
  const weekly = ensurePositive(asFiniteNumber(input.weeklyHours));
  const weeks = ensurePositive(asFiniteNumber(input.weeksPerYear));

  const annualHours = weekly * weeks;
  if (annualHours === 0) throw new ValidationError("errors.zero");

  const hourlyRate = income / annualHours;
  const minuteRate = hourlyRate / 60;

  let hoursForItem: number | null = null;
  if (input.itemPrice !== null && input.itemPrice !== undefined) {
    const price = ensureNonNegative(asFiniteNumber(Number(input.itemPrice)));
    if (hourlyRate > 0) hoursForItem = price / hourlyRate;
    else throw new ValidationError("errors.divideByZero");
  }

  return { hourlyRate, minuteRate, hoursForItem };
}
