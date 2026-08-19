import { asFiniteNumber, ensurePositive, ValidationError } from "@/utils/validate";

export interface LifeTimeInput {
  birthDate: string;
  lifeExpectancy: number;
}

export interface LifeTimeResult {
  ageYears: number;
  remainingYears: number;
  remainingMonths: number;
  remainingWeeks: number;
  lifeProgressPercent: number;
}

const MS_PER_YEAR = 365.2425 * 86_400_000;

/**
 * Life Time (Spec §3.4). `lifeExpectancy` is a user-set value only — never a
 * medical/death prediction. Returns elapsed and remaining time plus progress.
 */
export function calculateLifeTime(input: LifeTimeInput): LifeTimeResult {
  const birth = new Date(input.birthDate);
  if (Number.isNaN(birth.getTime())) {
    throw new ValidationError("errors.invalidDate");
  }
  const expectancy = ensurePositive(asFiniteNumber(input.lifeExpectancy));
  const now = Date.now();
  if (birth.getTime() > now) {
    throw new ValidationError("errors.invalidDate");
  }

  const ageYears = (now - birth.getTime()) / MS_PER_YEAR;
  const remainingYears = Math.max(0, expectancy - ageYears);
  const remainingMonths = remainingYears * 12;
  const remainingWeeks = remainingYears * 52.1775;
  const lifeProgressPercent = Math.min(100, (ageYears / expectancy) * 100);

  return {
    ageYears,
    remainingYears,
    remainingMonths,
    remainingWeeks,
    lifeProgressPercent,
  };
}
