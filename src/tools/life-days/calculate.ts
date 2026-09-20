import { ValidationError } from "@/utils/validate";

export interface LifeDaysInput {
  dateOfBirth: string;
  calculationDate: string;
}

export interface LifeDaysResult {
  daysLived: number;
  weeksLived: number;
  yearsLived: number;
  nextMilestone: number;
  daysUntilMilestone: number;
}

const MS_PER_DAY = 86_400_000;
const DAYS_PER_YEAR = 365.2425;
const MILESTONE_STEP = 1000;

/**
 * Parse a YYYY-MM-DD string into a UTC-midnight timestamp.
 *
 * Strict format + round-trip check so impossible dates (e.g. 2024-02-30)
 * are rejected instead of silently rolling over. Manual Date.UTC
 * construction keeps the result independent of the local timezone.
 */
function parseUtcDate(value: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) {
    throw new ValidationError("errors.invalidDate");
  }
  const year = Number(m[1]);
  const month = Number(m[2]);
  const day = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw new ValidationError("errors.invalidDate");
  }
  const time = Date.UTC(year, month - 1, day);
  const check = new Date(time);
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  ) {
    throw new ValidationError("errors.invalidDate");
  }
  return time;
}

/**
 * Life Days (Phase 1). Pure and deterministic: the caller supplies both
 * dates explicitly, so this function never reads Date.now(), the DOM,
 * storage, Pi, or the network. Same input always yields the same result.
 *
 * Day count uses exclusion semantics (same day = 0) on UTC midnights.
 * nextMilestone is the next multiple of 1000 strictly greater than
 * daysLived.
 */
export function calculateLifeDays(input: LifeDaysInput): LifeDaysResult {
  if (!input.dateOfBirth || input.dateOfBirth.trim() === "") {
    throw new ValidationError("errors.empty");
  }
  if (!input.calculationDate || input.calculationDate.trim() === "") {
    throw new ValidationError("errors.empty");
  }
  const birth = parseUtcDate(input.dateOfBirth);
  const calculation = parseUtcDate(input.calculationDate);
  if (birth > calculation) {
    throw new ValidationError("errors.invalidDate");
  }

  const daysLived = Math.round((calculation - birth) / MS_PER_DAY);
  const weeksLived = daysLived / 7;
  const yearsLived = daysLived / DAYS_PER_YEAR;
  const nextMilestone =
    (Math.floor(daysLived / MILESTONE_STEP) + 1) * MILESTONE_STEP;
  const daysUntilMilestone = nextMilestone - daysLived;

  return {
    daysLived,
    weeksLived,
    yearsLived,
    nextMilestone,
    daysUntilMilestone,
  };
}
