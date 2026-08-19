import {
  asFiniteNumber,
  ensureNonNegative,
  ensurePositive,
} from "@/utils/validate";

export interface DebtPayoffInput {
  debtAmount: number;
  annualRate: number; // %
  monthlyPayment: number;
}

export interface DebtPayoffResult {
  payoffMonths: number | null;
  totalInterest: number;
  totalPayment: number;
  insufficientPayment: boolean;
  monthlyInterest: number;
}

const MONTH_CAP = 1200;

/**
 * Debt Payoff (Spec §3.6). Simulates amortizing month-by-month. If the
 * monthly payment does not cover the first month's interest, returns
 * insufficientPayment=true so the UI can warn clearly (Spec §12).
 */
export function calculateDebtPayoff(
  input: DebtPayoffInput,
): DebtPayoffResult {
  const debt = ensurePositive(asFiniteNumber(input.debtAmount));
  const rate = ensureNonNegative(asFiniteNumber(input.annualRate));
  const payment = ensurePositive(asFiniteNumber(input.monthlyPayment));

  const monthlyRate = rate / 100 / 12;
  const monthlyInterest = debt * monthlyRate;

  if (payment <= monthlyInterest) {
    return {
      payoffMonths: null,
      totalInterest: 0,
      totalPayment: 0,
      insufficientPayment: true,
      monthlyInterest,
    };
  }

  let balance = debt;
  let months = 0;
  let totalInterest = 0;
  while (balance > 0 && months < MONTH_CAP) {
    const interest = balance * monthlyRate;
    const pay = Math.min(payment, balance + interest);
    totalInterest += interest;
    balance = balance + interest - pay;
    months += 1;
  }

  return {
    payoffMonths: months,
    totalInterest,
    totalPayment: debt + totalInterest,
    insufficientPayment: false,
    monthlyInterest,
  };
}
