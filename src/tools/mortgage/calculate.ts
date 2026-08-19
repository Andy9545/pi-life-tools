import {
  asFiniteNumber,
  ensureNonNegative,
  ensurePositive,
  ValidationError,
} from "@/utils/validate";

export interface MortgageInput {
  homePrice: number;
  downPayment: number;
  annualRate: number; // %
  years: number;
}

export interface MortgageResult {
  loanAmount: number;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  interestRatio: number; // %
}

/**
 * Mortgage (Spec §3.5). Equal-installment (等額本息) amortization.
 * loanAmount = homePrice − downPayment. Handles 0% rate as straight-line.
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const price = ensureNonNegative(asFiniteNumber(input.homePrice));
  const down = ensureNonNegative(asFiniteNumber(input.downPayment));
  const rate = ensureNonNegative(asFiniteNumber(input.annualRate));
  const years = Math.floor(ensurePositive(asFiniteNumber(input.years)));
  if (years > 50) throw new ValidationError("errors.tooLarge");
  if (down > price) throw new ValidationError("errors.logicalConflict");

  const loanAmount = price - down;
  if (loanAmount === 0) {
    return {
      loanAmount: 0,
      monthlyPayment: 0,
      totalPayment: 0,
      totalInterest: 0,
      interestRatio: 0,
    };
  }

  const n = years * 12;
  const monthlyRate = rate / 100 / 12;
  const monthlyPayment =
    monthlyRate > 0
      ? (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, n)) /
        (Math.pow(1 + monthlyRate, n) - 1)
      : loanAmount / n;
  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - loanAmount;
  const interestRatio =
    totalPayment > 0 ? (totalInterest / totalPayment) * 100 : 0;

  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest,
    interestRatio,
  };
}
