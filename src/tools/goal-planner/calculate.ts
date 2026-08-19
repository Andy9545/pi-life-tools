import {
  asFiniteNumber,
  ensureNonNegative,
  ensurePositive,
  ValidationError,
} from "@/utils/validate";

export interface GoalPlannerInput {
  goalAmount: number;
  currentAmount: number;
  monthlyContribution: number;
  annualRate: number; // %
  targetDate?: string | null;
}

export interface GoalPlannerResult {
  progressPercent: number;
  remainingAmount: number;
  estimatedMonths: number | null;
  estimatedCompletionDate: string | null;
  monthlyNeeded: number | null;
  reachable: boolean;
}

const MS_PER_DAY = 86_400_000;
const MS_PER_MONTH = 30.4375 * MS_PER_DAY;
const MONTH_CAP = 1200; // 100 years

function monthsToGoal(
  current: number,
  monthly: number,
  monthlyRate: number,
  goal: number,
): number | null {
  if (current >= goal) return 0;
  let balance = current;
  for (let m = 1; m <= MONTH_CAP; m++) {
    balance = balance * (1 + monthlyRate) + monthly;
    if (balance >= goal) return m;
  }
  return null;
}

/**
 * Goal Planner (Spec §3.3). Simulates month-by-month to estimate completion,
 * and — when a target date is given — solves for the monthly contribution
 * needed to hit the goal by that date. Returns reachable=false if the
 * contribution is too low for growth to ever catch up.
 */
export function calculateGoalPlanner(
  input: GoalPlannerInput,
): GoalPlannerResult {
  const goal = ensurePositive(asFiniteNumber(input.goalAmount));
  const current = ensureNonNegative(asFiniteNumber(input.currentAmount));
  const monthly = ensureNonNegative(asFiniteNumber(input.monthlyContribution));
  const annualRate = ensureNonNegative(asFiniteNumber(input.annualRate));
  const monthlyRate = annualRate / 100 / 12;

  const progressPercent = Math.min(100, (current / goal) * 100);
  const remainingAmount = Math.max(0, goal - current);

  const estimatedMonths = monthsToGoal(current, monthly, monthlyRate, goal);
  const reachable = estimatedMonths !== null;
  const estimatedCompletionDate =
    estimatedMonths != null
      ? new Date(Date.now() + estimatedMonths * MS_PER_MONTH).toISOString()
      : null;

  let monthlyNeeded: number | null = null;
  if (input.targetDate) {
    const target = new Date(input.targetDate);
    if (Number.isNaN(target.getTime())) {
      throw new ValidationError("errors.invalidDate");
    }
    const days = (target.getTime() - Date.now()) / MS_PER_DAY;
    if (days < 0) throw new ValidationError("errors.logicalConflict");
    const n = Math.max(1, Math.round(days / 30.4375));
    if (current >= goal) {
      monthlyNeeded = 0;
    } else if (monthlyRate === 0) {
      monthlyNeeded = Math.max(0, (goal - current) / n);
    } else {
      const factor = (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
      const fvCurrent = current * Math.pow(1 + monthlyRate, n);
      monthlyNeeded = Math.max(0, (goal - fvCurrent) / factor);
    }
  }

  return {
    progressPercent,
    remainingAmount,
    estimatedMonths,
    estimatedCompletionDate,
    monthlyNeeded,
    reachable,
  };
}
