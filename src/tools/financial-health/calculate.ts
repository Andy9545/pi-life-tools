import {
  asFiniteNumber,
  clamp,
  ensureNonNegative,
  ValidationError,
} from "@/utils/validate";

export interface FinancialHealthInput {
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlySavings: number;
  debt: number;
  emergencyFund: number;
}

export interface FinancialHealthResult {
  savingsRate: number; // %
  incomeExpenseRatio: number; // %
  emergencyFundMonths: number;
  financialHealthScore: number; // 0-100
  flags: {
    lowSavings: boolean;
    lowEmergency: boolean;
    highDebt: boolean;
    highExpenses: boolean;
    allGood: boolean;
  };
}

/**
 * Financial Health (Spec §3.1). Composite score 0-100 from savings rate
 * (target ≥20%), emergency fund (target ≥6 months), and debt-to-income.
 * Educational, neutral tone — flags drive recommendation copy in the UI.
 */
export function calculateFinancialHealth(
  input: FinancialHealthInput,
): FinancialHealthResult {
  const income = ensureNonNegative(asFiniteNumber(input.monthlyIncome));
  const expenses = ensureNonNegative(asFiniteNumber(input.monthlyExpenses));
  const savings = ensureNonNegative(asFiniteNumber(input.monthlySavings));
  const debt = ensureNonNegative(asFiniteNumber(input.debt));
  const emergency = ensureNonNegative(asFiniteNumber(input.emergencyFund));

  if (income === 0) throw new ValidationError("errors.zero");

  const savingsRate = (savings / income) * 100;
  const incomeExpenseRatio = (expenses / income) * 100;
  const emergencyFundMonths = expenses > 0 ? emergency / expenses : 0;

  const savingsScore = clamp((savingsRate / 20) * 40, 0, 40);
  const emergencyScore = clamp((emergencyFundMonths / 6) * 30, 0, 30);
  const debtToIncome = clamp(debt / (income * 12), 0, 1);
  const debtScore = (1 - debtToIncome) * 30;
  const financialHealthScore =
    Math.round((savingsScore + emergencyScore + debtScore) * 10) / 10;

  const lowSavings = savingsRate < 10;
  const lowEmergency = emergencyFundMonths < 3;
  const highDebt = debtToIncome > 0.3;
  const highExpenses = incomeExpenseRatio > 90;
  const allGood = !lowSavings && !lowEmergency && !highDebt && !highExpenses;

  return {
    savingsRate,
    incomeExpenseRatio,
    emergencyFundMonths,
    financialHealthScore,
    flags: { lowSavings, lowEmergency, highDebt, highExpenses, allGood },
  };
}
